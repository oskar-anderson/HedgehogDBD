const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
    entry: {
        Parser: './webapp/ts/Parser.ts',
        Programm: './webapp/ts/Programm.ts',
    },
    target: "web",
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {  // monoko editor weirdness
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    experiments: {
        topLevelAwait: true,
        outputModule: true,
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: '[name].js',
        library: {
            type: "module"
        },
        path: path.resolve(__dirname, 'webapp', 'wwwroot', 'js'),
        clean: true,
    },
    plugins: [new MonacoWebpackPlugin()]
};
