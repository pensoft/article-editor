//const Yindexeddb = require('y-indexeddb')
let FOLDER_NAME = 'post_requests'

function openDatabase() {
    // if `flask-form` does not already exist in our browser (underour site), it is created
    var indexedDBOpenRequest = indexedDB.open('flask-form',
        1)
    indexedDBOpenRequest.onerror = function(error) {
        // error creating db
        console.error('IndexedDB error:', error)
    }
    indexedDBOpenRequest.onupgradeneeded = function() {
            // This should only executes if there's a need to
            // create/update db.
            this.result.createObjectStore('post_requests', {
                autoIncrement: true,
                keyPath: 'id'
            })
        }
        // This will execute each time the database is opened.
    indexedDBOpenRequest.onsuccess = function() {
        our_db = this.result
    }
}
var our_db
openDatabase()

function getObjectStore(storeName, mode) {
    // retrieve our object store
    return our_db.transaction(storeName, mode).objectStore(storeName)
}

function savePostRequests(url, payload) {
    // get object_store and save our payload inside it
    var request = getObjectStore(FOLDER_NAME, 'readwrite').add({
        url: url,
        payload: payload,
        method: 'POST'
    })
    request.onsuccess = function(event) {
    }
    request.onerror = function(error) {
        console.error(error)
    }
}

function sendPostToServer() {
    var savedRequests = []
    var req = getObjectStore(FOLDER_NAME).openCursor() // FOLDERNAME
        // is 'post_requests'
    req.onsuccess = async function(event) {
        var cursor = event.target.result
        if (cursor) {
            // Keep moving the cursor forward and collecting saved
            // requests.
            savedRequests.push(cursor.value)
            cursor.continue()
        } else {
            // At this point, we have collected all the post requests in
            // indexedb.
            for (let savedRequest of savedRequests) {
                // send them to the server one after the other
                var requestUrl = savedRequest.url
                var payload = savedRequest.payload
                var method = savedRequest.method
                var headers = {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    } // if you have any other headers put them here
                fetch(requestUrl, {
                    headers: headers,
                    method: method,
                    body: payload
                }).then(function(response) {
                    if (response.status < 400) {
                        // If sending the POST request was successful, then
                        // remove it from the IndexedDB.
                        getObjectStore(FOLDER_NAME,
                            'readwrite').delete(savedRequest.id)
                    }
                }).catch(function(error) {
                    // This will be triggered if the network is still down.
                    // The request will be replayed again
                    // the next time the service worker starts up.
                    console.error('Send to Server failed:', error)
                        // since we are in a catch, it is important an error is
                        //thrown,so the background sync knows to keep retrying
                        // the send to server
                    throw error
                })
            }
        }
    }
}
let update;
self.addEventListener('message', function(event) {
    if (event.data.hasOwnProperty('update')) {
        // receives form data from script.js upon submission
        update = event.data.update
    }
})
self.addEventListener('fetch', function(event) {
    // every request from our site, passes through the fetch handler
    // I have proof
    if (event.request.method == "POST" && event.request.url.endsWith('/products')) {
        event.respondWith(fetch(event.request.clone()).catch(function(error) {
            // only save post requests in browser, if an error occurs
            savePostRequests(event.request.clone().url, update)
        }))
    }
    /* consol .log('I am a request with url: ',
        event.request.clone().url);
    console .log(event.request.clone()); */

});

self.addEventListener('sync', function(event) {
    if (event.tag === 'sendFormData') { // event.tag name checked
        // here must be the same as the one used while registering
        // sync
        event.waitUntil(
            // Send our POST request to the server, now that the user is
            // online
            sendPostToServer()
        )

    }
})

importScripts('./ngsw-worker.js');


self.addEventListener('activate', function(event) {
});


self.addEventListener('install', event => {
});
