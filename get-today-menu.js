var getFood = require("./dining-api.js");
var fs = require("fs-extra");

var cacheTimeoutMillis = 24 * 60 * 60 * 1000;

var memCache = null;

module.exports = async function(){
  var currentDate = new Date();
  var currentDay = currentDate.getDay();
  var currentTime = currentDate.valueOf();


  if(memCache == null && await fs.pathExists("foodCache.json")){
    console.log("Reading menus from disk");
    memCache = JSON.parse(await fs.readJson("foodCache.json"));
  }

  if (
    memCache == null
      || currentTime - memCache.lastUpdated > cacheTimeoutMillis
      || currentDay !== new Date(memCache.lastUpdated).getDay()){
    //Pull new data
    console.log("Fetching menu from internet")
    food = await getFood(currentDate);

    memCache = {
      lastUpdated : currentTime,
      content : food
    }

    await fs.writeJson("foodCache.json", JSON.stringify(memCache));
  }

  return memCache.content;
}
