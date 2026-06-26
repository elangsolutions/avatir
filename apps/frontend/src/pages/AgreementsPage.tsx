import { Badge, Box, Button, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';

const agreements = [
  { title: 'Primary servicing', client: 'Northwind Health', status: 'Active', amount: '$42,000' },
  { title: 'Review cycle', client: 'Blue Peak', status: 'Draft', amount: '$18,500' },
  { title: 'Renewal plan', client: 'Aster Labs', status: 'Paused', amount: '$63,250' },
];

export function AgreementsPage() {
  return (
    <Stack gap={6}>
      <Box>
        <Badge colorPalette="teal" variant="solid" px={3} py={1} borderRadius="full">
          CRUD area
        </Badge>
        <Heading size="xl" mt={4}>
          Agreements
        </Heading>
        <Text color="whiteAlpha.700" mt={2}>
          This placeholder view gives the agreements workflow a clean starting point.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
        {agreements.map((agreement) => (
          <Box
            key={agreement.title}
            p={5}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            bg="rgba(12, 18, 31, 0.92)"
          >
            <Text fontWeight="600" fontSize="lg">
              {agreement.title}
            </Text>
            <Text color="whiteAlpha.700" mt={1}>
              {agreement.client}
            </Text>
            <Text mt={4} fontSize="2xl" fontWeight="700">
              {agreement.amount}
            </Text>
            <Badge mt={4} colorPalette="teal" variant="subtle">
              {agreement.status}
            </Badge>
          </Box>
        ))}
      </SimpleGrid>

      <Button alignSelf="start" bg="teal.400" color="gray.950">
        Add agreement
      </Button>
    </Stack>
  );
}
