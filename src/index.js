const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;

function canChange(path) {
    const parenNode = path.parent;
    if (parenNode.type !== 'CallExpression') return false;
    if (
        (parenNode.callee && parenNode.callee.name === 'h') ||
        parenNode.callee.name === '_c'
    ) {
        return true;
    }
    return false;
}

function replaceCodeHandler(code, prefix, replace) {
    const ast = parser.parse(code, { sourceType: 'module' });
    traverse(ast, {
        CallExpression(path) {
            path.traverse({
                Literal(lPath) {
                    const { node } = lPath;
                    if (
                        typeof node.value === 'string' &&
                        node.value.indexOf(prefix) !== -1 &&
                        !canChange(lPath)
                    ) {
                        if (node.value !== 'el-menu-collapse-transition') {
                            const reg = new RegExp(
                                `(^|(\\s)+|(\\.)+)${prefix}(?!icon)`,
                                'g'
                            );
                            node.value = node.value.replace(
                                reg,
                                `$1${replace}`
                            );
                        }
                    }
                    lPath.replaceWith(node);
                },
                RegExpLiteral(RPath) {
                    const { node } = RPath;
                    if (node.pattern.indexOf(prefix) !== -1) {
                        const reg = new RegExp(prefix, 'g');
                        node.extra.raw = node.extra.raw.replace(reg, replace);
                        node.pattern = node.pattern.replace(reg, replace);
                    }
                    RPath.replaceWith(node);
                }
            });
        }
    });

    return generator(ast).code;
}

function checkConfiguration(config) {
    const { mode, replace } = config;
    if (!mode) {
        throw new Error(
            "[vite-plugin-replace-elementui-prefix]: The configuration 'mode' is required."
        );
    } else if (typeof mode !== 'string') {
        throw new Error(
            "[vite-plugin-replace-elementui-prefix]: The configuration 'mode' type must be 'String'."
        );
    }

    if (!replace) {
        throw new Error(
            "[vite-plugin-replace-elementui-prefix]: The configuration 'replace' is required."
        );
    } else if (typeof replace !== 'string') {
        throw new Error(
            "[vite-plugin-replace-elementui-prefix]: The configuration 'replace' type must be 'String'."
        );
    }
}

/**
 * @desc:
 * @param {boolean} [config.open] 是否开启
 * @param {string} config.mode 模式
 * @param {string} [config.prefix] 需要替换的字符
 * @param {string} config.replace 替换字符
 */
function viteReplaceElementuiPrefixPlugin(config) {
    if (Object.prototype.toString.call(config) !== '[object Object]') {
        throw new Error(
            "[vite-plugin-replace-elementui-prefix]: The configuration type must be 'Object'."
        );
    }
    if (config.open === false) {
        return {};
    }
    checkConfiguration(config);

    const { mode, prefix = 'el-', replace } = config;
    return {
        name: 'vite-plugin-replace-elementui-prefix',
        transform(code, id) {
            if (id.match(/node_modules.*element-ui/)) {
                if (mode === 'production' && id.match(/\/lib.*\.js/)) {
                    return {
                        code: replaceCodeHandler(code, prefix, replace),
                        map: null
                    };
                }
                if (id.includes('element-ui.js')) {
                    return {
                        code: replaceCodeHandler(code, prefix, replace),
                        map: null
                    };
                }
            }
            return {
                code,
                map: null
            };
        }
    };
}

module.exports = viteReplaceElementuiPrefixPlugin;