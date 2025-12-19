"use client";

const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f14] to-[#0a0a0f]" />

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(192,192,192,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(192,192,192,1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Radial glow - top */}
      <div className="absolute -top-[40%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-gradient-radial from-silver-400/[0.07] via-silver-400/[0.02] to-transparent rounded-full blur-3xl" />

      {/* Radial glow - bottom left */}
      <div className="absolute -bottom-[20%] -left-[20%] w-[50%] h-[50%] bg-gradient-radial from-silver-500/[0.05] via-transparent to-transparent rounded-full blur-3xl" />

      {/* Radial glow - right */}
      <div className="absolute top-1/2 -right-[10%] w-[40%] h-[60%] bg-gradient-radial from-silver-400/[0.03] via-transparent to-transparent rounded-full blur-3xl" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-silver-300/30 rounded-full animate-float blur-sm" />
      <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-silver-400/40 rounded-full animate-float animation-delay-2000" />
      <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-silver-300/20 rounded-full animate-float animation-delay-4000" />

      {/* Noise texture */}
      <div className="noise-overlay" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50" />
    </div>
  );
};

export default BackgroundEffects;