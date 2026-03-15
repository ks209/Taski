import { useMotionValue } from "framer-motion";
import { useEffect } from "react";

export const useWidgetPosition = (key, defaultPos = { x: 16, y: 16 }) => {
  const stored = (() => {
    try {
      const raw = localStorage.getItem(`widget_pos_${key}`);
      return raw ? JSON.parse(raw) : defaultPos;
    } catch {
      return defaultPos;
    }
  })();

  const x = useMotionValue(stored.x);
  const y = useMotionValue(stored.y);

  const onDragEnd = () => {
    localStorage.setItem(
      `widget_pos_${key}`,
      JSON.stringify({ x: x.get(), y: y.get() })
    );
  };

  return { x, y, onDragEnd };
};