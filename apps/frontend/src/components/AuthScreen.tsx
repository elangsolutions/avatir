import { Box, Button, Container, Flex, HStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useAppTheme } from '../theme/app-theme';

export function AuthScreen({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { palette } = useAppTheme();

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
          {children}
        </Box>
      </Container>
    </Box>
  );
}
