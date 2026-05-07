import { DOMElements } from "../elements.js";


export const changeOverlayOpacity = (overlayOpacity: number) => {
  window.localStorage.setItem('overlayOpacity', (overlayOpacity / 100).toString())
  document.documentElement.style.setProperty('--overlay-opacity', (overlayOpacity / 100).toString())
}
export const changeColors = (color: string) => {
  const opacities = ["1A", "33", "4D", "66", "80", "99", "B3", "CC", "E6", "FF"];

  opacities.forEach((hex, i) => {
    document.documentElement.style.setProperty(`--color-opacity-${i + 1}`, color + hex);
  });

  window.localStorage.setItem("textColor", color);
}

export const changeIconSize = (size: string) => {
  console.log(size)
  document.documentElement.style.setProperty("--icon-size", size);
  window.localStorage.setItem("iconSize", size);
}

export const changeFontSize = (size: string) => {
  document.documentElement.style.setProperty("--font-size", size);
  window.localStorage.setItem("fontSize", size);
}

export const iconSizeEventHandler = (event: Event) => {
  let size = (event.target as HTMLInputElement)?.value as unknown as number;

  if ((event.target as HTMLInputElement)?.type === "range") DOMElements.appsSizeNumber.value = size.toString();
  else DOMElements.appsSizeRange.value = size.toString();

  changeIconSize(size + "px");
}

export const fontSizeEventHandler = (event: Event) => {
  let font = (event.target as HTMLInputElement)?.value as unknown as number;

  if ((event.target as HTMLInputElement)?.type === "range") DOMElements.fontSizeNumber.value = font.toString();
  else DOMElements.fontSizeRange.value = font.toString();

  changeFontSize(font + "px");
}

export const OverlayEventHandler = (event: Event) => {

  let opacity = parseFloat((event.target as HTMLInputElement)?.value);
  if ((event.target as HTMLInputElement)?.type === "range") DOMElements.overlayNumber.value = opacity.toString();
  else DOMElements.overlayRange.value = opacity.toString();
  changeOverlayOpacity(opacity);
}

export const addSettingsHandlers = () => {
  DOMElements.cardsColorPicker.addEventListener("input", (event) => {
    let color = (event.target as HTMLInputElement)?.value as string;
    changeColors(color);
  });

  DOMElements.appsSizeNumber.addEventListener("input", iconSizeEventHandler);
  DOMElements.appsSizeRange.addEventListener("input", iconSizeEventHandler);
  DOMElements.fontSizeNumber.addEventListener("input", fontSizeEventHandler);
  DOMElements.fontSizeRange.addEventListener("input", fontSizeEventHandler);

  DOMElements.mode.addEventListener("click", (event) => {
    DOMElements.blur.style.display = "block";
    DOMElements.modesDiv.style.display = "flex";
    DOMElements.background.style.filter = "blur(8px)";
    DOMElements.root_inner.style.filter = "blur(8px)";
  });

  DOMElements.blur.addEventListener("click", (event) => {
    DOMElements.modesDiv.style.display = "none";
    DOMElements.blur.style.display = "none";
    DOMElements.settings.style.display = "none";
    DOMElements.bgSelector.style.display = "none";
    DOMElements.background.style.filter = "blur(0px)";
    DOMElements.root_inner.style.filter = "blur(0px)";
  });

  DOMElements.settingsBtn.addEventListener("click", () => {
    DOMElements.blur.style.display = "block";
    DOMElements.settings.style.display = "flex";
  });

  DOMElements.bgSelectBtn.addEventListener("click", () => {
    DOMElements.blur.style.display = "block";
    DOMElements.bgSelector.style.display = "flex";
    DOMElements.settings.style.display = "none";
  });

  DOMElements.bgAddBtn.addEventListener("click", async () => {
    let path = await window.api.pickFile();
    if (path) {
      window.api.addBackground(path).then(() => {
        window.localStorage.setItem("bgIndex",Object.keys(JSON.parse(window.localStorage.getItem("backgrounds") as string)).length.toString())
        window.api.refreshWindows();
      });
    }
  })

  DOMElements.overlayNumber.addEventListener('click', OverlayEventHandler)
  DOMElements.overlayRange.addEventListener('click', OverlayEventHandler)

}


