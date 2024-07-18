const { exec } = require('child_process');
const path = require('path');

console.log('Setting up database...');

const migrationPath = path.join(__dirname, '..', 'migrations');

exec(`npx node-pg-migrate up --migrations-dir ${migrationPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
  console.log('Database setup complete!');
});