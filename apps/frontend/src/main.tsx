import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { apolloClient } from './apollo';
import { ApolloProvider } from '@apollo/client/react';
import './i18n';
import { AppThemeProvider } from './theme/app-theme';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <AppThemeProvider>
        <ApolloProvider client={apolloClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ApolloProvider>
      </AppThemeProvider>
    </ChakraProvider>
  </React.StrictMode>,
);
