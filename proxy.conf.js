const PROXY_CONFIG = [
  {
    context: [
      "/products"
    ],
    ws: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': '*'
    },
    autoRewrite: true,
    "target": "http://18.196.139.28:8000/",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
];
//https://github.com/angular/angular-cli/blob/master/docs/documentation/stories/proxy.md
module.exports = PROXY_CONFIG;
