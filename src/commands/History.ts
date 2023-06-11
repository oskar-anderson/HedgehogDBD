import { Draw } from "../model/Draw";
import { CommandMoveTableRelative, CommandMoveTableRelativeArgs } from "./appCommands/CommandMoveTableRelative";
import { CommandModifyTable, CommandModifyTableArgs } from "./appCommands/CommandModifyTable";
import { CommandCreateTable, CommandCreateTableArgs } from "./appCommands/CommandCreateTable";
import { CommandDeleteTable, CommandDeleteTableArgs } from "./appCommands/CommandDeleteTable";
import { ICommand } from "./ICommand";
import { CommandSetSchema, CommandSetSchemaArgs } from "./appCommands/CommandSetSchema";


export class History {
    undoHistory: string[] = [];
    redoHistory: string[] = [];
    
    constructor() {}

    execute(commandInstance: ICommand<any>) {
        let command = { commandName: commandInstance.constructor.name, args: commandInstance.args};
        this.undoHistory.push(JSON.stringify(command));
        this.redoHistory = [];
        commandInstance.redo();
    }

    private getICommandInstance(command: CommandPattern, context: Draw): ICommand<any> {
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
            let args = new CommandSetSchemaArgs(unhydratedArgs.oldSchema, unhydratedArgs.newSchema);
            args.hydrate();
            return new CommandSetSchema(context, args);
        }
        throw Error(`Unknown command given! commandName: ${command.commandName}`);
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
    args: unknown
}