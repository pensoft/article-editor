import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
//@ts-ignore
import {buildMenuItems, exampleSetup} from 'prosemirror-example-setup';
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
import {chainCommands, deleteSelection, joinBackward, selectNodeBackward} from 'prosemirror-commands';
import {redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin} from 'y-prosemirror';
import {columnResizing, goToNextCell, tableEditing} from 'prosemirror-tables';
import {EditorState, Transaction} from 'prosemirror-state';
import {inputRules} from 'prosemirror-inputrules';
import {EditorView} from 'prosemirror-view';
import {keymap} from 'prosemirror-keymap';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';


import {ColorDef} from 'y-prosemirror/dist/src/plugins/sync-plugin';
import {IndexeddbPersistence} from 'y-indexeddb';
import {VersionsService} from './versions.service';
import {YMap} from 'yjs/dist/src/internals';
import {Slice} from 'prosemirror-model';
//@ts-ignore
import {WebrtcProvider} from './utils/y-webrtc/index.js';
import {schema} from './utils/schema';

import {WebrtcProvider as OriginalWebRtc} from 'y-webrtc';

import {commentPlugin, commentUI, ycommentsSpec} from './utils/comment';
import {attachMenuItems, shereDialog} from './utils/menuItems';

import * as userSpec from './utils/userSpec';
import * as Y from 'yjs';
import * as random from 'lib0/random.js';

//@ts-ignore
import {hideShowPlugin} from './utils/trackChanges/HideShowPlugin';
//@ts-ignore
import {trackPlugin} from './utils/trackChanges/TrackChangePlugin';
//@ts-ignore
import * as trackedTransaction from './utils/trackChanges/track-changes/index.js';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import {SwPush, SwUpdate} from '@angular/service-worker';

import {map} from 'rxjs/operators';


@Component({
  selector: 'ngx-prosemirror',
  templateUrl: './ngx-prosemirror.component.html',
  styleUrls: ['./ngx-prosemirror.component.scss']
})
export class NgxProsemirrorComponent implements AfterViewInit, OnDestroy {

  @ViewChild('content', {read: ElementRef}) contentElement?: ElementRef;
  @ViewChild('editor', {read: ElementRef}) editor?: ElementRef;
  @ViewChild('commentsContainer', {read: ElementRef}) commentsContainer?: ElementRef;
  @ViewChild('changesContainer', {read: ElementRef}) changesContainer?: ElementRef;

  @Input() content?: Object;
  @Output() contentChange = new EventEmitter();

  connectionLabel = 'Disconnect';
  ydoc = new Y.Doc();
  localYdoc = new Y.Doc();
  ydocInit?: Y.Doc;
  provider: OriginalWebRtc = new WebrtcProvider('webrtc-test8', this.ydoc, {
    signaling: [/* 'ws://dev.scalewest.com:4444' *//* 'ws://localhost:4444' */  'wss://y-webrtc-signaling-eu.herokuapp.com' /* , 'wss://signaling.yjs.dev'  ,'wss://y-webrtc-signaling-us.herokuapp.com' */],
    password: null,
    awareness: new awarenessProtocol.Awareness(this.ydoc),
    maxConns: 20 + Math.floor(random.rand() * 15),
    filterBcConns: false,
    peerOpts: {},
  });
  providerIndexedDb = new IndexeddbPersistence('webrtc-test8', this.localYdoc);
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
    let obj = {
      peers: JSON.stringify(this.provider.room!.webrtcConns),
      synced: JSON.stringify(this.provider.room?.synced),
      shouldConnect: JSON.stringify(this.provider.shouldConnect),
      connected: JSON.stringify(this.provider.connected),
    };
  }

  ngAfterViewInit() {
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
    onConnect();
    let renderDoc = () => {
      console.log(this.provider.room!.webrtcConns.size);
      /* this.http.get('http://localhost:3000/initStatus/fitstInit').subscribe((data) => {
        console.log(data);
      }) */
      if (navigator.onLine) {

        if (this.provider.room!.webrtcConns.size == 0) {
          this.http.get('http://18.196.139.28:8000/products')
            .subscribe((data: any) => {
              if (data.length) {
                let currentState1 = Uint8Array.from(data[0].document.split(','));  //backend state
                let currentState2 = Y.encodeStateAsUpdate(this.localYdoc);  //local state

                //console.log(currentState1);
                //console.log(currentState2);
                console.log(this.provider);

                let stateVector1 = Y.encodeStateVectorFromUpdate(currentState1);
                let stateVector2 = Y.encodeStateVectorFromUpdate(currentState2);

                const diff1 = Y.diffUpdate(currentState1, stateVector2);
                const diff2 = Y.diffUpdate(currentState2, stateVector1);

                currentState1 = Y.mergeUpdates([currentState1, diff2]);
                currentState1 = Y.mergeUpdates([currentState1, diff1]);

                Y.applyUpdate(this.ydoc, currentState1);
                Y.applyUpdate(this.localYdoc, currentState1);
              }
              //console.log(Y.encodeStateAsUpdate(this.ydoc));
              //console.log(Y.encodeStateAsUpdate(this.localYdoc));
              //console.log(this.ydoc);   //merged document

              this.buildEditor();
            });
        } else {
          this.provider.on('synced', (e: any) => {
            console.log('synced');
            console.log(Y.encodeStateAsUpdate(this.ydoc));
            let currentState1 = Y.encodeStateAsUpdate(this.ydoc); //backend state
            let currentState2 = Y.encodeStateAsUpdate(this.localYdoc);  //local state

            const stateVector1 = Y.encodeStateVectorFromUpdate(currentState1);
            const stateVector2 = Y.encodeStateVectorFromUpdate(currentState2);

            const diff1 = Y.diffUpdate(currentState1, stateVector2);
            const diff2 = Y.diffUpdate(currentState2, stateVector1);

            currentState1 = Y.mergeUpdates([currentState1, diff2]);
            currentState1 = Y.mergeUpdates([currentState1, diff1]);

            Y.applyUpdate(this.ydoc, currentState1);
            Y.applyUpdate(this.localYdoc, currentState1);


            //console.log(Y.encodeStateAsUpdate(this.ydoc));
            //console.log(Y.encodeStateAsUpdate(this.localYdoc));
            this.buildEditor();
          });
        }

      } else {
        console.log('offline');
        let currentState1 = Y.encodeStateAsUpdate(this.ydoc);
        let currentState2 = Y.encodeStateAsUpdate(this.localYdoc);

        const stateVector1 = Y.encodeStateVectorFromUpdate(currentState1);
        const stateVector2 = Y.encodeStateVectorFromUpdate(currentState2);

        const diff1 = Y.diffUpdate(currentState1, stateVector2);
        const diff2 = Y.diffUpdate(currentState2, stateVector1);

        currentState1 = Y.mergeUpdates([currentState1, diff2]);
        currentState1 = Y.mergeUpdates([currentState1, diff1]);

        Y.applyUpdate(this.ydoc, currentState1);
        Y.applyUpdate(this.localYdoc, currentState1);

        this.buildEditor();

      }
      this.ydoc.on('update', (update: Uint8Array) => {
        Y.applyUpdate(this.localYdoc, update);
      });
    };

  }

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
        ySyncPlugin(this.type, {colors, colorMapping, permanentUserData}),
        yCursorPlugin(this.provider.awareness),
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
        inputRules({rules: [inlineMathInputRule, blockMathInputRule]}),
        commentPlugin,
        commentUI((transaction: Transaction) => dispatch({type: 'transaction', transaction}), this.commentsContainer, this.ycomments),
      ].concat(exampleSetup({schema, menuContent: menu.fullMenu}))
      ,
      // @ts-ignore
      comments: {ycommets: this.ycomments, userId: this.ydoc.clientID}
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
            userId: this.ydoc.clientID, username: this.user.username, userColor: {addition: '#72e090', deletion: '#f08989'}
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
      fromObject: {document: docArray.join(',')}
    });

    let httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'}),
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
      this.provider?.destroy();
      this.provider = new WebrtcProvider('webrtc-test2', this.ydoc, {
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
