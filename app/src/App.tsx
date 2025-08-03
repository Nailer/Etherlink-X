import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from '@/contexts/Web3Provider';
import { MainLayout } from '@/layouts/MainLayout';
import Dashboard from '@/pages/Dashboard';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Web3Provider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* Add more routes here as needed */}
          </Routes>
        </MainLayout>
      </Router>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
    </Web3Provider>
  );
}

export default App;
