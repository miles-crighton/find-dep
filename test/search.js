var search = require("../src/search");
var expect = require("chai").expect;
const path = require("path");

const TEST_SETS = [];
TEST_SETS.push(path.join(__dirname, "test_sets/test_set1"));

describe("#search.DFS()", function () {
    context("without arguments", function () {
        it("should return []", function () {
            expect(search.DFS()).to.eql([]);
        });
    });
    context("core dependency as target", function () {
        it("should return that core dep as the path [{ name, version }]", function () {
            expect(
                search.DFS({ targetName: "test", version: null }, "test", {
                    test: { version: "1.0.0" },
                })
            ).to.eql([
                [
                    {
                        name: "test",
                        version: "1.0.0",
                    },
                ],
            ]);
        });
    });
    // context("with number arguments", function () {
    //     it("should return sum of arguments", function () {
    //         expect(sum(1, 2, 3, 4, 5)).to.equal(15);
    //     });
    //     it("should return argument when only one argument is passed", function () {
    //         expect(sum(5)).to.equal(5);
    //     });
    // });
    // context("with non-number arguments", function () {
    //     it("should throw error", function () {
    //         expect(function () {
    //             sum(1, 2, "3", [4], 5);
    //         }).to.throw(TypeError, "sum() expects only numbers.");
    //     });
    // });
});

describe("#search.for()", function () {
    context("without arguments", function () {
        it("should return []", function () {
            expect(search.for()).to.eql([]);
        });
    });
    context("core dependency as target", function () {
        it("#TEST_SET1: should return that core dep as path", function () {
            expect(search.for({ targetName: "ms" }, TEST_SETS[0])).to.eql([
                [
                    {
                        name: "ms",
                        version: "2.1.2",
                    },
                ],
            ]);
        });
    });
});
