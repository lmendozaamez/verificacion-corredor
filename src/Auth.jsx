import { useState } from "react";

const USERS = [
  process.env.VITE_USER1,
  process.env.VITE_USER2,
  process.env.VITE_ADMIN,
].filter(Boolean).map(entry => {
  const [user, pass] = entry.split(":");
  return { user, pass };
});

export default function Auth({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = () => {
    const found = USERS.find(u => u.user === user.trim() && u.pass === pass);
    if (found) {
      sessionStorage.setItem("vf_auth", found.user);
      onLogin(found.user);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080808",
      fontFamily: "'Courier New', Courier, monospace",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: 320, padding: 32, background: "#0d0d0d", border: "1px solid #1e1e1e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <span style={{ background: "#c00000", color: "#fff", fontWeight: 900, fontSize: 13, padding: "3px 8px", letterSpacing: 2 }}>MMG</span>
          <span style={{ color: "#444", fontSize: 11, letterSpacing: 4 }}>AGIA Solutions</span>
        </div>
        <div style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 900, marginBottom: 4 }}>Acceso al Sistema</div>
        <div style={{ color: "#333", fontSize: 10, letterSpacing: 3, marginBottom: 28 }}>VIDEO FORENSE · CORREDOR MINERO SUR</div>

        <div style={{ color: "#444", fontSize: 9, letterSpacing: 3, marginBottom: 6 }}>USUARIO</div>
        <input
          style={{ width: "100%", background: "#0a0a0a", border: `1px solid ${error ? "#c00000" : "#1e1e1e"}`, color: "#e2e8f0", padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 12, boxSizing: "border-box" }}
          placeholder="usuario"
          value={user}
          onChange={e => setUser(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          autoCapitalize="none"
        />

        <div style={{ color: "#444", fontSize: 9, letterSpacing: 3, marginBottom: 6 }}>CONTRASEÑA</div>
        <input
          type="password"
          style={{ width: "100%", background: "#0a0a0a", border: `1px solid ${error ? "#c00000" : "#1e1e1e"}`, color: "#e2e8f0", padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 20, boxSizing: "border-box" }}
          placeholder="••••••••"
          value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />

        {error && (
          <div style={{ color: "#f87171", fontSize: 11, marginBottom: 12, letterSpacing: 1 }}>
            ✗ Usuario o contraseña incorrectos
          </div>
        )}

        <button
          onClick={handleLogin}
          style={{ width: "100%", background: "#c00000", border: "none", color: "#fff", padding: 12, fontSize: 11, fontWeight: 700, letterSpacing: 3, cursor: "pointer", fontFamily: "inherit" }}
        >
          INGRESAR →
        </button>
      </div>
    </div>
  );
}
