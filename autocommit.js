import { exec } from "child_process";
// .gitconfig 
// [alias]
//     xca = !git add . && git commit -m \"Updated: `date +\"%Y-%m-%dT%H:%M:%S\"`\"
console.log("git xca")
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