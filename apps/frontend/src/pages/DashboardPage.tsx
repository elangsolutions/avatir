import { Badge, Box, Button, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { APP_INFO_QUERY } from '../graphql/app';
import { useQuery } from '@apollo/client/react';

type AppInfoQueryData = {
  appInfo?: {
    name: string;
    tagline?: string | null;
    status?: string | null;
  } | null;
};

const metrics = [
  { label: 'Active users', value: '12', detail: 'Ready for CRUD wiring' },
  { label: 'Agreements', value: '24', detail: 'Mobile-ready flow planned' },
  { label: 'Google auth', value: 'Placeholder', detail: 'Credentials come later' },
];

export function DashboardPage() {
  const { data } = useQuery<AppInfoQueryData>(APP_INFO_QUERY);

  return (
    <Stack gap={6}>
      <Box>
        <Badge colorPalette="teal" variant="solid" px={3} py={1} borderRadius="full">
          Workspace overview
        </Badge>
        <Heading size="xl" mt={4}>
          {data?.appInfo?.name ?? 'AVATIR'}
        </Heading>
        <Text color="whiteAlpha.700" mt={2} maxW="2xl">
          {data?.appInfo?.tagline ?? 'Mobile-first assurance deal management'}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        {metrics.map((metric) => (
          <Box
            key={metric.label}
            p={5}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            bg="whiteAlpha.50"
          >
            <Text color="whiteAlpha.700" fontSize="sm" textTransform="uppercase" letterSpacing="0.16em">
              {metric.label}
            </Text>
            <Heading size="lg" mt={3}>
              {metric.value}
            </Heading>
            <Text color="whiteAlpha.700" mt={2}>
              {metric.detail}
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
          <Text fontWeight="600">Next steps</Text>
          <Text color="whiteAlpha.700" mt={2}>
            Add list, create, edit, and detail flows for users and agreements. The shell is already mobile-first and ready for data.
          </Text>
        </Box>

        <Box
          p={5}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          bg="rgba(12, 18, 31, 0.92)"
        >
          <Text fontWeight="600">Google auth</Text>
          <Text color="whiteAlpha.700" mt={2}>
            The login button is in place now. The next backend step is wiring real OAuth credentials and a session token.
          </Text>
          <Button mt={4} bg="teal.400" color="gray.950">
            Review auth setup
          </Button>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}
