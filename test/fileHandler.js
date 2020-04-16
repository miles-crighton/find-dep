var fileHandler = require("../src/fileHandler");
var expect = require("chai").expect;
var path = require("path");

const TEST_SET1 = path.join(__dirname, "test_set1");

describe("#getDependencies()", function () {
    context("using test_set1", function () {
        it('Should return { ms: "^2.1.2" }', function () {
            expect(fileHandler.getDependencies(true, TEST_SET1)).to.eql({
                ms: "^2.1.2",
            });
        });
    });
});

describe("#getPackageData()", function () {
    context("using test_set1", function () {
        it("Should return package_lock contents", function () {
            expect(fileHandler.getPackageData(TEST_SET1)).to.eql({
                ms: {
                    version: "2.1.2",
                    resolved: "https://registry.npmjs.org/ms/-/ms-2.1.2.tgz",
                    integrity:
                        "sha512-sGkPx+VjMtmA6MX27oA4FBFELFCZZ4S4XqeGOXCv68tT+jb3vk/RyaKWP0PTKyWtmLSM0b+adUTEvbs1PEaH2w==",
                },
            });
        });
    });
});
