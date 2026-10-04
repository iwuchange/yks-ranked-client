import { useState } from "react";
import { Crown, Home, LogOut, ScrollText, Swords, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { logoutSummoner } from "../lib/account";
import { formatDelta, LADDER, TIER_META } from "../lib/ranks";
import HomeView from "./HomeView";
import PlayView from "./PlayView";
import MatchHistory from "./MatchHistory";
import ProfileView from "./ProfileView";
import RankEmblem from "./RankEmblem";

const NAV = [
  { id: "home", label: "Ana Sayfa", icon: Home },
  { id: "play", label: "Oyna", icon: Swords },
  { id: "history", label: "Maç Geçmişi", icon: ScrollText },
  { id: "profile", label: "Profil", icon: User },
];

export default function ClientShell() {
  const { profile, matches } = useAuth();
  const [view, setView] = useState("play");
  const headerLig = profile?.tyt_lig || "Unranked";
  const headerLp = profile?.tyt_lp ?? 0;

  return (
    <div className="hex-frame min-h-screen px-3 py-3 md:px-5 md:py-4">
      <div className="gold-border mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1440px] overflow-hidden rounded-sm bg-hex-navy/80">
        <aside className="hidden w-[88px] flex-col items-center border-r border-hex-gold/25 bg-hex-void/50 py-5 lg:flex">
          <div className="mb-8 grid h-12 w-12 place-items-center border border-hex-gold/50 bg-hex-deep">
            <Crown className="h-6 w-6 text-hex-gold" />
          </div>
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`mb-2 flex w-full flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-wider transition ${
                  active
                    ? "bg-hex-gold/15 text-hex-gold"
                    : "text-hex-gold-bright/55 hover:bg-hex-steel/40 hover:text-hex-gold-bright"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
          <div className="mt-auto">
            <button
              type="button"
              onClick={() => logoutSummoner()}
              className="grid h-10 w-10 place-items-center text-hex-gold-bright/50 hover:text-hex-gold"
              title="Çıkış"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-hex-gold/25 bg-hex-deep/70 px-5 py-3">
            <div>
              <p className="font-display text-xs tracking-[0.35em] text-hex-gold">
                YKS RANKED
              </p>
              <h1 className="font-display text-xl font-bold text-hex-gold-bright md:text-2xl">
                Hextech İstemci
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="font-display text-sm text-hex-gold-bright">
                  {profile?.username || "Sihirdar"}
                </p>
                <p className="text-xs text-hex-cyan">
                  TYT · {headerLig} · {headerLp} LP
                </p>
              </div>
              {profile?.profile_img ? (
                <img
                  src={profile.profile_img}
                  alt=""
                  className="h-12 w-12 border border-hex-gold/40 object-cover"
                />
              ) : (
                <RankEmblem lig={headerLig} size={52} />
              )}
            </div>
          </header>

          <nav className="flex gap-1 border-b border-hex-gold/15 px-3 py-2 lg:hidden">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`flex-1 px-2 py-2 text-[11px] uppercase tracking-wide ${
                  view === item.id
                    ? "border-b-2 border-hex-gold text-hex-gold"
                    : "text-hex-gold-bright/60"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => logoutSummoner()}
              className="px-2 py-2 text-[11px] uppercase tracking-wide text-hex-gold-bright/60"
            >
              Çıkış
            </button>
          </nav>

          <main className="grid flex-1 gap-4 p-4 lg:grid-cols-[1fr_320px] lg:p-6">
            <section className="min-w-0">
              {view === "home" && <HomeView onPlay={() => setView("play")} />}
              {view === "play" && <PlayView />}
              {view === "history" && <MatchHistory />}
              {view === "profile" && <ProfileView />}
            </section>

            <aside className="space-y-4">
              <div className="gold-border bg-hex-deep/80 p-4">
                <h3 className="mb-3 font-display text-lg text-hex-gold">Ligler</h3>
                <div className="grid grid-cols-5 gap-2">
                  {TIER_META.map((tier) => {
                    const sample = LADDER.find((r) => r.tier === tier.id);
                    const active = headerLig.startsWith(tier.name);
                    return (
                      <div
                        key={tier.id}
                        title={tier.name}
                        className={`grid place-items-center rounded-sm border p-1 ${
                          active
                            ? "border-hex-gold bg-hex-gold/10"
                            : "border-hex-gold/20 opacity-70"
                        }`}
                      >
                        <RankEmblem lig={sample.label} size={40} />
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-hex-gold-bright/50">
                  Demir 4’ten Şampiyon’a LP ile yüksel. İlk deneme Gümüş 4’e yerleştirir.
                </p>
              </div>

              <div className="gold-border bg-hex-deep/80 p-4">
                <h3 className="mb-3 font-display text-lg text-hex-gold">Son maçlar</h3>
                {matches.slice(0, 3).length === 0 ? (
                  <p className="text-xs text-hex-gold-bright/50">Kayıt yok.</p>
                ) : (
                  <ul className="space-y-2">
                    {matches.slice(0, 3).map((match) => (
                      <li
                        key={match.id}
                        className="flex items-center justify-between border border-hex-gold/15 px-3 py-2 text-sm"
                      >
                        <span className="text-hex-gold-bright/80">{match.mode}</span>
                        <span
                          className={
                            match.result === "LOSS" ? "text-rose-400" : "text-hex-cyan"
                          }
                        >
                          {formatDelta(match.delta)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={() => setView("history")}
                  className="mt-3 w-full border border-hex-gold/30 py-2 text-xs uppercase tracking-widest text-hex-gold hover:bg-hex-gold/10"
                >
                  Tüm geçmiş
                </button>
              </div>
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
}
