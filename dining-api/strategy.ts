import { ILocation } from "./diningInterface";

export interface IMenuCache {
    lastUpdated: number; // millis since UTC epoch
    content: ILocation[];
}

export interface ICacheStrategy {
    read: () => Promise<IMenuCache>;
    exists: () => Promise<boolean>;
    write: (object: IMenuCache) => Promise<void>;
}
