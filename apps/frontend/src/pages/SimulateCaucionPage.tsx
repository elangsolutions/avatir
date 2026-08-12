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
import { useMutation } from '@apollo/client/react';
import { FormEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  CREATE_AGREEMENT_MUTATION,
  CreateAgreementMutationData,
} from '../graphql/agreements';
import {
  CaucionRiskType,
  formatMoney,
  formatRate,
  simulateCaucionPremium,
} from '../lib/caucion';
import { downloadCaucionContractPdf } from '../lib/caucion-contract-pdf';
import { useAppTheme } from '../theme/app-theme';

const riskTypeOptions: CaucionRiskType[] = ['contractual', 'customs', 'judicial', 'rental'];

export function SimulateCaucionPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { palette } = useAppTheme();
  const locale = i18n.language?.startsWith('en') ? 'en-US' : 'es-AR';

  const [clientName, setClientName] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [coverageAmount, setCoverageAmount] = useState('5000000');
  const [termMonths, setTermMonths] = useState('12');
  const [riskType, setRiskType] = useState<CaucionRiskType>('contractual');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof simulateCaucionPremium> | null>(null);

  const [createAgreement, { loading: saving }] = useMutation<CreateAgreementMutationData>(
    CREATE_AGREEMENT_MUTATION,
  );

  const parsedCoverage = Number(coverageAmount.replace(/\./g, '').replace(',', '.'));
  const parsedTerm = Number(termMonths);

  const canSimulate = useMemo(
    () => clientName.trim().length > 0 && beneficiary.trim().length > 0 && parsedCoverage > 0 && parsedTerm > 0,
    [beneficiary, clientName, parsedCoverage, parsedTerm],
  );

  const handleSimulate = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSavedId(null);

    if (!canSimulate) {
      setFormError(t('simulateCaucion.errors.required'));
      setResult(null);
      return;
    }

    setResult(
      simulateCaucionPremium({
        coverageAmount: parsedCoverage,
        termMonths: parsedTerm,
        riskType,
      }),
    );
  };

  const handleSaveDraft = async () => {
    if (!result) {
      return;
    }

    setFormError(null);

    const simulationNotes = [
      `Producto: Seguro de Caución`,
      `Beneficiario: ${beneficiary.trim()}`,
      `Tipo: ${t(`simulateCaucion.riskTypes.${result.riskType}`)}`,
      `Monto asegurado: ${formatMoney(result.coverageAmount, result.currency, locale)}`,
      `Plazo: ${result.termMonths} meses`,
      `Tasa: ${formatRate(result.annualRate, locale)}`,
      notes.trim() ? `Observaciones: ${notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const { data } = await createAgreement({
        variables: {
          input: {
            title: `Seguro de Caución — ${clientName.trim()}`,
            clientName: clientName.trim(),
            amount: result.premium,
            currency: result.currency,
            status: 'draft',
            notes: simulationNotes,
          },
        },
      });

      if (data?.createAgreement.id) {
        setSavedId(data.createAgreement.id);
      }
    } catch {
      setFormError(t('simulateCaucion.errors.saveFailed'));
    }
  };

  const resetSimulation = () => {
    setResult(null);
    setSavedId(null);
    setFormError(null);
  };

  const handleDownloadContract = () => {
    if (!result) {
      return;
    }

    downloadCaucionContractPdf({
      clientName: clientName.trim(),
      beneficiary: beneficiary.trim(),
      riskTypeLabel: t(`simulateCaucion.riskTypes.${result.riskType}`),
      notes: notes.trim() || undefined,
      simulation: result,
      locale,
      labels: {
        title: t('simulateCaucion.contract.title'),
        subtitle: t('simulateCaucion.contract.subtitle'),
        partiesHeading: t('simulateCaucion.contract.partiesHeading'),
        obligor: t('simulateCaucion.contract.obligor'),
        beneficiary: t('simulateCaucion.contract.beneficiary'),
        insurer: t('simulateCaucion.contract.insurer'),
        insurerValue: t('simulateCaucion.contract.insurerValue'),
        coverageHeading: t('simulateCaucion.contract.coverageHeading'),
        product: t('simulateCaucion.contract.product'),
        productValue: t('simulateCaucion.contract.productValue'),
        bondType: t('simulateCaucion.contract.bondType'),
        coverageAmount: t('simulateCaucion.contract.coverageAmount'),
        premium: t('simulateCaucion.contract.premium'),
        rate: t('simulateCaucion.contract.rate'),
        term: t('simulateCaucion.contract.term'),
        termValue: (months) => t('simulateCaucion.result.termValue', { count: months }),
        objectHeading: t('simulateCaucion.contract.objectHeading'),
        objectBody: t('simulateCaucion.contract.objectBody'),
        clausesHeading: t('simulateCaucion.contract.clausesHeading'),
        clauses: [
          t('simulateCaucion.contract.clauses.scope'),
          t('simulateCaucion.contract.clauses.premium'),
          t('simulateCaucion.contract.clauses.term'),
          t('simulateCaucion.contract.clauses.claims'),
          t('simulateCaucion.contract.clauses.nonBinding'),
        ],
        signaturesHeading: t('simulateCaucion.contract.signaturesHeading'),
        signatureObligor: t('simulateCaucion.contract.signatureObligor'),
        signatureBeneficiary: t('simulateCaucion.contract.signatureBeneficiary'),
        signatureInsurer: t('simulateCaucion.contract.signatureInsurer'),
        disclaimer: t('simulateCaucion.contract.disclaimer'),
        generatedOn: (date) => t('simulateCaucion.contract.generatedOn', { date }),
        filename: t('simulateCaucion.contract.filename'),
      },
    });
  };

  return (
    <Stack gap={6}>
      <Box>
        <HStack gap={3} wrap="wrap">
          <Badge
            bg={palette.accentSoft}
            color={palette.accentText}
            variant="subtle"
            px={3}
            py={1}
            borderRadius="full"
            borderWidth="1px"
            borderColor={palette.border}
          >
            {t('simulateCaucion.badge')}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            color={palette.mutedText}
            onClick={() => navigate('/app/products')}
          >
            {t('simulateCaucion.backToProducts')}
          </Button>
        </HStack>
        <Heading size="xl" mt={4}>
          {t('simulateCaucion.title')}
        </Heading>
        <Text color={palette.mutedText} mt={2} maxW="2xl">
          {t('simulateCaucion.description')}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4} alignItems="start">
        <Box
          as="form"
          onSubmit={handleSimulate}
          p={5}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={palette.border}
          bg={palette.surface}
          boxShadow={palette.shadow}
        >
          <Stack gap={4}>
            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('simulateCaucion.fields.clientName')}
              </Text>
              <Input
                bg={palette.inputBg}
                borderColor={palette.inputBorder}
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder={t('simulateCaucion.fields.clientNamePlaceholder')}
              />
            </Box>

            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('simulateCaucion.fields.beneficiary')}
              </Text>
              <Input
                bg={palette.inputBg}
                borderColor={palette.inputBorder}
                value={beneficiary}
                onChange={(event) => setBeneficiary(event.target.value)}
                placeholder={t('simulateCaucion.fields.beneficiaryPlaceholder')}
              />
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Box>
                <Text fontSize="sm" mb={2} color={palette.mutedText}>
                  {t('simulateCaucion.fields.coverageAmount')}
                </Text>
                <Input
                  bg={palette.inputBg}
                  borderColor={palette.inputBorder}
                  value={coverageAmount}
                  onChange={(event) => setCoverageAmount(event.target.value)}
                  placeholder={t('simulateCaucion.fields.coverageAmountPlaceholder')}
                  inputMode="decimal"
                />
              </Box>
              <Box>
                <Text fontSize="sm" mb={2} color={palette.mutedText}>
                  {t('simulateCaucion.fields.termMonths')}
                </Text>
                <Input
                  bg={palette.inputBg}
                  borderColor={palette.inputBorder}
                  value={termMonths}
                  onChange={(event) => setTermMonths(event.target.value)}
                  placeholder={t('simulateCaucion.fields.termMonthsPlaceholder')}
                  inputMode="numeric"
                />
              </Box>
            </SimpleGrid>

            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('simulateCaucion.fields.riskType')}
              </Text>
              <HStack gap={2} wrap="wrap">
                {riskTypeOptions.map((option) => {
                  const active = riskType === option;
                  return (
                    <Button
                      key={option}
                      type="button"
                      size="sm"
                      variant="outline"
                      bg={active ? palette.accentSoft : 'transparent'}
                      color={active ? palette.accentText : palette.text}
                      borderColor={active ? palette.accent : palette.border}
                      onClick={() => setRiskType(option)}
                    >
                      {t(`simulateCaucion.riskTypes.${option}`)}
                    </Button>
                  );
                })}
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('simulateCaucion.fields.notes')}
              </Text>
              <Input
                bg={palette.inputBg}
                borderColor={palette.inputBorder}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t('simulateCaucion.fields.notesPlaceholder')}
              />
            </Box>

            {formError ? (
              <Text color="red.400" fontSize="sm">
                {formError}
              </Text>
            ) : null}

            <Button
              type="submit"
              bg={palette.accent}
              color={palette.accentText}
              _hover={{ bg: palette.accentHover }}
            >
              {t('simulateCaucion.actions.simulate')}
            </Button>
          </Stack>
        </Box>

        <Box
          p={5}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={palette.border}
          bg={palette.surfaceElevated}
          boxShadow={palette.shadow}
          minH="280px"
        >
          <Text fontWeight="700" fontSize="lg">
            {t('simulateCaucion.result.title')}
          </Text>

          {!result ? (
            <Text color={palette.mutedText} mt={3} lineHeight="1.55">
              {t('simulateCaucion.description')}
            </Text>
          ) : (
            <Stack gap={4} mt={4}>
              <Box>
                <Text fontSize="sm" color={palette.mutedText}>
                  {t('simulateCaucion.result.coverage')}
                </Text>
                <Text fontSize="xl" fontWeight="700">
                  {formatMoney(result.coverageAmount, result.currency, locale)}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color={palette.mutedText}>
                  {t('simulateCaucion.result.premium')}
                </Text>
                <Text fontSize="2xl" fontWeight="700" color={palette.accent}>
                  {formatMoney(result.premium, result.currency, locale)}
                </Text>
              </Box>
              <HStack gap={6} wrap="wrap">
                <Box>
                  <Text fontSize="sm" color={palette.mutedText}>
                    {t('simulateCaucion.result.rate')}
                  </Text>
                  <Text fontWeight="600">{formatRate(result.annualRate, locale)}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color={palette.mutedText}>
                    {t('simulateCaucion.result.term')}
                  </Text>
                  <Text fontWeight="600">
                    {t('simulateCaucion.result.termValue', { count: result.termMonths })}
                  </Text>
                </Box>
              </HStack>

              {savedId ? (
                <Text color={palette.accent} fontSize="sm">
                  {t('simulateCaucion.success.saved')}
                </Text>
              ) : null}

              <HStack gap={3} wrap="wrap">
                <Button
                  bg={palette.accent}
                  color={palette.accentText}
                  _hover={{ bg: palette.accentHover }}
                  onClick={() => void handleSaveDraft()}
                  disabled={saving || Boolean(savedId)}
                >
                  {saving
                    ? t('simulateCaucion.actions.saving')
                    : t('simulateCaucion.actions.saveDraft')}
                </Button>
                <Button
                  variant="outline"
                  borderColor={palette.borderStrong}
                  color={palette.text}
                  _hover={{ bg: palette.surfaceAlt }}
                  onClick={handleDownloadContract}
                >
                  {t('simulateCaucion.actions.downloadContract')}
                </Button>
                {savedId ? (
                  <Button
                    variant="outline"
                    borderColor={palette.borderStrong}
                    onClick={() => navigate('/app/agreements')}
                  >
                    {t('simulateCaucion.actions.viewAgreements')}
                  </Button>
                ) : null}
                <Button variant="ghost" color={palette.mutedText} onClick={resetSimulation}>
                  {t('simulateCaucion.actions.newSimulation')}
                </Button>
              </HStack>
            </Stack>
          )}
        </Box>
      </SimpleGrid>
    </Stack>
  );
}
