import { useState } from "react";
import { Crown, Lock, Mail, User } from "lucide-react";
import { loginSummoner, registerSummoner } from "../lib/account";

export default function LoginScreen() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "register") {
        await registerSummoner({ username, email, password });
      } else {
        await loginSummoner(email, password);
      }
    } catch (err) {
      const code = err?.code || "";
      if (err?.message === "Bu sihirdar adı zaten alınmış!") {
        setError(err.message);
      } else if (code.includes("email-already-in-use")) {
        setError("Bu e-posta ile zaten bir hesap var.");
      } else if (code.includes("invalid-credential") || code.includes("wrong-password")) {
        setError("E-posta veya şifre hatalı.");
      } else if (code.includes("weak-password")) {
        setError("Şifre en az 6 karakter olmalı.");
      } else {
        setError(err.message || "Giriş başarısız.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="hex-frame flex min-h-screen items-center justify-center px-4 py-8">
      <div className="gold-border w-full max-w-md bg-hex-navy/90 p-8 shadow-hex">
        <div className="mb-6 flex flex-col items-center">
          <div className="grid h-14 w-14 place-items-center border border-hex-gold/50 bg-hex-deep">
            <Crown className="h-7 w-7 text-hex-gold" />
          </div>
          <p className="mt-4 font-display text-xs tracking-[0.4em] text-hex-gold">
            YKS RANKED
          </p>
          <h1 className="font-display text-2xl text-hex-gold-bright">Sihirdar Girişi</h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-hex-cyan">
            Sezon Başlangıcı Yaması · v1.0
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`py-2 text-xs uppercase tracking-[0.2em] ${
              mode === "login"
                ? "border border-hex-gold bg-hex-gold text-hex-void"
                : "border border-hex-gold/40 text-hex-gold-bright/70"
            }`}
          >
            Giriş
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`py-2 text-xs uppercase tracking-[0.2em] ${
              mode === "register"
                ? "border border-hex-gold bg-hex-gold text-hex-void"
                : "border border-hex-gold/40 text-hex-gold-bright/70"
            }`}
          >
            Kayıt
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "register" && (
            <label className="block">
              <span className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-hex-gold/80">
                <User className="h-3.5 w-3.5" /> Sihirdar adı
              </span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-hex-gold/35 bg-hex-void/70 px-3 py-2.5 text-hex-gold-bright outline-none focus:border-hex-cyan"
                placeholder="Benzersiz kullanıcı adı"
              />
            </label>
          )}
          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-hex-gold/80">
              <Mail className="h-3.5 w-3.5" /> E-posta
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-hex-gold/35 bg-hex-void/70 px-3 py-2.5 text-hex-gold-bright outline-none focus:border-hex-cyan"
            />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-hex-gold/80">
              <Lock className="h-3.5 w-3.5" /> Şifre
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-hex-gold/35 bg-hex-void/70 px-3 py-2.5 text-hex-gold-bright outline-none focus:border-hex-cyan"
            />
          </label>
          {error && (
            <p className="border border-rose-400/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full border border-hex-gold bg-gradient-to-b from-hex-gold to-hex-gold-dim py-3 font-display text-sm tracking-[0.2em] text-hex-void hover:brightness-110 disabled:opacity-60"
          >
            {busy ? "BAĞLANIYOR..." : mode === "register" ? "SIHIRDAR OLUŞTUR" : "GİRİŞ YAP"}
          </button>
        </form>
      </div>
    </div>
  );
}
