import FileManager from './FileManager';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layout/MainLaoyout';

function App() {
  return (
    <MainLayout>
      <FileManager />
      <Toaster position="bottom-center" reverseOrder={false} />
    </MainLayout>
  )
}

export default App
