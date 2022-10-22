const path = require('path');
const glob = require('glob');

const SrcFilePaths = glob.sync('./wwwroot/ts/**.ts')
const ClassNameToSrcFilePath = SrcFilePaths.reduce(
    function(obj, el){
        obj[path.parse(el).name] = el;
        return obj
    }, {}
    )

console.log(ClassNameToSrcFilePath);
module.exports = {
    entry: ClassNameToSrcFilePath,
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
        path: path.resolve(__dirname, 'wwwroot', 'js-src')
    }
};
