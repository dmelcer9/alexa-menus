import { RequestHandler } from "ask-sdk";
import { handler } from "../handler";

// tslint:disable-next-line:max-line-length
const speechOutput = "Say something like, is ravioli being served today, or, is soup being served in international village for lunch. You can also add or remove a food to your favorites, ask if any of your favorites are being served, or clear your favorites.";

export const HelpIntent: RequestHandler = {
    canHandle: (handlerInput) => {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent";
    },
    handle: (handlerInput) => {
        return handlerInput.responseBuilder.speak(speechOutput).getResponse();
    },
};
