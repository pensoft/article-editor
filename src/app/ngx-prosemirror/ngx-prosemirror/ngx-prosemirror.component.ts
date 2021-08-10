import { Component, ElementRef, EventEmitter, Input, AfterViewInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
//@ts-ignore
import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup';
import { makeBlockMathInputRule, makeInlineMathInputRule, REGEX_INLINE_MATH_DOLLARS, REGEX_BLOCK_MATH_DOLLARS } from '@benrbray/prosemirror-math';
import { mathPlugin, mathBackspaceCmd, insertMathCmd, mathSerializer } from '@benrbray/prosemirror-math';
import { chainCommands, deleteSelection, joinBackward, selectNodeBackward } from 'prosemirror-commands';
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror';
import { columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
import { EditorState, Transaction } from 'prosemirror-state';
import { inputRules } from 'prosemirror-inputrules';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';

import { ColorDef } from 'y-prosemirror/dist/src/plugins/sync-plugin';
import { VersionsService } from './versions.service';
import { YMap } from 'yjs/dist/src/internals';
import { Slice } from 'prosemirror-model';
import { WebrtcProvider } from 'y-webrtc';
import { schema } from './utils/schema';

import { commentPlugin, commentUI, ycommentsSpec } from './utils/comment';
import { attachMenuItems, shereDialog } from './utils/menuItems'

import * as userSpec from './utils/userSpec';
import * as Y from 'yjs';
import * as random from 'lib0/random.js';

@Component({
  selector: 'ngx-prosemirror',
  templateUrl: './ngx-prosemirror.component.html',
  styleUrls: ['./ngx-prosemirror.component.scss']
})
export class NgxProsemirrorComponent implements AfterViewInit {

  @ViewChild('content', { read: ElementRef }) contentElement?: ElementRef;
  @ViewChild('editor', { read: ElementRef }) editor?: ElementRef;
  @ViewChild('commentsContainer', { read: ElementRef }) commentsContainer?: ElementRef;

  @Input() content?: string;
  @Output() contentChange = new EventEmitter();

  ydoc = new Y.Doc()
  provider = new WebrtcProvider('webrtc-test1', this.ydoc)  // webrtc-test1 druga staq za novata versiq na proekta
  type = this.ydoc.getXmlFragment('prosemirror')
  ycomments: YMap<ycommentsSpec> = this.ydoc.getMap('comments');
  view: any;
  color = random.oneOf(userSpec.colors)
  user = random.oneOf(userSpec.testUsers)

  constructor(public versionsService: VersionsService, public dialog: MatDialog) {
    shereDialog(dialog)
  }

  ngAfterViewInit() {
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

    let edState = EditorState.create({
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
        inputRules({ rules: [inlineMathInputRule, blockMathInputRule] }),
        commentPlugin,
        commentUI((transaction: Transaction) => dispatch({ type: "transaction", transaction }), this.commentsContainer, this.ycomments),
      ].concat(exampleSetup({ schema, menuContent: menu.fullMenu }))
      ,
      // @ts-ignore
      comments: { ycommets: this.ycomments, userId: this.ydoc.clientID }
    })

    this.view = new EditorView(this.editor?.nativeElement, {
      state: edState,
      clipboardTextSerializer: (slice: Slice) => { return mathSerializer.serializeSlice(slice) },
      /* dispatchTransaction: transaction => {
        const newState = view.state.apply(transaction);
        view.updateState(newState);
        this.content = defaultMarkdownSerializer.serialize(view.state.doc);
        this.contentChange.emit(this.content);
      } */
    });

    this.ycomments.observe((change)=>{
      this?.view?.dispatch(this.view.state.tr)
    })
  }
}
