const Alexa = require('alexa-sdk');

const concat = (x,y) =>
  x.concat(y)

const flatMap = (f,xs) =>
  xs.map(f).reduce(concat, [])

Array.prototype.flatMap = function(f) {
  return flatMap(f,this)
}

var getFood = require("./get-today-menu.js")(require("./awsbucketstrategy.js"));

var foodGroups = {
  "soup":["bisque"]
}

function uniq(a) {
    var seen = {};
    return a.filter(food=>{
      var notSeenAlready = (typeof(seen[food.name]) === "undefined");
      seen[food.name] = true;
      return notSeenAlready
    });
}

function containsFilter(food, filter){
  return food.filters.some(oneFil=>{
    return oneFil.name.toLowerCase() === filter.toLowerCase();
  })
}

function nicematch(contains, search){
  if (typeof(contains) !== "string") {
    return false;
  }

  var searchArr = [search];
  if(typeof(foodGroups[search]) !== "undefined"){
    searchArr = searchArr.concat(foodGroups[search]);
  }

  return searchArr.some(s=>contains.toLowerCase().match("\\b"+s.toLowerCase()+"\\b"));
}

function isFood(potentialFood, lookingFor){
  return nicematch(potentialFood.name, lookingFor)
    || nicematch(potentialFood.ingredients, lookingFor)
    || nicematch(potentialFood.desc, lookingFor);
}

function getFoodsInPeriod(period, lookingFor, foodFilters){
  var a =
    uniq(period.categories.flatMap(category=>{
      var ret = category.items;
      for(var i = 0; i < foodFilters.length; i++){
        ret = ret.filter(foodFilters[i]);
      }
      return ret;
    }));
  return a;
}

function getFoodsFromHall(dhall, lookingFor, perFilters, foodFilters){

  if (typeof(dhall.menu) === "undefined") return [];
  var periods = dhall.menu.periods.map(period=>{
    return {
      name: period.name,
      food: getFoodsInPeriod(period, lookingFor, foodFilters)
    };
  });

  for(var i = 0; i < perFilters.length; i++){
    periods = periods.filter(perFilters[i]);
  }

  return periods;
}

function getFoodsThatMatch(allFoods, lookingFor, hallFilters, perFilters, foodFilters){
  hallsWithFood = allFoods.map(hall=>{
    return {
      name: hall.name,
      periods: getFoodsFromHall(hall, lookingFor, perFilters, foodFilters)
    };
  });

  for(var i = 0; i < hallFilters.length; i++){
    hallsWithFood = hallsWithFood.filter(hallFilters[i]);
  }


  return hallsWithFood;

}

function getResponseForPeriod(period){
  var text = "For " + period.name + ": ";

  if(period.length == 0) return text + "no food matches. "

  for(var i = 0; i < period.food.length; i++){
    if(i > 0 && i == period.food.length - 1){
      text += "and "
    }
    text += period.food[i].name;
    text += (i != period.food.length - 1) ? ", " : ". ";
  }

  return text;
}

function getResponseTextForHall(hall){
  var text = "In " + hall.name + ": ";

  if (hall.length == 0) return text + " no food matches. "

  for(var i = 0; i < hall.periods.length; i++){
    if(i > 0 && i == hall.periods.length - 1){
      text += "And "
    }
    text += getResponseForPeriod(hall.periods[i]);
  }

  return text;
}

function getResponseText(foods, lookingFor){
  if(foods.length == 0) return "It looks like " + lookingFor + " that matches your filters isn't being served today.";

  var text = "";
  for(var i = 0; i<foods.length; i++){
    text += getResponseTextForHall(foods[i]);
  }
  return text.split("&").join("and");
}

async function test(){
  var allfood = await getFood();

  var s = doSearch(allfood, "soup", undefined, "Dinner", "vegetarian", "Corn mushrooms");
//  console.log(s[0].periods)

  console.log(getResponseText(s, "tea"));
}


hallRewrites = {
  "stetson east":"levine marketplace",
  "stetson west":"stetson west eatery",
  "iv":"international village",
  "west end":"the west end"
}

function isDiningHall(allFoods, toCheck){
  return allFoods.some(hall=>hall.name.trim().toLowerCase() === toCheck);
}

function doSearch(allfood, slotValue, restrictHall, restrictMeal, restrictVeg, excludeIngredients){

  var lookingFor = slotValue.trim().toLowerCase();

  if(lookingFor.slice(-1) == "s"){
    lookingFor = lookingFor.substring(0, lookingFor.length - 1);
  }

  var hallFilters = [hall=>(hall.periods.length > 0)];
  var perFilters = [period=>(period.food.length > 0)];
  var foodFilters = [item=>isFood(item, lookingFor)];


  if(typeof(restrictHall) === "string"){
    var o = restrictHall;
    if(!isDiningHall(allfood, restrictHall.trim().toLowerCase())){
      restrictHall = hallRewrites[restrictHall];
    }

    if(typeof(restrictHall) === "undefined"){
      return o + " is not a valid dining hall.";
    }

    hallFilters.push(hall => (hall.name.toLowerCase() === restrictHall.toLowerCase()));
  }

  if(typeof(restrictMeal) === "string"){
    if(!["breakfast","lunch","dinner"].includes(restrictMeal.toLowerCase())){
      return restrictMeal + " is not a valid meal period.";
    }

    perFilters.push(meal => (meal.name.toLowerCase() === restrictMeal.toLowerCase()));
  }

  if(typeof(slotValue) !== "string" || slotValue.trim().length == 0){
    return "It doesn't seem that you provided a food to search for. Please try again.";
  }

  if(typeof(restrictVeg) === "string"){
    foodFilters.push(food=>containsFilter(food, restrictVeg));
  }

  if(typeof(excludeIngredients) === "string"){
    var excluded = excludeIngredients.split(" ")
                                     .filter(food=>food.length>0)
                                     .map(food=>food.slice(-1) == "s"?
                                            food.substring(0, food.length - 1):
                                            food);
    foodFilters = foodFilters.concat(
      excluded.map(filter=>{
        return item=>{
          return !isFood(item, filter) && !containsFilter(item, filter);
        }
      }));
  }

  var matchingFood = getFoodsThatMatch(allfood, lookingFor, hallFilters, perFilters, foodFilters);

  return matchingFood;
}


const handlers = {
  'IsBeingServedIntent': async function(){

    var slotValue = this.event.request.intent.slots.Food.value;


    var restrictHall =  this.event.request.intent.slots.Place.value;
    var restrictMeal =  this.event.request.intent.slots.Meal.value;

    var restrictVeg = this.event.request.intent.slots.VFilter.value;
    var excludeIngredients = this.event.request.intent.slots.ExcludeIngredients.value;


    var allfood = await getFood();

    var filteredFoods = doSearch(allfood, slotValue, restrictHall, restrictMeal, restrictVeg, excludeIngredients);

    if(typeof(filteredFoods) === "string"){
      this.response.speak(filteredFoods);
    } else{
      this.response.speak(getResponseText(filteredFoods, slotValue));
    }

    this.emit(':responseReady');
  },
  'LaunchRequest': function(){
    this.emit('AMAZON.HelpIntent');
  },
  'AMAZON.HelpIntent': function () {
    var speechOutput = "Say something like, is ravioli being served today, or, is soup being served in international village for lunch";
    this.emit(':tell', speechOutput);
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', "Exiting dining");
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', "Exiting dining");
  }
}

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
