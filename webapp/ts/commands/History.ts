import { Draw } from "../model/Draw";
import { CommandCreateTable } from "./appCommands/CommandCreateTable";
import { CommandDeleteTable } from "./appCommands/CommandDeleteTable";
import { CommandModifyTable } from "./appCommands/CommandModifyTable";
import { CommandMoveTableRelative } from "./appCommands/CommandMoveTableRelative";
import { ICommand } from "./ICommand";


export class History {
    static implementations = [ 
        { name: CommandMoveTableRelative.name, constructor: CommandMoveTableRelative },
        { name: CommandModifyTable.name, constructor: CommandModifyTable },
        { name: CommandCreateTable.name, constructor: CommandCreateTable },
        { name: CommandDeleteTable.name, constructor: CommandDeleteTable },
    ];
    undoHistory: string[] = [];
    redoHistory: string[] = [];
    
    constructor() {}

    execute(commandInstance: ICommand<any>) {
        let command = { commandName: commandInstance.constructor.name, args: commandInstance.args};
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

    redo(context: Draw) {
        if (this.redoHistory.length === 0) return;
        let command = JSON.parse(this.redoHistory.pop()!) as CommandPattern;
        this.undoHistory.push(JSON.stringify(command));
        this.getICommandInstance(command, context).redo();
    }

    undo(context: Draw) {
        if (this.undoHistory.length === 0) return;
        let command = JSON.parse(this.undoHistory.pop()!) as CommandPattern;
        this.redoHistory.push(JSON.stringify(command));
        this.getICommandInstance(command, context).undo();
    }
}

interface CommandPattern {
    commandName: string;
    args: any;
}