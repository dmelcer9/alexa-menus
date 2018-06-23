import { Callback, Context, Handler } from "aws-lambda";

import {AWSBucketStrategy} from "./dining-api/awsbucketstrategy";
import * as MenuRefresh from "./dining-api/get-today-menu";

export const handler: Handler = async function(event: any, context: Context, callback: Callback) {
    console.log("Updating S3 bucket");

    await MenuRefresh.getTodayMenuCreator(AWSBucketStrategy)();
    console.log("Updated bucket");
};
