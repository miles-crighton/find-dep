const fileHandler = require("./fileHandler");
var _ = require("lodash");
const chalk = require("chalk");

const error = chalk.bold.red;
const success = chalk.bold.green;

module.exports = function (target, path = "tests/test_set1") {
    const deps = fileHandler.getDependencies(true, path);
    const packages = fileHandler.getPackageData(path);
    // console.log("Your local deps: ", deps);

    const depKeys = Object.keys(deps);
    let targetPaths = [];
    depKeys.forEach((dependencyName) => {
        targetPaths = targetPaths.concat(DFS(target, dependencyName, packages));
    });

    if (targetPaths.length > 0) {
        console.log(success(`Found ${targetPaths.length} paths for target:`));
        targetPaths.forEach((pathArr) => {
            // console.log(pathArr);
            console.log(pathArr.join(chalk.yellow(" → ")));
        });
    } else {
        console.log(error("No package paths found for target"));
    }

    // console.log(targetPaths);
    // Could even run a DFS for each dep on independent threads - overkill
};

function DFS(target, dep, packages) {
    console.debug = () => {};
    // console.log = function () {};
    if (!dep || !target || !packages) {
        throw Error("Missing arguments");
    }

    console.debug(`Beginning DFS on ${dep} for target: ${target}`);

    let depBlacklist = {};

    //[[TargetPath]] a targetPath can be followed to reach the requested target
    let targetPaths = [];

    //A pointer for keeping track of location of both depPathStack and requireStacks
    let stackIndex = 0;

    //Check whether the dep is actually in the packages otherwise will fail the rest
    if (!(dep in packages)) {
        throw Error(`${dep} not found in package-lock.`);
    }

    if (dep === target) {
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
                    if (currentRequire === target) {
                        console.debug(`Target hit!!!`);
                        buildTargetPath();
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

        //@todo if current require is target then follow stacks upward (use a subroutine)
    }

    function buildTargetPath() {
        //Follow requireQueuesStack from last queue to first (last idx -> first idx)
        //Using the first package in the queue as the relevant dependency.
        let targetPath = [];

        for (let i = requireQueuesStack.length - 2; i >= 0; i--) {
            //Would there ever be a point where there wouldn't be a 0 index in a requireQueue to access?
            targetPath.unshift(requireQueuesStack[i][0]);
        }
        //Finally add the dep as the start of the path
        targetPath.unshift(dep);

        targetPaths.push(targetPath);
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

    return targetPaths;
}
