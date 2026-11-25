const assert = require('node:assert/strict');
const { test } = require('node:test');
const { BadGatewayException } = require('@nestjs/common');
const {
  QuoteSimulatorService,
  rankQuotes,
  requestLiveQuotes,
} = require('../dist/agreements/quote-simulator.service.js');

const input = {
  policyKind: 'OFERTA',
  policyFormat: 'ELECTRONICA',
  policyAmount: 100_000,
  currency: 'ARS',
};

test('mock mode returns five ranked quotes and marks them as simulated', async () => {
  const config = { get: () => undefined };
  const result = await new QuoteSimulatorService(config).simulate(input);

  assert.equal(result.source, 'mock');
  assert.equal(result.quotes.length, 5);
  assert.deepEqual(
    result.quotes.map((quote) => quote.premium),
    [...result.quotes.map((quote) => quote.premium)].sort((left, right) => left - right),
  );
  assert.ok(result.quotes.every((quote) => quote.currency === 'ARS'));
});

test('live requests send the agreement data and return the five lowest valid quotes', async () => {
  const rows = [
    { company: 'A', premium: 50, currency: 'ARS' },
    { company: 'B', premium: 20, currency: 'ARS' },
    { company: 'C', premium: 10, currency: 'ARS' },
    { company: 'D', premium: 40, currency: 'ARS' },
    { company: 'E', premium: 30, currency: 'ARS' },
    { company: 'F', premium: 5, currency: 'ARS' },
    { company: 'f', premium: 5.5, currency: 'ARS' },
    { company: 'Decimal offer', premium: 11.29, currency: 'ARS' },
    { company: 'USD offer', premium: 1, currency: 'USD' },
    { company: 'Expired offer', premium: 2, currency: 'ARS', validUntil: '2000-01-01T00:00:00.000Z' },
  ];
  let requestBody = '';
  const result = await requestLiveQuotes(
    input,
    'https://insurer.example/quotes',
    'provider-secret',
    async (_url, init) => {
      requestBody = String(init.body);
      assert.equal(new Headers(init.headers).get('authorization'), 'Bearer provider-secret');
      return new Response(JSON.stringify({ quotes: rows }), { status: 200 });
    },
  );

  assert.deepEqual(JSON.parse(requestBody), input);
  assert.equal(result.source, 'live');
  assert.deepEqual(result.quotes.map((quote) => quote.premium), [5, 10, 11.29, 20, 30]);
  assert.equal(result.quotes.filter((quote) => quote.company.toLowerCase() === 'f').length, 1);
});

test('malformed provider payloads and rows without comparable quotes fail validation', () => {
  assert.throws(() => rankQuotes('not-an-array'), BadGatewayException);
  assert.throws(
    () => rankQuotes([{ company: 'Invalid price', premium: '10', currency: 'ARS' }], 'ARS'),
    BadGatewayException,
  );
});

test('live provider failures are surfaced and never become mock quotes', async () => {
  await assert.rejects(
    requestLiveQuotes(input, 'https://insurer.example/quotes', undefined, async () =>
      new Response('unavailable', { status: 503 }),
    ),
    BadGatewayException,
  );
});