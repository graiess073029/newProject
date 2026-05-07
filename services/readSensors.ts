import fs from "fs";
import path from "path";
import { app } from "electron";
const userDataPath = app.getPath('userData');
const dataFolder = path.join(userDataPath, 'data');
import { SensorsEvents } from "./SensorsEvent";

const sensorsDataFile = path.join(dataFolder, "data.csv");

export const readSensors = async () : Promise<void> => {

  let lastPosition = 0; // Tracks where we last stopped reading

  // --- 1. Function to process new data ---
  const readNewData = () => {
    // Get the current size of the file
    const stats = fs.statSync(sensorsDataFile);
    let currentSize = stats.size;
    
    if (currentSize !== lastPosition) {
      
      if (currentSize < lastPosition) {
        lastPosition = 0;
      }

      if (currentSize === 0) return;

      // New data has been added!
      // Create a read stream starting from the last known position
      const stream = fs.createReadStream(sensorsDataFile, {
        start: lastPosition,
        end: currentSize - 1, // Read up to the end
      });

      // This is a buffer to hold partial lines if the new data doesn't end cleanly
      let lineBuffer = "";

      stream.on("data", (chunk) => {

        // The 'chunk' is a Buffer object containing the new data
        // Convert it to string and append to the buffer
        lineBuffer += chunk.toString("utf8");

        // Split the buffer by the newline character. The last element
        // might be an incomplete line, so we keep it in the buffer.
        const lines = lineBuffer.split(/\r?\n/);

        // Process all complete lines
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line) {
            SensorsEvents.emit("newData", line);          
          }
        }

        // Keep the potential incomplete line for the next chunk
        lineBuffer = lines[lines.length - 1];
      });

      stream.on("end", () => {
        // IMPORTANT: Update the last known position only after the stream finishes
        lastPosition = currentSize;

        // If there's any remaining data in the buffer (which should be rare/empty
        // if the writer always adds a newline), process it.
        if (lineBuffer.trim()) {
        }
      });

      stream.on("error", (err) => {
        console.error("Stream reading error:", err);
      });
    }
  };

  // --- 2. Initial read to set the starting position ---
  try {
    const stats = fs.statSync(sensorsDataFile);
    lastPosition = stats.size;
  } catch (err) {
    console.error(
      `Error checking file status for ${sensorsDataFile}:`,
      (err as Error).message
    );
    // If the file doesn't exist yet, we start at 0
    lastPosition = 0;
  }

  // --- 3. Watch the directory for file changes ---
  // Note: fs.watch is sometimes unreliable or gives multiple events.
  // Using a simple interval is often more reliable for this specific task (file-growth watching).
  // However, if the file is very large, fs.watch is preferred for better performance.

  // For simplicity and guaranteed one-second check:
  const interval = setInterval(readNewData, 1000);

  // Optional: Graceful shutdown
  process.on("SIGINT", () => {
    clearInterval(interval);
    process.exit();
  });
}


