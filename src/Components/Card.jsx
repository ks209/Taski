import React, { useState, useEffect } from "react";
import { FaRegFileAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { GoArrowDownRight } from "react-icons/go";
import { motion } from "framer-motion";

const Card = ({ data, reference, onToggleCompleted, onRemove }) => {
  const [size, setSize] = useState({ width: 220, height: 240 });
  const [isResizing, setIsResizing] = useState(false);

  const MIN_WIDTH = 200;
  const MIN_HEIGHT = 200;
  const MAX_WIDTH = 500;
  const MAX_HEIGHT = 400;

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;

    setSize((prev) => ({
      width: Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, prev.width + e.movementX)
      ),
      height: Math.min(
        MAX_HEIGHT,
        Math.max(MIN_HEIGHT, prev.height + e.movementY)
      ),
    }));
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", stopResizing);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  return (
    <motion.div
      drag={!isResizing}
      dragConstraints={reference}
      whileDrag={{
        scale: 1.05,
        boxShadow: "0px 20px 40px rgba(0,0,0,0.5)",
      }}
      dragTransition={{ bounceStiffness: 120, bounceDamping: 14 }}
      className="
        relative
        bg-zinc-900/90
        backdrop-blur-md
        border border-zinc-700
        rounded-xl
        text-white
        shadow-lg
        flex flex-col
        overflow-hidden
      "
      style={{ width: size.width, height: size.height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700">
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
          <FaRegFileAlt />
          <span className="font-medium">Task</span>
        </div>

        <button
          onClick={onRemove}
          className="text-zinc-400 hover:text-red-400 transition"
        >
          <IoClose size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 p-4 overflow-hidden">
        <div className="text-sm font-semibold break-words leading-snug">
          {data.text}
        </div>
      </div>

      {/* Status */}
      <button
        onClick={onToggleCompleted}
        className={`text-xs py-2 text-center transition
        ${
          data.completed
            ? "bg-green-700/40 text-green-300"
            : "bg-red-700/40 text-red-300"
        }`}
      >
        {data.completed ? "Completed" : "Pending"}
      </button>

      {/* Resize Handle */}
      <div
        onMouseDown={startResizing}
        className="
          absolute bottom-1 right-1
          text-zinc-400
          hover:text-white
          cursor-se-resize
          p-1
        "
      >
        <GoArrowDownRight size={16} />
      </div>
    </motion.div>
  );
};

export default Card;