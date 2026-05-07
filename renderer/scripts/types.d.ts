

export interface BackgroundObject {
    path: string,
    type: string,
    poster: string |null
}

export interface ModeObject {
    "gaming": string[],
    "normal": string[],
    "eco": string[]
}

export interface AppObject {
    [key: string]: {
        process: string,
        img: string
    }
}

export interface SensorsData { [key: string]: string }

declare global {
    interface Window {
        api: {
            getSensorsData: () => Promise<SensorsData | null>;
            refreshWindows: () => Promise<void>;
            executeCommand: (command: string) => Promise<void>;
            getAppsData: () => Promise<AppObject | null>;
            getBackgroundsData: () => Promise<BackgroundObject[] | null>;
            getModesData: () => Promise<ModeObject | null>;
            addBackground: (path: string) => Promise<true | Error>;
            pickFile: () => Promise<string | null>;
            readSharedMem : () => Promise<object | null>;
        };
    }
}

export interface BgData {
    backgrounds : BackgroundObject[],
    bgSelectedValue: number,
    lenBackgrounds: number,
    bgIndex: number
}

interface CoresSensors {
    [key: string]: {load : Sensor, temp : Sensor, clock : Sensor}
}

export interface CardsSlots {
    cpuCard : {
        frontFace : (Sensor | null)[],
        backFace : CoresSensors
    },

    gpuCard : {
        frontFace : (Sensor | null)[],
        backFace : (Sensor | null)[] |null
    },

    ramCard : {
        frontFace : (Sensor | null)[],
        backFace : (Sensor | null)[]
    }

    fanCard : {
        frontFace : (Sensor | null)[],
        backFace : (Sensor | null)[]
    }

}

export interface ParsedReadings {

    cpu : {
        load : number,
        temp : number,
        clock : number,
        power : number,
        cores : {load : number, temp : number, clock : number}[]
    },

    dgpu : {
        load : number,
        temp : number,
        clock : number,
        power : number,
        vramUsed : number,
        vramTotal : number
    } | null,

    igpu : {
        load : number,
        temp : number,
        clock : number,
        vramUsed : number,
        vramTotal : number
    } | null,

    ram : {
        used : number,
        available : number
    },

    disc : {
        used : number,
        available : number
    },

    network : {
        download : number,
        upload : number,
        speed : number,
        ping : number
    }

    fan : {[key: string] : number}[]
}

export interface ParsedSensors {

    cpu : {
        load : number,
        temp : number,
        clock : number,
        power : number,
        cores : {load : number, temp : number, clock : number}[]
    },

    dgpu : {
        load : number,
        temp : number,
        clock : number,
        power : number,
        vramUsed : number,
        vramTotal : number
    } | null,

    igpu : {
        load : number,
        temp : number,
        clock : number,
        vramUsed : number,
        vramTotal : number
    } | null,

    ram : {
        used : number,
        available : number
    },

    disc : {
        used : number,
        available : number
    },

    network : {
        download : number,
        upload : number,
        speed : number,
        ping : number
    }

    fan : {[key: string] : number}[]
}

export interface maxValues {
    cpu : {
        load : number,
        temp : number,
        clock : number,
        power : number,
    },

    dgpu : {
        load : number,
        temp : number,
        clock : number,
        power : number,
        vram : number
    } | null,

    igpu : {
        load : number,
        temp : number,
        clock : number,
        power : number,
        vram : number
    } | null,

    ram : number,

    disc : number,

    network : {
        download : number,
        upload : number,
        speed : number,
        ping : number
    },

    fan : {[key: string] : number}
}

export interface SharedMemData {
    version:    number;
    version2:   number;
    lastUpdate: number;
    sensors:    Sensor[];
    readings:   Reading[];
}

export interface Reading {
    index:         number;
    readingType:   ReadingType;
    sensorIndex:   number;
    readingId:     number;
    labelOriginal: string;
    labelUser:     string;
    unit:          Unit;
    value:         number;
    valueMin:      number;
    valueMax:      number;
    valueAvg:      number;
}

export enum ReadingType {
    Clock = "Clock",
    Current = "Current",
    Fan = "Fan",
    Other = "Other",
    Power = "Power",
    Temperature = "Temperature",
    Usage = "Usage",
    Voltage = "Voltage",
}

export enum Unit {
    A = "A",
    C = "°C",
    Empty = "%",
    FPS = "FPS",
    GB = "GB",
    GTS = "GT/s",
    KBS = "KB/s",
    MB = "MB",
    MBS = "MB/s",
    MHz = "MHz",
    MS = "ms",
    RPM = "RPM",
    T = "T",
    Unit = "",
    V = "V",
    W = "W",
    Wh = "Wh",
    X = "x",
    YesNo = "Yes/No",
}

export interface Sensor {
    index:        number;
    sensorId:     number;
    sensorInst:   number;
    nameOriginal: string;
    nameUser:     string;
    readings:     Reading[];
}
