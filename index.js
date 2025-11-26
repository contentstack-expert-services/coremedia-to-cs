const fs = require("fs");
const mkdirp = require("mkdirp");
const inquirer = require("inquirer");
const chalk = require("chalk");
const path = require("path");
const readdirRecursive = require("fs-readdir-recursive");
const messages = require("./utils/messages");
var contentList = ["contenttype", "globalFields", "entries", "exportInfo"];
var _export = [];

config = require("./config/index.json");

const migFunction = async () => {
  try {
    const question = [
      {
        type: "input",
        name: "csFilePath",
        message: messages.promptFilePath,
        validate: (csFilePath) => {
          if (!csFilePath || csFilePath.trim() === "") {
            console.log(chalk.red("Please insert filepath!"));
            return false;
          }
          this.name = csFilePath;
          return true;
        },
      },
    ];

    inquirer.prompt(question).then(async (answer) => {
      try {
        const allowedExtension = ".xml";
        if (path.extname(answer.csFilePath)) {
          const extension = path.extname(answer.csFilePath);
          if (
            !fs.existsSync(answer.csFilePath) &&
            !fs.lstatSync(answer.csFilePath).isDirectory()
          ) {
            console.log(
              chalk.red(`Please check if filepath `),
              chalk.yellow(`"${answer.csFilePath}"`),
              chalk.red(`is valid or not and try again!`)
            );

            return;
          }
          if (fs.existsSync(answer.csFilePath)) {
            global.config.filename = answer.csFilePath;
            for (let i = 0; i < contentList.length; i++) {
              const ModuleExport = require(`./libs/${contentList[i]}.js`);
              const moduleExport = new ModuleExport();
              await moduleExport.start();
            }
          } else {
            console.log(
              chalk.red(`Please check if filepath `),
              chalk.yellow(`"${answer.csFilePath}"`),
              chalk.red(`is valid or not and try again!`)
            );
            XMLMigration();
          }
        } else {
          global.config.xml_filename = `${answer.csFilePath}.xml`;
          if (fs.existsSync(`${answer.csFilePath}.xml`)) {
            fileCheck(`${answer.csFilePath}.xml`);
          } else {
            console.log(
              chalk.red(`Please check if filepath `),
              chalk.yellow(`"${answer.csFilePath}"`),
              chalk.red(`is valid or not and try again!`)
            );
            XMLMigration();
          }
        }
      } catch (error) {
        console.log(chalk.red(error.message));
      }
    });
  } catch (error) {
    console.log("Error occurred", error);
  }
};

migFunction();
