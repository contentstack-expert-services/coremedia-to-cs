const fs = require("fs");
const path = require("path");
const when = require("when");
var mkdirp = require("mkdirp");
const chalk = require("chalk");
const config = require("../config");

const globalfieldfolder = config.modules.globalFields;

function ExtractGlobalField() {}
ExtractGlobalField.prototype = {
  start: async function () {
    const seoSchema = [
      {
        title: "SEO",
        uid: "seo",
        description: "",
        schema: [
          {
            data_type: "text",
            display_name: "htmlDescription",
            uid: "htmldescription",
            field_metadata: {
              description: "",
              default_value: "",
              multiline: true,
            },
            format: "",
            error_messages: {
              format: "",
            },
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
          },
          {
            data_type: "text",
            display_name: "htmlTitle",
            uid: "htmltitle",
            field_metadata: {
              description: "",
              default_value: "",
            },
            format: "",
            error_messages: {
              format: "",
            },
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
          },
          {
            data_type: "text",
            display_name: "keywords",
            uid: "keyword",
            field_metadata: {
              description: "",
              default_value: "",
            },
            format: "",
            error_messages: {
              format: "",
            },
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
          },
        ],
      },
    ];
    if (
      !fs.existsSync(
        path.join(
          process.cwd(),
          config.data,

          globalfieldfolder.dirName
        )
      )
    ) {
      mkdirp.sync(
        path.join(process.cwd(), config.data, globalfieldfolder.dirName)
      );
    }
    await fs.writeFileSync(
      path.join(
        process.cwd(),
        config.data,
        globalfieldfolder.dirName,
        globalfieldfolder.fileName
      ),
      JSON.stringify(seoSchema, null, 2)
    );
  },
};
module.exports = ExtractGlobalField;
