import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatDelta, resultLabel } from "../lib/ranks";

function when(ts) {
  const date = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MatchHistory() {
  const { matches } = useAuth();
  const [openId, setOpenId] = useState(null);

  return (
    <div className="gold-border bg-hex-panel/70">
      <div className="border-b border-hex-gold/20 px-5 py-4">
        <h2 className="font-display text-2xl text-hex-gold-bright">Maç Geçmişi</h2>
        <p className="text-xs uppercase tracking-widest text-hex-gold/70">
          {matches.length} deneme kaydı
        </p>
      </div>
      {matches.length === 0 ? (
        <p className="px-5 py-8 text-sm text-hex-gold-bright/55">
          Henüz deneme yok. Oyna sekmesinden netlerini gir.
        </p>
      ) : (
        <ul>
          {matches.map((match) => {
            const open = openId === match.id;
            const win = match.result === "WIN" || match.result === "PLACEMENT";
            const nets = match.nets || {};
            return (
              <li key={match.id} className="border-b border-hex-gold/10 last:border-0">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : match.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-hex-gold/5"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-[7.5rem] text-center text-xs font-bold uppercase tracking-widest ${
                        win ? "text-hex-cyan" : "text-rose-400"
                      }`}
                    >
                      {resultLabel(match.result)}
                    </span>
                    <div>
                      <p className="font-medium text-hex-gold-bright">{match.mode}</p>
                      <p className="text-xs text-hex-gold-bright/55">
                        {Number(match.totalNet).toFixed(2)} net · {match.toLig} {match.toLp} LP
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-hex-gold">{formatDelta(match.delta)}</p>
                      <p className="text-xs text-hex-gold-bright/45">{when(match.createdAt)}</p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-hex-gold transition ${open ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>
                {open && (
                  <div className="grid grid-cols-2 gap-2 bg-hex-void/40 px-5 pb-4 md:grid-cols-4">
                    {Object.entries(nets).map(([lesson, net]) => (
                      <div key={lesson} className="border border-hex-gold/15 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-widest text-hex-gold/70">
                          {lesson}
                        </p>
                        <p className="font-display text-lg text-hex-gold-bright">{net}</p>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
