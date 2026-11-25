import {
  BadGatewayException,
  GatewayTimeoutException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AgreementSimulationInput } from './agreements.types';

const MAX_QUOTES = 5;
const MAX_PREMIUM = 999_999_999_999.99;
const REQUEST_TIMEOUT_MS = 10_000;

export type AgreementQuote = {
  company: string;
  premium: number;
  currency: string;
  validUntil: string | null;
};

export type QuoteSimulationResult = {
  source: 'mock' | 'live';
  simulatedAt: Date;
  quotes: AgreementQuote[];
};

const MOCK_INSURERS = [
  { company: 'Río Sur', factor: 0.91 },
  { company: 'Patagonia', factor: 1.06 },
  { company: 'Andes', factor: 0.97 },
  { company: 'Federal', factor: 1.12 },
  { company: 'Horizonte', factor: 0.94 },
  { company: 'Pampa', factor: 1.02 },
  { company: 'Del Plata', factor: 1.09 },
];

@Injectable()
export class QuoteSimulatorService {
  constructor(private readonly config: ConfigService) {}

  async simulate(input: AgreementSimulationInput): Promise<QuoteSimulationResult> {
    const endpoint = this.config.get<string>('QUOTE_SIMULATOR_API_URL')?.trim();
    if (!endpoint) {
      return this.mockQuotes(input);
    }

    const url = this.validateEndpoint(endpoint);
    const token = this.config.get<string>('QUOTE_SIMULATOR_API_TOKEN')?.trim();
    return requestLiveQuotes(input, url, token);
  }

  private mockQuotes(input: AgreementSimulationInput): QuoteSimulationResult {
    const riskRate = input.policyKind === 'ADJUDICACION' ? 0.014 : 0.009;
    const formatFactor = input.policyFormat === 'FISICA' ? 1.08 : input.policyFormat === 'ELECTRONICA_CERTIFICADA' ? 1.03 : 1;
    const currency = input.currency ?? 'ARS';
    const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const quotes = MOCK_INSURERS.map(({ company, factor }) => ({
      company,
      premium: roundToCents(input.policyAmount * riskRate * formatFactor * factor),
      currency,
      validUntil,
    }));

    return {
      source: 'mock',
      simulatedAt: new Date(),
      quotes: rankQuotes(quotes).slice(0, MAX_QUOTES),
    };
  }

  private validateEndpoint(endpoint: string) {
    let url: URL;
    try {
      url = new URL(endpoint);
    } catch {
      throw new InternalServerErrorException('QUOTE_SIMULATOR_API_URL must be a valid HTTPS URL');
    }

    if (url.protocol !== 'https:' || url.username || url.password) {
      throw new InternalServerErrorException('QUOTE_SIMULATOR_API_URL must be a valid HTTPS URL');
    }

    return url.toString();
  }
}

export async function requestLiveQuotes(
  input: AgreementSimulationInput,
  endpoint: string,
  token?: string,
  fetcher: typeof fetch = globalThis.fetch,
): Promise<QuoteSimulationResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  timer.unref?.();

  try {
    const response = await fetcher(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(input),
      redirect: 'error',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new BadGatewayException('The quote provider returned an error');
    }

    const payload: unknown = await response.json().catch(() => null);
    return {
      source: 'live',
      simulatedAt: new Date(),
      quotes: rankQuotes(getQuoteRows(payload), input.currency ?? 'ARS'),
    };
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    if (controller.signal.aborted) {
      throw new GatewayTimeoutException('The quote provider timed out');
    }
    throw new BadGatewayException('The quote provider is unavailable');
  } finally {
    clearTimeout(timer);
  }
}

export function rankQuotes(rows: unknown, currency?: string): AgreementQuote[] {
  if (!Array.isArray(rows)) {
    throw new BadGatewayException('The quote provider response must contain a quotes array');
  }

  const comparable = rows.flatMap((row): AgreementQuote[] => {
    if (!isRecord(row)) {
      return [];
    }

    const company = typeof row.company === 'string' ? row.company.trim() : '';
    const premium = row.premium;
    const quoteCurrency = typeof row.currency === 'string' ? row.currency.trim().toUpperCase() : '';
    const roundedPremium = typeof premium === 'number' ? roundToCents(premium) : Number.NaN;
    if (
      !company ||
      company.length > 120 ||
      typeof premium !== 'number' ||
      !Number.isFinite(premium) ||
      premium <= 0 ||
      premium > MAX_PREMIUM ||
      roundedPremium <= 0 ||
      roundedPremium > MAX_PREMIUM ||
      !quoteCurrency ||
      (currency && quoteCurrency !== currency.toUpperCase())
    ) {
      return [];
    }

    let validUntil: string | null = null;
    if (row.validUntil !== undefined && row.validUntil !== null) {
      if (typeof row.validUntil !== 'string') {
        return [];
      }
      const expiry = new Date(row.validUntil);
      if (Number.isNaN(expiry.getTime()) || expiry.getTime() <= Date.now()) {
        return [];
      }
      validUntil = expiry.toISOString();
    }

    return [{ company, premium: roundedPremium, currency: quoteCurrency, validUntil }];
  });

  comparable.sort((left, right) => left.premium - right.premium || left.company.localeCompare(right.company));
  const seenCompanies = new Set<string>();
  const uniqueCompanies = comparable.filter((quote) => {
    const key = quote.company.toLowerCase();
    if (seenCompanies.has(key)) {
      return false;
    }
    seenCompanies.add(key);
    return true;
  });
  if (!uniqueCompanies.length) {
    throw new BadGatewayException('The quote provider returned no valid, current quotes in the requested currency');
  }

  return uniqueCompanies.slice(0, MAX_QUOTES);
}

function getQuoteRows(payload: unknown): unknown[] {
  if (!isRecord(payload) || !Array.isArray(payload.quotes)) {
    throw new BadGatewayException('The quote provider response must contain a quotes array');
  }
  return payload.quotes;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function roundToCents(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}