#!/usr/bin/env node
const path = require("path");
const fileHandler = require("./fileHandler.js");

let argv = require("yargs")
    .usage("$0 <package> [args]")
    .command("* <package>", "Search for a package", (yargs) => {
        yargs.positional("package", {
            describe: "Name of package to find",
            type: "string",
        });
    }).argv;

if (argv.package) {
    console.log("Searching for package:", argv.package);

    const deps = fileHandler.getDependencies();
    const packages = fileHandler.getPackageData();
    console.log("Your local deps: ", deps);
} else {
    console.log("Please provide a package string");
}
