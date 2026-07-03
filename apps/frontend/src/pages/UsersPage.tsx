import { Badge, Box, Button, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../theme/app-theme';

const users = [
  { name: 'Alex Rivera', email: 'alex@avatir.com', roleKey: 'users.roles.admin' },
  { name: 'Maya Chen', email: 'maya@avatir.com', roleKey: 'users.roles.reviewer' },
  { name: 'Jordan Lee', email: 'jordan@avatir.com', roleKey: 'users.roles.operator' },
] as const;

export function UsersPage() {
  const { t } = useTranslation();
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
          {t('common.crudArea')}
        </Badge>
        <Heading size="xl" mt={4}>
          {t('users.title')}
        </Heading>
        <Text color={palette.mutedText} mt={2}>
          {t('users.description')}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
        {users.map((user) => (
          <Box
            key={user.email}
            p={5}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={palette.border}
            bg={palette.surface}
            boxShadow={palette.shadow}
          >
            <Text fontWeight="600" fontSize="lg">
              {user.name}
            </Text>
            <Text color={palette.mutedText} mt={1}>
              {user.email}
            </Text>
            <Badge
              mt={4}
              bg={palette.accentSoft}
              color={palette.accentText}
              variant="subtle"
              borderWidth="1px"
              borderColor={palette.border}
            >
              {t(user.roleKey)}
            </Badge>
          </Box>
        ))}
      </SimpleGrid>

      <Button alignSelf="start" bg={palette.accent} color={palette.accentText}>
        {t('users.addUser')}
      </Button>
    </Stack>
  );
}
