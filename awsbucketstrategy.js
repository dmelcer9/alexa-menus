var AWS = require('aws-sdk');
AWS.config.update({region:"us-east-1"});
AWS.config.credentials =
    new AWS.SharedIniFileCredentials({ profile: 'default' });

var S3 = new AWS.S3();
const bucket = "dining-cache";
const fname = "foodCache.json";

module.exports = {
  exists: async function(){
    var params = {
      Bucket: bucket,
      Key: fname
    }
    try{
      var ret = await S3.headObject(params).promise();
      return true;
    } catch(e){
      if(e.code === "NotFound"){
          return false;
      }else{
        throw(e);
      }

    }

  },

  read: async function(){
    return await fs.readJson("foodCache.json");
  },

  write: async function(obj){
    await fs.writeJson("foodCache.json", JSON.stringify(obj));
  }
}
