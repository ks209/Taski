import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Cron Engine ─────────────────────────────────────────────
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

const MONTH_ALIAS = { JAN:"1",FEB:"2",MAR:"3",APR:"4",MAY:"5",JUN:"6",JUL:"7",AUG:"8",SEP:"9",OCT:"10",NOV:"11",DEC:"12" };
const DOW_ALIAS   = { SUN:"0",MON:"1",TUE:"2",WED:"3",THU:"4",FRI:"5",SAT:"6" };
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function applyAliases(str, aliases) {
  let s = str.toUpperCase();
  for (const [k, v] of Object.entries(aliases)) s = s.replaceAll(k, v);
  return s;
}

function parseField(field, min, max, aliases = {}) {
  const f = applyAliases(field, aliases);
  if (f === "*" || f === "?") {
    const s = new Set(); for (let i = min; i <= max; i++) s.add(i); return s;
  }
  const values = new Set();
  for (const part of f.split(",")) {
    if (part.includes("/")) {
      const [range, stepStr] = part.split("/");
      const step = parseInt(stepStr);
      let lo = min, hi = max;
      if (range !== "*") {
        if (range.includes("-")) { [lo, hi] = range.split("-").map(Number); }
        else { lo = parseInt(range); }
      }
      for (let i = lo; i <= hi; i += step) values.add(i);
    } else if (part.includes("-")) {
      const [lo, hi] = part.split("-").map(Number);
      for (let i = lo; i <= hi; i++) values.add(i);
    } else {
      const n = parseInt(part);
      if (!isNaN(n)) values.add(n);
    }
  }
  return values;
}

function parseCron(expr) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 6 && parts.length !== 5)
    throw new Error(`Expected 5 or 6 fields, got ${parts.length}`);
  let [sec, min, hr, dom, mon, dow] = parts.length === 6 ? parts : ["0", ...parts];
  return {
    sec:  parseField(sec,  0, 59),
    min:  parseField(min,  0, 59),
    hr:   parseField(hr,   0, 23),
    dom:  parseField(dom,  1, 31),
    mon:  parseField(mon,  1, 12, MONTH_ALIAS),
    dow:  parseField(dow,  0, 6,  DOW_ALIAS),
    domWild: dom === "*" || dom === "?",
    dowWild: dow === "*" || dow === "?",
  };
}

function sorted(set) { return [...set].sort((a, b) => a - b); }

function getNextRuns(expr, count = 8) {
  const p = parseCron(expr);
  const runs = [];
  let d = new Date(Math.ceil(Date.now() / 1000) * 1000 + 1000);

  let guard = 0;
  while (runs.length < count && guard++ < 200000) {
    const S  = d.getUTCSeconds(), M  = d.getUTCMinutes(), H  = d.getUTCHours();
    const DD = d.getUTCDate(),    MM = d.getUTCMonth() + 1;
    const DOW = d.getUTCDay();
    const Y  = d.getUTCFullYear();

    if (!p.mon.has(MM)) {
      d = new Date(Date.UTC(Y, d.getUTCMonth() + 1, 1)); continue;
    }
    const domOk = p.dom.has(DD), dowOk = p.dow.has(DOW);
    const dayOk = p.domWild && p.dowWild ? true
                : !p.domWild && !p.dowWild ? domOk || dowOk
                : p.domWild ? dowOk : domOk;
    if (!dayOk) { d = new Date(Date.UTC(Y, d.getUTCMonth(), DD + 1)); continue; }

    if (!p.hr.has(H)) {
      const nH = sorted(p.hr).find(h => h > H);
      d = nH != null ? new Date(Date.UTC(Y, d.getUTCMonth(), DD, nH))
                     : new Date(Date.UTC(Y, d.getUTCMonth(), DD + 1)); continue;
    }
    if (!p.min.has(M)) {
      const nM = sorted(p.min).find(m => m > M);
      d = nM != null ? new Date(Date.UTC(Y, d.getUTCMonth(), DD, H, nM))
                     : (() => { const nH = sorted(p.hr).find(h => h > H);
                         return nH != null ? new Date(Date.UTC(Y, d.getUTCMonth(), DD, nH))
                                           : new Date(Date.UTC(Y, d.getUTCMonth(), DD + 1)); })();
      continue;
    }
    if (!p.sec.has(S)) {
      const nS = sorted(p.sec).find(s => s > S);
      if (nS != null) { d = new Date(Date.UTC(Y, d.getUTCMonth(), DD, H, M, nS)); continue; }
      const nM = sorted(p.min).find(m => m > M);
      d = nM != null ? new Date(Date.UTC(Y, d.getUTCMonth(), DD, H, nM))
                     : (() => { const nH = sorted(p.hr).find(h => h > H);
                         return nH != null ? new Date(Date.UTC(Y, d.getUTCMonth(), DD, nH))
                                           : new Date(Date.UTC(Y, d.getUTCMonth(), DD + 1)); })();
      continue;
    }
    runs.push(new Date(d));
    d = new Date(d.getTime() + 1000);
  }
  return runs;
}

function humanReadable(expr) {
  try {
    const parts = expr.trim().split(/\s+/);
    const [sec, min, hr, dom, mon, dow] = parts.length === 6 ? parts : ["0", ...parts];
    const bits = [];
    if (sec !== "0" && sec !== "*") bits.push(`at second ${sec}`);
    bits.push(min === "*" ? "every minute" : `at minute ${min}`);
    bits.push(hr  === "*" ? "every hour"   : `hour ${hr}`);
    if (dom !== "*" && dom !== "?") bits.push(`on day-of-month ${dom}`);
    if (mon !== "*" && mon !== "?") bits.push(`in month ${mon}`);
    if (dow !== "*" && dow !== "?") bits.push(`on ${dow}`);
    return bits.join(", ");
  } catch { return "—"; }
}

function fmtUTC(d) {
  const pad = n => String(n).padStart(2, "0");
  return `${DAY_NAMES[d.getUTCDay()]} ${pad(d.getUTCDate())} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}  ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

function fmtIST(d) {
  const ist = new Date(d.getTime() + IST_OFFSET_MS);
  const pad = n => String(n).padStart(2, "0");
  return `${DAY_NAMES[ist.getUTCDay()]} ${pad(ist.getUTCDate())} ${MONTH_NAMES[ist.getUTCMonth()]} ${ist.getUTCFullYear()}  ${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}:${pad(ist.getUTCSeconds())}`;
}

function timeFromNow(d) {
  const diff = d.getTime() - Date.now();
  const s = Math.floor(diff / 1000);
  if (s < 60)  return `in ${s}s`;
  if (s < 3600) return `in ${Math.floor(s/60)}m`;
  if (s < 86400) return `in ${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m`;
  return `in ${Math.floor(s/86400)}d`;
}

// ── Presets ──────────────────────────────────────────────────
const PRESETS = [
  { label: "Every minute",     expr: "0 * * * * *" },
  { label: "Every 5 min",      expr: "0 */5 * * * *" },
  { label: "Every 15 min",     expr: "0 */15 * * * *" },
  { label: "Every hour",       expr: "0 0 * * * *" },
  { label: "Daily 9 AM",       expr: "0 0 9 * * *" },
  { label: "Daily midnight",   expr: "0 0 0 * * *" },
  { label: "Weekdays 9 AM",    expr: "0 0 9 * * MON-FRI" },
  { label: "Every Sunday",     expr: "0 0 0 * * SUN" },
  { label: "1st of month",     expr: "0 0 0 1 * *" },
  { label: "Every 30 sec",     expr: "*/30 * * * * *" },
];

// ── Field labels ─────────────────────────────────────────────
const FIELD_META = [
  { label: "SEC",  hint: "0-59" },
  { label: "MIN",  hint: "0-59" },
  { label: "HOUR", hint: "0-23" },
  { label: "DOM",  hint: "1-31" },
  { label: "MON",  hint: "1-12" },
  { label: "DOW",  hint: "0-6"  },
];

// ── Component ────────────────────────────────────────────────
const CronEvaluator = ({ motionRef }) => {
  const [expr, setExpr]           = useState("0 */15 9-18 * * MON-FRI");
  const [showPresets, setShowPresets] = useState(false);
  const [copied, setCopied]       = useState(false);

  const result = useMemo(() => {
    try {
      const runs = getNextRuns(expr, 8);
      return { runs, error: null, readable: humanReadable(expr) };
    } catch (e) {
      return { runs: [], error: e.message, readable: null };
    }
  }, [expr]);

  const fieldParts = expr.trim().split(/\s+/);
  const is6 = fieldParts.length === 6;

  const copyExpr = () => {
    navigator.clipboard.writeText(expr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const S = { // shared styles
    mono: { fontFamily: "'JetBrains Mono','Fira Code',monospace" },
    label: { fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: "#444" },
    divider: { height: 1, background: "#1e1e1e", margin: "0 0" },
  };

  return (
    <motion.div
      ref={motionRef}
      drag dragElastic={0} dragMomentum={false} whileDrag={{ scale: 1.01 }}
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: "#141414",
        border: "1px solid #2a2a2a",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        width: 420,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "absolute",
        top: 16,
        left: 16,
        maxHeight: "92vh",
      }}
    >
      {/* ── Header ── */}
      <div style={{
        padding: "12px 14px",
        borderBottom: "1px solid #222",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: result.error ? "#f87171" : "#4ade80",
            boxShadow: result.error ? "none" : "0 0 6px #4ade8088",
            transition: "all 0.2s",
          }} />
          <span style={{ color: "#e5e5e5", fontSize: 13, fontWeight: 600 }}>
            Cron Evaluator
          </span>
          <span style={{
            fontSize: 9, color: "#555", background: "#1e1e1e",
            border: "1px solid #2e2e2e", borderRadius: 4,
            padding: "2px 6px", ...S.mono,
          }}>
            Java / Spring
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setShowPresets(p => !p)}
          style={{
            background: showPresets ? "#1e1e1e" : "transparent",
            border: "1px solid #333", color: "#888",
            fontSize: 10, fontWeight: 500,
            padding: "4px 10px", borderRadius: 6,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {showPresets ? "✕ presets" : "⚡ presets"}
        </motion.button>
      </div>

      {/* ── Presets ── */}
      <AnimatePresence>
        {showPresets && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16 }}
            style={{ overflow: "hidden", flexShrink: 0 }}
          >
            <div style={{
              padding: "8px 12px",
              borderBottom: "1px solid #1e1e1e",
              display: "flex", flexWrap: "wrap", gap: 5,
              background: "#111",
            }}>
              {PRESETS.map((p) => (
                <motion.button
                  key={p.expr}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setExpr(p.expr); setShowPresets(false); }}
                  style={{
                    background: expr === p.expr ? "#4ade8018" : "#1a1a1a",
                    border: "1px solid",
                    borderColor: expr === p.expr ? "#4ade8044" : "#2e2e2e",
                    color: expr === p.expr ? "#4ade80" : "#888",
                    fontSize: 10, fontWeight: 500,
                    padding: "4px 10px", borderRadius: 6,
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {p.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expression Input ── */}
      <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #1e1e1e", flexShrink: 0 }}>
        {/* field labels */}
        <div style={{ display: "flex", gap: 4, marginBottom: 5, paddingLeft: 2 }}>
          {(is6 ? FIELD_META : FIELD_META.slice(1)).map((f) => (
            <span key={f.label} style={{
              flex: 1, fontSize: 8, color: "#3a3a3a",
              letterSpacing: "0.1em", fontWeight: 700,
              textAlign: "center",
            }}>
              {f.label}
            </span>
          ))}
        </div>

        {/* input */}
        <div style={{
          display: "flex", alignItems: "center",
          background: "#1a1a1a",
          border: "1px solid",
          borderColor: result.error ? "#f8717155" : "#2a2a2a",
          borderRadius: 7, overflow: "hidden",
          transition: "border-color 0.2s",
        }}>
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1, background: "transparent",
              border: "none", outline: "none",
              color: "#60a5fa", fontSize: 13.5,
              ...S.mono,
              padding: "9px 12px",
              caretColor: "#4ade80",
              letterSpacing: "0.08em",
            }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={copyExpr}
            style={{
              background: copied ? "#4ade8020" : "transparent",
              border: "none",
              borderLeft: "1px solid #2a2a2a",
              color: copied ? "#4ade80" : "#444",
              fontSize: 10, padding: "0 12px",
              height: "100%", cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {copied ? "✓" : "copy"}
          </motion.button>
        </div>

        {/* error / readable */}
        {result.error ? (
          <p style={{ color: "#f87171", fontSize: 10.5, marginTop: 5, ...S.mono }}>
            ✕ {result.error}
          </p>
        ) : (
          <p style={{ color: "#4a4a4a", fontSize: 11, marginTop: 5, lineHeight: 1.4 }}>
            {result.readable}
          </p>
        )}
      </div>

      {/* ── Column Headers ── */}
      {!result.error && result.runs.length > 0 && (
        <div style={{
          display: "grid", gridTemplateColumns: "20px 1fr 1fr 52px",
          gap: 0, padding: "7px 14px 5px",
          borderBottom: "1px solid #1e1e1e",
          flexShrink: 0,
        }}>
          <span />
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              fontSize: 9, background: "#1e3a5f", color: "#60a5fa",
              border: "1px solid #1e4a8f40",
              borderRadius: 4, padding: "1px 6px",
              fontWeight: 600, letterSpacing: "0.08em",
            }}>UTC</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              fontSize: 9, background: "#1e3d2f", color: "#4ade80",
              border: "1px solid #4ade8030",
              borderRadius: 4, padding: "1px 6px",
              fontWeight: 600, letterSpacing: "0.08em",
            }}>IST +5:30</span>
          </div>
          <span />
        </div>
      )}

      {/* ── Run List ── */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "4px 10px 10px",
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        {result.runs.length === 0 && !result.error && (
          <div style={{ color: "#2e2e2e", fontSize: 12, textAlign: "center", marginTop: 24 }}>
            No upcoming runs found
          </div>
        )}

        {result.runs.map((run, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1, delay: i * 0.025 }}
            style={{
              display: "grid",
              gridTemplateColumns: "20px 1fr 1fr 52px",
              alignItems: "center",
              gap: 0,
              padding: "7px 4px",
              borderRadius: 6,
              borderBottom: i < result.runs.length - 1 ? "1px solid #1a1a1a" : "none",
            }}
          >
            {/* index */}
            <span style={{ fontSize: 9, color: "#333", ...S.mono, textAlign: "center" }}>
              {i + 1}
            </span>

            {/* UTC */}
            <span style={{
              ...S.mono, fontSize: 10.5, color: "#60a5fa",
              letterSpacing: "0.02em", paddingRight: 8,
            }}>
              {fmtUTC(run)}
            </span>

            {/* IST */}
            <span style={{
              ...S.mono, fontSize: 10.5, color: "#4ade80",
              letterSpacing: "0.02em", paddingRight: 8,
            }}>
              {fmtIST(run)}
            </span>

            {/* relative */}
            <span style={{
              fontSize: 9.5, color: "#3f3f46",
              textAlign: "right",
              ...S.mono,
              background: "#1a1a1a",
              border: "1px solid #242424",
              borderRadius: 4, padding: "2px 5px",
              whiteSpace: "nowrap",
            }}>
              {i === 0 ? <span style={{ color: "#fb923c" }}>{timeFromNow(run)}</span> : timeFromNow(run)}
            </span>
          </motion.div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: "6px 14px",
        borderTop: "1px solid #1e1e1e",
        display: "flex", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, color: "#2e2e2e", ...S.mono }}>
          {is6 ? "6-field (sec min hr dom mon dow)" : "5-field (min hr dom mon dow)"}
        </span>
        <span style={{ fontSize: 10, color: "#2e2e2e", ...S.mono }}>
          next {result.runs.length} runs
        </span>
      </div>

      <style>{`
        div::-webkit-scrollbar { width: 3px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        input::placeholder { color: #333 !important; }
      `}</style>
    </motion.div>
  );
};

export default CronEvaluator;