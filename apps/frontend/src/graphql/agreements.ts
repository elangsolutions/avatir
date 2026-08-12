import { gql } from '@apollo/client';

export const AGREEMENTS_QUERY = gql`
  query Agreements {
    agreements {
      id
      title
      clientName
      amount
      currency
      status
      notes
      createdAt
    }
  }
`;

export const CREATE_AGREEMENT_MUTATION = gql`
  mutation CreateAgreement($input: CreateAgreementInput!) {
    createAgreement(input: $input) {
      id
      title
      clientName
      amount
      currency
      status
      notes
      createdAt
    }
  }
`;

export type AgreementRecord = {
  id: string;
  title: string;
  clientName: string;
  amount: number;
  currency: string;
  status: string;
  notes?: string | null;
  createdAt: string;
};

export type AgreementsQueryData = {
  agreements: AgreementRecord[];
};

export type CreateAgreementMutationData = {
  createAgreement: AgreementRecord;
};
