import { Injectable } from '@angular/core';
import { PluginKey, Plugin, EditorState } from 'prosemirror-state';
import { ContentType, Item, UndoManager, XmlElement, XmlFragment, XmlText } from 'yjs';
import { ServiceShare } from '../services/service-share.service';
import { Dropdown, undoItem as undoItemPM, redoItem as redoItemPM, undoItem } from "prosemirror-menu"
//@ts-ignore
import { MenuItem } from '../utils/prosemirror-menu-master/src/index.js'
//@ts-ignore
import { getRelativeSelectionV2,restoreRelativeSelection } from '../../y-prosemirror-src/plugins/sync-plugin.js'
//@ts-ignore
import { ySyncPluginKeyObj } from '../../y-prosemirror-src/plugins/keys.js'
import { redoIcon, undoIcon } from './menu/menuItems';
import { YdocService } from '../services/ydoc.service';
import { YArray } from 'yjs/dist/src/internals';
import { iif } from 'rxjs';
import { AnyTxtRecord } from 'dns';
import { EditorView } from 'prosemirror-view';
interface undoServiceItem {
  editors: string[],
  selections:any[],
  undoItemMeta?: any,
  finished?: true,
  startSel?:{from:number,to:number},
  endSel?:{from:number,to:number}
}

@Injectable({
  providedIn: 'root'
})
export class YjsHistoryService {
  YjsHistoryKey: PluginKey
  preventingCaptureOfBigNumberOfTransactions = false;
  preventingCaptureOfBigSmallOfTransactions = false;
  mainProsemirrorUndoManagers: { [key: string]: UndoManager } = {}

  undoStack: undoServiceItem[] = [];
  redoStack: undoServiceItem[] = [];

  capturingNewItem = false;
  stopCapturing = false;
  timer: number = 0;

  captureTimeout = 1500;

  calcSel(stackItem:any,pmSel:any){
    let delCl = stackItem.deletions.clients
    let insCl = stackItem.insertions.clients
    let from = pmSel.to;
    let to = pmSel.to;
    if(delCl.size > 0&&insCl.size > 0){ // we have ins and del so the transaction is replace of a selection with different start and end
      insCl.forEach(cl=>{
        cl.forEach(tr=>{
        from-=tr.len
          to-=tr.len
        })
      })
      delCl.forEach(cl=>{
        cl.forEach(tr=>{
          to+=tr.len
        })
      })
    }else if(delCl.size > 0&&insCl.size == 0){
      delCl.forEach((cl:any)=>{
        cl.forEach(tr=>{
          to+=tr.len
          from+=tr.len
        })
      })
    }else if(delCl.size == 0&&insCl.size > 0){
      insCl.forEach((cl:any)=>{
        cl.forEach(tr=>{
          to-=tr.len
          from-=tr.len
        })
      })
    }
    return {from,to}
  }

  constructor(
    private serviceShare: ServiceShare,
    private ydocService: YdocService,
  ) {
    serviceShare.shareSelf('YjsHistoryService', this)
    let YjsHistoryKey = new PluginKey('yjsHistory');
    this.YjsHistoryKey = YjsHistoryKey;


    let initData = () => {


    }
    if (this.ydocService.editorIsBuild) {
      initData()
    }
    this.ydocService.ydocStateObservable.subscribe((event) => {
      if (event == 'docIsBuild') {
        initData()
      }
    });
  }

  resetHistoryData(){
    this.undoStack = []
    this.redoStack = []
    this.preventingCaptureOfBigNumberOfTransactions = false;
    this.preventingCaptureOfBigSmallOfTransactions = false;
    this.mainProsemirrorUndoManagers = {}
    this.capturingNewItem = false;
    this.stopCapturing = false;
    this.timer = 0;
  }

  deleteUndoManager(id: string) {
    let undoManager = this.mainProsemirrorUndoManagers[id];
    if (undoManager) {
      undoManager.destroy();
      delete this.mainProsemirrorUndoManagers[id]
      this.undoStack.forEach((undoItem,i) => {
        if(undoItem.editors.includes(id)&&undoItem.editors.includes("endEditor")&&undoItem.editors.length == 2){
          undoItem.editors = []
        }else{
          undoItem.editors = undoItem.editors.filter(val => val !== id);
        }
      })
      this.redoStack.forEach((undoItem,i) => {
        if(undoItem.editors.includes(id)&&undoItem.editors.includes("endEditor")&&undoItem.editors.length == 2){
          undoItem.editors = []
        }else{
          undoItem.editors = undoItem.editors.filter(val => val !== id);
        }
      })
      this.undoStack = this.undoStack.filter(val => val.editors.length > 0)
      this.redoStack = this.redoStack.filter(val => val.editors.length > 0)
    }
  }

  createNewUndoStackItem() {
    this.undoStack.unshift({ editors: [],selections:[] })
    this.redoStack = []
    this.clearRedoStacks()
  }

  computeHistoryChange(changeMeta: any,prevSel) {
    if(changeMeta.addToLastUndoItem && this.undoStack.length == 0){
      this.createNewUndoStackItem()
    }
    if ((changeMeta.addNewUndoItem&&!this.capturingBigOperation ) && !(this.capturingNewItem && this.undoStack.length > 0 && !this.undoStack[0].finished)/*&&  !(this.undoStack.length>0&&this.undoStack[0].undoItemMeta&&this.undoStack[0].editors.length == 0&&!this.undoStack[0].finished)  */) {

        this.createNewUndoStackItem()

        this.undoStack[0].editors.unshift(changeMeta.sectionId);
        this.undoStack[0].selections.unshift(prevSel);
        if(this.undoStack.length>1&&this.undoStack[0].editors[0]&&this.undoStack[1].editors[0]&&this.undoStack[0].editors[0]==this.undoStack[1].editors[0]){
          Object.keys(this.mainProsemirrorUndoManagers).forEach((sectionId)=>{
            if(sectionId!==changeMeta.sectionId){
              this.mainProsemirrorUndoManagers[sectionId].stopCapturing()
            }
          })
        }

    } else if (changeMeta.addToLastUndoItem || (this.capturingNewItem && this.undoStack.length > 0 && !this.undoStack[0].finished)) {
      if(!this.undoStack[0].editors.find((val)=>changeMeta.sectionId == val)){

        this.undoStack[0].editors.unshift(changeMeta.sectionId);
        this.undoStack[0].selections.unshift(prevSel);
      }
    }
    /* if(changeMeta.addNewUndoItem||changeMeta.addToLastUndoItem){
      let editorSel = this.serviceShare.ProsemirrorEditorsService.getEditorSelection(changeMeta.sectionId)
        if(changeMeta.addNewUndoItem){
          let sel = this.calcSel(item,editorSel)
          this.undoStack[0].startSel = sel
          this.undoStack[0].endSel = editorSel
        }else if (changeMeta.addToLastUndoItem){
          this.undoStack[0].endSel = editorSel
        }
    } */
  }

  clearRedoStacks() {
    Object.keys(this.mainProsemirrorUndoManagers).forEach((key) => {
      //@ts-ignore
      this.mainProsemirrorUndoManagers[key].clearRedoStack()
    })
  }

  getYjsHistoryPlugin(metadata: any, {
    protectedNodes = new Set(['figures_nodes_container', 'block_figure', 'figure_components_container', 'figure_component', 'figure_descriptions_container', 'figure_description', 'figure_component_description']),
    trackedOrigins = []
  } = {}) {
    let sectionId = metadata.editorID;

    let YjsPluginKey = this.YjsHistoryKey
    let handleKeyDown:(view:EditorView,event:KeyboardEvent)=>boolean = (view,event)=>{
      if(event.key == 'Enter'){
        setTimeout(()=>{
          this.startCapturingNewUndoItem()
        },20)
      }
      return false
    }
    return new Plugin({
      key: YjsPluginKey,
      props:{
        handleKeyDown
      },
      state: {
        init: (initargs:any, state) => {
          // TODO: check if plugin order matches and fix
          const ystate = ySyncPluginKeyObj.ySyncPluginKey.getState(state)
          const undoManager = new UndoManager(ystate.type, {
            captureTimeout: this.captureTimeout,
            deleteFilter: (item: any) => !(item instanceof Item) ||
              !(item.content instanceof ContentType) ||
              !(item.content.type instanceof Text ||
                (item.content.type instanceof XmlElement && protectedNodes.has(item.content.type.nodeName))) ||
              item.content.type._length === 0,
            trackedOrigins: new Set([ySyncPluginKeyObj.ySyncPluginKey].concat(trackedOrigins)),
          })
          this.mainProsemirrorUndoManagers[initargs.sectionName] = undoManager;
          undoManager.on('stack-item-popped', (item: any) => {
            //addremoveCitatsFunc(item);
          })
          return {
            undoManager,
            prevSel: null,
            hasUndoOps: undoManager.undoStack.length > 0,
            hasRedoOps: undoManager.redoStack.length > 0,
            sectionName: initargs.sectionName
          }
        },
        apply: (tr, val, oldState, state) => {
          const ystate = state['y-sync$'];
          const binding = ystate.binding
          const undoManager = val.undoManager as UndoManager
          const hasUndoOps = undoManager.undoStack.length > 0
          const hasRedoOps = undoManager.redoStack.length > 0
          if (tr.steps.length > 0) {
            if (tr.getMeta('addToLastHistoryGroup')) {
            } else {
            }
          }
          if (  binding ) {
            let prevSel = getRelativeSelectionV2(binding, oldState.selection.anchor,oldState.selection.head)
            return {
              undoManager,
              prevSel,
              hasUndoOps,
              hasRedoOps,
              sectionName: val.sectionName
            }
          } else {
            if (hasUndoOps !== val.hasUndoOps || hasRedoOps !== val.hasRedoOps) {
              return Object.assign({}, val, {
                hasUndoOps: undoManager.undoStack.length > 0,
                hasRedoOps: undoManager.redoStack.length > 0
              })
            } else { // nothing changed
              return val
            }
          }
        }
      },
      view: view => {
        //const ystate = ySyncPluginKeyObj.ySyncPluginKey.getState(view.state)
        const undoManager = YjsPluginKey.getState(view.state).undoManager


        undoManager.on('stack-item-added', (item: any) => {
          item.undoRedoMeta.sectionId = sectionId;
          let binding = view.state['y-sync$'].binding
          this.computeHistoryChange(item.undoRedoMeta,YjsPluginKey.getState(view.state).prevSel);
          })
        return {
          destroy: () => {
            undoManager.destroy()
          }
        }
      }
    })
  }

  undoComplexItem(meta: any, action: 'undo' | 'redo') {
    if (meta.type == 'figure') {
      if (action == 'undo') {
        this.serviceShare.CitableElementsService.writeElementDataGlobalV2(meta.data.oldData.cites, meta.data.oldData.elementNumbers, meta.data.oldData.elements,'citation')
      } else {
        this.serviceShare.CitableElementsService.writeElementDataGlobalV2(meta.data.newData.cites, meta.data.newData.elementNumbers, meta.data.newData.elements,'citation')
      }
    } else if (meta.type == 'table'){
      if (action == 'undo') {
        this.serviceShare.CitableElementsService.writeElementDataGlobalV2(meta.data.oldData.cites, meta.data.oldData.elementNumbers, meta.data.oldData.elements,'table_citation')
      } else {
        this.serviceShare.CitableElementsService.writeElementDataGlobalV2(meta.data.newData.cites, meta.data.newData.elementNumbers, meta.data.newData.elements,'table_citation')
      }
    }else /* if (meta.type == 'figure-citation') {
      setTimeout(()=>{
        this.serviceShare.updateCitableElementsViews()
        //this.serviceShare.FiguresControllerService.updateOnlyFiguresView()
      },10)
    }else if(meta.type =='table-citation'){
      setTimeout(()=>{
        this.serviceShare.updateCitableElementsViews()
        //this.serviceShare.CitableTablesService.updateOnlyTablesView()
      },10)
    }else if */ if(meta.type == 'refs-yjs') {
      /* let refsToReturn = action == 'undo' ? meta.data.oldRefs : meta.data.newRefs;
      this.serviceShare.YdocService!.referenceCitationsMap?.set('referencesInEditor', refsToReturn)
      let refs = Object.values(refsToReturn);
      let backEndEditedCount = 0;
      let checkDone = () => {
        if (backEndEditedCount == refs.length) {
          this.serviceShare.RefsApiService.getReferences().subscribe((refs) => {
            this.serviceShare.ProsemirrorEditorsService.dispatchEmptyTransaction();
          })
        }
      }
      refs.forEach((yjsRefInstance: any) => {
        let ref = yjsRefInstance.ref;
        let global = yjsRefInstance.refInstance !== 'local'
        let refType = ref.refType
        let formIOData = ref.refData.formioData;
        this.serviceShare.RefsApiService.editReference(ref, global, formIOData, refType, true).subscribe((editRes) => {
          backEndEditedCount++;
          checkDone();
        }, (err) => {

        })
      }) */
    }else if(meta.type == 'refs-yjs-delete'){
      let refsToSet = action == 'undo' ? meta.data.oldRefs : meta.data.newRefs;

      this.serviceShare.YdocService!.referenceCitationsMap?.set('referencesInEditor', refsToSet)
    } /* else if (meta.type == 'section-drag-drop'){
      let from : number
      let to : number
      let prevContainerId : string
      let newContainerId : string
      if(action == 'undo'){
        from = meta.data.to
        to = meta.data.from
        prevContainerId = meta.data.newContainerId
        newContainerId = meta.data.prevContainerId
      }else if(action == 'redo'){
        from = meta.data.from
        to = meta.data.to
        prevContainerId = meta.data.prevContainerId
        newContainerId = meta.data.newContainerId
      }
      this.serviceShare.TreeService.applyNodeDrag(from,to,prevContainerId,newContainerId);
      this.serviceShare.TreeService.treeVisibilityChange.next({action: 'listNodeDrag', from, to, prevContainerId, newContainerId})
    } */
  }

  undo = (state: EditorState) => {
    this.stopCapturingUndoItem()
    let undoitem = this.undoStack.shift();
    let redoItem: undoServiceItem = { editors: [], finished: true,startSel:undoitem.startSel,endSel:undoitem.endSel ,selections:[]}
    if (undoitem.undoItemMeta) {
      redoItem.undoItemMeta = undoitem.undoItemMeta
      this.undoComplexItem(undoitem.undoItemMeta, 'undo');
    }
    undoitem.editors.forEach((editor,i) => {
      this.mainProsemirrorUndoManagers[editor].undo();
      redoItem.editors.unshift(editor);
      redoItem.selections.unshift(undoitem.selections[i]);
      this.applySelPosition(undoitem,i)

    })
    this.redoStack.unshift(redoItem);
    if (redoItem.editors[0] != 'endEditor'&&redoItem.editors[0]) {
      //this.serviceShare.ProsemirrorEditorsService!.scrollMainEditorIntoView(redoItem.editors[0])
     //this.serviceShare.ProsemirrorEditorsService.changeSelectionOfEditorAndFocus(redoItem.editors[0],redoItem.startSel)
    }
    this.serviceShare.ProsemirrorEditorsService!.dispatchEmptyTransaction()
    /* const undoManager = this.YjsHistoryKey.getState(state).undoManager
    if (undoManager != null) {
      let result = undoManager.undo()

      return true
    } */
    return true
  }

  applySelPosition(undoItem:undoServiceItem,i:number){
    if(i == undoItem.editors.length-1){
      let sectionId = undoItem.editors[i];
      let relSel = undoItem.selections[i];
      let view = this.serviceShare.ProsemirrorEditorsService.editorContainers[sectionId].editorView;
      let editorPmBinding = view.state['y-sync$'].binding;
      let tr = view.state.tr;
      restoreRelativeSelection(tr,relSel,editorPmBinding);
      view.dispatch(tr)
      //this.serviceShare.ProsemirrorEditorsService.applyLastScrollPosition(undoItem.selections[i]);
    }
  }

  canUndo() {
    return this.undoStack.length > 0
  }

  redo = (state: EditorState) => {
    let redoItem = this.redoStack.shift();
    let undoItem: undoServiceItem = { editors: [], finished: true,startSel:redoItem.startSel,endSel:redoItem.endSel ,selections:[]}
    if (redoItem.undoItemMeta) {
      undoItem.undoItemMeta = redoItem.undoItemMeta
      this.undoComplexItem(redoItem.undoItemMeta, 'redo');
    }
    redoItem.editors.forEach((editor,i) => {
      this.mainProsemirrorUndoManagers[editor].redo();
      undoItem.editors.unshift(editor)
      undoItem.selections.unshift(redoItem.selections[i]);
      this.applySelPosition(redoItem,i)
    })
    this.undoStack.unshift(undoItem);
    if (undoItem.editors[0] != 'endEditor'&&undoItem.editors[0]) {
      //this.serviceShare.ProsemirrorEditorsService!.scrollMainEditorIntoView(undoItem.editors[0])
      //this.serviceShare.ProsemirrorEditorsService.changeSelectionOfEditorAndFocus(undoItem.editors[0],redoItem.endSel)
    }
    this.serviceShare.ProsemirrorEditorsService!.dispatchEmptyTransaction()

    /* const undoManager = this.YjsHistoryKey.getState(state).undoManager
    if (undoManager != null) {
      let result = undoManager.redo()
      return true
    } */
    return true
  }


  canRedo() {
    return this.redoStack.length > 0
  }

  undoYjs() {
    return new MenuItem({
      icon: undoIcon,
      label: "undo",
      enable: (state: EditorState) => { return this.canUndo() },
      //@ts-ignore
      run: this.undo
    })
  }

  redoYjs() {
    return new MenuItem({
      icon: redoIcon,
      label: "redo",
      enable: (state: EditorState) => { return this.canRedo() },
      //@ts-ignore
      run: this.redo
    })
  }

  startCapturingNewUndoItem() {
    if (this.undoStack.length > 0) {
      this.undoStack[0].finished = true;
    }
    this.capturingNewItem = true;
    Object.values(this.mainProsemirrorUndoManagers).forEach((undoManager) => {
      //@ts-ignore
      undoManager.captureNewStackItem()
    })

  }

  addUndoItemInformation(info: { type: 'refs-yjs-delete'|'figure'|'table'|'table-citation' | 'refs-yjs' | 'figure-citation' | 'section-drag-drop', data: any ,addnewItem?:true}) {
    if(this.preventingCaptureOfBigNumberOfTransactions&&info.type == 'refs-yjs-delete'){
      return;
    }
    if (!info.addnewItem&&(this.undoStack.length == 0 || (this.undoStack.length > 0 && this.undoStack[0].finished))) {
      this.createNewUndoStackItem()
    }
    this.undoStack[0].undoItemMeta = info
    /* if (info.type == 'figure') {
      // add undoitem data to last undo item
    } else if (info.type == 'refs-yjs') {
      this.undoStack[0].undoItemMeta = info
    } else if (info.type == 'figure-citation') {
      this.undoStack[0].undoItemMeta = info
    } */
  }

  stopCapturingUndoItem() {
    if(this.capturingNewItem){
      this.capturingNewItem = false;
      if (this.undoStack.length > 0) {
        this.undoStack[0].finished = true;
      }
      Object.values(this.mainProsemirrorUndoManagers).forEach((undoManager) => {
        //@ts-ignore
        undoManager.captureNewStackItem()
      })

    }
  }

  capturingBigOperation = false;
  captureBigOperation(){
    this.capturingBigOperation = true;
  }

  endBigOperationCapture(){
    this.capturingBigOperation = false;
    if(this.undoStack[0]){
      this.undoStack[0].finished;
    }
  }

  preventCaptureOfBigNumberOfUpcomingItems() {
    this.serviceShare.ProsemirrorEditorsService.ySyncPluginKeyObj.origin = null
    this.preventingCaptureOfBigNumberOfTransactions = true
  }

  stopBigNumberItemsCapturePrevention() {
    if (this.preventingCaptureOfBigNumberOfTransactions) {
      this.serviceShare.ProsemirrorEditorsService.ySyncPluginKeyObj.origin = this.serviceShare.ProsemirrorEditorsService.ySyncKey
      this.preventingCaptureOfBigNumberOfTransactions = false
    }
  }

  preventCaptureOfLessUpcommingItems() {
    if (!this.preventingCaptureOfBigNumberOfTransactions) {
      this.serviceShare.ProsemirrorEditorsService.ySyncPluginKeyObj.origin = null
      this.preventingCaptureOfBigSmallOfTransactions = true;
    }
  }

  stopLessItemsCapturePrevention() {
    if (!this.preventingCaptureOfBigNumberOfTransactions && this.preventingCaptureOfBigSmallOfTransactions) {
      this.serviceShare.ProsemirrorEditorsService.ySyncPluginKeyObj.origin = this.serviceShare.ProsemirrorEditorsService.ySyncKey
      this.preventingCaptureOfBigSmallOfTransactions = false;
    }
  }

  addIncommingTransactionsToEnd
}
