import { Box, Button, Heading, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { useMutation } from '@apollo/client/react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AuthScreen } from '../components/AuthScreen';
import { REQUEST_PASSWORD_RESET_MUTATION, RESEND_VERIFICATION_MUTATION } from '../graphql/auth';
import { getErrorMessage } from '../lib/errors';
import { useAppTheme } from '../theme/app-theme';

type AuthMode = 'sign-in' | 'sign-up' | 'forgot';

type AuthMessage = {
  message: string;
  devLink?: string | null;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [googleClicked, setGoogleClicked] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<AuthMessage | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { palette } = useAppTheme();
  const { login, register } = useAuth();
  const [requestPasswordReset] = useMutation<{ requestPasswordReset: AuthMessage }>(
    REQUEST_PASSWORD_RESET_MUTATION,
  );
  const [resendVerification] = useMutation<{ resendVerificationEmail: AuthMessage }>(
    RESEND_VERIFICATION_MUTATION,
  );

  const emailValid = EMAIL_PATTERN.test(email.trim());
  const canSubmit =
    mode === 'forgot'
      ? emailValid
      : mode === 'sign-up'
        ? Boolean(name.trim()) && emailValid && password.length >= 8
        : emailValid && password.length > 0;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || submitting) {
      return;
    }

    setError('');
    setNotice(null);
    setNeedsVerification(false);
    setSubmitting(true);

    try {
      if (mode === 'forgot') {
        const result = await requestPasswordReset({
          variables: { input: { email: email.trim() } },
        });
        setNotice(
          result.data?.requestPasswordReset ?? {
            message: t('auth.resetSent'),
          },
        );
      } else if (mode === 'sign-in') {
        await login(email.trim(), password);
        navigate('/app');
      } else {
        const result = await register(name.trim(), email.trim(), password);
        setNotice(result);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.errorGeneric');
      setError(message);
      setNeedsVerification(mode === 'sign-in' && /verify your email/i.test(message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setError('');
    setSubmitting(true);
    try {
      const result = await resendVerification({
        variables: { input: { email: email.trim() } },
      });
      setNotice(
        result.data?.resendVerificationEmail ?? {
          message: t('auth.verificationSent'),
        },
      );
      setNeedsVerification(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errorGeneric'));
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
            {mode === 'sign-in'
              ? t('auth.welcomeBack')
              : mode === 'sign-up'
                ? t('auth.createAccount')
                : t('auth.resetTitle')}
          </Heading>
          <Text color={palette.mutedText} mt={2} lineHeight="1.55">
            {mode === 'sign-in'
              ? t('auth.signInDescription')
              : mode === 'sign-up'
                ? t('auth.signUpDescription')
                : t('auth.resetDescription')}
          </Text>
        </Box>

        {mode !== 'forgot' && (
          <HStack gap={3}>
            <Button
              flex="1"
              type="button"
              bg={mode === 'sign-in' ? palette.accent : palette.surfaceAlt}
              color={mode === 'sign-in' ? palette.accentText : palette.text}
              _hover={{ bg: mode === 'sign-in' ? palette.accentHover : palette.surfaceAlt }}
              onClick={() => {
                setMode('sign-in');
                setError('');
                setNotice(null);
              }}
            >
              {t('auth.signIn')}
            </Button>
            <Button
              flex="1"
              type="button"
              bg={mode === 'sign-up' ? palette.accent : palette.surfaceAlt}
              color={mode === 'sign-up' ? palette.accentText : palette.text}
              _hover={{ bg: mode === 'sign-up' ? palette.accentHover : palette.surfaceAlt }}
              onClick={() => {
                setMode('sign-up');
                setError('');
                setNotice(null);
              }}
            >
              {t('auth.signUp')}
            </Button>
          </HStack>
        )}

        <Stack gap={4}>
          {mode === 'sign-up' && (
            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('auth.fullName')}
              </Text>
              <Input
                bg={palette.inputBg}
                borderColor={palette.inputBorder}
                placeholder={t('auth.fullNamePlaceholder')}
                value={name}
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
              />
            </Box>
          )}

          <Box>
            <Text fontSize="sm" mb={2} color={palette.mutedText}>
              {t('auth.email')}
            </Text>
            <Input
              bg={palette.inputBg}
              borderColor={palette.inputBorder}
              placeholder={t('auth.emailPlaceholder')}
              type="email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
            />
          </Box>

          {mode !== 'forgot' && (
            <Box>
              <Text fontSize="sm" mb={2} color={palette.mutedText}>
                {t('auth.password')}
              </Text>
              <Input
                bg={palette.inputBg}
                borderColor={palette.inputBorder}
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                onChange={(event) => setPassword(event.target.value)}
              />
              {mode === 'sign-up' ? (
                <Text fontSize="xs" color={palette.mutedText} mt={2}>
                  {t('auth.passwordHint')}
                </Text>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  px={0}
                  mt={2}
                  color={palette.accent}
                  _hover={{ bg: 'transparent', color: palette.accentHover }}
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                    setNotice(null);
                    setPassword('');
                  }}
                >
                  {t('auth.forgotPassword')}
                </Button>
              )}
            </Box>
          )}
        </Stack>

        {error ? (
          <Text color="#E11D48" fontSize="sm">
            {error}
          </Text>
        ) : null}

        {notice ? (
          <Box
            p={4}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={palette.border}
            bg={palette.surfaceAlt}
          >
            <Text fontSize="sm">{notice.message}</Text>
            {notice.devLink ? (
              <Button
                mt={3}
                size="sm"
                bg={palette.accent}
                color={palette.accentText}
                onClick={() => navigate(new URL(notice.devLink as string).pathname + new URL(notice.devLink as string).search)}
              >
                {t('auth.openEmailLink')}
              </Button>
            ) : null}
          </Box>
        ) : null}

        {needsVerification && (
          <Button
            type="button"
            variant="outline"
            borderColor={palette.borderStrong}
            loading={submitting}
            onClick={() => void handleResendVerification()}
          >
            {t('auth.resendVerification')}
          </Button>
        )}

        <Button
          type="submit"
          bg={canSubmit ? palette.accent : palette.surfaceAlt}
          color={canSubmit ? palette.accentText : palette.mutedText}
          size="lg"
          disabled={!canSubmit}
          loading={submitting}
          cursor={canSubmit ? 'pointer' : 'not-allowed'}
          _hover={{ bg: canSubmit ? palette.accentHover : palette.surfaceAlt }}
          opacity={canSubmit ? 1 : 0.7}
        >
          {mode === 'sign-in'
            ? t('auth.continue')
            : mode === 'sign-up'
              ? t('auth.createAccountCta')
              : t('auth.sendResetLink')}
        </Button>

        {mode === 'forgot' && (
          <Button
            type="button"
            variant="ghost"
            color={palette.mutedText}
            onClick={() => {
              setMode('sign-in');
              setNotice(null);
              setError('');
            }}
          >
            {t('auth.backToSignIn')}
          </Button>
        )}

        {mode !== 'forgot' && (
          <>
            <Button
              type="button"
              variant="outline"
              borderColor={palette.borderStrong}
              color={palette.text}
              _hover={{ bg: palette.surfaceAlt }}
              onClick={() => setGoogleClicked(true)}
            >
              {t('auth.continueWithGoogle')}
            </Button>

            <Text fontSize="sm" color={palette.mutedText} lineHeight="1.5">
              {googleClicked ? t('auth.googlePending') : t('auth.googleReady')}
            </Text>
          </>
        )}

        {mode === 'sign-in' && (
          <Box
            p={4}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={palette.border}
            bg={palette.surfaceAlt}
          >
            <Text fontSize="sm" fontWeight="600">
              {t('auth.demoTitle')}
            </Text>
            <Text fontSize="sm" color={palette.mutedText} mt={1}>
              {t('auth.demoBody')}
            </Text>
          </Box>
        )}
      </Stack>
    </AuthScreen>
  );
}
