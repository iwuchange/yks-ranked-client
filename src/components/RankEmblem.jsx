import { emblemForLig, parseLig } from "../lib/ranks";

export default function RankEmblem({ lig, size = 96, className = "" }) {
  const parsed = parseLig(lig);
  const src = emblemForLig(lig);
  return (
    <img
      src={src}
      alt={parsed.label}
      title={parsed.label}
      width={size}
      height={size}
      className={`object-contain drop-shadow-[0_0_18px_rgba(200,155,60,0.25)] ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src =
          "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked-emblem/emblem-iron.png";
        e.currentTarget.style.opacity = "0.35";
      }}
    />
  );
}
