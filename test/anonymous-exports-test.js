const expect = require("chai").expect;

const interpreter = require("../lib/interpreter");

describe("interpret document", () => {
	describe("that only exports one anonymous", () => {
		it("class", () => {
			const result = interpreter.interpretDocument("fixtures/anonymous_class.js");

	  		expect(result.defaultIsClass).to.equal(true);
	  		expect(result.defaultIsFunction).to.equal(false);
	  		expect(result.defaultIsVariable).to.equal(false);

	  		expect(result.exportedNames.sort()).to.deep.equal([]);
	  		expect(result.namesOfExportedClasses.sort()).to.deep.equal([]);
	  		expect(result.namesOfExportedFunctions).to.deep.equal([]);
	  		expect(result.namesOfExportedVariables).to.deep.equal([]);
		});

		it("function", () => {
			const result = interpreter.interpretDocument("fixtures/anonymous_function.js");

	  		expect(result.defaultIsClass).to.equal(false);
	  		expect(result.defaultIsFunction).to.equal(true);
	  		expect(result.defaultIsVariable).to.equal(false);

	  		expect(result.exportedNames.sort()).to.deep.equal([]);
	  		expect(result.namesOfExportedClasses.sort()).to.deep.equal([]);
	  		expect(result.namesOfExportedFunctions).to.deep.equal([]);
	  		expect(result.namesOfExportedVariables).to.deep.equal([]);
		});

		it("object (interpreted as variable)", () => {
			const result = interpreter.interpretDocument("fixtures/anonymous_object.js");

	  		expect(result.defaultIsClass).to.equal(false);
	  		expect(result.defaultIsFunction).to.equal(false);
	  		expect(result.defaultIsVariable).to.equal(true);

	  		expect(result.exportedNames.sort()).to.deep.equal([]);
	  		expect(result.namesOfExportedClasses.sort()).to.deep.equal([]);
	  		expect(result.namesOfExportedFunctions).to.deep.equal([]);
	  		expect(result.namesOfExportedVariables).to.deep.equal([]);
		});

		it("variable (literal value)", () => {
			const result = interpreter.interpretDocument("fixtures/anonymous_variable.js");

	  		expect(result.defaultIsClass).to.equal(false);
	  		expect(result.defaultIsFunction).to.equal(false);
	  		expect(result.defaultIsVariable).to.equal(true);

	  		expect(result.exportedNames.sort()).to.deep.equal([]);
	  		expect(result.namesOfExportedClasses.sort()).to.deep.equal([]);
	  		expect(result.namesOfExportedFunctions).to.deep.equal([]);
	  		expect(result.namesOfExportedVariables).to.deep.equal([]);
		});
	});
});
