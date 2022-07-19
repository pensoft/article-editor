const { writeFile } = require('fs');
const { argv } = require('yargs');
const { version } = require('./package.json');
// read environment variables from .env file
require('dotenv').config();
// read the command line arguments passed with yargs
const environment = argv.environment;
const isProduction = environment === 'prod';
const targetPath = isProduction
  ? `./src/environments/environment.prod.ts`
  : `./src/environments/environment.ts`;
const websocket = {
  host: process.env.WEBSOCKET_HOST || 'ps-article-storage.dev.scalewest.com',
  port: process.env.WEBSOCKET_PORT || 443,
}
// we have access to our environment variables
// in the process.env object thanks to dotenv
const environmentFileContent = `
export const environment = {
   production: ${isProduction},
   BUILD_NUMBER: '${process.env.BUILD_NUMBER}',
   VERSION: '${version}',
   WEBSOCKET_HOST: '${websocket.host}',
   EXTERNAL_REFS_API: '${isProduction?"https://refindit.org/find":"/find"}',
   WEBSOCKET_PORT: '${websocket.port}',
   authServer: 'https://ps-accounts.dev.scalewest.com',
   authUrl: 'https://ps-accounts.dev.scalewest.com/api',
   apiUrl: 'https://ps-api.dev.scalewest.com/api',
   passport_client_id: '96c50ae2-91d6-4df2-b9b0-1b1f5ef40def'
};
`;
// write the content to the respective file
writeFile(targetPath, environmentFileContent, (err: any) => {
  if (err) {
    console.error(err);
  }
});
