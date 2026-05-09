Interface SensorCandidate {
  index: number;
  label: string;
  unit: string;
  type: string;
  group: string;
}

interface RawReading {
  index: number;
  readingId: number;
  labelOriginal: string;
  unit: string;
  readingType: string;
  value: number;
}

interface RawSensor {
  nameOriginal: string;
  readings: RawReading[];
}

export interface RawSensorsFile {
  sensors: RawSensor[];
  readings: RawReading[];
}

export interface TelemetryMap {
  cpu: {
    usage: number | null;
    clock: number | null;
    temperature: number | null;
    power: number | null;
    cores: {
      name: string;
      type: "performance" | "efficiency" | "standard";
      usageSensors: {
        index: number;
        label: string;
      }[];
      clockSensor: {
        index: number;
        label: string;
      } | null;
    }[];
  };
  gpu: {
    usage: number | null;
    clock: number | null;
    temperature: number | null;
    power: number | null;
    vramAllocated: number | null;
    vramAvailable: number | null;
  };
  iGpu: {
    usage: number | null;
    clock: number | null;
    vramDynamic: number | null;
  };
  memory: {
    usage: number | null;
    available: number | null;
  };
  fans: {
    name: string;
    index: number;
  }[];
  battery: {
    level: number | null;
    chargeRate: number | null;
  };
}

const extractCandidates = (rawData: RawSensorsFile): SensorCandidate[] => {
  const candidates: SensorCandidate[] = [];
  rawData.sensors.forEach((sensor) => {
    sensor.readings.forEach((reading) => {
      candidates.push({
        index: reading.index,
        label: reading.labelOriginal,
        unit: reading.unit,
        type: reading.readingType,
        group: sensor.nameOriginal,
      });
    });
  });
  return candidates;
};

const buildPrompt = (candidates: SensorCandidate[]): string => {
  return `
You are an expert hardware telemetry engineer with deep knowledge of all hardware monitoring software including HWiNFO, LibreHardwareMonitor, OpenHardwareMonitor, AIDA64, and others.

You have complete knowledge of how every CPU, GPU, motherboard, and peripheral vendor names their sensors — including Intel, AMD, NVIDIA, MSI, ASUS, Gigabyte, ASRock, Dell, Lenovo, HP, and all other manufacturers.

Your task is to analyze a list of hardware sensor candidates and map each one to the correct semantic slot in the output JSON.

━━━━━━━━━━━━━━━━━━━
STRICT OUTPUT RULES
━━━━━━━━━━━━━━━━━━━

- Return ONLY valid JSON
- No markdown, no explanations, no comments, no trailing commas
- EVERY numeric value in the output must be a candidate index (the global sequential integer)
- NEVER return actual sensor readings, temperatures, percentages, watts, MHz, MB, or any measured data
- NEVER use the readingId field — it is not unique and must be completely ignored
- NEVER invent index numbers — only use indexes that exist in the provided candidates
- If a sensor cannot be confidently identified, use null

━━━━━━━━━━━━━━━━━━━
YOUR APPROACH
━━━━━━━━━━━━━━━━━━━

Use your hardware knowledge to understand what each sensor measures regardless of its name.
Sensor names vary across vendors, software versions, and hardware generations.
You must identify the correct sensor by understanding its semantic meaning, not by matching keywords.

Examples of the same concept named differently:
- CPU die temperature: "CPU Package", "Tctl/Tdie", "Core Temp", "CPU Temp", "Die Temp", "CPU Junction"
- CPU total usage: "Total CPU Usage", "CPU Usage", "CPU Load", "Processor Total"
- GPU core load: "GPU Core Load", "GPU Usage", "GPU Load", "3D Usage"
- RAM used: "Physical Memory Used", "Memory Used", "RAM Used", "Used RAM"
- Battery charge rate: "Charge Rate", "Battery Power", "AC Power", "Charging Power"

Always pick the most representative single sensor for each slot:
- For temperatures: the whole-package or die temperature, not per-core or junction
- For clocks: the average or boost clock, not base or bus clock
- For usage: the total aggregate, not per-core or per-thread
- For VRAM: the currently allocated amount and the total available capacity
- For iGPU: sensors from the integrated graphics unit that shares system memory, not the dedicated GPU

CRITICAL: The index field in each candidate is the exact number you must use.
Do not count positions in this list — read the index field directly from each candidate object.
Example: if a candidate shows "index": 48, you must output 48, not the position of that item in the list.

━━━━━━━━━━━━━━━━━━━
WHAT TO IGNORE
━━━━━━━━━━━━━━━━━━━

Never map these to any slot:
- Historical min/max/average values
- Throttling or power limit indicators (Yes/No sensors)
- Distance-to-TjMax sensors
- C-state residency sensors
- Per-thread utility sensors
- Frame time or FPS sensors (PresentMon)
- PCIe error counters
- Voltage offset sensors
- Bus clock or uncore clock
- Storage sensors — storage is handled by a separate service, set all storage fields to null

━━━━━━━━━━━━━━━━━━━
FAN RULES
━━━━━━━━━━━━━━━━━━━

- Every candidate with unit "RPM" is a fan or pump
- Add ALL RPM candidates to the fans array automatically
- Use the candidate label as the fan name
- Do not limit or filter fans — include every single RPM sensor found

━━━━━━━━━━━━━━━━━━━
CPU CORE TOPOLOGY RULES
━━━━━━━━━━━━━━━━━━━

- Analyze the full candidate list to reconstruct the CPU core topology
- For Intel hybrid CPUs: identify Performance cores and Efficiency cores separately
- For AMD SMT CPUs: each core has two threads, use "standard" type
- For each core, group all its thread usage sensors together in usageSensors
- For core clock, use the actual core clock sensor, not the effective or utility clock
- Each core entry must represent one physical core with all its logical threads

Example of a correct core entry:
{
  "name": "Core 0",
  "type": "performance",
  "usageSensors": [
    { "index": 48, "label": "P-core 0 T0 Usage" },
    { "index": 49, "label": "P-core 0 T1 Usage" }
  ],
  "clockSensor": {
    "index": 19,
    "label": "P-core 0 Clock"
  }
}

━━━━━━━━━━━━━━━━━━━
EXPECTED JSON STRUCTURE
━━━━━━━━━━━━━━━━━━━

Every numeric value is a candidate index, never a measured value.

{
  "cpu": {
    "usage": <index of the sensor measuring total aggregate CPU utilization across all cores>,
    "clock": <index of the sensor measuring the current average or boost CPU clock frequency>,
    "temperature": <index of the sensor measuring the whole CPU package or die temperature>,
    "power": <index of the sensor measuring total CPU package power consumption in watts>,
    "cores": [
      {
        "name": string,
        "type": "performance" | "efficiency" | "standard",
        "usageSensors": [
          { "index": <candidate index>, "label": string }
        ],
        "clockSensor": { "index": <candidate index>, "label": string } | null
      }
    ]
  },
  "gpu": {
    "usage": <index of the sensor measuring dedicated GPU core utilization percentage>,
    "clock": <index of the sensor measuring the current dedicated GPU core clock frequency>,
    "temperature": <index of the sensor measuring the dedicated GPU core temperature>,
    "power": <index of the sensor measuring total dedicated GPU power consumption in watts>,
    "vramAllocated": <index of the sensor measuring currently allocated dedicated GPU memory in MB>,
    "vramAvailable": <index of the sensor measuring total available dedicated GPU memory in MB>
  },
  "iGpu": {
    "usage": <index of the sensor measuring integrated GPU utilization percentage>,
    "clock": <index of the sensor measuring integrated GPU clock frequency>,
    "vramDynamic": <index of the sensor measuring integrated GPU dynamic memory usage in MB>
  },
  "memory": {
    "usage": <index of the sensor measuring currently used physical system RAM in MB>,
    "available": <index of the sensor measuring currently available physical system RAM in MB>
  },
  "fans": [
    { "name": string, "index": <candidate index of the RPM sensor> }
  ],
  "battery": {
    "level": <index of the sensor measuring current battery charge percentage>,
    "chargeRate": <index of the sensor measuring current battery charging or discharging power in watts>
  }
}

━━━━━━━━━━━━━━━━━━━
AVAILABLE TELEMETRY CANDIDATES
━━━━━━━━━━━━━━━━━━━

${JSON.stringify(candidates, null, 2)}
`;
};

const extractJson = (text: string): string => {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in AI response");
  }
  return text.slice(firstBrace, lastBrace + 1);
};

const validateTelemetryMap = (map: TelemetryMap): void => {
  if (!map.cpu) throw new Error("Missing CPU mapping");
  if (!Array.isArray(map.cpu.cores)) throw new Error("Invalid CPU cores mapping");
  if (!Array.isArray(map.fans)) throw new Error("Invalid fans mapping");
  map.cpu.cores.forEach((core) => {
    if (!Array.isArray(core.usageSensors))
      throw new Error(`Invalid usageSensors for ${core.name}`);
  });
};

export const getValue = (rawData: RawSensorsFile, index: number | null): number | null => {
  if (index === null) return null;
  return rawData.readings[index]?.value ?? null;
};

export const mapSensorsWithAI = async (
  rawData: RawSensorsFile,
  apiKey: string
): Promise<TelemetryMap> => {
  const candidates = extractCandidates(rawData);
  const prompt = buildPrompt(candidates);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) throw new Error("Gemini returned empty response");

  const cleanJson = extractJson(rawText);

  let telemetryMap: TelemetryMap;
  try {
    telemetryMap = JSON.parse(cleanJson);
  } catch {
    throw new Error("Gemini returned invalid JSON:\n" + cleanJson);
  }

  validateTelemetryMap(telemetryMap);
  return telemetryMap;
};