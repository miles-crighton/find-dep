"use strict";

const fs = require("fs");
const path = require("path");

module.exports.getDependencies = function (dev = false, filePath = "") {
    let rawPackageData = fs.readFileSync(path.join(filePath, "package.json"));
    let packageData = JSON.parse(rawPackageData);
    if (!("dependencies" in packageData)) {
        console.log("No dependencies found");
        process.exit(1);
    }
    if ("devDependencies" in packageData && dev) {
        return Object.assign(
            packageData.dependencies,
            packageData.devDependencies
        );
    }
    return packageData.dependencies;
};

module.exports.getPackageData = function (filePath = "") {
    //Go create the graph out of the package-lock.json
    let rawPackageData = fs.readFileSync(
        path.join(filePath, "package-lock.json")
    );
    let packageData = JSON.parse(rawPackageData);
    if (!("dependencies" in packageData)) {
        console.log("No dependencies found");
        process.exit(1);
    }
    return packageData.dependencies;
};
