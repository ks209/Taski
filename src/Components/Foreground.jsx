import React, { useRef, useState } from 'react';
import Card from './Card';
import Player from './Player';
import DevMusic from './DevMusic';
import CommandMemory from './CommandMemory';
import ApiStatusBoard from './ApiStatusBoard';
import RegexTester from './RegexTester';
import CronEvaluator from './CronEvaluator';
import JWTDecoder from './JwtDecoder';
import WaterTracker from './WaterTracker';

import { IoIosAdd } from "react-icons/io";
import { SiYoutubemusic } from "react-icons/si";
import { BsLayoutTextSidebarReverse } from "react-icons/bs";
import { MdOutlineMonitor } from "react-icons/md";
import { RiPlayListLine } from "react-icons/ri";
import { TbRegex } from "react-icons/tb";
import { LuClock4 } from "react-icons/lu";
import { LuKeyRound } from "react-icons/lu";
import { TbDroplet } from "react-icons/tb";

const STORAGE_KEY = "my_to_dos";

const DockBtn = ({ icon: Icon, label, active, onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: active ? "#ffffff18" : "transparent",
          border: "1px solid",
          borderColor: active ? "#ffffff30" : "transparent",
          borderRadius: 10,
          padding: 8,
          cursor: "pointer",
          color: active ? "#fff" : "#666",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          fontSize: 20,
          position: "relative",
        }}
      >
        <Icon />
        {active && (
          <span style={{
            position: "absolute",
            bottom: 3,
            left: "50%",
            transform: "translateX(-50%)",
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "#4ade80",
          }} />
        )}
      </button>

      {hover && (
        <div style={{
          position: "absolute",
          left: "calc(100% + 10px)",
          top: "50%",
          transform: "translateY(-50%)",
          background: "#1a1a1a",
          border: "1px solid #333",
          color: "#ccc",
          fontSize: 11,
          fontWeight: 500,
          padding: "4px 10px",
          borderRadius: 6,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 100,
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
          {label}
        </div>
      )}
    </div>
  );
};

const Divider = () => (
  <div style={{ width: "60%", height: 1, background: "#1e1e1e", margin: "2px 0" }} />
);

const Foreground = () => {
  const ref = useRef(null);

  const [showAddTask,  setShowAddTask]  = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showDevMusic, setShowDevMusic] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [showApiBoard, setShowApiBoard] = useState(false);
  const [showRegex,    setShowRegex]    = useState(false);
  const [showCron,     setShowCron]     = useState(false);
  const [showJWT,      setShowJWT]      = useState(false);
  const [showWater,    setShowWater]    = useState(false);

  const [task, setTask] = useState('');
  const [todos, setTodos] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const saveTodos = (data) => {
    setTodos(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const addTodo = () => {
    if (!task.trim()) return;
    saveTodos([...todos, { text: task.trim(), completed: false }]);
    setTask('');
    setShowAddTask(false);
  };

  const toggleCompleted = (i) => {
    const next = [...todos];
    next[i].completed = !next[i].completed;
    saveTodos(next);
  };

  const removeTodo = (i) => {
    const next = [...todos];
    next.splice(i, 1);
    saveTodos(next);
  };

  return (
    <div ref={ref} className="top-0 left-0 z-[3] w-full h-full flex gap-3 p-4 relative">

      {/* ── Dock ── */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        background: "#0f0f0f",
        border: "1px solid #1e1e1e",
        borderRadius: 14,
        padding: "10px 6px",
        height: "fit-content",
        zIndex: 10,
        flexShrink: 0,
      }}>

        <DockBtn icon={IoIosAdd}                  label="Add task"   active={showAddTask}  onClick={() => setShowAddTask(p => !p)} />

        <Divider />

        <DockBtn icon={RiPlayListLine}             label="Playlist"   active={showPlaylist} onClick={() => setShowPlaylist(p => !p)} />
        <DockBtn icon={SiYoutubemusic}             label="Dev.FM"     active={showDevMusic} onClick={() => setShowDevMusic(p => !p)} />

        <Divider />

        <DockBtn icon={BsLayoutTextSidebarReverse} label="Commands"   active={showCommands} onClick={() => setShowCommands(p => !p)} />
        <DockBtn icon={MdOutlineMonitor}           label="API Status" active={showApiBoard} onClick={() => setShowApiBoard(p => !p)} />
        <DockBtn icon={TbRegex}                    label="Regex"      active={showRegex}    onClick={() => setShowRegex(p => !p)} />

        <Divider />

        <DockBtn icon={LuClock4}                   label="Cron"       active={showCron}     onClick={() => setShowCron(p => !p)} />
        <DockBtn icon={LuKeyRound}                 label="JWT"        active={showJWT}      onClick={() => setShowJWT(p => !p)} />
        <DockBtn icon={TbDroplet}                  label="Water"      active={showWater}    onClick={() => setShowWater(p => !p)} />

      </div>

      {/* ── Add Task form ── */}
      {showAddTask && (
        <div style={{
          background: "#141414",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: "12px 14px",
          height: "fit-content",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flexShrink: 0,
          zIndex: 10,
          fontFamily: "'DM Sans', system-ui, sans-serif",
          width: 220,
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        }}>
          <span style={{ color: "#888", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" }}>
            NEW TASK
          </span>
          <input
            autoFocus
            type="text"
            placeholder="Task name"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            style={{
              background: "#1a1a1a", border: "1px solid #2e2e2e",
              borderRadius: 7, padding: "7px 10px",
              color: "#e0e0e0", fontSize: 12, outline: "none",
              fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={addTodo}
              style={{
                flex: 1, background: "#4ade80", color: "#0a0a0a",
                border: "none", borderRadius: 7, padding: "7px 0",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Add
            </button>
            <button
              onClick={() => setShowAddTask(false)}
              style={{
                background: "#1e1e1e", color: "#666",
                border: "1px solid #2e2e2e", borderRadius: 7,
                padding: "7px 10px", fontSize: 12,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Widget canvas ── */}
      <div ref={ref} className="relative w-full h-full">
        {showPlaylist && <Player reference={ref} />}
        {showDevMusic && <DevMusic reference={ref} />}
        {showCommands && <CommandMemory motionRef={ref} />}
        {showApiBoard && <ApiStatusBoard motionRef={ref} />}
        {showRegex    && <RegexTester motionRef={ref} />}
        {showCron     && <CronEvaluator motionRef={ref} />}
        {showJWT      && <JWTDecoder motionRef={ref} />}
        {showWater    && <WaterTracker motionRef={ref} />}

        {todos.map((todo, index) => (
          <Card
            key={index}
            data={todo}
            completed={todo.completed}
            onToggleCompleted={() => toggleCompleted(index)}
            onRemove={() => removeTodo(index)}
            reference={ref}
          />
        ))}
      </div>
    </div>
  );
};

export default Foreground;