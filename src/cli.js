#!/usr/bin/env node
const search = require("./search");
const outputs = require("./outputs");
const chalk = require("chalk");

const error = chalk.bold.red;

let argv = require("yargs")
    .usage("$0 <package> [args]")
    .command("* <package>", "Search for a package", (yargs) => {
        yargs.positional("package", {
            describe: "Name of package to find",
            type: "string",
        });
    })
    .option("j", {
        alias: "json",
        describe: "Output json file",
        type: "string",
    })
    .option("v", {
        alias: "verbose",
        describe: "Full package names",
        type: "boolean",
        default: false,
    })
    .option("h", {
        alias: "hide",
        describe: "Hide versions",
        type: "boolean",
        default: false,
    })
    .option("p", {
        alias: "path",
        describe: "Path of package.json & package-lock.json",
        type: "string",
        default: "",
    }).argv;

if (argv.package) {
    main(argv.package, argv);
} else {
    console.log("Please provide a package string");
}

async function main(package, options) {
    let target = {};
    if (package.includes("@")) {
        let [targetName, targetVersion] = package.split("@");
        target = { targetName, targetVersion };
    } else {
        target = { targetName: package, targetVersion: null };
    }
    const targetPaths = search(target, options.path);

    if (targetPaths.length > 0) {
        outputs.outputTargetPaths(targetPaths, options);
        if (options.j) {
            outputs.outputJSON(targetPaths, options.j);
        }
    } else {
        console.log(error("No package paths found for target"));
    }
}
