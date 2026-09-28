export interface Planet {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  glowColor: string;
  size: number; // display radius in px
  orbitRadius: number; // display orbit radius in px
  realDiameter: number; // km
  distanceFromSun: number; // million km
  orbitalPeriod: number; // Earth days
  rotationPeriod: number; // Earth hours
  moons: number;
  description: string;
  speed: number; // relative speed factor
}

export const planets: Planet[] = [
  {
    id: "mercury",
    name: "水星",
    nameEn: "Mercury",
    color: "#b5b5b5",
    glowColor: "rgba(181, 181, 181, 0.4)",
    size: 6,
    orbitRadius: 70,
    realDiameter: 4879,
    distanceFromSun: 57.9,
    orbitalPeriod: 88,
    rotationPeriod: 1407.6,
    moons: 0,
    description: "水星是太陽系中最小的行星，也是距離太陽最近的行星。它的表面布滿了隕石坑，類似月球。",
    speed: 4.15,
  },
  {
    id: "venus",
    name: "金星",
    nameEn: "Venus",
    color: "#e8cda0",
    glowColor: "rgba(232, 205, 160, 0.4)",
    size: 10,
    orbitRadius: 110,
    realDiameter: 12104,
    distanceFromSun: 108.2,
    orbitalPeriod: 225,
    rotationPeriod: 5832.5,
    moons: 0,
    description: "金星是太陽系中最熱的行星，表面溫度可達465°C。它的大氣層主要由二氧化碳組成，產生了強烈的溫室效應。",
    speed: 1.62,
  },
  {
    id: "earth",
    name: "地球",
    nameEn: "Earth",
    color: "#4da6ff",
    glowColor: "rgba(77, 166, 255, 0.4)",
    size: 11,
    orbitRadius: 155,
    realDiameter: 12756,
    distanceFromSun: 149.6,
    orbitalPeriod: 365.25,
    rotationPeriod: 24,
    moons: 1,
    description: "地球是我們的家園，也是太陽系中唯一已知存在生命的行星。它擁有液態水和適宜的大氣層。",
    speed: 1.0,
  },
  {
    id: "mars",
    name: "火星",
    nameEn: "Mars",
    color: "#e85d3a",
    glowColor: "rgba(232, 93, 58, 0.4)",
    size: 8,
    orbitRadius: 200,
    realDiameter: 6792,
    distanceFromSun: 227.9,
    orbitalPeriod: 687,
    rotationPeriod: 24.6,
    moons: 2,
    description: "火星被稱為「紅色星球」，因其表面富含氧化鐵而呈現紅色。它擁有太陽系最高的山峰——奧林帕斯山。",
    speed: 0.53,
  },
  {
    id: "jupiter",
    name: "木星",
    nameEn: "Jupiter",
    color: "#c88b3a",
    glowColor: "rgba(200, 139, 58, 0.4)",
    size: 28,
    orbitRadius: 270,
    realDiameter: 142984,
    distanceFromSun: 778.5,
    orbitalPeriod: 4333,
    rotationPeriod: 9.9,
    moons: 95,
    description: "木星是太陽系中最大的行星，質量是其他所有行星總和的2.5倍。它著名的大紅斑是一個持續了數百年的巨大風暴。",
    speed: 0.084,
  },
  {
    id: "saturn",
    name: "土星",
    nameEn: "Saturn",
    color: "#e8d590",
    glowColor: "rgba(232, 213, 144, 0.4)",
    size: 24,
    orbitRadius: 340,
    realDiameter: 120536,
    distanceFromSun: 1434,
    orbitalPeriod: 10759,
    rotationPeriod: 10.7,
    moons: 146,
    description: "土星以其壯觀的環系統聞名，這些環主要由冰粒和岩石碎片組成。它的密度低於水，是唯一能浮在水上的行星。",
    speed: 0.034,
  },
  {
    id: "uranus",
    name: "天王星",
    nameEn: "Uranus",
    color: "#7de8e8",
    glowColor: "rgba(125, 232, 232, 0.4)",
    size: 17,
    orbitRadius: 400,
    realDiameter: 51118,
    distanceFromSun: 2871,
    orbitalPeriod: 30687,
    rotationPeriod: 17.2,
    moons: 28,
    description: "天王星是一顆冰巨星，它的自轉軸幾乎平行於公轉平面，像是「躺著」繞太陽運行。它呈現獨特的藍綠色。",
    speed: 0.012,
  },
  {
    id: "neptune",
    name: "海王星",
    nameEn: "Neptune",
    color: "#3f54e8",
    glowColor: "rgba(63, 84, 232, 0.4)",
    size: 16,
    orbitRadius: 450,
    realDiameter: 49528,
    distanceFromSun: 4495,
    orbitalPeriod: 60190,
    rotationPeriod: 16.1,
    moons: 16,
    description: "海王星是太陽系中距離太陽最遠的行星，擁有太陽系中最強的風，風速可達每小時2100公里。",
    speed: 0.006,
  },
];

export const sunData = {
  name: "太陽",
  nameEn: "Sun",
  realDiameter: 1392700,
  description: "太陽是太陽系的中心恆星，佔據了太陽系總質量的99.86%。它是一顆G型主序星，表面溫度約5500°C。",
};
