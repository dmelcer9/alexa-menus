import getFood from "./dining-api";
import { ILocation } from "./diningInterface";
import { ICacheStrategy, IMenuCache } from "./strategy";

const cacheTimeoutMillis = 24 * 60 * 60 * 1000;

let memCache: IMenuCache | undefined;

function isValidCache(name: string, menuCache?: IMenuCache): boolean {
  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  const currentTime = currentDate.valueOf();

  if (!menuCache || menuCache === null) {
    console.log(name + " cache does not exist.");
    return false;
  } else if (currentTime - memCache.lastUpdated > cacheTimeoutMillis) {
    const timeSinceUpdate = currentTime - memCache.lastUpdated;
    console.log(name + "cache expired: last updated " + timeSinceUpdate.toString() + " ms ago");
    return false;
  } else if (currentDay !== new Date(memCache.lastUpdated).getDay()) {
    console.log(name + "cache is from a different day.");
    return false;
  } else {
    return true;
  }
}

export function getTodayMenuCreator(strategy: ICacheStrategy): () => Promise<ILocation[]> {
  return async function(): Promise<ILocation[]> {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const currentTime = currentDate.valueOf();

    if (isValidCache("Memory", memCache)) {
      console.log("Recent menu exists in memory");
      return memCache.content;
    } else {
      console.log("Recent menu does not exist in memory");
    }

    if (strategy.exists()) {
      console.log("Menu exists in disk cache");
      memCache = await strategy.read();
      if (isValidCache("Disk", memCache)) {
        console.log("Disk cache is recent");
        return memCache.content;
      } else {
        console.log("Disk cache is out of date");
      }
    } else {
      console.log("Menu does not exist in disk cache");
    }

    if (memCache == null && await strategy.exists()) {
      console.log("Menu exists in cache");
      memCache = await strategy.read();
    } else if (memCache) {
      console.log("Menu exists in memory");
    } else {
      console.log("File does not exist in cache or memory");
    }

    console.log("Fetching menu from internet and updating cache");
    const food = await getFood(currentDate);

    memCache = {
      lastUpdated: currentTime,
      content: food,
    };

    await strategy.write(memCache);

    return memCache.content;
  };
}
