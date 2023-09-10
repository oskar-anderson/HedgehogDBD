import VmDraw from "../model/viewModel/VmDraw";
import VmTable from "../model/viewModel/VmTable";
import { CommandCreateTable, CommandCreateTableArgs } from "./appCommands/CommandCreateTable";
import { CommandDeleteTable, CommandDeleteTableArgs } from "./appCommands/CommandDeleteTable";
import { CommandModifyTable, CommandModifyTableArgs } from "./appCommands/CommandModifyTableArgs";
import CommandMoveTableRelative, { CommandMoveTableRelativeArgs } from "./appCommands/CommandMoveTableRelative";
import { CommandSetSchema, CommandSetSchemaArgs } from "./appCommands/CommandSetSchema";
import { ICommand, IHydratable } from "./ICommand";


export default class CommandHistory {

    static execute(history: {
        undoHistory: string[], 
        redoHistory: string[]
    }, commandInstance: ICommand<any>, setTables: (tables: VmTable[]) => void) {
        let command = { commandName: commandInstance.constructor.name, args: commandInstance.args};
        history.undoHistory.push(JSON.stringify(command));
        history.redoHistory = [];
        commandInstance.redo(setTables);
    }

    private static getICommandInstance(command: CommandPattern<any>, context: {
        tables: VmTable[]
    }): ICommand<any> {
        if (command.commandName === CommandMoveTableRelative.name) {
            let unhydratedArgs = command.args as CommandMoveTableRelativeArgs;
            let args = new CommandMoveTableRelativeArgs(unhydratedArgs.id, unhydratedArgs.x, unhydratedArgs.y);
            args.hydrate();
            return new CommandMoveTableRelative(context, args);    
        }
        if (command.commandName === CommandModifyTable.name) {
            let unhydratedArgs = command.args as CommandModifyTableArgs;
            let args = new CommandModifyTableArgs(unhydratedArgs.oldTable, unhydratedArgs.newTable);
            args.hydrate();
            return new CommandModifyTable(context, args);
        }
        if (command.commandName === CommandCreateTable.name) {
            let unhydratedArgs = command.args as CommandCreateTableArgs;
            let args = new CommandCreateTableArgs(unhydratedArgs.table);
            args.hydrate();
            return new CommandCreateTable(context, args);
        }
        if (command.commandName === CommandDeleteTable.name) {
            let unhydratedArgs = command.args as CommandDeleteTableArgs;
            let args = new CommandDeleteTableArgs(unhydratedArgs.table, unhydratedArgs.listIndex);
            args.hydrate();
            return new CommandDeleteTable(context, args);
        }
        if (command.commandName === CommandSetSchema.name) {
            let unhydratedArgs = command.args as CommandSetSchemaArgs;
            let args = new CommandSetSchemaArgs(unhydratedArgs.oldDraw, unhydratedArgs.newDraw);
            args.hydrate();
            return new CommandSetSchema(context, args);
        }
        throw Error(`Unknown command given! commandName: ${command.commandName}`);

    }

    static redo(history: {
        undoHistory: string[], 
        redoHistory: string[]
    }, context: {
        tables: VmTable[]
    }, setTables: (tables: VmTable[]) => void) {
        if (history.redoHistory.length === 0) return;
        let command = JSON.parse(history.redoHistory.pop()!) as CommandPattern<any>;
        history.undoHistory.push(JSON.stringify(command));
        CommandHistory.getICommandInstance(command, context).redo(setTables);
    }

    static undo(history: {
        undoHistory: string[], 
        redoHistory: string[]
    }, context: {
        tables: VmTable[]
    }, setTables: (tables: VmTable[]) => void) {
        if (history.undoHistory.length === 0) return;
        let command = JSON.parse(history.undoHistory.pop()!) as CommandPattern<any>;
        history.redoHistory.push(JSON.stringify(command));
        CommandHistory.getICommandInstance(command, context).undo(setTables);
    }
}


interface CommandPattern<T extends IHydratable<T>> {
    commandName: string;
    args: T;
}