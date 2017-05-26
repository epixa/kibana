import { execFile } from 'child_process';

if (!process.argv[2]) {
  console.error('You must specify a path to a Kibana build');
  process.exit(1);
}

class Result {
  constructor(err = null, stdout = '', stderr = '') {
    this.err = err;
    this.code = err ? err.code : 0;
    this.signal = err ? err.signal : undefined;
    this.stdout = stdout;
    this.stderr = stderr;
    Object.freeze(this);
  }
}

const DEFAULT_OPTIONS = {
  cwd: process.argv[2]
};

function execute(cmd, args = [], options = DEFAULT_OPTIONS) {
  return new Promise((resolve) => {
    // won't work because we need to stream output and exit on condition
    execFile(cmd, args, options, (err, stdout, stderr) => {
      resolve(new Result(err, stdout, stderr));
    });
  });
}

(async () => {
  const startKibana = await execute('bin/kibana');

  const startKibanaDev = await execute('bin/kibana --dev');
})();
