import events from "events";
import { parseCsv } from "./parseCsv";

export const SensorsEvents = new events.EventEmitter();

let temp : { [key: string]: string | number } | null = null;

SensorsEvents.on("newData", (newData : string) => {
    let parsedData = parseCsv(newData);
    if (parsedData) temp = parsedData;
});


export const getLatestData = () => {
    
    if (temp == undefined) {
        return null;
    }

    return temp;
}


