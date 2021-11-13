import { Injectable } from '@angular/core';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { ColorDef } from 'y-prosemirror/dist/src/plugins/sync-plugin';
import * as random from 'lib0/random.js';
import * as userSpec from '../utils/userSpec';
//@ts-ignore
import { buildMenuItems, exampleSetup } from '../utils/prosemirror-example-setup-master/src/index.js';
import { schema } from '../utils/Schema';
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
import { Slice } from 'prosemirror-model';
//@ts-ignore
import { EditorView } from 'prosemirror-view';
import { EditorState, Plugin, PluginKey, Transaction, TextSelection } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { redo, undo, yCursorPlugin, yDocToProsemirrorJSON, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import { chainCommands, deleteSelection, joinBackward, selectNodeBackward } from 'prosemirror-commands';
import { columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
//@ts-ignore
import * as trackedTransaction from '../utils/trackChanges/track-changes/index.js';
import { CommentsService } from '../utils/commentsService/comments.service';
import { inputRules } from 'prosemirror-inputrules';
import { YdocService } from './ydoc.service';
import { TrackChangesService } from '../utils/trachChangesService/track-changes.service';
import { PlaceholderPluginService } from '../utils/placeholderPlugin/placeholder-plugin.service';
import { DetectFocusService } from '../utils/detectFocusPlugin/detect-focus.service';
import { MenuService } from './menu.service';
import { Subject } from 'rxjs';
import { LinkPopUpPluginServiceService } from '../utils/linkPopUpPlugin/link-pop-up-plugin-service.service';
import {
  articleSection,
  editorData,
  sectionContent,
  taxonomicCoverageContentData,
  titleContent
} from '../utils/interfaces/articleSection';
//@ts-ignore
import { FormControlService } from '../section/form-control.service';
import { FormControl } from '@angular/forms';
import { TreeService } from '../meta-data-tree/tree-service/tree.service';
//@ts-ignore
import {menuBar} from '../utils/prosemirror-menu-master/src/menubar.js'
@Injectable({
  providedIn: 'root'
})
export class ProsemirrorEditorsService {

  ydoc?: Y.Doc;
  provider?: WebrtcProvider;

  articleSectionsStructure?: articleSection[];
  initDocumentReplace: any = {};
  editorContainers: any = {}
  xmlFragments: { [key: string]: Y.XmlFragment } = {}

  color = random.oneOf(userSpec.colors);
  user = random.oneOf(userSpec.testUsers);
  colorMapping: Map<string, ColorDef> = new Map([[this.user.username, this.color],]);
  permanentUserData?: Y.PermanentUserData;
  colors = userSpec.colors;
  menu: any = buildMenuItems(schema);
  inlineMathInputRule = makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, schema.nodes.math_inline);
  blockMathInputRule = makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, schema.nodes.math_display);

  changesOnOffSubject = new Subject<boolean>()
  shouldTrackChanges = false
  treeChangesCount = 0
  showChangesSubject
  transactionCount = 0;

  editorsEditableObj: { [key: string]: boolean } = {}

  mobileVersionSubject = new Subject<boolean>()
  mobileVersion = false;

  editorsDeleteArray: string[] = []

  constructor(
    private menuService: MenuService,
    private detectFocusService: DetectFocusService,
    private placeholderPluginService: PlaceholderPluginService,
    private ydocService: YdocService,
    private linkPopUpPluginService: LinkPopUpPluginServiceService,
    private commentsService: CommentsService,
    private treeService: TreeService,
    private trackChangesService: TrackChangesService,) {


    this.mobileVersionSubject.subscribe((data) => {
      // data == true => mobule version
      this.mobileVersion = data
    })

    this.showChangesSubject = this.trackChangesService.showChangesSubject
    this.changesOnOffSubject.subscribe((data) => {
      this.shouldTrackChanges = data
    })

    this.showChangesSubject.subscribe((data) => {
      this.dispatchEmptyTransaction()
    })


  }

  getXmlFragment(mode: string, id: string) {
    if (this.xmlFragments[id]) {
      return this.xmlFragments[id]
    }
    let xmlFragment =  this.ydocService.ydoc?.getXmlFragment(id)
    this.xmlFragments[id] = xmlFragment;
    return xmlFragment
  }

  deleteXmlFragment(id: string) {
    if (this.xmlFragments[id]) {
      this.xmlFragments[id].delete(0, this.xmlFragments[id].length);
    }
    delete this.xmlFragments[id]
  }

  deleteEditor(id: any) {
    let deleteContainer = this.editorContainers[id];
    if (deleteContainer) {
      this.editorContainers[id].editorView.destroy();
      delete this.editorContainers[id]
    }
  }

  clearDeleteArray() {
    while (this.editorsDeleteArray.length > 0) {
      let deleteId = this.editorsDeleteArray.shift()!;
      this.deleteEditor(deleteId)
      this.deleteXmlFragment(deleteId)
    }
  }

  addEditorForDelete(editorId: string) {
    this.commentsService.removeEditorComment(editorId)
    this.editorsDeleteArray.push(editorId);
  }

  markSectionForDelete(section: articleSection) {
    let markEditor = (editorData: editorData) => {
      let editorId = editorData.editorId
      this.addEditorForDelete(editorId)
    }
    let markContent = (content: titleContent | sectionContent) => {
      if (content.type == 'editorContentType') {
        markEditor(content.contentData as editorData)
      } else if (content.type == 'taxonomicCoverageContentType') {
        let taxonomicContentData = content.contentData as taxonomicCoverageContentData
        markEditor(taxonomicContentData.description)
        taxonomicContentData.taxaArray.forEach((el, i, arr) => {
          markEditor(arr[i].commonName)
          markEditor(arr[i].scietificName)
        })
      }
    }
    markContent(section.title)
    markContent(section.sectionContent)
  }

  dispatchEmptyTransaction() {  // for update of view
    Object.values(this.editorContainers).forEach((container: any) => {
      let editorState = container.editorView.state as EditorState
      container.editorView.dispatch(editorState.tr)
    })
  }

  renderEditorInWithId(EditorContainer: HTMLDivElement, editorId: string, section: articleSection): {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  } {
    let updateFormIoDefaultValues = (sectionID: string, data: any) => {
      this.ydocService.sectionsFromIODefaultValues?.set(sectionID, data);
    }
    if (this.editorContainers[editorId]) {
      EditorContainer.appendChild(this.editorContainers[editorId].containerDiv);
      return this.editorContainers[editorId]
    }
    let container = document.createElement('div');
    let editorView: EditorView;
    let colors = this.colors
    let colorMapping = this.colorMapping
    let permanentUserData = this.permanentUserData
    let editorID = editorId;

    let menuContainerClass = "menu-container";
    let xmlFragment = this.getXmlFragment(section.mode, editorID)
    let yjsPlugins = [ySyncPlugin(xmlFragment, { colors, colorMapping, permanentUserData }),
    yCursorPlugin(this.provider!.awareness),
    yUndoPlugin()]


    container.setAttribute('class', 'editor-container');
    let filterTransaction = false
    let defaultMenu = this.menuService.attachMenuItems(this.menu, this.ydoc!, 'SimpleMenu', editorID);
    let fullMenu = this.menuService.attachMenuItems(this.menu, this.ydoc!, 'fullMenu', editorID);
    this.initDocumentReplace[editorID] = false;
    let transactionControllerPluginKey = new PluginKey('transactionControllerPlugin');
    let GroupControl = this.treeService.sectionFormGroups;
    let transactionControllerPlugin = new Plugin({
      key: transactionControllerPluginKey,
      appendTransaction: (trs: Transaction<any>[], oldState: EditorState, newState: EditorState) => {
        let tr1 = newState.tr;
        // return value whe r = false the transaction is canseled
        trs.forEach((transaction) => {
          if (transaction.steps.length > 0) {
            newState.doc!.nodesBetween(newState.selection.from, newState.selection.to, (node, pos, parent) => {     // the document after the appling of the steps
              if (node.attrs.formControlName && GroupControl[section.sectionID]) {      // validation for the formCOntrol
                try {
                  const fg = GroupControl[section.sectionID];
                  const controlPath = node.attrs.controlPath;
                  const control = fg.get(controlPath) as FormControl;
                  control.setValue(node.textContent, { emitEvent: true })
                  control.updateValueAndValidity()
                  const mark = schema.mark('invalid')
                  if (control.invalid) {
                    tr1 = newState.tr.addMark(pos + 1, pos + node.nodeSize - 1, mark)
                  } else {
                    tr1 = newState.tr.removeMark(pos + 1, pos + node.nodeSize - 1, mark)
                  }
                  updateFormIoDefaultValues(editorID, fg.value);
                } catch (error) {
                  console.log(error);
                }
              }
            })
          }
        })
        return tr1
      },
      filterTransaction(transaction: Transaction<any>, state: EditorState) {
        return true
      }
    })

    setTimeout(() => {
      this.initDocumentReplace[editorID] = true;
      filterTransaction = true;
    }, 1000);

    this.editorsEditableObj[editorID] = true

    let edState = EditorState.create({
      schema: schema,
      plugins: [
        ...yjsPlugins,
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
        this.placeholderPluginService.getPlugin(),
        transactionControllerPlugin,
        this.detectFocusService.getPlugin(),
        this.commentsService.getPlugin(),
        this.trackChangesService.getHideShowPlugin(),
        this.linkPopUpPluginService.linkPopUpPlugin,
        inputRules({ rules: [this.inlineMathInputRule, this.blockMathInputRule] }),
        ...menuBar({floating: true,
          content: {'main':defaultMenu,fullMenu} ,containerClass:menuContainerClass})
      ].concat(exampleSetup({ schema, /* menuContent: fullMenuWithLog, */ containerClass: menuContainerClass }))
      ,
      // @ts-ignore
      sectionName: editorID,
      // @ts-ignore
    });
    
    let lastStep: any
    const dispatchTransaction = (transaction: Transaction) => {
      this.transactionCount++
      try {
        if (lastStep == transaction.steps[0]) {
          if (lastStep) { return }
        }
        lastStep = transaction.steps[0]
        if (!this.initDocumentReplace[editorID] || !this.shouldTrackChanges) {
          let state = editorView?.state.apply(transaction);
          editorView?.updateState(state!);

        } else {
          const tr = trackedTransaction.default(transaction, editorView?.state,
            {
              userId: this.ydoc?.clientID,
              username: this.user.username,
              userColor: { addition: 'transperant', deletion: 'black' }
            });
          let state = editorView?.state.apply(tr);
          editorView?.updateState(state!);
        }
      } catch (err) { console.log(err); }
    };
    editorView = new EditorView(container, {
      state: edState,
      clipboardTextSerializer: (slice: Slice) => {
        return mathSerializer.serializeSlice(slice);
      },
      editable: (state: EditorState) => {
        return !this.mobileVersion && this.editorsEditableObj[editorID]
        // mobileVersion is true when app is in mobile mod | editable() should return return false to set editor not editable so we return !mobileVersion
      },
      dispatchTransaction,
      handleKeyDown(view: EditorView, event: KeyboardEvent){
        if(event.key == 'Delete'){

          if(view.state.selection.$anchor.nodeAfter){
            if(view.state.selection.$anchor.nodeAfter.attrs.contenteditable == 'false'){
              return true
            }
          }else{
            return true
          }
        }else if(event.key == 'Backspace'){
          if(view.state.selection.$anchor.nodeBefore){
            if(view.state.selection.$anchor.nodeBefore.attrs.contenteditable == 'false'){
              return true
            }
          }else{
            return true
          }
        }
        return false
      },
      createSelectionBetween: (view, anchor, head) => {
        let headRangeMin = anchor.pos
        let headRangeMax = anchor.pos
        if (anchor.nodeBefore) {
          headRangeMin -= anchor.nodeBefore.nodeSize
        }
        if (anchor.nodeAfter) {
          headRangeMax += anchor.nodeAfter.nodeSize
        }
        this.editorsEditableObj[editorID] = true
        
        if (headRangeMin > head.pos || headRangeMax < head.pos) {
          let headPosition = headRangeMin > head.pos ? headRangeMin : headRangeMax
          let newHeadResolvedPosition = view.state.doc.resolve(headPosition)
          let from = Math.min(view.state.selection.$anchor.pos, newHeadResolvedPosition.pos)
          let to = Math.max(view.state.selection.$anchor.pos, newHeadResolvedPosition.pos)
          view.state.doc.nodesBetween(from, to, (node, pos, parent) => {
            if (node.attrs.contenteditable == 'false') {
              this.editorsEditableObj[editorID] = false;

            }
          })
          let newSelection = new TextSelection(anchor, newHeadResolvedPosition);
          return newSelection
        }
        let from = Math.min(anchor.pos, head.pos)
        let to = Math.max(anchor.pos, head.pos)
        view.state.doc.nodesBetween(from, to, (node, pos, parent) => {
          if (node.attrs.contenteditable == 'false') {
            this.editorsEditableObj[editorID] = false;
          }
        })
        return undefined
      },

    });
    EditorContainer.appendChild(container);

    let editorCont: any = {
      editorID: editorID,
      containerDiv: container,
      editorState: edState,
      editorView: editorView,
      dispatchTransaction: dispatchTransaction
    };
    this.editorContainers[editorID] = editorCont;
    return editorCont
  }

  init() {
    let data = this.ydocService.getData();
    this.ydoc = data.ydoc;
    this.provider = data.provider;
    this.articleSectionsStructure = data.articleSectionsStructure;
    this.permanentUserData = new Y.PermanentUserData(this.ydoc);
    this.permanentUserData.setUserMapping(this.ydoc, this.ydoc.clientID, this.user.username);
    this.ydoc.gc = false;
  }


}
