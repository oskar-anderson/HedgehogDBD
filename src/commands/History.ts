import DomainDraw from "../model/domain/DomainDraw";
import CommandMoveTableRelative from "./appCommands/CommandMoveTableRelative";
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

    private getICommandInstance(command: CommandPattern<any>, context: DomainDraw): ICommand<any> {
        const args = command.args.hydrate();
        switch (command.commandName) {
            case CommandMoveTableRelative.name:
                return new CommandMoveTableRelative(context, args);
            /* 
            case CommandModifyTable.name:
                return new CommandModifyTable(context, args);
            case CommandCreateTable.name:
                return new CommandCreateTable(context, args);
            case CommandDeleteTable.name:
                return new CommandDeleteTable(context, args);
            case CommandSetSchema.name:
                return new CommandSetSchema(context, args);
            */
            default:
                throw Error(`Unknown command given! commandName: ${command.commandName}`);
        }
    }

    redo(context: DomainDraw) {
        if (this.redoHistory.length === 0) return;
        let command = JSON.parse(this.redoHistory.pop()!) as CommandPattern<any>;
        this.undoHistory.push(JSON.stringify(command));
        this.getICommandInstance(command, context).redo();
    }

    undo(context: DomainDraw) {
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