import { useState } from 'react';
import Login from './components/Login';
import Landing from './components/Landing';
import MyPage from './components/MyPage';
import CreateRoom from './components/CreateRoom';
import StudyRoom from './components/StudyRoom';

type Page = 'login' | 'landing' | 'mypage' | 'createRoom' | 'studyRoom';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('landing');
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
      {currentPage === 'login' && (
        <Login onLogin={handleLogin} onSignup={() => alert('회원가입 페이지로 이동')} />
      )}
      {currentPage === 'landing' && isLoggedIn && (
        <Landing 
          onNavigateToMyPage={() => navigateTo('mypage')} 
          onCreateRoom={() => navigateTo('createRoom')}
          onJoinRoom={() => navigateTo('studyRoom')}
        />
      )}
      {currentPage === 'mypage' && isLoggedIn && (
        <MyPage onBack={() => navigateTo('landing')} />
      )}
      {currentPage === 'createRoom' && isLoggedIn && (
        <CreateRoom 
          onBack={() => navigateTo('landing')}
          onCreate={() => navigateTo('studyRoom')}
        />
      )}
      {currentPage === 'studyRoom' && isLoggedIn && (
        <StudyRoom onLeave={() => navigateTo('landing')} />
      )}
    </div>
  );
}
