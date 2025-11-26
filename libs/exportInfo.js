const config = require("../config");
const fs = require("fs");
const path = require("path");

function ExtractInfo() {}
ExtractInfo.prototype = {
  start: async function () {
    await fs.writeFileSync(
      path.join(process.cwd(), config.data, "export-info.json"),
      JSON.stringify({ contentVersion: 2, logsPath: "" }, null, 2)
    );
  },
};
module.exports = ExtractInfo;
