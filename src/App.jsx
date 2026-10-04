import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginScreen from "./components/LoginScreen";
import ClientShell from "./components/ClientShell";

function Gate() {
  const { ready, firebaseUser } = useAuth();
  if (!ready) {
    return (
      <div className="hex-frame grid min-h-screen place-items-center">
        <p className="font-display tracking-[0.3em] text-hex-gold">YÜKLENİYOR</p>
      </div>
    );
  }
  return firebaseUser ? <ClientShell /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
