import { FormControl, FormGroup } from "@angular/forms";
import { DOMSerializer, Schema ,Node} from "prosemirror-model";
import { EditorState, Transaction } from "prosemirror-state";
import { articleSection } from "../interfaces/articleSection";

export const  validateTransactions = (GroupControl:any,section:articleSection,schema:Schema)=>{
    let DOMPMSerializer = DOMSerializer.fromSchema(schema);

    return (trs: Transaction<any>[], oldState: EditorState, newState: EditorState) => {
       let tr1 = newState.tr;
       // return value whe r = false the transaction is canseled
       trs.forEach((transaction) => {
         if (transaction.steps.length > 0) {
           newState.doc!.descendants(/* newState.selection.from, newState.selection.to,  */(node, pos, parent) => {     // the document after the appling of the steps
             //@ts-ignore
             node.parent = parent
             if (node.attrs.formControlName && GroupControl[section.sectionID]) {      // validation for the formCOntrol
               try {
                 const fg = GroupControl[section.sectionID];
                 const controlPath = node.attrs.controlPath;
                 const control = fg.get(controlPath) as FormControl;
                 //@ts-ignore
   
                 if (control.componentType && control.componentType == "textarea") {
                   let HTMLnodeRepresentation = DOMPMSerializer.serializeFragment(node.content)
                   let temp = document.createElement('div');
                   temp.appendChild(HTMLnodeRepresentation);
                   control.setValue(temp.innerHTML, { emitEvent: true })
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
     }
}

export const preventDragDropCutOnNoneditablenodes = (transaction: Transaction<any>, state: EditorState) => {
    try {
      //@ts-ignore
      let meta = transaction.meta
      if (meta.uiEvent || Object.keys(meta).includes('cut') || Object.keys(meta).includes('drop')) {
        let noneditableNodesOnDropPosition = false
        let dropIsInTable = false;
        let stateSel:any = state.selection
        //@ts-ignore
        let trSel = transaction.curSelection
        //@ts-ignore
        let headFormField : Node
        let anchorFormField : Node
        stateSel.$head.path.forEach((element:number|Node) => {
          if(element instanceof Node){
            if(element.attrs.contenteditableNode == "false"){
              noneditableNodesOnDropPosition = true
            }
            if(element.type.name == 'form_field'){
              headFormField  = element
            }
            if(element.type.name == "table_cell"||element.type.name == "table_row"||element.type.name == "table"){
              dropIsInTable = true
            }
          }
        });
        stateSel.$anchor.path.forEach((element:number|Node) => {
          if(element instanceof Node){
            if(element.attrs.contenteditableNode == "false"){
              noneditableNodesOnDropPosition = true
            }
            if(element.type.name == 'form_field'){
              anchorFormField = element
            }
            if(element.type.name == "table_cell"||element.type.name == "table_row"||element.type.name == "table"){
              dropIsInTable = true
            }
          }
        });
        if (meta.uiEvent == 'cut' || Object.keys(meta).includes('cut')) {
          //@ts-ignore
          //console.log('anchorFormField!==headFormField',anchorFormField!==headFormField,'noneditableNodesOnDropPosition',noneditableNodesOnDropPosition);
          //@ts-ignore
          if(anchorFormField!==headFormField){
            return false
          }
          if (noneditableNodesOnDropPosition) {
            return false
          }
        } else if (meta.uiEvent == 'drop' || Object.keys(meta).includes('drop')) {
          let dropPosPath:Array<number|Node> = trSel.$anchor.path
          
          let index = dropPosPath.length-1
          while(index>=0&&!dropIsInTable){
            let arrayElement = dropPosPath[index]
            if(arrayElement instanceof Node){
              if(arrayElement.type.name == "table_cell"||arrayElement.type.name == "table_row"||arrayElement.type.name == "table"){
                dropIsInTable = true
              }
            }
            index--;
          }
          let trSelFormField :Node
          trSel.$anchor.path.forEach((element:number|Node) => {
            if(element instanceof Node){
              if(element.attrs.contenteditableNode == "false"){
                noneditableNodesOnDropPosition = true
              }
              if(element.type.name == 'form_field'){
                trSelFormField = element
              }
            }
          });
          //@ts-ignore
          //console.log('anchorFormField!==headFormField',anchorFormField!==headFormField,'!trSelFormField',trSelFormField,'noneditableNodesOnDropPosition',noneditableNodesOnDropPosition);
          //@ts-ignore
          if(anchorFormField!==headFormField||!trSelFormField){
            return false
          }
          if (noneditableNodesOnDropPosition||dropIsInTable) {
            return false
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return true
  }