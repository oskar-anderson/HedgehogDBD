import { Draw } from "../model/Draw";
import { MoveTableRelative } from "./appCommands/MoveTableRelative";
import { ICommand } from "./ICommand";


export class Transaction {
    undoHistory: string[] = Array(100);
    redoHistory: string[] = Array(100);
    
    constructor() {}

    execute(commandName: string, args: any, context: Draw): any {
        let command = new CommandPattern(commandName, args)
        this.undoHistory = Transaction.pushCapped<string>(this.undoHistory, JSON.stringify(command));
        this.redoHistory = []
        return this.getICommandInstance(command.commandName, context).execute(command.args)
    }

    private getICommandInstance(commandName: string, context: Draw): ICommand {
        let implementation = [ 
            { name: MoveTableRelative.name, constructor: MoveTableRelative },
        ].find(x => x.name === commandName);
        if (! implementation) throw Error(`Unknown command given! commandName: ${commandName}`);
        return new implementation.constructor(context);
    }

    redo(context: Draw): any {
        if (this.redoHistory.length === 0) return;
        let command = JSON.parse(this.redoHistory.pop()!) as CommandPattern;
        this.undoHistory = Transaction.pushCapped<string>(this.undoHistory, JSON.stringify(command));
        return this.getICommandInstance(command.commandName, context).execute(command.args);
    }

    undo(context: Draw): any {
        if (this.undoHistory.length === 0) return;
        let command = JSON.parse(this.undoHistory.pop()!) as CommandPattern;
        this.redoHistory = Transaction.pushCapped<string>(this.redoHistory, JSON.stringify(command));
        return this.getICommandInstance(command.commandName, context).undo(command.args);
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