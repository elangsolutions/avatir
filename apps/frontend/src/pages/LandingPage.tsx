import {
  Badge,
  Box,
  Button,
  chakra,
  Container,
  Flex,
  Heading,
  HStack,
  Stack,
  Tabs,
  Text,
  Wrap,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { useAppTheme } from '../theme/app-theme';

const HeroVideo = chakra('video');

const benefitKeys = [
  'landing.aboutUs.benefits.centralize',
  'landing.aboutUs.benefits.workflow',
  'landing.aboutUs.benefits.partners',
  'landing.aboutUs.benefits.traceability',
] as const;

const productModuleKeys = [
  'landing.products.modules.users',
  'landing.products.modules.producers',
  'landing.products.modules.documents',
  'landing.products.modules.requests',
  'landing.products.modules.workflow',
  'landing.products.modules.policies',
  'landing.products.modules.dashboard',
  'landing.products.modules.notifications',
] as const;

const HERO_VIDEO_URL = 'https://assets.mixkit.co/videos/918/918-720.mp4';
const HERO_VIDEO_POSTER = 'https://assets.mixkit.co/videos/918/918-thumb-720-1.jpg';

export function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { palette } = useAppTheme();

  return (
    <Box minH="100vh" bg={palette.pageBg} color={palette.text}>
      <Box position="relative" minH={{ base: '560px', md: '680px' }} display="flex" flexDirection="column">
        <HeroVideo
          src={HERO_VIDEO_URL}
          poster={HERO_VIDEO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          position="absolute"
          inset={0}
          w="100%"
          h="100%"
          objectFit="cover"
          zIndex={0}
        />
        <Box
          position="absolute"
          inset={0}
          zIndex={1}
          bg={`linear-gradient(180deg, rgba(15, 23, 42, 0.55) 0%, rgba(15, 23, 42, 0.68) 55%, ${palette.pageBg} 100%)`}
        />

        <Box position="relative" zIndex={2} display="flex" flexDirection="column" flex="1">
          <Box
            position="sticky"
            top="0"
            zIndex="10"
            borderBottomWidth="1px"
            borderColor={palette.border}
            bg={palette.headerBg}
            backdropFilter="blur(18px)"
          >
            <Container maxW="7xl" px={{ base: 4, md: 8 }} py={4}>
              <Flex align="center" justify="space-between" gap={4} wrap="wrap">
                <Text fontSize="sm" color={palette.accent} letterSpacing="0.18em" textTransform="uppercase" fontWeight="700">
                  {t('brand.name')}
                </Text>

                <HStack gap={3} align="center" flexShrink={0} wrap="wrap">
                  <Box display={{ base: 'none', md: 'block' }}>
                    <ThemeSwitcher />
                  </Box>
                  <Box display={{ base: 'none', md: 'block' }}>
                    <LanguageSwitcher />
                  </Box>
                  <Button
                    size="sm"
                    minW="150px"
                    bg={palette.accent}
                    color={palette.accentText}
                    _hover={{ bg: palette.accentHover }}
                    onClick={() => navigate('/app/login')}
                  >
                    {t('landing.nav.signIn')}
                  </Button>
                </HStack>
              </Flex>

              <HStack gap={3} align="center" mt={3} display={{ base: 'flex', md: 'none' }} wrap="wrap">
                <ThemeSwitcher />
                <LanguageSwitcher />
              </HStack>
            </Container>
          </Box>

          <Container maxW="7xl" px={{ base: 4, md: 8 }} flex="1" display="flex" alignItems="center">
            <Stack gap={6} maxW="3xl" py={{ base: 10, md: 0 }}>
              <Text fontSize="sm" letterSpacing="0.22em" textTransform="uppercase" color="#BFDBFE">
                {t('landing.hero.eyebrow')}
              </Text>
              <Heading size="3xl" lineHeight="1.1" color="white">
                {t('landing.hero.heading')}
              </Heading>
              <Text color="whiteAlpha.900" fontSize="lg" lineHeight="1.6">
                {t('landing.hero.subtext')}
              </Text>

              <HStack gap={3} wrap="wrap">
                <Button
                  size="lg"
                  bg={palette.accent}
                  color={palette.accentText}
                  _hover={{ bg: palette.accentHover }}
                  onClick={() => navigate('/app/login')}
                >
                  {t('landing.hero.primaryCta')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="whiteAlpha.600"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  onClick={() => {
                    document.getElementById('landing-tabs')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {t('landing.hero.secondaryCta')}
                </Button>
              </HStack>
            </Stack>
          </Container>
        </Box>
      </Box>

      <Container maxW="7xl" px={{ base: 4, md: 8 }} py={{ base: 10, md: 16 }}>
        <Box id="landing-tabs">
          <Tabs.Root
            defaultValue="about"
            variant="plain"
            css={{
              '& [data-part="list"]': {
                gap: '8px',
                borderBottomWidth: '1px',
                borderColor: palette.border,
                pb: '4',
              },
              '& [data-part="trigger"]': {
                color: palette.mutedText,
                fontWeight: '600',
                borderRadius: 'full',
                px: '16px',
                py: '8px',
              },
              '& [data-part="trigger"][data-selected]': {
                color: palette.accentText,
                bg: palette.accentSoft,
              },
            }}
          >
            <Tabs.List>
              <Tabs.Trigger value="about">{t('landing.nav.aboutUs')}</Tabs.Trigger>
              <Tabs.Trigger value="products">{t('landing.nav.products')}</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="about">
              <Stack gap={6} mt={8}>
                <Box
                  p={{ base: 5, md: 6 }}
                  borderRadius="2xl"
                  borderWidth="1px"
                  borderColor={palette.border}
                  bg={palette.surface}
                  boxShadow={palette.shadow}
                >
                  <Heading size="lg">{t('landing.aboutUs.title')}</Heading>
                  <Text color={palette.mutedText} mt={3} lineHeight="1.6" maxW="2xl">
                    {t('landing.aboutUs.body')}
                  </Text>
                </Box>

                <Stack gap={3}>
                  {benefitKeys.map((key) => (
                    <HStack key={key} align="start" gap={3}>
                      <Box w="10px" h="10px" mt="10px" borderRadius="full" bg={palette.accent} flexShrink={0} />
                      <Text color={palette.text} lineHeight="1.55">
                        {t(key)}
                      </Text>
                    </HStack>
                  ))}
                </Stack>
              </Stack>
            </Tabs.Content>

            <Tabs.Content value="products">
              <Box
                mt={8}
                p={{ base: 5, md: 6 }}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor={palette.border}
                bg={palette.surfaceElevated}
                boxShadow={palette.shadow}
              >
                <Text fontSize="sm" color={palette.mutedText} textTransform="uppercase" letterSpacing="0.18em">
                  {t('landing.products.label')}
                </Text>
                <Text fontWeight="600" mt={2} fontSize="lg">
                  {t('landing.products.title')}
                </Text>
                <Text color={palette.mutedText} mt={2} lineHeight="1.55" maxW="2xl">
                  {t('landing.products.detail')}
                </Text>
                <Wrap gap={2} mt={4}>
                  {productModuleKeys.map((key) => (
                    <Badge
                      key={key}
                      bg={palette.accentSoft}
                      color={palette.accentText}
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontWeight="500"
                      borderWidth="1px"
                      borderColor={palette.border}
                    >
                      {t(key)}
                    </Badge>
                  ))}
                </Wrap>
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Container>
    </Box>
  );
}
