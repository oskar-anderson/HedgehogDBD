import VmDraw from "../model/viewModel/VmDraw";
import { CommandCreateTable, CommandCreateTableArgs } from "./appCommands/CommandCreateTable";
import CommandMoveTableRelative, { CommandMoveTableRelativeArgs } from "./appCommands/CommandMoveTableRelative";
import { CommandSetSchema, CommandSetSchemaArgs } from "./appCommands/CommandSetSchema";
import { ICommand, IHydratable } from "./ICommand";


export default class History {
    
    undoHistory: string[] = [];
    redoHistory: string[] = [];
    
    constructor() {}

    execute(commandInstance: ICommand<any>) {
        let command = { commandName: commandInstance.constructor.name, args: commandInstance.args};
        this.undoHistory.push(JSON.stringify(command));
        this.redoHistory = [];
        commandInstance.redo();
    }

    private getICommandInstance(command: CommandPattern<any>, context: VmDraw): ICommand<any> {
        if (command.commandName === CommandMoveTableRelative.name) {
            let unhydratedArgs = command.args as CommandMoveTableRelativeArgs;
            let args = new CommandMoveTableRelativeArgs(unhydratedArgs.id, unhydratedArgs.x, unhydratedArgs.y);
            args.hydrate();
            return new CommandMoveTableRelative(context, args);    
        }
        /*
        if (command.commandName === CommandModifyTable.name) {
            let unhydratedArgs = command.args as CommandModifyTableArgs;
            let args = new CommandModifyTableArgs(unhydratedArgs.oldTable, unhydratedArgs.newTable);
            args.hydrate();
            return new CommandModifyTable(context, args);
        }
        */
        if (command.commandName === CommandCreateTable.name) {
            let unhydratedArgs = command.args as CommandCreateTableArgs;
            let args = new CommandCreateTableArgs(unhydratedArgs.table);
            args.hydrate();
            return new CommandCreateTable(context, args);
        }
        /*
        if (command.commandName === CommandDeleteTable.name) {
            let unhydratedArgs = command.args as CommandDeleteTableArgs;
            let args = new CommandDeleteTableArgs(unhydratedArgs.table, unhydratedArgs.listIndex);
            args.hydrate();
            return new CommandDeleteTable(context, args);
        }
        */
        if (command.commandName === CommandSetSchema.name) {
            let unhydratedArgs = command.args as CommandSetSchemaArgs;
            let args = new CommandSetSchemaArgs(unhydratedArgs.oldDraw, unhydratedArgs.newDraw);
            args.hydrate();
            return new CommandSetSchema(context, args);
        }
        throw Error(`Unknown command given! commandName: ${command.commandName}`);

    }

    redo(context: VmDraw) {
        if (this.redoHistory.length === 0) return;
        let command = JSON.parse(this.redoHistory.pop()!) as CommandPattern<any>;
        this.undoHistory.push(JSON.stringify(command));
        this.getICommandInstance(command, context).redo();
    }

    undo(context: VmDraw) {
        if (this.undoHistory.length === 0) return;
        let command = JSON.parse(this.undoHistory.pop()!) as CommandPattern<any>;
        this.redoHistory.push(JSON.stringify(command));
        this.getICommandInstance(command, context).undo();
    }
}


interface CommandPattern<T extends IHydratable<T>> {
    commandName: string;
    args: T;
}