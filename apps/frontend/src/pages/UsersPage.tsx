import { Badge, Box, Button, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const users = [
  { name: 'Alex Rivera', email: 'alex@avatir.com', roleKey: 'users.roles.admin' },
  { name: 'Maya Chen', email: 'maya@avatir.com', roleKey: 'users.roles.reviewer' },
  { name: 'Jordan Lee', email: 'jordan@avatir.com', roleKey: 'users.roles.operator' },
] as const;

export function UsersPage() {
  const { t } = useTranslation();

  return (
    <Stack gap={6}>
      <Box>
        <Badge colorPalette="teal" variant="solid" px={3} py={1} borderRadius="full">
          {t('common.crudArea')}
        </Badge>
        <Heading size="xl" mt={4}>
          {t('users.title')}
        </Heading>
        <Text color="whiteAlpha.700" mt={2}>
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
            borderColor="whiteAlpha.200"
            bg="whiteAlpha.50"
          >
            <Text fontWeight="600" fontSize="lg">
              {user.name}
            </Text>
            <Text color="whiteAlpha.700" mt={1}>
              {user.email}
            </Text>
            <Badge mt={4} colorPalette="teal" variant="subtle">
              {t(user.roleKey)}
            </Badge>
          </Box>
        ))}
      </SimpleGrid>

      <Button alignSelf="start" bg="teal.400" color="gray.950">
        {t('users.addUser')}
      </Button>
    </Stack>
  );
}
