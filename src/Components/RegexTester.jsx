import React, { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";

const FLAGS = ["g", "i", "m", "s"];

const RegexTester = ({ motionRef }) => {
  const [pattern, setPattern]     = useState("(\\w+)@(\\w+\\.\\w+)");
  const [flags, setFlags]         = useState(["g", "i"]);
  const [testStr, setTestStr]     = useState("Contact us at hello@example.com or support@dev.io for help.");
  const [copiedMatch, setCopiedMatch] = useState(null);

  const toggleFlag = (f) =>
    setFlags((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  const result = useMemo(() => {
    if (!pattern) return { error: null, matches: [], segments: [{ text: testStr, match: false }] };
    try {
      const re = new RegExp(pattern, flags.join(""));
      const matches = [];
      let m;
      const clone = new RegExp(pattern, flags.includes("g") ? flags.join("") : flags.join("") + "g");
      while ((m = clone.exec(testStr)) !== null) {
        matches.push({
          index: m.index,
          length: m[0].length,
          value: m[0],
          groups: m.slice(1),
        });
        if (!flags.includes("g")) break;
      }

      // build highlighted segments
      const segments = [];
      let cursor = 0;
      for (const match of matches) {
        if (match.index > cursor)
          segments.push({ text: testStr.slice(cursor, match.index), match: false });
        segments.push({ text: testStr.slice(match.index, match.index + match.length), match: true });
        cursor = match.index + match.length;
      }
      if (cursor < testStr.length)
        segments.push({ text: testStr.slice(cursor), match: false });

      return { error: null, matches, segments };
    } catch (e) {
      return { error: e.message, matches: [], segments: [] };
    }
  }, [pattern, flags, testStr]);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMatch(id);
    setTimeout(() => setCopiedMatch(null), 1500);
  };

  return (
    <motion.div
      ref={motionRef}
      drag
      dragElastic={0}
      dragMomentum={false}
      whileDrag={{ scale: 1.01 }}
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: "#141414",
        border: "1px solid #2a2a2a",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        width: 380,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "absolute",
        top: 16,
        left: 16,
        maxHeight: "90vh",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "12px 14px",
        borderBottom: "1px solid #222",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: result.error ? "#f87171" : result.matches.length > 0 ? "#4ade80" : "#3f3f46",
            boxShadow: !result.error && result.matches.length > 0 ? "0 0 6px #4ade8088" : "none",
            transition: "all 0.2s",
          }} />
          <span style={{ color: "#e5e5e5", fontSize: 13, fontWeight: 600 }}>
            Regex Tester
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {FLAGS.map((f) => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleFlag(f)}
              style={{
                background: flags.includes(f) ? "#4ade8020" : "transparent",
                border: "1px solid",
                borderColor: flags.includes(f) ? "#4ade8055" : "#2e2e2e",
                color: flags.includes(f) ? "#4ade80" : "#555",
                fontSize: 10, fontWeight: 600,
                width: 22, height: 22,
                borderRadius: 5,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              {f}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Pattern input */}
      <div style={{
        padding: "10px 14px 8px",
        borderBottom: "1px solid #1e1e1e",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          background: "#1a1a1a",
          border: "1px solid",
          borderColor: result.error ? "#f8717155" : "#2a2a2a",
          borderRadius: 7, overflow: "hidden",
          transition: "border-color 0.2s",
        }}>
          <span style={{
            padding: "8px 10px",
            color: "#555", fontSize: 15,
            fontFamily: "'JetBrains Mono', monospace",
            borderRight: "1px solid #2a2a2a",
            userSelect: "none",
          }}>/</span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="pattern"
            spellCheck={false}
            style={{
              flex: 1, background: "transparent",
              border: "none", outline: "none",
              color: "#e879f9",
              fontSize: 12.5,
              fontFamily: "'JetBrains Mono', monospace",
              padding: "8px 8px",
              caretColor: "#e879f9",
            }}
          />
          <span style={{
            padding: "8px 10px",
            color: "#4ade8099", fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            borderLeft: "1px solid #2a2a2a",
            userSelect: "none",
          }}>/{flags.join("")}</span>
        </div>
        {result.error && (
          <p style={{
            color: "#f87171", fontSize: 10.5,
            marginTop: 5, fontFamily: "'JetBrains Mono', monospace",
          }}>
            ✕ {result.error}
          </p>
        )}
      </div>

      {/* Test string */}
      <div style={{ padding: "8px 14px", borderBottom: "1px solid #1e1e1e", flexShrink: 0 }}>
        <div style={{
          fontSize: 9, color: "#444", letterSpacing: "0.1em",
          fontWeight: 600, marginBottom: 5,
        }}>
          TEST STRING
        </div>
        <textarea
          value={testStr}
          onChange={(e) => setTestStr(e.target.value)}
          placeholder="Paste text to test against..."
          spellCheck={false}
          style={{
            width: "100%", background: "#1a1a1a",
            border: "1px solid #2a2a2a", borderRadius: 7,
            padding: "8px 10px", color: "#bbb",
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            outline: "none", resize: "none",
            height: 72, lineHeight: 1.6,
            boxSizing: "border-box",
            caretColor: "#4ade80",
          }}
        />
      </div>

      {/* Highlighted preview */}
      <div style={{ padding: "8px 14px", borderBottom: "1px solid #1e1e1e", flexShrink: 0 }}>
        <div style={{
          fontSize: 9, color: "#444", letterSpacing: "0.1em",
          fontWeight: 600, marginBottom: 5,
        }}>
          PREVIEW
        </div>
        <div style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: 7, padding: "8px 10px",
          fontSize: 12, lineHeight: 1.8,
          fontFamily: "'JetBrains Mono', monospace",
          color: "#888",
          wordBreak: "break-all",
          minHeight: 38,
        }}>
          {testStr
            ? result.segments.map((seg, i) =>
                seg.match ? (
                  <mark
                    key={i}
                    style={{
                      background: "#4ade8025",
                      color: "#4ade80",
                      borderRadius: 3,
                      padding: "1px 0",
                      outline: "1px solid #4ade8040",
                    }}
                  >
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )
            : <span style={{ color: "#333" }}>No test string</span>
          }
        </div>
      </div>

      {/* Match list */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "6px 10px 10px",
        display: "flex", flexDirection: "column", gap: 3,
      }}>
        {/* Stats row */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 2px 6px",
        }}>
          <span style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em", fontWeight: 600 }}>
            MATCHES
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: result.matches.length > 0 ? "#4ade80" : "#3f3f46",
            background: result.matches.length > 0 ? "#4ade8015" : "#1a1a1a",
            border: "1px solid",
            borderColor: result.matches.length > 0 ? "#4ade8030" : "#2a2a2a",
            borderRadius: 20, padding: "1px 8px",
          }}>
            {result.matches.length} found
          </span>
        </div>

        {result.matches.length === 0 && !result.error && (
          <div style={{
            color: "#2e2e2e", fontSize: 12,
            textAlign: "center", marginTop: 16,
          }}>
            {pattern ? "No matches" : "Enter a pattern"}
          </div>
        )}

        {result.matches.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1, delay: i * 0.03 }}
            style={{
              background: "#1a1a1a",
              border: "1px solid #242424",
              borderRadius: 8,
              padding: "8px 10px",
              display: "flex", flexDirection: "column", gap: 5,
            }}
          >
            {/* Match value + copy */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 9, color: "#4ade8066",
                fontFamily: "'JetBrains Mono', monospace",
                flexShrink: 0,
              }}>
                #{i + 1}
              </span>
              <span style={{
                flex: 1,
                color: "#4ade80",
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                background: "#4ade8010",
                border: "1px solid #4ade8025",
                borderRadius: 4, padding: "2px 7px",
                overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {m.value}
              </span>
              <span style={{ fontSize: 10, color: "#3f3f46", flexShrink: 0 }}>
                @{m.index}
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => copy(m.value, i)}
                style={{
                  background: copiedMatch === i ? "#4ade8020" : "transparent",
                  border: "1px solid",
                  borderColor: copiedMatch === i ? "#4ade8055" : "#2e2e2e",
                  color: copiedMatch === i ? "#4ade80" : "#555",
                  fontSize: 10, padding: "2px 7px",
                  borderRadius: 4, cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.18s",
                  flexShrink: 0, whiteSpace: "nowrap",
                }}
              >
                {copiedMatch === i ? "✓" : "copy"}
              </motion.button>
            </div>

            {/* Capture groups */}
            {m.groups.filter(Boolean).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, paddingLeft: 18 }}>
                {m.groups.map((g, gi) =>
                  g != null ? (
                    <span
                      key={gi}
                      style={{
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                        background: "#1e1e1e",
                        border: "1px solid #2e2e2e",
                        borderRadius: 4, padding: "1px 6px",
                        color: "#a78bfa",
                      }}
                    >
                      <span style={{ color: "#444", marginRight: 3 }}>g{gi + 1}</span>
                      {g}
                    </span>
                  ) : null
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <style>{`
        div::-webkit-scrollbar { width: 3px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        input::placeholder, textarea::placeholder { color: #333 !important; }
      `}</style>
    </motion.div>
  );
};

export default RegexTester;