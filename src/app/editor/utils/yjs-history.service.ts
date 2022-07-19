import { Injectable } from '@angular/core';
import { PluginKey, Plugin, EditorState } from 'prosemirror-state';
import { ContentType, Item, UndoManager, XmlElement, XmlFragment, XmlText } from 'yjs';
import { ServiceShare } from '../services/service-share.service';
import { Dropdown, undoItem as undoItemPM, redoItem as redoItemPM, undoItem } from "prosemirror-menu"
//@ts-ignore
import { MenuItem } from '../utils/prosemirror-menu-master/src/index.js'
//@ts-ignore
import { getRelativeSelection } from '../../y-prosemirror-src/plugins/sync-plugin.js'
//@ts-ignore
import { ySyncPluginKey } from '../../y-prosemirror-src/plugins/keys.js'
import { redoIcon, undoIcon } from './menu/menuItems';
import { YdocService } from '../services/ydoc.service';
import { YArray } from 'yjs/dist/src/internals';
import { iif } from 'rxjs';
import { AnyTxtRecord } from 'dns';

interface undoServiceItem {
  editors: string[],
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
      this.undoStack.forEach((undoItem) => {
        undoItem.editors = undoItem.editors.filter(val => val !== id);
      })
      this.redoStack.forEach((undoItem) => {
        undoItem.editors = undoItem.editors.filter(val => val !== id);
      })
      this.undoStack = this.undoStack.filter(val => val.editors.length > 0)
      this.redoStack = this.redoStack.filter(val => val.editors.length > 0)
    }
  }

  createNewUndoStackItem() {
    this.undoStack.unshift({ editors: [] })
  }

  computeHistoryChange(changeMeta: any,item:any,itemWithMeta:any) {
    if (changeMeta.addNewUndoItem && !(this.capturingNewItem && this.undoStack.length > 0 && !this.undoStack[0].finished)/*&&  !(this.undoStack.length>0&&this.undoStack[0].undoItemMeta&&this.undoStack[0].editors.length == 0&&!this.undoStack[0].finished)  */) {

        this.createNewUndoStackItem()

        this.undoStack[0].editors.unshift(changeMeta.sectionId);
        if(this.undoStack.length>1&&this.undoStack[0].editors[0]&&this.undoStack[1].editors[0]&&this.undoStack[0].editors[0]==this.undoStack[1].editors[0]){
          Object.keys(this.mainProsemirrorUndoManagers).forEach((sectionId)=>{
            if(sectionId!==changeMeta.sectionId){
              this.mainProsemirrorUndoManagers[sectionId].stopCapturing()
            }
          })
        }

        this.redoStack = []
        this.clearRedoStacks()
    } else if (changeMeta.addToLastUndoItem || (this.capturingNewItem && this.undoStack.length > 0 && !this.undoStack[0].finished)) {
      if(!this.undoStack[0].editors.find((val)=>changeMeta.sectionId == val)){
        this.undoStack[0].editors.unshift(changeMeta.sectionId);
      }
      this.clearRedoStacks()
    }
    if(changeMeta.addNewUndoItem||changeMeta.addToLastUndoItem){
      let editorSel = this.serviceShare.ProsemirrorEditorsService.getEditorSelection(changeMeta.sectionId)
        if(changeMeta.addNewUndoItem){
          let sel = this.calcSel(item,editorSel)
          this.undoStack[0].startSel = sel
          this.undoStack[0].endSel = editorSel
        }else if (changeMeta.addToLastUndoItem){
          this.undoStack[0].endSel = editorSel
        }
    }
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
    let figuresMap = metadata.figuresMap;
    let renderFigures = metadata.renderFigures;

    let YjsPluginKey = this.YjsHistoryKey
    let citatsObj = figuresMap.get('articleCitatsObj');
    let addremoveCitatsFunc = (item: any) => {
      let changedItems = item.changedParentTypes
      let iterator = changedItems.entries()
      let element = iterator.next();
      let elValue = element.value
      let xmlEl;
      if (elValue && elValue[0] instanceof XmlText) {
        xmlEl = elValue[0];
      }
      while (!element.done && !(xmlEl instanceof XmlText)) {
        element = iterator.next();
        elValue = element.value
        if (elValue && elValue[0] instanceof XmlText) {
          xmlEl = elValue[0];
        }
      }
      if (xmlEl) {
        let delta = xmlEl.toDelta()
        let newCitatsCount = 0;
        let newCitats: any[] = []
        delta.forEach((element: any) => {
          let attributes = element.attributes;
          if (attributes) {
            Object.keys(attributes).forEach((key) => {
              if (key == 'citation') {
                newCitatsCount++
                let citatAtributes = attributes[key];
                newCitats.push(citatAtributes)
              }
            })
          }
        })

        let oldC = item.stackItem.meta.citatData || [];
        let newC = newCitats || [];
        let citatsToRemove = oldC.filter((element: any) => {
          return newC.filter((el) => { return el.citateid == element.citateid }).length == 0;
        })
        let citatsToAdd = newC.filter((element) => {
          return oldC.filter((el: any) => { return el.citateid == element.citateid }).length == 0;
        })
        if (oldC.length > newC.length) {
          citatsToRemove.forEach((citatData: any) => {
            citatsObj[sectionId][citatData.citateid] = undefined
          })

        } else if (oldC.length < newC.length) {

          citatsToAdd.forEach((citatData) => {
            /* {
                "figureIDs": [
                    "5672f573-3349-4b2e-aa7a-2a90fbc3b88f|3"
                ],
                "position": 1374,
                "lastTimeUpdated": 1642428807052,
                "displaydFiguresViewhere": []
            } */
            citatsObj[sectionId][citatData.citateid] = {
              "figureIDs": citatData.citated_figures,
              "lastTimeUpdated": new Date().getTime(),
              "displaydFiguresViewhere": []
            }
          })
        }
        if (oldC.length !== newC.length && renderFigures) {
          setTimeout(() => {
            renderFigures(citatsObj)
          }, 10)
        }
      }
    }
    return new Plugin({
      key: YjsPluginKey,
      state: {
        init: (initargs, state) => {
          // TODO: check if plugin order matches and fix
          const ystate = ySyncPluginKey.getState(state)
          const undoManager = new UndoManager(ystate.type, {
            captureTimeout: this.captureTimeout,
            deleteFilter: (item: any) => !(item instanceof Item) ||
              !(item.content instanceof ContentType) ||
              !(item.content.type instanceof Text ||
                (item.content.type instanceof XmlElement && protectedNodes.has(item.content.type.nodeName))) ||
              item.content.type._length === 0,
            trackedOrigins: new Set([ySyncPluginKey].concat(trackedOrigins)),
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
          const binding = ySyncPluginKey.getState(state).binding
          const undoManager = val.undoManager as UndoManager
          const hasUndoOps = undoManager.undoStack.length > 0
          const hasRedoOps = undoManager.redoStack.length > 0
          if (tr.steps.length > 0) {
            if (tr.getMeta('addToLastHistoryGroup')) {
            } else {
            }
          }
          if (binding) {
            return {
              undoManager,
              prevSel: getRelativeSelection(binding, oldState),
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
        const ystate = ySyncPluginKey.getState(view.state)
        const undoManager = YjsPluginKey.getState(view.state).undoManager
        undoManager.on('stack-item-added', ({ stackItem }: { stackItem: any }) => {
          const binding = ystate.binding
          if (binding) {
            stackItem.meta.set(binding, YjsPluginKey.getState(view.state).prevSel)
          }
        })
        undoManager.on('stack-item-popped', ({ stackItem }: { stackItem: any }) => {
          const binding = ystate.binding
          if (binding) {
            binding.beforeTransactionSelection = stackItem.meta.get(binding) || binding.beforeTransactionSelection
          }
        })
        undoManager.on('stack-item-added', (item: any) => {
          item.undoRedoMeta.sectionId = sectionId;

          //if(item.type!=='undo'&&item.type!=='redo'){
          this.computeHistoryChange(item.undoRedoMeta,item.stackItem,item);
          //}
          /*let changedItems = item.changedParentTypes
          let iterator = changedItems.entries()
          let element = iterator.next();
          let elValue = element.value
           let xmlEl;
          if (elValue && elValue[0] instanceof XmlText) {
            xmlEl = elValue[0];
          }

          while (!element.done && !(xmlEl instanceof XmlText)) {
            element = iterator.next();
            elValue = element.value
            if (elValue && elValue[0] instanceof XmlText) {
              xmlEl = elValue[0];
            }
          }
          if (xmlEl) {
            let delta = xmlEl.toDelta()
            delta.forEach((element: any, index: any) => {
              let attributes = element.attributes;
              if (attributes) {
                Object.keys(attributes).forEach((key) => {
                  if (key == 'citation') {
                    let citatAtributes = attributes[key];
                    if (!item.stackItem.meta.citatData) {
                      item.stackItem.meta.citatData = [];
                    }
                    if (item.stackItem.meta.citatData.filter((attrs: any) => { return attrs.citateid == citatAtributes.citateid }).length == 0) {
                      item.stackItem.meta.citatData.push(citatAtributes);
                    }
                  }
                })
              }
            })
          } */
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
        this.serviceShare.FiguresControllerService.writeFiguresDataGlobalV2(meta.data.oldData.articleCitatsObj, meta.data.oldData.ArticleFiguresNumbers, meta.data.oldData.ArticleFigures)
      } else {
        this.serviceShare.FiguresControllerService.writeFiguresDataGlobalV2(meta.data.newData.articleCitatsObj, meta.data.newData.ArticleFiguresNumbers, meta.data.newData.ArticleFigures)
      }
    } else if (meta.type == 'figure-citation') {
      setTimeout(()=>{
        this.serviceShare.FiguresControllerService.updateOnlyFiguresView()
      },10)
    } else if(meta.type == 'figure-citation-and-text'){
      setTimeout(()=>{
        this.serviceShare.FiguresControllerService.updateFiguresAndFiguresCitations()
      },10)
    }else if (meta.type == 'refs-yjs') {
      let refsToReturn = action == 'undo' ? meta.data.oldRefs : meta.data.newRefs;
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
      })
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
    let redoItem: undoServiceItem = { editors: [], finished: true,startSel:undoitem.startSel,endSel:undoitem.endSel }
    if (undoitem.undoItemMeta) {
      redoItem.undoItemMeta = undoitem.undoItemMeta
      this.undoComplexItem(undoitem.undoItemMeta, 'undo');
    }
    undoitem.editors.forEach((editor) => {

      this.mainProsemirrorUndoManagers[editor].undo();
      redoItem.editors.unshift(editor)
    })
    this.redoStack.unshift(redoItem);
    if (redoItem.editors[0] != 'endEditor'&&redoItem.editors[0]) {
      this.serviceShare.ProsemirrorEditorsService!.scrollMainEditorIntoView(redoItem.editors[0])
      this.serviceShare.ProsemirrorEditorsService.changeSelectionOfEditorAndFocus(redoItem.editors[0],redoItem.startSel)
    }
    this.serviceShare.ProsemirrorEditorsService!.dispatchEmptyTransaction()
    /* const undoManager = this.YjsHistoryKey.getState(state).undoManager
    if (undoManager != null) {
      let result = undoManager.undo()

      return true
    } */
    console.log('undo redo stacks',this.undoStack, this.redoStack);
    return true
  }

  canUndo() {
    return this.undoStack.length > 0
  }

  redo = (state: EditorState) => {
    let redoItem = this.redoStack.shift();
    let undoItem: undoServiceItem = { editors: [], finished: true,startSel:redoItem.startSel,endSel:redoItem.endSel }
    if (redoItem.undoItemMeta) {
      undoItem.undoItemMeta = redoItem.undoItemMeta
      this.undoComplexItem(redoItem.undoItemMeta, 'redo');
    }
    redoItem.editors.forEach((editor) => {
      this.mainProsemirrorUndoManagers[editor].redo();
      undoItem.editors.unshift(editor)
    })
    this.undoStack.unshift(undoItem);
    if (undoItem.editors[0] != 'endEditor'&&undoItem.editors[0]) {
      this.serviceShare.ProsemirrorEditorsService!.scrollMainEditorIntoView(undoItem.editors[0])
      this.serviceShare.ProsemirrorEditorsService.changeSelectionOfEditorAndFocus(undoItem.editors[0],redoItem.endSel)
    }
    this.serviceShare.ProsemirrorEditorsService!.dispatchEmptyTransaction()

    /* const undoManager = this.YjsHistoryKey.getState(state).undoManager
    if (undoManager != null) {
      let result = undoManager.redo()
      return true
    } */
    console.log('undo redo stacks',this.undoStack, this.redoStack);
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

  addUndoItemInformation(info: { type: 'refs-yjs-delete'|'figure' | 'refs-yjs' | 'figure-citation' | 'section-drag-drop'|'figure-citation-and-text', data: any ,addnewItem?:true}) {

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
