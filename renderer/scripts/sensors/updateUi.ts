import { maxValues } from "../constants.js";
import { DOMElements } from "../elements.js";
import { SensorsData } from "../types.js";

export const updateUi = async (sensorsData: SensorsData) => {

    const dateValue = new Date();

    requestAnimationFrame(() => {

      // Remove Loading Screen

      DOMElements.loading.style.display = "none";
      DOMElements.hardware.style.display = "flex";

      // Header Time and Date

      (DOMElements.batteryLevel.parentElement as HTMLDivElement).style.display = "flex";
      (DOMElements.time.parentElement as HTMLDivElement).style.display = "flex";

      DOMElements.time.textContent = dateValue
        .toString()
        .split(" ")[4]
        .split(":")
        .slice(0, 2)
        .join(":");

      DOMElements.date.textContent = dateValue.toLocaleDateString("en-GB");

      // CPU
      DOMElements.cpuUsage.textContent = sensorsData["Total CPU Usage [%]"] + " %";
      DOMElements.cpuUsageBar.style.width = sensorsData["Total CPU Usage [%]"] + "%";

      DOMElements.cpuClock.textContent = (parseFloat(sensorsData["Avearge Cpu Clock"]) / 1000).toFixed(2) + " GHz";
      DOMElements.cpuClockBar.style.width = (parseFloat(sensorsData["Avearge Cpu Clock"]) / maxValues.cpuClock) * 100 + "%";

      DOMElements.cpuTemp.textContent = sensorsData["CPU Package [°C]"] + " °C";
      DOMElements.cpuTempBar.style.width = (parseFloat(sensorsData["CPU Package [°C]"]) / maxValues.cpuTemp) * 100 + "%";

      DOMElements.cpuPower.textContent = (parseFloat(sensorsData["CPU Package Power [W]"])).toFixed(2) + " W";

      [1, 2, 3, 4, 5, 6].forEach((index) => {
        let coreUsage =
          (parseFloat(sensorsData[`P-core ${index - 1} T0 Usage [%]`]) +
            parseFloat(sensorsData[`P-core ${index - 1} T1 Usage [%]`])) /
          2;

        let coreClock = sensorsData[`P-core ${index - 1} Clock [MHz]`];

        let bar = document.querySelector(`#core${index} .bar`) as HTMLElement;
        let clock = document.querySelector(`#core${index} p#clock`) as HTMLElement;
        let usage = document.querySelector(`#core${index} p#usage`) as HTMLElement;

        clock.textContent = (parseInt(coreClock) / 1000).toFixed(1) + " Ghz";
        usage.textContent = coreUsage.toFixed(0) + " %";
        bar.style.height = coreUsage + "%";
      });

      [7, 8, 9, 10].forEach((index) => {
        let coreUsage = parseFloat(sensorsData[`E-core ${index - 1} T0 Usage [%]`]);

        let coreClock = sensorsData[`E-core ${index - 1} Clock [MHz]`];

        let bar = document.querySelector(`#core${index} .bar`) as HTMLElement;
        let clock = document.querySelector(`#core${index} p#clock`) as HTMLElement;
        let usage = document.querySelector(`#core${index} p#usage`) as HTMLElement;

        clock.textContent = (parseInt(coreClock) / 1000).toFixed(1) + " Ghz";
        usage.textContent = coreUsage.toFixed(0) + " %";
        bar.style.height = coreUsage + "%";
      });

      // GPU
      DOMElements.gpuUsage.textContent = sensorsData["GPU Core Load [%]_dGPU"] + " %";
      DOMElements.gpuUsageBar.style.width = sensorsData["GPU Core Load [%]_dGPU"] + "%";

      DOMElements.vramUsage.textContent =
        (parseFloat(sensorsData["GPU Memory Allocated [MB]_dGPU"]) / 1024).toFixed(1) + " Gb";
      DOMElements.vramUsageBar.style.width = sensorsData["GPU Memory Usage [%]_dGPU"] + "%";

      DOMElements.gpuClock.textContent = sensorsData["GPU Clock [MHz]_dGPU"] + " MHz";
      DOMElements.gpuClockBar.style.width =
        (parseFloat(sensorsData["GPU Clock [MHz]_dGPU"]) / maxValues.gpuClock) * 100 + "%";

      DOMElements.gpuTemp.textContent = sensorsData["GPU Temperature [°C]_dGPU"] + " °C";
      DOMElements.gpuTempBar.style.width =
        (parseFloat(sensorsData["GPU Temperature [°C]_dGPU"]) / maxValues.gpuTemp) * 100 + "%";

      DOMElements.gpuPower.textContent = parseFloat(sensorsData["GPU Power [W]_dGPU"]).toFixed(2) + " W";

      DOMElements.IgpuUsage.textContent = sensorsData["GPU D3D Usage [%]_iGPU"] + " %";
      DOMElements.IgpuUsageBar.style.width = sensorsData["GPU D3D Usage [%]_iGPU"] + "%";

      DOMElements.IvramUsage.textContent =
        (parseFloat(sensorsData["GPU D3D Memory Dynamic [MB]_iGPU"]) / 1024).toFixed(1) + " Gb";
      DOMElements.IvramUsageBar.style.width = (parseFloat(sensorsData["GPU D3D Memory Dynamic [MB]_iGPU"]) / 8000 * 100) + "%";

      DOMElements.IgpuClock.textContent = sensorsData["GPU Clock [MHz]_iGPU"] + " MHz";
      DOMElements.IgpuClockBar.style.width =
        (parseFloat(sensorsData["GPU Clock [MHz]_iGPU"]) / maxValues.gpuClock) * 100 + "%";

      // RAM
      DOMElements.ramUsage.textContent = sensorsData["Physical Memory Load [%]"] + " %";
      DOMElements.ramUsageBar.style.width = sensorsData["Physical Memory Load [%]"] + "%";

      DOMElements.ramAvailable.textContent =
        sensorsData["Physical Memory Available [MB]"] + " Mb";
      DOMElements.ramAvailableBar.style.width =
        (parseFloat(sensorsData["Physical Memory Available [MB]"]) / maxValues.ram) * 100 +
        "%";

      // Fans (if you have corresponding sensors)
      DOMElements.cpuFanSpeed.textContent = sensorsData["Fan 1 (CPU) [RPM]"] + " RPM";
      DOMElements.cpuFanSpeedBar.style.width =
        (parseFloat(sensorsData["Fan 1 (CPU) [RPM]"]) / maxValues.cpuFan) * 100 + "%";

      DOMElements.gpuFanSpeed1.textContent = sensorsData["Fan 2 (GPU) [RPM]"] + " RPM";
      DOMElements.gpuFanSpeedBar1.style.width =
        (parseFloat(sensorsData["Fan 2 (GPU) [RPM]"]) / maxValues.gpuFan) * 100 + "%";

      DOMElements.gpuFanSpeed2.textContent = sensorsData["Fan 3 (GPU) [RPM]"] + " RPM";
      DOMElements.gpuFanSpeedBar2.style.width =
        (parseFloat(sensorsData["Fan 3 (GPU) [RPM]"]) / maxValues.gpuFan) * 100 + "%";

      // Battery
      DOMElements.batteryLevel.textContent =
        sensorsData["Charge Level [%]"].split(".")[0] + "%";

      // Battery Icon

      if (parseFloat(sensorsData["Charge Rate [W]"]) > 0) {
        DOMElements.batteryIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-battery-charging" viewBox="0 0 16 16">
  <path d="M9.585 2.568a.5.5 0 0 1 .226.58L8.677 6.832h1.99a.5.5 0 0 1 .364.843l-5.334 5.667a.5.5 0 0 1-.842-.49L5.99 9.167H4a.5.5 0 0 1-.364-.843l5.333-5.667a.5.5 0 0 1 .616-.09z"/>
  <path d="M2 4h4.332l-.94 1H2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.38l-.308 1H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2"/>
  <path d="M2 6h2.45L2.908 7.639A1.5 1.5 0 0 0 3.313 10H2zm8.595-2-.308 1H12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H9.276l-.942 1H12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
  <path d="M12 10h-1.783l1.542-1.639q.146-.156.241-.34zm0-3.354V6h-.646a1.5 1.5 0 0 1 .646.646M16 8a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8"/>
</svg>`;
      }

      else if (parseFloat(sensorsData["Charge Level [%]"]) >= 75) {
        DOMElements.batteryIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-battery-full" viewBox="0 0 16 16">
  <path d="M2 6h10v4H2z"/>
  <path d="M2 4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm10 1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm4 3a1.5 1.5 0 0 1-1.5 极好
</svg>`;
      }

      else if (parseFloat(sensorsData["Charge Level [%]"]) >= 35) {
        DOMElements.batteryIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-battery-half" viewBox="0 0 16 16">
  <path d="M2 6h5v4H2z"/>
  <path d="M2 4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm10 1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm4 3a1.5 1.5 0 0
</svg>`;
      }

      else {
        DOMElements.batteryIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-battery-low" viewBox="0
    <path d="M16 8a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8"/>
  </svg>`;
      }

      //Disc

      DOMElements.discUsage.textContent = sensorsData["Disk Total [GB]"] + " GB";
      DOMElements.discUsageBar.style.width = ((parseFloat(sensorsData["Disk Used [GB]"]) / (parseFloat(sensorsData["Disk Total [GB]"]))) * 100).toString() + "%";
      DOMElements.discFree.textContent = sensorsData["Disk Free [GB]"] + " GB";

    })

  }