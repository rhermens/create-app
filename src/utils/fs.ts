import process from 'process';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
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

export const recursiveCopyAsync = async (src: string, dest: string, cwd: string, ignores = ignore()) => {
    if (
        (await fsp.lstat(src)).isDirectory() 
        && fs.existsSync(path.join(src, '.gitignore'))
    ) {
        cwd = src;
        ignores = ignore();
        ignores.add((await fsp.readFile(path.join(src, '.gitignore'))).toString());
    }

    return Promise.all((await fsp.readdir(src))
        .map(dirent => path.relative(cwd, path.join(src, dirent)))
        .filter(ignores.createFilter())
        .flatMap(async (p) => {
            if (!(await fsp.lstat(path.resolve(cwd, p))).isDirectory()) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(path.resolve(dest, path.parse(p).base));
                await fsp.cp(path.resolve(cwd, p), path.resolve(dest, path.parse(p).base), { recursive: true });
            } else {
                await fsp.mkdir(path.join(dest, path.parse(p).base), { recursive: true });
                await recursiveCopyAsync(path.resolve(cwd, p), path.resolve(dest, path.parse(p).base), cwd, ignores);
            }
        }));
}
