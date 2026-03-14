import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Auth from "./Auth.jsx";
import "./index.css";

function Root() {
  const [currentUser, setCurrentUser] = useState(
    () => sessionStorage.getItem("vf_auth") || null
  );

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
```

Con esto, al abrir la URL aparece la pantalla de login. La sesión dura mientras el navegador esté abierto. Si cierran el navegador, deben volver a ingresar.

Para agregar o quitar usuarios simplemente editas el array `USERS` en `Auth.jsx` y haces push a GitHub. Vercel redespliega automáticamente.

---

## Opción C — Variables de entorno en Vercel (más segura)

Si no quieres que las contraseñas estén visibles en el código de GitHub, puedes moverlas a variables de entorno de Vercel.

En el panel de Vercel ve a **Settings → Environment Variables** y agrega:
```
VITE_USER1 = tecnico1:corredor2025
VITE_USER2 = tecnico2:corredor2025
VITE_ADMIN = admin:admin2025
