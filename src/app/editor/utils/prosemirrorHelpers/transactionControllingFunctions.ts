import { FormControl, FormGroup } from "@angular/forms";
import { DOMSerializer, Schema, Node, Fragment } from "prosemirror-model";
import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { YMap } from "yjs/dist/src/internals";
import { articleSection } from "../interfaces/articleSection";
import { DOMParser } from "prosemirror-model"
import { uuidv4 } from "lib0/random";
import { Subject } from "rxjs";
export const updateControlsAndFigures = (
  schema: Schema,
  figuresMap: YMap<any>,
  editorContainers: {
    [key: string]: {
      editorID: string,
      containerDiv: HTMLDivElement,
      editorState: EditorState,
      editorView: EditorView,
      dispatchTransaction: any
    }
  },
  interpolateTemplate: any,
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
  return (trs: Transaction<any>[], oldState: EditorState, newState: EditorState) => {
    try {

      let figures = figuresMap.get('ArticleFigures');
      let figuresCitats = figuresMap.get('articleCitatsObj');
      let figuresTemplates = figuresMap!.get('figuresTemplates');

      let tr1 = newState.tr;
      // return value whe r = false the transaction is canseled
      trs.forEach((transaction) => {
        if (transaction.steps.length > 0||transaction.getMeta('emptyTR')) {
          newState.doc.nodesBetween(0, newState.doc.nodeSize - 2, (node, pos, parent) => {
            //@ts-ignore
            node.parent = parent
            if (node.type.name == "block_figure") {
              let figure = figures[node.attrs.figure_id]
              let descriptions = node.content.lastChild?.content
              let figureDescriptionHtml = getHtmlFromFragment(descriptions?.child(1).content!)
              figure.description = figureDescriptionHtml
              node.content.firstChild?.content.forEach((node, offset, index) => {
                let component = figure.components[node.attrs.component_number]
                component.description = getHtmlFromFragment(descriptions?.child(index + 2).content!.lastChild?.content!)
              })
              figuresMap.set('ArticleFigures', JSON.parse(JSON.stringify(figures)))
            } else if (node.type.name == "citation") {
              let citateData = figuresCitats[section?.sectionID!][node.attrs.citateid]

              citateData.position = pos


              if (node.attrs.last_time_updated !== citateData.lastTimeUpdated) {
                let newDisplayViewsInCitat = citateData.displaydFiguresViewhere;
                let oldDisplayViewsInCitat = [...node.attrs.figures_display_view];

                let viewsToRemove: string[] = oldDisplayViewsInCitat.reduce((prev, curr, i) => {
                  return newDisplayViewsInCitat.includes(curr) ? prev : prev.concat([curr])
                }, [])

                let viewsToAdd: string[] = newDisplayViewsInCitat.reduce((prev: any[], curr: string, i: number) => {
                  return oldDisplayViewsInCitat.includes(curr) ? prev : prev.concat([curr])
                }, [])

                tr1 = tr1.setNodeMarkup(pos, node.type, { ...node.attrs, last_time_updated: citateData.lastTimeUpdated, figures_display_view: newDisplayViewsInCitat })
                let edView = editorContainers[section?.sectionID!].editorView
                //@ts-ignore
                let parentIndexAndOffset = edView.state.doc.content.findIndex(pos)
                let parentNode = edView.state.doc.content.child(parentIndexAndOffset.index)
                let posAtParentBorder = parentIndexAndOffset.offset + parentNode.nodeSize
                let resolvedPositionATparentNodeBorder = edView.state.doc.resolve(posAtParentBorder)


                let figuresContainerNode: Node
                if (!resolvedPositionATparentNodeBorder.nodeAfter || resolvedPositionATparentNodeBorder.nodeAfter.type.name !== 'figures_nodes_container') {
                  figuresContainerNode = schema.nodes.figures_nodes_container.create({})
                } else {
                  figuresContainerNode = schema.nodes.figures_nodes_container.create({},resolvedPositionATparentNodeBorder.nodeAfter.content)
                  //figuresContainerNode = resolvedPositionATparentNodeBorder.nodeAfter.copy(resolvedPositionATparentNodeBorder.nodeAfter.content)
                }
                let updatefiguresContainerNode = (citatID:string) => {
                  let citatNewPosition
                  try {
                    edView.state.doc.descendants((node: any, pos: any, i: any) => {
                      if (node.type.name == "citation" && node.attrs.citateid == citatID) {
                        citatNewPosition = pos
                      }
                    })
                  } catch (e) {
                    console.error(e);
                  }
                  //@ts-ignore
                  parentIndexAndOffset = edView.state.doc.content.findIndex(citatNewPosition)
                  parentNode = edView.state.doc.content.child(parentIndexAndOffset.index)
                  posAtParentBorder = parentIndexAndOffset.offset + parentNode.nodeSize
                  resolvedPositionATparentNodeBorder = edView.state.doc.resolve(posAtParentBorder)

                  if (!resolvedPositionATparentNodeBorder.nodeAfter || resolvedPositionATparentNodeBorder.nodeAfter.type.name !== 'figures_nodes_container') {
                    figuresContainerNode = schema.nodes.figures_nodes_container.create({})
                  } else {
                  figuresContainerNode = schema.nodes.figures_nodes_container.create({},resolvedPositionATparentNodeBorder.nodeAfter.content)

                    //figuresContainerNode = resolvedPositionATparentNodeBorder.nodeAfter.copy(resolvedPositionATparentNodeBorder.nodeAfter.content)
                  }
                }
                let doneEditing = new Subject();
                let removeaddedLength = 0
                let citatID = node.attrs.citateid
                let editFigureContainer = (citatID:string)=>{
                  setTimeout(() => {
                    updatefiguresContainerNode(citatID)
                    let children: Node[] = []
                    figuresContainerNode.content.forEach((node, offset, i) => {
                      if (viewsToRemove.includes(node.attrs.figure_id) && node.attrs.viewed_by_citat == citatID) {
                        /* children.push(node) */
                      }else {
                        children.push(node)
                      }
  
                    })
                    
                    figuresContainerNode = figuresContainerNode.copy(Fragment.from(children));
                    removeaddedLength += viewsToRemove.length
                    if (removeaddedLength == viewsToAdd.length + viewsToRemove.length) {
                      doneEditing.next({ citatID, edView ,shouldReplace:children.length==figuresContainerNode.content.size});
                    }
                    viewsToAdd.forEach((figureID) => {
                      updatefiguresContainerNode(citatID)
                      let figuresCoontaineroffset: number
  
                      let figureData = figures[figureID];
                      let figureTemplate = figuresTemplates[figureID];
  
                      let serializedFigureToFormIOsubmission: any = {}
                      serializedFigureToFormIOsubmission.figureComponents = figureData.components.reduce((prev: any[], curr: any, i: number) => {
                        return prev.concat([{ container: curr }])
                      }, [])
                      serializedFigureToFormIOsubmission.figureDescription = figureData.description
                      serializedFigureToFormIOsubmission.figureID = figureData.figureID
                      serializedFigureToFormIOsubmission.figureNumber = figureData.figureNumber
                      serializedFigureToFormIOsubmission.viewed_by_citat = citatID
                      interpolateTemplate(figureTemplate!.html, serializedFigureToFormIOsubmission).then((data: any) => {
                        let templ = document.createElement('div')
                        templ.innerHTML = data
                        let Slice = DOMPMParser.parse(templ.firstChild!)
  
                        figuresContainerNode.content = figuresContainerNode.content.append(Slice.content)
                        removeaddedLength++;
                        if (removeaddedLength == viewsToAdd.length + viewsToRemove.length) {
                          doneEditing.next({ citatID, edView });
                        }
                        //editorContainers[section?.sectionID!].editorView.dispatch(editorContainers[section?.sectionID!].editorView.state.tr.insert(posAtParentBorder, node))
                        //posAtParendBorder+=
                      });
                    })
  
                  }, 10)

                }
                editFigureContainer(citatID)
                doneEditing.subscribe((data: any/* {citatID:stirng,edView:EditorView} */) => {
                  try {
                    let citatNewPosition
                    data.edView.state.doc.descendants((node: any, pos: any, i: any) => {
                      if (node.type.name == "citation" && node.attrs.citateid == data.citatID) {
                        citatNewPosition = pos
                      }
                    })
                    //@ts-ignore
                    let parentIndexAndOffset = data.edView.state.doc.content.findIndex(citatNewPosition)
                    let parentNode = data.edView.state.doc.content.child(parentIndexAndOffset.index)
                    let posAtParentBorder = parentIndexAndOffset.offset + parentNode.nodeSize
                    let resolvedPositionATparentNodeBorder = data.edView.state.doc.resolve(posAtParentBorder)
                    if (!resolvedPositionATparentNodeBorder.nodeAfter || resolvedPositionATparentNodeBorder.nodeAfter.type.name !== 'figures_nodes_container') {
                      data.edView.dispatch(data.edView.state.tr.insert(posAtParentBorder, figuresContainerNode).setMeta('shouldTrack', false))
                    } else {
                      data.edView.dispatch(data.edView.state.tr.replaceWith(posAtParentBorder, posAtParentBorder + resolvedPositionATparentNodeBorder.nodeAfter.nodeSize, figuresContainerNode).setMeta('shouldTrack', false))
                    }
                  } catch (e) {
                    console.error(e);
                  }
                })
              }
              figuresMap.set('articleCitatsObj', figuresCitats)
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
    } catch (e) {
      console.error(e);
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