import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import useRipple from "../../hooks/useRipple";

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-7 py-3 text-base",
  lg: "px-9 py-4 text-lg",
};

const variantClasses = {
  primary:
    "rounded-lg font-semibold tracking-wide transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#40916c] select-none bg-[#40916c] text-white hover:bg-[#2d6a4f] hover:scale-[1.03] hover:shadow-[0_4px_24px_rgba(45,106,79,0.45)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
  secondary:
    "rounded-lg font-semibold tracking-wide transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1b4332] select-none bg-[#1b4332] text-white border border-[#2d6a4f] hover:bg-[#2d6a4f] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
  ghost:
    "rounded-lg font-semibold tracking-wide transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#40916c] select-none bg-transparent text-[#40916c] border border-[#40916c] hover:bg-[#40916c]/10 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
  data:
    "rounded-lg font-semibold tracking-wide transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e9c46a]/40 select-none bg-[#1a1f1c] text-[#e9c46a] border border-[#e9c46a]/40 overflow-hidden relative hover:shadow-[0_0_16px_rgba(233,196,106,0.3)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
};

const baseButtonClasses =
  "inline-flex items-center justify-center gap-2 text-center whitespace-nowrap";

const pulseBorderAnimation = {
  borderColor: [
    "rgba(233,196,106,0.3)",
    "rgba(233,196,106,0.9)",
    "rgba(233,196,106,0.3)",
  ],
};

const pulseTransition = {
  duration: 2.5,
  repeat: Infinity,
  repeatType: "reverse",
  ease: "easeInOut",
};

const AgriButton = ({
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  children,
  className = "",
}) => {
  const { buttonRef, ripples } = useRipple();
  const [isHovered, setIsHovered] = useState(false);
  const isDataVariant = variant === "data";

  const buttonClassName = useMemo(
    () =>
      [baseButtonClasses, sizeClasses[size], variantClasses[variant], className]
        .filter(Boolean)
        .join(" "),
    [size, variant, className]
  );

  const wrapperProps = isDataVariant
    ? {
        animate: pulseBorderAnimation,
        transition: pulseTransition,
        style: {
          borderStyle: "solid",
          borderWidth: "1px",
          borderColor: "rgba(233,196,106,0.3)",
          borderRadius: "14px",
          display: "inline-block",
        },
      }
    : {};

  return (
    <motion.div {...wrapperProps}>
      <motion.button
        ref={buttonRef}
        type="button"
        className={`${buttonClassName} ${isDataVariant && isHovered ? "agri-button__data-hover" : ""}`}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled}
        aria-disabled={disabled}
        whileHover={!isDataVariant ? { scale: 1.03 } : undefined}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            className="pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35)_0%,transparent_70%)] opacity-90 animate-ripple"
          />
        ))}
        <span className="relative z-10">{children}</span>
      </motion.button>
    </motion.div>
  );
};

export default AgriButton;
