import { Box, Button, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { useMutation } from '@apollo/client/react';
import { useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthScreen } from '../components/AuthScreen';
import { RESET_PASSWORD_MUTATION } from '../graphql/auth';
import { getErrorMessage } from '../lib/errors';
import { useAppTheme } from '../theme/app-theme';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetPassword] = useMutation<{ resetPassword: { message: string } }>(RESET_PASSWORD_MUTATION);

  const canSubmit = Boolean(token) && password.length >= 8 && password === confirmPassword;

  const tokenMissing = useMemo(() => !token, [token]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || submitting) {
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const result = await resetPassword({
        variables: { input: { token, password } },
      });
      setMessage(result.data?.resetPassword.message ?? t('auth.resetSuccess'));
    } catch (err) {
      setError(getErrorMessage(err, t('auth.resetInvalid')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen>
      <Stack gap={5} as="form" onSubmit={(event) => void handleSubmit(event)}>
        <Box>
          <Text fontSize="sm" color={palette.accent} textTransform="uppercase" letterSpacing="0.18em">
            {t('auth.sectionLabel')}
          </Text>
          <Heading size="lg" mt={2}>
            {t('auth.choosePasswordTitle')}
          </Heading>
          <Text color={palette.mutedText} mt={2} lineHeight="1.55">
            {t('auth.choosePasswordDescription')}
          </Text>
        </Box>

        {tokenMissing ? (
          <Text color="#E11D48" fontSize="sm">
            {t('auth.resetInvalid')}
          </Text>
        ) : (
          <>
            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('auth.newPassword')}
              </Text>
              <Input
                bg={palette.inputBg}
                borderColor={palette.inputBorder}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Box>
            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('auth.confirmPassword')}
              </Text>
              <Input
                bg={palette.inputBg}
                borderColor={palette.inputBorder}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </Box>
          </>
        )}

        {password && confirmPassword && password !== confirmPassword ? (
          <Text color="#E11D48" fontSize="sm">
            {t('auth.passwordMismatch')}
          </Text>
        ) : null}

        {error ? (
          <Text color="#E11D48" fontSize="sm">
            {error}
          </Text>
        ) : null}

        {message ? (
          <Text fontSize="sm" color={palette.mutedText}>
            {message}
          </Text>
        ) : null}

        <Button
          type="submit"
          bg={canSubmit ? palette.accent : palette.surfaceAlt}
          color={canSubmit ? palette.accentText : palette.mutedText}
          size="lg"
          disabled={!canSubmit || Boolean(message)}
          loading={submitting}
          cursor={canSubmit ? 'pointer' : 'not-allowed'}
          _hover={{ bg: canSubmit ? palette.accentHover : palette.surfaceAlt }}
          opacity={canSubmit ? 1 : 0.7}
        >
          {t('auth.savePassword')}
        </Button>

        <Button type="button" variant="ghost" color={palette.mutedText} onClick={() => navigate('/app/login')}>
          {t('auth.backToSignIn')}
        </Button>
      </Stack>
    </AuthScreen>
  );
}
