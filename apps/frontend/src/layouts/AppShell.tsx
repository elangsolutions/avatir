import { Box, Button, Container, Flex, HStack, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { useAppTheme } from '../theme/app-theme';

const navItems = [
  { labelKey: 'nav.dashboard', path: '/app' },
  { labelKey: 'nav.users', path: '/app/users' },
  { labelKey: 'nav.agreements', path: '/app/agreements' },
] as const;

export function AppShell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { palette } = useAppTheme();

  return (
    <Flex minH="100vh" bg={palette.pageBg} color={palette.text}>
      <Flex
        display={{ base: 'none', md: 'flex' }}
        w="280px"
        borderRightWidth="1px"
        borderColor={palette.border}
        bg={palette.sidebarBg}
        px={6}
        py={8}
        direction="column"
      >
        <Stack gap={6} flex="1">
          <Box>
            <Text fontSize="xs" letterSpacing="0.24em" textTransform="uppercase" color={palette.accent}>
              {t('brand.name')}
            </Text>
            <Text fontSize="2xl" fontWeight="700" mt={2}>
              {t('brand.tagline')}
            </Text>
            <Text color={palette.mutedText} mt={2}>
              {t('brand.shellDescription')}
            </Text>
          </Box>

          <Stack gap={2}>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  justifyContent="flex-start"
                  variant="ghost"
                  bg={active ? palette.accentSoft : 'transparent'}
                  color={active ? palette.accentText : palette.text}
                  _hover={{ bg: active ? palette.accentSoft : palette.surfaceAlt }}
                  onClick={() => navigate(item.path)}
                >
                  {t(item.labelKey)}
                </Button>
              );
            })}
          </Stack>
        </Stack>

        <Stack gap={4} mt={8}>
          <HStack gap={3} align="center" wrap="wrap">
            <ThemeSwitcher showLabel />
            <LanguageSwitcher showLabel />
          </HStack>
          <Button
            variant="outline"
            borderColor={palette.borderStrong}
            color={palette.text}
            _hover={{ bg: palette.surfaceAlt }}
            onClick={() => navigate('/')}
          >
            {t('common.signOut')}
          </Button>
        </Stack>
      </Flex>

      <Box flex="1">
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
            <Stack gap={4}>
              <Flex align="center" justify="space-between" gap={4} wrap="wrap">
                <Box>
                  <Text fontSize="sm" color={palette.accent} letterSpacing="0.18em" textTransform="uppercase">
                    {t('brand.name')}
                  </Text>
                  <Text fontWeight="600">{t('brand.mobileHeader')}</Text>
                </Box>

                <HStack gap={3} align="center" flexShrink={0} wrap="wrap">
                  <Box display={{ base: 'none', md: 'block' }}>
                    <ThemeSwitcher />
                  </Box>
                  <Box display={{ base: 'none', md: 'block' }}>
                    <LanguageSwitcher />
                  </Box>
                  <Button
                    display={{ base: 'inline-flex', md: 'none' }}
                    size="sm"
                    variant="outline"
                    borderColor={palette.borderStrong}
                    color={palette.text}
                    bg={palette.surface}
                    onClick={() => navigate('/')}
                  >
                    {t('common.exit')}
                  </Button>
                </HStack>
              </Flex>

              <HStack gap={2} overflowX="auto" display={{ base: 'flex', md: 'none' }}>
                {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      size="sm"
                      whiteSpace="nowrap"
                      variant="outline"
                      bg={active ? palette.accentSoft : 'transparent'}
                      color={active ? palette.accentText : palette.text}
                      borderColor={active ? palette.accent : palette.border}
                      onClick={() => navigate(item.path)}
                    >
                      {t(item.labelKey)}
                    </Button>
                  );
                })}
              </HStack>

              <Box display={{ base: 'block', md: 'none' }}>
                <HStack gap={3} align="center" wrap="wrap">
                  <ThemeSwitcher />
                  <LanguageSwitcher />
                </HStack>
              </Box>
            </Stack>
          </Container>
        </Box>

        <Container maxW="7xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
          <Outlet />
        </Container>
      </Box>
    </Flex>
  );
}
