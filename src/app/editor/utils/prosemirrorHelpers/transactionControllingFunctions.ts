import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { DOMSerializer, Schema, Node, Fragment, ResolvedPos, Slice, Mark } from "prosemirror-model";
import { EditorState, PluginKey, Transaction } from "prosemirror-state";
import { DecorationSet, EditorView } from "prosemirror-view";
import { YMap } from "yjs/dist/src/internals";
import { articleSection } from "../interfaces/articleSection";
import { DOMParser } from "prosemirror-model"
import { uuidv4 } from "lib0/random";
import { of, Subject } from "rxjs";
import { split } from "lodash";
import { notEqual } from "assert";
import { C, I } from "@angular/cdk/keycodes";
import { ReplaceStep } from "prosemirror-transform";
import { ServiceShare } from "@app/editor/services/service-share.service";
export const updateControlsAndFigures = (
  schema: Schema,
  figuresMap: YMap<any>,
  mathMap: YMap<any>,
  editorContainers: {
    [key: string]: {
      editorID: string,
      containerDiv: HTMLDivElement,
      editorState: EditorState,
      editorView: EditorView,
      dispatchTransaction: any
    }
  },
  rerenderFigures: (citats: any) => any,
  YjsHistoryKey: PluginKey,
  interpolateTemplate: any,
  sharedService:ServiceShare,
  GroupControl?: any,
  section?: articleSection) => {
  let DOMPMSerializer = DOMSerializer.fromSchema(schema);
  let DOMPMParser = DOMParser.fromSchema(schema)
  let getHtmlFromFragment = (fr: Fragment) => {
    let HTMLnodeRepresentation = DOMPMSerializer.serializeFragment(fr)
    let temp = document.createElement('div');
    temp.appendChild(HTMLnodeRepresentation);
    return temp.innerHTML
  }

  let sectionTreeTitleUpdateMetas: any
  return (trs: Transaction<any>[], oldState: EditorState, newState: EditorState) => {
    try {

      let figures = figuresMap.get('ArticleFigures');
      let figuresCitats = figuresMap.get('articleCitatsObj');
      let figuresTemplates = figuresMap!.get('figuresTemplates');
      let customPropsObj = sharedService.YdocService!.customSectionProps?.get('customPropsObj')
      let setcustomProp = false
      let tr1 = newState.tr
      // return value whe r = false the transaction is canseled
      trs.forEach((transaction) => {
        if (transaction.steps.length > 0 || transaction.getMeta('emptyTR')) {
          newState.doc.nodesBetween(0, newState.doc.nodeSize - 2, (node, pos, parent) => {
            //@ts-ignore
            node.parent = parent

            if (node.type.name == "block_figure") {
              let figure = figures[node.attrs.figure_id]
              node.content.forEach((node1, offset, index) => {
                if (node1.type.name == 'figure_descriptions_container') {
                  node1.content.forEach((node2) => {
                    if (node2.type.name == 'figure_description') {
                      let figureDescriptionHtml = getHtmlFromFragment(node2.content!)
                      figure.description = figureDescriptionHtml
                    } else if (node2.type.name == 'figure_component_description') {

                      figure.components[node2.attrs.component_number].description = getHtmlFromFragment(node2.content.child(1).content)
                    }
                  })
                }
              })
              /* let descriptions = node.content.lastChild?.content
              let figureDescriptionHtml = getHtmlFromFragment(descriptions?.child(1).content!)
              figure.description = figureDescriptionHtml
              node.content.firstChild?.content.forEach((node, offset, index) => {
                let component = figure.components[node.attrs.component_number]
                component.description = getHtmlFromFragment(descriptions?.child(index + 2).content!.lastChild?.content!)
              }) */
              figuresMap.set('ArticleFigures', JSON.parse(JSON.stringify(figures)))
            }
            if((node.attrs.customPropPath&&node.attrs.customPropPath!='')||(node.marks.filter((mark)=>mark.attrs.customPropPath != ''&&mark.attrs.customPropPath).length>0)){
              if(!customPropsObj[section!.sectionID]){
                customPropsObj[section!.sectionID] = {}
              }
              let customPropPath = node.attrs.customPropPath
              if(node.marks.filter((mark)=>mark.attrs.customPropPath != ''&&mark.attrs.customPropPath).length>0){
                customPropPath = node.marks.find((mark)=>mark.attrs.customPropPath != ''&&mark.attrs.customPropPath).attrs.customPropPath
              }
              if(node.textContent.trim() != customPropsObj[section!.sectionID][customPropPath]){
                customPropsObj[section!.sectionID][customPropPath] = node.textContent.trim()
                setcustomProp =  true
              }
            }
            /* if(node.marks.filter((mark)=>mark.type.name == 'link').length>0&&node.marks.find((mark)=>mark.type.name == 'link').attrs.formControlName){

            } */
            if (GroupControl && (node.attrs.formControlName||(node.marks.filter((mark)=>mark.attrs.formControlName != ''&&mark.attrs.formControlName).length>0)) && GroupControl[section!.sectionID]) {      // validation for the formCOntrol
              try {
                const fg = GroupControl[section!.sectionID];
                let controlPath = node.attrs.controlPath;
                if(node.marks.filter((mark)=>mark.attrs.formControlName != ''&&mark.attrs.formControlName).length>0){
                  controlPath = node.marks.find((mark)=>mark.attrs.formControlName != ''&&mark.attrs.formControlName).attrs.controlPath
                }
                if (controlPath == 'sectionTreeTitle') {
                  if (!transaction.getMeta('titleupdateFromControl')) {
                    if (transaction.getMeta('editingTitle')) {
                      sectionTreeTitleUpdateMetas.time = Date.now();
                    }
                    const control = fg.get(controlPath) as FormControl;
                    //@ts-ignore
                    let updatemeta = fg.titleUpdateMeta as { time: number, updatedFrom: string };
                    if (!sectionTreeTitleUpdateMetas) {
                      sectionTreeTitleUpdateMetas = {
                        time: 0,
                        updateFrom: 'prosemirror'
                      }
                    }
                    if (node.textContent.trim() !== control.value) {
                      if (sectionTreeTitleUpdateMetas.time < updatemeta.time) {
                        setTimeout(() => {
                          let view = editorContainers[section?.sectionID!].editorView;
                          let st = view.state
                          view.dispatch(st.tr.replaceWith(pos + 1, pos + node.nodeSize - 1, schema.text(control.value)).setMeta('titleupdateFromControl', true).setMeta('addToLastHistoryGroup', true))
                        }, 0);
                        sectionTreeTitleUpdateMetas.time = updatemeta.time;
                      } else if (sectionTreeTitleUpdateMetas.time > updatemeta.time) {
                        control.patchValue(node.textContent.trim()!);
                        updatemeta.time = sectionTreeTitleUpdateMetas.time;
                        updatemeta.updatedFrom = 'editor'
                      }
                    }
                  }
                  /* if(sectionTreeTitleUpdateMetas[+titleNodeNumber].time<updatemeta.time){
                    sectionTreeTitleUpdateMetas[+titleNodeNumber].time = updatemeta.time
                  } */
                } else {

                  const control = fg.get(controlPath) as FormControl;
                  if(control){
                    //@ts-ignore
                    if (control.componentType && control.componentType == "textarea") {
                      let html = getHtmlFromFragment(node.content)
                      if (node.attrs.menuType) {
                        //@ts-ignore
                        if (!control.componentProps) {
                          //@ts-ignore
                          control.componentProps = {}
                        }
                        //@ts-ignore
                        control.componentProps.menuType = node.attrs.menuType;
                      }
                      control.setValue(html, { emitEvent: true })
                    } else {
                      control.setValue(node.textContent, { emitEvent: true })
                    }
                    control.updateValueAndValidity()
                    const mark = schema.mark('invalid')
                    if (control.invalid && node.attrs.invalid !== "true"&&node.type.name !== 'text') {
                      // newState.tr.addMark(pos + 1, pos + node.nodeSize - 1, mark)
                      tr1 = tr1.setNodeMarkup(pos, node.type, { ...node.attrs, invalid: "true" })
                    } else if (control.valid && node.attrs.invalid !== "false"&&node.type.name !== 'text') {
                      if (node.attrs.invalid !== "false") {
                        tr1 = tr1.setNodeMarkup(pos, node.type, { ...node.attrs, invalid: "false" })
                      }
                    }
                  }
                }
              } catch (error) {
                console.error(error);
              }
            }

          })
        }
      })
      if(setcustomProp){
        sharedService.YdocService!.customSectionProps?.set('customPropsObj',customPropsObj)
      }
      sharedService.YjsHistoryService.stopLessItemsCapturePrevention();
      return tr1
    } catch (e) {
      console.error(e);
    }
  }
}


export const preventDragDropCutOnNoneditablenodes = (figuresMap: YMap<any>,mathMap:YMap<any>, rerenderFigures: (citats: any) => any, sectionID: string,sharedService:ServiceShare) => {

  return (transaction: Transaction<any>, state: EditorState) => {
    try {
      if (sectionID == 'endEditor') {
        return true
      }
      let figures = figuresMap.get('ArticleFigures');
      let figuresCitats = figuresMap.get('articleCitatsObj');
      let figuresTemplates = figuresMap!.get('figuresTemplates');
      if (transaction.steps.length > 0) {
        transaction.steps.forEach((step) => {
          if (step instanceof ReplaceStep) {
            //@ts-ignore
            let replacingSlice = state.doc.slice(step.from, step.to)
            replacingSlice.content.nodesBetween(0, replacingSlice.size, (node, pos, parent) => {
              if (node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0) {
                let citatMark = node.marks.filter((mark) => { return mark.type.name == 'citation' })[0]
                let citatID = citatMark.attrs.citateid

              }else if(node.type.name == 'math_inline'||node.type.name == 'math_display'){
                if (!transaction.getMeta('y-sync$')) {
                  /* if(sharedService.PmDialogSessionService!.inSession()!=='nosession'){
                    sharedService.PmDialogSessionService!.removeElement(node.attrs.math_id);
                  }else{
                  } */
                    let mathObj = mathMap?.get('dataURLObj')
                    let math_id = node.attrs.math_id;
                    mathObj[math_id] = undefined
                    mathMap?.set('dataURLObj',mathObj);
                }
              }
            });
          }
        })
      }
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
            if (element.attrs.contenteditableNode === "false"||element.attrs.contenteditableNode === false) {
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
            if (element.attrs.contenteditableNode === "false"||element.attrs.contenteditableNode === false) {
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
              if (element.attrs.contenteditableNode === "false"||element.attrs.contenteditableNode === false) {
                noneditableNodesOnDropPosition = true
              }
              if (element.type.name == 'form_field') {
                trSelFormField = element
              }
            }
          });
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
}

//handle right click on citats
export const handleClickOn = (citatContextPluginKey: PluginKey) => {

  return (view: EditorView, pos: number, node: Node, nodePos: number, e: MouseEvent, direct: boolean) => {
    if(e.target&&e.target instanceof HTMLElement&&(
      e.target.className.includes('update-data-reference-button')||
      e.target.className.includes('reference-citation-pm-buttons')||
      e.target.className.includes('update-data-reference-img')
      )){
      return true;
    }
    if (node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0 &&
      (("which" in e && e.which == 3) ||
        ("button" in e && e.button == 2)
      )) {
      let cursurCoord = view.coordsAtPos(pos);
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => {
        view.dispatch(view.state.tr.setMeta('citatContextPlugin', {
          clickPos: pos,
          citatPos: nodePos,
          clickEvent: e,
          focus: view.hasFocus(),
          direct,
          coords: cursurCoord
        }).setMeta('addToLastHistoryGroup', true))
      }, 0)
      return true
    } else if (citatContextPluginKey.getState(view.state)&&citatContextPluginKey.getState(view.state).decorations !== undefined) {
      return false
    } else {
      return false
    }
  }
}

export function buildFigureForm(submision:any):FormGroup{
  let figureFormGroup =  new FormGroup({})
  let figDesc = new FormControl(submision.figureDescription);
  let formComponents :FormGroup[]= []
  submision.figureComponents.forEach((comp:any)=>{
    let compFormGroup = new FormGroup({});
    let compDescription = new FormControl(comp.container.description);
    compFormGroup.addControl('figureComponentDescription',compDescription);
    formComponents.push(compFormGroup);
  })
  let figComponentArray = new FormArray(formComponents);
  figureFormGroup.addControl('figureDescription',figDesc);
  figureFormGroup.addControl('figureComponents',figComponentArray);
  return figureFormGroup
}

