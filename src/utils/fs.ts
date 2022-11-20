import process from 'process';
import path from 'path';
import fs from 'fs';
import ignore from 'ignore';

export const recursiveCopy = (src: string, dest: string, cwd: string, ignores = ignore()) => {
    if (fs.lstatSync(src).isDirectory() && fs.existsSync(path.join(src, '.gitignore'))) {
        cwd = src;
        ignores = ignore();
        ignores.add(fs.readFileSync(path.join(src, '.gitignore')).toString());
    }

    fs.readdirSync(src)
        .map(dirent => path.relative(cwd, path.join(src, dirent)))
        .filter(ignores.createFilter())
        .forEach((p) => {
            if (!fs.lstatSync(path.resolve(cwd, p)).isDirectory()) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(path.resolve(dest, path.parse(p).base));
                fs.cpSync(path.resolve(cwd, p), path.resolve(dest, path.parse(p).base), { recursive: true });
            } else {
                fs.mkdirSync(path.join(dest, path.parse(p).base), { recursive: true });
                recursiveCopy(path.resolve(cwd, p), path.resolve(dest, path.parse(p).base), cwd, ignores)
            } 
        })
}
