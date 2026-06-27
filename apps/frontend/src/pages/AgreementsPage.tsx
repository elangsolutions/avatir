import { Badge, Box, Button, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const agreements = [
  {
    titleKey: 'agreements.mock.primaryServicing',
    client: 'Northwind Health',
    statusKey: 'agreements.statuses.active',
    amount: '$42,000',
  },
  {
    titleKey: 'agreements.mock.reviewCycle',
    client: 'Blue Peak',
    statusKey: 'agreements.statuses.draft',
    amount: '$18,500',
  },
  {
    titleKey: 'agreements.mock.renewalPlan',
    client: 'Aster Labs',
    statusKey: 'agreements.statuses.paused',
    amount: '$63,250',
  },
] as const;

export function AgreementsPage() {
  const { t } = useTranslation();

  return (
    <Stack gap={6}>
      <Box>
        <Badge colorPalette="teal" variant="solid" px={3} py={1} borderRadius="full">
          {t('common.crudArea')}
        </Badge>
        <Heading size="xl" mt={4}>
          {t('agreements.title')}
        </Heading>
        <Text color="whiteAlpha.700" mt={2}>
          {t('agreements.description')}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
        {agreements.map((agreement) => (
          <Box
            key={agreement.titleKey}
            p={5}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            bg="rgba(12, 18, 31, 0.92)"
          >
            <Text fontWeight="600" fontSize="lg">
              {t(agreement.titleKey)}
            </Text>
            <Text color="whiteAlpha.700" mt={1}>
              {agreement.client}
            </Text>
            <Text mt={4} fontSize="2xl" fontWeight="700">
              {agreement.amount}
            </Text>
            <Badge mt={4} colorPalette="teal" variant="subtle">
              {t(agreement.statusKey)}
            </Badge>
          </Box>
        ))}
      </SimpleGrid>

      <Button alignSelf="start" bg="teal.400" color="gray.950">
        {t('agreements.addAgreement')}
      </Button>
    </Stack>
  );
}
