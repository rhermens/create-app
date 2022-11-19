import process from 'process';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { InvalidOptionArgumentError, Option, program } from 'commander';

const scanBoilerplates = () => {
    const locations = [
        path.resolve(__dirname, '../boilerplates'),
        path.resolve(os.homedir(), '.create-app/boilerplates')
    ];

    return Object.fromEntries(
        locations.filter(scanDir => fs.existsSync(scanDir)).flatMap((scanDir) => {
            return fs.readdirSync(scanDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => ([dirent.name, `${scanDir}/${dirent.name}`]))
        })
    );
}

program
    .requiredOption("-o, --outdir <outdir>", "Project directory", (value) => {
        const outdir = path.resolve(process.cwd(), value);
        if (fs.existsSync(outdir)) throw new InvalidOptionArgumentError("Directory already exists");
        return outdir;
    })
    .addOption((() => {
        const boilerplates = scanBoilerplates();
        return new Option("-b, --boilerplate <boilerplate>", "Project boilerplate")
            .choices(Object.keys(boilerplates))
            .argParser(value => {
                if (!boilerplates[value]) throw new InvalidOptionArgumentError(`Boilerplate must be one of: ${Object.keys(boilerplates).join(', ')}`);
                return boilerplates[value];
            })
            .makeOptionMandatory()
    })())
    .action((opts) => {
        console.log(`Copying ${opts.boilerplate} to ${opts.outdir}`);
        fs.copySync(opts.boilerplate, opts.outdir, { overwrite: false, errorOnExist: true, recursive: true });

        console.log("Happy hacking!");
    })
    .parse();

