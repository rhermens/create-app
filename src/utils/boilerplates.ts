import path from 'path';
import os from 'os';
import fs from 'fs';

export const scanBoilerplates = () => {
    const locations = [
        path.join(__dirname, '../../boilerplates'), // ts-node runtime
        path.join(__dirname, '../boilerplates'), // packaged assets
        path.resolve(os.homedir(), '.create-app/boilerplates')
    ];

    return Object.fromEntries(
        locations.filter(scanDir => fs.existsSync(scanDir)).flatMap((scanDir) => {
            return fs.readdirSync(scanDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory() || (dirent.isSymbolicLink() && fs.lstatSync(fs.realpathSync(path.resolve(scanDir, dirent.name))).isDirectory()))
                .map(dirent => ([dirent.name, fs.realpathSync(path.resolve(scanDir, dirent.name))]))
        })
    );
}
