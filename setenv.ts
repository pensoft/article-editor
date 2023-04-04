
const { writeFile, mkdirSync, existsSync } = require('fs');
const { argv } = require('yargs');
const { version } = require('./package.json');
const path = require('path')
// read environment variables from .env file
require('dotenv').config();
const packageFile = './package.json';
const packageContent = require(packageFile);
// read the command line arguments passed with yargs
const environment = argv.environment;
const isProduction = environment === 'prod';
const envPath = './src/environments'
const devEnviromentFile = 'environment.ts'
const prodEnviromentFile = 'environment.prod.ts'
const targetFile = isProduction ? prodEnviromentFile : devEnviromentFile

mkdirSync(envPath, { recursive: true })
writeFile(path.join(envPath, devEnviromentFile), '', (err: any) => {
  if (err) {
    console.error(err);
  }
});
writeFile(path.join(envPath, prodEnviromentFile), '', (err: any) => {
  if (err) {
    console.error(err);
  }
});



const websocket = {
  host: new URL(process.env.WEBSOCKET_HOST || process.env.ARTICLE_STORAGE_WEBSOCKET_HOST).hostname,
  port: process.env.WEBSOCKET_PORT || process.env.ARTICLE_STORAGE_WEBSOCKET_PORT,
}
// we have access to our environment variables
// in the process.env object thanks to dotenv
packageContent.build = process.env.BUILD_NUMBER || packageContent.build || 1;

writeFile(packageFile, JSON.stringify(packageContent, null, 4), (err: any) => {
  if (err) {
    return console.error(err);
  } else {
    console.log(`BUILD_NUMBER=${process.env.BUILD_NUMBER}`);
  }
});

const environmentFileContent = `
export const environment = {
   production: ${isProduction},
   BUILD_NUMBER: '${packageContent.build}',
   VERSION: '${version}',
   WEBSOCKET_HOST: '${websocket.host}',
   EXTERNAL_REFS_API: '${isProduction ? process.env.EXTERNAL_REFS_API : "/find"}',
   WEBSOCKET_PORT: '${websocket.port}',
   authServer: '${process.env.AUTH_SERVICE}',
   authUrl: '${process.env.AUTH_SERVICE}/api',
   apiUrl: '${process.env.API_GATEWAY_SERVICE}/api',
   passport_client_id: '${process.env.PKCE_CLIENT_ID}',
   validate_jats:'${isProduction ? process.env.JATS_VALIDATION_SERVICE : "/validate/xml"}',
   print_pdf:'${isProduction ? process.env.API_GATEWAY_SERVICE + '/articles/items/' : '/proxy-pdf-print'}',
   EVENT_DISPATCHER_SERVICE:'${process.env.EVENT_DISPATCHER_SERVICE}'
};
`;
// write the content to the respective file
writeFile(path.join(envPath, targetFile), environmentFileContent, (err: any) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Environment file has been generated with content:`, environmentFileContent);
  }
});
