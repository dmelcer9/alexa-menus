const Alexa = require('alexa-sdk');

const concat = (x,y) =>
  x.concat(y)

const flatMap = (f,xs) =>
  xs.map(f).reduce(concat, [])

Array.prototype.flatMap = function(f) {
  return flatMap(f,this)
}

var getFood = require("./get-today-menu.js")(require("./awsbucketstrategy.js"));

function nicematch(contains, search){
  return (typeof(contains) === "string") && contains.toLowerCase().match("\\b"+search+"\\b");
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

function getFoodsFromHall(dhall, lookingFor){

  if (typeof(dhall.menu) === "undefined") return [];
  var periods = dhall.menu.periods.map(period=>{
    return {
      name: period.name,
      food: getFoodsInPeriod(period, lookingFor)
    };
  });

  return periods.filter(period=>(period.food.length > 0));
}

function getFoodsThatMatch(allFoods, lookingFor){
  hallsWithFood = allFoods.map(hall=>{
    return {
      name: hall.name,
      periods: getFoodsFromHall(hall, lookingFor)
    };
  });

  return hallsWithFood.filter(hall=>(hall.periods.length > 0));

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

  var s = getFoodsThatMatch(allfood, "tea");

  console.log(getResponseText(s, "tea"));
}

test();


const handlers = {
  'IsBeingServedIntent': async function(){

    console.log("A")
    var slotValue = this.event.request.intent.slots.Food.value;
    console.log("Slot value: " + slotValue);

    if(typeof(slotValue) !== "string" || slotValue.trim().length == 0){
      this.emit('AMAZON.HelpIntent');
      return;
    }
    console.log("B")

    var lookingFor = slotValue.trim().toLowerCase();

    if(lookingFor.slice(-1) == "s"){
      lookingFor = lookingFor.substring(0, lookingFor.length - 1);
    }
    console.log("C")

    var allfood = await getFood();
    console.log("D")
    var matchingFood = getFoodsThatMatch(allfood, lookingFor);

    console.log("E")

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
