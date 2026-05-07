import path from 'path';
import { dataFolder } from "./exposeDataPath";
const modesDataPath = path.join(dataFolder,"modes.json");

export const getModesData = () => {
    const modesData = require(modesDataPath);
    return modesData;
}


