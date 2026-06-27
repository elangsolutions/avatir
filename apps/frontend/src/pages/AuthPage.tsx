import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Wrap,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

type AuthMode = 'sign-in' | 'sign-up';

const benefitKeys = [
  'auth.benefits.centralize',
  'auth.benefits.workflow',
  'auth.benefits.partners',
  'auth.benefits.traceability',
] as const;

const mvpModuleKeys = [
  'auth.mvp.modules.users',
  'auth.mvp.modules.producers',
  'auth.mvp.modules.documents',
  'auth.mvp.modules.requests',
  'auth.mvp.modules.workflow',
  'auth.mvp.modules.policies',
  'auth.mvp.modules.dashboard',
  'auth.mvp.modules.notifications',
] as const;

export function AuthPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [googleClicked, setGoogleClicked] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/app');
  };

  return (
    <Box minH="100vh" bg="gray.950" color="white" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
      <Container maxW="7xl" px={0}>
        <Flex justify="flex-end" mb={{ base: 4, lg: 0 }}>
          <LanguageSwitcher />
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 6, lg: 10 }} alignItems="start">
          <Stack gap={6} order={{ base: 2, lg: 1 }}>
            <Box>
              <Text fontSize="sm" letterSpacing="0.22em" textTransform="uppercase" color="teal.300">
                {t('auth.heroEyebrow')}
              </Text>
              <Heading size="2xl" mt={3} lineHeight="1.1">
                {t('auth.heroHeading')}
              </Heading>
            </Box>

            <Text color="whiteAlpha.700" fontSize="lg" maxW="xl" lineHeight="1.6">
              {t('auth.heroSubtext')}
            </Text>

            <Stack gap={3}>
              {benefitKeys.map((key) => (
                <HStack key={key} align="start" gap={3}>
                  <Box w="10px" h="10px" mt="10px" borderRadius="full" bg="teal.300" flexShrink={0} />
                  <Text color="whiteAlpha.800" lineHeight="1.55">
                    {t(key)}
                  </Text>
                </HStack>
              ))}
            </Stack>

            <Box
              p={5}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="whiteAlpha.200"
              bg="whiteAlpha.50"
            >
              <Text fontSize="sm" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.18em">
                {t('auth.mvp.label')}
              </Text>
              <Text fontWeight="600" mt={2} fontSize="lg">
                {t('auth.mvp.title')}
              </Text>
              <Text color="whiteAlpha.700" mt={2} lineHeight="1.55">
                {t('auth.mvp.detail')}
              </Text>
              <Wrap gap={2} mt={4}>
                {mvpModuleKeys.map((key) => (
                  <Badge
                    key={key}
                    colorPalette="teal"
                    variant="subtle"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontWeight="500"
                  >
                    {t(key)}
                  </Badge>
                ))}
              </Wrap>
            </Box>
          </Stack>

          <Box
            order={{ base: 1, lg: 2 }}
            position={{ lg: 'sticky' }}
            top={{ lg: 8 }}
            p={{ base: 4, md: 6 }}
            borderRadius="3xl"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            bg="rgba(12, 18, 31, 0.92)"
            boxShadow="2xl"
            backdropFilter="blur(18px)"
          >
            <Stack gap={5}>
              <Box>
                <Text fontSize="sm" color="teal.300" textTransform="uppercase" letterSpacing="0.18em">
                  {t('auth.sectionLabel')}
                </Text>
                <Heading size="lg" mt={2}>
                  {mode === 'sign-in' ? t('auth.welcomeBack') : t('auth.createAccount')}
                </Heading>
                <Text color="whiteAlpha.700" mt={2} lineHeight="1.55">
                  {mode === 'sign-in' ? t('auth.signInDescription') : t('auth.signUpDescription')}
                </Text>
              </Box>

              <HStack gap={3}>
                <Button
                  flex="1"
                  bg={mode === 'sign-in' ? 'teal.400' : 'whiteAlpha.100'}
                  color={mode === 'sign-in' ? 'gray.950' : 'white'}
                  _hover={{ bg: mode === 'sign-in' ? 'teal.300' : 'whiteAlpha.200' }}
                  onClick={() => setMode('sign-in')}
                >
                  {t('auth.signIn')}
                </Button>
                <Button
                  flex="1"
                  bg={mode === 'sign-up' ? 'teal.400' : 'whiteAlpha.100'}
                  color={mode === 'sign-up' ? 'gray.950' : 'white'}
                  _hover={{ bg: mode === 'sign-up' ? 'teal.300' : 'whiteAlpha.200' }}
                  onClick={() => setMode('sign-up')}
                >
                  {t('auth.signUp')}
                </Button>
              </HStack>

              <Stack gap={4}>
                {mode === 'sign-up' && (
                  <Box>
                    <Text fontSize="sm" mb={2} color="whiteAlpha.700">
                      {t('auth.fullName')}
                    </Text>
                    <Input
                      bg="whiteAlpha.50"
                      borderColor="whiteAlpha.200"
                      placeholder={t('auth.fullNamePlaceholder')}
                    />
                  </Box>
                )}

                <Box>
                  <Text fontSize="sm" mb={2} color="whiteAlpha.700">
                    {t('auth.email')}
                  </Text>
                  <Input
                    bg="whiteAlpha.50"
                    borderColor="whiteAlpha.200"
                    placeholder={t('auth.emailPlaceholder')}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" mb={2} color="whiteAlpha.700">
                    {t('auth.password')}
                  </Text>
                  <Input
                    bg="whiteAlpha.50"
                    borderColor="whiteAlpha.200"
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                  />
                </Box>
              </Stack>

              <Button bg="teal.400" color="gray.950" size="lg" onClick={handleContinue}>
                {mode === 'sign-in' ? t('auth.continue') : t('auth.createAccountCta')}
              </Button>

              <Button
                variant="outline"
                borderColor="whiteAlpha.300"
                color="white"
                _hover={{ bg: 'whiteAlpha.100' }}
                onClick={() => setGoogleClicked(true)}
              >
                {t('auth.continueWithGoogle')}
              </Button>

              <Text fontSize="sm" color="whiteAlpha.600" lineHeight="1.5">
                {googleClicked ? t('auth.googlePending') : t('auth.googleReady')}
              </Text>
            </Stack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
