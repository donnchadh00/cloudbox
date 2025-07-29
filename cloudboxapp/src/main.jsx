import React from 'react'
import ReactDOM from 'react-dom/client'
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify'
import App from './App.jsx'
import './index.css'
import amplifyConfig from './amplifyconfiguration.json'
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(amplifyConfig)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Authenticator>
      <App />
    </Authenticator>
  </React.StrictMode>
)
