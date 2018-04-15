const Alexa = require('alexa-sdk');

var getFood = require("./get-today-menu.js")(require("./awsbucketstrategy.js"));

getFood().then(console.log);

const handlers = {
  'LaunchRequest': function(){
    this.response.speak("This is a test");
    this.emit(':responseReady');
  }
}

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
