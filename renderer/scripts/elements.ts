const DOMElements = {
  imgBg: document.querySelector("img.bg") as HTMLImageElement,
  videoBg: document.querySelector("video.bg") as HTMLVideoElement,
  overlay: document.querySelector(".overlay") as HTMLElement,
  blur: document.querySelector(".blur") as HTMLElement,
  bgSelector: document.querySelector(".bgSelector") as HTMLElement,
  settingsBtn: document.querySelector("#settingsIcon") as HTMLElement,
  settings: document.querySelector(".settings") as HTMLElement,
  
  bgSelected: document.getElementById("bgSelected") as HTMLImageElement,
  bgMinus: document.getElementById("bgMinus") as HTMLElement,
  bgPlus: document.getElementById("bgPlus") as HTMLElement,
  apply: document.getElementById("selectBg") as HTMLElement,
  cardsColorPicker: document.getElementById("cardsColorPicker") as HTMLInputElement,

  appsSizeRange: document.getElementById("appsSizeRange") as HTMLInputElement,
  appsSizeNumber: document.getElementById("appsSizeNumber") as HTMLInputElement,
  fontSizeRange: document.getElementById("fontSizeRange") as HTMLInputElement,
  fontSizeNumber: document.getElementById("fontSizeNumber") as HTMLInputElement,
  bgSelectBtn: document.getElementById("bgSelectBtn") as HTMLElement,
  bgAddBtn: document.getElementById("bgAddBtn") as HTMLElement,
  bgDeleteBtn: document.getElementById("bgDeleteBtn") as HTMLElement,
  overlayRange : document.getElementById("overlayRange") as HTMLInputElement,
  overlayNumber : document.getElementById("overlayNumber") as HTMLInputElement,

  // ======= Processor =======
  cpuUsage: document.querySelector("#cpuUsage") as HTMLElement,
  cpuUsageBar: document.querySelector("#cpuUsageBar") as HTMLElement,
  cpuClock: document.querySelector("#cpuClock") as HTMLElement,
  cpuClockBar: document.querySelector("#cpuClockBar") as HTMLElement,
  cpuTemp: document.querySelector("#cpuTemp") as HTMLElement,
  cpuTempBar: document.querySelector("#cpuTempBar") as HTMLElement,
  cpuPower: document.querySelector("#cpuPower") as HTMLElement,

  core6: document.querySelector("#core7 .bar") as HTMLElement,
  core7: document.querySelector("#core8 .bar ") as HTMLElement,
  core8: document.querySelector("#core9 .bar") as HTMLElement,
  core9: document.querySelector("#core10 .bar") as HTMLElement,

  // ======= Graphics Card =======
  gpuUsage: document.querySelector("#gpuUsage") as HTMLElement,
  gpuUsageBar: document.querySelector("#gpuUsageBar") as HTMLElement,
  vramUsage: document.querySelector("#vramUsage") as HTMLElement,
  vramUsageBar: document.querySelector("#vramUsageBar") as HTMLElement,
  gpuClock: document.querySelector("#gpuClock") as HTMLElement,
  gpuClockBar: document.querySelector("#gpuClockBar") as HTMLElement,
  gpuTemp: document.querySelector("#gpuTemp") as HTMLElement,
  gpuTempBar: document.querySelector("#gpuTempBar") as HTMLElement,
  gpuPower: document.querySelector("#gpuPower") as HTMLElement,

  IgpuUsage: document.querySelector("#IgpuUsage") as HTMLElement,
  IgpuUsageBar: document.querySelector("#IgpuUsageBar") as HTMLElement,
  IvramUsage: document.querySelector("#IvramUsage") as HTMLElement,
  IvramUsageBar: document.querySelector("#IvramUsageBar") as HTMLElement,
  IgpuClock: document.querySelector("#IgpuClock") as HTMLElement,
  IgpuClockBar: document.querySelector("#IgpuClockBar") as HTMLElement,

  // ======= RAM Memory =======
  ramUsage: document.querySelector("#ramUsage") as HTMLElement,
  ramUsageBar: document.querySelector("#ramUsageBar") as HTMLElement,
  ramAvailable: document.querySelector("#ramAvailable") as HTMLElement,
  ramAvailableBar: document.querySelector("#ramAvailableBar") as HTMLElement,

  // ======= Fans =======
  cpuFanSpeed: document.querySelector("#cpuFanSpeed") as HTMLElement,
  cpuFanSpeedBar: document.querySelector("#cpuFanSpeedBar") as HTMLElement,
  gpuFanSpeed1: document.querySelector("#gpuFanSpeed1") as HTMLElement,
  gpuFanSpeedBar1: document.querySelector("#gpuFanSpeedBar1") as HTMLElement,
  gpuFanSpeed2: document.querySelector("#gpuFanSpeed2") as HTMLElement,
  gpuFanSpeedBar2: document.querySelector("#gpuFanSpeedBar2") as HTMLElement,

  //======= Disc =======
  discUsage: document.querySelector("#discUsage") as HTMLElement,
  discUsageBar: document.querySelector("#discUsageBar") as HTMLElement,
  discFree: document.querySelector("#discFree") as HTMLElement,

  // ======= Header =======
  batteryLevel: document.querySelector("#batteryLevel") as HTMLElement,
  batteryIcon: document.querySelector("#batteryIcon") as HTMLElement,
  time: document.querySelector("#time") as HTMLElement,
  date: document.querySelector("#date") as HTMLElement,

  gamingButton: document.getElementById("gamingMode") as HTMLElement,
  ecoButton: document.getElementById("ecoMode") as HTMLElement,
  normalButton: document.getElementById("normalMode") as HTMLElement,

  modeIcon: document.querySelector("div#icon") as HTMLElement,
  modeText: document.querySelector("h1#mode") as HTMLElement,

  modesDiv: document.querySelector("div.modes") as HTMLElement,
  root_inner: document.querySelector(".root_inner") as HTMLElement,
  background: document.querySelector(".bg") as HTMLElement,
  mode: document.querySelector("section.monitoring header > .mode") as HTMLElement,

  loading: document.querySelector(".loading") as HTMLElement,
  header: document.querySelector("section.monitoring header") as HTMLElement,
  hardware: document.querySelector("section.monitoring .hardware") as HTMLElement,

  container: document.getElementById("apps") as HTMLElement
};

export { DOMElements };

