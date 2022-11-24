const path = require('path');

module.exports = {
    entry: {
        Parser: './webapp/ts/Parser.ts',
        Programm: './webapp/ts/Programm.ts'
    },
    target: "web",
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
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
    }
};
