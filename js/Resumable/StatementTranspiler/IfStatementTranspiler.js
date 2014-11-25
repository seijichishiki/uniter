/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'vendor/esparse/estraverse',
    'js/util',
    '../BlockContext'
], function (
    estraverse,
    util,
    BlockContext
) {
    'use strict';

    var BODY = 'body',
        CONSEQUENT = 'consequent',
        TEST = 'test',
        Syntax = estraverse.Syntax;

    function IfStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(IfStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.IfStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var ownBlockContext = new BlockContext(functionContext),
                transpiler = this,
                expression = transpiler.expressionTranspiler.transpile(node[TEST], node, functionContext, blockContext),
                statement;

            statement = blockContext.prepareStatement();

            transpiler.statementTranspiler.transpileArray(node[CONSEQUENT][BODY], node, functionContext, ownBlockContext);

            statement.assign({
                'type': Syntax.IfStatement,
                'test': {
                    'type': Syntax.LogicalExpression,
                    'operator': '||',
                    'left': {
                        'type': Syntax.BinaryExpression,
                        'operator': '>',
                        'left': {
                            'type': Syntax.Identifier,
                            'name': 'statementIndex'
                        },
                        'right': {
                            'type': Syntax.Literal,
                            'value': statement.getIndex() + 1
                        }
                    },
                    'right': expression
                },
                'consequent': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        ownBlockContext.getSwitchStatement()
                    ]
                }
            });
        }
    });

    return IfStatementTranspiler;
});
