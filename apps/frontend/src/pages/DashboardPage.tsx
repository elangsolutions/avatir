import { Badge, Box, Button, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { canManageUsers } from '../auth/permissions';
import { AGREEMENTS_QUERY } from '../graphql/agreements';
import { APP_INFO_QUERY } from '../graphql/app';
import { USERS_QUERY } from '../graphql/users';
import { useAppTheme } from '../theme/app-theme';

type AppInfoQueryData = {
  appInfo?: {
    name: string;
    tagline?: string | null;
    status?: string | null;
  } | null;
};

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data } = useQuery<AppInfoQueryData>(APP_INFO_QUERY);
  const { data: agreementsData } = useQuery<{ agreements: unknown[] }>(AGREEMENTS_QUERY);
  const { data: usersData } = useQuery<{ users: unknown[] }>(USERS_QUERY, {
    skip: !canManageUsers(user?.role),
  });
  const { palette } = useAppTheme();

  const metrics = [
    {
      key: 'activeUsers',
      value: canManageUsers(user?.role) ? String(usersData?.users.length ?? 0) : t(`users.roles.${user?.role ?? 'CLIENT'}`),
    },
    {
      key: 'agreements',
      value: String(agreementsData?.agreements.length ?? 0),
    },
    {
      key: 'googleAuth',
      valueKey: 'dashboard.metrics.googleAuth.value',
    },
  ] as const;

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
          {t('dashboard.badge')}
        </Badge>
        <Heading size="xl" mt={4}>
          {data?.appInfo?.name ?? t('brand.name')}
        </Heading>
        <Text color={palette.mutedText} mt={2} maxW="2xl">
          {data?.appInfo?.tagline ?? t('brand.taglineFallback')}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        {metrics.map((metric) => (
          <Box
            key={metric.key}
            p={5}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={palette.border}
            bg={palette.surface}
            boxShadow={palette.shadow}
          >
            <Text color={palette.mutedText} fontSize="sm" textTransform="uppercase" letterSpacing="0.16em">
              {t(`dashboard.metrics.${metric.key}.label`)}
            </Text>
            <Heading size="lg" mt={3}>
              {'valueKey' in metric ? t(metric.valueKey) : metric.value}
            </Heading>
            <Text color={palette.mutedText} mt={2}>
              {t(`dashboard.metrics.${metric.key}.detail`)}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
        <Box
          p={5}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={palette.border}
          bg={palette.surface}
          boxShadow={palette.shadow}
        >
          <Text fontWeight="600">{t('dashboard.nextSteps.title')}</Text>
          <Text color={palette.mutedText} mt={2}>
            {t('dashboard.nextSteps.body')}
          </Text>
        </Box>

        <Box
          p={5}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={palette.border}
          bg={palette.surface}
          boxShadow={palette.shadow}
        >
          <Text fontWeight="600">{t('dashboard.googleAuth.title')}</Text>
          <Text color={palette.mutedText} mt={2}>
            {t('dashboard.googleAuth.body')}
          </Text>
          <Button mt={4} bg={palette.accent} color={palette.accentText} onClick={() => navigate('/app/login')}>
            {t('dashboard.googleAuth.cta')}
          </Button>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}
