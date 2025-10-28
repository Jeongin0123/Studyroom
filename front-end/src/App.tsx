import { useState } from 'react';
// import './App.css'
import Studyroom from "./Studyroom.tsx";
import Mypage from "./Mypage.tsx";
import Popup from "./Popup.tsx";
import { Button } from './components/ui/button';

type Page = 'home' | 'studyroom' | 'mypage' | 'popup';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <>
      {currentPage === 'home' && (
        <div className="space-y-4">
          <h1>hello</h1>
          <div className="space-x-2">
            <Button onClick={() => setCurrentPage('studyroom')}>Studyroom</Button>
            <Button onClick={() => setCurrentPage('mypage')}>Mypage</Button>
            <Button onClick={() => setCurrentPage('popup')}>Popup</Button>
          </div>
        </div>
      )}

      {currentPage === 'studyroom' && <Studyroom />}
      {currentPage === 'mypage' && <Mypage />}
      {currentPage === 'popup' && <Popup />}
    </>
  )
}

export default App;
