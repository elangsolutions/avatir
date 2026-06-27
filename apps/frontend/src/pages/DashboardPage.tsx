import { Badge, Box, Button, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { APP_INFO_QUERY } from '../graphql/app';

type AppInfoQueryData = {
  appInfo?: {
    name: string;
    tagline?: string | null;
    status?: string | null;
  } | null;
};

const metricKeys = [
  {
    key: 'activeUsers',
    value: '12',
  },
  {
    key: 'agreements',
    value: '24',
  },
  {
    key: 'googleAuth',
    valueKey: 'dashboard.metrics.googleAuth.value',
  },
] as const;

export function DashboardPage() {
  const { t } = useTranslation();
  const { data } = useQuery<AppInfoQueryData>(APP_INFO_QUERY);

  return (
    <Stack gap={6}>
      <Box>
        <Badge colorPalette="teal" variant="solid" px={3} py={1} borderRadius="full">
          {t('dashboard.badge')}
        </Badge>
        <Heading size="xl" mt={4}>
          {data?.appInfo?.name ?? t('brand.name')}
        </Heading>
        <Text color="whiteAlpha.700" mt={2} maxW="2xl">
          {data?.appInfo?.tagline ?? t('brand.taglineFallback')}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        {metricKeys.map((metric) => (
          <Box
            key={metric.key}
            p={5}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            bg="whiteAlpha.50"
          >
            <Text color="whiteAlpha.700" fontSize="sm" textTransform="uppercase" letterSpacing="0.16em">
              {t(`dashboard.metrics.${metric.key}.label`)}
            </Text>
            <Heading size="lg" mt={3}>
              {'valueKey' in metric ? t(metric.valueKey) : metric.value}
            </Heading>
            <Text color="whiteAlpha.700" mt={2}>
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
          borderColor="whiteAlpha.200"
          bg="rgba(12, 18, 31, 0.92)"
        >
          <Text fontWeight="600">{t('dashboard.nextSteps.title')}</Text>
          <Text color="whiteAlpha.700" mt={2}>
            {t('dashboard.nextSteps.body')}
          </Text>
        </Box>

        <Box
          p={5}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          bg="rgba(12, 18, 31, 0.92)"
        >
          <Text fontWeight="600">{t('dashboard.googleAuth.title')}</Text>
          <Text color="whiteAlpha.700" mt={2}>
            {t('dashboard.googleAuth.body')}
          </Text>
          <Button mt={4} bg="teal.400" color="gray.950">
            {t('dashboard.googleAuth.cta')}
          </Button>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}
