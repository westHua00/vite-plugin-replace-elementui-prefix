# 快速开始

``` shell
pnpm i vite-plugin-replace-elementui-prefix -D
```
``` js
// vite.config.js
import viteReplaceElementuiPrefixPlugin from 'vite-plugin-replace-elementui-prefix';

export default ({ mode }) =>
    defineConfig({
        plugins: [
            ...
            viteReplaceElementuiPrefixPlugin({
                mode, //模式 production/development
                // open: false 是否开启
                prefix: 'el-', //匹配的前缀
                replace: `replace-` //替换的前缀
            })],
            build: {
                plugins: [
                    viteReplaceElementuiPrefixPlugin({
                        mode,
                        prefix: 'el-',
                        replace: 'replace-'
                    })
                ]
            }
    })
            
```

## 此插件只会替换js中的`el-`, css中的使用 [postcss-change-css-prefix](https://www.npmjs.com/package/postcss-change-css-prefix)替换
*替换逻辑参考了 [change-prefix-loader](https://www.npmjs.com/package/change-prefix-loader)*
