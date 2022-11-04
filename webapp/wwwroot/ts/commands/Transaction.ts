import { ICommand } from "./ICommand";
import { ICommandRegister } from "./ICommandRegister";
import { Draw } from "../model/Draw";
import { MoveTableTest } from "./appCommands/MoveTableTest";
import { MoveTableRelative } from "./appCommands/MoveTableRelative";


export class Transaction {
    undoHistory: CommandPattern[] = [];
    redoHistory: CommandPattern[] = [];
    
    constructor() {

    }

    execute(commandName: string, args: any, context: Draw) {
        let transaction = new CommandPattern(commandName, args)
        console.log(transaction)
        console.log(ICommandRegister.GetImplementations())
        this.undoHistory.push(transaction)
        this.redoHistory = []
        let command = this.getICommandInstance(transaction.commandName, context)
        return command.execute(transaction)
    }

    private getICommandInstance(commandName: string, context: Draw): ICommand {
        let implementation = [ 
            { name: MoveTableRelative.name, constructor: MoveTableRelative },
            { name: MoveTableTest.name, constructor: MoveTableTest } 
        ].find(x => x.name === commandName);
        if (! implementation) throw Error(`Unknown command given! commandName: ${commandName}`);
        return new implementation.constructor(context);
    }

    redo(context: Draw) {
        let command = this.redoHistory.pop();
        if (command) {
            this.undoHistory.push(command)
            let commandClass = this.getICommandInstance(command.commandName, context);
            return commandClass.execute(command);
        }
    }

    undo(context: Draw) {
        let command = this.undoHistory.pop();
        if (command) {
            this.redoHistory.push(command)
            let commandClass = this.getICommandInstance(command.commandName, context);
            return commandClass.undo(command);
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