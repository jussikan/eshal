const expect = require("chai").expect;

const interpreter = require("../lib/interpreter");

describe("basics", () => {
	it("variables", () => {
		const result = interpreter.interpretDocument("fixtures/variables.js");

  		expect(result.defaultIsClass).to.equal(false);
  		expect(result.defaultIsFunction).to.equal(false);
  		expect(result.defaultIsVariable).to.equal(true);

  		expect(result.exportedNames).to.deep.equal(['veryRandomNumber']);
  		expect(result.namesOfExportedClasses).to.deep.equal([]);
  		expect(result.namesOfExportedFunctions).to.deep.equal([]);
  		expect(result.namesOfExportedVariables).to.deep.equal(['veryRandomNumber']);
	});

	it("functions", () => {
		const result = interpreter.interpretDocument("fixtures/functions.js");

  		expect(result.defaultIsClass).to.equal(false);
  		expect(result.defaultIsFunction).to.equal(true);
  		expect(result.defaultIsVariable).to.equal(false);

  		expect(result.exportedNames).to.deep.equal(['statelessComponent']);
  		expect(result.namesOfExportedClasses).to.deep.equal([]);
  		expect(result.namesOfExportedFunctions).to.deep.equal(['statelessComponent']);
  		expect(result.namesOfExportedVariables).to.deep.equal([]);
	});

	it("classes", () => {
		const result = interpreter.interpretDocument("fixtures/classes.js");

  		expect(result.defaultIsClass).to.equal(true);
  		expect(result.defaultIsFunction).to.equal(false);
  		expect(result.defaultIsVariable).to.equal(false);

  		expect(result.exportedNames.sort()).to.deep.equal(['Animal', 'Person'].sort());
  		expect(result.namesOfExportedClasses).to.deep.equal(['Animal', 'Person'].sort());
  		expect(result.namesOfExportedFunctions).to.deep.equal([]);
  		expect(result.namesOfExportedVariables).to.deep.equal([]);
	});
});
