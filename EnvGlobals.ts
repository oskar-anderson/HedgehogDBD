import 'dotenv/config'

/** 
 * Provides a TypeSafe way to access global environment variables 
 * 
*/
export default class EnvGlobals {
    
    static readonly BASE_URL = process.env.BASE_URL!;
}