import { useState, useEffect, useRef, useCallback } from "react";
import { planets, Planet, sunData } from "./data/planets";

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const planetRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const speedRef = useRef<number>(speed);
  const anglesRef = useRef<number[]>(
    planets.map((_, i) => (i * Math.PI * 2) / planets.length)
  );

  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  // Sync refs with state to avoid re-binding animation callbacks
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Update planet DOM positions without triggering React re-renders
  const updatePlanetPositions = useCallback(() => {
    for (let i = 0; i < planets.length; i++) {
      const el = planetRefs.current[i];
      if (el) {
        const angle = anglesRef.current[i];
        const x = 450 + Math.cos(angle) * planets[i].orbitRadius;
        const y = 450 + Math.sin(angle) * planets[i].orbitRadius;
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
    }
  }, []);

  // Responsive scaling calculation
  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Subtract space for header and bottom controls
      const headerHeight = w < 640 ? 60 : 70;
      const controlsHeight = w < 640 ? 110 : 130;
      const availableHeight = Math.max(100, h - headerHeight - controlsHeight);
      const availableWidth = Math.max(100, w - 24);
      const minDim = Math.min(availableWidth, availableHeight);

      // Calculate scale based on 900px canvas size
      const targetScale = Math.max(0.1, Math.min(1, minDim / 920));
      setScale(targetScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // High-performance animation loop: uses direct DOM updates for 60fps smoothness
  useEffect(() => {
    // Initial placement
    updatePlanetPositions();

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (isPlayingRef.current) {
        for (let i = 0; i < planets.length; i++) {
          anglesRef.current[i] +=
            planets[i].speed * speedRef.current * delta * 0.5;
        }
        updatePlanetPositions();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updatePlanetPositions]);

  // Accessibility: manage focus and keyboard events for the modal dialog
  useEffect(() => {
    if (showInfo) {
      lastFocusedElementRef.current = document.activeElement as HTMLElement | null;
      // Focus close button when dialog opens
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") {
          setShowInfo(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    } else {
      // Restore focus when dialog closes
      if (lastFocusedElementRef.current && typeof lastFocusedElementRef.current.focus === "function") {
        lastFocusedElementRef.current.focus();
      }
    }
  }, [showInfo]);

  const handlePlanetClick = (planet: Planet) => {
    setSelectedPlanet(planet);
    setShowInfo(true);
  };

  const handleSunClick = () => {
    setSelectedPlanet(null);
    setShowInfo(true);
  };

  const closeDialog = () => {
    setShowInfo(false);
  };

  const speedOptions = [0.25, 0.5, 1, 2, 5, 10];

  return (
    <div className="w-full h-screen bg-[#0a0a1a] overflow-hidden relative flex flex-col select-none">
      {/* Stars background */}
      <Stars />

      {/* Header */}
      <header className="relative z-10 text-center py-2 sm:py-3 px-2 bg-gradient-to-b from-black/70 to-transparent flex-shrink-0">
        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white tracking-wider flex items-center justify-center gap-2">
          <span>🌌</span>
          <span>互動式太陽系學習演示</span>
        </h1>
        <p className="text-gray-400 text-[11px] sm:text-xs md:text-sm mt-0.5">
          點擊行星或太陽查看詳細資訊
        </p>
      </header>

      {/* Solar System Orbit Canvas Area */}
      <main className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div
          ref={containerRef}
          className="relative transition-transform duration-200 ease-out"
          style={{
            width: "900px",
            height: "900px",
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
          aria-label="太陽系運行圖"
        >
          {/* Orbit paths */}
          {planets.map((planet) => (
            <div
              key={`orbit-${planet.id}`}
              className="absolute rounded-full border border-white/[0.08] pointer-events-none"
              style={{
                width: `${planet.orbitRadius * 2}px`,
                height: `${planet.orbitRadius * 2}px`,
                top: `${450 - planet.orbitRadius}px`,
                left: `${450 - planet.orbitRadius}px`,
              }}
            />
          ))}

          {/* Sun */}
          <button
            type="button"
            className="absolute z-10 group cursor-pointer p-0 border-0 bg-transparent rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400/80"
            style={{
              top: "450px",
              left: "450px",
              transform: "translate(-50%, -50%)",
            }}
            onClick={handleSunClick}
            aria-label="查看太陽詳細資訊"
          >
            {/* Sun hit area */}
            <div className="absolute -inset-4 rounded-full" />
            {/* Sun visual */}
            <div
              className="rounded-full transition-transform duration-200 group-hover:scale-110"
              style={{
                width: "56px",
                height: "56px",
                background:
                  "radial-gradient(circle at 35% 35%, #fffde0, #ffcc00, #ff8c00, #cc5500)",
                boxShadow:
                  "0 0 30px #ffcc00, 0 0 60px #ff8c00, 0 0 100px rgba(255, 140, 0, 0.4), 0 0 150px rgba(255, 140, 0, 0.2)",
                animation: "sunGlow 3s ease-in-out infinite",
              }}
            />
            {/* Sun label on hover */}
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 px-2 py-0.5 rounded border border-yellow-500/20 pointer-events-none">
              太陽
            </div>
          </button>

          {/* Planets */}
          {planets.map((planet, index) => {
            const isHovered = hoveredPlanet === planet.id;
            const isSelected = selectedPlanet?.id === planet.id;
            const hitSize = Math.max(planet.size * 2, 32);

            return (
              <button
                key={planet.id}
                ref={(el) => {
                  planetRefs.current[index] = el;
                }}
                type="button"
                className="absolute top-0 left-0 cursor-pointer p-0 border-0 bg-transparent rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-white/80"
                style={{
                  zIndex: isHovered || isSelected ? 25 : 5,
                  transform: "translate(450px, 450px) translate(-50%, -50%)",
                }}
                onClick={() => handlePlanetClick(planet)}
                onMouseEnter={() => setHoveredPlanet(planet.id)}
                onMouseLeave={() => setHoveredPlanet(null)}
                aria-label={`查看${planet.name}詳細資訊`}
              >
                {/* Hit area */}
                <div
                  className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                  style={{
                    width: `${hitSize}px`,
                    height: `${hitSize}px`,
                  }}
                />
                {/* Planet body */}
                <div
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: `${planet.size * (isHovered ? 1.4 : 1)}px`,
                    height: `${planet.size * (isHovered ? 1.4 : 1)}px`,
                    background: `radial-gradient(circle at 30% 30%, ${lightenColor(planet.color, 30)}, ${planet.color}, ${adjustColor(planet.color, -50)})`,
                    boxShadow:
                      isHovered || isSelected
                        ? `0 0 15px ${planet.glowColor}, 0 0 30px ${planet.glowColor}, 0 0 45px ${planet.glowColor}`
                        : `0 0 8px ${planet.glowColor}`,
                  }}
                />
                {/* Saturn's ring */}
                {planet.id === "saturn" && (
                  <div
                    className="absolute top-1/2 left-1/2 pointer-events-none"
                    style={{
                      width: `${planet.size * 2.5}px`,
                      height: `${planet.size * 0.7}px`,
                      transform: "translate(-50%, -50%) rotateX(75deg)",
                      border: `2px solid rgba(210, 190, 130, 0.6)`,
                      borderRadius: "50%",
                    }}
                  />
                )}
                {/* Earth's moon indicator */}
                {planet.id === "earth" && (
                  <div
                    className="absolute rounded-full bg-gray-300 pointer-events-none"
                    style={{
                      width: "3px",
                      height: "3px",
                      top: "50%",
                      left: "calc(100% + 4px)",
                      transform: "translateY(-50%)",
                      boxShadow: "0 0 3px rgba(200, 200, 200, 0.5)",
                    }}
                  />
                )}
                {/* Planet label */}
                {(isHovered || isSelected) && (
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white bg-black/80 px-2 py-0.5 rounded border border-white/15 pointer-events-none shadow-md">
                    {planet.name}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* Controls Container */}
      <footer className="relative z-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-3 pb-3 sm:pb-4 px-3 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-2.5 sm:gap-3">
          {/* Play/Pause & Speed Buttons */}
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "暫停行星運行" : "播放行星運行"}
              aria-pressed={isPlaying}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 flex items-center justify-center text-white transition-all shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title={isPlaying ? "暫停" : "播放"}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6,4 20,12 6,20" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-white/60 text-xs sm:text-sm font-medium">速度:</span>
              <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                {speedOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeed(s)}
                    aria-pressed={speed === s}
                    aria-label={`切換為 ${s} 倍速`}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                      speed === s
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Planet quick nav horizontal scroll container on mobile */}
          <nav
            aria-label="行星快速選擇導航"
            className="w-full flex justify-start sm:justify-center overflow-x-auto no-scrollbar py-0.5 px-1 gap-1.5"
          >
            {planets.map((planet) => (
              <button
                key={planet.id}
                type="button"
                onClick={() => handlePlanetClick(planet)}
                aria-label={`查看${planet.name}詳細資訊`}
                aria-pressed={selectedPlanet?.id === planet.id && showInfo}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedPlanet?.id === planet.id && showInfo
                    ? "bg-white/25 text-white border border-white/40 shadow-md"
                    : "bg-white/5 text-white/60 hover:bg-white/15 hover:text-white border border-transparent"
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: planet.color }}
                />
                <span>{planet.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </footer>

      {/* Info Panel / Modal Dialog */}
      {showInfo && (
        <>
          {/* Mobile backdrop for easy tap to close */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
            onClick={closeDialog}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            className="fixed md:absolute bottom-0 md:bottom-auto md:top-16 inset-x-0 md:inset-x-auto md:right-4 z-40 w-full md:w-80 max-h-[80vh] md:max-h-[calc(100vh-140px)] flex flex-col animate-slideUp md:animate-slideIn"
          >
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-t-2xl md:rounded-2xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-full">
              {/* Header */}
              <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  {selectedPlanet ? (
                    <>
                      <div
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${lightenColor(selectedPlanet.color, 30)}, ${selectedPlanet.color}, ${adjustColor(selectedPlanet.color, -50)})`,
                          boxShadow: `0 0 15px ${selectedPlanet.glowColor}`,
                        }}
                      />
                      <div>
                        <h2 id="dialog-title" className="text-base sm:text-lg font-bold text-white leading-tight">
                          {selectedPlanet.name}
                        </h2>
                        <p className="text-xs text-gray-400">{selectedPlanet.nameEn}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                        style={{
                          background: "radial-gradient(circle at 30% 30%, #fffde0, #ffcc00, #ff8c00)",
                          boxShadow: "0 0 15px rgba(255, 204, 0, 0.5)",
                        }}
                      />
                      <div>
                        <h2 id="dialog-title" className="text-base sm:text-lg font-bold text-white leading-tight">
                          {sunData.name}
                        </h2>
                        <p className="text-xs text-gray-400">{sunData.nameEn}</p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={closeDialog}
                  aria-label="關閉詳細資訊面板"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white/70 hover:text-white transition-all text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-3.5 sm:p-4 space-y-2.5 overflow-y-auto max-h-[60vh] md:max-h-none">
                {selectedPlanet ? (
                  <>
                    <InfoRow label="直徑" value={`${selectedPlanet.realDiameter.toLocaleString()} km`} icon="📏" />
                    <InfoRow label="與太陽距離" value={`${selectedPlanet.distanceFromSun.toLocaleString()} 百萬公里`} icon="📐" />
                    <InfoRow label="公轉週期" value={formatOrbitalPeriod(selectedPlanet.orbitalPeriod)} icon="🔄" />
                    <InfoRow label="自轉週期" value={formatRotation(selectedPlanet.rotationPeriod)} icon="🌀" />
                    <InfoRow label="衛星數量" value={`${selectedPlanet.moons} 顆`} icon="🌙" />
                    <div className="pt-2.5 border-t border-white/10">
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {selectedPlanet.description}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <InfoRow label="直徑" value={`${sunData.realDiameter.toLocaleString()} km`} icon="📏" />
                    <InfoRow label="表面溫度" value="約 5,500°C" icon="🌡️" />
                    <InfoRow label="核心溫度" value="約 1,500萬°C" icon="🔥" />
                    <InfoRow label="類型" value="G型主序星" icon="⭐" />
                    <InfoRow label="年齡" value="約 46 億年" icon="⏳" />
                    <div className="pt-2.5 border-t border-white/10">
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {sunData.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stars() {
  const stars = useRef(
    Array.from({ length: 150 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 5,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {stars.current.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: `${star.y}%`,
            left: `${star.x}%`,
            opacity: star.opacity,
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-xs sm:text-sm text-gray-400 flex items-center gap-1.5">
        <span className="text-xs">{icon}</span>
        {label}
      </span>
      <span className="text-xs sm:text-sm text-white font-medium">{value}</span>
    </div>
  );
}

function formatOrbitalPeriod(days: number): string {
  if (days < 365) return `${days} 地球日`;
  const years = (days / 365.25).toFixed(1);
  return `${years} 地球年 (${days.toLocaleString()} 日)`;
}

function formatRotation(hours: number): string {
  if (hours < 48) return `${hours} 小時`;
  const days = (hours / 24).toFixed(1);
  return `${days} 地球日`;
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function lightenColor(hex: string, amount: number): string {
  return adjustColor(hex, amount);
}

export default App;
