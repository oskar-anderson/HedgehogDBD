import { Draw } from "../model/Draw";
import { CommandMoveTableRelative } from "./appCommands/CommandMoveTableRelative";
import { ICommand } from "./ICommand";


export class History {
    static implementations = [ 
        { name: CommandMoveTableRelative.name, constructor: CommandMoveTableRelative },
    ];
    undoHistory: string[] = Array(100);
    redoHistory: string[] = Array(100);
    
    constructor() {}

    execute(commandInstance: ICommand<any>): any {
        let command = new CommandPattern(commandInstance.constructor.name, commandInstance.getArgs());
        if (! History.implementations.some(x => x.name === command.commandName)) throw Error(`Implementation not registered! commandName: ${command.commandName}`);
        this.undoHistory = History.pushCapped<string>(this.undoHistory, JSON.stringify(command));
        this.redoHistory = [];
        commandInstance.redo();
    }

    private getICommandInstance(command: CommandPattern, context: Draw): ICommand<any> {
        let implementation = History.implementations.find(x => x.name === command.commandName);
        if (! implementation) throw Error(`Unknown command given! commandName: ${command.commandName}`);
        return new implementation.constructor(context, command.args);
    }

    redo(context: Draw): any {
        if (this.redoHistory.length === 0) return;
        let command = JSON.parse(this.redoHistory.pop()!) as CommandPattern;
        this.undoHistory = History.pushCapped<string>(this.undoHistory, JSON.stringify(command));
        this.getICommandInstance(command, context).redo();
    }

    undo(context: Draw): any {
        if (this.undoHistory.length === 0) return;
        let command = JSON.parse(this.undoHistory.pop()!) as CommandPattern;
        this.redoHistory = History.pushCapped<string>(this.redoHistory, JSON.stringify(command));
        this.getICommandInstance(command, context).undo();
    }

    private static pushCapped<T>(arr: T[], value: T): T[] {
        arr = arr.slice(-(arr.length - 1)); arr.push(value); return arr;
    }
}

class CommandPattern {
    commandName: string;
    args: any;
    
    constructor(commandName: string, args: any) {
        this.commandName = commandName;
        this.args = args;
    }
}