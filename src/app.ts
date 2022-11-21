import process from 'process';
import path from 'path';
import fs from 'fs';
import { scanBoilerplates } from './utils/boilerplates';
import { Argument, InvalidArgumentError, InvalidOptionArgumentError, program } from 'commander';
import { recursiveCopy } from './utils/fs';

program
    .name('create-app')
    .addArgument((() => {
        const boilerplates = scanBoilerplates();
        return new Argument("<boilerplate>", "Project boilerplate")
            .choices(Object.keys(boilerplates))
            .argParser(value => {
                if (!boilerplates[value]) throw new InvalidArgumentError(`Boilerplate must be one of: ${Object.keys(boilerplates).join(', ')}`);
                return boilerplates[value];
            })
            .argRequired()
    })())
    .argument("<outdir>", "Project directory", (value) => {
        const outdir = path.resolve(process.cwd(), value);
        if (fs.existsSync(outdir)) throw new InvalidArgumentError("Directory already exists");
        return outdir;
    })
    .option("-r, --replacement <replacement>", "String replacements (search=replacement)", (value: string, previous: { [key: string]: string }) => {
        if (!value.includes("=")) throw new InvalidOptionArgumentError("Invalid replacement format (search=replacement)");
        const [search, replacement] = value.split('=');
        if (search in previous) throw new InvalidOptionArgumentError("Duplicate replacement search");

        return {
            ...previous,
            [search]: replacement
        }
    }, {})
    .action(async (boilerplate, outdir, opts) => {
        process.stdout.write(`Copying ${boilerplate} to ${outdir} \n`);

        fs.mkdirSync(outdir);
        recursiveCopy(boilerplate, outdir, boilerplate);

        process.stdout.write("\nHappy hacking!\n");
    })
    .parse(process.argv);
