
import * as AWS from "aws-sdk";
import { getFileName, ICacheStrategy, IMenuCache } from "./strategy";
AWS.config.update({region: "us-east-1"});

const S3 = new AWS.S3();
const bucket = "dining-cache";
const fname = "foodCache.json";

export const AWSBucketStrategy: ICacheStrategy = {
  async exists(date: string) {
    const params = {
      Bucket: bucket,
      Key: getFileName(date),
    };
    try {
      const ret = await S3.headObject(params).promise();
      return true;
    } catch (e) {
      if (e.code === "NotFound") {
          return false;
      } else {
        throw(e);
      }

    }

  },

  async read(date: string): Promise<IMenuCache> {
    const params = {
      Bucket: bucket,
      Key: getFileName(date),
    };

    const ret = await S3.getObject(params).promise();
    return JSON.parse(ret.Body.toString());
  },

  async write(date: string, obj: IMenuCache) {
    const params = {
      Bucket: bucket,
      Key: getFileName(date),
      Body: JSON.stringify(obj),
    };

    const ret = await S3.putObject(params).promise();
    console.log(ret);
  },
};
