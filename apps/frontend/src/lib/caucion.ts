export type CaucionRiskType = 'contractual' | 'customs' | 'judicial' | 'rental';

export const CAUCION_RISK_RATES: Record<CaucionRiskType, number> = {
  contractual: 0.015,
  customs: 0.012,
  judicial: 0.02,
  rental: 0.018,
};

export type CaucionSimulationInput = {
  coverageAmount: number;
  termMonths: number;
  riskType: CaucionRiskType;
};

export type CaucionSimulationResult = {
  coverageAmount: number;
  termMonths: number;
  riskType: CaucionRiskType;
  annualRate: number;
  premium: number;
  currency: 'ARS';
};

export function simulateCaucionPremium(input: CaucionSimulationInput): CaucionSimulationResult {
  const coverageAmount = Math.max(0, input.coverageAmount);
  const termMonths = Math.max(1, Math.round(input.termMonths));
  const annualRate = CAUCION_RISK_RATES[input.riskType];
  const premium = Number((coverageAmount * annualRate * (termMonths / 12)).toFixed(2));

  return {
    coverageAmount,
    termMonths,
    riskType: input.riskType,
    annualRate,
    premium,
    currency: 'ARS',
  };
}

export function formatMoney(amount: number, currency = 'ARS', locale = 'es-AR') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatRate(rate: number, locale = 'es-AR') {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(rate);
}
