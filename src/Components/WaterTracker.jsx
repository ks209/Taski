import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useWidgetPosition } from "../hooks/useWidgetPosition";

const STORAGE_KEY = "water_tracker";
const GOAL_KEY    = "water_goal";
const ML_PER_GLASS = 250;

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveData = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const fmtTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// ── Wave SVG ──────────────────────────────────────────────────
const WaveFill = ({ pct }) => {
  const clamp = Math.min(Math.max(pct, 0), 100);
  const y = 100 - clamp;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: "50%" }}
    >
      <defs>
        <clipPath id="circle-clip">
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath="url(#circle-clip)">
        <motion.path
          animate={{ d: [
            `M0,${y} Q25,${y - 5} 50,${y} Q75,${y + 5} 100,${y} L100,100 L0,100 Z`,
            `M0,${y} Q25,${y + 5} 50,${y} Q75,${y - 5} 100,${y} L100,100 L0,100 Z`,
            `M0,${y} Q25,${y - 5} 50,${y} Q75,${y + 5} 100,${y} L100,100 L0,100 Z`,
          ]}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          fill="#38bdf820"
        />
        <motion.path
          animate={{ d: [
            `M0,${y + 2} Q25,${y - 3} 50,${y + 2} Q75,${y + 7} 100,${y + 2} L100,100 L0,100 Z`,
            `M0,${y + 2} Q25,${y + 7} 50,${y + 2} Q75,${y - 3} 100,${y + 2} L100,100 L0,100 Z`,
            `M0,${y + 2} Q25,${y - 3} 50,${y + 2} Q75,${y + 7} 100,${y + 2} L100,100 L0,100 Z`,
          ]}}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          fill="#38bdf830"
        />
      </g>
    </svg>
  );
};

// ── Main ──────────────────────────────────────────────────────
const WaterTracker = ({ motionRef }) => {
  const today = getTodayKey();

  const { x, y, onDragEnd } = useWidgetPosition("water", { x: 600, y: 16 });

  const [allData, setAllData]     = useState(loadData);
  const [goal, setGoal]           = useState(() => parseInt(localStorage.getItem(GOAL_KEY) || "8"));
  const [editGoal, setEditGoal]   = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [ripple, setRipple]       = useState(false);
  const [showLog, setShowLog]     = useState(false);

  const entries = allData[today] || [];
  const count   = entries.length;
  const pct     = Math.min((count / goal) * 100, 100);
  const ml      = count * ML_PER_GLASS;
  const done    = count >= goal;

  const triggerRipple = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
  };

  const addGlass = () => {
    const next = {
      ...allData,
      [today]: [...entries, { time: new Date().toISOString() }],
    };
    setAllData(next);
    saveData(next);
    triggerRipple();
  };

  const removeLatest = () => {
    if (!entries.length) return;
    const next = { ...allData, [today]: entries.slice(0, -1) };
    setAllData(next);
    saveData(next);
  };

  const saveGoal = () => {
    const n = parseInt(goalInput);
    if (!isNaN(n) && n > 0) {
      setGoal(n);
      localStorage.setItem(GOAL_KEY, String(n));
    }
    setEditGoal(false);
  };

  // last 7 days stats
  const weekStats = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key  = d.toISOString().slice(0, 10);
    const cnt  = (allData[key] || []).length;
    const isToday = key === today;
    return { key, cnt, isToday, label: d.toLocaleDateString([], { weekday: "short" }) };
  });

  const glassColor = done ? "#4ade80" : "#38bdf8";

  return (
    <motion.div
      ref={motionRef}
      drag dragElastic={0} dragMomentum={false} whileDrag={{ scale: 1.01 }}
      style={{
        x,y,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: "#141414",
        border: "1px solid #2a2a2a",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        width: 300,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "absolute",
        top: 16,
        left: 16,
      }}
    >
      {/* ── Header ── */}
      <div style={{
        padding: "12px 14px",
        borderBottom: "1px solid #222",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: done ? "#4ade80" : "#38bdf8",
            boxShadow: `0 0 6px ${done ? "#4ade8088" : "#38bdf888"}`,
            transition: "all 0.4s",
          }} />
          <span style={{ color: "#e5e5e5", fontSize: 13, fontWeight: 600 }}>
            Water Tracker
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#444" }}>
            {new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
          </span>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => { setShowLog(p => !p); }}
            style={{
              background: showLog ? "#1e1e1e" : "transparent",
              border: "1px solid #333", color: "#666",
              fontSize: 10, padding: "3px 8px", borderRadius: 6,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            log
          </motion.button>
        </div>
      </div>

      {/* ── Main visual ── */}
      <div style={{ padding: "20px 14px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>

        {/* Circle */}
        <div style={{ position: "relative", width: 120, height: 120 }}>
          {/* outer ring */}
          <svg viewBox="0 0 120 120" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="#1e1e1e" strokeWidth="6" />
            <motion.circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={glassColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - pct / 100) }}
              initial={false}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
            />
          </svg>

          {/* wave fill inside circle */}
          <div style={{
            position: "absolute",
            top: "10%", left: "10%",
            width: "80%", height: "80%",
            borderRadius: "50%",
            overflow: "hidden",
            background: "#111",
          }}>
            <WaveFill pct={pct} />
          </div>

          {/* center text */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 1,
          }}>
            <motion.span
              key={count}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                fontSize: 26, fontWeight: 700,
                color: done ? "#4ade80" : "#e5e5e5",
                lineHeight: 1,
              }}
            >
              {count}
            </motion.span>
            <span style={{ fontSize: 10, color: "#555" }}>/ {goal}</span>
          </div>

          {/* ripple */}
          <AnimatePresence>
            {ripple && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0.5 }}
                animate={{ scale: 1.6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55 }}
                style={{
                  position: "absolute", inset: 0,
                  borderRadius: "50%",
                  border: `2px solid ${glassColor}`,
                  pointerEvents: "none",
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          {[
            { label: "drunk", value: `${ml}ml` },
            { label: "remaining", value: `${Math.max(0, (goal - count) * ML_PER_GLASS)}ml` },
            { label: "progress", value: `${Math.round(pct)}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: 1, background: "#1a1a1a",
              border: "1px solid #242424", borderRadius: 8,
              padding: "7px 0", textAlign: "center",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#c8c8c8" }}>{value}</div>
              <div style={{ fontSize: 9, color: "#444", marginTop: 2, letterSpacing: "0.06em" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={addGlass}
            style={{
              flex: 1,
              background: done ? "#0f3328" : "#0c2a3d",
              border: "1px solid",
              borderColor: done ? "#4ade8040" : "#38bdf840",
              color: done ? "#4ade80" : "#38bdf8",
              fontSize: 13, fontWeight: 600,
              padding: "10px 0", borderRadius: 8,
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            {done ? "✓ goal met! +1 more" : "+ add glass"}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={removeLatest}
            disabled={count === 0}
            style={{
              background: "transparent",
              border: "1px solid #2a2a2a",
              color: count === 0 ? "#2a2a2a" : "#555",
              fontSize: 13, padding: "10px 12px",
              borderRadius: 8, cursor: count === 0 ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            ↩
          </motion.button>
        </div>

        {/* Goal setter */}
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {editGoal ? (
            <div style={{ display: "flex", gap: 6, flex: 1 }}>
              <input
                autoFocus
                type="number"
                min="1" max="30"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveGoal()}
                placeholder={String(goal)}
                style={{
                  flex: 1, background: "#1a1a1a",
                  border: "1px solid #38bdf840",
                  borderRadius: 6, padding: "5px 10px",
                  color: "#e0e0e0", fontSize: 12,
                  outline: "none", fontFamily: "inherit",
                }}
              />
              <motion.button whileTap={{ scale: 0.95 }} onClick={saveGoal}
                style={{
                  background: "#0c2a3d", border: "1px solid #38bdf840",
                  color: "#38bdf8", fontSize: 11,
                  padding: "5px 10px", borderRadius: 6,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                save
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditGoal(false)}
                style={{
                  background: "transparent", border: "1px solid #2e2e2e",
                  color: "#555", fontSize: 11,
                  padding: "5px 8px", borderRadius: 6,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                ✕
              </motion.button>
            </div>
          ) : (
            <>
              <span style={{ fontSize: 11, color: "#3a3a3a" }}>
                goal: {goal} glasses ({goal * ML_PER_GLASS}ml)
              </span>
              <button onClick={() => { setGoalInput(String(goal)); setEditGoal(true); }}
                style={{
                  background: "none", border: "none",
                  color: "#444", fontSize: 10,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 7-day bar chart ── */}
      <div style={{
        padding: "10px 14px 14px",
        borderTop: "1px solid #1e1e1e",
      }}>
        <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>
          LAST 7 DAYS
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 36 }}>
          {weekStats.map((d) => {
            const barPct = goal > 0 ? Math.min((d.cnt / goal) * 100, 100) : 0;
            const barH   = Math.max((barPct / 100) * 36, d.cnt > 0 ? 4 : 1);
            return (
              <div key={d.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", height: 36, display: "flex", alignItems: "flex-end" }}>
                  <motion.div
                    animate={{ height: barH }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                      width: "100%",
                      background: d.isToday
                        ? (done ? "#4ade8033" : "#38bdf833")
                        : "#1e1e1e",
                      border: "1px solid",
                      borderColor: d.isToday
                        ? (done ? "#4ade8066" : "#38bdf866")
                        : "#2a2a2a",
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span style={{
                  fontSize: 8, color: d.isToday ? "#38bdf8" : "#333",
                  letterSpacing: "0.04em",
                }}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Today's log ── */}
      <AnimatePresence>
        {showLog && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              borderTop: "1px solid #1e1e1e",
              padding: "8px 14px 12px",
              display: "flex", flexDirection: "column", gap: 2,
              maxHeight: 160, overflowY: "auto",
            }}>
              <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 4 }}>
                TODAY'S LOG
              </div>
              {entries.length === 0 && (
                <span style={{ fontSize: 11, color: "#2e2e2e" }}>No glasses logged yet</span>
              )}
              {[...entries].reverse().map((e, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "4px 0",
                  borderBottom: i < entries.length - 1 ? "1px solid #1a1a1a" : "none",
                }}>
                  <span style={{ fontSize: 10, color: "#38bdf866" }}>◉</span>
                  <span style={{ fontSize: 11, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtTime(e.time)}
                  </span>
                  <span style={{ fontSize: 11, color: "#333" }}>
                    {ML_PER_GLASS}ml glass
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "#2e2e2e" }}>
                    #{entries.length - i}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        div::-webkit-scrollbar { width: 3px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0; }
      `}</style>
    </motion.div>
  );
};

export default WaterTracker;