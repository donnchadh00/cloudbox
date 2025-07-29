import { useAuthenticator } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FileManager from './FileManager';

function App() {
  const [count, setCount] = useState(0)
  const { signOut } = useAuthenticator();

  return (
    <>
      <FileManager />
      <button onClick={signOut}>Sign out</button>
    </>
  )
}

export default App
