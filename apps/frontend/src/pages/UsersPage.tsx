import { Badge, Box, Button, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';

const users = [
  { name: 'Alex Rivera', email: 'alex@avatir.com', role: 'Admin' },
  { name: 'Maya Chen', email: 'maya@avatir.com', role: 'Reviewer' },
  { name: 'Jordan Lee', email: 'jordan@avatir.com', role: 'Operator' },
];

export function UsersPage() {
  return (
    <Stack gap={6}>
      <Box>
        <Badge colorPalette="teal" variant="solid" px={3} py={1} borderRadius="full">
          CRUD area
        </Badge>
        <Heading size="xl" mt={4}>
          Users
        </Heading>
        <Text color="whiteAlpha.700" mt={2}>
          This is the first placeholder view for the users management flow.
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
              {user.role}
            </Badge>
          </Box>
        ))}
      </SimpleGrid>

      <Button alignSelf="start" bg="teal.400" color="gray.950">
        Add user
      </Button>
    </Stack>
  );
}
