import { Injectable } from '@angular/core';
//@ts-ignore
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc';
import { WebsocketProvider } from 'y-websocket'
import { ColorDef } from 'y-prosemirror/dist/src/plugins/sync-plugin';
import * as random from 'lib0/random.js';
import * as userSpec from '../utils/userSpec';
//@ts-ignore
import { buildMenuItems, exampleSetup } from '../utils/prosemirror-example-setup-master/src/index.js';
import { /* endEditorSchema, */schema } from '../utils/Schema';
import {
  insertMathCmd,
  makeInlineMathInputRule,
  mathBackspaceCmd,
  mathPlugin,
  mathSerializer,
  MathView,
  REGEX_BLOCK_MATH_DOLLARS,
  REGEX_INLINE_MATH_DOLLARS
} from '@benrbray/prosemirror-math';
import { DOMSerializer, Node, NodeType, Slice } from 'prosemirror-model';
//@ts-ignore
import { EditorView } from 'prosemirror-view';
import { EditorState, Plugin, PluginKey, Transaction, TextSelection, Selection, NodeSelection } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
//import { redo, undo, yCursorPlugin, yDocToProsemirrorJSON, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import { chainCommands, deleteSelection, joinBackward, selectNodeBackward } from 'prosemirror-commands';
import { undo, redo } from 'prosemirror-history';
//@ts-ignore
import { yCursorPlugin, yDocToProsemirrorJSON, ySyncPlugin, yUndoPlugin, yUndoPluginKey } from '../../y-prosemirror-src/y-prosemirror.js';
import { CellSelection, columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
//@ts-ignore
import * as trackedTransaction from '../utils/trackChanges/track-changes/index.js';
import { CommentsService } from '../utils/commentsService/comments.service';
import { InputRule, inputRules } from 'prosemirror-inputrules';
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
import { FormControl, FormGroup } from '@angular/forms';
import { TreeService } from '../meta-data-tree/tree-service/tree.service';
import { DOMParser } from 'prosemirror-model';
//@ts-ignore
import { history } from '../utils/prosemirror-history/history.js';
//@ts-ignore
import { menuBar } from '../utils/prosemirror-menu-master/src/menubar.js'
import { Form } from 'formiojs';
import { FormioControl } from 'src/app/formio-angular-material/FormioControl';
import { E, I } from '@angular/cdk/keycodes';
import { AddMarkStep, Mapping, RemoveMarkStep, ReplaceAroundStep, ReplaceStep } from 'prosemirror-transform';
import { ViewFlags } from '@angular/compiler/src/core';
import { handleClick, handleDoubleClick as handleDoubleClickFN, handleKeyDown, handlePaste, createSelectionBetween, handleTripleClickOn, preventDragDropCutOnNoneditablenodes, updateControlsAndFigures, handleClickOn, selectWholeCitatMarks, handleScrollToSelection } from '../utils/prosemirrorHelpers';
//@ts-ignore
import { recreateTransform } from "prosemirror-recreate-steps"
import { figure } from '../utils/interfaces/figureComponent';
import { CitatContextMenuService } from '../utils/citat-context-menu/citat-context-menu.service';
import { ServiceShare } from './service-share.service';
import { YjsHistoryService } from '../utils/yjs-history.service';
import { leadingComment } from '@angular/compiler';
import { toCanvas } from 'html-to-image';
import html2canvas from 'html2canvas';
import { uuidv4 } from 'lib0/random.js';
import { filterSectionChildren } from '../utils/articleBasicStructure';
@Injectable({
  providedIn: 'root'
})
export class ProsemirrorEditorsService {

  ydoc?: Y.Doc;
  //provider?: WebrtcProvider;
  provider?: WebsocketProvider;

  articleSectionsStructure?: articleSection[];
  initDocumentReplace: any = {};
  editorContainers: {
    [key: string]: {
      editorID: string,
      containerDiv: HTMLDivElement,
      editorState: EditorState,
      editorView: EditorView,
      dispatchTransaction: any
    }
  } = {}
  xmlFragments: { [key: string]: Y.XmlFragment } = {}

  interpolateTemplate: any
  userInfo: any;

  DOMPMSerializer = DOMSerializer.fromSchema(schema);

  color = random.oneOf(userSpec.colors);
  user = random.oneOf(userSpec.testUsers);
  colorMapping: Map<string, ColorDef> = new Map([[this.user.username, this.color],]);
  permanentUserData?: Y.PermanentUserData;
  colors = userSpec.colors;
  menu: any = buildMenuItems(schema);
  menuTypes: any = {}

  makeBlockMathInputRule(pattern: RegExp, nodeType: NodeType, getAttrs?: (match: string[]) => any) {
    return new InputRule(pattern, (state, match, start, end) => {
      let $start = state.doc.resolve(start)
      let attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
      let tr = state.tr.replaceWith(start,end,nodeType.create(attrs))
      return tr.setSelection(NodeSelection.create(
        tr.doc, start+1
      ))
    })
  }

  inlineMathInputRule = makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, schema.nodes.math_inline, (match: any) => { return { math_id: uuidv4() } });
  blockMathInputRule = this.makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, schema.nodes.math_display, (match: any) => { return { math_id: uuidv4() } });

  OnOffTrackingChangesShowTrackingSubject = new Subject<{ trackTransactions: boolean }>()
  trackChangesMeta: any
  shouldTrackChanges = false
  treeChangesCount = 0
  transactionCount = 0;

  editorsEditableObj: { [key: string]: boolean } = {}

  mobileVersionSubject = new Subject<boolean>()
  mobileVersion = false;

  defaultValuesObj: any = {}
  editorsDeleteArray: string[] = []
  userData: any

  citatEditingSubject: Subject<any> = new Subject<any>()
  deletedCitatsInPopUp: { [key: string]: string[] } = {}
  rerenderFigures: any
  setFigureRerenderFunc = (fn: any) => {
    this.rerenderFigures = fn;
  }

  constructor(
    private menuService: MenuService,
    private detectFocusService: DetectFocusService,
    private placeholderPluginService: PlaceholderPluginService,
    private ydocService: YdocService,
    private linkPopUpPluginService: LinkPopUpPluginServiceService,
    private commentsService: CommentsService,
    private treeService: TreeService,
    private citatContextPluginService: CitatContextMenuService,
    private trackChangesService: TrackChangesService,
    private yjsHistory: YjsHistoryService,
    private serviceShare: ServiceShare) {

    // change the mathBlock input rule


    this.serviceShare.shareSelf('ProsemirrorEditorsService', this)
    this.mobileVersionSubject.subscribe((data) => {
      // data == true => mobule version
      this.mobileVersion = data

    })
    this.OnOffTrackingChangesShowTrackingSubject.subscribe((data) => {
      this.shouldTrackChanges = data.trackTransactions
      let trackCHangesMetadata = this.ydocService.trackChangesMetadata?.get('trackChangesMetadata');
      trackCHangesMetadata.lastUpdateFromUser = this.ydoc?.guid;
      trackCHangesMetadata.trackTransactions = data.trackTransactions
      this.ydocService.trackChangesMetadata?.set('trackChangesMetadata', trackCHangesMetadata);
    })

    this.citatEditingSubject.subscribe((data) => {
      if (data.action == 'delete') {
        if (!this.deletedCitatsInPopUp[data.sectionID]) {
          this.deletedCitatsInPopUp[data.sectionID] = [data.citatID]
        } else {
          this.deletedCitatsInPopUp[data.sectionID].push(data.citatID)
        }
      } else if (data.action == "clearDeletedCitatsFromPopup") {
        Object.keys(this.deletedCitatsInPopUp).forEach((sectionID) => {
          delete this.deletedCitatsInPopUp[sectionID];
        })
      } else if (data.action == "deleteCitatsFromDocument") {
        let citatsObj = this.ydocService.figuresMap?.get('articleCitatsObj');
        Object.keys(this.deletedCitatsInPopUp).forEach((sectionID) => {
          this.deletedCitatsInPopUp[sectionID].forEach((citatid) => {
            citatsObj[sectionID][citatid] = undefined
          })
          delete this.deletedCitatsInPopUp[sectionID];
        })
        this.ydocService.figuresMap?.set('articleCitatsObj', citatsObj);
        this.rerenderFigures(citatsObj)
      }
    })
  }

  preservedScrollPosition: number = 0;
  saveScrollPosition() {
    let articleProsemirrorsContainer = document.getElementById('app-article-element');
    this.preservedScrollPosition = articleProsemirrorsContainer!.scrollTop!;
  }

  applyLastScrollPosition() {
    let articleProsemirrorsContainer = document.getElementById('app-article-element');
    articleProsemirrorsContainer!.scrollTop = this.preservedScrollPosition;
  }

  collab(config: any = {}) {
    config = {
      version: config.version || 0,
      clientID: config.clientID == null ? Math.floor(Math.random() * 0xFFFFFFFF) : config.clientID
    }
  }

  getXmlFragment(mode: string = 'documentMode', id: string) {
    if (this.xmlFragments[id]) {
      return this.xmlFragments[id]
    }
    let xmlFragment = this.ydocService.ydoc?.getXmlFragment(id)
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

  resetProsemirrorEditors() {
    this.ydoc = undefined;
    //provider?: WebrtcProvider;
    this.provider = undefined;

    this.articleSectionsStructure = undefined;
    this.initDocumentReplace = {};
    this.editorContainers = {}
    this.xmlFragments = {}

    this.interpolateTemplate = undefined;
    this.userInfo = undefined;
    this.permanentUserData = undefined;
    this.trackChangesMeta = undefined;
    this.shouldTrackChanges = false
    this.treeChangesCount = 0
    this.transactionCount = 0;

    this.editorsEditableObj = {}

    this.mobileVersionSubject = new Subject<boolean>()
    this.mobileVersion = false;

    this.defaultValuesObj = {}
    this.editorsDeleteArray = []
    this.userData = undefined;
    this.deletedCitatsInPopUp = {}
  }

  dispatchEmptyTransaction() {  // for updating the view
    Object.values(this.editorContainers).forEach((container: any) => {
      let editorState = container.editorView.state as EditorState
      container.editorView.dispatch(editorState.tr.setMeta('emptyTR', true).setMeta('addToLastHistoryGroup', true))
    })
  }

  scrollMainEditorIntoView(id: string) {
    try {
      let container = this.editorContainers[id];
      if (container) {
        let editorState = container.editorView.state as EditorState
        container.editorView.dispatch(editorState.tr.scrollIntoView().setMeta('addToLastHistoryGroup', true))
      }
    } catch (e) {
      console.error(e);
    }
  }

  renderEditorInWithId(EditorContainer: HTMLDivElement, editorId: string, section: articleSection): {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  } {
    let hideshowPluginKEey = this.trackChangesService.hideshowPluginKey;

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
    yCursorPlugin(this.provider!.awareness, this.userData),
    this.yjsHistory.getYjsHistoryPlugin({ editorID, figuresMap: this.ydocService.figuresMap, renderFigures: this.rerenderFigures })]


    container.setAttribute('class', 'editor-container');
    //let fullMenu1 = this.menuService.attachMenuItems(this.menu, this.ydoc!, 'fullMenu1', editorID);
    this.initDocumentReplace[editorID] = true;
    let transactionControllerPluginKey = new PluginKey('transactionControllerPlugin');
    let GroupControl = this.treeService.sectionFormGroups;
    let transactionControllerPlugin = new Plugin({
      key: transactionControllerPluginKey,
      appendTransaction: updateControlsAndFigures(schema, this.ydocService.figuresMap!, this.ydocService.mathMap!, this.editorContainers, this.rerenderFigures, this.yjsHistory.YjsHistoryKey, this.interpolateTemplate, GroupControl, section),
      filterTransaction: preventDragDropCutOnNoneditablenodes(this.ydocService.figuresMap!, this.ydocService.mathMap!, this.rerenderFigures, editorID, this.serviceShare),
      //@ts-ignore
      historyPreserveItems: true,
    })

    let selectWholeCitatPluginKey = new PluginKey('selectWholeCitat');
    let selectWholeCitat = new Plugin({
      key: selectWholeCitatPluginKey,
      props: {
        createSelectionBetween: selectWholeCitatMarks
      }
    })

    setTimeout(() => {
      this.initDocumentReplace[editorID] = false;
    }, 600);

    this.editorsEditableObj[editorID] = true

    let edState = EditorState.create({
      schema: schema,
      plugins: [
        ...yjsPlugins,
        mathPlugin,

        keymap({
          'Mod-z': this.yjsHistory.undo,
          'Mod-y': this.yjsHistory.redo,
          'Mod-Shift-z': this.yjsHistory.redo,
          'Mod-Space': insertMathCmd(schema.nodes.math_inline),
          'Backspace': chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
          'Tab': goToNextCell(1),
          'Shift-Tab': goToNextCell(-1)
        }),
        columnResizing({}),
        tableEditing(),
        //history({renderFiguresFunc:this.rerenderFigures}),
        this.placeholderPluginService.getPlugin(),
        transactionControllerPlugin,
        selectWholeCitat,
        this.detectFocusService.getPlugin(),
        this.serviceShare.ReferencePluginService?.referencePlugin,
        this.commentsService.getPlugin(),
        this.trackChangesService.getHideShowPlugin(),
        this.citatContextPluginService.citatContextPlugin,
        this.linkPopUpPluginService.linkPopUpPlugin,
        inputRules({ rules: [this.inlineMathInputRule, this.blockMathInputRule] }),
        ...menuBar({
          floating: true,
          content: this.menuTypes, containerClass: menuContainerClass
        })
      ].concat(exampleSetup({ schema, /* menuContent: fullMenuWithLog, */history: false, containerClass: menuContainerClass }))
      ,
      // @ts-ignore
      sectionName: editorID,
      // @ts-ignore
      sectionID:editorID,
      // @ts-ignore
    });

    let mapping = new Mapping();

    let lastStep: any
    let lastContainingInsertionMark: any
    const dispatchTransaction = (transaction: Transaction) => {
      this.transactionCount++
      try {

        let nodeAtSel = transaction.selection.$head.parent || transaction.selection.$anchor.parent
        //@ts-ignore
        if (nodeAtSel && !transaction.getMeta('titleupdateFromControl') && nodeAtSel.attrs.controlPath && nodeAtSel.attrs.controlPath == "sectionTreeTitle" && transaction.steps.filter(step => { return step instanceof ReplaceStep || step instanceof ReplaceAroundStep }).length > 0) {
          transaction.setMeta('editingTitle', true);
        }

        //@ts-ignore
        if (lastStep == transaction.steps[0] && !transaction.getMeta('emptyTR')) {
          if (lastStep) { return }
        }
        lastStep = transaction.steps[0]
        let isMath = false
        if (transaction.steps.length > 0) {
          if (transaction.selection instanceof NodeSelection && (transaction.selection.node.type.name == 'math_inline' || transaction.selection.node.type.name == 'math_display')) {
            let hasmarkAddRemoveStep = transaction.steps.filter((step) => {
              return (step instanceof AddMarkStep || step instanceof RemoveMarkStep)
            }).length > 0;
            if (hasmarkAddRemoveStep) {
              return
            }
            isMath = true
          }
          //@ts-ignore
          if (transaction.getMeta('y-sync$') || transaction.meta['y-sync$'] || transaction.getMeta('addToLastHistoryGroup') ||transaction.getMeta('preventHistoryAdd')) {
            if (transaction.getMeta('addToLastHistoryGroup')) {
              this.yjsHistory.YjsHistoryKey.getState(editorView.state).undoManager.preventCapture();
            } else if (transaction.getMeta('preventHistoryAdd')) {
              let undoManager = this.yjsHistory.YjsHistoryKey.getState(editorView.state).undoManager;
              undoManager.dontAddToHistory();
            }
          } else {
            let undoManager = this.yjsHistory.YjsHistoryKey.getState(editorView.state).undoManager;
            let undoManagerStatus = undoManager.status;
            if (transaction.getMeta('createNewHistoryGroup')) {
              undoManager.captureNewStackItem();
            }
            if (undoManagerStatus !== 'capturing') {
              this.yjsHistory.YjsHistoryKey.getState(editorView.state).undoManager.status = 'capturing'
            }
          }
        }
        if (this.initDocumentReplace[editorID] || !this.shouldTrackChanges || transaction.getMeta('shouldTrack') == false || isMath) {

          let state = editorView?.state.apply(transaction);
          editorView?.updateState(state!);

        } else {

          const tr = trackedTransaction.default(transaction, editorView?.state,
            {
              userId: this.userInfo.data.id,
              username: this.userInfo.data.name,
              userColor: this.userInfo.color
            }, lastContainingInsertionMark);
          if (editorView?.state.selection instanceof TextSelection && transaction.selectionSet) {
            let sel = editorView?.state.selection
            if (sel.$to.nodeAfter && sel.$to.nodeBefore) {
              let insertionMarkAfter = sel.$to.nodeAfter?.marks.filter(mark => mark.type.name == 'insertion')[0]
              let insertionMarkBefore = sel.$to.nodeBefore?.marks.filter(mark => mark.type.name == 'insertion')[0]
              if (sel.empty && insertionMarkAfter && insertionMarkAfter == insertionMarkBefore) {
                lastContainingInsertionMark = `${insertionMarkAfter.attrs.id}`
              } else if (
                (insertionMarkAfter && insertionMarkAfter.attrs.id == lastContainingInsertionMark) ||
                (insertionMarkBefore && insertionMarkBefore.attrs.id == lastContainingInsertionMark)) {
              } else {
                lastContainingInsertionMark = undefined
              }
            }
          }
          let state = editorView?.state.apply(tr);
          editorView?.updateState(state!);
        }
      } catch (err) { console.error(err); }
    };
    let mathMap = this.ydocService.mathMap

    editorView = new EditorView(container, {
      state: edState,
      clipboardTextSerializer: (slice: Slice) => {
        return mathSerializer.serializeSlice(slice);
      },
      editable: (state: EditorState) => {
        return !this.mobileVersion /* && this.editorsEditableObj[editorID] */
        // mobileVersion is true when app is in mobile mod | editable() should return return false to set editor not editable so we return !mobileVersion
      },
      handleDOMEvents: {
        contextmenu: (view, event) => {
          let state = view.state;
          let sel = state.selection
          state.doc.nodesBetween(sel.from, sel.to, (node, pos, parent, index) => {
            if (node.marks.length > 0 && node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0) {
              setTimeout(() => {
                let cursurCoord = view.coordsAtPos(sel.from);
                event.preventDefault();
                event.stopPropagation();
                setTimeout(() => {
                  view.dispatch(view.state.tr.setMeta('citatContextPlugin', {
                    clickPos: sel.from,
                    clickEvent: event,
                    focus: view.hasFocus(),
                    coords: cursurCoord
                  }))
                }, 0)
                return true
              })
            }
          })
          if (this.citatContextPluginService.citatContextPluginKey.getState(view.state).decorations) {
            event.preventDefault();
            event.stopPropagation();
            return true
          }
          return false
        }
      },
      dispatchTransaction,
      handlePaste: handlePaste(mathMap!, editorID),
      handleClick: handleClick(hideshowPluginKEey, this.citatContextPluginService.citatContextPluginKey),
      handleClickOn: handleClickOn(this.citatContextPluginService.citatContextPluginKey),
      handleTripleClickOn,
      handleScrollToSelection: handleScrollToSelection(this.editorContainers, section),
      handleDoubleClick: handleDoubleClickFN(hideshowPluginKEey),
      handleKeyDown,
      scrollMargin: { top: 300, right: 5, bottom: 300, left: 5 },
      handleDrop: (view: EditorView, event: Event, slice: Slice, moved: boolean) => {
        slice.content.nodesBetween(0, slice.content.size - 2, (node, pos, parent) => {
          if (node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0) {
            let citationMark = node.marks.filter((mark) => { return mark.type.name == 'citation' })[0];
            //@ts-ignore
            if (!event.ctrlKey) {  // means that the drag is only moving the selected not a copy of the selection -> without Ctrl

            } else {      // the drag is moving a copy of the selection
              //@ts-ignore
              let dropPosition = view.posAtCoords({ left: event.clientX, top: event.clientY }).pos + pos - slice.openStart
              setTimeout(() => {
                let newMark = view.state.doc.nodeAt(dropPosition)
                view.dispatch(view.state.tr.addMark(dropPosition, dropPosition + newMark?.nodeSize!, schema.mark('citation', { ...citationMark.attrs, citateid: random.uuidv4() })).setMeta('addToLastHistoryGroup', true))
              }, 10)
            }
          }
        })
        return false
      }
      //createSelectionBetween:createSelectionBetween(this.editorsEditableObj,editorID),
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
    let count = 0;
    let countActiveSections = (item:articleSection)=>{
      if(item.type == 'complex'&&item.children.length>0){
        item.children.forEach((child)=>{
          countActiveSections(child)
        })
      }
      if(item.active == true){
        count++;
      }
    }
    this.treeService.articleSectionsStructure?.forEach(item=>{
      countActiveSections(item)
    })
    let renderedSections = Object.keys(this.editorContainers).filter(key=>key!=='endEditor').length
    let allActiveSections = count;
    if(renderedSections == allActiveSections){
      this.runFuncAfterRender()
    }
    return editorCont
  }

  renderDocumentEndEditor(EditorContainer: HTMLDivElement, figures: figure[]): {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  } {
    let editorId = 'endEditor'
    let hideshowPluginKEey = this.trackChangesService.hideshowPluginKey;

    if (this.editorContainers[editorId]) {
      EditorContainer.appendChild(this.editorContainers[editorId].containerDiv);
      return this.editorContainers[editorId]
    }
    let transactionControllerPluginKey = new PluginKey('transactionControllerPlugin');
    let transactionControllerPlugin = new Plugin({
      key: transactionControllerPluginKey,
      appendTransaction: updateControlsAndFigures(schema, this.ydocService.figuresMap!, this.ydocService.mathMap!, this.editorContainers, this.rerenderFigures, this.interpolateTemplate, this.yjsHistory.YjsHistoryKey),
      filterTransaction: preventDragDropCutOnNoneditablenodes(this.ydocService.figuresMap!, this.ydocService.mathMap!, this.rerenderFigures, editorId, this.serviceShare),
    })
    let container = document.createElement('div');
    let editorView: EditorView;
    let colors = this.colors
    let colorMapping = this.colorMapping
    let permanentUserData = this.permanentUserData
    let editorID = editorId;

    let menuContainerClass = "menu-container";
    let xmlFragment = this.getXmlFragment('documentMode', editorID)
    let yjsPlugins = [ySyncPlugin(xmlFragment, { colors, colorMapping, permanentUserData }),
    yCursorPlugin(this.provider!.awareness, this.userData),
    this.yjsHistory.getYjsHistoryPlugin({ editorID, figuresMap: this.ydocService.figuresMap, renderFigures: this.rerenderFigures })]

    container.setAttribute('class', 'editor-container');
    this.initDocumentReplace[editorID] = true;


    setTimeout(() => {
      this.initDocumentReplace[editorID] = false;
    }, 600);

    this.editorsEditableObj[editorID] = true
    let edState = EditorState.create({
      schema: schema,
      plugins: [
        ...yjsPlugins,
        mathPlugin,
        keymap({
          'Mod-z': this.yjsHistory.undo,
          'Mod-y': this.yjsHistory.redo,
          'Mod-Shift-z': this.yjsHistory.undo,
          //'Mod-Space': insertMathCmd(endEditorSchema!.nodes.math_inline),
          'Backspace': chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
          'Tab': goToNextCell(1),
          'Shift-Tab': goToNextCell(-1)
        }),
        //columnResizing({}),
        //tableEditing(),
        history(),
        this.placeholderPluginService.getPlugin(),
        transactionControllerPlugin,
        this.detectFocusService.getPlugin(),
        this.serviceShare.ReferencePluginService?.referencePlugin,
        this.commentsService.getPlugin(),
        this.trackChangesService.getHideShowPlugin(),
        this.linkPopUpPluginService.linkPopUpPlugin,
        //inputRules({ rules: [inlineMathInputRule, blockMathInputRule] }),
        ...menuBar({
          floating: true,
          content: this.menuTypes, containerClass: menuContainerClass
        })
      ].concat(exampleSetup({ schema, /* menuContent: fullMenuWithLog, */history: false, containerClass: menuContainerClass }))
      ,
      // @ts-ignore
      sectionName: editorID,
      // @ts-ignore
    });

    let lastStep: any
    let lastContainingInsertionMark: any

    const dispatchTransaction = (transaction: Transaction) => {
      this.transactionCount++
      try {
        /* if (lastStep == transaction.steps[0]) {
          if (lastStep) { return }
        } */
        let isMath = false
        if (transaction.selection instanceof NodeSelection && (transaction.selection.node.type.name == 'math_inline' || transaction.selection.node.type.name == 'math_display')) {
          let hasmarkAddRemoveStep = transaction.steps.filter((step) => {
            return (step instanceof AddMarkStep || step instanceof RemoveMarkStep)
          }).length > 0;
          if (hasmarkAddRemoveStep) {
            return
          }
          isMath = true
        }
        lastStep = transaction.steps[0]
        this.yjsHistory.YjsHistoryKey.getState(editorView.state).undoManager.preventCapture()

        if (this.initDocumentReplace[editorID] || !this.shouldTrackChanges || transaction.getMeta('shouldTrack') == false || isMath) {

          let state = editorView?.state.apply(transaction);
          editorView?.updateState(state!);

        } else {
          const tr = trackedTransaction.default(transaction, editorView?.state,
            {
              userId: this.userInfo.data.id,
              username: this.userInfo.data.name,
              userColor: this.userInfo.color
            }, lastContainingInsertionMark);
          if (transaction.selection instanceof TextSelection) {
            let sel = transaction.selection
            if (sel.$to.nodeAfter && sel.$to.nodeBefore) {

              let insertionMarkAfter = sel.$to.nodeAfter?.marks.filter(mark => mark.type.name == 'insertion')[0]
              let insertionMarkBefore = sel.$to.nodeBefore?.marks.filter(mark => mark.type.name == 'insertion')[0]
              if (sel.empty && insertionMarkAfter && insertionMarkAfter == insertionMarkBefore) {
                lastContainingInsertionMark = `${insertionMarkAfter.attrs.id}`
              } else if (
                (insertionMarkAfter && insertionMarkAfter.attrs.id == lastContainingInsertionMark) ||
                (insertionMarkBefore && insertionMarkBefore.attrs.id == lastContainingInsertionMark)) {
              } else {
                lastContainingInsertionMark = undefined
              }
            }
          }
          let state = editorView?.state.apply(tr);
          editorView?.updateState(state!);
        }
      } catch (err) { console.error(err); }
    };
    let mathMap = this.ydocService.mathMap
    editorView = new EditorView(container, {
      state: edState,
      clipboardTextSerializer: (slice: Slice) => {
        return mathSerializer.serializeSlice(slice);
      },
      editable: (state: EditorState) => {
        /*return !this.mobileVersion  && this.editorsEditableObj[editorID] */
        return false
        // mobileVersion is true when app is in mobile mod | editable() should return return false to set editor not editable so we return !mobileVersion
      },
      dispatchTransaction,
      handlePaste: handlePaste(mathMap!, editorID),
      handleClick: handleClick(hideshowPluginKEey),
      handleTripleClickOn,
      handleDoubleClick: handleDoubleClickFN(hideshowPluginKEey),
      //handleKeyDown,
      //createSelectionBetween:createSelectionBetween(this.editorsEditableObj,editorID),
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

  renderEditorWithNoSync(EditorContainer: HTMLDivElement, formIOComponentInstance: any, control: FormioControl, options: any, nodesArray?: Slice): {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  } {

    let placeholder = (formIOComponentInstance.component.placeholder&&formIOComponentInstance.component.placeholder!=='')?formIOComponentInstance.component.placeholder:undefined
    let hideshowPluginKEey = this.trackChangesService.hideshowPluginKey;
    EditorContainer.innerHTML = ''
    let editorID = random.uuidv4()
    let container = document.createElement('div');
    let editorView: EditorView;
    let doc: Node;
    if (!options.noLabel) {
      let componentLabel = formIOComponentInstance.component.label;
      let labelTag = document.createElement('div');
      labelTag.setAttribute('class', 'prosemirror-label-tag')
      labelTag.textContent = componentLabel
      EditorContainer.appendChild(labelTag);
    }
    let sectionID = options.sectionID
    if (!nodesArray||nodesArray.size == 0) {
      doc = schema.nodes.doc.create({}, schema.nodes.form_field.create({}, schema.nodes.paragraph.create({})))
    } else {
      doc = schema.nodes.doc.create({}, schema.nodes.form_field.create({}, nodesArray.content))
    }
    let menuContainerClass = "popup-menu-container";

    container.setAttribute('class', 'editor-container');

    let filterTransaction = false

    let transactionControllerPluginKey = new PluginKey('transactionControllerPlugin');
    let transactionControllerPlugin = new Plugin({
      key: transactionControllerPluginKey,
      props: {
        createSelectionBetween: selectWholeCitatMarks
      },
      state: {
        init(config) {
          return { sectionID: config.sectionID }
        },
        apply(tr, prev, _, newState) {
          return prev
        }
      },
      appendTransaction: (trs: Transaction<any>[], oldState: EditorState, newState: EditorState) => {
        let containerElement = document.createElement('div');
        let htmlNOdeRepresentation = this.DOMPMSerializer.serializeFragment(newState.doc.content.firstChild!.content)
        containerElement.appendChild(htmlNOdeRepresentation);
        options.onChange(true, containerElement.innerHTML)
      },
      filterTransaction: preventDragDropCutOnNoneditablenodes(this.ydocService.figuresMap!, this.ydocService.mathMap!, this.rerenderFigures, sectionID, this.serviceShare, this.citatEditingSubject)

    })

    /*fieldFormControl?.valueChanges.subscribe((data) => {

       let tr = recreateTransform(
        doc ,
        endDoc,
        complexSteps = true, // Whether step types other than ReplaceStep are allowed.
        wordDiffs = false // Whether diffs in text nodes should cover entire words.
      )
    })*/

    this.editorsEditableObj[editorID] = true

    let menu: any = undefined
    if (options.menuType) {
      menu = { main: this.menuTypes[options.menuType] }
    }

    let edState = EditorState.create({
      doc,
      schema: schema,
      plugins: [
        mathPlugin,
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': undo,
          'Mod-Space': insertMathCmd(schema.nodes.math_inline),
          'Backspace': chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
          'Tab': goToNextCell(1),
          'Shift-Tab': goToNextCell(-1)
        }),
        columnResizing({}),
        tableEditing(),
        this.placeholderPluginService.getPlugin(),
        transactionControllerPlugin,
        this.trackChangesService.getHideShowPlugin(),
        inputRules({ rules: [this.inlineMathInputRule, this.blockMathInputRule] }),
        ...menuBar({
          floating: true,
          content: menu ? menu : this.menuTypes, containerClass: menuContainerClass
        })
      ].concat(exampleSetup({ schema, /* menuContent: fullMenuWithLog, */ containerClass: menuContainerClass }))
      ,
      // @ts-ignore
      data:{placeHolder:placeholder},
      // @ts-ignore
      sectionName: editorID,
      sectionID: sectionID,
      editorType: 'popupEditor'
    });
    setTimeout(() => {
      this.initDocumentReplace[editorID] = false;
    }, 600);

    this.editorsEditableObj[editorID] = true
    let lastStep: any
    let lastContainingInsertionMark: any
    const dispatchTransaction = (transaction: Transaction) => {
      this.transactionCount++
      try {
        if (lastStep == transaction.steps[0]) {
          if (lastStep) { return }
        }
        lastStep = transaction.steps[0]
        let isMath = false;
        if (transaction.selection instanceof NodeSelection && (transaction.selection.node.type.name == 'math_inline' || transaction.selection.node.type.name == 'math_display')) {
          let hasmarkAddRemoveStep = transaction.steps.filter((step) => {
            return (step instanceof AddMarkStep || step instanceof RemoveMarkStep)
          }).length > 0;
          if (hasmarkAddRemoveStep) {
            return
          }
          isMath = true
        }
        if (this.initDocumentReplace[editorID] || !this.shouldTrackChanges || transaction.getMeta('shouldTrack') == false || isMath) {
          let state = editorView?.state.apply(transaction);
          editorView?.updateState(state!);

        } else {
          const tr = trackedTransaction.default(transaction, editorView?.state,
            {
              userId: this.userInfo.data.id,
              username: this.userInfo.data.name,
              userColor: this.userInfo.color
            }, lastContainingInsertionMark);
          if (editorView?.state.selection instanceof TextSelection && transaction.selectionSet) {
            let sel = editorView?.state.selection
            if (sel.$to.nodeAfter && sel.$to.nodeBefore) {
              let insertionMarkAfter = sel.$to.nodeAfter?.marks.filter(mark => mark.type.name == 'insertion')[0]
              let insertionMarkBefore = sel.$to.nodeBefore?.marks.filter(mark => mark.type.name == 'insertion')[0]
              if (sel.empty && insertionMarkAfter && insertionMarkAfter == insertionMarkBefore) {
                lastContainingInsertionMark = `${insertionMarkAfter.attrs.id}`
              } else if (
                (insertionMarkAfter && insertionMarkAfter.attrs.id == lastContainingInsertionMark) ||
                (insertionMarkBefore && insertionMarkBefore.attrs.id == lastContainingInsertionMark)) {
              } else {
                lastContainingInsertionMark = undefined
              }
            }
          }
          let state = editorView?.state.apply(tr);
          editorView?.updateState(state!);
        }
      } catch (err) { console.error(err); }
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
      handleClick: handleClick(hideshowPluginKEey),
      handleTripleClickOn,
      handleDoubleClick:
        handleDoubleClickFN(hideshowPluginKEey),
      handleKeyDown,
      //createSelectionBetween:createSelectionBetween(this.editorsEditableObj,editorID),

    });
    EditorContainer.appendChild(container);

    let editorCont: any = {
      editorID: editorID,
      containerDiv: container,
      editorState: edState,
      editorView: editorView,
      dispatchTransaction: dispatchTransaction
    };
    if (options.autoFocus) {
      setTimeout(() => {
        (editorCont.editorView as EditorView).focus();
        (editorCont.editorView as EditorView).dispatch((editorCont.editorView as EditorView).state.tr)
      }, 200)
    }
    return editorCont
  }

  renderSeparatedEditorWithNoSync(EditorContainer: HTMLDivElement,menuContainerClass:string,startingText?:string): {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  } {

    let hideshowPluginKEey = this.trackChangesService.hideshowPluginKey;
    EditorContainer.innerHTML = ''
    let editorID = random.uuidv4()
    let container = document.createElement('div');
    let editorView: EditorView;
    let doc: Node;

    container.setAttribute('class', 'editor-container');

    let filterTransaction = false

    let transactionControllerPluginKey = new PluginKey('transactionControllerPlugin');

    /*fieldFormControl?.valueChanges.subscribe((data) => {

       let tr = recreateTransform(
        doc ,
        endDoc,
        complexSteps = true, // Whether step types other than ReplaceStep are allowed.
        wordDiffs = false // Whether diffs in text nodes should cover entire words.
      )
    })*/

    this.editorsEditableObj[editorID] = true

    let menu: any = undefined
    menu = { main: this.menuTypes['onlyPmMenu'] }
    if(startingText){
      doc = schema.nodes.doc.create({}, schema.nodes.form_field.create({}, schema.nodes.paragraph.create({},schema.text(startingText))))
    }else{
      doc = schema.nodes.doc.create({}, schema.nodes.form_field.create({}, schema.nodes.paragraph.create({})))
    }
    let edState = EditorState.create({
      doc,
      schema: schema,
      plugins: [
        mathPlugin,
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': undo,
          'Mod-Space': insertMathCmd(schema.nodes.math_inline),
          'Backspace': chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
          'Tab': goToNextCell(1),
          'Shift-Tab': goToNextCell(-1)
        }),
        columnResizing({}),
        tableEditing(),
        this.placeholderPluginService.getPlugin(),
        inputRules({ rules: [this.inlineMathInputRule, this.blockMathInputRule] }),
        ...menuBar({
          floating: true,
          content: menu ? menu : this.menuTypes, containerClass: menuContainerClass
        })
      ].concat(exampleSetup({ schema, /* menuContent: fullMenuWithLog, */ containerClass: menuContainerClass }))
      ,
      //@ts-ignore
      /*  editorType: 'popupEditor' */
    });
    setTimeout(() => {
      this.initDocumentReplace[editorID] = false;
    }, 600);

    this.editorsEditableObj[editorID] = true
    let lastStep: any
    let lastContainingInsertionMark: any
    const dispatchTransaction = (transaction: Transaction) => {
      this.transactionCount++
      try {
        if (lastStep == transaction.steps[0]) {
          if (lastStep) { return }
        }
        lastStep = transaction.steps[0]
        let isMath = false;
        if (transaction.selection instanceof NodeSelection && (transaction.selection.node.type.name == 'math_inline' || transaction.selection.node.type.name == 'math_display')) {
          let hasmarkAddRemoveStep = transaction.steps.filter((step) => {
            return (step instanceof AddMarkStep || step instanceof RemoveMarkStep)
          }).length > 0;
          if (hasmarkAddRemoveStep) {
            return
          }
          isMath = true
        }
        let state = editorView?.state.apply(transaction);
        editorView?.updateState(state!);

      } catch (err) { console.error(err); }
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

    });
    EditorContainer.appendChild(container);

    let editorCont: any = {
      editorID: editorID,
      containerDiv: container,
      editorState: edState,
      editorView: editorView,
      dispatchTransaction: dispatchTransaction
    };
    return editorCont
  }

  runFuncAfterRender(){
    this.serviceShare.CslService?.checkReferencesInAllEditors(this.editorContainers);
  }

  buildMenus() {
    this.menuTypes = this.menuService.buildMenuTypes()
  }

  init() {
    let data = this.ydocService.getData();
    this.userInfo = data.userInfo
    this.ydoc = data.ydoc;
    this.provider = data.provider;
    this.articleSectionsStructure = data.articleSectionsStructure;
    let trackChangesMetadata = this.ydocService.trackChangesMetadata?.get('trackChangesMetadata');
    this.trackChangesMeta = trackChangesMetadata
    this.shouldTrackChanges = trackChangesMetadata.trackTransactions;
    this.ydocService.trackChangesMetadata?.observe((ymap) => {
      let trackChangesMetadata = this.ydocService.trackChangesMetadata?.get('trackChangesMetadata');
      if (trackChangesMetadata.lastUpdateFromUser !== this.ydoc?.guid) {
      }
      this.trackChangesMeta = trackChangesMetadata
      this.shouldTrackChanges = trackChangesMetadata.trackTransactions
    })

    this.permanentUserData = new Y.PermanentUserData(this.ydoc);
    this.permanentUserData.setUserMapping(this.ydoc, this.ydoc.clientID, this.user.username);
    this.ydoc.gc = false;
    this.buildMenus()
    let ydocservice = this.ydocService
    let seviceShare = this.serviceShare
    let mathObj = ydocservice.mathMap?.get('dataURLObj');
    //@ts-ignore
    if (!MathView.prototype.isPatched) {
      //@ts-ignore

      MathView.prototype.isPatched = true;
      let oldMathFunc = MathView.prototype.renderMath
      //@ts-ignore
      MathView.prototype.renderMath = undefined;
      //@ts-ignore
      MathView.prototype.renderMathOld = oldMathFunc;
      //@ts-ignore
      MathView.prototype.afterRender = (ret: any, mathview: any) => {
       /*  mathObj = ydocservice.mathMap?.get('dataURLObj');
        let matDom = (mathview.dom as HTMLElement).getElementsByClassName('katex-display')[0]||(mathview.dom as HTMLElement).getElementsByClassName('math-render')[0]||mathview.dom;
*/
        let nodeDomAttrs = mathview._node.type.spec.toDOM(mathview._node)[1];
        Object.keys(nodeDomAttrs).forEach((key) => {
          ((mathview.dom as HTMLElement).hasAttribute(key) && nodeDomAttrs[key] !== '' && nodeDomAttrs[key]) ? undefined : (mathview.dom as HTMLElement).setAttribute(key, nodeDomAttrs[key]);
        });
        /* let setDataURL = (dataURL: string) => {

          let session = seviceShare.PmDialogSessionService ? seviceShare.PmDialogSessionService!.inSession() : 'nosession';
          if(session !== 'nosession'){
            seviceShare.PmDialogSessionService!.addElement(mathview._node.attrs.math_id,dataURL)
          }else{
            mathObj[mathview._node.attrs.math_id] = dataURL;
            ydocservice.mathMap?.set('dataURLObj', mathObj)
          }
        }
        mathObj = this.ydocService.mathMap?.get('dataURLObj')
        if (!mathObj[mathview._node.attrs.math_id]) {
          setTimeout(() => {
            toCanvas(matDom as HTMLElement).then((canvasData: any) => {
              if (canvasData.toDataURL() == 'data:,') {
                html2canvas(matDom as HTMLElement,{backgroundColor:null}).then((canvasData1) => {
                  setDataURL(canvasData1.toDataURL())
                })
              } else {
                setDataURL(canvasData.toDataURL())
              }
            })
          }, 100)
        } else if (mathview._isEditing) {

          setTimeout(() => {
            toCanvas(matDom as HTMLElement).then((canvasData: any) => {
              if (canvasData.toDataURL() == 'data:,') {
                html2canvas(matDom as HTMLElement,{backgroundColor:null}).then((canvasData1) => {
                  setDataURL(canvasData1.toDataURL())
                })
              } else {
                setDataURL(canvasData.toDataURL())
              }
            })
          }, 100)

          return ret
        } */
      };
      MathView.prototype.renderMath = function renderMath() {
        //@ts-ignore
        let ret = this.renderMathOld()
        //@ts-ignore
        return this.afterRender(ret, this)
      }
    }
    this.serviceShare.WorkerService!.logToWorker('rendering prosemirrors')
  }

  setIntFunction(interpulateFunction: any) {
    this.interpolateTemplate = interpulateFunction
  }
}


