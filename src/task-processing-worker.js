let loadImagAsBlob = (data) => {
  let imageURL = data.data.url
  let prod = data.data.environment
  let proxyURL;
  if (!prod && imageURL.includes('https://s3-pensoft.s3.eu-west-1.amazonaws.com')) {
    proxyURL = imageURL.replace('https://s3-pensoft.s3.eu-west-1.amazonaws.com', '')
  }
  if (!prod && imageURL.includes('https://img.youtube.com')) {
    proxyURL = imageURL.replace('https://img.youtube.com', '')
  }
  if (prod) {
    proxyURL = imageURL;
  }

  /* var createCORSRequest = function(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
      // Most browsers.
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
      // IE8 & IE9
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      // CORS not supported.
      xhr = null;
    }
    return xhr;
  };

  var url = 'https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image2.jpg';
  var method = 'GET';
  var xhr = createCORSRequest(method, url);

  xhr.onload = function(data) {
    // Success code goes here.
  };

  xhr.onerror = function() {
    // Error code goes here.

  };

  xhr.send(); */

  fetch(proxyURL ? proxyURL : imageURL, { method: 'GET' /* , mode: 'no-cors', */ }).then((loadedImage) => {
    return loadedImage.blob()
  }).then((blob) => {
    returnMessage({ blob, imageURL, data })
  })
}

let returnMessage = (obj) => {
  self.postMessage(obj)
}

self.addEventListener('message', event => {

  //make the JSONP call
  let data = event.data
  if (data.meta && data.meta.action == 'loadImgAsDataURL' && typeof data.data.url == 'string') {
    loadImagAsBlob(data);
  }
}, false)