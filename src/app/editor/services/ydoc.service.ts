import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
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
import { YMap, YMapEvent } from 'yjs/dist/src/internals';
import { treeNode } from '../utils/interfaces/treeNode';
import { uuidv4 } from "lib0/random";
import { articleSection, editorData, taxonomicCoverageContentData } from '../utils/interfaces/articleSection';
import { articleBasicStructure } from '../utils/articleBasicStructure';
import { DetectFocusService } from '../utils/detectFocusPlugin/detect-focus.service';
import { threadId } from 'worker_threads';
import { ServiceShare } from './service-share.service';
import { ArticlesService } from '@app/core/services/articles.service';
import { CDK_DRAG_HANDLE } from '@angular/cdk/drag-drop';
import { Transaction as YTransaction } from 'yjs';
import { layoutMenuAndSchemaSettings, mapSchemaDef } from '../utils/fieldsMenusAndScemasFns';
import { fn } from '@angular/compiler/src/output/output_ast.js';

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
    private articleService: ArticlesService
  ) {
    this.serviceShare.shareSelf('YdocService', this)
  }
  articleStructureFromBackend: any
  articleStructure?: YMap<any>
  articleData: any;
  sectionFormGroupsStructures?: YMap<any>
  comments?: YMap<any>
  creatingANewArticle = false
  figuresMap?: YMap<any>
  citableElementsMap?:YMap<any>
  tablesMap?: YMap<any>
  supplementaryFilesMap?:YMap<any>
  endNotesMap?:YMap<any>
  trackChangesMetadata?: YMap<any>
  usersDataMap?: YMap<any>
  mathMap?: YMap<any>
  referenceCitationsMap?: YMap<any>;
  printMap?: YMap<any>
  customSectionProps?: YMap<any>
  collaborators?: YMap<any>
  PMMenusAndSchemasDefsMap?: YMap<any>
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

  saveSectionMenusAndSchemasDefs(sectionStructure:articleSection[]){
    let menusAndSchemasDefs = this.PMMenusAndSchemasDefsMap?.get('menusAndSchemasDefs');
    let loopSection = (section:articleSection,fn:any)=>{
      if(section.children&&section.children.length>0){
        section.children.forEach((child)=>{
          loopSection(child,fn);
        })
      }
      fn(section)
    }
    sectionStructure.forEach(section => loopSection(section,(section:articleSection)=>{
      if(
        section.menusAndSchemasDefs&&
        (section.menusAndSchemasDefs.menus||section.menusAndSchemasDefs.schemas)&&
        (Object.keys(section.menusAndSchemasDefs.menus).length>0||Object.keys(section.menusAndSchemasDefs.schemas).length>0)
      ){
        menusAndSchemasDefs[section.sectionID] = section.menusAndSchemasDefs;
      }
    }))
    this.PMMenusAndSchemasDefsMap?.set('menusAndSchemasDefs',menusAndSchemasDefs);
  }

  getData(): ydocData {
    let articleSectionsStructure: articleSection[] = this.articleStructure?.get('articleSectionsStructure')
    let articleSectionsStructureFlat: articleSection[] = this.articleStructure?.get('articleSectionsStructureFlat');
    let citatsObj = this.figuresMap!.get('articleCitatsObj');
    let tableCitatsObj = this.tablesMap!.get('tableCitatsObj');
    try {

      if (articleSectionsStructure == undefined) {
        citatsObj = {}
        tableCitatsObj = {}
        articleSectionsStructureFlat = []

        articleSectionsStructure = this.articleStructureFromBackend || articleBasicStructure

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
        this.saveSectionMenusAndSchemasDefs(articleSectionsStructure)
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
      if (!tableCitatsObj) {
        tableCitatsObj = {}
        articleSectionsStructureFlat.forEach((section) => {
          tableCitatsObj[section.sectionID] = {} // citats obj [key:string](citateID):{citatedFigures:[](citated figures-Ids),posiition:number(citatePosition)}

        })
        this.tablesMap!.set('tableCitatsObj', tableCitatsObj);
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

  turnOnOffPreviewModeEditorFn: () => void

  buildLayoutMenusAndSchemasDefs(){
    /* adding layout menu and schema definitios should be removed when backend is done  */
    this.articleData.layout.menusAndSchemasSettings = layoutMenuAndSchemaSettings
    let defs = this.articleData.layout.menusAndSchemasSettings
    let layoutMapedDefs = {menus:{},schemas:{}};
    if(defs&&(defs.menus||defs.schemas)){
      if(defs.menus){
        Object.keys(defs.menus).forEach((menuKey)=>{
          layoutMapedDefs.menus[menuKey] = defs.menus[menuKey]
        })
      }
      if(defs.schemas){
        Object.keys(defs.schemas).forEach((schemaKey)=>{
          layoutMapedDefs.schemas[schemaKey] = mapSchemaDef(defs.schemas[schemaKey])
        })
      }
    }
    return {layoutDefinitions:layoutMapedDefs}
  }

  buildEditor() {
    this.sectionFormGroupsStructures = this.ydoc.getMap('sectionFormGroupsStructures');
    this.citableElementsMap = this.ydoc.getMap('citableElementsMap');

    this.figuresMap = this.ydoc.getMap('ArticleFiguresMap');
    this.tablesMap = this.ydoc.getMap('ArticleTablesMap');
    this.supplementaryFilesMap = this.ydoc.getMap('supplementaryFilesMap');
    this.endNotesMap = this.ydoc.getMap('endNotesMap');

    this.provider?.awareness.setLocalStateField('userInfo', this.userInfo);

    let figuresNumbers = this.figuresMap!.get('ArticleFiguresNumbers');
    let figuresTemplates = this.figuresMap!.get('figuresTemplates');
    let figures = this.figuresMap!.get('ArticleFigures');

    let tablesNumbers = this.tablesMap!.get('ArticleTablesNumbers');
    let tablesTemplates = this.tablesMap!.get('tablesTemplates');
    let tables = this.tablesMap!.get('ArticleTables');

    let supplementaryFiles = this.supplementaryFilesMap.get('supplementaryFiles');
    let supplementaryFilesTemplates = this.supplementaryFilesMap.get('supplementaryFilesTemplates');
    let supplementaryFilesNumbers = this.supplementaryFilesMap.get('supplementaryFilesNumbers');

    let endNotes = this.endNotesMap.get('endNotes');
    let endNotesNumbers = this.endNotesMap.get('endNotesNumbers');
    let endNotesTemplates = this.endNotesMap.get('endNotesTemplates');

    this.usersDataMap = this.ydoc.getMap('userDataMap')
    this.mathMap = this.ydoc.getMap('mathDataURLMap');
    this.printMap = this.ydoc.getMap('print');
    this.customSectionProps = this.ydoc.getMap('customSectionProps');
    let pdfSettings = this.printMap.get('pdfPrintSettings')
    let mathObj = this.mathMap.get('dataURLObj')
    let usersColors = this.usersDataMap.get('usersColors');
    this.referenceCitationsMap = this.ydoc.getMap('referenceCitationsMap');
    let references = this.referenceCitationsMap?.get('references')
    let referencesInEditor = this.referenceCitationsMap?.get('referencesInEditor')
    let externalRefs = this.referenceCitationsMap?.get('externalRefs');
    let localRefs = this.referenceCitationsMap?.get('localRefs');
    let customPropsObj = this.customSectionProps?.get('customPropsObj');
    let elementsCitations = this.citableElementsMap?.get('elementsCitations');

    this.PMMenusAndSchemasDefsMap = this.ydoc.getMap('PMMenusAndSchemasDefsMap');
    let menusAndSchemasDefs = this.PMMenusAndSchemasDefsMap?.get('menusAndSchemasDefs');

    if(!endNotesTemplates){
      this.endNotesMap.set('endNotesTemplates',{})
    }
    if(!supplementaryFilesTemplates){
      this.supplementaryFilesMap.set('supplementaryFilesTemplates',{})
    }
    if(!endNotes){
      this.endNotesMap.set('endNotes',{})
    }
    if (!endNotesNumbers) {
      this.endNotesMap?.set('endNotesNumbers', [])
    }
    if(!supplementaryFiles){
      this.supplementaryFilesMap.set('supplementaryFiles',{})
    }
    if (!supplementaryFilesNumbers) {
      this.supplementaryFilesMap?.set('supplementaryFilesNumbers', [])
    }
    if(!menusAndSchemasDefs){
      this.PMMenusAndSchemasDefsMap.set('menusAndSchemasDefs',this.buildLayoutMenusAndSchemasDefs())
    }
    if(!elementsCitations){
      this.citableElementsMap.set('elementsCitations',{})
    }
    if (!customPropsObj) {
      this.customSectionProps?.set('customPropsObj', {})
    }
    if (!localRefs) {
      this.referenceCitationsMap?.set('localRefs', {})
    }
    if (!externalRefs) {
      this.referenceCitationsMap?.set('externalRefs', {})
    }
    if (!references) {
      this.referenceCitationsMap?.set('references', {})
    }
    if (!referencesInEditor) {
      this.referenceCitationsMap?.set('referencesInEditor', {})
    }
    if (!usersColors) {
      this.usersDataMap.set('usersColors', {});
    }
    this.setUserColor(this.userInfo);

    if (!pdfSettings) {
      let pdfPrintSettings = (
        this.articleData &&
        this.articleData.layout &&
        this.articleData.layout.settings &&
        this.articleData.layout.settings.print_settings
      ) ? this.articleData.layout.settings.print_settings : {}
      this.printMap.set('pdfPrintSettings', pdfPrintSettings)
    }
    if (!figures) {
      this.figuresMap!.set('ArticleFigures', {})
    }
    if (!figuresTemplates) {
      this.figuresMap!.set('figuresTemplates', {})
    }
    if (!figuresNumbers) {
      this.figuresMap!.set('ArticleFiguresNumbers', []);
    }
    if (!tables) {
      this.tablesMap!.set('ArticleTables', {})
    }
    if (!tablesTemplates) {
      this.tablesMap!.set('tablesTemplates', {})
    }
    if (!tablesNumbers) {
      this.tablesMap!.set('ArticleTablesNumbers', []);
    }
    if (!mathObj) {
      this.mathMap!.set('dataURLObj', {});
    }

    this.articleStructure = this.ydoc.getMap('articleStructure');
    this.trackChangesMetadata = this.ydoc.getMap('trackChangesMetadata');
    let trackChangesData = this.trackChangesMetadata?.get('trackChangesMetadata')
    if (!trackChangesData) {
      this.trackChangesMetadata?.set('trackChangesMetadata', { trackTransactions: false });
    }
    this.comments = this.ydoc.getMap('comments');
    this.collaborators = this.ydoc.getMap('articleCollaborators');
    this.collaborators.observe(this.observeCollaboratorsFunc);
    this.checkIfUserIsInArticle()
    if (this.shouldSetTheOwnerForTheNewArticle) {
      this.setArticleOwnerInfo()
    }
    this.ydocStateObservable.next('docIsBuild');
    this.getData()
    this.editorIsBuild = true;
  }

  curUserRole: string
  currUserRoleSubject = new Subject()
  checkIfUserIsInArticle() {
    let userinfo = this.userInfo.data;
    let currUserEmail = userinfo.email;
    if (this.shouldSetTheOwnerForTheNewArticle) {
      this.setArticleOwnerInfo()
    }
    let collaborators = this.collaborators.get('collaborators').collaborators as any[]
    let userInArticle = collaborators.find((user) => user.email == currUserEmail)
    this.serviceShare.EnforcerService.enforceAsync('is-admin','admin-can-do-anything').subscribe((admin)=>{
      if(admin){
        userInArticle = {role:'Owner',email:'mincho@scalewest.com'};
      }
      if (!userInArticle) {
        this.serviceShare.openNotAddedToEditorDialog()
      } else {
        if (this.curUserRole && this.curUserRole != userInArticle.role) {
          this.serviceShare.openNotifyUserRoleChangeDialog(this.curUserRole, userInArticle.role)
        }
        this.curUserRole = userInArticle.role;
        this.currUserRoleSubject.next(userInArticle);
      }
    })
  }

  collaboratorsSubject = new Subject()
  observeCollaboratorsFunc = (event: YMapEvent<any>, transaction: YTransaction) => {
    let collaboratorsData = this.collaborators.get('collaborators')
    if (collaboratorsData) {
      this.checkIfUserIsInArticle()
    }
    this.collaboratorsSubject.next(collaboratorsData)
  }

  setArticleData(articleData: any) {
    this.articleData = articleData;
    //this.articleData.layout.citation_style.style_updated = Date.now()
    this.creatingANewArticle = true;
    this.checkLastTimeUpdated();
  }

  checkLastTimeUpdated() {
    if (new Date(this.articleData.updated_at).toDateString() !== new Date().toDateString()) {
      this.articleService.updateArticleUpdatedAt(this.articleData).subscribe((res) => {
      });
    }
  }

  resetYdoc() {

    this.editorIsBuild = false;
    this.curUserRole = undefined
    this.ydoc = new Y.Doc();

    if (this.provider) {
      this.provider.awareness.destroy();
      this.provider.destroy();
    }
    this.provider = undefined;
    this.roomName = 'webrtc-test3';
    if (this.providerIndexedDb) {
      this.providerIndexedDb.destroy();
    }
    this.providerIndexedDb = undefined;

    //this.articleStructureFromBackend = undefined;
    this.articleStructure = undefined;
    this.articleData = undefined;
    this.sectionFormGroupsStructures = undefined;
    this.comments = undefined;
    this.PMMenusAndSchemasDefsMap = undefined
    this.figuresMap = undefined;
    this.tablesMap = undefined;
    this.trackChangesMetadata = undefined;
    this.userInfo = undefined;
    this.creatingANewArticle = false;
    this.mathMap = undefined;
    this.referenceCitationsMap = undefined;
    this.printMap = undefined;
    this.customSectionProps = undefined;
    if (this.collaborators) {
      this.collaborators.unobserve(this.observeCollaboratorsFunc);
    }
    this.collaborators = undefined;
  }

  setUserColor(userInfo: any) {
    let usersColors = this.usersDataMap!.get('usersColors');
    let userId = userInfo.data.id;
    let colors: string[] = [
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
      let newUserColor = colors[+(Math.random() * colors.length - 2).toFixed(0)]
      usersColors[userId] = newUserColor;
    }
    this.usersDataMap!.set('usersColors', usersColors);

    this.userInfo.color = usersColors[userId];
  }

  init(roomName: string, userInfo: any,articleData:any) {
    if (!this.articleData) {
      this.articleData = articleData
    }
    this.roomName = roomName
    this.userInfo = userInfo;
    //@ts-ignore
    window.indexedDB.databases().then((value: any[]) => {
      value.forEach((db: { name: string, version: number }) => {
        if (db.name !== this.roomName) {
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
      /* this.provider = new WebsocketProvider(`ws://localhost:9182`, this.roomName, this.ydoc, {
        connect: true,
        params: {},
        WebSocketPolyfill: WebSocket,
        awareness: new awarenessProtocol.Awareness(this.ydoc),
      } )*/
      this.provider
      this.provider.on('connection-close', function (WSClosedEvent: any) {
        console.log("---", WSClosedEvent, (new Date()).getTime());
      });
      this.provider.on('connection-error', function (WSErrorEvent: any) {
        console.log("---", WSErrorEvent, (new Date()).getTime());
      });
      this.provider.on('synced', (isSynced: boolean) => {
        let checkSyncStatus = setInterval(() => {
          if (this.ydoc.store.clients.size !== 0 || this.ydoc.getXmlFragment().length > 0 || this.creatingANewArticle) {
            setTimeout(() => {
              this.buildEditor();
            }, 1000)
            clearInterval(checkSyncStatus)
          }
        }, 500)
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

  shouldSetTheOwnerForTheNewArticle = false
  ownerInfo: any
  newArticleId: string = ''

  newArticleIsCreated(user: any, articleId: string) {
    this.shouldSetTheOwnerForTheNewArticle = true
    this.ownerInfo = user
    this.newArticleId = articleId
  }

  setArticleOwnerInfo() {
    this.shouldSetTheOwnerForTheNewArticle = false
    if (this.roomName == this.newArticleId) {
      this.collaborators.set('collaborators', { collaborators: [{ ...this.ownerInfo.data, role: 'Owner' }] });
    }
    this.ownerInfo = undefined
    this.newArticleId = ''
  }


}
