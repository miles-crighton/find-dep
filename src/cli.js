#!/usr/bin/env node
const search = require("./search");

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

    search(argv.package);
} else {
    console.log("Please provide a package string");
}
