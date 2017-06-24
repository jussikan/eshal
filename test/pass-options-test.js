const expect = require("chai").expect;

const interpreter = require("../lib/interpreter");

describe("function interpretDocument", () => {
	it("takes in custom set of babylon options", () => {
		const result = interpreter.interpretDocument("fixtures/anonymous_class.js", {
			sourceType: "module"
		});

  		expect(result.defaultIsClass).to.equal(true);
  		expect(result.defaultIsFunction).to.equal(false);
  		expect(result.defaultIsVariable).to.equal(false);

  		expect(result.exportedNames.sort()).to.deep.equal([]);
  		expect(result.namesOfExportedClasses.sort()).to.deep.equal([]);
  		expect(result.namesOfExportedFunctions).to.deep.equal([]);
  		expect(result.namesOfExportedVariables).to.deep.equal([]);
	});
});
