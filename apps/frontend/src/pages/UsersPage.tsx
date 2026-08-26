import { Badge, Box, Button, Heading, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import type { UserRole } from '../auth/types';
import { USER_ROLES } from '../auth/types';
import { SelectField } from '../components/FormFields';
import {
  CREATE_USER_MUTATION,
  DELETE_USER_MUTATION,
  UPDATE_USER_MUTATION,
  USERS_QUERY,
} from '../graphql/users';
import { getErrorMessage } from '../lib/errors';
import { useAppTheme } from '../theme/app-theme';

type PlatformUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type UserFormState = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

const emptyForm: UserFormState = {
  name: '',
  email: '',
  password: '',
  role: 'CLIENT',
};

export function UsersPage() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { user: currentUser } = useAuth();
  const { data, loading } = useQuery<{ users: PlatformUser[] }>(USERS_QUERY);
  const [createUser, { loading: creating }] = useMutation(CREATE_USER_MUTATION, {
    refetchQueries: ['Users'],
  });
  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER_MUTATION, {
    refetchQueries: ['Users'],
  });
  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER_MUTATION, {
    refetchQueries: ['Users'],
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [error, setError] = useState('');

  const users = data?.users ?? [];
  const saving = creating || updating;

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
    setError('');
  };

  const openEdit = (user: PlatformUser) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setFormOpen(true);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');

    try {
      if (editingId) {
        await updateUser({
          variables: {
            id: editingId,
            input: {
              name: form.name,
              email: form.email,
              role: form.role,
              password: form.password || undefined,
            },
          },
        });
      } else {
        await createUser({
          variables: {
            input: {
              name: form.name,
              email: form.email,
              password: form.password,
              role: form.role,
            },
          },
        });
      }
      closeForm();
    } catch (err) {
      setError(getErrorMessage(err, t('users.errorSave')));
    }
  };

  const handleDelete = async (user: PlatformUser) => {
    if (user.id === currentUser?.id) {
      return;
    }
    if (!window.confirm(t('users.confirmDelete', { name: user.name }))) {
      return;
    }

    try {
      await deleteUser({ variables: { id: user.id } });
    } catch (err) {
      setError(getErrorMessage(err, t('users.errorDelete')));
    }
  };

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
          {t('common.crudArea')}
        </Badge>
        <Heading size="xl" mt={4}>
          {t('users.title')}
        </Heading>
        <Text color={palette.mutedText} mt={2}>
          {t('users.description')}
        </Text>
      </Box>

      <HStack justify="space-between" wrap="wrap" gap={3}>
        <Text color={palette.mutedText}>{t('users.adminOnly')}</Text>
        <Button bg={palette.accent} color={palette.accentText} onClick={openCreate}>
          {t('users.addUser')}
        </Button>
      </HStack>

      {formOpen && (
        <Box
          p={5}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={palette.border}
          bg={palette.surface}
          boxShadow={palette.shadow}
        >
          <Stack gap={4}>
            <Heading size="md">{editingId ? t('users.editUser') : t('users.addUser')}</Heading>
            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('auth.fullName')}
              </Text>
              <Input
                bg={palette.inputBg}
                borderColor={palette.inputBorder}
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </Box>
            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('auth.email')}
              </Text>
              <Input
                bg={palette.inputBg}
                borderColor={palette.inputBorder}
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </Box>
            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {editingId ? t('users.passwordOptional') : t('auth.password')}
              </Text>
              <Input
                bg={palette.inputBg}
                borderColor={palette.inputBorder}
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </Box>
            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('users.role')}
              </Text>
              <SelectField
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({ ...current, role: event.target.value as UserRole }))
                }
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(`users.roles.${role}`)}
                  </option>
                ))}
              </SelectField>
            </Box>
            {error ? (
              <Text color="#E11D48" fontSize="sm">
                {error}
              </Text>
            ) : null}
            <HStack gap={3}>
              <Button bg={palette.accent} color={palette.accentText} loading={saving} onClick={() => void handleSubmit()}>
                {t('common.save')}
              </Button>
              <Button variant="outline" borderColor={palette.borderStrong} onClick={closeForm}>
                {t('common.cancel')}
              </Button>
            </HStack>
          </Stack>
        </Box>
      )}

      {loading ? (
        <Text color={palette.mutedText}>{t('common.loading')}</Text>
      ) : users.length === 0 ? (
        <Text color={palette.mutedText}>{t('users.empty')}</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
          {users.map((user) => (
            <Box
              key={user.id}
              p={5}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={palette.border}
              bg={palette.surface}
              boxShadow={palette.shadow}
            >
              <Text fontWeight="600" fontSize="lg">
                {user.name}
              </Text>
              <Text color={palette.mutedText} mt={1}>
                {user.email}
              </Text>
              <Badge
                mt={4}
                bg={palette.accentSoft}
                color={palette.accentText}
                variant="subtle"
                borderWidth="1px"
                borderColor={palette.border}
              >
                {t(`users.roles.${user.role}`)}
              </Badge>
              <HStack mt={5} gap={3}>
                <Button size="sm" variant="outline" borderColor={palette.borderStrong} onClick={() => openEdit(user)}>
                  {t('common.edit')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor={palette.borderStrong}
                  color="#E11D48"
                  disabled={user.id === currentUser?.id || deleting}
                  onClick={() => void handleDelete(user)}
                >
                  {t('common.delete')}
                </Button>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
