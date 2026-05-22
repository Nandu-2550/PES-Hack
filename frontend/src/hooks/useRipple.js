import { useCallback, useEffect, useRef, useState } from "react";

export default function useRipple() {
  const buttonRef = useRef(null);
  const [ripples, setRipples] = useState([]);
  const timeoutIds = useRef([]);

  const createRipple = useCallback((event) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const id = Date.now() + Math.random();

    setRipples((current) => [...current, { id, x, y, size }]);

    const timeoutId = window.setTimeout(() => {
      setRipples((current) => current.filter((r) => r.id !== id));
    }, 600);

    timeoutIds.current.push(timeoutId);
  }, []);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseDown = (event) => {
      if (event.button !== 0) return;
      createRipple(event);
    };

    button.addEventListener("mousedown", handleMouseDown);
    return () => {
      button.removeEventListener("mousedown", handleMouseDown);
      timeoutIds.current.forEach(window.clearTimeout);
      timeoutIds.current = [];
    };
  }, [createRipple]);

  return { buttonRef, ripples };
}
