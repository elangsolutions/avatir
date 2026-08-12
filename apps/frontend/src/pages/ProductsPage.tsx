import { Badge, Box, Button, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppTheme } from '../theme/app-theme';

export function ProductsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { palette } = useAppTheme();

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
          {t('products.badge')}
        </Badge>
        <Heading size="xl" mt={4}>
          {t('products.title')}
        </Heading>
        <Text color={palette.mutedText} mt={2} maxW="2xl">
          {t('products.description')}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <Box
          p={5}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={palette.border}
          bg={palette.surface}
          boxShadow={palette.shadow}
        >
          <Text fontWeight="700" fontSize="lg">
            {t('products.caucion.name')}
          </Text>
          <Text color={palette.mutedText} mt={2} lineHeight="1.55">
            {t('products.caucion.description')}
          </Text>
          <Button
            mt={5}
            bg={palette.accent}
            color={palette.accentText}
            _hover={{ bg: palette.accentHover }}
            onClick={() => navigate('/app/products/caucion/simulate')}
          >
            {t('products.caucion.simulateCta')}
          </Button>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}
