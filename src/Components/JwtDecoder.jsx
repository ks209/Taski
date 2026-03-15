import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── JWT Engine ───────────────────────────────────────────────
function b64urlDecode(str) {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return JSON.parse(atob(s + pad));
}

function decodeJWT(token) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT — expected 3 parts separated by dots");
  const header  = b64urlDecode(parts[0]);
  const payload = b64urlDecode(parts[1]);
  const sig     = parts[2];

  const now = Math.floor(Date.now() / 1000);
  const exp = payload.exp ? Number(payload.exp) : null;
  const iat = payload.iat ? Number(payload.iat) : null;
  const nbf = payload.nbf ? Number(payload.nbf) : null;

  let status = "valid";
  let statusLabel = "Valid";
  let expiresIn = null;

  if (exp !== null) {
    if (now > exp) {
      status = "expired";
      const ago = now - exp;
      statusLabel = `Expired ${fmtDuration(ago)} ago`;
    } else {
      expiresIn = exp - now;
      statusLabel = `Expires in ${fmtDuration(expiresIn)}`;
    }
  } else {
    statusLabel = "No expiry";
    status = "noexp";
  }

  return { header, payload, sig, exp, iat, nbf, status, statusLabel, expiresIn, parts };
}

function fmtDuration(s) {
  if (s < 60)      return `${s}s`;
  if (s < 3600)    return `${Math.floor(s / 60)}m ${s % 60}s`;
  if (s < 86400)   return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
}

function fmtTime(epoch) {
  if (!epoch) return "—";
  const d = new Date(epoch * 1000);
  return d.toISOString().replace("T", "  ").replace(".000Z", "  UTC");
}

function fmtIST(epoch) {
  if (!epoch) return "—";
  const IST_OFFSET = (5 * 60 + 30) * 60 * 1000;
  const d = new Date(epoch * 1000 + IST_OFFSET);
  return d.toISOString().replace("T", "  ").replace(".000Z", "  IST");
}

// ── Colors ───────────────────────────────────────────────────
const STATUS_COLOR = {
  valid:   { dot: "#4ade80", glow: "#4ade8088", text: "#4ade80", bg: "#0f3328", border: "#4ade8030" },
  expired: { dot: "#f87171", glow: "none",      text: "#f87171", bg: "#3d0f0f", border: "#f8717130" },
  noexp:   { dot: "#fb923c", glow: "none",      text: "#fb923c", bg: "#3d1f07", border: "#fb923c30" },
};

const CLAIM_COLORS = {
  exp: "#fb923c", iat: "#60a5fa", nbf: "#a78bfa", sub: "#4ade80",
  iss: "#e879f9", aud: "#34d399", jti: "#fbbf24",
};

// ── JSON Renderer ────────────────────────────────────────────
const JSONLine = ({ k, v, isTimeClaim }) => {
  const [copied, setCopied] = useState(false);
  const accent = CLAIM_COLORS[k] || "#c8c8c8";
  const valStr = typeof v === "string" ? `"${v}"` : String(v);

  const copy = () => {
    navigator.clipboard.writeText(typeof v === "object" ? JSON.stringify(v, null, 2) : String(v));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", padding: "4px 0",
        borderBottom: "1px solid #1a1a1a" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{
          fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
          color: accent, flexShrink: 0, minWidth: 80,
          paddingTop: 1,
        }}>
          {k}
        </span>
        <span style={{
          flex: 1, fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          color: typeof v === "number" ? "#fb923c"
               : typeof v === "boolean" ? "#60a5fa"
               : "#a8d8a8",
          wordBreak: "break-all", lineHeight: 1.5,
        }}>
          {valStr}
        </span>
        <button
          onClick={copy}
          style={{
            background: "none", border: "none",
            color: copied ? "#4ade80" : "#333",
            fontSize: 10, cursor: "pointer",
            flexShrink: 0, padding: "0 2px",
            fontFamily: "inherit",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => !copied && (e.target.style.color = "#666")}
          onMouseLeave={(e) => !copied && (e.target.style.color = "#333")}
        >
          {copied ? "✓" : "⎘"}
        </button>
      </div>
      {/* time claim → show human readable */}
      {isTimeClaim && (
        <div style={{ paddingLeft: 88, display: "flex", flexDirection: "column", gap: 1, marginTop: 2 }}>
          <span style={{ fontSize: 10, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>
            {fmtTime(v)}
          </span>
          <span style={{ fontSize: 10, color: "#4ade8066", fontFamily: "'JetBrains Mono', monospace" }}>
            {fmtIST(v)}
          </span>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, accent, data, timeClaims = [] }) => {
  const [copied, setCopied] = useState(false);
  const copyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{
      background: "#1a1a1a",
      border: "1px solid #242424",
      borderRadius: 8, overflow: "hidden",
      flexShrink: 0,
    }}>
      {/* section header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 11px",
        borderBottom: "1px solid #222",
        background: "#161616",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{
            width: 3, height: 12, borderRadius: 2,
            background: accent, display: "inline-block", flexShrink: 0,
          }} />
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
            color: "#555",
          }}>
            {title}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={copyAll}
          style={{
            background: copied ? "#4ade8018" : "transparent",
            border: "1px solid", borderColor: copied ? "#4ade8040" : "#2e2e2e",
            color: copied ? "#4ade80" : "#444",
            fontSize: 9, padding: "2px 8px", borderRadius: 4,
            cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.15s",
          }}
        >
          {copied ? "✓ copied" : "copy JSON"}
        </motion.button>
      </div>

      {/* fields */}
      <div style={{ padding: "2px 11px 6px" }}>
        {Object.entries(data).map(([k, v]) => (
          <JSONLine
            key={k}
            k={k}
            v={v}
            isTimeClaim={timeClaims.includes(k)}
          />
        ))}
      </div>
    </div>
  );
};

// ── Main Widget ──────────────────────────────────────────────
const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJKb2huIERvZSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDg2NDAwfQ." +
  "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const JWTDecoder = ({ motionRef }) => {
  const [token, setToken]     = useState("");
  const [focused, setFocused] = useState(false);
  const [showSig, setShowSig] = useState(false);
  const textRef = useRef(null);

  const result = useMemo(() => {
    if (!token.trim()) return null;
    try { return { data: decodeJWT(token.trim()), error: null }; }
    catch (e) { return { data: null, error: e.message }; }
  }, [token]);

  const sc = result?.data ? STATUS_COLOR[result.data.status] : null;

  const loadSample = () => setToken(SAMPLE_TOKEN);
  const clear      = () => { setToken(""); };

  return (
    <motion.div
      ref={motionRef}
      drag dragElastic={0} dragMomentum={false} whileDrag={{ scale: 1.01 }}
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: "#141414",
        border: "1px solid #2a2a2a",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        width: 400,
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
            background: sc ? sc.dot : "#3f3f46",
            boxShadow: sc?.glow !== "none" ? `0 0 6px ${sc?.glow}` : "none",
            transition: "all 0.2s",
          }} />
          <span style={{ color: "#e5e5e5", fontSize: 13, fontWeight: 600 }}>
            JWT Decoder
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={loadSample}
            style={{
              background: "transparent", border: "1px solid #333",
              color: "#555", fontSize: 10, fontWeight: 500,
              padding: "4px 10px", borderRadius: 6,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            sample
          </motion.button>
          {token && (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={clear}
              style={{
                background: "transparent", border: "1px solid #333",
                color: "#555", fontSize: 10,
                padding: "4px 8px", borderRadius: 6,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              ✕
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Token Input ── */}
      <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #1e1e1e", flexShrink: 0 }}>
        <div style={{
          background: "#1a1a1a",
          border: "1px solid",
          borderColor: result?.error ? "#f8717155"
                     : focused ? "#3f3f46"
                     : "#2a2a2a",
          borderRadius: 8, overflow: "hidden",
          transition: "border-color 0.2s",
        }}>
          <textarea
            ref={textRef}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Paste JWT token here..."
            spellCheck={false}
            style={{
              width: "100%", background: "transparent",
              border: "none", outline: "none",
              color: "#a78bfa",
              fontSize: 10.5,
              fontFamily: "'JetBrains Mono', monospace",
              padding: "10px 12px",
              resize: "none", height: 72,
              lineHeight: 1.65,
              caretColor: "#4ade80",
              boxSizing: "border-box",
              wordBreak: "break-all",
            }}
          />
        </div>

        {/* token parts color legend */}
        {token && !result?.error && (
          <div style={{ display: "flex", gap: 12, marginTop: 6, paddingLeft: 2 }}>
            {[
              { label: "header",    color: "#60a5fa" },
              { label: "payload",   color: "#4ade80" },
              { label: "signature", color: "#f87171" },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
                <span style={{ fontSize: 10, color: "#444" }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {result?.error && (
          <p style={{
            color: "#f87171", fontSize: 10.5, marginTop: 5,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            ✕ {result.error}
          </p>
        )}
      </div>

      {/* ── Results ── */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "8px 10px 12px",
        display: "flex", flexDirection: "column", gap: 6,
      }}>

        {/* Status banner */}
        <AnimatePresence>
          {result?.data && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                background: sc.bg,
                border: `1px solid ${sc.border}`,
                borderRadius: 8, padding: "8px 12px",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: sc.text,
                }}>
                  {result.data.statusLabel}
                </span>
              </div>
              {result.data.exp && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                  <span style={{ fontSize: 9, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtTime(result.data.exp)}
                  </span>
                  <span style={{ fontSize: 9, color: "#4ade8055", fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtIST(result.data.exp)}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header + Payload sections */}
        <AnimatePresence>
          {result?.data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              <Section
                title="HEADER"
                accent="#60a5fa"
                data={result.data.header}
              />
              <Section
                title="PAYLOAD"
                accent="#4ade80"
                data={result.data.payload}
                timeClaims={["exp", "iat", "nbf"]}
              />

              {/* Signature */}
              <div style={{
                background: "#1a1a1a",
                border: "1px solid #242424",
                borderRadius: 8, overflow: "hidden",
                flexShrink: 0,
              }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 11px",
                  borderBottom: showSig ? "1px solid #222" : "none",
                  background: "#161616",
                  cursor: "pointer",
                }}
                  onClick={() => setShowSig(p => !p)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{
                      width: 3, height: 12, borderRadius: 2,
                      background: "#f87171", display: "inline-block",
                    }} />
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#555" }}>
                      SIGNATURE
                    </span>
                    <span style={{
                      fontSize: 9, color: "#444", background: "#1e1e1e",
                      border: "1px solid #2e2e2e", borderRadius: 4,
                      padding: "1px 6px",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {result.data.header.alg || "?"}
                    </span>
                  </div>
                  <span style={{ color: "#333", fontSize: 11 }}>
                    {showSig ? "▲" : "▼"}
                  </span>
                </div>
                <AnimatePresence>
                  {showSig && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      transition={{ duration: 0.14 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ padding: "8px 11px" }}>
                        <p style={{
                          fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                          color: "#f8717188", wordBreak: "break-all", lineHeight: 1.6,
                          margin: 0,
                        }}>
                          {result.data.sig}
                        </p>
                        <p style={{ fontSize: 10, color: "#3a3a3a", marginTop: 6 }}>
                          Signature cannot be verified client-side without the secret key.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!token && (
          <div style={{
            textAlign: "center", color: "#2a2a2a",
            fontSize: 12, marginTop: 24, lineHeight: 1.8,
          }}>
            Paste a token above<br />
            <span
              onClick={loadSample}
              style={{ color: "#3a3a3a", cursor: "pointer", fontSize: 11, textDecoration: "underline" }}
            >
              or load a sample
            </span>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      {result?.data && (
        <div style={{
          padding: "6px 14px",
          borderTop: "1px solid #1e1e1e",
          display: "flex", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: 10, color: "#2e2e2e",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {result.data.header.alg} · {result.data.header.typ}
          </span>
          <span style={{
            fontSize: 10, color: "#2e2e2e",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {Object.keys(result.data.payload).length} claims
          </span>
        </div>
      )}

      <style>{`
        div::-webkit-scrollbar { width: 3px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        textarea::placeholder { color: #2e2e2e !important; }
      `}</style>
    </motion.div>
  );
};

export default JWTDecoder;