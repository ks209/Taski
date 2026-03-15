import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TIMEOUT_MS = 8000;

const ping = async (url) => {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      signal: controller.signal,
    });
    clearTimeout(timer);
    const latency = Math.round(performance.now() - start);
    return { status: "up", latency };
  } catch (e) {
    const latency = Math.round(performance.now() - start);
    if (e.name === "AbortError") return { status: "timeout", latency };
    // no-cors opaque response still resolves = server reachable
    return { status: "up", latency };
  }
};

const StatusDot = ({ status }) => {
  const colors = {
    up: "#4ade80",
    down: "#f87171",
    timeout: "#fb923c",
    pending: "#71717a",
  };
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: colors[status] || colors.pending,
        boxShadow: status === "up" ? `0 0 6px ${colors.up}66` : "none",
        flexShrink: 0,
      }}
    />
  );
};

const LatencyBar = ({ latency, status }) => {
  if (!latency || status === "down") return null;
  const pct = Math.min((latency / 2000) * 100, 100);
  const color = latency < 300 ? "#4ade80" : latency < 800 ? "#fb923c" : "#f87171";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 48, height: 3, background: "#222",
        borderRadius: 2, overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: color, borderRadius: 2,
          transition: "width 0.4s ease",
        }} />
      </div>
      <span style={{ color, fontSize: 10, fontFamily: "monospace", minWidth: 36 }}>
        {latency}ms
      </span>
    </div>
  );
};

const ApiStatusBoard = ({ motionRef }) => {
  const [entries, setEntries] = useState([
    { id: 1, url: "https://api.github.com", status: "pending", latency: null, checking: false },
    { id: 2, url: "https://httpbin.org/get", status: "pending", latency: null, checking: false },
  ]);
  const [input, setInput] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const intervalRef = useRef(null);
  const inputRef = useRef(null);

  const updateEntry = (id, patch) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const checkOne = useCallback(async (entry) => {
    updateEntry(entry.id, { checking: true });
    const result = await ping(entry.url);
    updateEntry(entry.id, { ...result, checking: false });
  }, []);

  const checkAll = useCallback(async (list) => {
    const targets = list || entries;
    setEntries((prev) => prev.map((e) => ({ ...e, checking: true })));
    const results = await Promise.all(targets.map((e) => ping(e.url)));
    setEntries((prev) =>
      prev.map((e, i) => ({ ...e, ...results[i], checking: false }))
    );
    setLastChecked(new Date());
  }, [entries]);

  const addUrl = () => {
    let url = input.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    const newEntry = { id: Date.now(), url, status: "pending", latency: null, checking: false };
    setEntries((prev) => [...prev, newEntry]);
    setInput("");
    // auto-ping new entry
    setTimeout(() => checkOne(newEntry), 100);
  };

  const removeEntry = (id) =>
    setEntries((prev) => prev.filter((e) => e.id !== id));

  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      clearInterval(intervalRef.current);
      setAutoRefresh(false);
    } else {
      checkAll();
      intervalRef.current = setInterval(() => checkAll(), 30000);
      setAutoRefresh(true);
    }
  };

  const upCount = entries.filter((e) => e.status === "up").length;
  const downCount = entries.filter((e) => e.status === "down" || e.status === "timeout").length;

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
        width: 360,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "absolute",
        top: 16,
        right: 16,
        maxHeight: "88vh",
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
          <div style={{ display: "flex", gap: 4 }}>
            <span style={{ fontSize: 11, color: "#4ade80" }}>↑{upCount}</span>
            <span style={{ fontSize: 11, color: "#444" }}>/</span>
            <span style={{ fontSize: 11, color: downCount > 0 ? "#f87171" : "#444" }}>
              ↓{downCount}
            </span>
          </div>
          <span style={{ color: "#e5e5e5", fontSize: 13, fontWeight: 600 }}>
            API Status
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={toggleAutoRefresh}
            title="Auto-refresh every 30s"
            style={{
              background: autoRefresh ? "#4ade8018" : "transparent",
              border: "1px solid",
              borderColor: autoRefresh ? "#4ade8050" : "#333",
              color: autoRefresh ? "#4ade80" : "#666",
              fontSize: 10, fontWeight: 500,
              padding: "4px 9px", borderRadius: 6,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {autoRefresh ? "⏸ auto" : "⏱ auto"}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => checkAll()}
            style={{
              background: "transparent",
              border: "1px solid #333",
              color: "#aaa",
              fontSize: 10, fontWeight: 500,
              padding: "4px 9px", borderRadius: 6,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            ↻ check all
          </motion.button>
        </div>
      </div>

      {/* Add URL */}
      <div style={{
        padding: "8px 12px",
        borderBottom: "1px solid #1e1e1e",
        display: "flex", gap: 6,
        flexShrink: 0,
      }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 6,
          background: "#1a1a1a", border: "1px solid #2a2a2a",
          borderRadius: 7, padding: "6px 10px",
        }}>
          <span style={{ color: "#444", fontSize: 11, flexShrink: 0 }}>https://</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addUrl()}
            placeholder="api.example.com/health"
            style={{
              flex: 1, background: "transparent", border: "none",
              outline: "none", color: "#ddd", fontSize: 12,
              fontFamily: "inherit", caretColor: "#4ade80",
            }}
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={addUrl}
          style={{
            background: "#1e1e1e", border: "1px solid #333",
            color: "#ccc", fontSize: 11, fontWeight: 600,
            padding: "0 12px", borderRadius: 7,
            cursor: "pointer", fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          + Add
        </motion.button>
      </div>

      {/* Entries */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "6px 10px 10px",
        display: "flex", flexDirection: "column", gap: 3,
      }}>
        <AnimatePresence>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.15 }}
              style={{
                background: "#1a1a1a",
                border: "1px solid #242424",
                borderRadius: 8,
                padding: "9px 11px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StatusDot status={entry.checking ? "pending" : entry.status} />
                <span style={{
                  flex: 1, fontSize: 12, color: "#c8c8c8",
                  fontFamily: "'JetBrains Mono', monospace",
                  whiteSpace: "nowrap", overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {entry.url.replace(/^https?:\/\//, "")}
                </span>
                <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => checkOne(entry)}
                    disabled={entry.checking}
                    style={{
                      background: "transparent", border: "1px solid #2e2e2e",
                      color: entry.checking ? "#444" : "#666",
                      fontSize: 10, padding: "2px 7px", borderRadius: 4,
                      cursor: entry.checking ? "default" : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {entry.checking ? "···" : "ping"}
                  </motion.button>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    style={{
                      background: "none", border: "none",
                      color: "#3a3a3a", fontSize: 13,
                      cursor: "pointer", padding: "0 2px", lineHeight: 1,
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#f87171")}
                    onMouseLeave={(e) => (e.target.style.color = "#3a3a3a")}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Bottom row — status + latency */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: 10, fontWeight: 500, letterSpacing: "0.04em",
                  color: entry.checking
                    ? "#555"
                    : entry.status === "up"
                    ? "#4ade80"
                    : entry.status === "timeout"
                    ? "#fb923c"
                    : entry.status === "down"
                    ? "#f87171"
                    : "#555",
                }}>
                  {entry.checking
                    ? "checking..."
                    : entry.status === "up"
                    ? "operational"
                    : entry.status === "timeout"
                    ? "timed out"
                    : entry.status === "down"
                    ? "unreachable"
                    : "not checked"}
                </span>
                {!entry.checking && (
                  <LatencyBar latency={entry.latency} status={entry.status} />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {entries.length === 0 && (
          <div style={{
            color: "#2e2e2e", fontSize: 12, textAlign: "center", marginTop: 32,
          }}>
            No endpoints added yet
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "6px 14px",
        borderTop: "1px solid #1e1e1e",
        display: "flex", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{ color: "#2e2e2e", fontSize: 10 }}>
          {entries.length} endpoint{entries.length !== 1 ? "s" : ""}
        </span>
        <span style={{ color: "#2e2e2e", fontSize: 10 }}>
          {lastChecked ? `last checked ${lastChecked.toLocaleTimeString()}` : "not checked yet"}
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

export default ApiStatusBoard;