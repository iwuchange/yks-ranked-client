import { formatDelta, resultLabel } from "../lib/ranks";

export default function ResultModal({ outcome, onClose }) {
  if (!outcome) return null;
  const win = outcome.result === "WIN";
  const place = outcome.result === "PLACEMENT";
  const tone = win || place ? "text-hex-cyan" : "text-rose-400";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-hex-void/80 px-4 backdrop-blur-sm">
      <div className="gold-border w-full max-w-md bg-hex-navy p-8 text-center shadow-hex">
        <p className="text-xs uppercase tracking-[0.35em] text-hex-gold">Sonuç</p>
        <h2 className={`mt-3 font-display text-4xl ${tone}`}>{resultLabel(outcome.result)}</h2>
        <p className="mt-3 text-sm text-hex-gold-bright/70">{outcome.mode}</p>
        <p className="mt-4 font-display text-2xl text-hex-gold">
          {place ? "Gümüş 4 · 0 LP" : formatDelta(outcome.delta)}
        </p>
        <p className="mt-2 text-sm text-hex-gold-bright/80">
          {outcome.fromLig} {outcome.fromLp} LP → {outcome.lig} {outcome.lp} LP
        </p>
        <p className="mt-1 text-xs uppercase tracking-widest text-hex-cyan">
          Toplam net {Number(outcome.lastNet).toFixed(2)}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full border border-hex-gold bg-hex-gold/15 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-hex-gold hover:bg-hex-gold/25"
        >
          Devam et
        </button>
      </div>
    </div>
  );
}
