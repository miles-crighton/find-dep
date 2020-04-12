const fileHandler = require("./fileHandler");

module.exports = function (target) {
    const deps = fileHandler.getDependencies();
    const packages = fileHandler.getPackageData();
    console.log("Your local deps: ", deps);

    let targetPaths = DFS(target, "yargs", packages);
    targetPaths.forEach((pathArr) => {
        console.log(pathArr.join("->"));
    });
    // console.log(targetPaths);
    // Could even run a DFS for each dep on independent threads - overkill
};

function DFS(target, dep, packages) {
    if (!dep || !target || !packages) {
        throw Error("Missing arguments");
    }

    console.log(`Beginning DFS for target: ${target}`);

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
        console.log("New resolution loop iteration");
        // Search for the resolution to first require in current stack layer
        const currentRequire = requireQueuesStack[stackIndex][0];

        //Add a new layer to the stacks for current resolution
        depPathStack.push(depPathStack[stackIndex]); // Use current path as dep search starting point for next one
        requireQueuesStack.push([]); // Not requires needed for current layer, search first
        stackIndex++;

        //Search the package layers for the currentRequire
        while (true) {
            let currentDepPath = depPathStack[stackIndex];

            console.log("Current dep path: ", currentDepPath);

            let packageLayerData = getPackageDataFromPath(
                currentDepPath,
                packages
            );

            //Check if dependency key is found or if at the object root.
            if (
                "dependencies" in packageLayerData ||
                currentDepPath.length === 0
            ) {
                console.log(
                    `Searching through dependency resolvers at current layer`
                );
                // Search through the deps looking for currentRequire
                if (currentRequire in packageLayerData) {
                    console.log(`Require resolution hit on ${currentRequire}`);
                    if (currentRequire === target) {
                        console.log(`Target hit!!!`);
                        buildTargetPath();
                    }
                    //Check if additional requires are needed
                    if (packageLayerData[currentRequire].requires) {
                        //Add requires to this layer's requireQueue
                        console.log("Adding new requires to be resolved");
                        let newRequires = Object.keys(
                            packageLayerData[currentRequire].requires
                        );
                        requireQueuesStack.pop(); //Remove the empty queue from layer jumping
                        requireQueuesStack.push(newRequires);
                        break;
                    } else {
                        //Go up a layer, no resolves needed for this require hit
                        console.log("Searching up a layer.");
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
                throw Error("Couldn't resolve a package");
            }
            //Pop off the path array and search one path layer up
            //Replace the currentPath in the depPathStack by removing the last element
            depPathStack.pop();
            currentDepPath.pop();
            let newDepPath = currentDepPath;
            depPathStack.push(newDepPath);
        }

        //Check if this layers requires queue is empty.
        while (requireQueuesStack[stackIndex].length === 0) {
            if (stackIndex === 0) {
                break;
            }
            //Go up a layer
            console.log(
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
            throw Error("Stack tracking error.");
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
            currentData = currentData[packageName];
        });
        return currentData;
    }

    return targetPaths;
}
