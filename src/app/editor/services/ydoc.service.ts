import { Component, Injectable, OnInit } from '@angular/core';
//@ts-ignore
import * as Y from 'yjs'
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
import { WebsocketProvider } from 'y-websocket'
import { environment } from 'src/environments/environment'
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
import { threadId } from 'worker_threads';
import { ServiceShare } from './service-share.service';
import { ArticlesService } from '@app/core/services/articles.service';
import { CDK_DRAG_HANDLE } from '@angular/cdk/drag-drop';

@Injectable({
  providedIn: 'root'
})
export class YdocService {
  ydocStateObservable: Subject<any> = new Subject<any>();

  editorIsBuild = false;

  ydoc = new Y.Doc();

  //provider?: OriginalWebRtc;
  provider?: WebsocketProvider;
  roomName = 'webrtc-test3'
  providerIndexedDb?: IndexeddbPersistence
  constructor(
    private http: HttpClient,
    private serviceShare: ServiceShare,
    private articleService:ArticlesService
  ) {
    this.serviceShare.shareSelf('YdocService', this)
  }
  articleStructureFromBackend: any
  articleStructure?: YMap<any>
  articleData: any;
  sectionFormGroupsStructures?: YMap<any>
  comments?: YMap<any>
  figuresMap?: YMap<any>
  trackChangesMetadata?: YMap<any>
  usersDataMap?: YMap<any>
  mathMap?: YMap<any>
  referenceCitationsMap?:YMap<any>;
  printMap?: YMap<any>
  userInfo: any
  getCommentsMap(): YMap<any> {
    return this.comments!
  }

  getYDoc() {
    return this.ydoc
  }

  findSectionById(sectionId: string) {
    let articleSectionsStructure: articleSection[] = this.articleStructure?.get('articleSectionsStructure')

  }

  updateSection(sectionData: articleSection) {
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


    let articleSectionsStructureFlat: articleSection[] = []
    let makeFlat = (structure: articleSection[]) => {
      structure.forEach((section) => {
        if (section.active) {
          articleSectionsStructureFlat.push(section)
        }
        if (section.children.length > 0) {
          makeFlat(section.children)
        }
      })
    }
    makeFlat(articleSectionsStructure)
    this.articleStructure?.set('articleSectionsStructure', articleSectionsStructure);
    this.articleStructure?.set('articleSectionsStructureFlat', articleSectionsStructureFlat);
  }

  applySectionChange(value: { contentData: editorData | string | editorData | taxonomicCoverageContentData, sectionData: articleSection, type: string }) {
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

    let articleSectionsStructureFlat: articleSection[] = []
    let makeFlat = (structure: articleSection[]) => {
      structure.forEach((section) => {
        if (section.active) {
          articleSectionsStructureFlat.push(section)
        }
        if (section.children.length > 0) {
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
    let citatsObj = this.figuresMap!.get('articleCitatsObj');
    try {

      if (articleSectionsStructure == undefined) {
        citatsObj = {}
        articleSectionsStructureFlat = []
        articleSectionsStructure = this.articleStructureFromBackend || articleBasicStructure

        let makeFlat = (structure: articleSection[]) => {
          structure.forEach((section) => {
            // citats obj [key:string](citateID):{citatedFigures:[](citated figures-Ids),posiition:number(citatePosition)}
            if (section.active) {
              articleSectionsStructureFlat.push(section)
            }
            if (section.children.length > 0) {
              makeFlat(section.children)
            }
          })
        }
        makeFlat(articleSectionsStructure)

        this.articleStructure?.set('articleSectionsStructure', articleSectionsStructure);
        this.articleStructure?.set('articleSectionsStructureFlat', articleSectionsStructureFlat);

      }
      if (!citatsObj) {
        citatsObj = {}
        articleSectionsStructureFlat.forEach((section) => {
          citatsObj[section.sectionID] = {} // citats obj [key:string](citateID):{citatedFigures:[](citated figures-Ids),posiition:number(citatePosition)}

        })
        this.figuresMap!.set('articleCitatsObj', citatsObj);
      }
    } catch (e) {
      console.error(e);
    }

    return {
      ydoc: this.ydoc,
      provider: this.provider,
      userInfo: this.userInfo,
      providerIndexedDb: this.providerIndexedDb!,
      articleSectionsStructure: articleSectionsStructure,
    }

  }
  buildEditor() {
    this.sectionFormGroupsStructures = this.ydoc.getMap('sectionFormGroupsStructures');
    this.figuresMap = this.ydoc.getMap('ArticleFiguresMap');
    this.provider?.awareness.setLocalStateField('userInfo', this.userInfo);
    let figuresNumbers = this.figuresMap!.get('ArticleFiguresNumbers');
    let figuresTemplates = this.figuresMap!.get('figuresTemplates');
    let figures = this.figuresMap!.get('ArticleFigures');
    let figuresImagesDataURL = this.figuresMap!.get('ArticleFiguresDataURLS');
    this.usersDataMap = this.ydoc.getMap('userDataMap')
    this.mathMap = this.ydoc.getMap('mathDataURLMap');
    this.printMap = this.ydoc.getMap('print');
    let pdfSettings = this.printMap.get('pdfPrintSettings')
    let mathObj = this.mathMap.get('dataURLObj')
    let usersColors = this.usersDataMap.get('usersColors');
    this.referenceCitationsMap = this.ydoc.getMap('referenceCitationsMap');
    let references = this.referenceCitationsMap?.get('references')
    if(!references){
      this.referenceCitationsMap?.set('references',{})
    }
    if (!usersColors) {
      this.usersDataMap.set('usersColors', { });
    }
    this.setUserColor(this.userInfo);

    if (!pdfSettings) {
      let pdfPrintSettings = (
        this.articleData&&
        this.articleData.layout&&
        this.articleData.layout.settings&&
        this.articleData.layout.settings.print_settings
        )?this.articleData.layout.settings.print_settings:{}
      this.printMap.set('pdfPrintSettings',pdfPrintSettings)
    }
    if (!figures) {
      this.figuresMap!.set('ArticleFigures', {})
    }
    if (!figuresImagesDataURL) {
      this.figuresMap!.set('ArticleFiguresDataURLS', {})
    }
    if (!figuresTemplates) {
      this.figuresMap!.set('figuresTemplates', {})
    }
    if (!figuresNumbers) {
      this.figuresMap!.set('ArticleFiguresNumbers', []);
    }
    if(!mathObj){
      this.mathMap!.set('dataURLObj', {});
    }

    this.articleStructure = this.ydoc.getMap('articleStructure');
    this.trackChangesMetadata = this.ydoc.getMap('trackChangesMetadata');
    let trackChangesData = this.trackChangesMetadata?.get('trackChangesMetadata')
    if (!trackChangesData) {
      this.trackChangesMetadata?.set('trackChangesMetadata', { trackTransactions: false });
    }
    this.comments = this.ydoc.getMap('comments');
    this.ydocStateObservable.next('docIsBuild');
    this.getData()
    this.editorIsBuild = true;
  }

  setArticleData(articleData: any) {
    this.articleData = articleData;
    this.checkLastTimeUpdated();
  }

  checkLastTimeUpdated(){
    if(new Date(this.articleData.updated_at).toDateString() !== new Date().toDateString()){
      this.articleService.updateArticleUpdatedAt(this.articleData).subscribe((res)=>{
      });
    }
  }

  resetYdoc() {

    this.editorIsBuild = false;

    this.ydoc = new Y.Doc();

    this.provider = undefined;
    this.roomName = 'webrtc-test3';
    this.providerIndexedDb = undefined;

    //this.articleStructureFromBackend = undefined;
    this.articleStructure = undefined;
    this.articleData = undefined;
    this.sectionFormGroupsStructures = undefined;
    this.comments = undefined;
    this.figuresMap = undefined;
    this.trackChangesMetadata = undefined;
    this.userInfo = undefined;
    this.mathMap = undefined;
  }

  setUserColor(userInfo: any) {
    let usersColors = this.usersDataMap!.get('usersColors');
    let userId = userInfo.data.id;
    let colors:string[] = [
      '#84aff5',
      '#edeaa6',
      '#d5eda6',
      '#c7eda6',
      '#b2eda6',
      '#a6edb7',
      '#a6edce',
      '#a6edce',
      '#a6e1ed',
      '#a6d2ed',
      '#a6b8ed',
      '#b7a6ed',
      '#d3a6ed',
      '#eda6d5',
      '#eda6a6',
      '#ffeddb',
      '#fcffdb',
      '#f0ffdb',
      '#e7ffdb',
      '#dbffdc',
      '#dbfff1',
      '#dbfdff',
      '#dbeeff',
      '#dbdfff',
      '#eedbff',
      '#ffdbfb',
      '#ffdbe2',]
    if (!usersColors[userId]) {
      let newUserColor = colors[+(Math.random() * colors.length-2).toFixed(0)]
      usersColors[userId] = newUserColor;
    }
    this.usersDataMap!.set('usersColors', usersColors);

    this.userInfo.color = usersColors[userId];
  }

  init(roomName: string, userInfo: any) {
    if (!this.articleData) {
      this.serviceShare.ArticlesService?.getArticleByUuid(roomName).subscribe((res: any) => {
        this.articleData = res.data;
      })
    }
    this.roomName = roomName
    this.userInfo = userInfo;
    //@ts-ignore
    window.indexedDB.databases().then((value:any[])=>{
      value.forEach((db:{name:string,version:number})=>{
        if(db.name!==this.roomName){
          //@ts-ignore
          window.indexedDB.deleteDatabase(db.name);
        }
      })
    })
    this.providerIndexedDb = new IndexeddbPersistence(this.roomName, this.ydoc);
    let buildApp = () => {
      this.provider = new WebsocketProvider(`wss://${environment.WEBSOCKET_HOST}:${environment.WEBSOCKET_PORT}`, this.roomName, this.ydoc, {
        connect: true,
        params: {},
        WebSocketPolyfill: WebSocket,
        awareness: new awarenessProtocol.Awareness(this.ydoc),
      })
      this.provider
      this.provider.on('connection-close', function(WSClosedEvent:any){
        console.log(WSClosedEvent,(new Date()).getTime());
      });
      this.provider.on('connection-error', function(WSErrorEvent:any){
        console.log(WSErrorEvent,(new Date()).getTime());
      });
      this.provider.on('sync', (isSynced: boolean) => {
        this.buildEditor();
      })
      /* this.provider = new WebrtcProvider(this.roomName, this.ydoc, {
        signaling: ['ws://dev.scalewest.com:4444','ws://localhost:4444',  'wss://y-webrtc-signaling-eu.herokuapp.com' , 'wss://signaling.yjs.dev'  ,'wss://y-webrtc-signaling-us.herokuapp.com'],
        password: null,
        awareness: new awarenessProtocol.Awareness(this.ydoc),
        maxConns: 20 + Math.floor(random.rand() * 15),
        filterBcConns: false,
        peerOpts: {},
      }); */

      /*this.provider?.on('onChange', (docArray: any) => {
        let params = new HttpParams({
          fromObject: {
            document: docArray,
            articleId: roomName
          }
        });


         sendUpdateToServiceWorker(params.toString());
        this.http.post('/products', params).subscribe(() => {
        });
      });*/

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
        return
        // Building the editor without backend for now just for developer purpose
        let buildeditor = false
        //this.buildEditor();
        //return
        let onSubevent = fromEvent(this.provider!, 'connected').subscribe(() => {
          fromEvent(this.provider!, 'synced').pipe(delay(500)).subscribe((data: any) => {
            if (!buildeditor) {
              //let synced = this.provider?.room?.synced
              buildeditor = true
              if (data.synced) {
                this.buildEditor();
              } else {
                renderDoc(data)
              }
            }
          })
          setTimeout(() => {
            if (!buildeditor) {
              buildeditor = true
              this.buildEditor();
            }
          }, 1500)
          /*
            // render only from backednt
            this.http.get('/products/' + roomName).subscribe((data) => {
            renderDoc(data);
            })


            // race render from backend on indexdb
            */
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
      } catch (e) {
        console.error(e);
      }

      this.buildEditor();
    }
  }
}
