import { RequestHandler } from "ask-sdk";
import { IntentRequest } from "ask-sdk-model";
import { addFavoriteToDB } from "../database";

export const AddFoodIntent: RequestHandler = {
    canHandle: (handlerInput) => {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
        handlerInput.requestEnvelope.request.intent.name === "AddFavoriteIntent";
    },
    handle: (handlerInput) => {

        const request: IntentRequest = handlerInput.requestEnvelope.request as IntentRequest;
        if (request.dialogState !== "COMPLETED") {
            return handlerInput.responseBuilder.addDelegateDirective().getResponse();
         } else {
             const food = request.intent.slots && request.intent.slots.food.value;
             if (food) {
                 addFavoriteToDB(handlerInput.requestEnvelope.context.System.user.userId, food);
                 return handlerInput.responseBuilder.speak("Ok, I added " + food + " as a favorite.").getResponse();
             }
         }
    },
};
