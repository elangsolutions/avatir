import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'sign-in' | 'sign-up';

const benefits = [
  'Track assurance deals from one mobile-first workspace.',
  'Keep users and agreements organized with a clean data model.',
  'Prepare Google sign-in now and wire credentials later.',
];

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [status, setStatus] = useState('Ready to connect Google sign-in.');
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/app');
  };

  return (
    <Box minH="100vh" bg="gray.950" color="white" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
      <Container maxW="7xl" px={0}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 6, lg: 10 }} alignItems="center">
          <Stack gap={6} order={{ base: 2, lg: 1 }}>
            <Box>
              <Text fontSize="sm" letterSpacing="0.22em" textTransform="uppercase" color="teal.300">
                AVATIR
              </Text>
              <Heading size="2xl" mt={3} lineHeight="1.05">
                Assurance deal management that feels premium on mobile.
              </Heading>
            </Box>

            <Text color="whiteAlpha.700" fontSize="lg" maxW="xl">
              Sign in or create an account to manage users and agreements with a focused, polished workspace.
            </Text>

            <Stack gap={3}>
              {benefits.map((item) => (
                <HStack key={item} align="start" gap={3}>
                  <Box w="10px" h="10px" mt="10px" borderRadius="full" bg="teal.300" />
                  <Text color="whiteAlpha.800">{item}</Text>
                </HStack>
              ))}
            </Stack>

            <Box
              p={5}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="whiteAlpha.200"
              bg="whiteAlpha.50"
            >
              <Text fontSize="sm" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.18em">
                Quick status
              </Text>
              <Text fontWeight="600" mt={2}>
                Mobile-first shell ready
              </Text>
              <Text color="whiteAlpha.700" mt={1}>
                The first pass includes the auth screen, Google placeholder, and navigation for users and agreements.
              </Text>
            </Box>
          </Stack>

          <Box
            order={{ base: 1, lg: 2 }}
            p={{ base: 4, md: 6 }}
            borderRadius="3xl"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            bg="rgba(12, 18, 31, 0.92)"
            boxShadow="2xl"
            backdropFilter="blur(18px)"
          >
            <Stack gap={5}>
              <Box>
                <Text fontSize="sm" color="teal.300" textTransform="uppercase" letterSpacing="0.18em">
                  Authentication
                </Text>
                <Heading size="lg" mt={2}>
                  {mode === 'sign-in' ? 'Welcome back' : 'Create your AVATIR account'}
                </Heading>
                <Text color="whiteAlpha.700" mt={2}>
                  {mode === 'sign-in'
                    ? 'Use the existing account flow or switch to signup to create a new workspace identity.'
                    : 'Create a profile for your team and get ready to manage assurance deals.'}
                </Text>
              </Box>

              <HStack gap={3}>
                <Button
                  flex="1"
                  bg={mode === 'sign-in' ? 'teal.400' : 'whiteAlpha.100'}
                  color={mode === 'sign-in' ? 'gray.950' : 'white'}
                  _hover={{ bg: mode === 'sign-in' ? 'teal.300' : 'whiteAlpha.200' }}
                  onClick={() => setMode('sign-in')}
                >
                  Sign in
                </Button>
                <Button
                  flex="1"
                  bg={mode === 'sign-up' ? 'teal.400' : 'whiteAlpha.100'}
                  color={mode === 'sign-up' ? 'gray.950' : 'white'}
                  _hover={{ bg: mode === 'sign-up' ? 'teal.300' : 'whiteAlpha.200' }}
                  onClick={() => setMode('sign-up')}
                >
                  Sign up
                </Button>
              </HStack>

              <Stack gap={4}>
                {mode === 'sign-up' && (
                  <Box>
                    <Text fontSize="sm" mb={2} color="whiteAlpha.700">
                      Full name
                    </Text>
                    <Input bg="whiteAlpha.50" borderColor="whiteAlpha.200" placeholder="Alex Rivera" />
                  </Box>
                )}

                <Box>
                  <Text fontSize="sm" mb={2} color="whiteAlpha.700">
                    Email
                  </Text>
                  <Input bg="whiteAlpha.50" borderColor="whiteAlpha.200" placeholder="you@company.com" />
                </Box>

                <Box>
                  <Text fontSize="sm" mb={2} color="whiteAlpha.700">
                    Password
                  </Text>
                  <Input bg="whiteAlpha.50" borderColor="whiteAlpha.200" type="password" placeholder="••••••••" />
                </Box>
              </Stack>

              <Button bg="teal.400" color="gray.950" size="lg" onClick={handleContinue}>
                {mode === 'sign-in' ? 'Continue to AVATIR' : 'Create account'}
              </Button>

              <Button
                variant="outline"
                borderColor="whiteAlpha.300"
                color="white"
                _hover={{ bg: 'whiteAlpha.100' }}
                onClick={() => setStatus('Google sign-in will be connected when credentials are added.')}
              >
                Continue with Google
              </Button>

              <Text fontSize="sm" color="whiteAlpha.600">
                {status}
              </Text>
            </Stack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
