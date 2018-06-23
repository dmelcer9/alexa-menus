import * as fs from "fs-extra";
import { ICacheStrategy, IMenuCache } from "./strategy";

export const LocalFileCacheStrategy: ICacheStrategy = {
  async exists() {
    return await fs.pathExists("foodCache.json");
  },

  async read() {
    return await fs.readJson("foodCache.json");
  },

  async write(obj: IMenuCache) {
    await fs.writeJson("foodCache.json", JSON.stringify(obj));
  },
};
