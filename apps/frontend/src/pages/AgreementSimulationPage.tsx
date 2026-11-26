import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@apollo/client/react';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { canCreateAgreements } from '../auth/permissions';
import { CurrencyAmountInput } from '../components/CurrencyAmountInput';
import { formatMoney } from '../components/currency-amount';
import { SelectField, TextAreaField } from '../components/FormFields';
import {
  AgreementQuoteSimulationData,
  AgreementSimulationInput,
  CREATE_AGREEMENT_MUTATION,
  CreateAgreementMutationData,
  SIMULATE_AGREEMENT_QUOTES_MUTATION,
} from '../graphql/agreements';
import { CLIENTS_QUERY } from '../graphql/users';
import { getErrorMessage } from '../lib/errors';
import { useAppTheme } from '../theme/app-theme';

type SimulationForm = {
  policyKind: AgreementSimulationInput['policyKind'];
  policyFormat: AgreementSimulationInput['policyFormat'];
  policyAmount: string;
  currency: AgreementSimulationInput['currency'];
  applicantName: string;
  applicantTaxId: string;
  applicantAddress: string;
  applicantEmail: string;
  beneficiaryName: string;
  beneficiaryTaxId: string;
  beneficiaryAddress: string;
  processCode: string;
  fileNumber: string;
  bidOpeningAt: string;
  purpose: string;
  purchaseOrder: string;
  billingPeriod: string;
};

const emptyForm: SimulationForm = {
  policyKind: 'OFERTA',
  policyFormat: 'ELECTRONICA',
  policyAmount: '',
  currency: 'ARS',
  applicantName: '',
  applicantTaxId: '',
  applicantAddress: '',
  applicantEmail: '',
  beneficiaryName: '',
  beneficiaryTaxId: '',
  beneficiaryAddress: '',
  processCode: '',
  fileNumber: '',
  bidOpeningAt: '',
  purpose: '',
  purchaseOrder: '',
  billingPeriod: '',
};

type QuoteSimulation = AgreementQuoteSimulationData['simulateAgreementQuotes'];
type ClientOption = { id: string; name: string; email: string };

export function AgreementSimulationPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { palette } = useAppTheme();
  const { user } = useAuth();
  const canWrite = canCreateAgreements(user?.role);
  const locale = i18n.language?.startsWith('en') ? 'en-US' : 'es-AR';
  const [form, setForm] = useState<SimulationForm>(emptyForm);
  const [simulation, setSimulation] = useState<QuoteSimulation | null>(null);
  const [savedAgreementId, setSavedAgreementId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { data: clientsData } = useQuery<{ clients: ClientOption[] }>(CLIENTS_QUERY, {
    skip: !canWrite,
  });

  const [simulateQuotes, { loading: simulating }] = useMutation<AgreementQuoteSimulationData>(
    SIMULATE_AGREEMENT_QUOTES_MUTATION,
  );
  const [createAgreement, { loading: saving }] = useMutation<CreateAgreementMutationData>(
    CREATE_AGREEMENT_MUTATION,
    { refetchQueries: ['Agreements'] },
  );

  const updateField = <K extends keyof SimulationForm>(key: K, value: SimulationForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSimulation(null);
    setSavedAgreementId(null);
    setError('');
  };

  const handleSimulate = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSimulation(null);
    setSavedAgreementId(null);

    const policyAmount = Number(form.policyAmount);
    if (!Number.isFinite(policyAmount) || policyAmount <= 0) {
      setError(t('agreementSimulator.errors.amount'));
      return;
    }

    const input: AgreementSimulationInput = {
      policyKind: form.policyKind,
      policyFormat: form.policyFormat,
      policyAmount,
      currency: form.currency,
      applicant: {
        name: form.applicantName.trim(),
        taxId: form.applicantTaxId.trim(),
        address: form.applicantAddress.trim() || undefined,
        ownerEmail: form.applicantEmail.trim() || undefined,
      },
      beneficiary: {
        name: form.beneficiaryName.trim(),
        taxId: form.beneficiaryTaxId.trim(),
        address: form.beneficiaryAddress.trim() || undefined,
      },
      tender: {
        processCode: form.processCode.trim(),
        fileNumber: form.fileNumber.trim() || undefined,
        bidOpeningAt: form.bidOpeningAt || undefined,
        purpose: form.purpose.trim(),
        purchaseOrder: form.purchaseOrder.trim() || undefined,
        billingPeriod: form.billingPeriod.trim() || undefined,
      },
    };

    try {
      const { data } = await simulateQuotes({ variables: { input } });
      if (!data?.simulateAgreementQuotes) {
        setError(t('agreementSimulator.errors.simulate'));
        return;
      }
      setSimulation(data.simulateAgreementQuotes);
    } catch (requestError) {
      setError(getErrorMessage(requestError, t('agreementSimulator.errors.simulate')));
    }
  };

  const handleCreate = async (quote: QuoteSimulation['quotes'][number]) => {
    setError('');
    const ownerEmail = form.applicantEmail.trim().toLowerCase();
    const owner = clientsData?.clients.find((client) => client.email.toLowerCase() === ownerEmail);
    if (ownerEmail && !owner) {
      setError(t('agreementSimulator.errors.owner'));
      return;
    }
    const notes = [
      `${t('agreementSimulator.policy.kind')}: ${t(`agreementSimulator.policy.kinds.${form.policyKind}`)}`,
      `${t('agreementSimulator.policy.format')}: ${t(`agreementSimulator.policy.formats.${form.policyFormat}`)}`,
      `${t('agreementSimulator.policy.amount')}: ${formatMoney(Number(form.policyAmount), form.currency, locale)}`,
      `${t('agreementSimulator.applicant.name')}: ${form.applicantName.trim()}`,
      `${t('agreementSimulator.beneficiary.name')}: ${form.beneficiaryName.trim()}`,
      `${t('agreementSimulator.tender.processCode')}: ${form.processCode.trim()}`,
      `${t('agreementSimulator.tender.purpose')}: ${form.purpose.trim()}`,
      `${t('agreementSimulator.result.company')}: ${quote.company}`,
      `${t('agreementSimulator.result.premium')}: ${formatMoney(quote.premium, quote.currency, locale)}`,
      `${t('agreementSimulator.result.source')}: ${t(`agreementSimulator.result.sources.${simulation?.source ?? 'mock'}`)}`,
    ].join('\n');

    try {
      const { data } = await createAgreement({
        variables: {
          input: {
            title: `${t(`agreementSimulator.policy.kinds.${form.policyKind}`)} · ${form.processCode.trim()}`,
            clientName: form.applicantName.trim(),
            amount: quote.premium,
            currency: quote.currency,
            status: 'draft',
            notes,
            ownerId: owner?.id,
          },
        },
      });
      if (data?.createAgreement.id) {
        setSavedAgreementId(data.createAgreement.id);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, t('agreementSimulator.errors.create')));
    }
  };

  return (
    <Stack gap={6}>
      <Box>
        <HStack gap={3} wrap="wrap">
          <Badge
            bg={palette.accentSoft}
            color={palette.accentText}
            px={3}
            py={1}
            borderRadius="full"
            borderWidth="1px"
            borderColor={palette.border}
          >
            {t('agreementSimulator.badge')}
          </Badge>
          <Button size="sm" variant="ghost" color={palette.mutedText} onClick={() => navigate('/app/agreements')}>
            {t('agreementSimulator.back')}
          </Button>
        </HStack>
        <Heading size="xl" mt={4}>{t('agreementSimulator.title')}</Heading>
        <Text color={palette.mutedText} mt={2} maxW="3xl">{t('agreementSimulator.description')}</Text>
      </Box>

      <Box
        as="form"
        onSubmit={handleSimulate}
        p={{ base: 4, md: 6 }}
        borderRadius="2xl"
        borderWidth="1px"
        borderColor={palette.border}
        bg={palette.surface}
        boxShadow={palette.shadow}
      >
        <Stack gap={5}>
          <Heading size="md">{t('agreementSimulator.policy.heading')}</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            <Field label={t('agreementSimulator.policy.kind')} palette={palette}>
              <SelectField value={form.policyKind} onChange={(event) => updateField('policyKind', event.target.value as SimulationForm['policyKind'])}>
                <option value="OFERTA">{t('agreementSimulator.policy.kinds.OFERTA')}</option>
                <option value="ADJUDICACION">{t('agreementSimulator.policy.kinds.ADJUDICACION')}</option>
              </SelectField>
            </Field>
            <Field label={t('agreementSimulator.policy.format')} palette={palette}>
              <SelectField value={form.policyFormat} onChange={(event) => updateField('policyFormat', event.target.value as SimulationForm['policyFormat'])}>
                <option value="ELECTRONICA">{t('agreementSimulator.policy.formats.ELECTRONICA')}</option>
                <option value="ELECTRONICA_CERTIFICADA">{t('agreementSimulator.policy.formats.ELECTRONICA_CERTIFICADA')}</option>
                <option value="FISICA">{t('agreementSimulator.policy.formats.FISICA')}</option>
              </SelectField>
            </Field>
            <Field label={t('agreementSimulator.policy.amount')} palette={palette}>
              <CurrencyAmountInput
                required
                value={form.policyAmount}
                currency={form.currency}
                locale={locale}
                onChange={(amount) => updateField('policyAmount', amount)}
              />
            </Field>
            <Field label={t('agreementSimulator.policy.currency')} palette={palette}>
              <SelectField value={form.currency} onChange={(event) => updateField('currency', event.target.value as SimulationForm['currency'])}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </SelectField>
            </Field>
          </SimpleGrid>

          <Heading size="md">{t('agreementSimulator.applicant.heading')}</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            <Field label={t('agreementSimulator.applicant.name')} palette={palette}>
              <Input required value={form.applicantName} onChange={(event) => updateField('applicantName', event.target.value)} bg={palette.inputBg} borderColor={palette.inputBorder} />
            </Field>
            <Field label={t('agreementSimulator.applicant.taxId')} palette={palette}>
              <Input required value={form.applicantTaxId} onChange={(event) => updateField('applicantTaxId', event.target.value)} placeholder="20-12345678-3" bg={palette.inputBg} borderColor={palette.inputBorder} />
            </Field>
            <Field label={t('agreementSimulator.applicant.email')} palette={palette}>
              <Input type="email" value={form.applicantEmail} onChange={(event) => updateField('applicantEmail', event.target.value)} bg={palette.inputBg} borderColor={palette.inputBorder} />
            </Field>
            <Field label={t('agreementSimulator.applicant.address')} palette={palette}>
              <Input value={form.applicantAddress} onChange={(event) => updateField('applicantAddress', event.target.value)} bg={palette.inputBg} borderColor={palette.inputBorder} />
            </Field>
          </SimpleGrid>

          <Heading size="md">{t('agreementSimulator.beneficiary.heading')}</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            <Field label={t('agreementSimulator.beneficiary.name')} palette={palette}>
              <Input required value={form.beneficiaryName} onChange={(event) => updateField('beneficiaryName', event.target.value)} bg={palette.inputBg} borderColor={palette.inputBorder} />
            </Field>
            <Field label={t('agreementSimulator.beneficiary.taxId')} palette={palette}>
              <Input required value={form.beneficiaryTaxId} onChange={(event) => updateField('beneficiaryTaxId', event.target.value)} placeholder="30-12345678-9" bg={palette.inputBg} borderColor={palette.inputBorder} />
            </Field>
            <Field label={t('agreementSimulator.beneficiary.address')} palette={palette}>
              <Input value={form.beneficiaryAddress} onChange={(event) => updateField('beneficiaryAddress', event.target.value)} bg={palette.inputBg} borderColor={palette.inputBorder} />
            </Field>
          </SimpleGrid>

          <Heading size="md">{t('agreementSimulator.tender.heading')}</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            <Field label={t('agreementSimulator.tender.processCode')} palette={palette}>
              <Input required value={form.processCode} onChange={(event) => updateField('processCode', event.target.value)} bg={palette.inputBg} borderColor={palette.inputBorder} />
            </Field>
            <Field label={t('agreementSimulator.tender.fileNumber')} palette={palette}>
              <Input value={form.fileNumber} onChange={(event) => updateField('fileNumber', event.target.value)} bg={palette.inputBg} borderColor={palette.inputBorder} />
            </Field>
            <Field label={t('agreementSimulator.tender.bidOpeningAt')} palette={palette}>
              <Input type="datetime-local" value={form.bidOpeningAt} onChange={(event) => updateField('bidOpeningAt', event.target.value)} bg={palette.inputBg} borderColor={palette.inputBorder} />
            </Field>
            <Field label={t('agreementSimulator.tender.purchaseOrder')} palette={palette}>
              <Input value={form.purchaseOrder} onChange={(event) => updateField('purchaseOrder', event.target.value)} bg={palette.inputBg} borderColor={palette.inputBorder} />
            </Field>
            <Field label={t('agreementSimulator.tender.billingPeriod')} palette={palette}>
              <Input value={form.billingPeriod} onChange={(event) => updateField('billingPeriod', event.target.value)} bg={palette.inputBg} borderColor={palette.inputBorder} />
            </Field>
            <Field label={t('agreementSimulator.tender.purpose')} palette={palette}>
              <TextAreaField required value={form.purpose} onChange={(event) => updateField('purpose', event.target.value)} />
            </Field>
          </SimpleGrid>

          {error && <Text color="red.500" role="alert">{error}</Text>}
          <HStack gap={3} wrap="wrap">
            <Button type="submit" bg={palette.accent} color={palette.accentText} loading={simulating}>
              {t('agreementSimulator.simulate')}
            </Button>
            <Button type="button" variant="outline" borderColor={palette.borderStrong} onClick={() => { setForm(emptyForm); setSimulation(null); setSavedAgreementId(null); setError(''); }}>
              {t('agreementSimulator.reset')}
            </Button>
          </HStack>
        </Stack>
      </Box>

      {simulation && (
        <Stack gap={4}>
          <Box>
            <HStack gap={3} wrap="wrap">
              <Heading size="lg">{t('agreementSimulator.result.title')}</Heading>
              <Badge colorPalette={simulation.source === 'mock' ? 'orange' : 'green'}>
                {t(`agreementSimulator.result.sources.${simulation.source}`)}
              </Badge>
            </HStack>
            <Text color={palette.mutedText} mt={2}>
              {simulation.source === 'mock' ? t('agreementSimulator.result.mockNotice') : t('agreementSimulator.result.liveNotice')}
            </Text>
          </Box>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
            {simulation.quotes.map((quote, index) => (
              <Box key={`${quote.company}-${index}`} p={5} borderRadius="2xl" borderWidth="1px" borderColor={palette.border} bg={palette.surface} boxShadow={palette.shadow}>
                <Stack gap={3}>
                  <HStack justify="space-between" align="start">
                    <Heading size="md">{quote.company}</Heading>
                    <Badge>{t('agreementSimulator.result.rank', { rank: index + 1 })}</Badge>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="700" color={palette.accent}>
                    {formatMoney(quote.premium, quote.currency, locale)}
                  </Text>
                  {quote.validUntil && (
                    <Text color={palette.mutedText} fontSize="sm">
                      {t('agreementSimulator.result.validUntil', { date: new Intl.DateTimeFormat(locale).format(new Date(quote.validUntil)) })}
                    </Text>
                  )}
                  {canWrite && (
                    <Button bg={palette.accent} color={palette.accentText} loading={saving} onClick={() => void handleCreate(quote)}>
                      {t('agreementSimulator.result.createAgreement')}
                    </Button>
                  )}
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
          {savedAgreementId && (
            <Text color={palette.accent} role="status">
              {t('agreementSimulator.result.saved', { id: savedAgreementId })}{' '}
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/agreements')}>
                {t('agreementSimulator.result.viewAgreements')}
              </Button>
            </Text>
          )}
        </Stack>
      )}
    </Stack>
  );
}

function Field({ label, palette, children }: { label: string; palette: ReturnType<typeof useAppTheme>['palette']; children: React.ReactNode }) {
  return (
    <Box>
      <Text fontSize="sm" mb={2} color={palette.mutedText}>{label}</Text>
      {children}
    </Box>
  );
}
