import { CommandPattern } from "./model/CommandPattern";
import { Draw } from "./model/Draw";


export class Transaction {
    undoHistory: CommandPattern[] = [];
    redoHistory: CommandPattern[] = [];
    
    constructor() {

    }

    execute(transaction: CommandPattern, context: Draw) {
        return this._execute(transaction, context)
    }


    private _execute(transaction: CommandPattern, context: Draw, isUndo = false) {

        let registeredCommands = [
            { 
                
                commandName: "moveTableRelative",
                commandFunc: (transaction: CommandPattern) => {
                    let table = context.tables.find(x => x.id === transaction.args.id)!;
                    table.rect.x += transaction.args.x;
                    table.rect.y += transaction.args.y;
                    return table.rect
                },
                reverseArgsForUndoFunc: (args: any) => {
                    let reversedArgs = args;
                    reversedArgs.x = -reversedArgs.x;
                    reversedArgs.y = -reversedArgs.y;
                    return reversedArgs;
                }
            }
        ];
        let commandToExecute = registeredCommands.find(x => x.commandName === transaction.command);
        if (! commandToExecute) {
            console.error('Unknown command given!')
            return
        }
        if (! isUndo) {
            this.undoHistory.push(transaction)
            this.redoHistory = []
        } else {
            transaction.args = commandToExecute.reverseArgsForUndoFunc(transaction.args);
            this.redoHistory.push(transaction)
            this.undoHistory = []
        }
        return commandToExecute.commandFunc(transaction)
    }

    redo(context: Draw) {
        let command = this.redoHistory.pop();
        if (command) {
            this._execute(command, context, false)
        }
    }

    undo(context: Draw) {
        let command = this.undoHistory.pop();
        if (command) {
            this._execute(command, context, true)
        }
    }
}