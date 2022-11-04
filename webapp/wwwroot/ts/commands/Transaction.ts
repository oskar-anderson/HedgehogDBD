import { Draw } from "../model/Draw";
import { MoveTableRelative } from "./appCommands/MoveTableRelative";
import { ICommand } from "./ICommand";


export class Transaction {
    undoHistory: CommandPattern[] = [];
    redoHistory: CommandPattern[] = [];
    
    constructor() {

    }

    execute(commandName: string, args: any, context: Draw) {
        let command = new CommandPattern(commandName, args)
        this.undoHistory.push(command)
        this.redoHistory = []
        let commandInstance = this.getICommandInstance(command.commandName, context)
        return commandInstance.execute(command.args)
    }

    private getICommandInstance(commandName: string, context: Draw): ICommand {
        let implementation = [ 
            { name: MoveTableRelative.name, constructor: MoveTableRelative },
        ].find(x => x.name === commandName);
        if (! implementation) throw Error(`Unknown command given! commandName: ${commandName}`);
        return new implementation.constructor(context);
    }

    redo(context: Draw) {
        let command = this.redoHistory.pop();
        if (command) {
            this.undoHistory.push(command)
            let commandInstance = this.getICommandInstance(command.commandName, context);
            return commandInstance.execute(command.args);
        }
    }

    undo(context: Draw) {
        let command = this.undoHistory.pop();
        if (command) {
            this.redoHistory.push(command)
            let commandInstance = this.getICommandInstance(command.commandName, context);
            return commandInstance.undo(command.args);
        }
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