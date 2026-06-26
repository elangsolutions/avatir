import { gql } from '@apollo/client';

export const APP_INFO_QUERY = gql`
  query AppInfo {
    appInfo {
      name
      tagline
      status
    }
  }
`;
