const path = require('path');
const glob = require('glob');
const { readdirSync, rmSync } = require('fs');
const { exec } = require("child_process");


readdirSync('./wwwroot/js-src').forEach(f => rmSync(`./wwwroot/js-src/${f}`, {recursive: true}));
console.log('cleared js...');

// .gitconfig 
// [alias]
//     xca = !git add . && git commit -m \"Updated: `date +\"%Y-%m-%dT%H:%M:%S\"`\"
exec("git xca", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});

const SrcFilePaths = glob.sync('./wwwroot/ts/**/*.ts')
const ClassNameToSrcFilePath = SrcFilePaths.reduce(
    function(obj, el){
        obj[path.parse(el).name] = el;
        return obj
    }, {}
    )

console.log("ts to js mapping...");
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
