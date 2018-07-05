import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

import * as Alexa from "ask-sdk";
import { AddFoodIntent } from "./intenthandlers/addfoodintent";
import { HelpIntent } from "./intenthandlers/helpIntent";

import * as admin from "firebase-admin";

import serviceAccount = require("../firebase-key.json");
import { RemoveFromFavoritesIntent } from "./intenthandlers/removefromfavoritesintent";

export let db: admin.database.Database;

export const handler: Handler = (event: any, context: Context, callback?: Callback) => {
    console.log(JSON.stringify(event));

    const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: "https://alexa-dining.firebaseio.com",
    });

    db = admin.database();

    context.callbackWaitsForEmptyEventLoop = false;
    Alexa.SkillBuilders.custom()
    .addRequestHandlers(HelpIntent,
         AddFoodIntent,
         RemoveFromFavoritesIntent).lambda()(event, context, (error, result) => {
        app.delete();
        console.log(JSON.stringify(result));
        if (callback) {
            callback(error, result);
        }
    });

};
