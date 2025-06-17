import React from 'react';

interface VoiceVisualizerProps {
  isActive: boolean;
}

export function VoiceVisualizer({ isActive }: VoiceVisualizerProps) {
  return (
    <div className="flex items-center justify-center space-x-2 h-16 mb-4">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className={`w-2 bg-gradient-to-t from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-300 shadow-lg ${
            isActive ? 'animate-pulse' : ''
          }`}
          style={{
            height: isActive ? `${Math.random() * 40 + 15}px` : '6px',
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${0.6 + Math.random() * 0.8}s`,
            transform: isActive ? `scaleY(${0.8 + Math.random() * 0.4})` : 'scaleY(1)',
          }}
        />
      ))}
    </div>
  );
}