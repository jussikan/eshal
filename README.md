## Description

Eshal interprets given ES6 source code or file as either a class, a function, or a variable for easy filtering purposes.



## Installation

`npm install --save eshal`



## API

`eshal.interpretCode(code, [babylonOptions, [callbacks]])`

`eshal.interpretDocument(filename, [babylonOptions, [callbacks]])`

`eshal.interpretClassASTTree(classASTTree)`


`interpretCode` interprets the given component in `code` as a class, a function, or a variable.

`interpretDocument` does the same thing as `interpretCode` but also opens the file for you, and

`interpretClassASTTree` interprets a class AST tree found in the results of `interpretCode` and `interpretDocument` providing you the names of static and non-static functions in that class.


For argument `babylonOptions` you may pass [babylon](https://github.com/babel/babylon) options of your own choice.
If given, argument `callbacks` should be an object that has functions error, warn, debug. When each is called, the first argument is a message and the second holds data of any type.



### Example

```
const eshal = require("eshal");
const documentInterpretation = eshal.interpretDocument("MyComponent.js");

const nameOfExportedClass = documentInterpretation.namesOfExportedClasses[0];
const exportedClass = documentInterpretation.getClassByName(nameOfExportedClass);
const classInterpretation = eshal.interpretClassASTTree(exportedClass);
```



### Output

Eshal has its own interpretation format that includes untouched [babylon][] results.

```
{
    "classes": [ /* ClassDeclarations by babylon */ ],
    "functions": [ /* FunctionDeclarations by babylon */ ],
    "variables": [ /* VariableDeclarations by babylon */ ],
    "exports": [ /* ExportDeclarations by babylon */ ],
    "exportedNames": ["Animal", "Person", "veryRandomNumber", "slightlyLessRandomNumber"],
    "defaultIsClass": true,
    "defaultIsFunction": false,
    "defaultIsVariable": false,
    "namesOfExportedClasses": ["Animal", "Person"],
    "namesOfExportedFunctions": [],
    "namesOfExportedVariables": ["veryRandomNumber", "slightlyLessRandomNumber"]
}
```


[babylon]: https://github.com/babel/babylon
