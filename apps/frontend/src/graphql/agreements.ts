import { gql } from '@apollo/client';

export const AGREEMENT_FIELDS = gql`
  fragment AgreementFields on Agreement {
    id
    title
    clientName
    amount
    currency
    status
    notes
    ownerId
    agentId
    createdAt
    updatedAt
  }
`;

export const AGREEMENTS_QUERY = gql`
  query Agreements {
    agreements {
      ...AgreementFields
    }
  }
  ${AGREEMENT_FIELDS}
`;

export type AgreementSimulationInput = {
  policyKind: 'OFERTA' | 'ADJUDICACION';
  policyFormat: 'ELECTRONICA' | 'ELECTRONICA_CERTIFICADA' | 'FISICA';
  policyAmount: number;
  currency: 'ARS' | 'USD';
  applicant: {
    name: string;
    taxId: string;
    address?: string;
    ownerEmail?: string;
  };
  beneficiary: {
    name: string;
    taxId: string;
    address?: string;
  };
  tender: {
    processCode: string;
    fileNumber?: string;
    bidOpeningAt?: string;
    purpose: string;
    purchaseOrder?: string;
    billingPeriod?: string;
  };
};

export type AgreementQuoteSimulationData = {
  simulateAgreementQuotes: {
    source: 'mock' | 'live';
    simulatedAt: string;
    quotes: Array<{
      company: string;
      premium: number;
      currency: string;
      validUntil?: string | null;
    }>;
  };
};

export const SIMULATE_AGREEMENT_QUOTES_MUTATION = gql`
  mutation SimulateAgreementQuotes($input: AgreementSimulationInput!) {
    simulateAgreementQuotes(input: $input) {
      source
      simulatedAt
      quotes {
        company
        premium
        currency
        validUntil
      }
    }
  }
`;

export type CreateAgreementMutationData = {
  createAgreement: {
    id: string;
    title: string;
    clientName: string;
    amount: number;
    currency: string;
    status: string;
    notes?: string | null;
    ownerId?: string | null;
    agentId?: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export const CREATE_AGREEMENT_MUTATION = gql`
  mutation CreateAgreement($input: CreateAgreementInput!) {
    createAgreement(input: $input) {
      ...AgreementFields
    }
  }
  ${AGREEMENT_FIELDS}
`;

export const UPDATE_AGREEMENT_MUTATION = gql`
  mutation UpdateAgreement($id: String!, $input: UpdateAgreementInput!) {
    updateAgreement(id: $id, input: $input) {
      ...AgreementFields
    }
  }
  ${AGREEMENT_FIELDS}
`;

export const DELETE_AGREEMENT_MUTATION = gql`
  mutation DeleteAgreement($id: String!) {
    deleteAgreement(id: $id)
  }
`;
