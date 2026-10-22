import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import "./styles.css";

// Starts Pendo (loaded by the snippet in index.html) once, before the app renders. The
// empty visitor id resumes the visitor Pendo stored on an earlier visit, or starts an
// anonymous one; AuthProvider identifies the user once they're signed in.
pendo.initialize({ visitor: { id: "" } });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
