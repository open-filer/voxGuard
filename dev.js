import { spawn } from 'child_process';

console.log('Starting VoxGuard Backend Proxy & Vite Dev Server...');

const server = spawn('node', ['server.js'], { stdio: 'inherit' });
const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

const cleanup = () => {
  server.kill();
  vite.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
