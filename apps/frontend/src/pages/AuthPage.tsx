import { Box, Button, Container, Flex, Heading, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { useAppTheme } from '../theme/app-theme';

type AuthMode = 'sign-in' | 'sign-up';

export function AuthPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [googleClicked, setGoogleClicked] = useState(false);
  const navigate = useNavigate();
  const { palette } = useAppTheme();

  const handleContinue = () => {
    navigate('/app');
  };

  return (
    <Box
      minH="100vh"
      bg={palette.pageBg}
      color={palette.text}
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 8 }}
    >
      <Container maxW="lg" px={0}>
        <Flex justify="space-between" align="center" mb={{ base: 6, md: 8 }} wrap="wrap" gap={3}>
          <Button
            variant="ghost"
            size="sm"
            color={palette.mutedText}
            _hover={{ bg: palette.surfaceAlt }}
            onClick={() => navigate('/')}
          >
            {t('common.backToHome')}
          </Button>
          <HStack gap={3} align="center" wrap="wrap">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </HStack>
        </Flex>

        <Box
          p={{ base: 4, md: 6 }}
          borderRadius="3xl"
          borderWidth="1px"
          borderColor={palette.border}
          bg={palette.surfaceElevated}
          boxShadow={palette.shadow}
          backdropFilter="blur(18px)"
        >
          <Stack gap={5}>
            <Box>
              <Text fontSize="sm" color={palette.accent} textTransform="uppercase" letterSpacing="0.18em">
                {t('auth.sectionLabel')}
              </Text>
              <Heading size="lg" mt={2}>
                {mode === 'sign-in' ? t('auth.welcomeBack') : t('auth.createAccount')}
              </Heading>
              <Text color={palette.mutedText} mt={2} lineHeight="1.55">
                {mode === 'sign-in' ? t('auth.signInDescription') : t('auth.signUpDescription')}
              </Text>
            </Box>

            <HStack gap={3}>
              <Button
                flex="1"
                bg={mode === 'sign-in' ? palette.accent : palette.surfaceAlt}
                color={mode === 'sign-in' ? palette.accentText : palette.text}
                _hover={{ bg: mode === 'sign-in' ? palette.accentHover : palette.surfaceAlt }}
                onClick={() => setMode('sign-in')}
              >
                {t('auth.signIn')}
              </Button>
              <Button
                flex="1"
                bg={mode === 'sign-up' ? palette.accent : palette.surfaceAlt}
                color={mode === 'sign-up' ? palette.accentText : palette.text}
                _hover={{ bg: mode === 'sign-up' ? palette.accentHover : palette.surfaceAlt }}
                onClick={() => setMode('sign-up')}
              >
                {t('auth.signUp')}
              </Button>
            </HStack>

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
                />
              </Box>

              <Box>
                <Text fontSize="sm" mb={2} color={palette.mutedText}>
                  {t('auth.password')}
                </Text>
                <Input
                  bg={palette.inputBg}
                  borderColor={palette.inputBorder}
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                />
              </Box>
            </Stack>

            <Button bg={palette.accent} color={palette.accentText} size="lg" onClick={handleContinue}>
              {mode === 'sign-in' ? t('auth.continue') : t('auth.createAccountCta')}
            </Button>

            <Button
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
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
