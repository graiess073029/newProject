import { app } from "electron";
import path from "path";

export const userDataPath = app.getPath('userData');
export const dataFolder = path.join(userDataPath, 'data');
