export default class Script {

    name: string;
    content: string;
    tags: string[] = [];
    
    constructor(name: string, content: string, tags: string[]) {
        this.name = name;
        this.content = content;
        this.tags = tags;
    }
}