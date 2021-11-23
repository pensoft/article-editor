const {writeFile} = require('fs');
const {argv} = require('yargs');
const {version} = require('./package.json');
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
   WEBSOCKET_PORT: '${websocket.port}'
};
`;
// write the content to the respective file
writeFile(targetPath, environmentFileContent, (err:any) => {
  if (err) {
    console.error(err);
  }
  //console.log(`Wrote variables to ${targetPath}`);
});
