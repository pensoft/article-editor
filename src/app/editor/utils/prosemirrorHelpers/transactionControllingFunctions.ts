import { FormControl, FormGroup } from "@angular/forms";
import { DOMSerializer, Schema, Node, Fragment } from "prosemirror-model";
import { EditorState, Transaction } from "prosemirror-state";
import { YMap } from "yjs/dist/src/internals";
import { articleSection } from "../interfaces/articleSection";

export const updateControlsAndFigures = ( schema: Schema,figuresMap:YMap<any>, GroupControl?: any,section?: articleSection) => {
  let DOMPMSerializer = DOMSerializer.fromSchema(schema);
  let getHtmlFromFragment = (fr:Fragment)=>{
    let HTMLnodeRepresentation = DOMPMSerializer.serializeFragment(fr)
    let temp = document.createElement('div');
    temp.appendChild(HTMLnodeRepresentation);
    return temp.innerHTML
  }
  return (trs: Transaction<any>[], oldState: EditorState, newState: EditorState) => {
    try{

      let figures = figuresMap.get('ArticleFigures')
      console.log(figures);
      let tr1 = newState.tr;
      // return value whe r = false the transaction is canseled
      trs.forEach((transaction) => {
        if (transaction.steps.length > 0) {
          newState.doc.nodesBetween(0, newState.doc.nodeSize - 2, (node, pos, parent) => {
            //@ts-ignore
            node.parent = parent
            if(node.type.name == "inline_figure"){
              let figure = figures[node.attrs.figure_number]
              let descriptions = node.content.lastChild?.content
              let figureDescriptionHtml = getHtmlFromFragment(descriptions?.child(1).content!)
              figure.description = figureDescriptionHtml
              node.content.firstChild?.content.forEach((node,offset,index)=>{
                let component = figure.components[node.attrs.component_number]
                component.description = getHtmlFromFragment(descriptions?.child(index+2).content!.lastChild?.content!)
              })
              figuresMap.set('ArticleFigures',JSON.parse(JSON.stringify(figures)))
              
            }
            if (GroupControl && node.attrs.formControlName && GroupControl[section!.sectionID]) {      // validation for the formCOntrol
              try {
                const fg = GroupControl[section!.sectionID];
                const controlPath = node.attrs.controlPath;
                const control = fg.get(controlPath) as FormControl;
                //@ts-ignore
    
                if (control.componentType && control.componentType == "textarea") {
                  let html = getHtmlFromFragment(node.content)
                  control.setValue(html, { emitEvent: true })
                } else {
                  control.setValue(node.textContent, { emitEvent: true })
                }
                control.updateValueAndValidity()
                const mark = schema.mark('invalid')
                if (control.invalid) {
                  // newState.tr.addMark(pos + 1, pos + node.nodeSize - 1, mark)
                  tr1 = tr1.setNodeMarkup(pos, node.type, { ...node.attrs, invalid: "true" })
                } else {
                  tr1 = tr1.setNodeMarkup(pos, node.type, { ...node.attrs, invalid: "" })
    
                }
              } catch (error) {
                console.error(error);
              }
            }
  
          })
        }
      })
      return tr1
    }catch(e){
      console.log(e);
    }
  }
}

export const preventDragDropCutOnNoneditablenodes = (transaction: Transaction<any>, state: EditorState) => {
  try {
    //@ts-ignore
    let meta = transaction.meta
    if (meta.uiEvent || Object.keys(meta).includes('cut') || Object.keys(meta).includes('drop')) {
      let noneditableNodesOnDropPosition = false
      let dropIsInTable = false;
      let stateSel: any = state.selection
      //@ts-ignore
      let trSel = transaction.curSelection
      //@ts-ignore
      let headFormField: Node
      let anchorFormField: Node
      stateSel.$head.path.forEach((element: number | Node) => {
        if (element instanceof Node) {
          if (element.attrs.contenteditableNode == "false") {
            noneditableNodesOnDropPosition = true
          }
          if (element.type.name == 'form_field') {
            headFormField = element
          }
          if (element.type.name == "table_cell" || element.type.name == "table_row" || element.type.name == "table") {
            dropIsInTable = true
          }
        }
      });
      stateSel.$anchor.path.forEach((element: number | Node) => {
        if (element instanceof Node) {
          if (element.attrs.contenteditableNode == "false") {
            noneditableNodesOnDropPosition = true
          }
          if (element.type.name == 'form_field') {
            anchorFormField = element
          }
          if (element.type.name == "table_cell" || element.type.name == "table_row" || element.type.name == "table") {
            dropIsInTable = true
          }
        }
      });
      if (meta.uiEvent == 'cut' || Object.keys(meta).includes('cut')) {
        //@ts-ignore
        //console.log('anchorFormField!==headFormField',anchorFormField!==headFormField,'noneditableNodesOnDropPosition',noneditableNodesOnDropPosition);
        //@ts-ignore
        if (anchorFormField !== headFormField) {
          return false
        }
        if (noneditableNodesOnDropPosition) {
          return false
        }
      } else if (meta.uiEvent == 'drop' || Object.keys(meta).includes('drop')) {
        let dropPosPath: Array<number | Node> = trSel.$anchor.path

        let index = dropPosPath.length - 1
        while (index >= 0 && !dropIsInTable) {
          let arrayElement = dropPosPath[index]
          if (arrayElement instanceof Node) {
            if (arrayElement.type.name == "table_cell" || arrayElement.type.name == "table_row" || arrayElement.type.name == "table") {
              dropIsInTable = true
            }
          }
          index--;
        }
        let trSelFormField: Node
        trSel.$anchor.path.forEach((element: number | Node) => {
          if (element instanceof Node) {
            if (element.attrs.contenteditableNode == "false") {
              noneditableNodesOnDropPosition = true
            }
            if (element.type.name == 'form_field') {
              trSelFormField = element
            }
          }
        });
        //@ts-ignore
        //console.log('anchorFormField!==headFormField',anchorFormField!==headFormField,'!trSelFormField',trSelFormField,'noneditableNodesOnDropPosition',noneditableNodesOnDropPosition);
        //@ts-ignore
        if (anchorFormField !== headFormField || !trSelFormField) {
          return false
        }
        if (noneditableNodesOnDropPosition || dropIsInTable) {
          return false
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  return true
}