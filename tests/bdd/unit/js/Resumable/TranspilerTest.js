/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, describe, escodegen, expect, it */
define([
    'vendor/esparse/esprima',
    'js/util',
    'js/Resumable/Transpiler',
    'vendor/esparse/escodegen'
], function (
    esprima,
    util,
    Transpiler
) {
    'use strict';

    describe('Resumable Transpiler', function () {
        var transpiler;

        beforeEach(function () {
            transpiler = new Transpiler();
        });

        it('should correctly transpile an empty function', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
function doThings(num1, num2) {}
exports.result = doThings(2, 3);
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = 0, temp0, temp1;
    function doThings(num1, num2) {
    }
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            temp0 = Resumable._resumeState_.temp0;
            temp1 = Resumable._resumeState_.temp1;
            Resumable._resumeState_ = null;
        }
        try {
            switch (statementIndex) {
            case 0:
                ++statementIndex;
                temp0 = exports;
            case 1:
                ++statementIndex;
                temp1 = doThings(2, 3);
            case 2:
                ++statementIndex;
                temp0.result = temp1;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex,
                    assignments: {
                        '0': 'temp0',
                        '1': 'temp1'
                    },
                    temp0: temp0,
                    temp1: temp1
                });
            }
            throw e;
        }
    }();
});
EOS
*/) {}),
                ast = esprima.parse(inputJS);

            ast = transpiler.transpile(ast);

            expect(escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '    ',
                        base: 0
                    }
                }
            })).to.equal(expectedOutputJS);
        });

        it('should correctly transpile a function call', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
doSomething();
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = 0;
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            Resumable._resumeState_ = null;
        }
        try {
            switch (statementIndex) {
            case 0:
                ++statementIndex;
                doSomething();
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex,
                    assignments: {}
                });
            }
            throw e;
        }
    }();
});
EOS
*/) {}),
                ast = esprima.parse(inputJS);

            ast = transpiler.transpile(ast);

            expect(escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '    ',
                        base: 0
                    }
                }
            })).to.equal(expectedOutputJS);
        });

        it('should correctly transpile a simple function with one calculation', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
function doThings(num1, num2) {
    var num3 = 2 + 4;

    return num3;
}
exports.result = doThings(2, 3);
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = 0, temp0, temp1;
    function doThings(num1, num2) {
        var statementIndex = 0, num3;
        return function resumableScope() {
            if (Resumable._resumeState_) {
                statementIndex = Resumable._resumeState_.statementIndex;
                Resumable._resumeState_ = null;
            }
            try {
                switch (statementIndex) {
                case 0:
                    ++statementIndex;
                    num3 = 2 + 4;
                case 1:
                    ++statementIndex;
                    return num3;
                }
            } catch (e) {
                if (e instanceof Resumable.PauseException) {
                    e.add({
                        func: resumableScope,
                        statementIndex: statementIndex,
                        assignments: {},
                        num1: num1,
                        num2: num2,
                        num3: num3
                    });
                }
                throw e;
            }
        }();
    }
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            temp0 = Resumable._resumeState_.temp0;
            temp1 = Resumable._resumeState_.temp1;
            Resumable._resumeState_ = null;
        }
        try {
            switch (statementIndex) {
            case 0:
                ++statementIndex;
                temp0 = exports;
            case 1:
                ++statementIndex;
                temp1 = doThings(2, 3);
            case 2:
                ++statementIndex;
                temp0.result = temp1;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex,
                    assignments: {
                        '0': 'temp0',
                        '1': 'temp1'
                    },
                    temp0: temp0,
                    temp1: temp1
                });
            }
            throw e;
        }
    }();
});
EOS
*/) {}),
                ast = esprima.parse(inputJS);

            ast = transpiler.transpile(ast);

            expect(escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '    ',
                        base: 0
                    }
                }
            })).to.equal(expectedOutputJS);
        });

        it('should correctly transpile a simple function with no control structures', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
function doThings(num1, num2) {
    var num3 = 0;

    num3 += num1 + 1;

    return num3;
}
exports.result = doThings(2, 3);
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = 0, temp0, temp1;
    function doThings(num1, num2) {
        var statementIndex = 0, num3, temp0, temp1;
        return function resumableScope() {
            if (Resumable._resumeState_) {
                statementIndex = Resumable._resumeState_.statementIndex;
                temp0 = Resumable._resumeState_.temp0;
                temp1 = Resumable._resumeState_.temp1;
                Resumable._resumeState_ = null;
            }
            try {
                switch (statementIndex) {
                case 0:
                    ++statementIndex;
                    num3 = 0;
                case 1:
                    ++statementIndex;
                    temp0 = num3;
                case 2:
                    ++statementIndex;
                    temp1 = num1;
                case 3:
                    ++statementIndex;
                    num3 = temp0 + (temp1 + 1);
                case 4:
                    ++statementIndex;
                    return num3;
                }
            } catch (e) {
                if (e instanceof Resumable.PauseException) {
                    e.add({
                        func: resumableScope,
                        statementIndex: statementIndex,
                        assignments: {
                            '1': 'temp0',
                            '2': 'temp1'
                        },
                        num1: num1,
                        num2: num2,
                        num3: num3,
                        temp0: temp0,
                        temp1: temp1
                    });
                }
                throw e;
            }
        }();
    }
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            temp0 = Resumable._resumeState_.temp0;
            temp1 = Resumable._resumeState_.temp1;
            Resumable._resumeState_ = null;
        }
        try {
            switch (statementIndex) {
            case 0:
                ++statementIndex;
                temp0 = exports;
            case 1:
                ++statementIndex;
                temp1 = doThings(2, 3);
            case 2:
                ++statementIndex;
                temp0.result = temp1;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex,
                    assignments: {
                        '0': 'temp0',
                        '1': 'temp1'
                    },
                    temp0: temp0,
                    temp1: temp1
                });
            }
            throw e;
        }
    }();
});
EOS
*/) {}),
                ast = esprima.parse(inputJS);

            ast = transpiler.transpile(ast);

            expect(escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '    ',
                        base: 0
                    }
                }
            })).to.equal(expectedOutputJS);
        });

        it('should correctly transpile an assignment of method call result to property', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
exports.result = tools.getOne();
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = 0, temp0, temp1, temp2;
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            temp0 = Resumable._resumeState_.temp0;
            temp1 = Resumable._resumeState_.temp1;
            temp2 = Resumable._resumeState_.temp2;
            Resumable._resumeState_ = null;
        }
        try {
            switch (statementIndex) {
            case 0:
                ++statementIndex;
                temp0 = exports;
            case 1:
                ++statementIndex;
                temp1 = tools;
            case 2:
                ++statementIndex;
                temp2 = temp1.getOne();
            case 3:
                ++statementIndex;
                temp0.result = temp2;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex,
                    assignments: {
                        '0': 'temp0',
                        '1': 'temp1',
                        '2': 'temp2'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2
                });
            }
            throw e;
        }
    }();
});
EOS
*/) {}),
                ast = esprima.parse(inputJS);

            ast = transpiler.transpile(ast);

            expect(escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '    ',
                        base: 0
                    }
                }
            })).to.equal(expectedOutputJS);
        });

        it('should correctly transpile an if (...) {...} statement', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
if (tools.sayYes) {
    exports.result = 'yes';
}
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = 0, temp0, temp1, temp2;
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            temp0 = Resumable._resumeState_.temp0;
            temp1 = Resumable._resumeState_.temp1;
            temp2 = Resumable._resumeState_.temp2;
            Resumable._resumeState_ = null;
        }
        try {
            switch (statementIndex) {
            case 0:
                ++statementIndex;
                temp0 = tools;
            case 1:
                ++statementIndex;
                temp1 = temp0.sayYes;
            case 2:
                ++statementIndex;
            case 3:
            case 4:
                if (statementIndex > 3 || temp1) {
                    switch (statementIndex) {
                    case 3:
                        ++statementIndex;
                        temp2 = exports;
                    case 4:
                        ++statementIndex;
                        temp2.result = 'yes';
                    }
                }
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex,
                    assignments: {
                        '0': 'temp0',
                        '1': 'temp1',
                        '3': 'temp2'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2
                });
            }
            throw e;
        }
    }();
});
EOS
*/) {}),
                ast = esprima.parse(inputJS);

            ast = transpiler.transpile(ast);

            expect(escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '    ',
                        base: 0
                    }
                }
            })).to.equal(expectedOutputJS);
        });

        it('should correctly transpile an if (...) {...} statement inside a block', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
{
    if (tools.sayYes) {
        exports.result = 'yes';
    }
}
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = 0, temp0, temp1, temp2;
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            temp0 = Resumable._resumeState_.temp0;
            temp1 = Resumable._resumeState_.temp1;
            temp2 = Resumable._resumeState_.temp2;
            Resumable._resumeState_ = null;
        }
        try {
            switch (statementIndex) {
            case 0:
                ++statementIndex;
            case 1:
            case 2:
            case 3:
            case 4:
            case 5: {
                    switch (statementIndex) {
                    case 1:
                        ++statementIndex;
                        temp0 = tools;
                    case 2:
                        ++statementIndex;
                        temp1 = temp0.sayYes;
                    case 3:
                        ++statementIndex;
                    case 4:
                    case 5:
                        if (statementIndex > 4 || temp1) {
                            switch (statementIndex) {
                            case 4:
                                ++statementIndex;
                                temp2 = exports;
                            case 5:
                                ++statementIndex;
                                temp2.result = 'yes';
                            }
                        }
                    }
                }
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex,
                    assignments: {
                        '1': 'temp0',
                        '2': 'temp1',
                        '4': 'temp2'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2
                });
            }
            throw e;
        }
    }();
});
EOS
*/) {}),
                ast = esprima.parse(inputJS);

            ast = transpiler.transpile(ast);

            expect(escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '    ',
                        base: 0
                    }
                }
            })).to.equal(expectedOutputJS);
        });
    });
});