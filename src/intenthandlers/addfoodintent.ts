import { RequestHandler } from "ask-sdk";
import { IntentRequest } from "ask-sdk-model";
import { addFavoriteToDB } from "../database";

export const AddFoodIntent: RequestHandler = {
    canHandle: (handlerInput) => {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
        handlerInput.requestEnvelope.request.intent.name === "AddFavoriteIntent";
    },
    handle: async (handlerInput) => {

        const request: IntentRequest = handlerInput.requestEnvelope.request as IntentRequest;
        const slotState = request.intent.slots && request.intent.slots.food;
        if (!slotState || slotState.confirmationStatus !== "CONFIRMED") {
            return handlerInput.responseBuilder.addDelegateDirective().getResponse();
         } else {
             const food = slotState.value;

             await addFavoriteToDB(handlerInput.requestEnvelope.context.System.user.userId, food);
             return handlerInput.responseBuilder.speak("Ok, I added " + food + " as a favorite.").getResponse();

         }
    },
};
