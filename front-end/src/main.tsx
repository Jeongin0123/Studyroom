
  // import { createRoot } from "react-dom/client";
  // // import App from "./App.tsx";
  // import Landing from "./Landing.tsx"
  

  // createRoot(document.getElementById("root")!).render(<Landing />);
  

import React from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import Landing from "./Landing";
import { PageProvider } from "./components/PageContext";
import { UserProvider } from "./components/UserContext";
import { RoomProvider } from "./components/RoomContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <PageProvider>
        <RoomProvider>
          <Landing />
        </RoomProvider>
      </PageProvider>
    </UserProvider>
  </React.StrictMode>
);