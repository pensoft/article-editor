import { Component, Injectable, OnInit } from '@angular/core';
import * as Y from 'yjs';
import { WebrtcConn, WebrtcProvider as OriginalWebRtc,  } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { YXmlFragment } from 'yjs/dist/src/types/YXmlFragment';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import * as random from 'lib0/random.js';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { fromEvent, race } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
//@ts-ignore
import { WebrtcProvider } from '../utils/y-webrtc/index.js';
import { sectionNode } from '../utils/interfaces/section-node'
import {editorContainer } from '../utils/interfaces/editor-container'
import { Subject } from 'rxjs';
import { ydocData } from '../utils/interfaces/ydocData.js';
import { YMap } from 'yjs/dist/src/internals';
import { treeNode } from '../utils/interfaces/treeNode.js';
import { uuidv4 } from "lib0/random";

@Injectable({
  providedIn: 'root'
})
export class YdocService {
  ydocStateObservable:Subject<any>= new Subject<any>();

  

  ydoc = new Y.Doc();
  provider?: OriginalWebRtc;
  roomName = 'webrtc-test3'
  providerIndexedDb ?: IndexeddbPersistence
  constructor(private http: HttpClient) { }
  editorMetadata ?: YMap<any>
  comments ?: YMap<any>
  getCommentsMap():YMap<any>{
    return this.comments!
  }
  getMetaDataMap():YMap<any>{
    return this.editorMetadata!
  }

  getYDoc(){
    return this.ydoc
  }

  getData():ydocData{
    let TREE_DATA:treeNode[]=this.editorMetadata?.get('TREE_DATA')
    if(TREE_DATA == undefined){
      let TREE_DATA1 =  [
        {name:'Article metadata',
        id:uuidv4(),extended:false,
        edit:true,active:false,
        listId:'2d99e338-5011-4699-9cd5-7dc59f187daa',
        children:[
          {name:'Title',id:uuidv4(),edit:true,children:[],extended:false,active:true},
          {name:'Abstract',id:uuidv4(),edit:true,children:[],extended:false,active:false},
          {name:'Grant title',
          edit:true,listId:'4045db78-0a4f-4b06-a91d-85d6e6c2aa16',extended:false,active:false,id:uuidv4(),
          children:[
            {name:'Taxonomy',id:uuidv4(),edit:true,extended:false,children:[],active:true},
            {name:'Species characteristics',active:false,extended:false,
            edit:true,
            add:true,
            listId:'cf66575f-a42d-4b4f-8b5c-fe392dd713b6',id:uuidv4(),
            children:[
              {name:'Taxonomy',id:uuidv4(),edit:true,extended:false,children:[],active:false},
              {name:'Species characteristics',id:uuidv4(),extended:false,children:[],edit:true,add:true,active:false},
            ]},
          ]},
          {name:'Hosting institution',id:uuidv4(),children:[],extended:false,edit:true,active:false},
          {name:'Ethics and security',id:uuidv4(),children:[],extended:false,edit:true,active:true},
        ]},
        {name:'Introduction',edit:true,id:uuidv4(),children:[],extended:false,add:true,active:false},
        {name:'General information',edit:true,id:uuidv4(),extended:false,active:false,listId:'edeed1b5-1ad1-45d6-95f8-9b1eb3c51ccf'
        ,children:[
          {name:'Taxonomy',id:uuidv4(),edit:true,children:[],extended:false,active:false},
          {name:'Species characteristics',id:uuidv4(),children:[],extended:false,edit:true,add:true,active:false},
        ]},
        {name:'Habitat',id:uuidv4(),children:[],edit:true,extended:false,active:false},
        {name:'Distribution',id:uuidv4(),edit:true,children:[],extended:false,add:true,active:false},
      ];
      TREE_DATA =  [
        {name:'Article metadata',
        id:uuidv4(),extended:false,
        edit:true,active:false,
        listId:'2d99e338-5011-4699-9cd5-7dc59f187daa',
        children:[
          {name:'Title',id:uuidv4(),edit:true,children:[],extended:false,active:true},
          {name:'Abstract',id:uuidv4(),edit:true,children:[],extended:false,active:false},
          {name:'Grant title',
          edit:true,listId:'4045db78-0a4f-4b06-a91d-85d6e6c2aa16',extended:false,active:false,id:uuidv4(),
          children:[]},
          {name:'Hosting institution',id:uuidv4(),children:[],extended:false,edit:true,active:false},
          {name:'Ethics and security',id:uuidv4(),children:[],extended:false,edit:true,active:true},
        ]},
        {name:'Introduction',edit:true,id:uuidv4(),children:[],extended:false,add:true,active:false},
        {name:'General information',edit:true,id:uuidv4(),extended:false,active:false,listId:'edeed1b5-1ad1-45d6-95f8-9b1eb3c51ccf'
        ,children:[
          {name:'Taxonomy',id:uuidv4(),edit:true,children:[],extended:false,active:false},
          {name:'Species characteristics',id:uuidv4(),children:[],extended:false,edit:true,add:true,active:false},
        ]},
        {name:'Habitat',id:uuidv4(),children:[],edit:true,extended:false,active:false},
        {name:'Distribution',id:uuidv4(),edit:true,children:[],extended:false,add:true,active:false},
      ];
      this.editorMetadata?.set('TREE_DATA',TREE_DATA);
    }
    return {
      ydoc:this.ydoc,
      provider:this.provider,
      providerIndexedDb:this.providerIndexedDb!,
      TREE_DATA:TREE_DATA
    }
  }
  buildEditor(){
    this.editorMetadata = this.ydoc.getMap('editorMetadata');
    this.comments = this.ydoc.getMap('comments');
    this.ydocStateObservable.next('docIsBuild');
  }

  init(roomName:string){
    this.roomName=roomName
    this.providerIndexedDb = new IndexeddbPersistence(this.roomName, this.ydoc);
    let buildApp = () => {
      this.provider = new WebrtcProvider(this.roomName, this.ydoc, {
        signaling: [/* 'ws://dev.scalewest.com:4444' *//* 'ws://localhost:4444' */  'wss://y-webrtc-signaling-eu.herokuapp.com' /* , 'wss://signaling.yjs.dev'  ,'wss://y-webrtc-signaling-us.herokuapp.com' */],
        password: null,
        awareness: new awarenessProtocol.Awareness(this.ydoc),
        maxConns: 20 + Math.floor(random.rand() * 15),
        filterBcConns: false,
        peerOpts: {},
      });
      this.provider?.on('onChange', (docArray: any) => {
        let params = new HttpParams({
          fromObject: { document: docArray }
        });

        let httpOptions = {
          headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
        };
        sendUpdateToServiceWorker(params.toString());
        this.http.post('/products', params, httpOptions).subscribe(() => {
        });
      });

      let sendUpdateToServiceWorker = (update: string) => {
        if (navigator.onLine) {
          return;
        }
        var msg = {
          'update': update
        }
        navigator?.serviceWorker?.controller?.postMessage(msg)
      }

      if (!navigator.onLine) {
        //this.buildEditorsOffline();
        this.buildEditor();
      } else {

        // Building the editor without backend for now just for developer purpose
        this.buildEditor();
        return
        let onSubevent = fromEvent(this.provider!, 'signalingConnected').subscribe(()=>{
          let r = race(this.http.get('/products').pipe(delay(500),catchError((err:any)=>{
            console.log("ERROR", err);
            console.log("Editor build with local document");
            this.buildEditor();
            throw(err)
          })), fromEvent(this.provider!, 'synced')).subscribe((data: any) => {
            let synced = this.provider?.room?.synced
            if (data.synced) {
              this.buildEditor();
            } else {
              renderDoc(data)
            }
          })
        })

        /* this.provider?.on('signalingConnected',()=>{
        }) */
      }


    }
    if (this.providerIndexedDb.synced) {
      buildApp()
    } else {
      this.providerIndexedDb.on('synced', () => {
        buildApp()
      })
    }
    let renderDoc = (data: any) => {

      let currentState1: any;
      try {
        // console.log(data);
        const documents = data.map((item: any) => {
          if (typeof item.document == 'string') {
            return Uint8Array.from(item.document.split(','))
          } else {
            return null
          }
        }).filter((item: any) => item)
        documents.forEach((doc: any) => {
          Y.applyUpdate(this.ydoc, doc);
        })
        console.log('ready');
      } catch (e) {
        console.log('ERROR:', e);
        console.log('The editor was loaded with local document');
      }

      this.buildEditor();
    }
  }
}
