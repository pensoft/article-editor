//const Yindexeddb = require('y-indexeddb') 


importScripts('./ngsw-worker.js');

self.addEventListener('notificationclick', (event) => {
    console.log('notification clicked!')
});
/*l et request = self.IndexedDB.open('fromDataBase', 1);
let db;
request.onsuccess = function(event) {
    console.log('[onsuccess]', request.result);
    db = event.target.result; // === request.result
};
request.onerror = function(event) {
    console.log('[onerror]', request.error);
}; */
/* var request = self.indexedDB.open('EXAMPLE_DB');
var db;
request.onsuccess = function(event) {
    // some sample products data
    console.log('[onsuccess]', request.result);

    db = event.target.result;
    var transaction = db.transaction('document');
    var documentStore
    transaction.onsuccess = function(event) {
        documentStore = transaction.objectStore('document');
        console.log('[Transaction] ALL DONE!');
        fetch('http://localhost:3000/documentBinary/document', {
            method: 'GET'
        }).then(function(response) {
            return response.json()
        }).then((document) => {
            console.log(document);
            documentStore.add(document)
        }).catch(function(err) {
            console.log(err);
        });
    };
};
request.onerror = function(event) {
    console.log('[onerror]', request.error);
};*/
var request = self.indexedDB.open('EXAMPLE_DB', 3);
request.onupgradeneeded = function(event) {

    db = event.target.result;
    var documentStore = db.createObjectStore('products', { keyPath: 'id' });
};
request.onsuccess = function(event) {
    // some sample products data
    var products = [
        /* {id: 1, name: 'Red Men T-Shirt', price: '$3.99'},
        {id: 2, name: 'Pink Women Shorts', price: '$5.99'},
        {id: 3, name: 'Nike white Shoes', price: '$300'}, */
        { id: 5, name: 'Nike white Shoesss', price: '$300' }
    ];
    // get database from event
    var db = event.target.result;
    // create transaction from database
    // add success event handleer for transaction
    // you should also add onerror, onabort event handlers
    
    // get store from transaction
    // returns IDBObjectStore instance
    // put products data in productsStore
        fetch('http://localhost:3000/documentBinary/document', {
            method: 'GET'
        }).then(function(response) {
            return response.json()
        }).then((document) => {
            var transaction = db.transaction('products', 'readwrite');
            var productsStore = transaction.objectStore('products');
            productsStore.clear()
            console.log(document);
            var db_op_req = productsStore.add(document); // IDBRequest
        }).catch(function(err) {
            console.log(err);
        });
};
self.addEventListener('fetch', function(event) {


    /* if (event.request.url.includes('documentBinary/document')) {
        fetch(event.request).then((res) => {
            return res.json();
        }).then((data) => {
            console.log(data.document);
            yDocUpdate = Uint8Array.from(data.document)
        })
    } */
    //console.log(self.navigator.onLine);



});

self.addEventListener('activate', function(event) {
    console.log('activate');
    /* fetch('http://localhost:3000/documentBinary/document', {
        method: 'GET'
    }).then(function(response) {
        return response.json()
    }).then((data) => {
        console.log(data);
    }).catch(function(err) {
        console.log(err);
    }); */
    event.waitUntil(self.clients.claim());
});


self.addEventListener('install', event => {
    console.log('V1 installing…');
});