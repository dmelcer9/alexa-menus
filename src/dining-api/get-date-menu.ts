import getFood from "./dining-api";
import { ILocation } from "./diningInterface";
import { ICacheStrategy, IMenuCache } from "./strategy";

const cacheTimeoutMillis = 7 * 24 * 60 * 60 * 1000;

const memCache: IMultiMenuCacheType = {};

interface IMultiMenuCacheType {
  [date: string]: IMenuCache  | undefined;
}

function isValidCache(name: string, menuCache?: IMenuCache): boolean {
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentTime = currentDate.valueOf();

  if (!menuCache || menuCache === null) {
    console.log(name + " cache does not exist.");
    return false;
  } else if (currentTime - menuCache.lastUpdated > cacheTimeoutMillis) {
    const timeSinceUpdate = currentTime - menuCache.lastUpdated;
    console.log(name + "cache expired: last updated " + timeSinceUpdate.toString() + " ms ago");
    return false;
  } else {
    return true;
  }
}

export function getMenuCreator(strategy: ICacheStrategy): (date: Date) => Promise<ILocation[]> {
  return async function(date: Date): Promise<ILocation[]> {

    const datestr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    const currentDate = new Date();
    const currentTime = currentDate.valueOf();

    if (isValidCache("Memory", memCache[datestr])) {
      console.log("Recent menu exists in memory");
      return memCache[datestr].content;
    } else {
      console.log("Recent menu does not exist in memory");
    }

    if (await strategy.exists(datestr)) {
      console.log("Menu exists in disk cache");
      memCache[datestr] = await strategy.read(datestr);
      if (isValidCache("Disk", memCache[datestr])) {
        console.log("Disk cache is recent");
        return memCache[datestr].content;
      } else {
        console.log("Disk cache is out of date");
      }
    } else {
      console.log("Menu does not exist in disk cache");
    }

    if (memCache == null && await strategy.exists(datestr)) {
      console.log("Menu exists in cache");
      memCache[datestr] = await strategy.read(datestr);
    } else if (memCache[datestr]) {
      console.log("Menu exists in memory");
    } else {
      console.log("File does not exist in cache or memory");
    }

    console.log("Fetching menu from internet and updating cache");
    const food = await getFood(currentDate);

    memCache[datestr] = {
      lastUpdated: currentTime,
      content: food,
    };

    await strategy.write(datestr, memCache[datestr]);

    return memCache[datestr].content;
  };
}
