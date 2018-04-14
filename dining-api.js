var fetch = require("node-fetch");

var apiLoc = "https://www.dineoncampus.com/v1";

var schoolId = "5751fd2b90975b60e048929a";

module.exports = async function(date){

  dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

  school = await (await fetch(apiLoc + "/locations/all_locations.json?platform=0&site_id=" + schoolId)).json();
  locations = school.locations;
  console.log(locations);

  menuProms = locations.map(locId => fetch(apiLoc +
    "/location/menu.json?date=" + dateStr +
    "&location_id=" + locId.id +
    "&platform=0&site_id=" + schoolId));

  menus = await Promise.all(menuProms);
  menusjson = await Promise.all(menus.map(m => m.json()));


  for(var i = 0; i < locations.length; i++){
    locations[i].menu = menusjson[i].menu;
  }

  return locations;

}
