const PROXY_CONFIG = [
  {
    context: [
      "/products"
    ],
    ws: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': '*',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    autoRewrite: true,
    "target": "https://ps-article-editor.dev.scalewest.com/",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
];
//https://github.com/angular/angular-cli/blob/master/docs/documentation/stories/proxy.md
module.exports = PROXY_CONFIG;
