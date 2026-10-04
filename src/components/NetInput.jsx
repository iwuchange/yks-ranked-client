export default function NetInput({ label, value, onChange, max }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-hex-gold/80">
        {label}
      </span>
      <input
        type="number"
        step="0.25"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-sm border border-hex-gold/35 bg-hex-void/70 px-3 py-2.5 font-medium text-hex-gold-bright outline-none transition focus:border-hex-cyan focus:shadow-glow"
      />
    </label>
  );
}
