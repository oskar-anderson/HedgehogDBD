export class LocalStorageData {
    
    scripts: Script[]
    constructor(scripts: Script[]) {
        this.scripts = scripts;
    }

    setStorage() {
        localStorage.setItem("RasterModeler", JSON.stringify(this));
    }

    static getStorage() {
        let result = localStorage.getItem("RasterModeler");
        if (! result) {
            return new LocalStorageData([]);
        }
        return new LocalStorageData(JSON.parse(result).scripts ?? []);
    }

    addScript(script: Script) {
        this.scripts.push(script);
        this.setStorage();
    }

    removeScript(script: Script) {
        this.scripts.splice(
            this.scripts.findIndex(x => JSON.stringify(x) === JSON.stringify(script)), 
            1);
        this.setStorage();
    }
}

export class Script {

    name: string;
    content: string
    
    constructor(name: string, content: string) {
        this.name = name;
        this.content = content;
    }
}