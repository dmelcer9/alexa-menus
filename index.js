const Alexa = require('alexa-sdk');

const concat = (x,y) =>
  x.concat(y)

const flatMap = (f,xs) =>
  xs.map(f).reduce(concat, [])

Array.prototype.flatMap = function(f) {
  return flatMap(f,this)
}

var getFood = require("./get-today-menu.js")(require("./awsbucketstrategy.js"));

function isFood(potentialFood, lookingFor){
  return potentialFood.name.toLowerCase().indexOf(lookingFor) != -1
    || potentialFood.ingredients.toLowerCase().indexOf(lookingFor) != -1;
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

async function test(){
  allfood = (await getFood());
  //console.log(allfood);

  console.log(getFoodsThatMatch(allfood, "sushi"));
}

const handlers = {
  'IsBeingServedIntent': async function(){

    console.log("A")
    var slotValue = this.event.request.intent.slots.Food.value;

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

    this.response.speak(matchingFood.length==0?"No":"Yes");
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
