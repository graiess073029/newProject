import { DOMElements } from "./elements.js";



export const injectApps = async () : Promise<void> => {

    try {
      const data = await window.api.getAppsData();

      if (!data) throw new Error("Could not load apps data");

      // Inject apps into the HTML

      let html = "";

      for (const [name, app] of Object.entries(data)) {
        html += `
    <div data-process="${app.process}" class="app">
      <img src="${app.img}" alt="${name}"/>
      <p>${name}</p>
    </div>`;
      }

      DOMElements.container.innerHTML = html;

      // adds click listeners to apps

      (document.querySelectorAll(".app") as unknown as HTMLDivElement[]).forEach((app) => {
        app.addEventListener("click", () => {
          let command;
          if (!app.dataset.process?.includes(".bat")) command = `"${app.dataset.process}"`
          else command = `cd ${app.dataset.process.split("\\").slice(0, -1).join("\\")} && start "${app.dataset.process}"`
          window.api.executeCommand(command)
        });
      });
    }

    catch (err) {
      console.log(err);
    }
  }