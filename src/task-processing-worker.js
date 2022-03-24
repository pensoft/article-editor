self.addEventListener('message', event => {
  console.log('Worker received:', event.data)
  let data = event.data
  if (data.meta.action == 'loadImgInDataURL' && typeof data.data.url == 'string') {
    let imageURL = data.data.url /* .replace('https://', 'http://') */
    console.log(imageURL);
    let headers = new Headers({
      "Access-Control-Allow-Methods": '*',
      "Access-Control-Allow-Origin": '*'
    })
    fetch(imageURL, { headers }).then((loadedImage) => {
      return loadedImage.blob()
    }).then((blob) => {
      console.log(blob);
      self.postMessage({
        imageURL,
        blob
      })
    })
  }
})