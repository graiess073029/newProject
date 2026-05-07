
import { injectApps } from "./appsInjection.js";
import { InitializeBackground } from "./dataFetchers/backgroundsFetch.js";
import { getSensors } from "./sensors/getSensorsData.js";
import { addBgHandlers } from "./handlers/backgroundHandlers.js";
import { addModesHandlers, setMode } from "./handlers/modesHandlers.js";
import { addSettingsHandlers } from "./handlers/settingsHandlers.js";
import { initSettings } from "./initSettings.js";



const init = async () => {
  try {
    let bgData = await InitializeBackground();
    if (bgData instanceof Error) throw bgData;
    initSettings();
    setMode("normal");
    InitializeBackground();
    addBgHandlers(bgData);
    addSettingsHandlers();
    addModesHandlers();
    injectApps();
    setInterval(getSensors, 1000);
  } catch (err) {
    console.log(err);
    return;
  }

}

init();


