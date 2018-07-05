import { HandlerInput, RequestHandler } from "ask-sdk";
import { IntentRequest } from "ask-sdk-model";
import { removeAllFromDB } from "../database";

export const RemoveFromFavoritesIntent: RequestHandler = {
     canHandle: (hand: HandlerInput) =>  {
        return hand.requestEnvelope.request.type === "IntentRequest"
        && hand.requestEnvelope.request.intent.name === "ClearAllFavoritesIntent";
     },

     handle: async (handlerInput) => {
        const request: IntentRequest = handlerInput.requestEnvelope.request as IntentRequest;

        if (!request.dialogState || request.dialogState !== "COMPLETED") {
            return handlerInput.responseBuilder.addDelegateDirective().getResponse();
         } else if (request.intent.confirmationStatus === "CONFIRMED") {
             await removeAllFromDB(handlerInput.requestEnvelope.context.System.user.userId);
             return handlerInput.responseBuilder.speak("Ok, I cleared your list of favorites.").getResponse();
         } else {
             return handlerInput.responseBuilder.speak("Ok, I didn't touch your favorites.").getResponse();
         }
     },
};
