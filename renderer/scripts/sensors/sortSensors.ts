import { ParsedSensors } from "../types";

interface SensorReading {
    labelOriginal: string;
    value: number;
    readingType?: string;
}

interface SensorGroup {
    nameOriginal: string;
    readings: SensorReading[];
}


const sensorsKeywords = {
    cpu: {
        general: ["Intel Core", "AMD Ryzen", "CPU"],
        power: ["CPU Package Power", "Package Power", "CPU Power [W]"],
        load: ["Total CPU Usage", "CPU Usage [%]", "CPU Total"],
        temp: ["CPU Package [°C]", "CPU (Tctl/Tdie)", "Core Temp", "CPU Temp"],
        clock: ["Core Clocks (avg)", "Average Effective Clock", "CPU Clock"],
        coreLoad: ["T0 Usage [%]", "Core Usage", "Thread Usage"],
        coreTemp: ["Core #", "P-core", "E-core"],
        coreClock: ["P-core", "E-core", "Core #"],
    },
    igpu: {
        general: ["Intel UHD", "Intel Iris", "iGPU"],
        load: ["GPU D3D Usage [%]_iGPU", "GPU Core Load_iGPU"],
        temp: ["GPU Temperature_iGPU"],
        clock: ["GPU Clock [MHz]_iGPU"],
        vram: ["GPU D3D Memory Dynamic_iGPU"],
    },
    dgpu: {
        general: ["NVIDIA", "AMD Radeon", "RTX", "RX "],
        power: ["GPU Power [W]_dGPU", "GPU Package Power"],
        load: ["GPU Core Load [%]_dGPU", "GPU D3D Usage_dGPU"],
        temp: ["GPU Temperature [°C]_dGPU"],
        clock: ["GPU Clock [MHz]_dGPU", "GPU Effective Clock"],
        vram: ["GPU Memory Allocated", "GPU Memory Usage [%]_dGPU"],
    },
    ram: {
        used: ["Physical Memory Used", "Memory Used [MB]"],
        free: ["Physical Memory Available", "Memory Available [MB]"],
    },
    disc: {
        used: ["Disk Used", "Drive Used"],
        free: ["Disk Free", "Drive Free"],
    },
    network: {
        download: ["Current DL rate", "Download", "DL Rate"],
        upload: ["Current UP rate", "Upload", "UP Rate"],
    },
    battery: {
        level: ["Charge Level [%]", "Battery Level"],
        chargeRate: ["Charge Rate [W]", "Battery Rate"],
    },
    fans: ["Fan", "RPM", "CPU Fan", "GPU Fan", "Chassis Fan"]
};

const groupsKeywords = {
    cpu: ["CPU [#"],
    dgpu: ["GPU [#1]"],
    igpu: ["Enhanced", "GPU [#0]"],
    ram: ["System:", "Memory"],
    network: ["Network:"],
    battery: ["Battery:"],
    fans: ["EC:", "Super IO", "ITE", "Nuvoton", "Winbond", "ACPI"]
};

type GroupCategory = keyof typeof groupsKeywords;

const findReading = (readings: SensorReading[], keywords: string[]): SensorReading | undefined => {



    return readings.find(r => keywords.some(kw => r.labelOriginal.includes(kw)));
};

export const sortSensors = (data: { sensors: SensorGroup[] }): ParsedSensors | null => {
    try {

// Custom replacer to handle BigInt
const bigIntReplacer = (key : any, value : any) => {
    if (typeof value === 'bigint') {
        return Number(value); // or return value.toString() if you want to keep precision
    }
    return value;
};

// Log the entire data object
console.log(JSON.stringify(data, bigIntReplacer, 2));        const result: ParsedSensors = {
            cpu: { load: 0, temp: 0, clock: 0, power: 0, cores: [] },
            dgpu: null,
            igpu: null,
            ram: { used: 0, available: 0 },
            disc: { used: 0, available: 0 },
            network: { download: 0, upload: 0, speed: 0, ping: 0 },
            fan: []
        };

        // Temporary storage for CPU data from multiple groups
        let cpuMainGroup: SensorGroup | null = null;
        let cpuDtsGroup: SensorGroup | null = null;
        let cpuEnhancedGroup: SensorGroup | null = null;

        // First pass: categorize CPU groups
        for (const group of data.sensors) {
            const name = group.nameOriginal;
            
            if (name.includes("CPU [#") && !name.includes(":") && !name.includes("DTS") && !name.includes("Enhanced")) {
                cpuMainGroup = group;
            }
            else if (name.includes("CPU [#") && name.includes("DTS")) {
                cpuDtsGroup = group;
            }
            else if (name.includes("CPU [#") && name.includes("Enhanced")) {
                cpuEnhancedGroup = group;
            }
        }

        // Process CPU main group (clocks, load, per-core load)
        if (cpuMainGroup) {
            const { readings } = cpuMainGroup;
            const load = findReading(readings, sensorsKeywords.cpu.load);
            const clock = findReading(readings, sensorsKeywords.cpu.clock);
            
            if (load) result.cpu.load = load.value;
            if (clock) result.cpu.clock = clock.value;

            // Per-core loads - Intel P-cores
            const pCoreLoads = readings.filter(r => /^P-core \d+ T0 Usage/.test(r.labelOriginal));
            const pCoreClocks = readings.filter(r => /^P-core \d+ Clock$/.test(r.labelOriginal));
            
            // Intel E-cores
            const eCoreLoads = readings.filter(r => /^E-core \d+ T0 Usage/.test(r.labelOriginal));
            const eCoreClocks = readings.filter(r => /^E-core \d+ Clock$/.test(r.labelOriginal));
            
            // AMD cores
            const amdCoreLoads = readings.filter(r => /^Core #\d+ Usage/.test(r.labelOriginal));
            const amdCoreClocks = readings.filter(r => /^Core #\d+ Clock/.test(r.labelOriginal));
            
            const coreLoads = pCoreLoads.length ? pCoreLoads : amdCoreLoads;
            const coreClocks = pCoreClocks.length ? pCoreClocks : amdCoreClocks;
            
            // Initialize cores array with load and clock, temp will be filled later
            result.cpu.cores = coreLoads.map((_, i) => ({
                load: coreLoads[i]?.value ?? 0,
                temp: 0,
                clock: coreClocks[i]?.value ?? 0,
            }));
            
            // Append E-cores
            for (let i = 0; i < eCoreLoads.length; i++) {
                result.cpu.cores.push({
                    load: eCoreLoads[i]?.value ?? 0,
                    temp: 0,
                    clock: eCoreClocks[i]?.value ?? 0,
                });
            }
        }

        // Process CPU DTS group (per-core temps)
        if (cpuDtsGroup) {
            const { readings } = cpuDtsGroup;
            
            const pCoreTemps = readings.filter(r => /^P-core \d+$/.test(r.labelOriginal));
            const eCoreTemps = readings.filter(r => /^E-core \d+$/.test(r.labelOriginal));
            const amdCoreTemps = readings.filter(r => /^Core #\d+$/.test(r.labelOriginal));
            
            const coreTemps = pCoreTemps.length ? pCoreTemps : amdCoreTemps;
            
            // Fill temps for existing cores
            for (let i = 0; i < coreTemps.length; i++) {
                if (result.cpu.cores[i]) {
                    result.cpu.cores[i].temp = coreTemps[i].value;
                }
            }
            
            // Fill E-core temps
            const startIdx = coreTemps.length;
            for (let i = 0; i < eCoreTemps.length; i++) {
                const coreIdx = startIdx + i;
                if (result.cpu.cores[coreIdx]) {
                    result.cpu.cores[coreIdx].temp = eCoreTemps[i].value;
                }
            }
        }

        // Process CPU Enhanced group (power, iGPU)
        if (cpuEnhancedGroup) {
            const { readings } = cpuEnhancedGroup;
            const power = findReading(readings, sensorsKeywords.cpu.power);
            const temp = findReading(readings, sensorsKeywords.cpu.temp);
            
            if (power) result.cpu.power = power.value;
            if (temp) result.cpu.temp = temp.value;
            
            // iGPU data might be here for Intel
            const igpuLoad = findReading(readings, ["GPU D3D Usage"]);
            const igpuTemp = findReading(readings, ["CPU GT Cores"]);
            const igpuClock = findReading(readings, ["GPU Clock"]);
            const igpuVramUsed = findReading(readings, ["GPU D3D Memory Dynamic"]);
            
            if (igpuLoad || igpuClock) {
                result.igpu = {
                    load: igpuLoad?.value ?? 0,
                    temp: igpuTemp?.value ?? 0,
                    clock: igpuClock?.value ?? 0,
                    vramUsed: igpuVramUsed?.value ?? 0,
                    vramTotal: 0,
                };
            }
        }

        // Process remaining groups
        for (const group of data.sensors) {
            const { nameOriginal: name, readings } = group;

            // Skip CPU groups we already processed
            if (name.includes("CPU [#")) continue;

            // dGPU
            if (name.includes("GPU [#1]")) {
                const load = findReading(readings, ["GPU Core Load"]);
                const temp = findReading(readings, ["GPU Temperature"]);
                const clock = findReading(readings, ["GPU Clock"]);
                const power = findReading(readings, ["GPU Power"]);
                const vramUsed = findReading(readings, ["GPU Memory Allocated"]);
                const vramTotal = findReading(readings, ["GPU Memory Available"]);

                result.dgpu = {
                    load: load?.value ?? 0,
                    temp: temp?.value ?? 0,
                    clock: clock?.value ?? 0,
                    power: power?.value ?? 0,
                    vramUsed: vramUsed?.value ?? 0,
                    vramTotal: vramTotal?.value ?? (vramUsed?.value ? vramUsed.value * 2 : 0),
                };
            }
            
            // iGPU only if no dGPU exists and not already set from Enhanced group
            else if (name.includes("GPU [#0]") && !result.dgpu && !result.igpu) {
                const load = findReading(readings, ["GPU D3D Usage", "GPU Core Load"]);
                const temp = findReading(readings, ["GPU Temperature"]);
                const clock = findReading(readings, ["GPU Clock"]);
                const vramUsed = findReading(readings, ["GPU D3D Memory Dynamic", "GPU Memory Allocated"]);

                result.igpu = {
                    load: load?.value ?? 0,
                    temp: temp?.value ?? 0,
                    clock: clock?.value ?? 0,
                    vramUsed: vramUsed?.value ?? 0,
                    vramTotal: 0,
                };
            }

            // RAM
            else if (name.includes("System:")) {
                const used = findReading(readings, sensorsKeywords.ram.used);
                const available = findReading(readings, sensorsKeywords.ram.free);
                if (used) result.ram.used = used.value;
                if (available) result.ram.available = available.value;
            }

            // Network
            else if (name.includes("Network:")) {
                const dl = findReading(readings, sensorsKeywords.network.download);
                const ul = findReading(readings, sensorsKeywords.network.upload);
                if (dl) result.network.download += dl.value;
                if (ul) result.network.upload += ul.value;
            }

            // Fans
            else if (groupsKeywords.fans.some(kw => name.includes(kw))) {
                const fanReadings = readings.filter(r => 
                    r.readingType === "Fan" || r.labelOriginal.includes("RPM")
                );
                for (const fan of fanReadings) {
                    result.fan.push({ [fan.labelOriginal]: fan.value });
                }
            }
        }

        return result;
    }
    catch (err) {
        console.error(err);
        return null;
    }
};