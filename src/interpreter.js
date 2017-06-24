const _ = require("lodash");
const fs = require("fs");
const babylon = require("babylon");

const defaultBabylonOptions = {
    sourceType: "module",

    plugins: [
        "jsx",
        "doExpressions",
        "objectRestSpread",
        "decorators",
        "classProperties",
        "flow",
        "exportExtensions",
        "asyncGenerators",
        "functionBind",
        "functionSent",
        "dynamicImport"
    ]
};

function isExportDeclaration(declaration) {
    return ["ExportDefaultDeclaration", "ExportNamedDeclaration"].indexOf(declaration.type) >= 0;
}

function isClassDeclaration(declaration) {
    return declaration.type === "ClassDeclaration";
}

function isFunctionExpression(expression) {
    return ["ArrowFunctionExpression", "FunctionExpression"].indexOf(expression.type) >= 0;
}

function isVariableNode(node) {
    return ["VariableDeclaration", "VariableDeclarator"].indexOf(node.type) >= 0;
}

function nodeCountsAsVariable(node) {
    return isVariableNode(node) || node.type === "ObjectExpression" || (node.type.match(/.+Literal$/) !== null);
}

function getIdentifiersByName(declarations, name) {
    return declarations
        .filter(declaration => {
            if (declaration.declarations) {
                const p = declaration.declarations.filter(decl => decl.id.name === name);
                return p.length > 0;
            }
            else {
                return declaration.id && declaration.id.name === name;
            }
        })
    ;
}

function studyDocument(astTree, callbacks) {
    const identifiers = [];
    const classes = [];
    const functions = [];
    const variables = [];
    const componentsByIdentifierName = {};

    const addToWhichEverCollection = (declaration, callbacks) => {
        if (! declaration.type) {
            callbacks && callbacks.error("Declaration does not have type", declaration);
            return;
        }

        if (declaration.type === "ClassDeclaration") {
            const existing = _.find(classes, _.pick(declaration, ['start', 'end']));
            (! existing) && classes.push(declaration);
        }
        else if (declaration.type === "FunctionDeclaration") {
            const existing = _.find(functions, _.pick(declaration, ['start', 'end']));
            (! existing) && functions.push(declaration);
        }
        else if (nodeCountsAsVariable(declaration)) {
            const existing = _.find(variables, _.pick(declaration, ['start', 'end']));
            (! existing) && variables.push(declaration);
        }
    };

    const _exports = astTree
        .filter((node) => isExportDeclaration(node))
        .map((node) => {
            if (node.declaration) {
                addToWhichEverCollection(node.declaration, callbacks);

                if (node.declaration.name) {
                    const haveIdentifiers = getIdentifiersByName(astTree, node.declaration.name);

                    haveIdentifiers.forEach((hid) => {
                        identifiers.push(hid);
                    });


                    if (haveIdentifiers.length > 0) {
                        if (! (node.declaration.name in componentsByIdentifierName)) {
                            componentsByIdentifierName[node.declaration.name] = [];
                        }

                        haveIdentifiers
                            .filter(hid => {
                                if (hid.declaration && hid.declaration.type === "identifier") {
                                    return hid.declaration.id;
                                }
                                else if (hid.declarations) {
                                    return hid.declarations.filter((decl) => {
                                        return decl.id.name === node.declaration.name;
                                    });
                                }

                                return false;
                            })
                            .forEach(() => {
                                componentsByIdentifierName[node.declaration.name].push(node);
                            })
                        ;
                    }

                    if (haveIdentifiers.length > 1) {
                        callbacks && callbacks.warn("Found duplicate identifiers on same level with name "+ node.declaration.name);
                    }
                }
                else if (node.declaration.id) {
                    const declaration = node.declaration;

                    const identifier = declaration.id;
                    node.componentName = identifier.name;

                    if (! (identifier.name in componentsByIdentifierName)) {
                        componentsByIdentifierName[identifier.name] = [];
                    }
                    componentsByIdentifierName[identifier.name].push(declaration);
                }
                else if (node.declaration.declarations) {
                    _.head(node.declaration.declarations
                        .filter(decl => decl.id && decl.id.type === "Identifier")
                        .map(decl => {
                            addToWhichEverCollection(decl, callbacks);

                            if (! (decl.id.name in componentsByIdentifierName)) {
                                componentsByIdentifierName[decl.id.name] = [];
                            }

                            componentsByIdentifierName[decl.id.name].push(decl);
                            return decl.id;
                        }))
                    ;
                }
            }
            else if (node.specifiers) {
                if (node.specifiers.length > 1) {
                    callbacks && callbacks.debug("Found several export specifiers", node);
                }

                const specifier = node.specifiers[0];
                const identifier = specifier.exported;

                if (! (identifier.name in componentsByIdentifierName)) {
                    componentsByIdentifierName[identifier.name] = [];
                }
                componentsByIdentifierName[identifier.name].push(node);
            }

            return node;
        })
    ;

    astTree
        .filter((node) => node.type === "VariableDeclaration")
        .forEach((declaration) => {
            declaration.declarations.forEach((decl) => {

                const identifier = decl.id && decl.id.type === "Identifier" && decl.id;
                if (identifier) {
                    identifiers.push(identifier);

                    if (decl.init && decl.init.type === "ArrowFunctionExpression") {
                        if (! (identifier.name in componentsByIdentifierName)) {
                            componentsByIdentifierName[identifier.name] = [];
                        }
                        componentsByIdentifierName[identifier.name].push(decl.init);
                    }
                }
            });

            if (declaration.declarations.length > 1) {
                callbacks && callbacks.warn("Found a variable with multiple declarations", declaration);
            }

            const declaration = declaration.declarations[0];
            if (declaration.id.name) {
                if (! (declaration.id.name in componentsByIdentifierName)) {
                    componentsByIdentifierName[declaration.id.name] = [];
                }
                componentsByIdentifierName[declaration.id.name].push(declaration);
            }

            addToWhichEverCollection(declaration, callbacks);
        })
    ;

    astTree
        .filter((node) => node.type === "FunctionDeclaration")
        .forEach((declaration) => {
            const identifier = declaration.id;
            identifiers.push(declaration);

            if (! (identifier.name in componentsByIdentifierName)) {
                componentsByIdentifierName[identifier.name] = [];
            }
            componentsByIdentifierName[identifier.name].push(declaration);

            addToWhichEverCollection(declaration, callbacks);
        })
    ;

    astTree
        .filter((node) => {
            return node.type === "ClassDeclaration";
        })
        .forEach((declaration) => {
            const identifier = declaration.id;
            identifiers.push(declaration);

            if (! (identifier.name in componentsByIdentifierName)) {
                componentsByIdentifierName[identifier.name] = [];
            }
            componentsByIdentifierName[identifier.name].push(declaration);

            addToWhichEverCollection(declaration, callbacks);
        })
    ;

    const firstExport = _.head(_.flattenDeep(filterDefaultExportDeclaration(_exports)));

    const firstExportName = firstExport.declaration.name
        ? firstExport.declaration.name
        : (firstExport.declaration.id ? firstExport.declaration.id.name: null)
    ;

    if (firstExportName) {
        const sameNames = componentsByIdentifierName[firstExportName];
        if (sameNames.length > 1) {
            const sortedSameNames = sameNames.sort((a, b) => {
                return a.start - b.start;
            });

            componentsByIdentifierName[firstExportName] = sortedSameNames;

            const notExports = sortedSameNames.filter((node) => ! isExportDeclaration(node));

            _exports.default = notExports[0];

            if (_exports.default.init && isFunctionExpression(_exports.default.init)) {
                _exports.default = _exports.default.init;
            }
        }
        else if (sameNames.length === 1) {
            _exports.default = sameNames[0];
        }
        else {
            _exports.default = firstExport.declaration;
        }
    }
    else {
        _exports.default = firstExport.declaration;
    }

    const results = {
        classes,
        functions,
        variables,
        exports: _exports
    };

    results.exportedNames = [];

    _exports.filter(declaration => declaration.declaration)
        .map(declaration => {
            if (declaration.declaration) {
                if (declaration.declaration.name) {
                    results.exportedNames.push(declaration.declaration.name);
                }
                else if (declaration.declaration.id) {
                    if (declaration.declaration.id.name) {
                        results.exportedNames.push(declaration.declaration.id.name);
                    }
                }
                else if (declaration.declaration.declarations) {
                    declaration.declaration.declarations.filter(decl => decl.id)
                        .map(decl => decl.id)
                        .forEach(id => results.exportedNames.push(id.name))
                    ;
                }
            }
        })
    ;

    results.defaultIsClass = _exports.default && _exports.default.type === "ClassDeclaration";
    results.defaultIsFunction = _exports.default && (_exports.default.type === "FunctionDeclaration" || isFunctionExpression(_exports.default));
    results.defaultIsVariable = _exports.default && nodeCountsAsVariable(_exports.default);

    results.defaultIsClass && addToWhichEverCollection(_exports.default, callbacks);
    results.defaultIsFunction && addToWhichEverCollection(_exports.default, callbacks);
    results.defaultIsVariable && addToWhichEverCollection(_exports.default, callbacks);

    function getExportedComponentsByType(fnNodeIdentifier) {
        return results.exportedNames
            .map(exportedName => componentsByIdentifierName[exportedName])
            .filter(components => components && components.length && components.length > 0)
            .map(components => components.filter(node => fnNodeIdentifier(node)))
            .filter(components => components && components.length > 0)
        ;
    }

    results.namesOfExportedClasses = _.flattenDeep(getExportedComponentsByType((node) => {
            return isClassDeclaration(node);
        })
        .map(components => components.map(component => component.id.name))
    );

    const findNameForComponent = (unnamedComponent) => {
        const names = Object.keys(componentsByIdentifierName);

        const matchingNames = names.map((name) => {
                return {
                    name,
                    components: componentsByIdentifierName[name]
                };
            })
            .map((componentMap) => {
                const searchTerms = _.pick(unnamedComponent, ['start', 'end']);
                const matchingComponents = componentMap.components
                    .filter(component => _.isEqual(_.pick(component, ['start', 'end']), searchTerms))
                ;

                return matchingComponents.length > 0 ? componentMap.name : null;
            })
            .filter(name => Boolean(name))
        ;

        return _.head(matchingNames);
    };

    results.namesOfExportedFunctions = _.flattenDeep(getExportedComponentsByType((node) => {
            return isFunctionExpression(node);
        })
        .map(components => components.map(component => {
            if (component.id && component.id.name) {
                return component.id.name;
            }
            else {
                return findNameForComponent(component);
            }
        }))
    );

    results.namesOfExportedVariables = _.flattenDeep(getExportedComponentsByType((node) => {
            return (
                    isVariableNode(node)
                    && (node.init && ! isFunctionExpression(node.init))
                )
                || node.type === "ObjectExpression"
            ;
        })
        .map(components => components.map(component => component.id.name))
    );

    results.getClassByName = (name) => {
        return _.head(results.classes.filter((_class) => {
            return _class.id.name === name;
        }));
    };

    return results;
}

function filterDefaultExportDeclaration(exports) {
    return exports.filter(node => node.type === "ExportDefaultDeclaration");
}

function studyClassASTTree(astTree) {
    const results = {
        functions: null
    };

    results.functions = astTree.body.body.filter(node => {
        return node.type === "ClassMethod";
    });

    results.namesOfStaticFunctions = results.functions
        .filter(node => node.static)
        .map(node => node.key.name)
    ;

    results.namesOfNonStaticFunctions = results.functions
        .filter(node => ! node.static)
        .map(node => node.key.name)
    ;

    return results;
}

export function interpretClassASTTree(astTree) {
    const results = studyClassASTTree(astTree);
    return results;
}

function document(str, customBabylonOptions, callbacks) {
    const babylonOptions = customBabylonOptions ? customBabylonOptions : defaultBabylonOptions;
    const astTree = babylon.parse(str, babylonOptions);
    const results = studyDocument(astTree.program.body, callbacks);
    return results;
};

export {document as interpretCode};

export function interpretDocument(file, customBabylonOptions, callbacks) {
    return document(fs.readFileSync(file, {encoding: "utf8"}), customBabylonOptions, callbacks);
};

