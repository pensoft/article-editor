import { Component, ElementRef, EventEmitter, Input, AfterViewInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
//@ts-ignore
import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup';
import { makeBlockMathInputRule, makeInlineMathInputRule, REGEX_INLINE_MATH_DOLLARS, REGEX_BLOCK_MATH_DOLLARS } from '@benrbray/prosemirror-math';
import { mathPlugin, mathBackspaceCmd, insertMathCmd, mathSerializer } from '@benrbray/prosemirror-math';
import { chainCommands, deleteSelection, joinBackward, selectNodeBackward } from 'prosemirror-commands';
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo, yDocToProsemirrorJSON, prosemirrorJSONToYDoc } from 'y-prosemirror';
import { columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
import { EditorState, Transaction } from 'prosemirror-state';
import { inputRules } from 'prosemirror-inputrules';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';

import { ColorDef } from 'y-prosemirror/dist/src/plugins/sync-plugin';
import { VersionsService } from './versions.service';
import { YMap } from 'yjs/dist/src/internals';
import { Mark, Slice } from 'prosemirror-model';
import { WebrtcProvider } from 'y-webrtc';
import { schema } from './utils/schema';

import { commentPlugin, commentUI, ycommentsSpec } from './utils/comment';
import { attachMenuItems, shereDialog } from './utils/menuItems'

import * as userSpec from './utils/userSpec';
import * as Y from 'yjs';
import * as random from 'lib0/random.js';

//@ts-ignore
import { hideShowPlugin } from './utils/trackChanges/HideShowPlugin'
//@ts-ignore
import { trackPlugin } from './utils/trackChanges/TrackChangePlugin'
//@ts-ignore
import * as trackedTransaction from './utils/trackChanges/track-changes/index.js'
import * as awarenessProtocol from 'y-protocols/awareness.js'




@Component({
  selector: 'ngx-prosemirror',
  templateUrl: './ngx-prosemirror.component.html',
  styleUrls: ['./ngx-prosemirror.component.scss']
})
export class NgxProsemirrorComponent implements AfterViewInit {

  @ViewChild('content', { read: ElementRef }) contentElement?: ElementRef;
  @ViewChild('editor', { read: ElementRef }) editor?: ElementRef;
  @ViewChild('commentsContainer', { read: ElementRef }) commentsContainer?: ElementRef;
  @ViewChild('changesContainer', { read: ElementRef }) changesContainer?: ElementRef;

  @Input() content?: Object;
  @Output() contentChange = new EventEmitter();

  ydoc = new Y.Doc()
  ydocInit?: Y.Doc;
  provider = new WebrtcProvider('webrtc-test5', this.ydoc, {
    signaling: [/* 'wss://signaling.yjs.dev',  */'wss://y-webrtc-signaling-eu.herokuapp.com', /* 'wss://y-webrtc-signaling-us.herokuapp.com' */],
    password: null,
    awareness: new awarenessProtocol.Awareness(this.ydoc),
    maxConns: 20 + Math.floor(random.rand() * 15),
    filterBcConns: false,
    peerOpts: {},
  })  // webrtc-test1 druga staq za novata versiq na proekta
  type = this.ydoc.getXmlFragment('prosemirror')
  ycomments: YMap<ycommentsSpec> = this.ydoc.getMap('comments');
  documentLoad: YMap<{ firstInit: boolean }> = this.ydoc.getMap('docLoad');
  view?: EditorView;
  edState?: EditorState;
  color = random.oneOf(userSpec.colors)
  user = random.oneOf(userSpec.testUsers)
  initDocumnentReplace = true
  config = {};
  constructor(public versionsService: VersionsService, public dialog: MatDialog) {
    shereDialog(dialog)
  }

  ngAfterViewInit() {
    let onConnect = () => {
      setTimeout(() => {
        let con = this.provider.connected
        if (con) {
          this.ydocInit = prosemirrorJSONToYDoc(schema, this.content);

          console.log(this.documentLoad.get('data'));
          if (!this.documentLoad.get('data')) {
            this.documentLoad.set('data', { firstInit: true });
            Y.applyUpdate(this.ydoc, Y.encodeStateAsUpdate(this.ydocInit!));
          }

          let colorMapping: Map<string, ColorDef> = new Map([[this.user.username, this.color],]);
          let permanentUserData = new Y.PermanentUserData(this.ydoc)
          permanentUserData.setUserMapping(this.ydoc, this.ydoc.clientID, this.user.username)
          this.ydoc.gc = false
          let colors = userSpec.colors
          const menu = buildMenuItems(schema);

          attachMenuItems(menu);

          const dispatch = (action: any) => {
            this?.view?.dispatch(action.transaction)
          }

          let inlineMathInputRule = makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, schema.nodes.math_inline);
          let blockMathInputRule = makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, schema.nodes.math_display);

          this.edState = EditorState.create({
            schema: schema,
            plugins: [
              ySyncPlugin(this.type, { colors, colorMapping, permanentUserData }),
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
              inputRules({ rules: [inlineMathInputRule, blockMathInputRule] }),
              commentPlugin,
              commentUI((transaction: Transaction) => dispatch({ type: "transaction", transaction }), this.commentsContainer, this.ycomments),
            ].concat(exampleSetup({ schema, menuContent: menu.fullMenu }))
            ,
            // @ts-ignore
            comments: { ycommets: this.ycomments, userId: this.ydoc.clientID }
          })

          const dispatchTransaction = (transaction: Transaction) => {
            if (this.initDocumnentReplace) {
              console.log(this.initDocumnentReplace);
              let state = this?.view?.state.apply(transaction)
              this?.view?.updateState(state!);
              this.initDocumnentReplace = false;
            } else {
              const tr = trackedTransaction.default(transaction, this?.view?.state,
                {
                  userId: this.ydoc.clientID, username: this.user.username, userColor: { addition: '#72e090', deletion: '#f08989' }
                })

              let state = this?.view?.state.apply(tr)
              this?.view?.updateState(state!);

            }
          };

          this.view = new EditorView(this.editor?.nativeElement, {
            state: this?.edState!,
            clipboardTextSerializer: (slice: Slice) => { return mathSerializer.serializeSlice(slice) },
            /* dispatchTransaction: transaction => {
              const newState = view.state.apply(transaction);
              view.updateState(newState);
              this.content = defaultMarkdownSerializer.serialize(view.state.doc);
              this.contentChange.emit(this.content);
            } */
            dispatchTransaction
          });

          this.ycomments.observe((change) => {
            this?.view?.dispatch(this.view.state.tr)
          })
        } else {
          onConnect();
        }
      }, 20)
    }
    onConnect();
  }

  printDocToProsemirrorJson() {
    console.log(yDocToProsemirrorJSON(this.ydoc, 'prosemirror'));
  }

  /* acceptSelectedChange(){
    acceptChange(this.view!,this.user,this.config)
  }

  rejectSelectedChange(){
    rejectChange(this.view!,this.user,this.config)
  } */

}
