import { Injectable } from '@angular/core';
import { PluginKey, Plugin, EditorState } from 'prosemirror-state';
import { ContentType, Item,  UndoManager,XmlElement, XmlFragment, XmlText } from 'yjs';
import { ServiceShare } from '../services/service-share.service';
import { Dropdown,  undoItem as undoItemPM, redoItem as redoItemPM, undoItem } from "prosemirror-menu"
//@ts-ignore
import {MenuItem} from '../utils/prosemirror-menu-master/src/index.js'
//@ts-ignore
import { getRelativeSelection } from '../../y-prosemirror-src/plugins/sync-plugin.js'
//@ts-ignore
import {ySyncPluginKey} from '../../y-prosemirror-src/plugins/keys.js'
import { redoIcon, undoIcon } from './menu/menuItems';
import { YdocService } from '../services/ydoc.service';
import { YArray } from 'yjs/dist/src/internals';
@Injectable({
  providedIn: 'root'
})
export class YjsHistoryService {
  YjsHistoryKey: PluginKey

  mainProsemirrorUndoManagers : {[key:string]:UndoManager} = {}

  undoStack:string[] = [];
  redoStack:string[] = [];

  constructor(
    private serviceShare: ServiceShare,
    private ydocService:YdocService,
    ) {
    serviceShare.shareSelf('YjsHistoryService', this)
    let YjsHistoryKey = new PluginKey('yjsHistory');
    this.YjsHistoryKey = YjsHistoryKey;


    let initData = () =>{


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

  deleteUndoManager(id:string){
    let undoManager = this.mainProsemirrorUndoManagers[id];
    if(undoManager){
      undoManager.destroy();
      delete this.mainProsemirrorUndoManagers[id]
      this.undoStack = this.undoStack.filter(val => val!==id)
      this.redoStack = this.redoStack.filter(val => val!==id)
    }
  }

  computeHistoryChange(changeMeta:any){
    if(changeMeta.addingNewItem){
      if(changeMeta.status == 'capturing'){
        this.undoStack.unshift(changeMeta.sectionId)
        this.redoStack = []
        this.clearRedoStacks()
      }
    }else if(changeMeta.addingToLastItem){

    }
  }

  clearRedoStacks(){
    Object.keys(this.mainProsemirrorUndoManagers).forEach((key)=>{
      //@ts-ignore
      this.mainProsemirrorUndoManagers[key].clearRedoStack()
    })
  }

  getYjsHistoryPlugin(metadata: any, { protectedNodes = new Set(['figures_nodes_container', 'block_figure', 'figure_components_container', 'figure_component', 'figure_descriptions_container', 'figure_description', 'figure_component_description']), trackedOrigins = [] } = {}){
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
            captureTimeout: 3000,
            deleteFilter: (item:any) => !(item instanceof Item) ||
            !(item.content instanceof ContentType) ||
            !(item.content.type instanceof Text ||
              (item.content.type instanceof XmlElement && protectedNodes.has(item.content.type.nodeName))) ||
              item.content.type._length === 0,
              trackedOrigins: new Set([ySyncPluginKey].concat(trackedOrigins)),
            })
            this.mainProsemirrorUndoManagers[initargs.sectionName] = undoManager;
          undoManager.on('stack-item-popped', (item: any) => {
            addremoveCitatsFunc(item);
          })
          return {
            undoManager,
            prevSel: null,
            hasUndoOps: undoManager.undoStack.length > 0,
            hasRedoOps: undoManager.redoStack.length > 0,
            sectionName:initargs.sectionName
          }
        },
        apply: (tr, val, oldState, state) => {
          const binding = ySyncPluginKey.getState(state).binding
          const undoManager = val.undoManager as UndoManager
          const hasUndoOps = undoManager.undoStack.length > 0
          const hasRedoOps = undoManager.redoStack.length > 0
          if(tr.steps.length>0){
            if(tr.getMeta('addToLastHistoryGroup')){
            }else{
            }
          }
          if (binding) {
            return {
              undoManager,
              prevSel: getRelativeSelection(binding, oldState),
              hasUndoOps,
              hasRedoOps,
              sectionName:val.sectionName
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
          item.undoRedoMeta.sectionId = sectionId
          this.computeHistoryChange(item.undoRedoMeta);
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
          }
        })
        return {
          destroy: () => {
            undoManager.destroy()
          }
        }
      }
    })
  }

  undo = (state: EditorState) => {
    let undoManagaerID = this.undoStack.shift();
    let result = this.mainProsemirrorUndoManagers[undoManagaerID!].undo();
    this.redoStack.unshift(undoManagaerID!);
    this.serviceShare.ProsemirrorEditorsService!.scrollMainEditorIntoView(undoManagaerID!)
    this.serviceShare.ProsemirrorEditorsService!.dispatchEmptyTransaction()
    /* const undoManager = this.YjsHistoryKey.getState(state).undoManager
    if (undoManager != null) {
      let result = undoManager.undo()

      return true
    } */
    return true
  }

  canUndo(){
    return this.undoStack.length>0
  }

  redo = (state: EditorState) => {
    let undoManagaerID = this.redoStack.shift();
    let redult = this.mainProsemirrorUndoManagers[undoManagaerID!].redo();
    this.undoStack.unshift(undoManagaerID!);
    this.serviceShare.ProsemirrorEditorsService!.scrollMainEditorIntoView(undoManagaerID!)
    this.serviceShare.ProsemirrorEditorsService!.dispatchEmptyTransaction()

    /* const undoManager = this.YjsHistoryKey.getState(state).undoManager
    if (undoManager != null) {
      let result = undoManager.redo()
      return true
    } */
    return true
  }

  canRedo(){
    return this.redoStack.length>0
  }

  undoYjs() {
    return new MenuItem({
      icon: undoIcon,
      label: "undo",
      enable:(state:EditorState)=> { return this.canUndo() },
      //@ts-ignore
      run: this.undo
    })
  }

  redoYjs() {
    return new MenuItem({
      icon: redoIcon,
      label: "redo",
      enable:(state:EditorState)=> { return this.canRedo() },
      //@ts-ignore
      run: this.redo
    })
  }
}
