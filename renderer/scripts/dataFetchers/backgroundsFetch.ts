import { DOMElements } from "../elements.js";
import { BackgroundObject, BgData } from "../types.js";


export const fetchBackgrounds = async (): Promise<BackgroundObject[] | null> => {
  try {

    const backgrounds = await window.api.getBackgroundsData();
    if (!backgrounds) {
        const cached = localStorage.getItem("backgroundsData");
        if (cached) return JSON.parse(cached);
        else throw new Error("Couldn't fetch backgrounds");
    } 

    console.log(backgrounds)

    localStorage.setItem("backgroundsData", JSON.stringify(backgrounds));
    return backgrounds;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}


export const InitializeBackground = async (): Promise<BgData | Error> => {

  const backgrounds = await fetchBackgrounds();

  let bgIndex = parseInt(window.localStorage.getItem("bgIndex") || "0");

  try {
    if (backgrounds) {
      const lenBackgrounds = backgrounds?.length;
      const bg = backgrounds[bgIndex];
      if (bg.type === "image") {
        DOMElements.imgBg.src = bg.path;
        DOMElements.videoBg.style.display = "none";
      } else if (bg.type === "video") {
        DOMElements.videoBg.src = bg.path;
        DOMElements.imgBg.style.display = "none";
      }

      let bgSelectedValue = bgIndex;
      DOMElements.bgSelected.src = bg.type === "image" ? bg.path : bg.poster as string;

      return { bgSelectedValue, lenBackgrounds, bgIndex, backgrounds };
    }

    throw new Error("Could not load backgrounds data");
  }

  catch (err) {
    return err as Error;
  }

}