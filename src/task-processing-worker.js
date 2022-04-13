let loadImagAsBlob = (data) => {
  let imageURL = data.data.url
  let prod = data.data.environment
  let proxyURL;
  if (!prod && imageURL.includes('https://s3-pensoft.s3.eu-west-1.amazonaws.com')) {
    proxyURL = imageURL.replace('https://s3-pensoft.s3.eu-west-1.amazonaws.com', '')
  } else {
    proxyURL = imageURL;
  }

  fetch(imageURL /* , { method: 'GET', mode: 'no-cors', } */ ).then((loadedImage) => {
    return loadedImage.blob()
  }).then((blob) => {
    console.log(URL.createObjectURL(blob));
    returnMessage({ blob, imageURL, data })
  })
}

var myCallback = function(data) {
  //the JSONP callback
  console.log(data);
  self.postMessage(JSON.stringify(data));
};

let returnMessage = (obj) => {
  self.postMessage(obj)
}

self.addEventListener('message', event => {
  var
  //used to mimic a sligly slow response from the JSONP call
    randomNum = (Math.floor(Math.random() * 5) + 1),
    //keeps the browser from caching the JSONP data
    cacheBuster = (Math.floor(Math.random() * 10000) + 1);
  //make the JSONP call
  let data = event.data
  if (data.meta && data.meta.action == 'loadImgAsDataURL' && typeof data.data.url == 'string') {
    importScripts(data.data.url + '?callback=myCallback&amp;cacheBuster=' + cacheBuster + '&amp;sleep=' + randomNum);
    //loadImagAsBlob(data);
  }
}, false)