import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'signup'>('signup');

  return (
    <div className="size-full">
      {currentPage === 'login' ? (
        <LoginPage onNavigateToSignup={() => setCurrentPage('signup')} />
      ) : (
        <SignupPage onNavigateToLogin={() => setCurrentPage('login')} />
      )}
    </div>
  );
}
