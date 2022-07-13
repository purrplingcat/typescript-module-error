import React from 'react'
import ReactDOM from 'react-dom/client'
import client from '@/connections/apollo'
import App from './App'
import { ApolloProvider } from '@apollo/client';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
)
