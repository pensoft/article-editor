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
  host: process.env.WEBSOCKET_HOST || process.env.ENV_WEBSOCKET_HOST,
  port: process.env.WEBSOCKET_PORT || process.env.ENV_WEBSOCKET_PORT,
}
// we have access to our environment variables
// in the process.env object thanks to dotenv
const environmentFileContent = `
export const environment = {
   production: ${isProduction},
   BUILD_NUMBER: '${process.env.BUILD_NUMBER}',
   VERSION: '${version}',
   WEBSOCKET_HOST: '${websocket.host}',
   EXTERNAL_REFS_API: '${isProduction?process.env.EXTERNAL_REFS_API_PROD:process.env.EXTERNAL_REFS_API_DEV}',
   WEBSOCKET_PORT: '${websocket.port}',
   authServer: '${process.env.AUTH_SERVER}',
   authUrl: '${process.env.AUTH_URL}',
   apiUrl: '${process.env.API_URL}',
   passport_client_id: '${process.env.PASSPORT_CLIENT_ID}'
};
`;
// write the content to the respective file
writeFile(targetPath, environmentFileContent, (err: any) => {
  if (err) {
    console.error(err);
  }
});
