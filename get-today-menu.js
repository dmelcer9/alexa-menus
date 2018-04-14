var getFood = require("./dining-api.js");


var cacheTimeoutMillis = 24 * 60 * 60 * 1000;

var memCache = null;

module.exports = function(strategy){
  return async function(){
    var currentDate = new Date();
    var currentDay = currentDate.getDay();
    var currentTime = currentDate.valueOf();


    if(memCache == null && await strategy.exists()){
      console.log("Reading menus from disk");
      memCache = JSON.parse(await strategy.read());
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

      await strategy.write(memCache);
    }

    return memCache.content;
  }
}
