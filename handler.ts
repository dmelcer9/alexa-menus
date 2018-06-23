import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

import * as Alexa from "ask-sdk";
import { AddFoodIntent } from "./intenthandlers/addfoodintent";
import { HelpIntent } from "./intenthandlers/helpIntent";

export const handler: Handler =  Alexa.SkillBuilders.custom()
    .addRequestHandlers(HelpIntent, AddFoodIntent).lambda();
