var fs = require("fs-extra");
module.exports = {
  exists: async function(){
    return await fs.pathExists("foodCache.json");
  },

  read: async function(){
    return await fs.readJson("foodCache.json");
  },

  write: async function(obj){
    await fs.writeJson("foodCache.json", JSON.stringify(obj));
  }
}
