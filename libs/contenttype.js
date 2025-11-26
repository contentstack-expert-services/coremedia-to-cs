const fs = require("fs");
const path = require("path");
const when = require("when");
const unzipper = require("unzipper");
const readdirRecursive = require("fs-readdir-recursive");
const chalk = require("chalk");
const createSchema = require("./createSchema");

const config = require("../config");
const contenttypeFolder = config?.modules?.contentTypes;
let Schema_Array = [];

// Read the existing schema once at the start
const schemaPath = path.join(
  process.cwd(),
  config.data,
  contenttypeFolder.dirName,
  contenttypeFolder.masterfile
);

function ExtractContentTypes() {}

async function processEachFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  //console.log(chalk.blue(`Processing file: ${filePath}`));
  const allData = fs.readFileSync(filePath, "utf8");
  //const jsonData = JSON.parse(allData);
  //const data = jsonData?.data;

  if (ext === ".json") {
    try {
      const jsonData = JSON.parse(allData);
      const data = jsonData?.data;
      if (data) {
        const contentObject = await createSchema(data);

        contentObject && Schema_Array.push(contentObject);
      } else {
        console.log(chalk.gray(`No "data" property in ${filePath}`));
      }
    } catch (err) {
      //console.error(
      //chalk.red(`Invalid JSON in file: ${filePath}, error: ${err.message}`)
      //);
    }
  } 

}

// Extract ZIP and process all XML inside
async function processZip(zipPath) {
  const fileNameWithoutExt = path
    .basename(zipPath, path.extname(zipPath))
    .replace(/_/g, " ");
  const extractPath = path.join(__dirname);
  fs.mkdirSync(extractPath, { recursive: true });

  await fs
    .createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractPath }))
    .promise();

  // Use fs-readdir-recursive to get all files
  const allFiles = readdirRecursive(path.join(extractPath, fileNameWithoutExt));

  for (const file of allFiles) {
    //if (path.extname(file).toLowerCase() === ".xml") {
    await processEachFile(path.join(extractPath, fileNameWithoutExt, file));
    await fs.writeFileSync(
      schemaPath,
      JSON.stringify(Schema_Array, null, 2),
      "utf-8"
    );
    //}
  }
  return extractPath;
}

ExtractContentTypes.prototype = {
  start: async function () {
    const csFilePath = await processZip(global.config.filename);
  },
};
module.exports = ExtractContentTypes;
