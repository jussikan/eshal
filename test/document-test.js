const expect = require("chai").expect;

const interpreter = require("../lib/interpreter");

describe("interpret document that includes different components", () => {
	it("class declaration as default export", () => {
		const result = interpreter.interpretDocument("fixtures/all_with_class_declaration_as_default_export.js");
		// console.log(JSON.stringify(result, null, 4));

		expect(result.defaultIsClass).to.equal(true);
		expect(result.defaultIsFunction).to.equal(false);
		expect(result.defaultIsVariable).to.equal(false);

		expect(result.exportedNames.sort()).to.deep.equal(['Animal', 'Person', 'slightlyLessRandomNumber', 'veryRandomNumber'].sort());
		expect(result.namesOfExportedClasses.sort()).to.deep.equal(['Animal', 'Person'].sort());
		expect(result.namesOfExportedFunctions).to.deep.equal([]);
		expect(result.namesOfExportedVariables.sort()).to.deep.equal(['slightlyLessRandomNumber', 'veryRandomNumber'].sort());
	});

	it("referenced class declaration as default export", () => {
		const result = interpreter.interpretDocument("fixtures/all_with_referenced_class_declaration_as_default_export.js");

		expect(result.defaultIsClass).to.equal(true);
		expect(result.defaultIsFunction).to.equal(false);
		expect(result.defaultIsVariable).to.equal(false);

		expect(result.exportedNames.sort()).to.deep.equal(['Animal', 'Person', 'slightlyLessRandomNumber', 'veryRandomNumber'].sort());
		expect(result.namesOfExportedClasses.sort()).to.deep.equal(['Animal', 'Person'].sort());
		expect(result.namesOfExportedFunctions).to.deep.equal([]);
		expect(result.namesOfExportedVariables.sort()).to.deep.equal(['slightlyLessRandomNumber', 'veryRandomNumber'].sort());
	});

	it("function as default export", () => {
		const result = interpreter.interpretDocument("fixtures/all_with_function_as_default_export.js");

		expect(result.defaultIsClass).to.equal(false);
		expect(result.defaultIsFunction).to.equal(true);
		expect(result.defaultIsVariable).to.equal(false);

		expect(result.exportedNames.sort()).to.deep.equal(['Animal', 'Person', 'veryRandomNumber', 'slightlyLessRandomNumber', 'transpose'].sort());
		expect(result.namesOfExportedClasses.sort()).to.deep.equal(['Animal', 'Person'].sort());
		expect(result.namesOfExportedFunctions).to.deep.equal(['transpose']);
		expect(result.namesOfExportedVariables.sort()).to.deep.equal(['slightlyLessRandomNumber', 'veryRandomNumber'].sort());
	});

	it("variable as default export", () => {
		const result = interpreter.interpretDocument("fixtures/all_with_variable_as_default_export.js");

		expect(result.defaultIsClass).to.equal(false);
		expect(result.defaultIsFunction).to.equal(false);
		expect(result.defaultIsVariable).to.equal(true);

		expect(result.exportedNames.sort()).to.deep.equal([ 'Animal', 'Person', 'slightlyLessRandomNumber', 'soConstant', 'veryRandomNumber' ].sort());
		expect(result.namesOfExportedClasses.sort()).to.deep.equal([ 'Animal', 'Person' ].sort());
		expect(result.namesOfExportedFunctions).to.deep.equal([]);
		expect(result.namesOfExportedVariables.sort()).to.deep.equal([ 'slightlyLessRandomNumber', 'soConstant', 'veryRandomNumber' ].sort());
	});
});
