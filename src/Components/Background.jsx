import React, { useState } from 'react';
import { AnimatePresence } from "framer-motion";
import Clock from './Clock';
import ClockWallpaper from './ClockWallpaper';

const Background = () => {
  const [showClock, setShowClock] = useState(false);

  return (
    <>
      <div
        className='fixed z-[2] w-full h-screen'
        style={{ pointerEvents: "none" }}  // ← whole layer is click-through
      >
        <div className='absolute top-[5%] w-full py-10 flex justify-center text-zinc-600 font-semibold text-xl'>
          Efficient Worker
        </div>

        <h1 className='absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%] text-[13vw] tracking-tighter leading-none font-semibold text-zinc-900'>
          Tasks.
        </h1>

        <Clock />

        {/* Clock toggle — re-enable pointer events just for this button */}
        <button
          onClick={() => setShowClock(true)}
          style={{
            pointerEvents: "auto",          // ← only this is clickable
            position: "absolute",
            bottom: 28,
            right: 28,
            background: "transparent",
            border: "1px solid #27272a",
            color: "#3f3f46",
            fontSize: 11,
            padding: "6px 14px",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            letterSpacing: "0.06em",
            transition: "color 0.2s, border-color 0.2s",
            zIndex: 10,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color="#71717a"; e.currentTarget.style.borderColor="#3f3f46"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color="#3f3f46"; e.currentTarget.style.borderColor="#27272a"; }}
        >
          ◷ clock
        </button>
      </div>
      <AnimatePresence>
        {showClock && (
          <ClockWallpaper onClose={() => setShowClock(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Background;