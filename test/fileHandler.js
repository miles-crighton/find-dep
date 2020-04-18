var fileHandler = require("../src/fileHandler");
var expect = require("chai").expect;
var path = require("path");

const TEST_SETS = [];
TEST_SETS.push(path.join(__dirname, "test_sets/test_set1"));

TEST_SETS_EXPECTED = {};
TEST_SETS_EXPECTED["TEST_SET1"] = {
    dependencies: {
        ms: "^2.1.2",
    },
    packages: {
        ms: {
            version: "2.1.2",
            resolved: "https://registry.npmjs.org/ms/-/ms-2.1.2.tgz",
            integrity:
                "sha512-sGkPx+VjMtmA6MX27oA4FBFELFCZZ4S4XqeGOXCv68tT+jb3vk/RyaKWP0PTKyWtmLSM0b+adUTEvbs1PEaH2w==",
        },
    },
};

describe("#getDependencies()", function () {
    for (let i = 0; i < TEST_SETS.length; i++) {
        context(`using test_set${i + 1}`, function () {
            it("Should return correct package dependencies", function () {
                expect(fileHandler.getDependencies(true, TEST_SETS[i])).to.eql(
                    TEST_SETS_EXPECTED[`TEST_SET${i + 1}`].dependencies
                );
            });
        });
    }
});

describe("#getPackageData()", function () {
    for (let i = 0; i < TEST_SETS.length; i++) {
        context(`using test_set${i + 1}`, function () {
            it("Should return package_lock contents", function () {
                expect(fileHandler.getPackageData(TEST_SETS[i])).to.eql(
                    TEST_SETS_EXPECTED[`TEST_SET${i + 1}`].packages
                );
            });
        });
    }
});
