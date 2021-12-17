import { FormControl, FormGroup } from "@angular/forms";
import { DOMSerializer, Schema, Node, Fragment, ResolvedPos, Slice, Mark } from "prosemirror-model";
import { EditorState, PluginKey, Transaction } from "prosemirror-state";
import { DecorationSet, EditorView } from "prosemirror-view";
import { YMap } from "yjs/dist/src/internals";
import { articleSection } from "../interfaces/articleSection";
import { DOMParser } from "prosemirror-model"
import { uuidv4 } from "lib0/random";
import { Subject } from "rxjs";
import { split } from "lodash";
import { notEqual } from "assert";
import { C } from "@angular/cdk/keycodes";
import { ReplaceStep } from "prosemirror-transform";
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
  rerenderFigures: (citats: any) => any,
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
            } else if (node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0) {
              let citationMark = node.marks.filter((mark) => { return mark.type.name == 'citation' })[0]
              if (!figuresCitats[section?.sectionID!][citationMark.attrs.citateid]) {
                if (!transaction.getMeta('y-sync$')) {
                  let attrs = citationMark.attrs
                  let redefinedCitat: any = {}
                  redefinedCitat.figureIDs = attrs.citated_figures
                  redefinedCitat.position = pos
                  redefinedCitat.lastTimeUpdated = attrs.last_time_updated
                  redefinedCitat.displaydFiguresViewhere = attrs.figures_display_view
                  figuresCitats[section?.sectionID!][citationMark.attrs.citateid] = redefinedCitat
                  setTimeout(rerenderFigures(figuresCitats), 0)
                } else if (transaction.getMeta('y-sync$')) {
                  //figuresCitats[section?.sectionID!][node.attrs.citateid] = undefined
                }
              }

              let citateData = figuresCitats[section?.sectionID!][citationMark.attrs.citateid]
              citateData.position = pos
              //tr1.setNodeMarkup(pos, node.type, undefined,[citationMark.type.create({...citationMark.attrs, last_time_updated: citateData.lastTimeUpdated})])
              let newNode = schema.text(node.textContent) as Node
               let newMark = schema.mark('citation', { ...citationMark.attrs, last_time_updated: citateData.lastTimeUpdated })
              /*newNode = newNode.mark([newMark])
              tr1 = tr1.replaceWith(pos, node.nodeSize, newNode) */
              tr1 = tr1.addMark(pos,pos+ node.nodeSize,newMark)
              let edView = editorContainers[section?.sectionID!].editorView

              let resolvedPositionOfCitat: ResolvedPos
              //@ts-ignore
              //let parentIndexAndOffset:any
              let parentNode: Node
              let posAtParentBorder: number
              let resolvedPositionATparentNodeBorder: ResolvedPos

              //let shouldRerender = false
              let oldDisplayViewsInCitat = [...citationMark.attrs.figures_display_view];
              /* if((!resolvedPositionATparentNodeBorder.nodeAfter||resolvedPositionATparentNodeBorder.nodeAfter.type.name !=='figures_nodes_container')&&oldDisplayViewsInCitat.length>0){
                shouldRerender = true;
              } */

              if (citationMark.attrs.last_time_updated !== citateData.lastTimeUpdated/* ||shouldRerender */) {
                let newDisplayViewsInCitat = citateData.displaydFiguresViewhere;
                let newNode = schema.text(node.textContent) as Node
                let newMark = schema.mark('citation', { ...citationMark.attrs, last_time_updated: citateData.lastTimeUpdated, figures_display_view: newDisplayViewsInCitat })
                
                /* newNode = newNode.mark([newMark])
                tr1 = tr1.replaceWith(pos, node.nodeSize, newNode) */
                tr1 = tr1.addMark(pos, pos+node.nodeSize,newMark)
                //tr1 = tr1.setNodeMarkup(pos, node.type, undefined, [citationMark.type.create()])

                let viewsToRemove: string[] = newDisplayViewsInCitat ? oldDisplayViewsInCitat.reduce((prev, curr, i) => {
                  return newDisplayViewsInCitat.includes(curr) ? prev : prev.concat([curr])
                }, []) : []
                let viewsToAdd: string[] = newDisplayViewsInCitat ? newDisplayViewsInCitat.reduce((prev: any[], curr: string, i: number) => {
                  return oldDisplayViewsInCitat.includes(curr) ? prev : prev.concat([curr])
                }, []) : []

                /* if(shouldRerender){
                  viewsToAdd = newDisplayViewsInCitat
                  viewsToRemove = []
                }else{ }*/
                viewsToAdd = newDisplayViewsInCitat || []
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
                let citatID = citationMark.attrs.citateid

                let editFigureContainer = (
                  citatID: string,
                  dispatchSubject: Subject<any>,
                  figureViewsToRemove: { [key: string]: number[], },
                  figureViewsToAdd: { [key: string]: number[], },
                  edView: EditorView) => {
                  setTimeout(() => {
                    /* Object.keys(figureViewsToRemove).forEach((figureID) => {
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
                            edView.dispatch(edView.state.tr.replaceWith(removeStartIndex, removeEndIndex, Fragment.empty).setMeta('shouldTrack',false))
                          }
                      }
                    })*/
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
                      /*
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
                      } */
                      interpolateTemplate(figureTemplate!.html, serializedFigureToFormIOsubmission).then((data: any) => {
                        let templ = document.createElement('div')
                        templ.innerHTML = data
                        let Slice = DOMPMParser.parse(templ.firstChild!)
                        dispatchSubject.next(
                          {
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
                    let wrappingNodes = ['paragraph', 'heading', 'table', 'code_block', 'ordered_list', 'bullet_list', 'math_inline', 'math_display']
                    let updateMetaInfo = () => {
                      let docSize = data.edView.state.doc.nodeSize
                      data.edView.state.doc.nodesBetween(0,docSize-2,(node: any, pos: any, i: any) => {
                        let marks = node.marks.filter((mark:Mark) => { return mark.type.name == 'citation' })
                        if ( marks.length > 0 && marks[0].attrs.citateid == data.citatID) {
                          citatNewPosition = pos
                        }
                      })
                      if (!citatNewPosition) {
                        return
                      }
                      resolvedPositionOfCitat = data.edView.state.doc.resolve(citatNewPosition)
                      //@ts-ignore
                      let resolvedCitationPath: Array<Node | number> = resolvedPositionOfCitat.path

                      let offsetOfwrappingParent: number
                      let wrappingParent
                      let nodeAfterWrappingParent


                      for (let i = resolvedCitationPath.length - 1; i > -1; i--) {
                        let el = resolvedCitationPath[i];
                        if (el instanceof Node) {
                          if (wrappingNodes.includes(el.type.name)) {
                            offsetOfwrappingParent = resolvedCitationPath[i - 1] as number
                            wrappingParent = el
                          }
                        }
                      }

                      posAtParentBorder = offsetOfwrappingParent! + wrappingParent?.nodeSize!
                      resolvedPositionATparentNodeBorder = data.edView.state.doc.resolve(posAtParentBorder)
                      contAfter = edView.state.doc.nodeAt(posAtParentBorder)!;
                      //@ts-ignore
                      //parentIndexAndOffset = data.edView.state.doc.content.findIndex(citatNewPosition)
                      /* parentNode = data.edView.state.doc.content.child(parentIndexAndOffset.index)
                      posAtParentBorder = parentIndexAndOffset.offset + parentNode.nodeSize
                      resolvedPositionATparentNodeBorder = data.edView.state.doc.resolve(posAtParentBorder) */

                      contAfter = resolvedPositionATparentNodeBorder.nodeAfter!
                    }

                    let contAfter: Node | null
                    updateMetaInfo()
                    //@ts-ignore
                    if (contAfter && contAfter.type.name == 'figures_nodes_container') {

                      let insertFrom: number = posAtParentBorder + 1
                      let figureIsRendered = false;
                      contAfter.content.forEach((node, offset, index) => {
                        if (node.attrs.figure_number == data.figureData.figureNumber) {
                          figureIsRendered = true
                        }
                        if (node.attrs.figure_number < data.figureData.figureNumber) {
                          insertFrom = posAtParentBorder + 1 + offset + node.nodeSize
                        }
                      })
                      if (!figureIsRendered) {
                        edView.dispatch(edView.state.tr.insert(insertFrom, data.renderedData).setMeta('shouldTrack', false))
                      } else {
                        let replaceStart: number = -1
                        let replaceEnd: number = -1
                        contAfter.forEach((node, offset, index) => {
                          if (node.attrs.figure_number == data.figureData.figureNumber) {
                            replaceStart = posAtParentBorder + 1 + offset
                            replaceEnd = posAtParentBorder + 1 + offset + node.nodeSize
                          }
                        })
                        if (replaceStart !== -1) {
                          edView.dispatch(edView.state.tr.replaceWith(replaceStart, replaceEnd, data.renderedData).setMeta('shouldTrack', false))
                        }
                      }
                      /* if (data.renderingFullFigureView) {
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
                      } */
                    } else {
                      if (!resolvedPositionATparentNodeBorder) {
                        return
                      }
                      let container = schema.nodes.figures_nodes_container.create({}, data.renderedData);
                      edView.dispatch(edView.state.tr.insert(resolvedPositionATparentNodeBorder.pos, container).setMeta('shouldTrack', false))
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
                  tr1 = tr1.setNodeMarkup(pos, node.type, { ...node.attrs, invalid: "false" })

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


export const preventDragDropCutOnNoneditablenodes = (figuresMap: YMap<any>, rerenderFigures: (citats: any) => any, sectionID: string, citatsEditingSubject?: Subject<any>) => {

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
              if (node.marks.filter((mark)=>{return mark.type.name == 'citation'}).length>0) {
                let citatMark = node.marks.filter((mark)=>{return mark.type.name == 'citation'})[0]
                let citatID = citatMark.attrs.citateid
                //@ts-ignore
                if (figuresCitats[sectionID][citatID] && transaction.getMeta('y-sync$')) {

                  //@ts-ignore
                } else if (figuresCitats[sectionID][citatID] && !transaction.getMeta('y-sync$') && !transaction.getMeta('citatsTextChange')) {
                  if (citatsEditingSubject) {
                    citatsEditingSubject.next({
                      action: 'delete',
                      sectionID,
                      citatID
                    })
                  } else {
                    setTimeout(() => {
                      figuresCitats[sectionID][citatID] = undefined
                      figuresMap.set('articleCitatsObj', figuresCitats)
                      rerenderFigures(figuresCitats)
                    }, 10)
                  }
                }
              }
            })
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
}

//handle right click on citats
export const handleClickOn = (citatContextPluginKey: PluginKey) => {

  return (view: EditorView, pos: number, node: Node, nodePos: number, e: MouseEvent, direct: boolean) => {
    if (node.marks.filter((mark)=>{return mark.type.name == 'citation'}) &&
      (("which" in e && e.which == 3) ||
        ("button" in e && e.button == 2)
      )) {
      let cursurCoord = view.coordsAtPos(pos);
      view.dispatch(view.state.tr.setMeta('citatContextPlugin', {
        clickPos: pos,
        citatPos: nodePos,
        clickEvent: e,
        focus: view.hasFocus(),
        direct,
        coords: cursurCoord
      }))
      return false
    } else if (citatContextPluginKey.getState(view.state).decorations !== undefined) {
      return false
    } else {
      return true
    }
  }
}