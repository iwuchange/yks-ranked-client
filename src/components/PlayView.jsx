import { useMemo, useState } from "react";
import { BookOpen, Languages, Play, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { submitDeneme } from "../lib/account";
import { aytLaneFromTrack, LANES } from "../lib/ranks";
import NetInput from "./NetInput";
import ResultModal from "./ResultModal";
import RankEmblem from "./RankEmblem";

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const TYT_FIELDS = [
  { key: "turkce", label: "Türkçe", max: 40 },
  { key: "sosyal", label: "Sosyal", max: 20 },
  { key: "matematik", label: "Matematik", max: 40 },
  { key: "fen", label: "Fen", max: 20 },
];

const AYT_FIELDS = {
  sayisal: [
    { key: "matematik", label: "Matematik", max: 40 },
    { key: "fizik", label: "Fizik", max: 14 },
    { key: "kimya", label: "Kimya", max: 13 },
    { key: "biyoloji", label: "Biyoloji", max: 13 },
  ],
  esit: [
    { key: "matematik", label: "Matematik", max: 40 },
    { key: "edebiyat", label: "Edebiyat", max: 24 },
    { key: "tarih1", label: "Tarih-1", max: 10 },
    { key: "cografya1", label: "Coğrafya-1", max: 6 },
  ],
  sozel: [
    { key: "edebiyat", label: "Edebiyat", max: 24 },
    { key: "tarih1", label: "Tarih-1", max: 10 },
    { key: "cografya1", label: "Coğrafya-1", max: 6 },
    { key: "tarih2", label: "Tarih-2", max: 11 },
    { key: "cografya2", label: "Coğrafya-2", max: 11 },
    { key: "felsefe", label: "Felsefe Grubu", max: 12 },
    { key: "din", label: "Din Kültürü", max: 6 },
  ],
};

function emptyFrom(fields) {
  return Object.fromEntries(fields.map((f) => [f.key, ""]));
}

export default function PlayView() {
  const { uid, profile } = useAuth();
  const [tab, setTab] = useState("esnek");
  const [aytTrack, setAytTrack] = useState("sayisal");
  const [tytNets, setTytNets] = useState(() => emptyFrom(TYT_FIELDS));
  const [aytNets, setAytNets] = useState(() => emptyFrom(AYT_FIELDS.sayisal));
  const [ydtNet, setYdtNet] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState(null);

  const aytFields = AYT_FIELDS[aytTrack];
  const tytTotal = TYT_FIELDS.reduce((s, f) => s + num(tytNets[f.key]), 0);
  const aytTotal = aytFields.reduce((s, f) => s + num(aytNets[f.key]), 0);
  const ydtTotal = num(ydtNet);

  const activeLane = useMemo(() => {
    if (tab === "esnek") return LANES.tyt;
    if (tab === "clash") return LANES.ydt;
    return aytLaneFromTrack(aytTrack);
  }, [tab, aytTrack]);

  const lig = profile?.[activeLane.lig] || "Unranked";
  const lp = profile?.[activeLane.lp] || 0;

  function changeAytTrack(track) {
    setAytTrack(track);
    setAytNets(emptyFrom(AYT_FIELDS[track]));
  }

  async function playNow() {
    if (!uid) return;
    setError("");
    setBusy(true);
    try {
      let nets;
      let total;
      let laneKey;
      if (tab === "esnek") {
        nets = Object.fromEntries(
          TYT_FIELDS.map((f) => [f.label, num(tytNets[f.key])])
        );
        total = tytTotal;
        laneKey = "tyt";
      } else if (tab === "cift") {
        nets = Object.fromEntries(
          aytFields.map((f) => [f.label, num(aytNets[f.key])])
        );
        total = aytTotal;
        laneKey = aytLaneFromTrack(aytTrack).key;
      } else {
        nets = { "YDT Neti": ydtTotal };
        total = ydtTotal;
        laneKey = "ydt";
      }
      const result = await submitDeneme(uid, laneKey, nets, total);
      setOutcome(result);
    } catch (err) {
      setError(err.message || "Deneme kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {[
          { id: "esnek", label: "Esnek" },
          { id: "cift", label: "Tek / Çift" },
          { id: "clash", label: "Deneme Clash" },
        ].map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setTab(q.id)}
            className={`border px-4 py-2 text-xs uppercase tracking-[0.2em] ${
              q.id === "clash" ? "clash-tab " : ""
            }${
              tab === q.id
                ? "border-hex-gold bg-hex-gold text-hex-void"
                : "border-hex-gold/40 text-hex-gold-bright/80 hover:border-hex-gold"
            }`}
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="gold-border flex flex-wrap items-center justify-between gap-3 bg-hex-deep/70 px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-hex-gold/80">
            {activeLane.label}
          </p>
          <p className="font-display text-lg text-hex-gold-bright">
            {lig} · {lp} LP
          </p>
        </div>
        <RankEmblem lig={lig} size={64} />
      </div>

      <div className="gold-border bg-hex-panel/70 p-5 md:p-6">
        {tab === "esnek" && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-2xl text-hex-gold-bright">
                <BookOpen className="h-5 w-5 text-hex-gold" /> TYT Deneme Girişi
              </h2>
              <span className="text-xs uppercase tracking-widest text-hex-cyan">
                Toplam {tytTotal.toFixed(2)} net
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {TYT_FIELDS.map((f) => (
                <NetInput
                  key={f.key}
                  label={f.label}
                  max={f.max}
                  value={tytNets[f.key]}
                  onChange={(v) => setTytNets((p) => ({ ...p, [f.key]: v }))}
                />
              ))}
            </div>
          </>
        )}

        {tab === "cift" && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-2xl text-hex-gold-bright">
                <Shield className="h-5 w-5 text-hex-gold" /> AYT Deneme Girişi
              </h2>
              <span className="text-xs uppercase tracking-widest text-hex-cyan">
                Toplam {aytTotal.toFixed(2)} net
              </span>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {[
                { id: "sayisal", label: "Sayısal" },
                { id: "esit", label: "Eşit Ağırlık" },
                { id: "sozel", label: "Sözel" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => changeAytTrack(t.id)}
                  className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] ${
                    aytTrack === t.id
                      ? "border-hex-cyan bg-hex-cyan/15 text-hex-cyan"
                      : "border-hex-gold/30 text-hex-gold-bright/70"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {aytFields.map((f) => (
                <NetInput
                  key={f.key}
                  label={f.label}
                  max={f.max}
                  value={aytNets[f.key] ?? ""}
                  onChange={(v) => setAytNets((p) => ({ ...p, [f.key]: v }))}
                />
              ))}
            </div>
          </>
        )}

        {tab === "clash" && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-2xl text-hex-gold-bright">
                <Languages className="h-5 w-5 text-hex-gold" /> YDT Clash
              </h2>
              <span className="text-xs uppercase tracking-widest text-hex-cyan">
                {ydtTotal.toFixed(2)} net
              </span>
            </div>
            <div className="max-w-xs">
              <NetInput
                label="YDT Neti"
                max={80}
                value={ydtNet}
                onChange={setYdtNet}
              />
            </div>
            <p className="mt-3 text-sm text-hex-gold-bright/55">
              Clash temalı yabancı dil denemesi yalnızca YDT ligini etkiler.
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="border border-rose-400/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="flex flex-col items-center justify-center py-2">
        <button
          type="button"
          onClick={playNow}
          disabled={busy}
          className={`relative grid h-36 w-40 place-items-center text-hex-void shadow-hex transition hover:brightness-110 disabled:opacity-60 ${
            tab === "clash" ? "play-hex clash-play" : "play-hex bg-gradient-to-b from-hex-gold to-hex-gold-dim"
          }`}
        >
          <span className="flex flex-col items-center">
            <Play className="h-8 w-8 fill-current" />
            <span className="mt-1 font-display text-lg font-bold tracking-[0.2em]">
              {busy ? "..." : "OYNA"}
            </span>
          </span>
        </button>
        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-hex-cyan">
          Netleri kaydet · anında sonuç
        </p>
      </div>

      <ResultModal outcome={outcome} onClose={() => setOutcome(null)} />
    </div>
  );
}
