import { Component, Injectable, OnInit } from '@angular/core';
import * as Y from 'yjs';
import { WebrtcConn, WebrtcProvider as OriginalWebRtc, } from 'y-webrtc';
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
import { editorContainer } from '../utils/interfaces/editor-container'
import { Subject } from 'rxjs';
import { ydocData } from '../utils/interfaces/ydocData';
import { YMap } from 'yjs/dist/src/internals';
import { treeNode } from '../utils/interfaces/treeNode';
import { uuidv4 } from "lib0/random";
import { articleSection, editorData, taxonomicCoverageContentData } from '../utils/interfaces/articleSection';
import { articleBasicStructure } from '../utils/articleBasicStructure';
import { DetectFocusService } from '../utils/detectFocusPlugin/detect-focus.service';

@Injectable({
  providedIn: 'root'
})
export class YdocService {
  ydocStateObservable: Subject<any> = new Subject<any>();

  editorIsBuild = false;

  ydoc = new Y.Doc();

  provider?: OriginalWebRtc;
  roomName = 'webrtc-test3'
  providerIndexedDb?: IndexeddbPersistence
  constructor(
    private http: HttpClient,
    ) { }
  articleStructure?: YMap<any>
  sectionsFromIODefaultValues?: YMap<any>
  comments?: YMap<any>
  figuresMap?: YMap<any>
  editorsFocusState?: YMap<any>
  getCommentsMap(): YMap<any> {
    return this.comments!
  }

  getYDoc() {
    return this.ydoc
  }

  findSectionById(sectionId:string){
    let articleSectionsStructure: articleSection[] = this.articleStructure?.get('articleSectionsStructure')

  }

  updateSection(sectionData: articleSection){
    let articleSectionsStructure: articleSection[] = this.articleStructure?.get('articleSectionsStructure')
    let nodeRef: any
    let findF = (list?: articleSection[]) => {
      list?.forEach((node) => {
        if (node.sectionID !== undefined && node.sectionID == sectionData.sectionID) {
          nodeRef = node
        } else if (node.children) {
          findF(node.children)
        }
      })
    }
    findF(articleSectionsStructure);


    let articleSectionsStructureFlat:articleSection[] = []
    let makeFlat = (structure:articleSection[]) => {
      structure.forEach((section)=>{
        if(section.active){
          articleSectionsStructureFlat.push(section)
        }
        if(section.children.length>0){
          makeFlat(section.children)
        }
      })
    }
    makeFlat(articleSectionsStructure)
    this.articleStructure?.set('articleSectionsStructure', articleSectionsStructure);
    this.articleStructure?.set('articleSectionsStructureFlat', articleSectionsStructureFlat);
  }

  applySectionChange(value:{ contentData:editorData|string|editorData|taxonomicCoverageContentData, sectionData: articleSection ,type:string}){
    let articleSectionsStructure: articleSection[] = this.articleStructure?.get('articleSectionsStructure')
    let nodeRef: any
    let findF = (list?: articleSection[]) => {
      list?.forEach((node) => {
        if (node.sectionID !== undefined && node.sectionID == value.sectionData.sectionID) {
          nodeRef = node
        } else if (node.children) {
          findF(node.children)
        }
      })
    }
    findF(articleSectionsStructure);

    nodeRef![value.type].contentData = value.contentData

    let articleSectionsStructureFlat:articleSection[] = []
    let makeFlat = (structure:articleSection[]) => {
      structure.forEach((section)=>{
        if(section.active){
          articleSectionsStructureFlat.push(section)
        }
        if(section.children.length>0){
          makeFlat(section.children)
        }
      })
    }
    makeFlat(articleSectionsStructure)
    this.articleStructure?.set('articleSectionsStructure', articleSectionsStructure);
    this.articleStructure?.set('articleSectionsStructureFlat', articleSectionsStructureFlat);
  }

  getData(): ydocData {
    let articleSectionsStructure: articleSection[] = this.articleStructure?.get('articleSectionsStructure')
    let articleSectionsStructureFlat: articleSection[] = this.articleStructure?.get('articleSectionsStructureFlat');
    try{
      if (articleSectionsStructure == undefined) {
        articleSectionsStructureFlat = []
        articleSectionsStructure = articleBasicStructure

        let makeFlat = (structure:articleSection[]) => {
          structure.forEach((section)=>{
            if(section.active){
              articleSectionsStructureFlat.push(section)
            }
            if(section.children.length>0){
              makeFlat(section.children)
            }
          })
        }
        makeFlat(articleSectionsStructure)
        this.articleStructure?.set('articleSectionsStructure', articleSectionsStructure);
        console.log(articleSectionsStructure);
        console.log(articleSectionsStructureFlat);
        this.articleStructure?.set('articleSectionsStructureFlat', articleSectionsStructureFlat);

      }
    }catch(e){
      console.log(e);
    }

    return {
      ydoc: this.ydoc,
      provider: this.provider,
      providerIndexedDb: this.providerIndexedDb!,
      articleSectionsStructure: articleSectionsStructure
    }
  }
  buildEditor() {
    this.editorsFocusState = this.ydoc.getMap('editorsFocusState');
    this.editorsFocusState.set('focusObj',{})
    this.sectionsFromIODefaultValues = this.ydoc.getMap('formIODefaultValues');
    this.figuresMap = this.ydoc.getMap('figuresMap');
    let figures = this.figuresMap.get('figures');
    if(!figures){
      this.figuresMap.set('figures',[]);
    }
    this.articleStructure = this.ydoc.getMap('articleStructure');
    this.comments = this.ydoc.getMap('comments');
    this.ydocStateObservable.next('docIsBuild');
    this.editorIsBuild = true;
  }

  init(roomName: string) {
    this.roomName = roomName
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
          fromObject: { 
            document: docArray,
            articleId: roomName
          }
        });

        
        sendUpdateToServiceWorker(params.toString());
        this.http.post('/products', params).subscribe(() => {
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
        //this.buildEditor();
        //return
        let onSubevent = fromEvent(this.provider!, 'signalingConnected').subscribe(() => {
          console.log('signalingConnected');
          console.log('/products/'+roomName);
          this.http.get('/products/'+roomName).subscribe((data)=>{
            console.log('data from backedn',data);
            renderDoc(data);
          })
          /* let r = race(this.http.get('/products').pipe(delay(500), catchError((err: any) => {
            console.log("ERROR", err);
            console.log("Editor build with local document");
            this.buildEditor();
            throw (err)
          })), fromEvent(this.provider!, 'synced')).subscribe((data: any) => {
            let synced = this.provider?.room?.synced
            if (data.synced) {
              this.buildEditor();
            } else {
              renderDoc(data)
            }
          }) */
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
