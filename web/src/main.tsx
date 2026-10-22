import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import "./styles.css";

// Start Pendo once, before the app renders, with an anonymous visitor: an empty id lets Pendo
// reuse the visitor it saved in this browser, or start a new one. AuthProvider identifies the user.
pendo.initialize({
  visitor: {
    id: "",
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
