export interface ICommand {
    execute(transaction: any): any
    undo(transaction: any): any
}