const Alexa = require('alexa-sdk');

var getFood = require("./get-today-menu.js")(require("./awsbucketstrategy.js"));

function isFood(potentialFood, lookingFor){
  return potentialFood.name.indexOf(lookingFor) != -1
    || potentialFood.ingredients.indexOf(lookingFor) != -1;
}

function getFoodsInPeriod(period, lookingFor){
  return period.categories.flatMap(category=>{
    return category.items.filter(item=>isFood(item, lookingFor));
  });
}

const handlers = {
  'IsBeingServedIntent': async function(){
    var slotValue = this.event.request.intent.slots.Food.value;

    if(typeof(slotValue) !== "string" || slotValue.trim().length == 0){
      this.response.emitWithState('AMAZON:HelpIntent');
      return;
    }

    lookingFor = slotValue.trim();

    if(lookingFor.slice(-1) === "s"){
      lookingFor = lookingFor.substring(0, lookingFor.length - 1);
    }

    console.log("B" + slotValue);
    this.response.speak("You asked for: " + slotValue);
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
    console.log("A" + JSON.stringify(event));
    alexa.registerHandlers(handlers);
    alexa.execute();
};
