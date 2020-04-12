#!/usr/bin/env node
const path = require("path");
const fileHandler = require("./fileHandler.js");

const deps = fileHandler.getDependencies();
const packages = fileHandler.getPackageData();
console.log("Your package deps: ", deps);
