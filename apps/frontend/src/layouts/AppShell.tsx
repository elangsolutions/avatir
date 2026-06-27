import { Box, Button, Container, Flex, HStack, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

const navItems = [
  { labelKey: 'nav.dashboard', path: '/app' },
  { labelKey: 'nav.users', path: '/app/users' },
  { labelKey: 'nav.agreements', path: '/app/agreements' },
] as const;

export function AppShell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Flex minH="100vh" bg="gray.950" color="white">
      <Flex
        display={{ base: 'none', md: 'flex' }}
        w="280px"
        borderRightWidth="1px"
        borderColor="whiteAlpha.200"
        bg="rgba(6, 11, 20, 0.92)"
        px={6}
        py={8}
        direction="column"
      >
        <Stack gap={6} flex="1">
          <Box>
            <Text fontSize="xs" letterSpacing="0.24em" textTransform="uppercase" color="teal.300">
              {t('brand.name')}
            </Text>
            <Text fontSize="2xl" fontWeight="700" mt={2}>
              {t('brand.tagline')}
            </Text>
            <Text color="whiteAlpha.700" mt={2}>
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
                  variant={active ? 'solid' : 'ghost'}
                  colorPalette={active ? 'teal' : undefined}
                  bg={active ? 'teal.400' : 'transparent'}
                  color={active ? 'gray.950' : 'whiteAlpha.900'}
                  _hover={{ bg: active ? 'teal.300' : 'whiteAlpha.100' }}
                  onClick={() => navigate(item.path)}
                >
                  {t(item.labelKey)}
                </Button>
              );
            })}
          </Stack>
        </Stack>

        <Stack gap={4} mt={8}>
          <LanguageSwitcher />
          <Button
            variant="outline"
            borderColor="whiteAlpha.300"
            color="white"
            _hover={{ bg: 'whiteAlpha.100' }}
            onClick={() => navigate('/auth')}
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
          borderColor="whiteAlpha.200"
          bg="rgba(6, 11, 20, 0.88)"
          backdropFilter="blur(18px)"
        >
          <Container maxW="7xl" px={{ base: 4, md: 8 }} py={4}>
            <Stack gap={4}>
              <Flex align="center" justify="space-between" gap={4}>
                <Box>
                  <Text fontSize="sm" color="teal.300" letterSpacing="0.18em" textTransform="uppercase">
                    {t('brand.name')}
                  </Text>
                  <Text fontWeight="600">{t('brand.mobileHeader')}</Text>
                </Box>

                <HStack gap={3}>
                  <Box display={{ base: 'none', md: 'block' }}>
                    <LanguageSwitcher />
                  </Box>
                  <Button
                    display={{ base: 'inline-flex', md: 'none' }}
                    size="sm"
                    variant="outline"
                    borderColor="whiteAlpha.300"
                    color="white"
                    onClick={() => navigate('/auth')}
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
                      variant={active ? 'solid' : 'outline'}
                      colorPalette={active ? 'teal' : undefined}
                      bg={active ? 'teal.400' : 'transparent'}
                      color={active ? 'gray.950' : 'white'}
                      borderColor="whiteAlpha.300"
                      onClick={() => navigate(item.path)}
                    >
                      {t(item.labelKey)}
                    </Button>
                  );
                })}
              </HStack>

              <Box display={{ base: 'block', md: 'none' }}>
                <LanguageSwitcher />
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
