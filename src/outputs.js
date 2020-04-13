const chalk = require("chalk");
const success = chalk.bold.green;

function interpolateColors(color1, color2, steps) {
    //[R, G, B]
    let differences = [];
    let stepQuantities = [];
    for (let i = 0; i < 3; i++) {
        differences.push(color2[i] - color1[i]);
        stepQuantities.push(Math.round(differences[i] / steps));
    }
    let colors = [];
    for (let i = 0; i < steps; i++) {
        let color = [];
        for (let j = 0; j < 3; j++) {
            let value = color1[j] + stepQuantities[j] * i;
            value = value > 255 ? 255 : value;
            value = value < 0 ? 0 : value;
            color.push(value);
        }
        colors.push(color);
    }
    return colors;
}

const BLUE = [59, 79, 155];
const WHITE = [255, 255, 255];

module.exports.outputTargetPaths = function (targetPaths, options) {
    // Create color gradient based on largest path size
    let maxPathSize = 0;
    targetPaths.forEach((val) => {
        if (val.length > maxPathSize) {
            maxPathSize = val.length;
        }
    });

    const blueGradiant = interpolateColors(BLUE, WHITE, maxPathSize);

    console.log(success(`Found ${targetPaths.length} paths for target:`));
    targetPaths.forEach((pathArr, index) => {
        let outputString = chalk.white.bold(`${index + 1}: `);
        pathArr.map((val, idx) => {
            let packageName = val;
            if (!options.verbose) {
                const characterLimit = 8;
                if (
                    packageName.length > characterLimit &&
                    !(idx === 0) &&
                    !(idx === pathArr.length - 1)
                ) {
                    packageName = packageName.slice(0, characterLimit) + "...";
                }
            }
            outputString += chalk.rgb(
                blueGradiant[idx][0],
                blueGradiant[idx][1],
                blueGradiant[idx][2]
            )(packageName);
            if (idx !== pathArr.length - 1) {
                outputString += chalk.white.bold(" → ");
            }
        });
        // console.log(pathArr);
        console.log(outputString);
    });
};
