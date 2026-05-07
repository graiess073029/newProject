import path from "path";
import { dataFolder } from "./exposeDataPath";
import { readFileSync } from "fs";
const appsDataPath = path.join(dataFolder,"data.json");

export const getAppsData = () => {
    const appsData = JSON.parse(readFileSync(appsDataPath, 'utf-8'));
    return appsData;
}


