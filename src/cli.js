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
    }).argv;

if (argv.package) {
    let target = {};
    if (argv.package.includes("@")) {
        let [targetName, targetVersion] = argv.package.split("@");
        target = { targetName, targetVersion };
    } else {
        target = { targetName: argv.package, targetVersion: null };
    }
    const targetPaths = search(target);

    let options = { verbose: false };

    if (targetPaths.length > 0) {
        outputs.outputTargetPaths(targetPaths, options);
    } else {
        console.log(error("No package paths found for target"));
    }
} else {
    console.log("Please provide a package string");
}
