import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AskBeforeDeleteComponent } from '@app/editor/dialogs/ask-before-delete/ask-before-delete.component';
import { AddTableDialogComponent } from '@app/editor/dialogs/citable-tables-dialog/add-table-dialog/add-table-dialog.component';
import { AddEndNoteComponent } from '@app/editor/dialogs/end-notes/add-end-note/add-end-note.component';
import { AddFigureDialogV2Component } from '@app/editor/dialogs/figures-dialog/add-figure-dialog-v2/add-figure-dialog-v2.component';
import { AddSupplementaryFileComponent } from '@app/editor/dialogs/supplementary-files/add-supplementary-file/add-supplementary-file.component';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { Node } from 'prosemirror-model';
import { EditorState, Plugin,PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { createCustomIcon } from '../menu/common-methods';


interface buttonsActions {
  moveElementUpFnc:()=>void
  moveElementDownFnc:()=>void
  editElementFnc:()=>void
  deleteElementFnc:()=>void
}

@Injectable({
  providedIn: 'root'
})
export class CitableElementsEditButtonsService {
  citableElementsEditButtonsPluginKey = new PluginKey('citableElementsEditButtonsPlugin')
  citableElementsEditButtonsPlugin : Plugin

  citableElementsBlockNodesNames = ['block_figure','block_table','block_supplementary_file','block_end_note'];
  elementsMaps ={
    'block_figure':{
      idProp:'figure_id',
      yjsMap: 'figuresMap',
      elementsObj: 'ArticleFigures',
      numberPropInObj:'figureNumber',
      elementNumbersObj: 'ArticleFiguresNumbers',
      elementEditComponent:AddFigureDialogV2Component,
      getDialogData:function(item:any,itemIndex:number,itemId:string){
        return { fig:item, updateOnSave: false, index: itemIndex, figID: itemId };
      },
      resultElProp:'figure',
      elementCitationName:'citation',
      name: "Figure",
    },
    'block_table':{
      idProp:'table_id',
      yjsMap: 'tablesMap',
      elementsObj: 'ArticleTables',
      numberPropInObj:'tableNumber',
      elementNumbersObj: 'ArticleTablesNumbers',
      elementEditComponent:AddTableDialogComponent,
      getDialogData:function(item:any,itemIndex:number,itemId:string){
        return { table:item, updateOnSave: false, index: itemIndex, tableID: itemId };
      },
      resultElProp:'table',
      elementCitationName:'table_citation',
      name: "Table",
    },
    'block_supplementary_file':{
      idProp:'supplementary_file_id',
      yjsMap: 'supplementaryFilesMap',
      elementNumbersObj: 'supplementaryFilesNumbers',
      elementsObj: 'supplementaryFiles',
      numberPropInObj:'supplementary_file_number',
      elementEditComponent:AddSupplementaryFileComponent,
      getDialogData:function(item:any,itemIndex:number,itemId:string){
        return { supplementaryFile:item, updateOnSave: false, index: itemIndex, supplementaryFileID: itemId };
      },
      resultElProp:'supplementaryFile',
      elementCitationName:'supplementary_file_citation',
      name: "Suppl. material"
    },
    'block_end_note':{
      idProp:'end_note_id',
      yjsMap: 'endNotesMap',
      elementsObj: 'endNotes',
      numberPropInObj:'end_note_number',
      elementNumbersObj: 'endNotesNumbers',
      elementEditComponent:AddEndNoteComponent,
      getDialogData:function(item:any,itemIndex:number,itemId:string){
        return { endNote:item, updateOnSave: false, index: itemIndex, endNoteID: itemId }
      },
      resultElProp:'endNote',
      elementCitationName:'end_note_citation',
      name: "Note"
    },
  }

  moveUpButton:HTMLButtonElement
  moveDownButton:HTMLButtonElement
  editButton:HTMLButtonElement
  deleteButton:HTMLButtonElement

  elementActions:buttonsActions = {
    moveElementUpFnc:()=>{},
    moveElementDownFnc:()=>{},
    editElementFnc:()=>{},
    deleteElementFnc:()=>{},
  }
  ctableElementButtonsClasses = [
    'move-citable-item-up-button',
    'move-citable-item-down-button',
    'edit-citable-item-button',
    'delete-citable-item-button',
  ]
  generateEditButtons(){
    // move up button
    let moveUpButton = document.createElement('button')
    moveUpButton.className = 'move-citable-item-up-button';
    moveUpButton.setAttribute('tabindex',"-1")
    moveUpButton.style.cursor = 'pointer'
    moveUpButton.title = 'Move item up.'
    let moveUpImg = createCustomIcon('arrow_up.svg', 12, 12, 0, 1.5, 1.3)
    moveUpImg.dom.className = 'move-citable-item-up-img'
    moveUpImg.dom.style.cursor = 'pointer'
    moveUpImg.dom.style.pointerEvents = 'all'
    moveUpButton.append(moveUpImg.dom)
    moveUpButton.addEventListener('click',()=>{
      this.elementActions.moveElementUpFnc()
    })
    this.moveUpButton = moveUpButton
    // move up button
    let moveDownButton = document.createElement('button')
    moveDownButton.className = 'move-citable-item-down-button';
    moveDownButton.setAttribute('tabindex',"-1")
    moveDownButton.style.cursor = 'pointer'
    moveDownButton.title = 'Move item down.'
    let moveDownImg = createCustomIcon('arrow_down.svg', 12, 12, 0, 1.5, 1.3)
    moveDownImg.dom.className = 'move-citable-item-down-img'
    moveDownImg.dom.style.cursor = 'pointer'
    moveDownImg.dom.style.pointerEvents = 'all'
    moveDownButton.append(moveDownImg.dom)
    moveDownButton.addEventListener('click',()=>{
      this.elementActions.moveElementDownFnc()
    })
    this.moveDownButton = moveDownButton
    // move up button
    let editButton = document.createElement('button')
    editButton.className = 'edit-citable-item-button';
    editButton.setAttribute('tabindex',"-1")
    editButton.style.cursor = 'pointer'
    editButton.title = 'Edit item.'
    let editImg = createCustomIcon('edit-green.svg', 12, 12, 0, 1.5, 1.3)
    editImg.dom.className = 'edit-citable-item-img'
    editImg.dom.style.pointerEvents = 'all'
    editImg.dom.style.cursor = 'pointer'
    editButton.append(editImg.dom)
    editButton.addEventListener('click',()=>{
      this.elementActions.editElementFnc()
    })
    this.editButton = editButton
    // move up button
    let deleteButton = document.createElement('button')
    deleteButton.className = 'delete-citable-item-button';
    deleteButton.setAttribute('tabindex',"-1")
    deleteButton.style.cursor = 'pointer'
    deleteButton.title = 'Delete item.'
    let deleteImg = createCustomIcon('delete_forever-red.svg', 12, 12, 0, 1.5, 1.3)
    deleteImg.dom.className = 'delete-citable-item-img'
    deleteImg.dom.style.cursor = 'pointer'
    deleteImg.dom.style.pointerEvents = 'all'
    deleteButton.append(deleteImg.dom)
    deleteButton.addEventListener('click',()=>{
      this.elementActions.deleteElementFnc()
    })
    this.deleteButton = deleteButton
  }

  getEditButtonsDecorationsHTML(
    dontRenderMoveUpButton:boolean,
    dontRenderMoveDownButton:boolean,
    fnsObj:buttonsActions,
    ){
    let editButtonsContainer = document.createElement('div');
    editButtonsContainer.style.pointerEvents = 'all'
    editButtonsContainer.className = 'citable-items-edit-buttons';

    editButtonsContainer.appendChild(this.editButton)
    editButtonsContainer.appendChild(this.deleteButton)
    if(!dontRenderMoveUpButton){
      editButtonsContainer.appendChild(this.moveUpButton)
    }
    if(!dontRenderMoveDownButton){
      editButtonsContainer.appendChild(this.moveDownButton)
    }

    this.elementActions.moveElementUpFnc = fnsObj.moveElementUpFnc
    this.elementActions.moveElementDownFnc = fnsObj.moveElementDownFnc
    this.elementActions.editElementFnc = fnsObj.editElementFnc
    this.elementActions.deleteElementFnc = fnsObj.deleteElementFnc
    return editButtonsContainer
  }

  getElTypeFromPath(path:any[]){
    let counter = 0;
    let citableElementTag:string = undefined
    let el:Node = undefined
    let elPos:number = undefined
    while(!citableElementTag&&counter<path.length){
      let node = path[counter]
      let nodeTag = node.type.name;
      if(this.citableElementsBlockNodesNames.includes(nodeTag)){
        citableElementTag = nodeTag
        el = node
        elPos = path[counter-1]
      }
      counter+=3
    }
    return {citableElementTag,el,elPos}
  }

  constructor(
    private serviceShare : ServiceShare,
    public dialog: MatDialog,
    ) {
    this.generateEditButtons()
    this.citableElementsEditButtonsPlugin = new Plugin({
      key: this.citableElementsEditButtonsPluginKey,
      state: {
        init: (_:any, state) => {
          return { sectionName: _.sectionName };
        },
        apply(tr, prev, _, newState) {
          return prev
        },
      },
      props: {
        handleDOMEvents:{
          'blur':(view,event)=>{
            if(event.relatedTarget && event.relatedTarget instanceof HTMLButtonElement && this.ctableElementButtonsClasses.includes(event.relatedTarget.className)){
              event.relatedTarget.click();
            }
          }
        },
        decorations:(state: EditorState) => {
          let pluginState = this.citableElementsEditButtonsPluginKey.getState(state);
          let focusedEditor = serviceShare.DetectFocusService.sectionName
          let currentEditor = pluginState.sectionName
          let {from,to,$from,$to} = state.selection;
          if(from!=to || currentEditor!=focusedEditor) return DecorationSet.empty;

          //@ts-ignore
          let posPath = $from.path
          let {citableElementTag,el,elPos} = this.getElTypeFromPath(posPath)

          if(!citableElementTag) return DecorationSet.empty;
          let elementMap = this.elementsMaps[citableElementTag];
          let elementId = el.attrs[elementMap.idProp];

          let elementYjsMap = this.serviceShare.YdocService[elementMap.yjsMap]
          let elementsObj = elementYjsMap.get(elementMap.elementsObj);
          let elementsNumbersArr = elementYjsMap.get(elementMap.elementNumbersObj) as string[];


          let elementNumber = elementsNumbersArr.indexOf(elementId);
          let elIsFirstInOrder = elementNumber == 0;
          let elIsLastInOrder = elementNumber == elementsNumbersArr.length-1;

          let html = this.getEditButtonsDecorationsHTML(elIsFirstInOrder,elIsLastInOrder,{
            moveElementUpFnc:()=>{
              let elementNumbersArrCopy = JSON.parse(JSON.stringify(elementsNumbersArr)) as string[];
              let id = elementNumbersArrCopy.splice(elementNumber,1);
              elementNumbersArrCopy.splice(elementNumber-1,0,...id);
              this.serviceShare.CitableElementsService.writeElementDataGlobal(elementsObj, elementNumbersArrCopy,elementMap.elementCitationName);
            },
            moveElementDownFnc:()=>{
              let elementNumbersArrCopy = JSON.parse(JSON.stringify(elementsNumbersArr)) as string[];
              let id = elementNumbersArrCopy.splice(elementNumber,1);
              elementNumbersArrCopy.splice(elementNumber+1,0,...id);
              this.serviceShare.CitableElementsService.writeElementDataGlobal(elementsObj, elementNumbersArrCopy,elementMap.elementCitationName);
            },
            editElementFnc:()=>{
              this.dialog.open(elementMap.elementEditComponent, {
                data: elementMap.getDialogData(elementsObj[elementId],elementNumber,elementId),
                disableClose: false
              }).afterClosed().subscribe((result: any) => {
                if(result){
                  let editedItem = result[elementMap.resultElProp]
                  let elementObjCopy = JSON.parse(JSON.stringify(elementsObj));
                  elementObjCopy[elementId] = editedItem;
                  this.serviceShare.CitableElementsService.writeElementDataGlobal(elementObjCopy, elementsNumbersArr,elementMap.elementCitationName);
                }
              })
            },
            deleteElementFnc: () => {
              const objName = elementMap.name === this.elementsMaps.block_end_note.name
                ? `*${elementNumber + 1}`
                : `${elementMap.name} №${elementNumber + 1}`

              let dialogRef = this.dialog.open(AskBeforeDeleteComponent, {
                data: { objName, type: elementMap.resultElProp,dontshowType:true },
                panelClass: 'ask-before-delete-dialog',
              })
              dialogRef.afterClosed().subscribe((data: any) => {
                if (data) {
                  let elementObjCopy = JSON.parse(JSON.stringify(elementsObj));
                  let elementNumsCopy = JSON.parse(JSON.stringify(elementsNumbersArr));
                  if (elementObjCopy[elementId]) {
                    delete elementObjCopy[elementId]
                  }
                  elementNumsCopy.splice(elementNumber, 1);
                  this.serviceShare.CitableElementsService.writeElementDataGlobal(elementObjCopy, elementNumsCopy, elementMap.elementCitationName);
                }
              })
            },
          })

          let view = serviceShare.ProsemirrorEditorsService.editorContainers[currentEditor].editorView
          let coordsInCursorPos = view.coordsAtPos(from);
          let editorViewRectangle = view.dom.getBoundingClientRect()
          let top = coordsInCursorPos.top-editorViewRectangle.top
          let left = editorViewRectangle.width
          html.setAttribute('style', `position:absolute;
          pointer-events:all;
          top:${top}px;left:${left}px`)
          html.setAttribute('tabindex',"-1")


          return  DecorationSet.create(state.doc,[Decoration.widget(elPos, (view) => {
            return html
          })])
        },
      },
    })
  }


}
