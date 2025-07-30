import { useAuthenticator } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import './App.css'
import FileManager from './FileManager';

function App() {
  const [count, setCount] = useState(0)
  const { signOut } = useAuthenticator();

  return (
    <>
      <FileManager />
      <button
        onClick={signOut}
        className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        Sign out
      </button>
    </>
  )
}

export default App
