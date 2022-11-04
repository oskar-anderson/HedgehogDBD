export interface ICommand {
    execute(args: any): any
    undo(args: any): any
}