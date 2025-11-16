
// import { createRoot } from "react-dom/client";
// import App from "./App.tsx";

// createRoot(document.getElementById("root")!).render(<App />);
  

// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

import App from "./App"; // ✅ App.tsx를 렌더링
import { PageProvider } from "./components/PageContext";
import { UserProvider } from "./components/UserContext";
import { RoomProvider } from "./components/RoomContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <PageProvider>
        <Landing />
      </PageProvider>
    </UserProvider>
  </React.StrictMode>
);

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <UserProvider>
//         <PageProvider>
//           <App /> {/* ✅ App 안의 Routes가 이제 동작함 */}
//         </PageProvider>
//       </UserProvider>
//     </BrowserRouter>
//   </React.StrictMode>
// );



