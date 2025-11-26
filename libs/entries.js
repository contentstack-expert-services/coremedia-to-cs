const fs = require("fs");
const path = require("path");
const when = require("when");
var mkdirp = require("mkdirp");
const readdirRecursive = require("fs-readdir-recursive");
const chalk = require("chalk");


const xml2js = require("xml2js");

const contenttypeFolder = config.modules.contentTypes.dirName;
const contentTypeFolder = path.join(
  process.cwd(),
  config.data,
  contenttypeFolder
);
const globalFieldFolder = config?.modules?.globalFields;
const entryFolder = config.modules.entries?.dirName;

if (!fs.existsSync(path.join(process.cwd(), config.data, entryFolder))) {
  mkdirp.sync(path.join(process.cwd(), config.data, entryFolder));
}
const skipKeys = [
  "notSearchable",
  "externalId",
  "externalRefId",
  "ignoreUpdates",
  "masterVersion",
  "notSearchable",
  "validFrom",
  "validTo",
];
let locale;

const transformStruct = (parsedStruct) => {
  let schema = {};
  Object.entries(parsedStruct || {})
    .map(async ([key, prop]) => {
      if (key === "attributes") return null;

      switch (key) {
        case "StringProperty":
          schema[key?.toLowerCase()] = prop?.text;
          break;

        case "BooleanProperty":
          schema[key?.toLowerCase()] = prop?.text;
          break;
        case "StructProperty":
          schema[key?.toLowerCase()] = await transformStruct(prop?.Struct); // recursive call for nested struct
          break;

        default:
          return null;
      }
    })
    .filter(Boolean);
  return schema;
};

function ExtractEntries() {}

ExtractEntries.prototype = {
  createEntry: async function (entryData, contentType) {
    try {
      const entry = {};

      for (const field of contentType?.schema || []) {
        switch (field?.data_type) {
          case "text":
            if (field?.uid === "title") {
              entry[field.uid] =
                entryData?.data?.properties?.[field?.display_name]?.value !== ""
                  ? entryData?.data?.properties?.[field?.display_name]?.value
                  : entryData?.data?.path?.split("/")?.pop();
            } else {
              entry[field?.uid] =
                entryData?.data?.properties?.[field?.display_name]?.value;
            }
            break;

          case "group":
            if (
              field?.schema &&
              entryData?.data?.properties?.[field?.display_name]?.value &&
              typeof entryData?.data?.properties?.[field?.display_name]
                ?.value === "string"
            ) {
              const parser = new xml2js.Parser({
                attrkey: "attributes",
                charkey: "text",
                explicitArray: false,
              });

              const parsedStruct = await parser.parseStringPromise(
                entryData?.data?.properties?.[field?.display_name]?.value
              );

             
              entry[field?.uid] = await transformStruct(parsedStruct?.Struct);
            }
            break;
          case "global_field":
            const fieldData = await fs.readFileSync(
              path.join(
                process.cwd(),
                config.data,
                globalFieldFolder.dirName,
                globalFieldFolder.fileName
              ),
              "utf-8"
            );
            const jsonFieldData = JSON.parse(fieldData);

            const singleGlobalField = jsonFieldData?.find(
              (item) => item?.uid === field?.uid
            );
            const data = await this.createEntry(entryData, singleGlobalField);

            entry[field?.uid] = await this.createEntry(
              entryData,
              singleGlobalField
            );
            break;
          case "reference":
            entry[field?.uid] = entryData?.data?.properties?.[
              field?.display_name
            ]?.references?.map((item) => {
              return {
                uid: item?.uuid,
                _content_type_uid: item?.type
                  ?.replace(/^CM/, "")
                  ?.toLowerCase(),
              };
            });
            break;
        }
      }
      entry["uid"] = entryData?.data?.uuid;
      entry["locale"] =
        entryData?.data?.properties["locale"]?.value?.toLowerCase();
      return entry;
    } catch (error) {
      console.info("error in createEntry function ", error?.message);
    }
  },

  create: async function (data) {
    const fileNameWithoutExt = path
      .basename(
        global?.config?.filename,
        path.extname(global?.config?.filename)
      )
      .replace(/_/g, " ");
    
    const allEntry = {};
    const extractedDataFolder = path.join(__dirname, fileNameWithoutExt);

    const templateName = data?.type;

    const contentTypeUid = data?.uid;

    try {
    
      const files = readdirRecursive(extractedDataFolder);

      const jsonFiles = files.filter((f) => f.endsWith(".json"));

      for (const file of jsonFiles) {
        const filePath = path?.join(extractedDataFolder, file);
      
        const raw = await fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);

        if (parsed?.data?.type === templateName) {
          const entry = await this.createEntry(parsed, data);
          locale = parsed?.data?.properties?.locale?.value?.toLowerCase();
          
           if (!locale ) {
              console.warn("Skipping write: Missing locale or contentTypeUid", { locale, contentTypeUid });
              return;
            }
          const fileKey = parsed?.data?.uuid;
          allEntry[fileKey] = entry;
        }
      }
     
      if (
        !fs.existsSync(
          path.join(
            process?.cwd(),
            config.data,
            entryFolder,
            contentTypeUid,
            locale
          )
        )
      ) {
        mkdirp.sync(
          path.join(
            process.cwd(),
            config.data,
            entryFolder,
            contentTypeUid,
            locale
          )
        );
      }
      const contentJSON = JSON.stringify(allEntry, null, 2);
     
      fs.writeFileSync(
        path.join(
          process.cwd(),
          config.data,
          entryFolder,
          contentTypeUid,
          locale,
          `${locale}.json`
        ),
        contentJSON
      );
      fs.writeFileSync(
        path.join(
          process.cwd(),
          config.data,
          entryFolder,
          contentTypeUid,
          locale,
          "index.json"
        ),
        JSON.stringify({ 1: `${locale}.json` }, null, 2)
      );
    } catch (error) {
      console.error("❌ error in create:", error);
      console.info("error in create", error?.message);
    }
  },
  start: async function () {
    fs.readdir(contentTypeFolder, async (err, files) => {
      if (err) {
        console.error("Error reading folder:", err);
        return;
      }

      for (const file of files) {
        const filePath = path.join(contentTypeFolder, file);
        if (path.basename(file) === "schema.json") {
          console.info("Skipping schema.json:", file);
          continue;
        }

        try {
          const stats = fs.statSync(filePath);

          if (stats.isFile()) {
            const content = fs.readFileSync(filePath, "utf-8"); // read file
            const contentType = JSON.parse(content);
            await this.create(contentType);
            
          }
        } catch (error) {
          console.error(`❌ Error processing ${file}:`, error);
        }
      }
    });
    //const csFilePath = await processZip(global.config.filename);
   
  },
};
module.exports = ExtractEntries;
