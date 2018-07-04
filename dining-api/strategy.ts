import { ILocation } from "./diningInterface";

export interface IMenuCache {
    lastUpdated: number; // millis since UTC epoch
    content: ILocation[];
}

export function getFileName(date: string): string {
    return "FoodCache" + date + ".json";
}

export interface ICacheStrategy {
    read: (date: string) => Promise<IMenuCache>;
    exists: (date: string) => Promise<boolean>;
    write: (date: string, object: IMenuCache) => Promise<void>;
}
