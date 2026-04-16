const { spawn } = require('child_process');
const path = require('path');

const projectDir = __dirname;
const nextBin = path.join(projectDir, 'node_modules', 'next', 'dist', 'bin', 'next');

console.log('Starting Next.js from:', projectDir);
console.log('Next binary:', nextBin);

const child = spawn('node', [nextBin, 'dev'], {
  cwd: projectDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NEXT_SWC_DISABLED: '1' }
});

child.on('error', (err) => {
  console.error('Failed to start process:', err);
});

child.on('exit', (code) => {
  console.log('Process exited with code:', code);
});
