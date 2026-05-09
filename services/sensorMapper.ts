interface SensorCandidate {
  readingId: number;
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
        readingId: number;
        label: string;
      }[];
      clockSensor: {
        readingId: number;
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
    vramUsage: number | null;
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
    readingId: number;
  }[];
  battery: {
    level: number | null;
    chargeRate: number | null;
  };
  storage: {
    total: number | null;
    used: number | null;
    free: number | null;
  };
}

const extractCandidates = (rawData: RawSensorsFile): SensorCandidate[] => {
  const candidates: SensorCandidate[] = [];
  rawData.sensors.forEach((sensor) => {
    sensor.readings.forEach((reading) => {
      candidates.push({
        readingId: reading.index,
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
You are an advanced hardware telemetry mapper.

Your task is to analyze telemetry data coming from:
- HWiNFO
- LibreHardwareMonitor
- OpenHardwareMonitor

Understand:
- CPU topology
- Intel P/E cores
- AMD SMT topology
- Hyperthreading
- GPU telemetry
- RAM telemetry
- Battery telemetry
- Storage telemetry
- Fan telemetry

━━━━━━━━━━━━━━━━━━━
STRICT RULES
━━━━━━━━━━━━━━━━━━━

- Return ONLY valid JSON
- No markdown
- No explanations
- No comments
- No trailing commas

- Use ONLY readingId values from candidates
- Never invent IDs
- Never invent sensors

- Missing sensors = null

━━━━━━━━━━━━━━━━━━━
SENSOR SELECTION RULES
━━━━━━━━━━━━━━━━━━━

Prefer:
- package temperatures over hotspot temperatures
- total usage over per-core usage
- effective clocks over requested clocks
- dedicated GPU over integrated GPU
- GPU core temperature over memory temperature
- total memory usage over process-specific usage

Ignore:
- minimum values
- maximum values
- average historical values
- duplicated sensors
- throttling sensors
- hotspot sensors unless no package exists

━━━━━━━━━━━━━━━━━━━
FAN RULES
━━━━━━━━━━━━━━━━━━━

- Every sensor with unit "RPM" is considered a fan
- Automatically add all RPM sensors to fans array
- Do not hardcode fan counts
- AIO pumps can also appear as RPM sensors

━━━━━━━━━━━━━━━━━━━
CPU CORE RULES
━━━━━━━━━━━━━━━━━━━

- Detect CPU topology automatically
- Group thread usage sensors together
- Intel P/E cores must be identified
- AMD SMT cores should use "standard"

Example:

{
  "name": "Core 0",
  "type": "performance",
  "usageSensors": [
    { "readingId": 111, "label": "P-core 0 T0 Usage" },
    { "readingId": 112, "label": "P-core 0 T1 Usage" }
  ],
  "clockSensor": {
    "readingId": 113,
    "label": "P-core 0 Clock"
  }
}

━━━━━━━━━━━━━━━━━━━
EXPECTED JSON STRUCTURE
━━━━━━━━━━━━━━━━━━━

{
  "cpu": {
    "usage": number | null,
    "clock": number | null,
    "temperature": number | null,
    "power": number | null,
    "cores": [
      {
        "name": string,
        "type": "performance" | "efficiency" | "standard",
        "usageSensors": [
          { "readingId": number, "label": string }
        ],
        "clockSensor": { "readingId": number, "label": string } | null
      }
    ]
  },
  "gpu": {
    "usage": number | null,
    "clock": number | null,
    "temperature": number | null,
    "power": number | null,
    "vramAllocated": number | null,
    "vramUsage": number | null
  },
  "iGpu": {
    "usage": number | null,
    "clock": number | null,
    "vramDynamic": number | null
  },
  "memory": {
    "usage": number | null,
    "available": number | null
  },
  "fans": [
    { "name": string, "readingId": number }
  ],
  "battery": {
    "level": number | null,
    "chargeRate": number | null
  },
  "storage": {
    "total": number | null,
    "used": number | null,
    "free": number | null
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
