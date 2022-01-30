const {
    override,
    addExternalBabelPlugins,
    removeModuleScopePlugin
} = require("customize-cra");
const rewireWebpackBundleAnalyzer = require('react-app-rewire-webpack-bundle-analyzer')
const rewireImageminPlugin = require('react-app-rewire-imagemin-plugin')
const rewireCompressionPlugin = require('react-app-rewire-compression-plugin');

const configuration = function override(config, env) {
    if (env === 'production') {
        // Optimize images in the build
        config = rewireImageminPlugin(config, env, {
            disable: process.env.NODE_ENV !== 'production',
            pngquant: {
                quality: '25-30'
            }
        })

        // Compress generated js files
        config = rewireCompressionPlugin(config, env, {
            test: /\.js(\?.*)?$/i,
            cache: true
        })

        config = rewireWebpackBundleAnalyzer(config, env, {
            analyzerMode: 'static',
            reportFilename: 'report.html'
        })
    }

    if (!config.plugins) {
        config.plugins = [];
    }

    removeModuleScopePlugin()(config);

    return config;
}

module.exports = {
    webpack: override(
        configuration,
        ...addExternalBabelPlugins(
            "@babel/plugin-proposal-nullish-coalescing-operator"
        ),
    )
}
