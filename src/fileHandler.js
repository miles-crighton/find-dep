"use strict";

const fs = require("fs");
const path = require("path");

module.exports.getDependencies = function (path = "") {
    let rawPackageData = fs.readFileSync(path || "package.json");
    let packageData = JSON.parse(rawPackageData);
    if (!("dependencies" in packageData)) {
        console.log("No dependencies found");
        process.exit(1);
    }
    return packageData.dependencies;
};

module.exports.getPackageData = function (path = "") {
    //Go create the graph out of the package-lock.json
    let rawPackageData = fs.readFileSync(path || "package-lock.json");
    let packageData = JSON.parse(rawPackageData);
    if (!("dependencies" in packageData)) {
        console.log("No dependencies found");
        process.exit(1);
    }
    return packageData.dependencies;
};
