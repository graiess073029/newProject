import { DOMElements } from "../elements.js";
import { BgData } from "../types.js";


export const addBgHandlers = (bgData: BgData ) => {
    
    DOMElements.bgMinus.addEventListener("click", () => {
        bgData.bgIndex--;
        if (bgData.bgIndex < 0) bgData.bgIndex = bgData.lenBackgrounds - 1;
        const bg = bgData.backgrounds[bgData.bgIndex];
        DOMElements.bgSelected.src = bg.type === "image" ? bg.path : bg.poster as string;
        bgData.bgSelectedValue = bgData.bgIndex;
    });

    DOMElements.bgPlus.addEventListener("click", () => {
        bgData.bgIndex++;
        if (bgData.bgIndex === bgData.lenBackgrounds) bgData.bgIndex = 0;
        const bg = bgData.backgrounds[bgData.bgIndex];
        DOMElements.bgSelected.src = bg.type === "image" ? bg.path : bg.poster as string;
        bgData.bgSelectedValue = bgData.bgIndex;
    });

    DOMElements.apply.addEventListener("click", () => {

        DOMElements.blur.style.display = "none";
        DOMElements.bgSelector.style.display = "none";
        window.localStorage.setItem("bgIndex", bgData.bgSelectedValue.toString());
        const backgroundSelected = bgData.backgrounds[bgData.bgSelectedValue];

        if (backgroundSelected.type === "image") {
            DOMElements.imgBg.style.display = "block";
            DOMElements.videoBg.style.display = "none";
            DOMElements.imgBg.src = backgroundSelected.path;
        } else if (backgroundSelected.type === "video") {
            DOMElements.imgBg.style.display = "none";
            DOMElements.videoBg.style.display = "block";
            DOMElements.videoBg.src = backgroundSelected.path;
        }

        window.api.refreshWindows();
    });

}