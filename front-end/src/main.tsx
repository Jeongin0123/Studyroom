
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
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <PageProvider>
          <Landing />
        </PageProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);