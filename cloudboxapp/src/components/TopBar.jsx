import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function TopBar() {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const session = await fetchAuthSession();
        const email = session.tokens?.idToken?.payload?.email;
        if (email) setUserEmail(email);
      } catch (err) {
        console.error('Failed to get user email:', err);
      }
    };

    getUserEmail();
  }, []);

  return (
    <header className="bg-blue-600 text-white px-6 py-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-semibold">📁 CloudBox </h1>
      <span className="text-sm">{userEmail}</span>
    </header>
  );
}
