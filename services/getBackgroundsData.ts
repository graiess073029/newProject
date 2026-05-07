import path from 'path';
import { userDataPath } from './exposeDataPath';
import { readFileSync } from 'fs';

const bgDataFolder = path.join(userDataPath, 'data');
const bgDataPath = path.join(bgDataFolder,"backgrounds.json");

export const getBackgroundsData = () => {
    const bgData = JSON.parse(readFileSync(bgDataPath, 'utf-8'));
    return bgData;
}


