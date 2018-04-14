var express = require("express");
var fs = require("fs");
var app = express();



var port = process.env.PORT || 8080;
var bodyParser = require("body-parser");

var getFood = require("./get-today-menu.js")(require("./localFileCacheStrategy.js"));

//getFood().then(console.log);

require("./awsbucketstrategy.js").exists().then(console.log);

app.use("/", bodyParser.json());
