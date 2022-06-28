const PROXY_CONFIG = {
    "/products": {
      "target": "https://ps-article-editor.dev.scalewest.com/",
      "secure": false,
      "logLevel": "debug",
      "changeOrigin": true,
      autoRewrite: true,
      "ws": true,
    },
    "/citation-style": {
      "target": "https://ps-article.dev.scalewest.com/",
      "secure": false,
      "logLevel": "debug",
      "changeOrigin": true,
      autoRewrite: true,
      "ws": true,
    },
    "/api": {
      "target": "https://ps-article.dev.scalewest.com/",
      "secure": false,
      "logLevel": "debug",
      "changeOrigin": true,
      autoRewrite: true,
      "ws": true,
    },
    "/public": {
      "target": "https://s3-pensoft.s3.eu-west-1.amazonaws.com/",
      "secure": false,
      "logLevel": "debug",
      "changeOrigin": true,
      autoRewrite: true,
      "ws": true,
    },
    "/vi": {
      "target": "https://img.youtube.com/",
      "secure": false,
      "logLevel": "debug",
      "changeOrigin": true,
      autoRewrite: true,
      "ws": true,
    },
    "/find": {
      "target": "https://refindit.org/",
      "secure": false,
      "logLevel": "debug",
      "changeOrigin": true,
      autoRewrite: true,
      "ws": true,
    },
    "/works": {
      "target": "https://api.crossref.org",
      "secure": false,
      "logLevel": "debug",
      "changeOrigin": true,
      autoRewrite: true,
      "ws": true,
    },
    "/api3": {
      "target": "https://www.biodiversitylibrary.org/",
      "secure": false,
      "logLevel": "debug",
      "changeOrigin": true,
      autoRewrite: true,
      "ws": true,
    },



    /* "/webrtc": {
      "target": "wss://ps-article-editor.dev.scalewest.com/",
      "secure": false,
      "ws": true,
      "logLevel": "debug"
      } */
  }
  //https://github.com/angular/angular-cli/blob/master/docs/documentation/stories/proxy.md
module.exports = PROXY_CONFIG;
