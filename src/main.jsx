import { StrictMode } from "react";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Auth from "./Auth.jsx";
import "./index.css";

function Root() {
  const stored = sessionStorage.getItem("vf_auth");
  const [currentUser, setCurrentUser] = useState(stored || null);

  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} />;
  }
  return <App currentUser={currentUser} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
