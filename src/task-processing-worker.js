let loadImagAsBlob = (data) => {
  let imageURL = data.data.url
  let proxyURL;
  if (imageURL.includes('https://s3-pensoft.s3.eu-west-1.amazonaws.com')) {
    proxyURL = imageURL.replace('https://s3-pensoft.s3.eu-west-1.amazonaws.com', '')
  }
  fetch(proxyURL).then((loadedImage) => {
    return loadedImage.blob()
  }).then((blob) => {
    returnMessage({ blob, imageURL, data })
  })
}

let returnMessage = (obj) => {
  self.postMessage(obj)
}

self.addEventListener('message', event => {
  let data = event.data
  if (data.meta && data.meta.action == 'loadImgAsDataURL' && typeof data.data.url == 'string') {
    loadImagAsBlob(data);
  }
})