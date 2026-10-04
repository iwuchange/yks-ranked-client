const EMBLEM_BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked-emblem";

export const RANK_EMBLEMS = {
  unranked:
    "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/unranked.png",
  iron: `${EMBLEM_BASE}/emblem-iron.png`,
  bronze: `${EMBLEM_BASE}/emblem-bronze.png`,
  silver: `${EMBLEM_BASE}/emblem-silver.png`,
  gold: `${EMBLEM_BASE}/emblem-gold.png`,
  platinum: `${EMBLEM_BASE}/emblem-platinum.png`,
  emerald: `${EMBLEM_BASE}/emblem-emerald.png`,
  diamond: `${EMBLEM_BASE}/emblem-diamond.png`,
  master: `${EMBLEM_BASE}/emblem-master.png`,
  grandmaster: `${EMBLEM_BASE}/emblem-grandmaster.png`,
  challenger: `${EMBLEM_BASE}/emblem-challenger.png`,
};

export const TIER_META = [
  { id: "iron", name: "Demir", hasDivisions: true },
  { id: "bronze", name: "Bronz", hasDivisions: true },
  { id: "silver", name: "Gümüş", hasDivisions: true },
  { id: "gold", name: "Altın", hasDivisions: true },
  { id: "platinum", name: "Platin", hasDivisions: true },
  { id: "emerald", name: "Zümrüt", hasDivisions: true },
  { id: "diamond", name: "Elmas", hasDivisions: true },
  { id: "master", name: "Usta", hasDivisions: false },
  { id: "grandmaster", name: "Büyükusta", hasDivisions: false },
  { id: "challenger", name: "Şampiyon", hasDivisions: false },
];

const NAME_TO_TIER = Object.fromEntries(TIER_META.map((t) => [t.name, t]));

export const LADDER = TIER_META.flatMap((tier) => {
  if (!tier.hasDivisions) {
    return [{ tier: tier.id, division: null, label: tier.name }];
  }
  return [4, 3, 2, 1].map((division) => ({
    tier: tier.id,
    division,
    label: `${tier.name} ${division}`,
  }));
});

const LABEL_INDEX = Object.fromEntries(LADDER.map((r, i) => [r.label, i]));
const MAX_INDEX = LADDER.length - 1;
const SILVER_4 = LADDER.find((r) => r.label === "Gümüş 4");

export const LANES = {
  tyt: {
    key: "tyt",
    lig: "tyt_lig",
    lp: "tyt_lp",
    last: "tyt_last_net",
    label: "TYT · Esnek",
    short: "TYT",
  },
  ayt_sayisal: {
    key: "ayt_sayisal",
    lig: "ayt_sayisal_lig",
    lp: "ayt_sayisal_lp",
    last: "ayt_sayisal_last_net",
    label: "AYT · Sayısal",
    short: "AYT SAY",
  },
  ayt_esit_agirlik: {
    key: "ayt_esit_agirlik",
    lig: "ayt_esit_agirlik_lig",
    lp: "ayt_esit_agirlik_lp",
    last: "ayt_esit_agirlik_last_net",
    label: "AYT · Eşit Ağırlık",
    short: "AYT EA",
  },
  ayt_sozel: {
    key: "ayt_sozel",
    lig: "ayt_sozel_lig",
    lp: "ayt_sozel_lp",
    last: "ayt_sozel_last_net",
    label: "AYT · Sözel",
    short: "AYT SÖZ",
  },
  ydt: {
    key: "ydt",
    lig: "ydt_lig",
    lp: "ydt_lp",
    last: "ydt_last_net",
    label: "YDT · Clash",
    short: "YDT",
  },
};

export function parseLig(label) {
  if (!label || label === "Unranked") {
    return { tier: "unranked", division: null, label: "Unranked", index: -1 };
  }
  const idx = LABEL_INDEX[label];
  if (idx == null) {
    const [name, divRaw] = String(label).split(" ");
    const meta = NAME_TO_TIER[name];
    if (!meta) {
      return { tier: "unranked", division: null, label: "Unranked", index: -1 };
    }
    const division = meta.hasDivisions ? Number(divRaw) || 4 : null;
    const found = LADDER.findIndex(
      (r) => r.tier === meta.id && r.division === division
    );
    return {
      ...LADDER[Math.max(0, found)],
      index: Math.max(0, found),
    };
  }
  return { ...LADDER[idx], index: idx };
}

export function emblemForLig(label) {
  const parsed = parseLig(label);
  return RANK_EMBLEMS[parsed.tier] || RANK_EMBLEMS.unranked;
}

export function applyLpDelta(currentLabel, currentLp, delta) {
  let index = parseLig(currentLabel).index;
  if (index < 0) index = LABEL_INDEX["Gümüş 4"] ?? 8;
  let lp = Number(currentLp) || 0;
  lp += delta;

  if (index === MAX_INDEX) {
    if (lp < 0 && index > 0) {
      index -= 1;
      lp += 100;
    }
    if (lp < 0) lp = 0;
    return { ...LADDER[index], lp };
  }

  while (lp >= 100 && index < MAX_INDEX) {
    index += 1;
    lp -= 100;
    if (index === MAX_INDEX) break;
  }

  while (lp < 0 && index > 0) {
    index -= 1;
    lp += 100;
  }
  if (index === 0 && lp < 0) lp = 0;

  return { ...LADDER[index], lp };
}

export function resolveAttempt({ lig, lp, lastNet, newNet }) {
  const total = Number(newNet) || 0;
  const previous = Number(lastNet) || 0;
  const unranked = !lig || lig === "Unranked";

  if (unranked) {
    return {
      result: "PLACEMENT",
      delta: 0,
      lig: SILVER_4.label,
      lp: 0,
      lastNet: total,
      fromLig: "Unranked",
      fromLp: 0,
    };
  }

  const win = total > previous;
  const loss = total < previous;
  const delta = win ? 22 : loss ? -16 : 0;
  const result = win ? "WIN" : "LOSS";
  const next = applyLpDelta(lig, lp, delta);

  return {
    result,
    delta,
    lig: next.label,
    lp: next.lp,
    lastNet: total,
    fromLig: lig,
    fromLp: lp,
  };
}

export function defaultUserDoc(username, email) {
  return {
    username,
    email,
    tyt_lig: "Unranked",
    tyt_lp: 0,
    tyt_last_net: 0,
    ayt_sayisal_lig: "Unranked",
    ayt_sayisal_lp: 0,
    ayt_sayisal_last_net: 0,
    ayt_esit_agirlik_lig: "Unranked",
    ayt_esit_agirlik_lp: 0,
    ayt_esit_agirlik_last_net: 0,
    ayt_sozel_lig: "Unranked",
    ayt_sozel_lp: 0,
    ayt_sozel_last_net: 0,
    ydt_lig: "Unranked",
    ydt_lp: 0,
    ydt_last_net: 0,
    profile_img: null,
    ayt_track: "sayisal",
    createdAt: Date.now(),
  };
}

export function aytLaneFromTrack(track) {
  if (track === "esit" || track === "esit_agirlik") return LANES.ayt_esit_agirlik;
  if (track === "sozel") return LANES.ayt_sozel;
  return LANES.ayt_sayisal;
}

export function formatDelta(delta) {
  if (!delta) return "0 LP";
  return delta > 0 ? `+${delta} LP` : `${delta} LP`;
}

export function resultLabel(result) {
  if (result === "WIN") return "ZAFER";
  if (result === "PLACEMENT") return "YERLEŞTİRME";
  return "BOZGUN";
}
