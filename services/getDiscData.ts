import { statfs } from "fs/promises";
import { DiscData } from "../types";

const getDiscUsage = async (): Promise<DiscData | null> => {
    try {

      const stats = await statfs("C:\\");

      const total = stats.blocks * stats.bsize;   // total capacity
      const free = stats.bfree * stats.bsize;   // free space
      const used = total - free;                 // derived used space

      let data = {
        "Disk Total [GB]": (total / (1024 ** 3)).toFixed(2),
        "Disk Free [GB]": (free / (1024 ** 3)).toFixed(2),
        "Disk Used [GB]": (used / (1024 ** 3)).toFixed(2)
      };

      return data

    }

  catch (err) {
    console.error("Error getting disk usage:", err);
    return null;
  }

}

let discData: DiscData | null = null;

(async () => {
  const discUsage = await getDiscUsage();
  if (discUsage) discData = discUsage;

})()

setInterval(async () => {

  const discUsage = await getDiscUsage();
  if (discUsage) discData = discUsage;

}, 60000);

export const getDiskData = () => discData;



