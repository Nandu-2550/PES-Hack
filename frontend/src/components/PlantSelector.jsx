import React from 'react';

const PlantSelector = ({ onSelectPart, selectedPart }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
          @keyframes pulse-glow {
            0% { filter: drop-shadow(0 0 8px rgba(16,185,129,0.3)); }
            50% { filter: drop-shadow(0 0 16px rgba(16,185,129,0.6)); }
            100% { filter: drop-shadow(0 0 8px rgba(16,185,129,0.3)); }
          }
          .plant-part {
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .plant-part:hover {
            transform: scale(1.05);
          }
          .anim-float {
            animation: float 4s ease-in-out infinite;
          }
          .anim-glow {
            animation: pulse-glow 3s infinite;
          }
        `}
      </style>
      <svg width="240" height="340" viewBox="0 0 240 340" className="anim-glow">
        
        {/* LEAF ZONE */}
        <g 
          className="plant-part anim-float"
          onClick={() => onSelectPart("Leaf")}
          style={{ transformOrigin: '120px 100px' }}
        >
          {/* Main big leaf */}
          <path 
            d="M 120 40 Q 180 10 210 80 Q 180 130 120 160 Q 60 130 30 80 Q 60 10 120 40 Z" 
            fill={selectedPart === "Leaf" ? "var(--accent-color)" : "var(--primary-color)"}
            stroke="var(--text-highlight)"
            strokeWidth="3"
            style={{ transition: 'fill 0.3s' }}
          />
          <text x="120" y="105" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold" pointerEvents="none" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>LEAF</text>
        </g>

        {/* STEM ZONE */}
        <g 
          className="plant-part"
          onClick={() => onSelectPart("Stem")}
          style={{ transformOrigin: '120px 210px' }}
        >
          {/* Stem with larger hit area */}
          <rect x="90" y="155" width="60" height="110" fill="transparent" /> 
          <rect 
            x="105" y="155" width="30" height="110" rx="8" 
            fill={selectedPart === "Stem" ? "var(--accent-color)" : "#1C252A"}
            stroke="var(--text-highlight)"
            strokeWidth="3"
            style={{ transition: 'fill 0.3s' }}
          />
          <text x="120" y="215" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" pointerEvents="none" transform="rotate(-90 120,215)" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>STEM</text>
        </g>

        {/* ROOT ZONE */}
        <g 
          className="plant-part"
          onClick={() => onSelectPart("Root")}
          style={{ transformOrigin: '120px 290px' }}
        >
          {/* Roots */}
          <path 
            d="M 80 260 L 95 310 L 120 280 L 145 310 L 160 260 Z" 
            fill={selectedPart === "Root" ? "var(--accent-color)" : "#4E2A12"}
            stroke="var(--text-highlight)"
            strokeWidth="3"
            style={{ transition: 'fill 0.3s' }}
          />
          <text x="120" y="295" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" pointerEvents="none" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>ROOT</text>
        </g>
      </svg>
    </div>
  );
};

export default PlantSelector;
