import { Activity, ChevronRight, Flame, Trophy } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatDelta } from "../lib/ranks";

export default function HomeView({ onPlay }) {
  const { profile, matches } = useAuth();
  const wins = matches.filter((m) => m.result === "WIN" || m.result === "PLACEMENT").length;
  const rate = matches.length ? Math.round((wins / matches.length) * 100) : 0;
  const lpSum = matches.slice(0, 8).reduce((s, m) => s + (Number(m.delta) || 0), 0);

  return (
    <div className="space-y-5">
      <div className="gold-border relative overflow-hidden bg-hex-panel/80 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-hex-gold">
          Sezon 2026 · Split 1 · v1.0
        </p>
        <h2 className="mt-2 font-display text-3xl text-hex-gold-bright">
          {profile?.username ? `Tekrar hoş geldin, ${profile.username}` : "Sıralamaya geri dön"}
        </h2>
        <p className="mt-2 max-w-xl text-sm text-hex-gold-bright/70">
          Netlerini gir, Oyna’ya bas, sonucu anında gör. Kuyruk yok — yalnızca sen ve netlerin.
        </p>
        <button
          type="button"
          onClick={onPlay}
          className="mt-5 inline-flex items-center gap-2 border border-hex-gold bg-hex-gold/15 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-hex-gold hover:bg-hex-gold/25"
        >
          Oynama ekranı <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Son LP", value: formatDelta(lpSum), icon: Flame },
          { label: "Galibiyet", value: `%${rate}`, icon: Trophy },
          { label: "Deneme", value: String(matches.length), icon: Activity },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="gold-border bg-hex-deep/80 p-4">
              <Icon className="mb-2 h-5 w-5 text-hex-cyan" />
              <p className="font-display text-2xl text-hex-gold">{stat.value}</p>
              <p className="text-xs uppercase tracking-widest text-hex-gold-bright/55">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
