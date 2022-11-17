import { Draw } from "../model/Draw";
import { CommandModifyTable } from "./appCommands/CommandModifyTable";
import { CommandMoveTableRelative } from "./appCommands/CommandMoveTableRelative";
import { ICommand } from "./ICommand";


export class History {
    static implementations = [ 
        { name: CommandMoveTableRelative.name, constructor: CommandMoveTableRelative },
        { name: CommandModifyTable.name, constructor: CommandModifyTable },
    ];
    undoHistory: string[] = [];
    redoHistory: string[] = [];
    
    constructor() {}

    execute(commandInstance: ICommand<any>): any {
        let command = new CommandPattern(commandInstance.constructor.name, commandInstance.getArgs());
        if (! History.implementations.some(x => x.name === command.commandName)) throw Error(`Implementation not registered! commandName: ${command.commandName}`);
        this.undoHistory.push(JSON.stringify(command));
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
        this.undoHistory.push(JSON.stringify(command));
        this.getICommandInstance(command, context).redo();
    }

    undo(context: Draw): any {
        if (this.undoHistory.length === 0) return;
        let command = JSON.parse(this.undoHistory.pop()!) as CommandPattern;
        this.redoHistory.push(JSON.stringify(command));
        this.getICommandInstance(command, context).undo();
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