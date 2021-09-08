import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { YArray } from 'yjs/dist/src/internals';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { sectionNode } from '../utils/interfaces/section-node'
import { ColorDef } from 'y-prosemirror/dist/src/plugins/sync-plugin';
import { editorContainer } from '../utils/interfaces/editor-container';
import * as random from 'lib0/random.js';
import * as userSpec from '../utils/userSpec';
//@ts-ignore
import { buildMenuItems, exampleSetup } from '../utils/prosemirror-example-setup-master/src/index.js';
import { schema } from '../utils/schema';
import { attachMenuItems, shereDialog } from '../utils/menuItems';
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
import { EditorView } from 'prosemirror-view';
import { EditorState, Transaction } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { yCursorPlugin, yUndoPlugin, redo, undo, ySyncPlugin } from 'y-prosemirror';
import { chainCommands, deleteSelection, joinBackward, selectNodeBackward } from 'prosemirror-commands';
import { columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
//@ts-ignore
import { hideShowPlugin } from '../utils/trackChanges/HideShowPlugin';
//@ts-ignore
import { trackPlugin } from '../utils/trackChanges/TrackChangePlugin';
//@ts-ignore
import * as trackedTransaction from '../utils/trackChanges/track-changes/index.js';
import { CommentsService } from '../utils/commentsService/comments.service';
import { inputRules } from 'prosemirror-inputrules';
import { Slice } from 'prosemirror-model';
import { MatDialog } from '@angular/material/dialog';
import { YdocService } from '../services/ydoc.service';
import { TrackChangesService } from '../utils/trachChangesService/track-changes.service';


@Component({
  selector: 'app-prosemirror-editor',
  templateUrl: './prosemirror-editor.component.html',
  styleUrls: ['./prosemirror-editor.component.scss']
})
export class ProsemirrorEditorComponent implements AfterViewInit {

  @ViewChild('editor', { read: ElementRef }) editor?: ElementRef;

  ydoc?: Y.Doc;

  provider?: WebrtcProvider;

  TREE_DATA?: sectionNode[];

  editorContainers: editorContainer[] = []
  initDocumentReplace: { name: string, init: boolean }[] = [];

  color = random.oneOf(userSpec.colors);
  user = random.oneOf(userSpec.testUsers);

  constructor(public commentsService: CommentsService, private ydocService:YdocService,private trackChangesService:TrackChangesService) {
  }

  ngAfterViewInit(): void {
    let data = this.ydocService.getData();
    this.ydoc = data.ydoc;
    this.provider = data.provider;
    this.TREE_DATA = data.TREE_DATA;
    console.log(this.ydoc, this.provider, this.TREE_DATA);
    this.buildEditor()
  }
  flatSectionData: string[] = [];
  flatA = (a: sectionNode[]) => {
    a.forEach((el) => {
      if (el.active) {
        this.flatSectionData.push(el.name);
        this.initDocumentReplace.push({ name: el.name, init: true });
      }
      el.children ? this.flatA(el.children) : true
    })
  }


  //dobava div s editor na zadadena poziciq
  addEditorOnPosition(position: number, editorDiv: HTMLDivElement) {
    let editorsContainerDiv = this.editor?.nativeElement
    editorsContainerDiv.insertBefore(editorDiv, editorsContainerDiv.children[position]);
  }

  //iztriva div na zadadena poziciq
  removeEditorOnPosition(position:number):HTMLDivElement{
    let editorsContainerDiv = this.editor?.nativeElement
    return editorsContainerDiv.removeChild(editorsContainerDiv.children[position]);
  }

  //mesti div ot poziciq from na to
  moveEditorFromTo(from:number,to:number){
    let editor = this.removeEditorOnPosition(from);
    this.addEditorOnPosition(to,editor);
  }

  buildEditor = () => {
    if (this.ydoc == undefined || this.TREE_DATA == undefined) {
      return
    }
    this.commentsService.init()

    this.editorContainers = []
    let colorMapping: Map<string, ColorDef> = new Map([[this.user.username, this.color],]);
    let permanentUserData = new Y.PermanentUserData(this.ydoc);
    permanentUserData.setUserMapping(this.ydoc, this.ydoc.clientID, this.user.username);
    this.ydoc.gc = false;
    let colors = userSpec.colors;
    const menu = buildMenuItems(schema);

    attachMenuItems(menu, this.ydoc);
    this.flatA(this.TREE_DATA);

    let inlineMathInputRule = makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, schema.nodes.math_inline);
    let blockMathInputRule = makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, schema.nodes.math_display);

    this.flatSectionData.forEach((section) => {
      let editorView: EditorView;

      let name = section;

      const dispatchRef = (action: any) => {
        editorView?.dispatch(action.transaction);
      };

      let editorDiv = document.createElement('div');
      editorDiv.setAttribute('class', 'editor-container')

      let xmlFragment = this.ydoc?.getXmlFragment(section)

      let edState = EditorState.create({
        schema: schema,
        plugins: [
          ySyncPlugin(xmlFragment, { colors, colorMapping, permanentUserData }),
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
          /* trackPlugin, */
          this.commentsService.getPlugin(),
          this.trackChangesService.getHideShowPlugin(),
          //commentsPlugin,
          /* hideShowPlugin(this.changesContainer?.nativeElement), */
          inputRules({ rules: [inlineMathInputRule, blockMathInputRule] }),
          //commentPlugin,

        ].concat(exampleSetup({ schema, menuContent: menu.fullMenu }))
        ,
        // @ts-ignore
        sectionName: section,
        // @ts-ignore
        comments: { ycommets: this.ycomments, userId: this.ydoc.clientID }
      });

      const dispatchTransaction = (transaction: Transaction) => {
        //console.log(transaction.steps);
        if (this.initDocumentReplace.find((el) => el.name == name)?.init) {
          let state = editorView?.state.apply(transaction);
          editorView?.updateState(state!);
          this.initDocumentReplace.forEach((el, index, array) => {
            if (el.name == name) {
              array[index].init = false;
            }
          })
        } else {
          const tr = trackedTransaction.default(transaction, editorView?.state,
            {
              userId: this.ydoc?.clientID, username: this.user.username, userColor: { addition: '#72e090', deletion: '#f08989' }
            });
          try {
            let state = editorView?.state.apply(tr);
            editorView?.updateState(state!);
          } catch (err) {
            console.log(err);
          }
        }
      };

      editorView = new EditorView(editorDiv, {
        state: edState,
        clipboardTextSerializer: (slice: Slice) => {
          return mathSerializer.serializeSlice(slice);
        },
        dispatchTransaction
      });

      /* this.ycomments.observe((change) => {
        editorView.dispatch(editorView.state.tr);
      }); */

      let editorCont: editorContainer = {
        name: name,
        containerDiv: editorDiv,
        editorState: edState,
        editorView: editorView,
        dispatchTransaction: dispatchTransaction
      }

      this.editorContainers?.push(editorCont);
    })
    this.editorContainers.forEach((container) => {
      this.editor?.nativeElement.appendChild(container.containerDiv)
    })
  };
}
