export class CommandPattern {
    command: string;
    args: any;
    
    constructor(command: string, args: any) {
        this.command = command;
        this.args = args;
    }

}