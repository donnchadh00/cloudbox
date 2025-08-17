import TopBar from '../components/TopBar';

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
