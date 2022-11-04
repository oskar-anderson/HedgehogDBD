import { ICommand } from "./ICommand";

// add a registry of the type you expect
// https://stackoverflow.com/questions/47082026/typescript-get-all-implementations-of-interface
export namespace ICommandRegister {
    type Constructor<T> = {
      new(...args: any[]): T;
      readonly prototype: T;
    }
    const implementations: Constructor<ICommand>[] = [];
    export function GetImplementations(): Constructor<ICommand>[] {
      return implementations;
    }
    export function register<T extends Constructor<ICommand>>(ctor: T) {
      implementations.push(ctor);
      return ctor;
    }
}