import { Callback, Context, Handler } from "aws-lambda";

import {AWSBucketStrategy} from "./dining-api/awsbucketstrategy";
import { ILocation } from "./dining-api/diningInterface";
import * as MenuRefresh from "./dining-api/get-date-menu";

const MillisInDay = 24 * 60 * 60 * 1000;

export const handler: Handler = async function(event: any, context: Context, callback: Callback) {
    console.log("Updating S3 bucket");

    const menuCreator = MenuRefresh.getMenuCreator(AWSBucketStrategy);

    const dateNow = new Date();

    const promises: Array<Promise<ILocation[]>> = [];
    // Get the next 14 days
    for (let i = 0; i < 14; i++) {
        promises.push(
            menuCreator(new Date(dateNow.getTime() + (i * MillisInDay))));
    }

    await Promise.all(promises);
    console.log("Updated bucket");
};
