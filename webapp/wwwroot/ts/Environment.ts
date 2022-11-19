export class Environment {

    static isLocal() {
        return window.location.hostname === "127.0.0.1";
    }


    static local = {
        host: window.location.origin + "/webapp"
    }

    static githubPages = {
        host: window.location.origin + "/RasterModeler"
    }

    static getOrigin() {
        console.log(window.location.href);
        return Environment.isLocal() ? Environment.local.host : Environment.githubPages.host;
    }
}