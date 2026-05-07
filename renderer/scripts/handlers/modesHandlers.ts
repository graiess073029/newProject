import { modesIcons } from "../constants.js";
import { fetchModes } from "../dataFetchers/modeFetch.js";
import { DOMElements } from "../elements.js";
import { ModeObject } from "../types.js";

let modes: ModeObject = await fetchModes();



export const setMode = (mode: keyof ModeObject) => {
    DOMElements.blur.style.display = "none";
    DOMElements.modesDiv.style.display = "none";
    DOMElements.background.style.filter = "blur(0px)";
    DOMElements.root_inner.style.filter = "blur(0px)";
    DOMElements.modeText.textContent = mode;
    DOMElements.modeIcon.innerHTML = modesIcons[mode];

    DOMElements.gamingButton.classList.toggle("active-mode", mode === "gaming");
    DOMElements.normalButton.classList.toggle("active-mode", mode === "normal");
    DOMElements.ecoButton.classList.toggle("active-mode", mode === "eco");

    modes[mode].forEach((cmd) => window.api.executeCommand(cmd));
}

export const addModesHandlers = () => {
    DOMElements.gamingButton.addEventListener("click", () => setMode("gaming"));
    DOMElements.normalButton.addEventListener("click", () => setMode("normal"));
    DOMElements.ecoButton.addEventListener("click", () => setMode("eco"));
}