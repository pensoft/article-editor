import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
//@ts-ignore
import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup';
import {
  insertMathCmd,
  makeBlockMathInputRule,
  makeInlineMathInputRule,
  mathBackspaceCmd,
  mathPlugin,
  mathSerializer,
  REGEX_BLOCK_MATH_DOLLARS,
  REGEX_INLINE_MATH_DOLLARS
} from '@benrbray/prosemirror-math';
import { chainCommands, deleteSelection, joinBackward, selectNodeBackward } from 'prosemirror-commands';
import { redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import { columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
import { EditorState, Transaction } from 'prosemirror-state';
import { inputRules } from 'prosemirror-inputrules';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';


import { ColorDef } from 'y-prosemirror/dist/src/plugins/sync-plugin';
import { IndexeddbPersistence } from 'y-indexeddb';
import { VersionsService } from './versions.service';
import { YMap } from 'yjs/dist/src/internals';
import { Slice } from 'prosemirror-model';
//@ts-ignore
import { WebrtcProvider } from './utils/y-webrtc/index.js';
import { schema } from './utils/schema';

import { WebrtcProvider as OriginalWebRtc } from 'y-webrtc';

import { commentPlugin, commentUI, ycommentsSpec } from './utils/comment';
import { attachMenuItems, shereDialog } from './utils/menuItems';

import * as userSpec from './utils/userSpec';
import * as Y from 'yjs';
import * as random from 'lib0/random.js';

//@ts-ignore
import { hideShowPlugin } from './utils/trackChanges/HideShowPlugin';
//@ts-ignore
import { trackPlugin } from './utils/trackChanges/TrackChangePlugin';
//@ts-ignore
import * as trackedTransaction from './utils/trackChanges/track-changes/index.js';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import { SwPush, SwUpdate } from '@angular/service-worker';

import { map } from 'rxjs/operators';
import { WebsocketProvider } from 'y-websocket';


@Component({
  selector: 'ngx-prosemirror',
  templateUrl: './ngx-prosemirror.component.html',
  styleUrls: ['./ngx-prosemirror.component.scss']
})
export class NgxProsemirrorComponent implements AfterViewInit, OnDestroy {

  @ViewChild('content', { read: ElementRef }) contentElement?: ElementRef;
  @ViewChild('editor', { read: ElementRef }) editor?: ElementRef;
  @ViewChild('commentsContainer', { read: ElementRef }) commentsContainer?: ElementRef;
  @ViewChild('changesContainer', { read: ElementRef }) changesContainer?: ElementRef;

  @Input() content?: Object;
  @Output() contentChange = new EventEmitter();

  connectionLabel = 'Disconnect';
  ydoc = new Y.Doc();
  provider?: OriginalWebRtc;
  webSocketProvider?: WebsocketProvider;
  providerIndexedDb = new IndexeddbPersistence('webrtc-test99', this.ydoc);
  type = this.ydoc.getXmlFragment('prosemirror');

  ycomments: YMap<ycommentsSpec> = this.ydoc.getMap('comments');
  documentLoad?: YMap<{ firstInit: boolean }> = this.ydoc.getMap('docLoad');
  view?: EditorView;
  edState?: EditorState;
  color = random.oneOf(userSpec.colors);
  user = random.oneOf(userSpec.testUsers);
  initDocumnentReplace = true;
  config = {};
  yDocUpdates: Uint8Array[] = [];

  constructor(private swPush: SwPush, private http: HttpClient, private updates: SwUpdate, public versionsService: VersionsService, public dialog: MatDialog) {
    shereDialog(dialog);

    //localStorage.log = 'true'
    // enable logging only for y-webrtc
    localStorage.log = 'y-webrtc';
    // by specifying a regex variabless
    //localStorage.log = '^y.*'
    swPush.subscription.pipe(map((x) => console.log(x)));
    updates.available.subscribe(event => {
      console.log('current version is', event.current);
      console.log('available version is', event.available);
    });
    updates.activated.subscribe(event => {
      console.log('old version was', event.previous);
      console.log('new version is', event.current);
    });


  }

  dispatch(action: any) {
    this?.view?.dispatch(action.transaction);
  }

  ngOnDestroy() {

  }

  ngAfterViewInit() {

    window.addEventListener('online', () => {
      console.log('online');
      try {
        this.provider?.disconnect()
        this.provider?.destroy()
      } catch (e) {
        console.log(e);
      }
      this.provider = undefined;
      this.provider = new WebrtcProvider('webrtc-test99', this.ydoc, {
        signaling: [/* 'ws://dev.scalewest.com:4444' *//* 'ws://localhost:4444' */  'wss://y-webrtc-signaling-eu.herokuapp.com' /* , 'wss://signaling.yjs.dev'  ,'wss://y-webrtc-signaling-us.herokuapp.com' */],
        password: null,
        awareness: new awarenessProtocol.Awareness(this.ydoc),
        maxConns: 20 + Math.floor(random.rand() * 15),
        filterBcConns: false,
        peerOpts: {},
      });
      //this.webSocketProvider = new WebsocketProvider('ws://localhost:6687','',this.ydoc);
      this.provider?.on('onChange', (docArray: any) => {
        let params = new HttpParams({
          fromObject: { document: docArray }
        });

        let httpOptions = {
          headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
        };
        this.http.post('http://18.196.139.28:8000/products', params, httpOptions).subscribe(() => {
        });
      });


    });

    window.addEventListener('offline', () => {
      this.webSocketProvider = undefined;
    });
    //console.log(this.provider);
    let onConnect = () => {
      setTimeout(() => {
        let connceted = false;
        this.provider?.signalingConns?.forEach((conn: any) => {
          if (conn.connected) {
            renderDoc();
            connceted = true;
          }
        });
        if (!connceted) {
          onConnect();
        }
      }, 20);
    };

    let buildApp = () => {
      if (!navigator.onLine) {
        this.buildEditorOffline();
      } else {

        this.provider = new WebrtcProvider('webrtc-test99', this.ydoc, {
          signaling: [/* 'ws://dev.scalewest.com:4444' *//* 'ws://localhost:4444' */  'wss://y-webrtc-signaling-eu.herokuapp.com' /* , 'wss://signaling.yjs.dev'  ,'wss://y-webrtc-signaling-us.herokuapp.com' */],
          password: null,
          awareness: new awarenessProtocol.Awareness(this.ydoc),
          maxConns: 20 + Math.floor(random.rand() * 15),
          filterBcConns: false,
          peerOpts: {},
        });
        //this.webSocketProvider = new WebsocketProvider('ws://localhost:6687','',this.ydoc);
        this.provider?.on('onChange', (docArray: any) => {
          let params = new HttpParams({
            fromObject: { document: docArray }
          });

          let httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
          };
          this.http.post('http://18.196.139.28:8000/products', params, httpOptions).subscribe(() => {
          });
        });
        onConnect();
      }
      this.ydoc.on('update', (update: any, origin: any) => {
        console.log(update, origin);
      })
    }
    if (this.providerIndexedDb.synced) {
      buildApp()
    } else {
      this.providerIndexedDb.on('synced', () => {
        buildApp()
      })
    }

    let renderDoc = () => {
      this.http.get('http://18.196.139.28:8000/products')
        .subscribe((data: any) => {
          let currentState1: any;
          try {
            const documents = data.map((item: any) => Uint8Array.from(item.document.split(',')))
            documents.forEach((doc: any) => {
              Y.applyUpdate(this.ydoc, doc);
            })
          } catch (e) {
            console.log('ERROR:', e);
            console.log('The editor was loaded with local document');
          }

          this.buildEditor();
        }, (error) => {
          console.log("ERROR", error);
          console.log("Editor build with local document");
          this.buildEditor();
        }
        );
  };
}

buildEditorOffline = () => {
  let colorMapping: Map<string, ColorDef> = new Map([[this.user.username, this.color],]);
  let permanentUserData = new Y.PermanentUserData(this.ydoc);
  permanentUserData.setUserMapping(this.ydoc, this.ydoc.clientID, this.user.username);
  this.ydoc.gc = false;
  let colors = userSpec.colors;
  const menu = buildMenuItems(schema);

  attachMenuItems(menu);

  const dispatch = (action: any) => {
    this?.view?.dispatch(action.transaction);
  };

  let inlineMathInputRule = makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, schema.nodes.math_inline);
  let blockMathInputRule = makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, schema.nodes.math_display);

  this.edState = EditorState.create({
    schema: schema,
    plugins: [
      ySyncPlugin(this.type, { colors, colorMapping, permanentUserData }),
      yUndoPlugin(),
      mathPlugin,
      keymap({
        'Mod-z': undo,
        'Mod-y': redo,
        'Mod-Shift-z': redo,
        'Mod-Space': insertMathCmd(schema.nodes.math_inline),
        'Backspace': chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
        'Tab': goToNextCell(1),
        'Shift-Tab': goToNextCell(-1)
      }),
      columnResizing({}),
      tableEditing(),
      trackPlugin,
      hideShowPlugin(this.changesContainer?.nativeElement),
      inputRules({ rules: [inlineMathInputRule, blockMathInputRule] }),
      commentPlugin,
      commentUI((transaction: Transaction) => dispatch({ type: 'transaction', transaction }), this.commentsContainer, this.ycomments),
    ].concat(exampleSetup({ schema, menuContent: menu.fullMenu }))
    ,
    // @ts-ignore
    comments: { ycommets: this.ycomments, userId: this.ydoc.clientID }
  });
  const dispatchTransaction = (transaction: Transaction) => {
    //console.log(transaction.steps);
    if (this.initDocumnentReplace) {
      let state = this?.view?.state.apply(transaction);
      this?.view?.updateState(state!);
      this.initDocumnentReplace = false;
    } else {
      /* if (transaction.steps.length != 0) {
        console.log(transaction.steps);
      } */
      const tr = trackedTransaction.default(transaction, this?.view?.state,
        {
          userId: this.ydoc.clientID, username: this.user.username, userColor: { addition: '#72e090', deletion: '#f08989' }
        });

      /* if (transaction.steps.length != 0) {
        console.log(tr.steps);
      } */
      try {
        let state = this?.view?.state.apply(tr);
        this?.view?.updateState(state!);
      } catch (err) {
        console.log(err);
      }
    }
  };

  this.view = new EditorView(this.editor?.nativeElement, {
    state: this?.edState!,
    clipboardTextSerializer: (slice: Slice) => {
      return mathSerializer.serializeSlice(slice);
    },
    /* dispatchTransaction: transaction => {
      const newState = view.state.apply(transaction);
      view.updateState(newState);
      this.content = defaultMarkdownSerializer.serialize(view.state.doc);
      this.contentChange.emit(this.content);
    } */
    dispatchTransaction
  });

  this.ycomments.observe((change) => {
    this?.view?.dispatch(this.view.state.tr);
  });
};

buildEditor = () => {

  let colorMapping: Map<string, ColorDef> = new Map([[this.user.username, this.color],]);
  let permanentUserData = new Y.PermanentUserData(this.ydoc);
  permanentUserData.setUserMapping(this.ydoc, this.ydoc.clientID, this.user.username);
  this.ydoc.gc = false;
  let colors = userSpec.colors;
  const menu = buildMenuItems(schema);

  attachMenuItems(menu);

  const dispatch = (action: any) => {
    this?.view?.dispatch(action.transaction);
  };

  let inlineMathInputRule = makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, schema.nodes.math_inline);
  let blockMathInputRule = makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, schema.nodes.math_display);

  this.edState = EditorState.create({
    schema: schema,
    plugins: [
      ySyncPlugin(this.type, { colors, colorMapping, permanentUserData }),
      yCursorPlugin(this.provider!.awareness),
      yUndoPlugin(),
      mathPlugin,
      keymap({
        'Mod-z': undo,
        'Mod-y': redo,
        'Mod-Shift-z': redo,
        'Mod-Space': insertMathCmd(schema.nodes.math_inline),
        'Backspace': chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
        'Tab': goToNextCell(1),
        'Shift-Tab': goToNextCell(-1)
      }),
      columnResizing({}),
      tableEditing(),
      trackPlugin,
      hideShowPlugin(this.changesContainer?.nativeElement),
      inputRules({ rules: [inlineMathInputRule, blockMathInputRule] }),
      commentPlugin,
      commentUI((transaction: Transaction) => dispatch({ type: 'transaction', transaction }), this.commentsContainer, this.ycomments),
    ].concat(exampleSetup({ schema, menuContent: menu.fullMenu }))
    ,
    // @ts-ignore
    comments: { ycommets: this.ycomments, userId: this.ydoc.clientID }
  });
  const dispatchTransaction = (transaction: Transaction) => {
    //console.log(transaction.steps);
    if (this.initDocumnentReplace) {
      let state = this?.view?.state.apply(transaction);
      this?.view?.updateState(state!);
      this.initDocumnentReplace = false;
    } else {
      /* if (transaction.steps.length != 0) {
        console.log(transaction.steps);
      } */
      const tr = trackedTransaction.default(transaction, this?.view?.state,
        {
          userId: this.ydoc.clientID, username: this.user.username, userColor: { addition: '#72e090', deletion: '#f08989' }
        });

      /* if (transaction.steps.length != 0) {
        console.log(tr.steps);
      } */
      try {
        let state = this?.view?.state.apply(tr);
        this?.view?.updateState(state!);
      } catch (err) {
        console.log(err);
      }
    }
  };

  this.view = new EditorView(this.editor?.nativeElement, {
    state: this?.edState!,
    clipboardTextSerializer: (slice: Slice) => {
      return mathSerializer.serializeSlice(slice);
    },
    /* dispatchTransaction: transaction => {
      const newState = view.state.apply(transaction);
      view.updateState(newState);
      this.content = defaultMarkdownSerializer.serialize(view.state.doc);
      this.contentChange.emit(this.content);
    } */
    dispatchTransaction
  });

  this.ycomments.observe((change) => {
    this?.view?.dispatch(this.view.state.tr);
  });
};


printDocToProsemirrorJson() {
  /* fetch('http://localhost:3000/documentInitStatus/firstInit', {
      method: 'GET'
    }).then(function (response) {
      console.log(response);
    }).catch(function (err) {
      console.log(err);
    });
  let ifConnected = window.navigator.onLine */
  /* let currentState1 = Y.encodeStateAsUpdate(this.ydoc) //backend state 
  let currentState2 = Y.encodeStateAsUpdate(this.localYdoc)  //local state 

  const stateVector1 = Y.encodeStateVectorFromUpdate(currentState1)
  const stateVector2 = Y.encodeStateVectorFromUpdate(currentState2)

  const diff1 = Y.diffUpdate(currentState1, stateVector2)
  const diff2 = Y.diffUpdate(currentState2, stateVector1)

  currentState1 = Y.mergeUpdates([currentState1, diff2])
  currentState1 = Y.mergeUpdates([currentState1, diff1])

  Y.applyUpdate(this.ydoc, currentState1)
  Y.applyUpdate(this.localYdoc, currentState1)

  console.log(this.ydoc);
  console.log(this.localYdoc);
  this.ydocInit = this.ydocInit */
  let docArray = Array.from(Y.encodeStateAsUpdate(this.ydoc));
  console.log(docArray.toString());
  /* console.log('origin', Y.encodeStateAsUpdate(this.ydoc));

  console.log('toSting', Y.encodeStateAsUpdate(this.ydoc).toString());
  console.log('array', docArray); */
  let params = new HttpParams({
    fromObject: { document: docArray.join(',') }
  });

  let httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
  };

  /*return this.http.post(`${this.url}/usuario/signup`, params.toString(), httpOptions).pipe(
    map(
      (resp) => {

        console.log('return http', resp);
        return resp;
      },
      (error) => {
        console.log('return http error', error);
        return error;
      }
    )
  );*/
  let newUpdate = {
    date: Date.now(),

  };
  this.http.patch('http://18.196.139.28:8000/products/6127f200ed07591f0c7068c2', params, httpOptions).subscribe((res: any) => {
    console.log(res);
  });

  //console.log(Uint8Array.from(Array.from(el)));

  /* let conetent = {}
  Object.entries(this.ydoc.share).forEach((el)=>{
    console.log(el);
  })
  this.ydoc.share.forEach((value)=>{
    
    console.log(value.toJSON());
  }) */
  //console.log(yDocToProsemirrorJSON(this.ydoc, 'prosemirror'));
}

connectDisconnect() {
  if (this.provider?.shouldConnect) {
    this.provider?.disconnect();
    this.connectionLabel = 'Connect';
  } else {
    this.provider?.connect();
    this.provider = new WebrtcProvider('webrtc-test9', this.ydoc, {
      signaling: [/* 'wss://signaling.yjs.dev',  */'wss://y-webrtc-signaling-eu.herokuapp.com', /* 'wss://y-webrtc-signaling-us.herokuapp.com' */],
      password: null,
      awareness: new awarenessProtocol.Awareness(this.ydoc),
      maxConns: 20 + Math.floor(random.rand() * 15),
      filterBcConns: false,
      peerOpts: {},
    });
    this.connectionLabel = 'Disconnect';

  }
}

  /* acceptSelectedChange(){
    acceptChange(this.view!,this.user,this.config)
  }

  rejectSelectedChange(){
    rejectChange(this.view!,this.user,this.config)
  } */

}
