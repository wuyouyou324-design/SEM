import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from "react";
import { planets, Planet, sunData } from "./data/planets";

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [angles, setAngles] = useState<number[]>(
    planets.map((_, i) => (i * Math.PI * 2) / planets.length)
  );
  const [showInfo, setShowInfo] = useState(false);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const anglesRef = useRef<number[]>(angles);

  // Responsive scaling
  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      const h = Math.max(0, window.innerHeight - 180); // account for header and controls
      const minDim = Math.min(w, h);
      // Keep the scaled scene positive even in an extremely short viewport.
      setScale(Math.max(0.1, Math.min(1, minDim / 950)));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const animate = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (isPlaying) {
        const newAngles = anglesRef.current.map((angle, i) => {
          return angle + planets[i].speed * speed * delta * 0.5;
        });
        anglesRef.current = newAngles;
        setAngles([...newAngles]);
      }

      animationRef.current = requestAnimationFrame(animate);
    },
    [isPlaying, speed]
  );

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  const handlePlanetClick = (planet: Planet) => {
    setSelectedPlanet(planet);
    setShowInfo(true);
  };

  const handleSunClick = () => {
    setSelectedPlanet(null);
    setShowInfo(true);
  };

  const speedOptions = [0.25, 0.5, 1, 2, 5, 10];

  return (
    <div className="w-full h-screen bg-[#0a0a1a] overflow-hidden relative flex flex-col">
      {/* Stars background */}
      <Stars />

      {/* Header */}
      <header className="relative z-10 text-center py-3 bg-gradient-to-b from-black/60 to-transparent">
        <h1 className="text-xl md:text-3xl font-bold text-white tracking-wider">
          🌌 互動式太陽系學習演示
        </h1>
        <p className="text-gray-400 text-xs md:text-sm mt-1">點擊行星或太陽查看詳細資訊</p>
      </header>

      {/* Solar System Container */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div
          ref={containerRef}
          className="relative transition-transform duration-300"
          style={{
            width: "900px",
            height: "900px",
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {/* Orbit paths */}
          {planets.map((planet) => (
            <div
              key={`orbit-${planet.id}`}
              className="absolute rounded-full border border-white/[0.08]"
              style={{
                width: `${planet.orbitRadius * 2}px`,
                height: `${planet.orbitRadius * 2}px`,
                top: `${450 - planet.orbitRadius}px`,
                left: `${450 - planet.orbitRadius}px`,
              }}
            />
          ))}

          {/* Sun */}
          <div
            className="absolute cursor-pointer z-10 group"
            style={{
              top: "450px",
              left: "450px",
              transform: "translate(-50%, -50%)",
            }}
            onClick={handleSunClick}
            onKeyDown={(event) => handleKeyboardActivation(event, handleSunClick)}
            role="button"
            tabIndex={0}
            aria-label="查看太陽資訊"
          >
            {/* Sun hit area */}
            <div className="absolute -inset-4 rounded-full" />
            {/* Sun visual */}
            <div
              className="rounded-full"
              style={{
                width: "56px",
                height: "56px",
                background: "radial-gradient(circle at 35% 35%, #fffde0, #ffcc00, #ff8c00, #cc5500)",
                boxShadow:
                  "0 0 30px #ffcc00, 0 0 60px #ff8c00, 0 0 100px rgba(255, 140, 0, 0.4), 0 0 150px rgba(255, 140, 0, 0.2)",
                animation: "sunGlow 3s ease-in-out infinite",
              }}
            />
            {/* Sun label on hover */}
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              太陽
            </div>
          </div>

          {/* Planets */}
          {planets.map((planet, index) => {
            const x = 450 + Math.cos(angles[index]) * planet.orbitRadius;
            const y = 450 + Math.sin(angles[index]) * planet.orbitRadius;
            const isHovered = hoveredPlanet === planet.id;
            const isSelected = selectedPlanet?.id === planet.id;
            const hitSize = Math.max(planet.size * 2, 28);

            return (
              <div
                key={planet.id}
                className="absolute cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 rounded-full"
                style={{
                  top: `${y}px`,
                  left: `${x}px`,
                  transform: "translate(-50%, -50%)",
                  zIndex: isHovered || isSelected ? 20 : 5,
                }}
                onClick={() => handlePlanetClick(planet)}
                onKeyDown={(event) => handleKeyboardActivation(event, () => handlePlanetClick(planet))}
                onMouseEnter={() => setHoveredPlanet(planet.id)}
                onMouseLeave={() => setHoveredPlanet(null)}
                role="button"
                tabIndex={0}
                aria-label={`查看${planet.name}資訊`}
              >
                {/* Invisible hit area */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: `${hitSize}px`,
                    height: `${hitSize}px`,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
                {/* Planet body */}
                <div
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: `${planet.size * (isHovered ? 1.5 : 1)}px`,
                    height: `${planet.size * (isHovered ? 1.5 : 1)}px`,
                    background: `radial-gradient(circle at 30% 30%, ${lightenColor(planet.color, 30)}, ${planet.color}, ${adjustColor(planet.color, -50)})`,
                    boxShadow: isHovered || isSelected
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
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white bg-black/80 px-2 py-0.5 rounded border border-white/10">
                    {planet.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-6 pb-4 px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
          {/* Play/Pause and Speed */}
          <div className="flex items-center gap-3 md:gap-5 flex-wrap justify-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "暫停行星運行" : "播放行星運行"}
              aria-pressed={isPlaying}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
              title={isPlaying ? "暫停" : "播放"}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6,4 20,12 6,20" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-white/50 text-xs md:text-sm">速度:</span>
              <div className="flex gap-1">
                {speedOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    aria-pressed={speed === s}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      speed === s
                        ? "bg-blue-500/80 text-white shadow-lg shadow-blue-500/30"
                        : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Planet quick nav */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-1">
            {planets.map((planet) => (
              <button
                key={planet.id}
                onClick={() => handlePlanetClick(planet)}
                aria-label={`查看${planet.name}資訊`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${
                  selectedPlanet?.id === planet.id
                    ? "bg-white/20 text-white border border-white/30 shadow-lg"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 border border-transparent"
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: planet.color }}
                />
                <span className="hidden sm:inline">{planet.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-16 right-2 md:right-4 z-30 w-72 md:w-80 animate-slideIn">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Panel header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedPlanet ? (
                  <>
                    <div
                      className="w-10 h-10 rounded-full flex-shrink-0"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${lightenColor(selectedPlanet.color, 30)}, ${selectedPlanet.color}, ${adjustColor(selectedPlanet.color, -50)})`,
                        boxShadow: `0 0 15px ${selectedPlanet.glowColor}`,
                      }}
                    />
                    <div>
                      <h2 className="text-lg font-bold text-white">{selectedPlanet.name}</h2>
                      <p className="text-xs text-gray-400">{selectedPlanet.nameEn}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="w-10 h-10 rounded-full flex-shrink-0"
                      style={{
                        background: "radial-gradient(circle at 30% 30%, #fffde0, #ffcc00, #ff8c00)",
                        boxShadow: "0 0 15px rgba(255, 204, 0, 0.5)",
                      }}
                    />
                    <div>
                      <h2 className="text-lg font-bold text-white">{sunData.name}</h2>
                      <p className="text-xs text-gray-400">{sunData.nameEn}</p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowInfo(false)}
                aria-label="關閉資訊面板"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all text-sm"
              >
                ✕
              </button>
            </div>

            {/* Panel content */}
            <div className="p-4 space-y-2.5">
              {selectedPlanet ? (
                <>
                  <InfoRow label="直徑" value={`${selectedPlanet.realDiameter.toLocaleString()} km`} icon="📏" />
                  <InfoRow label="與太陽距離" value={`${selectedPlanet.distanceFromSun.toLocaleString()} 百萬公里`} icon="📐" />
                  <InfoRow label="公轉週期" value={formatOrbitalPeriod(selectedPlanet.orbitalPeriod)} icon="🔄" />
                  <InfoRow label="自轉週期" value={formatRotation(selectedPlanet.rotationPeriod)} icon="🌀" />
                  <InfoRow label="衛星數量" value={`${selectedPlanet.moons} 顆`} icon="🌙" />
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-sm text-gray-300 leading-relaxed">
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
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {sunData.description}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-400 flex items-center gap-1.5">
        <span className="text-xs">{icon}</span>
        {label}
      </span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}

function handleKeyboardActivation(
  event: KeyboardEvent<HTMLElement>,
  onActivate: () => void
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onActivate();
  }
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
