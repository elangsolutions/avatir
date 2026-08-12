import { Badge, Box, Button, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AGREEMENTS_QUERY, AgreementsQueryData } from '../graphql/agreements';
import { formatMoney } from '../lib/caucion';
import { useAppTheme } from '../theme/app-theme';

function statusKey(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'active' || normalized === 'draft' || normalized === 'paused' || normalized === 'closed') {
    return `agreements.statuses.${normalized}` as const;
  }
  return 'agreements.statuses.draft' as const;
}

export function AgreementsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { palette } = useAppTheme();
  const locale = i18n.language?.startsWith('en') ? 'en-US' : 'es-AR';
  const { data, loading, error } = useQuery<AgreementsQueryData>(AGREEMENTS_QUERY);

  const agreements = data?.agreements ?? [];

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
          {t('common.crudArea')}
        </Badge>
        <Heading size="xl" mt={4}>
          {t('agreements.title')}
        </Heading>
        <Text color={palette.mutedText} mt={2}>
          {t('agreements.description')}
        </Text>
      </Box>

      {error ? (
        <Text color="red.400">{t('agreements.loadError')}</Text>
      ) : null}

      {!loading && !error && agreements.length === 0 ? (
        <Text color={palette.mutedText}>{t('agreements.empty')}</Text>
      ) : null}

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
        {agreements.map((agreement) => (
          <Box
            key={agreement.id}
            p={5}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={palette.border}
            bg={palette.surface}
            boxShadow={palette.shadow}
          >
            <Text fontWeight="600" fontSize="lg">
              {agreement.title}
            </Text>
            <Text color={palette.mutedText} mt={1}>
              {agreement.clientName}
            </Text>
            <Text mt={4} fontSize="2xl" fontWeight="700">
              {formatMoney(agreement.amount, agreement.currency, locale)}
            </Text>
            <Badge
              mt={4}
              bg={palette.accentAltSoft}
              color={palette.accentText}
              variant="subtle"
              borderWidth="1px"
              borderColor={palette.border}
            >
              {t(statusKey(agreement.status))}
            </Badge>
          </Box>
        ))}
      </SimpleGrid>

      <Button
        alignSelf="start"
        bg={palette.accent}
        color={palette.accentText}
        _hover={{ bg: palette.accentHover }}
        onClick={() => navigate('/app/products/caucion/simulate')}
      >
        {t('agreements.addAgreement')}
      </Button>
    </Stack>
  );
}
