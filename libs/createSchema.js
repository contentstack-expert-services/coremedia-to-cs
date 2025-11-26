const config = require("../config");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const handleStructType = require("../utils/handleStruct");
const contenttypeFolder = config?.modules?.contentTypes?.dirName;

if (!fs.existsSync(path.join(process.cwd(), config.data, contenttypeFolder))) {
  mkdirp.sync(path.join(process.cwd(), config.data, contenttypeFolder));
}

const templetes = [];
const skipKeys = [
  "notSearchable",
  "externalId",
  "externalRefId",
  "ignoreUpdates",
  "masterVersion",
  "notSearchable",
  "validFrom",
  "validTo",
  "locale",
  "htmlDescription",
  "keywords",
];
async function schemaMapper(properties) {
  if (!properties) return [];

  const mapped = await Promise.all(
    Object.entries(properties)
      .filter(([key]) => !skipKeys.includes(key))
      .map(async ([key, prop]) => {
        if (key === "htmlTitle") {
          return {
            data_type: "global_field",
            display_name: "Seo",
            reference_to: "seo",
            field_metadata: {
              description: "",
            },
            uid: "seo",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
          };
        }
        skipKeys.push("htmlTitle");
        const type = prop.type?.toLowerCase?.();

        switch (type) {
          case "string":
            return key === "title"
              ? {
                  data_type: "text",
                  display_name: key,
                  uid: key.toLowerCase(),
                  field_metadata: {
                    description: "",
                    default_value: "",
                  },
                  format: "",
                  error_messages: {
                    format: "",
                  },
                  mandatory: true,
                  multiple: false,
                  non_localizable: false,
                  unique: false,
                }
              : { 
                  data_type: "text",
                  display_name: key,
                  uid: key.toLowerCase(),
                  field_metadata: {
                    description: "",
                    default_value: "",
                  },
                  multiple: false,
                  mandatory: false,
                  unique: false,
              };
            break;
          case "integer":
            return {
              data_type: "number",
              display_name: key,
              uid: key.toLowerCase(),
              field_metadata: {
                description: "",
                default_value: "",
              },
              multiple: false,
              mandatory: false,
              unique: false,
            };
            break;
          case "date":
            return {
              data_type: "isodate",
              display_name: key,
              startDate: null,
              endDate: null,
              uid: key.toLowerCase(),
              field_metadata: {
                description: "",
                default_value: "",
              },
              multiple: false,
              mandatory: false,
              unique: false,
            };
            break;
          case "boolean":
            return {
              data_type: "boolean",
              display_name: key,
              uid: key.toLowerCase(),
              field_metadata: {
                description: "",
                default_value: "",
              },
              multiple: false,
              mandatory: false,
              unique: false,
            };
            break;
          case "struct":
            const structSchema = await handleStructType(key, prop);
        

            if (structSchema?.length === 0) {
              return null;
            } else if (structSchema) {
              return {
                data_type: "group",
                display_name: key,
                uid: key.toLowerCase(),
                schema: structSchema,
              };
            } else {
              return null;
            }
            break;
          case "linklist":
            if (prop?.references?.length > 0) {
              //const parts = data?.id.split("/").filter(Boolean);
              //const lastTwo = parts.slice(-2).join("_");
              const referencedId = prop?.references?.map((item) =>
                item?.type?.replace(/^CM/, "")?.toLowerCase()
              );

              return {
                data_type: "reference",
                display_name: key,
                reference_to: [referencedId[0]],
                field_metadata: {
                  ref_multiple: true,
                  ref_multiple_content_types: true,
                },
                uid: key?.toLowerCase(),
                unique: false,
                mandatory: false,
                multiple: false,
              };
            }
            break;
          default:
            return null;
        }
      })
  );

  const filtered = mapped?.filter(Boolean);
  if (
    !filtered?.find((item) => item?.data_type === "text" && item?.uid === "url")
  ) {
    filtered.push({
      display_name: "Url",
      uid: "url",
      data_type: "text",
      mandatory: true,
      unique: false,
      field_metadata: { _default: true },
      format: "",
      error_messages: { format: "" },
      multiple: false,
      non_localizable: false,
    });
  }
  return filtered.filter(Boolean);
}

async function createSchema(data) {

  const schema = await schemaMapper(data.properties);


  const type = data?.type?.replace(/^CM/, "");
  const len = data?.path?.length;
  const title = data?.path?.split("/").pop();
  let contentObject;
  const parts = data?.id.split("/").filter(Boolean);
  const lastTwo = parts.slice(-2).join("_");
 
  if (!templetes.includes(data?.type)) {
  
    contentObject = {
      title: type,
      uid: type?.toLowerCase(),
      schema: schema,
      options: {
        is_page: true,
        title: "title",
        sub_title: [],
        url_pattern: "/:year/:month/:title",
        _version: 1,
        url_prefix: `/${data?.uid}/`,
        description: "",
        singleton: false,
      },
      description: "",
      type: data?.type,
    };

    const contentJSON = JSON.stringify(contentObject, null, 2);
    fs.writeFileSync(
      path.join(
        process.cwd(),
        config.data,
        contenttypeFolder,
        `${type?.toLowerCase()}.json`
      ),
      contentJSON
    );
  }
  templetes.push(data?.type);

  return contentObject;
}

module.exports = createSchema;
