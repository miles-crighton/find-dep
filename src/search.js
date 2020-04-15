const fileHandler = require("./fileHandler");
var _ = require("lodash");
const chalk = require("chalk");

const error = chalk.bold.red;
const success = chalk.bold.green;

function versionToRegex(version) {
    //Want to allow for wild cards * or ^ & ~ at start
    let directive = version[0];
    const parts = version.split(".");
    if (directive === "~" || directive === "^") {
        parts[0] = parts[0].slice(1, parts[0].length);
    }
    let regexString = "";
    parts.forEach((val, idx) => {
        if (directive === "^" && (idx === 1 || idx === 2)) {
            regexString += "\\d";
        } else if (directive === "~" && idx === 2) {
            regexString += "\\d";
        } else if (val === "*") {
            regexString += "\\d";
        } else {
            regexString += val;
        }

        regexString += idx === parts.length - 1 ? "" : ".";
    });

    return RegExp(regexString, "g");
}

module.exports = function (target, path = "") {
    const deps = fileHandler.getDependencies(true, path);
    const packages = fileHandler.getPackageData(path);

    const depKeys = Object.keys(deps);
    let targetPaths = [];
    depKeys.forEach((dependencyName) => {
        // Could even run a DFS for each dep on independent threads - overkill
        targetPaths = targetPaths.concat(DFS(target, dependencyName, packages));
    });

    return targetPaths;
};

function DFS(target, dep, packages) {
    console.debug = () => {};
    // console.log = function () {};
    if (!dep || !target || !packages) {
        throw Error("Missing arguments");
    }

    const { targetName, targetVersion } = target;

    if (targetVersion) {
        targetVersionRegex = versionToRegex(targetVersion);
    }

    //@todo convert the targetVerion to a regex

    console.debug(`Beginning DFS on ${dep} for target: ${targetName}`);

    let depBlacklist = {};

    //[[TargetPath]] a targetPath can be followed to reach the requested target
    let targetPaths = [];

    //A pointer for keeping track of location of both depPathStack and requireStacks
    let stackIndex = 0;

    //Check whether the dep is actually in the packages otherwise will fail the rest
    if (!(dep in packages)) {
        throw Error(`${dep} not found in package-lock.`);
    }

    if (dep === targetName) {
        //If dep is the target return in targetPath format
        return [dep];
    }

    //A dep without any requires
    if (!("requires" in packages[dep])) {
        return [];
    }

    //Points to what current path is beind used for searching depdendencies
    //If empty [] using root path to resolve requires
    //[[String, String, ...]]
    let depPathStack = [[dep]];

    //[String, String, ...]
    //A queue of dependencies that need resolutions
    //Generate an initial queue from the requires of the main dependency.
    let initialRequireQueue = Object.keys(packages[dep].requires);

    if (!initialRequireQueue) {
        //No targetPaths could be found as requires for the dep
        return [];
    }

    //A stack of require queues, gets added to each time a new dep requires resolutions
    //[requireQueues]
    let requireQueuesStack = [initialRequireQueue];

    //Main resolution loop
    while (requireQueuesStack.length > 0 && depPathStack.length > 0) {
        console.debug("New resolution loop iteration");
        // Search for the resolution to first require in current stack layer
        const currentRequire = requireQueuesStack[stackIndex][0];

        //perform cycle detection
        if (requireQueuesStack.length > 3) {
            for (let i = requireQueuesStack.length - 2; i >= 0; i--) {
                if (requireQueuesStack[i].length > 0) {
                    if (currentRequire === requireQueuesStack[i][0]) {
                        depBlacklist[currentRequire] = true;
                        console.debug(
                            `Cycle detected, blacklisting dep: ${currentRequire}`
                        );
                        for (
                            let j = 0;
                            j <= requireQueuesStack.length - i;
                            j++
                        ) {
                            requireQueuesStack.pop();
                            depPathStack.pop();
                            stackIndex--;
                        }
                        requireQueuesStack[stackIndex].shift();
                        break;
                    }
                }
            }
        }

        //Add a new layer to the stacks for current resolution
        depPathStack.push(_.cloneDeep(depPathStack[stackIndex])); // Use current path as dep search starting point for next one
        requireQueuesStack.push([]); // Not requires needed for current layer, search first
        stackIndex++;

        //Search the package layers for the currentRequire
        while (true) {
            let currentDepPath = depPathStack[stackIndex];

            console.debug("Current dep path: ", currentDepPath);

            let packageLayerData = getPackageDataFromPath(
                currentDepPath,
                packages
            );

            //Check if dependency key is found or if at the object root.
            if (
                "dependencies" in packageLayerData ||
                currentDepPath.length === 0
            ) {
                //Need to get to right point to search in the object
                if ("dependencies" in packageLayerData) {
                    packageLayerData = packageLayerData.dependencies;
                }
                console.debug(
                    `Searching through dependency resolvers at current layer`
                );
                // Search through the deps looking for currentRequire
                if (currentRequire in packageLayerData) {
                    console.debug(
                        `Require resolution hit on ${currentRequire}`
                    );
                    if (currentRequire === targetName) {
                        let foundVersion =
                            packageLayerData[currentRequire].version;
                        if (targetVersion) {
                            if (foundVersion.match(targetVersionRegex)) {
                                buildTargetPath();
                            }
                        } else {
                            buildTargetPath();
                        }
                    }
                    //Check if additional requires are needed
                    if (packageLayerData[currentRequire].requires) {
                        //Add requires to this layer's requireQueue
                        console.debug("Adding new requires to be resolved");
                        let newRequires = Object.keys(
                            packageLayerData[currentRequire].requires
                        );
                        //Check that newRequires does not include blacklist
                        // @todo: check if a found black list require is the target,
                        // then buildtargetPath as a fix current non-full search coverage for packages found in cycles
                        newRequires = newRequires.filter((requireName) => {
                            return !(requireName in depBlacklist);
                        });
                        requireQueuesStack.pop(); //Remove the empty queue from layer jumping
                        requireQueuesStack.push(newRequires);
                        //Add resolved require to the dep path
                        currentDepPath.push(currentRequire);

                        break;
                    } else {
                        //Go up a layer, no resolves needed for this require hit
                        console.debug("Searching up a layer.");
                        depPathStack.pop();
                        requireQueuesStack.pop();
                        stackIndex--;
                        //Shift 1 (should be currentRequire) from the requireQueue
                        requireQueuesStack[stackIndex].shift();
                        break;
                    }
                }
            }

            if (currentDepPath.length === 0) {
                //No match found for current resolve
                throw Error(`Couldn't resolve a package: ${currentRequire}`);
            }
            //Pop off the path array and search one path layer up
            //Replace the currentPath in the depPathStack by removing the last element
            currentDepPath.pop();
        }

        //Handles if require Queue is empty and whether next layer only has one require left.
        while (requireQueuesStack[stackIndex].length === 0) {
            if (stackIndex === 0) {
                break;
            }
            //Go up a layer
            console.debug(
                "Empty require resolutions, moving up a layer",
                requireQueuesStack
            );
            requireQueuesStack.pop();
            depPathStack.pop();
            stackIndex--;
            if (requireQueuesStack.length > 0) {
                requireQueuesStack[stackIndex].shift();
            }
        }

        // Check if the lengths of stacks match with the stackIndex otherwise it's broken
        if (
            requireQueuesStack.length - 1 !== stackIndex ||
            depPathStack.length - 1 !== stackIndex
        ) {
            throw Error(error("Stack tracking error."));
        }

        if (stackIndex === 0 && requireQueuesStack[stackIndex].length === 0) {
            break;
        }
    }

    function getPackageDataFromPath(path, packages) {
        if (path === []) {
            return packages;
        }
        let currentData = packages;
        path.forEach((packageName) => {
            if ("dependencies" in currentData) {
                currentData = currentData["dependencies"][packageName];
            } else {
                currentData = currentData[packageName];
            }
        });
        return currentData;
    }

    function buildTargetPath() {
        //Follow requireQueuesStack from last queue to first (last idx -> first idx)
        //Using the first package in the queue as the relevant dependency.
        let targetPath = [];

        //Add the current target to end of first path to search
        let newPathStack = _.cloneDeep(depPathStack);
        newPathStack[newPathStack.length - 1].push(targetName);

        for (let i = requireQueuesStack.length - 1; i >= 0; i--) {
            //Would there ever be a point where there wouldn't be a 0 index in a requireQueue to access?

            let version = getPackageDataFromPath(newPathStack[i], packages);
            // Add the main dep if at root of require queue
            targetPath.unshift({
                name: i === 0 ? dep : requireQueuesStack[i - 1][0],
                version: version.version,
            });
        }

        targetPaths.push(targetPath);
    }

    return targetPaths;
}
