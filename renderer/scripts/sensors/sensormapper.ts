interface SensorCandidate {
  readingId: number;
  label: string;
  unit: string;
  type: string;
}

interface RawReading {
  readingId: number;
  labelOriginal: string;
  unit: string;
  readingType: string;
}

interface RawSensor {
  readings: RawReading[];
}

interface RawSensorsFile {
  sensors: RawSensor[];
}

const wantedSensors = [
  {
    key: "cpuTemp",
    description: "Main CPU temperature",
  },
  {
    key: "cpuUsage",
    description: "Total CPU usage percentage",
  },
  {
    key: "cpuClock",
    description: "Average CPU clock speed",
  },
  {
    key: "gpuTemp",
    description: "Dedicated GPU temperature",
  },
  {
    key: "gpuUsage",
    description: "Dedicated GPU usage percentage",
  },
  {
    key: "ramUsage",
    description: "Physical memory usage percentage",
  },
];

const extractCandidates = (
  rawData: RawSensorsFile
): SensorCandidate[] => {
  const candidates: SensorCandidate[] = [];

  rawData.sensors.forEach((sensor) => {
    sensor.readings.forEach((reading) => {
      candidates.push({
        readingId: reading.readingId,
        label: reading.labelOriginal,
        unit: reading.unit,
        type: reading.readingType,
      });
    });
  });

  return candidates;
};

const buildPrompt = (candidates: SensorCandidate[]) => {
  return `
You are a hardware telemetry sensor mapper.

Your task is to match each required application sensor
to the best telemetry candidate.

Return ONLY valid JSON.

Required sensors:
${JSON.stringify(wantedSensors, null, 2)}

Available telemetry candidates:
${JSON.stringify(candidates, null, 2)}

Rules:
- Return ONLY JSON
- Do not explain anything
- Keys must stay identical
- Values must be readingId numbers

Return format example:
{
  "cpuTemp": 12345,
  "cpuUsage": 67890
}
`;
};

export const mapSensorsWithAI = async (
  rawData: RawSensorsFile
) => {
  const candidates = extractCandidates(rawData);

  const prompt = buildPrompt(candidates);

  const response = await fetch(
    "YOUR_GEMINI_ENDPOINT",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
      }),
    }
  );

  const text = await response.text();

  let mappedSensors: Record<string, number>;

  try {
    mappedSensors = JSON.parse(text);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  Object.entries(mappedSensors).forEach(([key, value]) => {
    if (typeof value !== "number") {
      throw new Error(`Invalid readingId for ${key}`);
    }
  });

  return mappedSensors;
};