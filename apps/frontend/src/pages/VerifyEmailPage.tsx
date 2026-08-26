import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AuthScreen } from '../components/AuthScreen';
import { useAppTheme } from '../theme/app-theme';

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { verifyEmail } = useAuth();
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>(token ? 'pending' : 'error');

  useEffect(() => {
    if (!token) {
      setError(t('auth.verifyInvalid'));
      return;
    }

    let cancelled = false;
    void verifyEmail(token)
      .then(() => {
        if (!cancelled) {
          setStatus('success');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setStatus('error');
          setError(err instanceof Error ? err.message : t('auth.verifyInvalid'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [t, token, verifyEmail]);

  return (
    <AuthScreen>
      <Stack gap={5}>
        <Box>
          <Text fontSize="sm" color={palette.accent} textTransform="uppercase" letterSpacing="0.18em">
            {t('auth.sectionLabel')}
          </Text>
          <Heading size="lg" mt={2}>
            {t('auth.verifyTitle')}
          </Heading>
          <Text color={palette.mutedText} mt={2} lineHeight="1.55">
            {status === 'pending'
              ? t('auth.verifyPending')
              : status === 'success'
                ? t('auth.verifySuccess')
                : error || t('auth.verifyInvalid')}
          </Text>
        </Box>

        {status === 'success' && (
          <Button bg={palette.accent} color={palette.accentText} size="lg" onClick={() => navigate('/app')}>
            {t('auth.continue')}
          </Button>
        )}

        {status === 'error' && (
          <Button variant="outline" borderColor={palette.borderStrong} onClick={() => navigate('/app/login')}>
            {t('auth.backToSignIn')}
          </Button>
        )}
      </Stack>
    </AuthScreen>
  );
}
