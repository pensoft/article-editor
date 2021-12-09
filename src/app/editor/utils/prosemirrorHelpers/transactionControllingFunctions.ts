import { FormControl, FormGroup } from "@angular/forms";
import { DOMSerializer, Schema, Node, Fragment, ResolvedPos, Slice } from "prosemirror-model";
import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { YMap } from "yjs/dist/src/internals";
import { articleSection } from "../interfaces/articleSection";
import { DOMParser } from "prosemirror-model"
import { uuidv4 } from "lib0/random";
import { Subject } from "rxjs";
import { split } from "lodash";
import { notEqual } from "assert";
import { C } from "@angular/cdk/keycodes";
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
            } else if (node.type.name == "citation") {

              let citateData = figuresCitats[section?.sectionID!][node.attrs.citateid]
              citateData.position = pos
              tr1 = tr1.setNodeMarkup(pos, node.type, { ...node.attrs, last_time_updated: citateData.lastTimeUpdated })
              let edView = editorContainers[section?.sectionID!].editorView

              //@ts-ignore
              let parentIndexAndOffset = newState.doc.content.findIndex(pos)
              let parentNode = newState.doc.content.child(parentIndexAndOffset.index)
              let posAtParentBorder = parentIndexAndOffset.offset + parentNode.nodeSize
              let resolvedPositionATparentNodeBorder = newState.doc.resolve(posAtParentBorder)

              //let shouldRerender = false
              let oldDisplayViewsInCitat = [...node.attrs.figures_display_view];
              /* if((!resolvedPositionATparentNodeBorder.nodeAfter||resolvedPositionATparentNodeBorder.nodeAfter.type.name !=='figures_nodes_container')&&oldDisplayViewsInCitat.length>0){
                console.log('shouldRerender');
                shouldRerender = true;
              } */
              
              if (node.attrs.last_time_updated !== citateData.lastTimeUpdated/* ||shouldRerender */) {
                let newDisplayViewsInCitat = citateData.displaydFiguresViewhere;
                tr1 = tr1.setNodeMarkup(pos, node.type, { ...node.attrs, last_time_updated: citateData.lastTimeUpdated, figures_display_view: newDisplayViewsInCitat })
                
                let viewsToRemove: string[] = newDisplayViewsInCitat?oldDisplayViewsInCitat.reduce((prev, curr, i) => {
                  return newDisplayViewsInCitat.includes(curr) ? prev : prev.concat([curr])
                }, []):[]
                
                let viewsToAdd: string[] = newDisplayViewsInCitat?newDisplayViewsInCitat.reduce((prev: any[], curr: string, i: number) => {
                  return oldDisplayViewsInCitat.includes(curr) ? prev : prev.concat([curr])
                }, []):[]

                console.log();
                /* if(shouldRerender){
                  viewsToAdd = newDisplayViewsInCitat
                  viewsToRemove = []
                }else{ }*/
                  viewsToAdd = newDisplayViewsInCitat
                  viewsToRemove = []
                
                let figureViewsToAdd: { [key: string]: number[], } = {}
                viewsToAdd.forEach((figID: string) => {
                  let fid: string
                  let fCompId: string
                  if (figID.includes('|')) {
                    let d = figID.split('|');
                    fid = d[0];
                    fCompId = d[1];
                    if (!figureViewsToAdd[fid]) {
                      figureViewsToAdd[fid] = []
                    }
                    if (figureViewsToAdd[fid] && fCompId) {
                      figureViewsToAdd[fid].push(+fCompId)
                    }
                  } else {
                    figureViewsToAdd[figID] = []
                  }
                })
                let figureViewsToRemove: { [key: string]: number[], } = {}
                viewsToRemove.forEach((figID: string) => {
                  let fid: string
                  let fCompId: string
                  if (figID.includes('|')) {
                    let d = figID.split('|');
                    fid = d[0];
                    fCompId = d[1];
                    if (!figureViewsToRemove[fid]) {
                      figureViewsToRemove[fid] = []
                    }
                    if (figureViewsToRemove[fid] && fCompId) {
                      figureViewsToRemove[fid].push(+fCompId)
                    }
                  } else {
                    figureViewsToRemove[figID] = []
                  }
                })
                let doneEditing = new Subject();
                let citatID = node.attrs.citateid
                let editFigureContainer = (
                  citatID: string,
                  dispatchSubject: Subject<any>,
                  figureViewsToRemove: { [key: string]: number[], },
                  figureViewsToAdd: { [key: string]: number[], },
                  edView: EditorView) => {
                  setTimeout(() => {
                    Object.keys(figureViewsToRemove).forEach((figureID) => {
                      let citatNewPosition: any
                      let contAfter = resolvedPositionATparentNodeBorder.nodeAfter
                      let updateMetaInfoRemove = () => {
                        edView.state.doc.descendants((node: any, pos: any, i: any) => {
                          if (node.type.name == "citation" && node.attrs.citateid == citatID) {
                            citatNewPosition = pos
                          }
                        })
                        //@ts-ignore
                        parentIndexAndOffset = edView.state.doc.content.findIndex(citatNewPosition)
                        parentNode = edView.state.doc.content.child(parentIndexAndOffset.index)
                        posAtParentBorder = parentIndexAndOffset.offset + parentNode.nodeSize
                        resolvedPositionATparentNodeBorder = edView.state.doc.resolve(posAtParentBorder)

                        contAfter = resolvedPositionATparentNodeBorder.nodeAfter!
                      }

                      updateMetaInfoRemove()
                      let figureData = figures[figureID];
                      let removeStartIndex: number = -1
                      let removeEndIndex: number = -1

                      if (contAfter && contAfter.type.name == 'figures_nodes_container') {
                          let figComponentsStartIndex = figureViewsToRemove[figureID].length>0?Math.min(...figureViewsToRemove[figureID]):0
                          let figComponentsEndIndex = figureViewsToRemove[figureID].length>0?Math.max(...figureViewsToRemove[figureID]):figureData.components.length

                          let componentsCount = 0
                          contAfter.forEach((node, offset, index) => {
                            if (node.attrs.figure_id == figureID) {
                              node.content.forEach((nodeInFig, offsetInFig, indexInFig) => {
                                if (nodeInFig.type.name == "figure_components_container") {
                                  nodeInFig.forEach((node) => {
                                    componentsCount++
                                  })
                                }
                              })
                            }
                          })
                          if (figureViewsToRemove[figureID].length == componentsCount) {
                            contAfter.forEach((node, offset, index) => {
                              if (node.attrs.figure_id == figureID) {
                                removeStartIndex = posAtParentBorder + 1 + offset
                                removeEndIndex = posAtParentBorder + 1 + offset + node.nodeSize
                              }
                            })
                            if (removeStartIndex !== -1) {
                              console.log('removing whole figure',node.textContent);
                              edView.dispatch(edView.state.tr.replaceWith(removeStartIndex, removeEndIndex, Fragment.empty).setMeta('shouldTrack',false))
                            }
                          } else {
                            removeStartIndex = -1
                            contAfter.forEach((node, offset, index) => {
                              if (node.attrs.figure_id == figureID) {
                                node.content.forEach((nodeInFig, offsetInFig, indexInFig) => {
                                  if (nodeInFig.type.name == "figure_components_container") {
                                    nodeInFig.content.forEach((nodeInDesc, offsetInDesc, indexInDesc) => {
                                      if(nodeInDesc.attrs.viewed_by_citat == citatID){
                                        if (nodeInDesc.attrs.component_number == figComponentsStartIndex) {
                                          removeStartIndex = posAtParentBorder + 3 + offset + offsetInFig + offsetInDesc
                                        }
                                        if (nodeInDesc.attrs.component_number == figComponentsEndIndex) {
                                          removeEndIndex = posAtParentBorder + 3 + offset + offsetInFig + offsetInDesc + nodeInDesc.nodeSize
                                        }
                                      }
                                    })
                                  }
                                })
                              }
                            })
                            if (removeStartIndex !== -1) {
                              console.log('removing figure components',node.textContent,`from ${figComponentsStartIndex} to ${figComponentsEndIndex}`);
                              edView.dispatch(edView.state.tr.replaceWith(removeStartIndex, removeEndIndex, Fragment.empty).setMeta('shouldTrack',false))
                            }
                            updateMetaInfoRemove()
                            removeStartIndex = -1
                            
                            contAfter.forEach((node, offset, index) => {
                              if (node.attrs.figure_id == figureID) {
                                node.content.forEach((nodeInFig, offsetInFig, indexInFig) => {
                                  if (nodeInFig.type.name == "figure_descriptions_container") {
                                    nodeInFig.content.forEach((nodeInDesc, offsetInDesc, indexInDesc) => {
                                      if ((removeStartIndex == -1 || figureViewsToRemove[figureID].length !== 1)&&nodeInDesc.attrs.viewed_by_citat == citatID) {
                                        if (nodeInDesc.attrs.component_number == figComponentsStartIndex) {
                                          if (figComponentsStartIndex == 0) {
                                            removeStartIndex = posAtParentBorder + 3 + offset + offsetInFig + offsetInDesc - nodeInFig.content.child(1).nodeSize
                                          } else {
                                            removeStartIndex = posAtParentBorder + 3 + offset + offsetInFig + offsetInDesc
                                          }
                                        }
                                        if (nodeInDesc.attrs.component_number == figComponentsEndIndex) {
                                          removeEndIndex = posAtParentBorder + 3 + offset + offsetInFig + offsetInDesc + nodeInDesc.nodeSize
                                        }
                                      }
                                    })
                                  }
                                })
                              }
                            })
                            if (removeStartIndex !== -1) {
                              edView.dispatch(edView.state.tr.replaceWith(removeStartIndex, removeEndIndex, Fragment.empty).setMeta('shouldTrack',false))
                            }
                          }
                          contAfter.forEach((node, offset, index) => {
                            if (node.attrs.figure_id == figureID && node.attrs.viewed_by_citat == citatID) {
                              removeStartIndex = posAtParentBorder + 1 + offset
                              removeEndIndex = posAtParentBorder + 1 + offset + node.nodeSize
                            }
                          })
                          if (removeStartIndex !== -1) {
                            console.log('removing whole figure',node.textContent);
                            edView.dispatch(edView.state.tr.replaceWith(removeStartIndex, removeEndIndex, Fragment.empty).setMeta('shouldTrack',false))
                          }
                      }
                    })

                    Object.keys(figureViewsToAdd).forEach((figureID) => {

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

                      let renderingFullFigureView = true
                      if (figureViewsToAdd[figureID].length > 0) {
                        renderingFullFigureView = false
                        let figComponentsStartIndex = Math.min(...figureViewsToAdd[figureID])
                        let figComponentsEndIndex = Math.max(...figureViewsToAdd[figureID])
                        let newCompnents:any[] = [];
                        (serializedFigureToFormIOsubmission.figureComponents as any[]).forEach((component,index)=>{
                          if(figComponentsStartIndex<=index&&figComponentsEndIndex>=index){
                            newCompnents.push(component)
                          }else{
                            newCompnents.push(undefined)
                          }
                        })
                        serializedFigureToFormIOsubmission.figureComponents = newCompnents
                        if (figComponentsStartIndex !== 0) {
                          serializedFigureToFormIOsubmission.figureDescription = undefined
                        }
                      }
                      interpolateTemplate(figureTemplate!.html, serializedFigureToFormIOsubmission).then((data: any) => {
                        let templ = document.createElement('div')
                        templ.innerHTML = data
                        let Slice = DOMPMParser.parse(templ.firstChild!)
                        dispatchSubject.next(
                          {
                            renderingFullFigureView,
                            citatID,
                            renderedData: Slice.content.firstChild,
                            edView,
                            figureData: figureData,
                            componentMinIndex: Math.min(...figureViewsToAdd[figureID])
                          })
                      });
                    })
                  }, 10)

                }
                editFigureContainer(citatID, doneEditing, figureViewsToRemove, figureViewsToAdd, edView)
                doneEditing.subscribe((data: any) => {
                  try {
                    let citatNewPosition: any
                    let updateMetaInfo = () => {
                      data.edView.state.doc.descendants((node: any, pos: any, i: any) => {
                        if (node.type.name == "citation" && node.attrs.citateid == data.citatID) {
                          citatNewPosition = pos
                        }
                      })
                      //@ts-ignore
                      parentIndexAndOffset = data.edView.state.doc.content.findIndex(citatNewPosition)
                      parentNode = data.edView.state.doc.content.child(parentIndexAndOffset.index)
                      posAtParentBorder = parentIndexAndOffset.offset + parentNode.nodeSize
                      resolvedPositionATparentNodeBorder = data.edView.state.doc.resolve(posAtParentBorder)

                      contAfter = resolvedPositionATparentNodeBorder.nodeAfter!
                    }

                    let contAfter = resolvedPositionATparentNodeBorder.nodeAfter
                    updateMetaInfo()
                    if (contAfter && contAfter.type.name == 'figures_nodes_container') {

                      if (data.renderingFullFigureView) {
                        let insertFrom: number = posAtParentBorder + 1
                        let figureIsRendered = false;
                        contAfter.content.forEach((node, offset, index) => {
                          if(node.attrs.figure_number == data.figureData.figureNumber){
                            figureIsRendered = true
                          }
                          if (node.attrs.figure_number < data.figureData.figureNumber) {
                            insertFrom = posAtParentBorder + 1 + offset + node.nodeSize
                          }
                        })
                        if(!figureIsRendered){
                          console.log('inserting whole figure',node.textContent);
                          edView.dispatch(edView.state.tr.insert(insertFrom, data.renderedData).setMeta('shouldTrack',false))
                        }else{
                          let replaceStart:number = -1
                          let replaceEnd:number = -1
                          contAfter.forEach((node, offset, index) => {
                            if (node.attrs.figure_number == data.figureData.figureNumber) {
                              replaceStart = posAtParentBorder + 1 + offset
                              replaceEnd = posAtParentBorder + 1 + offset + node.nodeSize
                            }
                          })
                          if (replaceStart !== -1) {
                            console.log('inserting whole figure',node.textContent);
                            edView.dispatch(edView.state.tr.replaceWith(replaceStart, replaceEnd, data.renderedData).setMeta('shouldTrack',false))
                          }
                        }
                      } else {
                        updateMetaInfo()
                        let insertFrom: number = posAtParentBorder

                        let insertDescription: number = -1

                        let componentsAreRendered = false

                        let insertImgAndVideos: number = -1


                        let figureIsRendered = false

                        let componentsImgsAndVideos = data.renderedData.content.firstChild?.content.content
                        let figureDescription = data.renderedData.content.child(1).content
                        let componentsDescriptions: Node[] = []

                        figureDescription?.forEach((node: Node) => {
                          if (node.type.name == "figure_component_description") {
                            if (node.attrs.component_number == '0') {
                              componentsDescriptions.push(figureDescription?.child(1)!);
                            }
                            componentsDescriptions.push(node)
                          }
                        })
                        contAfter.content.forEach((node, offset, index) => {
                          if (node.attrs.figure_id == data.figureData.figureID) {
                            figureIsRendered = true
                            node.content.forEach((nodeInFig, offsetInFig, indexInFig) => {
                              if (nodeInFig.type.name == "figure_descriptions_container") {
                                insertDescription = insertFrom + offset + offsetInFig + nodeInFig.content.firstChild?.nodeSize! + 3
                                nodeInFig.content.forEach((nodeInDesc, offsetInDesc, indexInDesc) => {
                                  if(nodeInDesc.attrs.viewed_by_citat == citatID){
                                    componentsAreRendered = true
                                  }else if (nodeInDesc.attrs.component_number < data.componentMinIndex) {
                                    insertDescription = 3 + offset + offsetInFig + insertFrom + offsetInDesc
                                  }
                                })
                              }
                            })
                          }
                        })
                        if (insertDescription !== -1&&!componentsAreRendered&&figureIsRendered) {
                          console.log('inserting figure components',node.textContent,'componentMinIndex',data.componentMinIndex,componentsImgsAndVideos.length);
                          edView.dispatch(edView.state.tr.insert(insertDescription, componentsDescriptions).setMeta('shouldTrack',false))
                        }

                        updateMetaInfo()

                        contAfter.content.forEach((node, offset, index) => {
                          if (node.attrs.figure_id == data.figureData.figureID) {
                            node.content.forEach((nodeInFig, offsetInFig, indexInFig) => {
                              if (nodeInFig.type.name == "figure_components_container") {
                                insertImgAndVideos = insertFrom + offset + offsetInFig + 3
                                nodeInFig.content.forEach((nodeInCompContainer, offsetInDesc, indexInDesc) => {
                                  if(nodeInCompContainer.attrs.viewed_by_citat == citatID){
                                    componentsAreRendered = true
                                  }else if (nodeInCompContainer.attrs.component_number < data.componentMinIndex) {
                                    insertImgAndVideos = 3 + offset + offsetInFig + insertFrom + offsetInDesc
                                  }
                                })
                              }
                            })
                          }
                        })
                        if (insertImgAndVideos !== -1&&!componentsAreRendered&&figureIsRendered) {
                          edView.dispatch(edView.state.tr.insert(insertImgAndVideos, componentsImgsAndVideos).setMeta('shouldTrack',false))
                        }
                        if (!figureIsRendered) {
                          let insertFrom: number = posAtParentBorder + 1
                          contAfter.content.forEach((node, offset, index) => {
                            if (node.attrs.figure_number < data.figureData.figureNumber) {
                              insertFrom = posAtParentBorder + 1 + offset + node.nodeSize
                            }
                          })
                          edView.dispatch(edView.state.tr.insert(insertFrom, data.renderedData).setMeta('shouldTrack',false))
                        }
                      }
                    } else {
                      let container = schema.nodes.figures_nodes_container.create({}, data.renderedData);
                      console.log('inserting figure with figure container',node.textContent);
                      edView.dispatch(edView.state.tr.insert(resolvedPositionATparentNodeBorder.pos, container).setMeta('shouldTrack',false))
                    }
                  } catch (e) {
                    console.error(e);
                  }
                })
              } 
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