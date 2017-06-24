const expect = require("chai").expect;

const interpreter = require("../lib/interpreter");

describe("interpret implemented class", () => {
  describe("that has a name", () => {
  	it("finds static and non-static methods", () => {
  		const resultsDocument = interpreter.interpretDocument("fixtures/implemented_class.js");
      const nameOfExportedClass = resultsDocument.namesOfExportedClasses[0];
      const exportedClass = resultsDocument.getClassByName(nameOfExportedClass);
      const resultClass = interpreter.interpretClassASTTree(exportedClass);

      expect(resultClass.namesOfStaticFunctions).to.deep.equal(['feed']);
      expect(resultClass.namesOfNonStaticFunctions).to.deep.equal(['tame']);
  	});
  });

  describe("that is anonymous", () => {
    it("finds static and non-static methods", () => {
      const resultsDocument = interpreter.interpretDocument("fixtures/implemented_anonymous_class.js");
      const exportedClass = resultsDocument.classes[0];
      const resultClass = interpreter.interpretClassASTTree(exportedClass);

      expect(resultClass.namesOfStaticFunctions).to.deep.equal(['execute']);
      expect(resultClass.namesOfNonStaticFunctions).to.deep.equal(['init']);
    });
  });
});
