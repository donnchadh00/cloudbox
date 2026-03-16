import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';

export default function TopBar() {
  const [userEmail, setUserEmail] = useState('');
  const { signOut } = useAuthenticator();

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
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-blue-200/60">
          <img
            src="/cloudbox.svg"
            alt="CloudBox logo"
            className="h-6 w-6"
          />
        </div>
        <div className="leading-tight">
          <h1 className="text-xl font-semibold tracking-tight">CloudBox</h1>
          <p className="text-xs text-blue-100">Secure file manager</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm hidden sm:inline">{userEmail}</span>
        <button
          onClick={signOut}
          className="px-3 py-1 bg-white text-blue-600 text-sm rounded hover:bg-gray-100 transition"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
