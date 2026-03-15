import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const ClockWallpaper = ({ onClose }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();
  const ms = time.getMilliseconds();

  // smooth second hand
  const secDeg = (s + ms / 1000) * 6;
  const minDeg = (m + s / 60) * 6;
  const hrDeg  = ((h % 12) + m / 60) * 30;

  const pad = (n) => String(n).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h % 12 || 12;

  const dateStr = `${DAYS[time.getDay()]}, ${time.getDate()} ${MONTHS[time.getMonth()]} ${time.getFullYear()}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "#0a0a0a",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 40,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Close button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onClose}
        style={{
          position: "absolute", top: 24, right: 28,
          background: "transparent",
          border: "1px solid #2a2a2a",
          color: "#444", fontSize: 12,
          padding: "6px 14px", borderRadius: 8,
          cursor: "pointer", fontFamily: "inherit",
          letterSpacing: "0.05em",
          transition: "color 0.2s, border-color 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color="#aaa"; e.currentTarget.style.borderColor="#555"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color="#444"; e.currentTarget.style.borderColor="#2a2a2a"; }}
      >
        ✕ close
      </motion.button>

      {/* Analog clock */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ position: "relative", width: 240, height: 240 }}
      >
        <svg viewBox="0 0 240 240" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          {/* Outer ring */}
          <circle cx="120" cy="120" r="114" fill="none" stroke="#1e1e1e" strokeWidth="1" />
          <circle cx="120" cy="120" r="108" fill="#111" stroke="#1a1a1a" strokeWidth="0.5" />

          {/* Hour markers */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const isMajor = i % 3 === 0;
            const r1 = isMajor ? 94 : 97;
            const r2 = 104;
            return (
              <line
                key={i}
                x1={120 + r1 * Math.cos(angle)}
                y1={120 + r1 * Math.sin(angle)}
                x2={120 + r2 * Math.cos(angle)}
                y2={120 + r2 * Math.sin(angle)}
                stroke={isMajor ? "#3a3a3a" : "#222"}
                strokeWidth={isMajor ? 1.5 : 0.8}
                strokeLinecap="round"
              />
            );
          })}

          {/* Minute markers */}
          {Array.from({ length: 60 }).map((_, i) => {
            if (i % 5 === 0) return null;
            const angle = (i * 6 - 90) * (Math.PI / 180);
            return (
              <line
                key={`m${i}`}
                x1={120 + 100 * Math.cos(angle)}
                y1={120 + 100 * Math.sin(angle)}
                x2={120 + 104 * Math.cos(angle)}
                y2={120 + 104 * Math.sin(angle)}
                stroke="#1e1e1e"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Hour hand */}
          <motion.line
            x1="120" y1="120"
            x2={120 + 58 * Math.cos((hrDeg - 90) * Math.PI / 180)}
            y2={120 + 58 * Math.sin((hrDeg - 90) * Math.PI / 180)}
            stroke="#d4d4d4" strokeWidth="2.5" strokeLinecap="round"
          />

          {/* Minute hand */}
          <motion.line
            x1="120" y1="120"
            x2={120 + 76 * Math.cos((minDeg - 90) * Math.PI / 180)}
            y2={120 + 76 * Math.sin((minDeg - 90) * Math.PI / 180)}
            stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round"
          />

          {/* Second hand */}
          <motion.line
            x1={120 - 18 * Math.cos((secDeg - 90) * Math.PI / 180)}
            y1={120 - 18 * Math.sin((secDeg - 90) * Math.PI / 180)}
            x2={120 + 86 * Math.cos((secDeg - 90) * Math.PI / 180)}
            y2={120 + 86 * Math.sin((secDeg - 90) * Math.PI / 180)}
            stroke="#38bdf8" strokeWidth="0.8" strokeLinecap="round"
          />

          {/* Center dot */}
          <circle cx="120" cy="120" r="3" fill="#38bdf8" />
          <circle cx="120" cy="120" r="1.5" fill="#0a0a0a" />
        </svg>
      </motion.div>

      {/* Digital time */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 }}>
          <span style={{
            fontSize: "clamp(48px, 8vw, 88px)",
            fontWeight: 300,
            color: "#e5e5e5",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}>
            {pad(h12)}:{pad(m)}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 4 }}>
            <span style={{
              fontSize: "clamp(14px, 2vw, 20px)",
              color: "#38bdf8", fontWeight: 400,
              letterSpacing: "0.1em",
            }}>
              {ampm}
            </span>
            <span style={{
              fontSize: "clamp(18px, 3vw, 28px)",
              color: "#2a2a2a", fontWeight: 300,
              letterSpacing: "0.02em",
              fontVariantNumeric: "tabular-nums",
            }}>
              {pad(s)}
            </span>
          </div>
        </div>

        {/* Date */}
        <span style={{
          fontSize: "clamp(12px, 1.6vw, 16px)",
          color: "#3a3a3a",
          letterSpacing: "0.12em",
          fontWeight: 400,
          textTransform: "uppercase",
        }}>
          {dateStr}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default ClockWallpaper;