// file: src/utils/FileHandler2.ts

import fs from 'fs-extra';

import { _isProd_, _isDev_, _isDebug_ } from '../../../dev/EnvConf.cjs';

import { storageService } from '../services';

// -rwxr--r-- 1 carljdp carljdp     4 Mar 30 11:23 ./code.lock
// in %APPDATA%\Code

// other
// /home/carljdp/.vscode-server/data/User/workspaceStorage/6e76c5035faaf2663cd671e2da210c28/vscode.lock
// /home/carljdp/.vscode-server/data/User/workspaceStorage/dad357051edf104625c9a39af5bc9f77/vscode.lock
// /home/carljdp/.vscode-server/extensions/ritwickdey.liveserver-5.7.9/node_modules/lodash/flake.lock
// /home/carljdp/.vscode-server/extensions/ms-mssql.mssql-1.22.0/node_modules/lodash/flake.lock
// /home/carljdp/.vscode-server/extensions/oracle.mysql-shell-for-vs-code-1.14.2-linux-x64/shell/lib/mysqlsh/plugins/mrs_plugin/examples/mrs_notes/node_modules/lodash/flake.lock

// https://github.com/microsoft/vscode/issues/127861#issuecomment-877417451
// There is now a lockfile, so if there's an existing Code instance running from that profile directory but not listening on the debug port, you will be presented with the same dialog we show in the browser case:
//

// profileLocation

export interface FileHandler2Options {

}

// Purpose: 
// - We are attempting to read and write to files owned by vscode, so
// - we need to be cautious about how we handle these files.

/**
 * A class that

 */
export class FileHandler2 {




    // /**
    //  * Writes data to a file
    //  */
    // async writeFile(filePath: string, data: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
    //     try {
    //         //
    //     } catch (err) {
    //         //
    //     } finally {
    //         //
    //     }
    // }

    // /**
    //  * Reads data from a file
    //  */
    // async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    //     try {
    //         //
    //     } catch (err) {
    //         //
    //     } finally {
    //         //
    //     }
    // }


}
