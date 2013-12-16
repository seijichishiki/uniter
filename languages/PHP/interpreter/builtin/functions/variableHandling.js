/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'js/util',
    'languages/PHP/interpreter/Variable'
], function (
    util,
    Variable
) {
    'use strict';

    return function (internals) {
        var stdout = internals.stdout;

        return {
            'var_dump': function (scopeChain, valueReference) {
                var isReference = (valueReference instanceof Variable),
                    value = isReference ? valueReference.get() : valueReference;

                function dump(value) {
                    var nativeValue,
                        properties,
                        representation;

                    switch (value.getType()) {
                    case 'array':
                        representation = 'array(' + value.getLength() + ') {\n';

                        nativeValue = value.get();

                        util.each(Object.keys(nativeValue), function (key) {
                            representation += '  [' + key + ']=>\n  ' + dump(nativeValue[key]);
                        });

                        representation += '}';
                        break;
                    case 'boolean':
                        representation = 'bool(' + (value.get() ? 'true' : 'false') + ')';
                        break;
                    case 'float':
                        representation = 'float(' + value.get() + ')';
                        break;
                    case 'integer':
                        representation = 'int(' + value.get() + ')';
                        break;
                    case 'null':
                        representation = 'NULL';
                        break;
                    case 'object':
                        nativeValue = value.get();
                        properties = Object.keys(nativeValue);

                        representation = 'object(' + value.getClassName() + ')#1 (' + properties.length + ') {\n';

                        util.each(properties, function (property) {
                            representation += '  [' + JSON.stringify(property) + ']=>\n  ' + dump(nativeValue[property]);
                        });

                        representation += '}';
                        break;
                    case 'string':
                        nativeValue = value.get();
                        representation = 'string(' + nativeValue.length + ') "' + nativeValue + '"';
                        break;
                    }

                    return representation + '\n';
                }

                stdout.write(dump(value));
            }
        };
    };
});