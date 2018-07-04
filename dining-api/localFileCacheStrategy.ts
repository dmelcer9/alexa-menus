import * as fs from "fs-extra";
import { getFileName, ICacheStrategy, IMenuCache } from "./strategy";

export const LocalFileCacheStrategy: ICacheStrategy = {
  async exists(date: string) {
    return await fs.pathExists(getFileName(date));
  },

  async read(date: string) {
    return await fs.readJson(getFileName(date));
  },

  async write(date: string, obj: IMenuCache) {
    await fs.writeJson(getFileName(date), JSON.stringify(obj));
  },
};
