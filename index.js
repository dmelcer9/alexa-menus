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

function nicematch(contains, search){
  if (typeof(contains) !== "string") {
    return false;
  }

  var searchArr = [search];
  if(typeof(foodGroups[search]) !== "undefined"){
    searchArr = searchArr.concat(foodGroups[search]);
  }

  return searchArr.some(s=>contains.toLowerCase().match("\\b"+s+"\\b"));
}

function isFood(potentialFood, lookingFor){
  return nicematch(potentialFood.name, lookingFor)
    || nicematch(potentialFood.ingredients, lookingFor)
    || nicematch(potentialFood.desc, lookingFor);
}

function getFoodsInPeriod(period, lookingFor){
  return period.categories.flatMap(category=>{
    return category.items.filter(item=>isFood(item, lookingFor));
  });
}

function getFoodsFromHall(dhall, lookingFor, perFilters){

  if (typeof(dhall.menu) === "undefined") return [];
  var periods = dhall.menu.periods.map(period=>{
    return {
      name: period.name,
      food: getFoodsInPeriod(period, lookingFor)
    };
  });

  for(var i = 0; i < perFilters.length; i++){
    periods = periods.filter(perFilters[i]);
  }

  return periods;
}

function getFoodsThatMatch(allFoods, lookingFor, hallFilters, perFilters){
  hallsWithFood = allFoods.map(hall=>{
    return {
      name: hall.name,
      periods: getFoodsFromHall(hall, lookingFor, perFilters)
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
  if(foods.length == 0) return "It looks like " + lookingFor + " isn't being served today.";

  var text = "";
  for(var i = 0; i<foods.length; i++){
    text += getResponseTextForHall(foods[i]);
  }
  return text.split("&").join("and");
}

async function test(){
  allfood = (await getFood());
  //console.log(allfood);

  var s = getFoodsThatMatch(allfood, "tea", [hall=>(hall.periods.length > 0)], [period=>(period.food.length > 0)]);
  console.log(isDiningHall(allfood, "stetson west eatery"));

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


const handlers = {
  'IsBeingServedIntent': async function(){


    var allfood = await getFood();


    var slotValue = this.event.request.intent.slots.Food.value;

    var hallFilters = [hall=>(hall.periods.length > 0)];
    var perFilters = [period=>(period.food.length > 0)];

    var restrictHall =  this.event.request.intent.slots.Place.value;
    var restrictMeal =  this.event.request.intent.slots.Meal.value;

    if(typeof(restrictHall) === "string"){
      var o = restrictHall;
      if(!isDiningHall(allfood, restrictHall.trim().toLowerCase())){
        restrictHall = hallRewrites[restrictHall];
      }

      if(typeof(restrictHall) === "undefined"){
        this.response.speak(o + " is not a valid dining hall.");
        this.emit(':responseReady');
        return;
      }

      hallFilters.push(hall => (hall.name.toLowerCase() === restrictHall.toLowerCase()));
    }

    if(typeof(restrictMeal) === "string"){
      if(!["breakfast","lunch","dinner"].includes(restrictMeal.toLowerCase())){
        this.response.speak(restrictMeal + " is not a valid meal period.");
        this.emit(':responseReady');
        return;
      }

      perFilters.push(meal => (meal.name.toLowerCase() === restrictMeal.toLowerCase()));
    }

    if(typeof(slotValue) !== "string" || slotValue.trim().length == 0){
      this.emit('AMAZON.HelpIntent');
      return;
    }

    var lookingFor = slotValue.trim().toLowerCase();

    if(lookingFor.slice(-1) == "s"){
      lookingFor = lookingFor.substring(0, lookingFor.length - 1);
    }
    var matchingFood = getFoodsThatMatch(allfood, lookingFor, hallFilters, perFilters);


    this.response.speak(getResponseText(matchingFood, slotValue));
    this.emit(':responseReady');
  },
  'LaunchRequest': function(){
    this.response.speak("This is a test");
    this.emit(':responseReady');
  },
  'AMAZON.HelpIntent': function () {
    var speechOutput = "Help message"
    var reprompt = "Help reprompt"
    this.emit(':ask', speechOutput, reprompt);
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', "Stop");
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', "Stop");
  }
}

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
