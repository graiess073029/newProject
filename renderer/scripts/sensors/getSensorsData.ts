import { DOMElements } from "../elements.js";
import { Sensor } from "../types.js";
import { sortSensors } from "./sortSensors.js";
import { updateUi } from "./updateUi.js";



export const  getSensors = async () => {

    try {
      
      const sensorsData = await window.api.getSensorsData();
      let sharedMemData = await window.api.readSharedMem() as {sensors : Sensor[]};

      console.log(sortSensors(sharedMemData));


      if (!sensorsData) throw new Error("Could not load sensors data");

      if (sensorsData["Date"] === "") throw new Error("Sensors data is invalid");
      else if (Object.keys(sensorsData).length > 0) {
        DOMElements.hardware.style.display = "flex";
        DOMElements.loading.style.display = "none";
        setTimeout(() => updateUi(sensorsData), 2000)
      }
      else throw new Error("Sensors data is empty");
    }

    catch (err) {
      DOMElements.hardware.style.display = "none";
      DOMElements.loading.style.display = "flex";
      (DOMElements.batteryLevel.parentElement as HTMLDivElement).style.display = "none";
      (DOMElements.time.parentElement as HTMLDivElement).style.display = "none";
      console.log(err);
    }

  }