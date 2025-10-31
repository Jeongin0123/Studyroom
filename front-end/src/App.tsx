import { useState } from 'react';
// import './App.css'
import Studyroom from "./M_Studyroom.tsx";
import Mypage from "./Mypage.tsx";
import Popup from "./Popup.tsx";
import Landing from "./Landing.tsx";
// import Login from "./Login.tsx";
import { Button } from './components/ui/button';



// type Page = 'home' | 'studyroom' | 'mypage' | 'popup' | 'landing' | 'login';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <>
      <Landing />
    </>
    // <>
    //   {currentPage === 'home' && (
    //     <div className="space-y-4">
    //       <>
    //       <div className="space-x-2">
    //         <Button onClick={() => setCurrentPage('studyroom')}>Studyroom</Button>
    //         <Button onClick={() => setCurrentPage('mypage')}>Mypage</Button>
    //         <Button onClick={() => setCurrentPage('popup')}>Popup</Button>
    //         <Button onClick={() => setCurrentPage('landing')}>Landing</Button>
    //         <Button onClick={() => setCurrentPage('login')}>Login</Button>

    //       </div>
    //     </div>
    //   )}

    //   {currentPage === 'studyroom' && <Studyroom />}
    //   {currentPage === 'mypage' && <Mypage />}
    //   {currentPage === 'popup' && <Popup />}
    //   {currentPage === 'landing' && <Landing />}
    //   {currentPage === 'login' && <Login />}
    // </>
  )
}

export default App;

