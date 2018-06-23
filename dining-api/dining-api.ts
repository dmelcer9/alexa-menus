import fetch from "node-fetch";
import { Response } from "node-fetch";
import { ILocation, IMenu } from "./diningInterface";

const apiLoc = "https://www.dineoncampus.com/v1";

const schoolId = "5751fd2b90975b60e048929a";

interface ISchool {
  locations: ILocation[];
}

interface IMenuResp {
  menu: IMenu;
}

export default async function(date): Promise<any> {

  const dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

  const schoolResp: Response = await fetch(apiLoc + "/locations/all_locations.json?platform=0&site_id=" + schoolId);

  const school: ISchool = await schoolResp.json();
  const locations = school.locations;
  console.log(locations);

  const menuProms: Array<Promise<Response>> = locations.map((locId) => fetch(apiLoc +
    "/location/menu.json?date=" + dateStr +
    "&location_id=" + locId.id +
    "&platform=0&site_id=" + schoolId));

  const menus = await Promise.all(menuProms);
  const menusjson = await Promise.all(menus.map((m: Response) => m.json())) as IMenuResp[];

  for (let i = 0; i < locations.length; i++) {
    locations[i].menu = menusjson[i].menu;
  }

  return locations;

}
