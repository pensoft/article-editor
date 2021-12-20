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
  makeBlockMathInputRule,
  makeInlineMathInputRule,
  mathBackspaceCmd,
  mathPlugin,
  mathSerializer,
  REGEX_BLOCK_MATH_DOLLARS,
  REGEX_INLINE_MATH_DOLLARS
} from '@benrbray/prosemirror-math';
import { DOMSerializer, Node, Slice } from 'prosemirror-model';
//@ts-ignore
import { EditorView } from 'prosemirror-view';
import { EditorState, Plugin, PluginKey, Transaction, TextSelection, Selection } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
//import { redo, undo, yCursorPlugin, yDocToProsemirrorJSON, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import { chainCommands, deleteSelection, joinBackward, selectNodeBackward } from 'prosemirror-commands';
//@ts-ignore
import { redo, undo, yCursorPlugin, yDocToProsemirrorJSON, ySyncPlugin, yUndoPlugin } from '../../y-prosemirror-src/y-prosemirror.js';
import { CellSelection, columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
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
import { FormControl, FormGroup } from '@angular/forms';
import { TreeService } from '../meta-data-tree/tree-service/tree.service';
import { DOMParser } from 'prosemirror-model';

//@ts-ignore
import { menuBar } from '../utils/prosemirror-menu-master/src/menubar.js'
import { Form } from 'formiojs';
import { FormioControl } from 'src/app/formio-angular-material/FormioControl';
import { I } from '@angular/cdk/keycodes';
import { ReplaceAroundStep } from 'prosemirror-transform';
import { ViewFlags } from '@angular/compiler/src/core';
import { handleClick, handleDoubleClick as handleDoubleClickFN, handleKeyDown, handlePaste, createSelectionBetween, handleTripleClickOn, preventDragDropCutOnNoneditablenodes, updateControlsAndFigures, handleClickOn, selectWholeCitatMarks } from '../utils/prosemirrorHelpers';
//@ts-ignore
import { recreateTransform } from "prosemirror-recreate-steps"
import { figure } from '../utils/interfaces/figureComponent';
import { CitatContextMenuService } from '../utils/citat-context-menu/citat-context-menu.service';
@Injectable({
  providedIn: 'root'
})
export class ProsemirrorEditorsService {

  ydoc?: Y.Doc;
  //provider?: WebrtcProvider;
  provider?: WebsocketProvider;

  articleSectionsStructure?: articleSection[];
  initDocumentReplace: any = {};
  editorContainers: {[key:string]:{
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  } } = {}
  xmlFragments: { [key: string]: Y.XmlFragment } = {}

  interpolateTemplate:any

  DOMPMSerializer = DOMSerializer.fromSchema(schema);

  color = random.oneOf(userSpec.colors);
  user = random.oneOf(userSpec.testUsers);
  colorMapping: Map<string, ColorDef> = new Map([[this.user.username, this.color],]);
  permanentUserData?: Y.PermanentUserData;
  colors = userSpec.colors;
  menu: any = buildMenuItems(schema);
  inlineMathInputRule = makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, schema.nodes.math_inline);
  blockMathInputRule = makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, schema.nodes.math_display);

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
  userData:any
  
  citatEditingSubject:Subject<any> = new Subject<any>()
  deletedCitatsInPopUp :{[key:string]:string[]}= {}
  rerenderFigures:any
  setFigureRerenderFunc = (fn:any)=>{
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
    private citatContextPluginService:CitatContextMenuService,
    private trackChangesService: TrackChangesService) {

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

    this.citatEditingSubject.subscribe((data)=>{
      if(data.action == 'delete'){
        if(!this.deletedCitatsInPopUp[data.sectionID]){
          this.deletedCitatsInPopUp[data.sectionID] = [data.citatID]
        }else{
          this.deletedCitatsInPopUp[data.sectionID].push(data.citatID)
        }
      }else if(data.action == "clearDeletedCitatsFromPopup"){
        Object.keys(this.deletedCitatsInPopUp).forEach((sectionID)=>{
          delete this.deletedCitatsInPopUp[sectionID];
        })
      }else if(data.action == "deleteCitatsFromDocument"){
        let citatsObj = this.ydocService.figuresMap?.get('articleCitatsObj');
        Object.keys(this.deletedCitatsInPopUp).forEach((sectionID)=>{
          this.deletedCitatsInPopUp[sectionID].forEach((citatid)=>{
            citatsObj[sectionID][citatid] = undefined
          })
          delete this.deletedCitatsInPopUp[sectionID];
        })
        this.ydocService.figuresMap?.set('articleCitatsObj',citatsObj);
        this.rerenderFigures(citatsObj)
      }
    })
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

  dispatchEmptyTransaction() {  // for updating the view
    Object.values(this.editorContainers).forEach((container: any) => {
      let editorState = container.editorView.state as EditorState
      container.editorView.dispatch(editorState.tr.setMeta('emptyTR',true))
    })
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
    console.log(permanentUserData);
    let yjsPlugins = [ySyncPlugin(xmlFragment, { colors, colorMapping, permanentUserData }),
    yCursorPlugin(this.provider!.awareness,this.userData),
    yUndoPlugin()]


    container.setAttribute('class', 'editor-container');
    let defaultMenu = this.menuService.attachMenuItems(this.menu, this.ydoc!, 'SimpleMenu', editorID);
    let fullMenu = this.menuService.attachMenuItems(this.menu, this.ydoc!, 'fullMenu', editorID);
    this.initDocumentReplace[editorID] = true;
    let transactionControllerPluginKey = new PluginKey('transactionControllerPlugin');
    let GroupControl = this.treeService.sectionFormGroups;
    let transactionControllerPlugin = new Plugin({
      key: transactionControllerPluginKey,
      appendTransaction: updateControlsAndFigures(schema,this.ydocService.figuresMap!,this.editorContainers,this.rerenderFigures,this.interpolateTemplate,GroupControl,section ),
      filterTransaction: preventDragDropCutOnNoneditablenodes(this.ydocService.figuresMap!,this.rerenderFigures,editorID),
    })

    let selectWholeCitatPluginKey = new PluginKey('selectWholeCitat');
    let selectWholeCitat = new Plugin({
      key: selectWholeCitatPluginKey,
      props:{
        createSelectionBetween:selectWholeCitatMarks
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
        selectWholeCitat,
        this.detectFocusService.getPlugin(),
        this.commentsService.getPlugin(),
        this.trackChangesService.getHideShowPlugin(),
        this.citatContextPluginService.citatContextPlugin,
        this.linkPopUpPluginService.linkPopUpPlugin,
        inputRules({ rules: [this.inlineMathInputRule, this.blockMathInputRule] }),
        ...menuBar({
          floating: true,
          content: { 'main': defaultMenu, fullMenu }, containerClass: menuContainerClass
        })
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
        if (lastStep == transaction.steps[0]&&!transaction.getMeta('emptyTR')) {
          if (lastStep) { return }
        }
        lastStep = transaction.steps[0]
        if (this.initDocumentReplace[editorID] || !this.shouldTrackChanges||transaction.getMeta('shouldTrack')==false) {
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
      } catch (err) { console.error(err); }
    };

    editorView = new EditorView(container, {
      state: edState,
      clipboardTextSerializer: (slice: Slice) => {
        return mathSerializer.serializeSlice(slice);
      },
      editable: (state: EditorState) => {
        return !this.mobileVersion /* && this.editorsEditableObj[editorID] */
        // mobileVersion is true when app is in mobile mod | editable() should return return false to set editor not editable so we return !mobileVersion
      },
      handleDOMEvents:{
          contextmenu:(view,event)=>{
            if(this.citatContextPluginService.citatContextPluginKey.getState(view.state).decorations){
              event.preventDefault();
              event.stopPropagation();
              return true
            }
            return false
          }
      },
      dispatchTransaction,
      handlePaste,
      handleClick: handleClick(hideshowPluginKEey,this.citatContextPluginService.citatContextPluginKey),
      handleClickOn:handleClickOn(this.citatContextPluginService.citatContextPluginKey),
      handleTripleClickOn,
      handleDoubleClick: handleDoubleClickFN(hideshowPluginKEey),
      handleKeyDown,
      handleDrop:(view: EditorView, event: Event, slice: Slice, moved: boolean)=>{
        slice.content.nodesBetween(0,slice.content.size-2,(node,pos,parent)=>{
          if(node.marks.filter((mark)=>{return mark.type.name == 'citation'}).length>0){
            let citationMark = node.marks.filter((mark)=>{return mark.type.name == 'citation'})[0];
            //@ts-ignore
            if(!event.ctrlKey){  // means that the drag is only moving the selected not a copy of the selection -> without Ctrl
    
            }else{      // the drag is moving a copy of the selection        
              //@ts-ignore
              let dropPosition =  view.posAtCoords({left:event.clientX,top:event.clientY}).pos + pos - slice.openStart
              setTimeout(()=>{
                let newMark = view.state.doc.nodeAt(dropPosition)
                view.dispatch(view.state.tr.addMark(dropPosition,dropPosition + newMark?.nodeSize!,schema.mark('citation',{...citationMark.attrs,citateid:random.uuidv4()})))
              },10)
            }
            console.log(view.dragging,event,slice,moved);
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
    return editorCont
  }

  renderDocumentEndEditor(EditorContainer: HTMLDivElement,figures:figure[]): {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  }{
    let editorId = 'endEditor'
    let hideshowPluginKEey = this.trackChangesService.hideshowPluginKey;

    if (this.editorContainers[editorId]) {
      EditorContainer.appendChild(this.editorContainers[editorId].containerDiv);
      return this.editorContainers[editorId]
    }
    let transactionControllerPluginKey = new PluginKey('transactionControllerPlugin');
    let transactionControllerPlugin = new Plugin({
      key: transactionControllerPluginKey,
      appendTransaction: updateControlsAndFigures(schema,this.ydocService.figuresMap!,this.editorContainers,this.rerenderFigures,this.interpolateTemplate),
      filterTransaction: preventDragDropCutOnNoneditablenodes(this.ydocService.figuresMap!,this.rerenderFigures,editorId),
    })
    //let inlineMathInputRule = makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, endEditorSchema!.nodes.math_inline);
    //let blockMathInputRule = makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, endEditorSchema!.nodes.math_display);

    let container = document.createElement('div');
    let editorView: EditorView;
    let colors = this.colors
    let colorMapping = this.colorMapping
    let permanentUserData = this.permanentUserData
    let editorID = editorId;

    let menuContainerClass = "menu-container";
    let xmlFragment = this.getXmlFragment('documentMode', editorID)
    let yjsPlugins = [ySyncPlugin(xmlFragment, { colors, colorMapping, permanentUserData }),
    yCursorPlugin(this.provider!.awareness,this.userData),
    yUndoPlugin()]

    container.setAttribute('class', 'editor-container');
    let menu = buildMenuItems(schema);
    let defaultMenu = this.menuService.attachMenuItems(menu, this.ydoc!, 'SimpleMenu', editorID);
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
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo,
          //'Mod-Space': insertMathCmd(endEditorSchema!.nodes.math_inline),
          'Backspace': chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
          'Tab': goToNextCell(1),
          'Shift-Tab': goToNextCell(-1)
        }),
        //columnResizing({}),
        //tableEditing(),
        this.placeholderPluginService.getPlugin(),
        transactionControllerPlugin,
        this.detectFocusService.getPlugin(),
        this.commentsService.getPlugin(),
        this.trackChangesService.getHideShowPlugin(),
        this.linkPopUpPluginService.linkPopUpPlugin,
        //inputRules({ rules: [inlineMathInputRule, blockMathInputRule] }),
        ...menuBar({
          floating: true,
          content: { 'main': defaultMenu/* , fullMenu */ }, containerClass: menuContainerClass
        })
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
        if (this.initDocumentReplace[editorID] || !this.shouldTrackChanges ||transaction.getMeta('shouldTrack')==false) {
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
      } catch (err) { console.error(err); }
    };

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
      handlePaste,
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
    if (!nodesArray) {
      doc = schema.nodes.doc.create({}, schema.nodes.form_field.create({}, schema.nodes.paragraph.create({})))
    } else {
      doc = schema.nodes.doc.create({}, schema.nodes.form_field.create({}, nodesArray.content))
    }
    let menuContainerClass = "popup-menu-container";

    container.setAttribute('class', 'editor-container');

    let filterTransaction = false
    let defaultMenu = this.menuService.attachMenuItems(this.menu, this.ydoc!, 'SimpleMenuPMundoRedo');
    let fullMenu = this.menuService.attachMenuItems(this.menu, this.ydoc!, 'fullMenuPMundoRedo');

    let transactionControllerPluginKey = new PluginKey('transactionControllerPlugin');

    let transactionControllerPlugin = new Plugin({
      key: transactionControllerPluginKey,
      props:{
        createSelectionBetween:selectWholeCitatMarks
      },
      state:{
        init(config){
          return {sectionID:config.sectionID}
        },
        apply(tr, prev, _, newState){
          return prev
        }
      },
      appendTransaction: (trs: Transaction<any>[], oldState: EditorState, newState: EditorState) => {
        let containerElement = document.createElement('div');
        let htmlNOdeRepresentation = this.DOMPMSerializer.serializeFragment(newState.doc.content.firstChild!.content)
        containerElement.appendChild(htmlNOdeRepresentation);
        options.onChange(true, containerElement.innerHTML)
      },
      filterTransaction:preventDragDropCutOnNoneditablenodes(this.ydocService.figuresMap!,this.rerenderFigures,sectionID,this.citatEditingSubject)

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

    

    let edState = EditorState.create({
      doc,
      schema: schema,
      plugins: [
        mathPlugin,
        keymap({
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
          content: { 'main': defaultMenu, fullMenu }, containerClass: menuContainerClass
        })
      ].concat(exampleSetup({ schema, /* menuContent: fullMenuWithLog, */ containerClass: menuContainerClass }))
      ,
      // @ts-ignore
      sectionName: editorID,
      sectionID:sectionID,
      editorType: 'popupEditor'
    });
    setTimeout(() => {
      this.initDocumentReplace[editorID] = false;
    }, 600);

    this.editorsEditableObj[editorID] = true
    let lastStep: any
    const dispatchTransaction = (transaction: Transaction) => {
      this.transactionCount++
      try {
        if (lastStep == transaction.steps[0]) {
          if (lastStep) { return }
        }
        lastStep = transaction.steps[0]
        if (this.initDocumentReplace[editorID] || !this.shouldTrackChanges||transaction.getMeta('shouldTrack')==false) {
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

  init() {
    let data = this.ydocService.getData();
    this.userData = data.userData
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
  }

  setIntFunction(interpulateFunction:any){
    this.interpolateTemplate = interpulateFunction
  }
}


