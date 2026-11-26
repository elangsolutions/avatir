import { Badge, Box, Button, Heading, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { canCreateAgreements, canDeleteAgreements, canListClients } from '../auth/permissions';
import { CurrencyAmountInput } from '../components/CurrencyAmountInput';
import { finalizeCurrencyAmount, formatMoney } from '../components/currency-amount';
import { SelectField, TextAreaField } from '../components/FormFields';
import {
  AGREEMENTS_QUERY,
  CREATE_AGREEMENT_MUTATION,
  DELETE_AGREEMENT_MUTATION,
  UPDATE_AGREEMENT_MUTATION,
} from '../graphql/agreements';
import { CLIENTS_QUERY } from '../graphql/users';
import { getErrorMessage } from '../lib/errors';
import { useAppTheme } from '../theme/app-theme';

type Agreement = {
  id: string;
  title: string;
  clientName: string;
  amount: number;
  currency: string;
  status: string;
  notes?: string | null;
  ownerId?: string | null;
  agentId?: string | null;
};

type ClientOption = {
  id: string;
  name: string;
  email: string;
};

type AgreementFormState = {
  title: string;
  ownerId: string;
  clientName: string;
  amount: string;
  currency: string;
  status: string;
  notes: string;
};

const emptyForm: AgreementFormState = {
  title: '',
  ownerId: '',
  clientName: '',
  amount: '',
  currency: 'USD',
  status: 'draft',
  notes: '',
};

const statuses = ['draft', 'active', 'paused', 'closed'] as const;

type AgreementsView = 'cards' | 'list';

const viewStorageKey = 'avatir.agreements.view';

function readStoredView(): AgreementsView {
  try {
    return window.localStorage.getItem(viewStorageKey) === 'list' ? 'list' : 'cards';
  } catch {
    return 'cards';
  }
}

export function AgreementsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { palette } = useAppTheme();
  const locale = i18n.language?.startsWith('en') ? 'en-US' : 'es-AR';
  const defaultCurrency = i18n.language?.startsWith('en') ? 'USD' : 'ARS';
  const { user } = useAuth();
  const canWrite = canCreateAgreements(user?.role);
  const canDelete = canDeleteAgreements(user?.role);
  const { data, loading } = useQuery<{ agreements: Agreement[] }>(AGREEMENTS_QUERY);
  const { data: clientsData } = useQuery<{ clients: ClientOption[] }>(CLIENTS_QUERY, {
    skip: !canListClients(user?.role),
  });
  const [createAgreement, { loading: creating }] = useMutation(CREATE_AGREEMENT_MUTATION, {
    refetchQueries: ['Agreements'],
  });
  const [updateAgreement, { loading: updating }] = useMutation(UPDATE_AGREEMENT_MUTATION, {
    refetchQueries: ['Agreements'],
  });
  const [deleteAgreement, { loading: deleting }] = useMutation(DELETE_AGREEMENT_MUTATION, {
    refetchQueries: ['Agreements'],
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AgreementFormState>(emptyForm);
  const [error, setError] = useState('');
  const [view, setView] = useState<AgreementsView>(readStoredView);

  const changeView = (nextView: AgreementsView) => {
    setView(nextView);
    try {
      window.localStorage.setItem(viewStorageKey, nextView);
    } catch {
      // Ignore storage failures; the selection still applies for this session.
    }
  };

  const agreements = data?.agreements ?? [];
  const clients = clientsData?.clients ?? [];
  const saving = creating || updating;

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, currency: defaultCurrency });
    setFormOpen(true);
    setError('');
  };

  const openEdit = (agreement: Agreement) => {
    setEditingId(agreement.id);
    setForm({
      title: agreement.title,
      ownerId: agreement.ownerId ?? '',
      clientName: agreement.clientName,
      amount: finalizeCurrencyAmount(String(agreement.amount)),
      currency: agreement.currency,
      status: agreement.status,
      notes: agreement.notes ?? '',
    });
    setFormOpen(true);
    setError('');
  };

  const handleClientChange = (ownerId: string) => {
    const client = clients.find((item) => item.id === ownerId);
    setForm((current) => ({
      ...current,
      ownerId,
      clientName: client?.name ?? current.clientName,
    }));
  };

  const handleSubmit = async () => {
    setError('');
    const amount = Number(form.amount);
    if (!form.title.trim() || Number.isNaN(amount) || !form.ownerId) {
      setError(t('agreements.errorInvalid'));
      return;
    }

    const input = {
      title: form.title,
      clientName: form.clientName,
      amount,
      currency: form.currency,
      status: form.status,
      notes: form.notes || undefined,
      ownerId: form.ownerId || undefined,
    };

    try {
      if (editingId) {
        await updateAgreement({ variables: { id: editingId, input } });
      } else {
        await createAgreement({ variables: { input } });
      }
      closeForm();
    } catch (err) {
      setError(getErrorMessage(err, t('agreements.errorSave')));
    }
  };

  const handleDelete = async (agreement: Agreement) => {
    if (!window.confirm(t('agreements.confirmDelete', { title: agreement.title }))) {
      return;
    }

    try {
      await deleteAgreement({ variables: { id: agreement.id } });
    } catch (err) {
      setError(getErrorMessage(err, t('agreements.errorDelete')));
    }
  };

  const renderStatus = (agreement: Agreement, mt?: number) => (
    <Badge
      mt={mt}
      bg={palette.accentAltSoft}
      color={palette.accentText}
      variant="subtle"
      borderWidth="1px"
      borderColor={palette.border}
    >
      {t(`agreements.statuses.${agreement.status}`, { defaultValue: agreement.status })}
    </Badge>
  );

  const renderActions = (agreement: Agreement, mt?: number) =>
    canWrite || canDelete ? (
      <HStack mt={mt} gap={3}>
        {canWrite && (
          <Button size="sm" variant="outline" borderColor={palette.borderStrong} onClick={() => openEdit(agreement)}>
            {t('common.edit')}
          </Button>
        )}
        {canDelete && (
          <Button
            size="sm"
            variant="outline"
            borderColor={palette.borderStrong}
            color="#E11D48"
            disabled={deleting}
            onClick={() => void handleDelete(agreement)}
          >
            {t('common.delete')}
          </Button>
        )}
      </HStack>
    ) : null;

  const hasActions = canWrite || canDelete;
  const listColumns = hasActions ? '2fr 1fr 1fr auto' : '2fr 1fr 1fr';

  return (
    <Stack gap={6}>
      <Box>
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
          {t('agreements.badge')}
        </Badge>
        <Heading size="xl" mt={4}>
          {t('agreements.title')}
        </Heading>
        <Text color={palette.mutedText} mt={2}>
          {user?.role === 'CLIENT' ? t('agreements.clientDescription') : t('agreements.description')}
        </Text>
      </Box>

      <Stack gap={3}>
        <Text color={palette.mutedText}>
          {user?.role === 'CLIENT' ? t('agreements.clientHint') : t('agreements.agentHint')}
        </Text>
        <SimpleGrid columns={{ base: 1, md: canWrite ? 2 : 1 }} gap={3}>
          <Button
            size="lg"
            bg={palette.accent}
            color={palette.accentText}
            onClick={() => navigate('/app/agreements/simulate')}
          >
            {t('agreements.simulate')}
          </Button>
          {canWrite && (
            <Button size="lg" variant="outline" borderColor={palette.borderStrong} onClick={openCreate}>
              {t('agreements.create')}
            </Button>
          )}
        </SimpleGrid>
      </Stack>

      {formOpen && canWrite && (
        <Box
          p={5}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={palette.border}
          bg={palette.surface}
          boxShadow={palette.shadow}
        >
          <Stack gap={4}>
            <Heading size="md">
              {editingId ? t('agreements.editAgreement') : t('agreements.addAgreement')}
            </Heading>
            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('agreements.fields.title')}
              </Text>
              <Input
                bg={palette.inputBg}
                borderColor={palette.inputBorder}
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
            </Box>
            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('agreements.fields.client')}
              </Text>
              <SelectField value={form.ownerId} onChange={(event) => handleClientChange(event.target.value)}>
                <option value="">{t('agreements.fields.clientPlaceholder')}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </SelectField>
            </Box>
            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('agreements.fields.amount')}
              </Text>
              <CurrencyAmountInput
                value={form.amount}
                currency={form.currency}
                locale={locale}
                onChange={(amount) => setForm((current) => ({ ...current, amount }))}
              />
            </Box>
            <HStack gap={4} align="start">
              <Box flex="1">
                <Text fontSize="sm" mb={2} color={palette.mutedText}>
                  {t('agreements.fields.currency')}
                </Text>
                <SelectField
                  value={form.currency}
                  onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}
                >
                  {!['ARS', 'USD'].includes(form.currency) && <option value={form.currency}>{form.currency}</option>}
                  <option value="ARS">{t('agreements.currencies.ARS')}</option>
                  <option value="USD">{t('agreements.currencies.USD')}</option>
                </SelectField>
              </Box>
              <Box flex="1">
                <Text fontSize="sm" mb={2} color={palette.mutedText}>
                  {t('agreements.fields.status')}
                </Text>
                <SelectField
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {t(`agreements.statuses.${status}`)}
                    </option>
                  ))}
                </SelectField>
              </Box>
            </HStack>
            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('agreements.fields.notes')}
              </Text>
              <TextAreaField
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </Box>
            {error ? (
              <Text color="#E11D48" fontSize="sm">
                {error}
              </Text>
            ) : null}
            <HStack gap={3}>
              <Button bg={palette.accent} color={palette.accentText} loading={saving} onClick={() => void handleSubmit()}>
                {editingId ? t('common.save') : t('agreements.generate')}
              </Button>
              <Button variant="outline" borderColor={palette.borderStrong} onClick={closeForm}>
                {t('common.cancel')}
              </Button>
            </HStack>
          </Stack>
        </Box>
      )}

      {error && !formOpen ? (
        <Text color="#E11D48" fontSize="sm">
          {error}
        </Text>
      ) : null}

      {loading ? (
        <Text color={palette.mutedText}>{t('common.loading')}</Text>
      ) : agreements.length === 0 ? (
        <Text color={palette.mutedText}>{t('agreements.empty')}</Text>
      ) : (
        <Stack gap={4}>
          <HStack justify="flex-end" gap={2} role="group" aria-label={t('agreements.view.label')}>
            {(['cards', 'list'] as const).map((option) => {
              const selected = view === option;
              return (
                <Button
                  key={option}
                  size="sm"
                  variant={selected ? 'solid' : 'outline'}
                  bg={selected ? palette.accent : undefined}
                  color={selected ? palette.accentText : undefined}
                  borderColor={palette.borderStrong}
                  aria-pressed={selected}
                  onClick={() => changeView(option)}
                >
                  {t(`agreements.view.${option}`)}
                </Button>
              );
            })}
          </HStack>

          {view === 'cards' ? (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
              {agreements.map((agreement) => (
                <Box
                  key={agreement.id}
                  p={5}
                  borderRadius="2xl"
                  borderWidth="1px"
                  borderColor={palette.border}
                  bg={palette.surface}
                  boxShadow={palette.shadow}
                >
                  <Text fontWeight="600" fontSize="lg">
                    {agreement.title}
                  </Text>
                  <Text color={palette.mutedText} mt={1}>
                    {agreement.clientName}
                  </Text>
                  <Text mt={4} fontSize="2xl" fontWeight="700">
                    {formatMoney(agreement.amount, agreement.currency, locale)}
                  </Text>
                  {renderStatus(agreement, 4)}
                  {renderActions(agreement, 5)}
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Box
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={palette.border}
              bg={palette.surface}
              boxShadow={palette.shadow}
              overflow="hidden"
            >
              <Box
                display={{ base: 'none', md: 'grid' }}
                gridTemplateColumns={listColumns}
                gap={4}
                px={5}
                py={3}
                borderBottomWidth="1px"
                borderColor={palette.border}
                color={palette.mutedText}
                fontSize="sm"
                fontWeight="600"
              >
                <Text>{t('agreements.fields.title')}</Text>
                <Text>{t('agreements.fields.amount')}</Text>
                <Text>{t('agreements.fields.status')}</Text>
                {hasActions && <Text textAlign="right">{t('agreements.actions')}</Text>}
              </Box>
              {agreements.map((agreement, index) => (
                <Box
                  key={agreement.id}
                  display="grid"
                  gridTemplateColumns={{ base: '1fr', md: listColumns }}
                  alignItems="center"
                  gap={{ base: 2, md: 4 }}
                  px={5}
                  py={4}
                  borderTopWidth={index === 0 ? 0 : '1px'}
                  borderColor={palette.border}
                >
                  <Box minW={0}>
                    <Text fontWeight="600" truncate>
                      {agreement.title}
                    </Text>
                    <Text color={palette.mutedText} fontSize="sm" truncate>
                      {agreement.clientName}
                    </Text>
                  </Box>
                  <Text fontWeight="700">{formatMoney(agreement.amount, agreement.currency, locale)}</Text>
                  <Box>{renderStatus(agreement)}</Box>
                  {hasActions && (
                    <Box justifySelf={{ base: 'start', md: 'end' }}>{renderActions(agreement)}</Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Stack>
      )}
    </Stack>
  );
}
