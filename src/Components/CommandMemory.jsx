import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "dev_commands";

const CommandMemory = ({ motionRef }) => {
  const [commands, setCommands] = useState([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [command, setCommand] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setCommands(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (showAdd) setTimeout(() => inputRef.current?.focus(), 50);
  }, [showAdd]);

  const save = (data) => {
    setCommands(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const addCommand = () => {
    if (!title.trim() || !command.trim()) return;
    save([{ id: Date.now(), title: title.trim(), command: command.trim() }, ...commands]);
    setTitle(""); setCommand(""); setShowAdd(false);
  };

  const removeCommand = (id) => save(commands.filter((c) => c.id !== id));

  const copy = (cmd, id) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filtered = commands.filter((c) =>
    (c.title + c.command).toLowerCase().includes(search.toLowerCase())
  );

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
        width: 340,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "absolute",
        top: 16,
        left: 16,
        maxHeight: "85vh",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "12px 14px",
        borderBottom: "1px solid #222",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
        background: "#141414",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 6px #4ade8088",
          }} />
          <span style={{ color: "#e5e5e5", fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Commands
          </span>
          <span style={{
            background: "#252525", color: "#666", fontSize: 10,
            padding: "1px 7px", borderRadius: 20, fontWeight: 500,
          }}>
            {commands.length}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setShowAdd((p) => !p)}
          style={{
            background: showAdd ? "#252525" : "#1e1e1e",
            border: "1px solid #333",
            color: showAdd ? "#999" : "#ccc",
            fontSize: 11, fontWeight: 500,
            padding: "4px 10px", borderRadius: 6,
            cursor: "pointer", fontFamily: "inherit",
            letterSpacing: "0.01em",
          }}
        >
          {showAdd ? "✕ cancel" : "+ add"}
        </motion.button>
      </div>

      {/* Search */}
      <div style={{
        padding: "8px 14px",
        borderBottom: "1px solid #1e1e1e",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#1a1a1a", border: "1px solid #2a2a2a",
          borderRadius: 7, padding: "7px 10px",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands..."
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#ddd", fontSize: 12, caretColor: "#4ade80",
              fontFamily: "inherit",
            }}
          />
          {search && (
            <span style={{ color: "#444", fontSize: 10 }}>{filtered.length}</span>
          )}
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16 }}
            style={{ overflow: "hidden", flexShrink: 0 }}
          >
            <div style={{
              padding: "10px 14px 12px",
              borderBottom: "1px solid #222",
              background: "#181818",
              display: "flex", flexDirection: "column", gap: 7,
            }}>
              <input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title  (e.g. Start Kafka)"
                style={{
                  background: "#1e1e1e", border: "1px solid #2e2e2e",
                  borderRadius: 6, padding: "7px 10px",
                  color: "#e0e0e0", fontSize: 12, outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) addCommand(); }}
                placeholder="Command"
                style={{
                  background: "#1e1e1e", border: "1px solid #2e2e2e",
                  borderRadius: 6, padding: "7px 10px",
                  color: "#a3e6a3", fontSize: 11.5,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  outline: "none", resize: "none", height: 60, lineHeight: 1.6,
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#3a3a3a", fontSize: 10 }}>ctrl+enter to save</span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={addCommand}
                  style={{
                    background: "#4ade80", color: "#0a0a0a",
                    border: "none", borderRadius: 6,
                    fontSize: 11, fontWeight: 700,
                    padding: "6px 14px", cursor: "pointer",
                    fontFamily: "inherit", letterSpacing: "0.02em",
                  }}
                >
                  Save
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Commands list — always expanded, no clicking */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "6px 10px 10px",
        display: "flex", flexDirection: "column", gap: 3,
      }}>
        <AnimatePresence>
          {filtered.map((c, idx) => {
            const isCopied = copiedId === c.id;
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.13, delay: idx * 0.02 }}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid",
                  borderColor: isCopied ? "#4ade8040" : "#242424",
                  borderRadius: 8,
                  padding: "9px 11px",
                  transition: "border-color 0.2s",
                }}
              >
                {/* Title row */}
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", marginBottom: 5,
                }}>
                  <span style={{
                    color: "#d4d4d4", fontSize: 12, fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}>
                    {c.title}
                  </span>
                  <button
                    onClick={() => removeCommand(c.id)}
                    style={{
                      background: "none", border: "none",
                      color: "#3a3a3a", fontSize: 13,
                      cursor: "pointer", padding: "0 2px",
                      lineHeight: 1,
                    }}
                    onMouseEnter={(e) => e.target.style.color = "#ff6b6b"}
                    onMouseLeave={(e) => e.target.style.color = "#3a3a3a"}
                  >
                    ✕
                  </button>
                </div>

                {/* Command + copy on same row */}
                <div style={{
                  display: "flex", alignItems: "flex-start",
                  gap: 8, background: "#111",
                  border: "1px solid #222",
                  borderRadius: 5, padding: "7px 9px",
                }}>
                  <pre style={{
                    flex: 1, margin: 0,
                    color: "#86efac",
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    whiteSpace: "pre-wrap", wordBreak: "break-all",
                    lineHeight: 1.6,
                  }}>
                    {c.command}
                  </pre>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copy(c.command, c.id)}
                    style={{
                      background: isCopied ? "#4ade8022" : "transparent",
                      border: "1px solid",
                      borderColor: isCopied ? "#4ade8066" : "#333",
                      color: isCopied ? "#4ade80" : "#555",
                      fontSize: 10, fontWeight: 500,
                      padding: "3px 8px", borderRadius: 4,
                      cursor: "pointer", flexShrink: 0,
                      fontFamily: "inherit",
                      transition: "all 0.18s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isCopied ? "✓ copied" : "copy"}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div style={{
            color: "#2e2e2e", fontSize: 12, textAlign: "center",
            marginTop: 32, letterSpacing: "0.02em",
          }}>
            {commands.length === 0 ? "No commands yet" : "No results"}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "7px 14px",
        borderTop: "1px solid #1e1e1e",
        display: "flex", justifyContent: "flex-end",
        flexShrink: 0,
      }}>
        <span style={{ color: "#2e2e2e", fontSize: 10 }}>
          click command to copy
        </span>
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

export default CommandMemory;