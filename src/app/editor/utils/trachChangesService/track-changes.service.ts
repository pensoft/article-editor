import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { undoItem } from 'prosemirror-menu';
import { Mark, Node } from 'prosemirror-model';
import { EditorState, Plugin, PluginKey, Selection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Subject } from 'rxjs';
//@ts-ignore
import { DocumentHelpers } from 'wax-prosemirror-utilities';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';
import { acceptChange, rejectChange } from '../trackChanges/acceptReject';


const getTrackChanges = (state: EditorState) => {
  const finalTracks: any[] = [];
  const allInlineNodes = DocumentHelpers.findInlineNodes(state.doc);

  allInlineNodes.map((node: any) => {
    if (node.node.marks.length > 0) {
      node.node.marks.filter((mark: any) => {

        if (
          mark.type.name === 'insertion' ||
          mark.type.name === 'deletion' ||
          mark.type.name === 'format_change'
        ) {
          mark.pos = node.pos;
          finalTracks.push(mark);
        }
      });
    }
  });
  return finalTracks;
};

const checkPosition = (editorP: { top: number, bottom: number }, positionToCheck: { top: number, bottom: number }) => {
  if (editorP.top > positionToCheck.top) {
    return 'above'
  } else if (editorP.top <= positionToCheck.top && editorP.bottom >= positionToCheck.bottom) {
    return 'in'
  } else if (editorP.bottom < positionToCheck.bottom) {
    return 'under'
  }
  return undefined
}

//let showChanges:boolean|undefined = undefined;

@Injectable({
  providedIn: 'root'
})
export class TrackChangesService {
  changesVisibilityChange
  changesObject
  hideShowPlugin
  hideshowPluginKey: PluginKey;
  acceptReject: any = {}

  editorCenter: { top: number | undefined, left: number | undefined } = { top: undefined, left: undefined }

  resetTrackChangesService() {
    Object.keys(this.changesObject).forEach((key)=>{
      this.changesObject[key] = []
    })
    Object.keys(this.acceptReject).forEach((key)=>{
      this.acceptReject[key] = undefined
    })

    this.editorCenter.top = undefined
    this.editorCenter.left = undefined
  }
  constructor(
    private ydocService: YdocService,
    private serviceShare:ServiceShare
  ) {
    serviceShare.shareSelf('TrackChangesService',this);

    let hideShowPluginKey = new PluginKey('hideShowPlugin');
    this.hideshowPluginKey = hideShowPluginKey
    let changesVisibilityChange: Subject<any> = new Subject<any>();
    this.changesVisibilityChange = changesVisibilityChange

    let changesObject: any = {};
    this.changesObject = changesObject;

    let acceptReject = this.acceptReject
    let editorCenter = this.editorCenter
    let hideShowPlugin = new Plugin({
      key: hideShowPluginKey,
      state: {
        init: (_, state) => {
          return {
            sectionName: _.sectionName,
            createdDecorations: DecorationSet.empty,
            allMatches: undefined,
            editorType: _.editorType ? _.editorType : undefined
          };
        },
        apply(tr, prev, oldState, newState) {
          let meta = tr.getMeta(hideShowPluginKey)

          /*let decorations;
          let createdDecorations = DecorationSet.empty;
          const allMatches = getTrackChanges(newState);
          if (allMatches.length > 0 && !showChanges) {

            decorations = allMatches.map((result, index) => {



              if (result.type.name === 'insertion') {
                const position = DocumentHelpers.findMarkPosition(
                  newState,
                  result.pos,
                  'insertion',
                );
                return Decoration.inline(position.from, position.to, {
                  class: 'show-insertion',
                });
              }
              if (result.type.name === 'deletion') {
                const position = DocumentHelpers.findMarkPosition(
                  newState,
                  result.pos,
                  'deletion',
                );
                return Decoration.inline(position.from, position.to, {
                  class: 'hide-deletion',
                });
              }
            });
            decorations = decorations.filter((dec) => dec !== undefined) as Decoration<{ [key: string]: any; }>[]
            if (decorations.length) {
              createdDecorations = DecorationSet.create(newState.doc, decorations);
            } else {
              createdDecorations = DecorationSet.empty
            }
          } */
          let pluginState = { ...prev };
          if (acceptReject.action) {
            pluginState.createdDecorations = DecorationSet.empty
          }
          if (meta) {
            try {
              if (oldState.selection.empty) {
                let marks1 = newState.selection.$head.marks()
                let markPos = oldState.selection.from
                let nodeAtSelect = oldState.doc.nodeAt(markPos)
                let sameMarks = nodeAtSelect?.marks == meta.marks;
                if (sameMarks && meta.focus) {

                  pluginState.createdDecorations = DecorationSet.create(oldState.doc, [Decoration.widget(oldState.selection.from, (view) => {
                    let relativeElement = document.createElement('div');
                    relativeElement.setAttribute('style', 'position: relative;display: inline;line-height: 21px;font-size: 14px;')
                    relativeElement.setAttribute('class', 'changes-placeholder')

                    let absElPosition = document.createElement('div');
                    absElPosition.setAttribute('class', 'changes-placeholder')

                    let changePlaceholder = document.createElement('div');
                    let markContent = document.createElement('div');

                    let markData = document.createElement('div');
                    let attr = nodeAtSelect?.marks.filter((mark) => {
                      return mark.attrs.class == 'insertion'
                        || mark.attrs.class == 'deletion'
                        || mark!.type.name == 'insFromPopup'
                        || mark!.type.name == 'delFromPopup'
                    })[0].attrs!
                    if (attr.class == 'insertion') {
                      markData.textContent = `Insertion from ${attr.username} \nUserId = ${attr.user}`;
                    } else if (attr.class == 'deletion') {
                      markData.textContent = `Deletion from ${attr.username} \nUserId = ${attr.user}`;
                    } else if (attr.class == 'ins-from-popup') {
                      markData.textContent = `Isertion Change from dialog save made by ${attr.username} \nUserId = ${attr.user}`;
                    } else if (attr.class == 'del-from-popup') {
                      markData.textContent = `Deletion Change from dialog save made by ${attr.username} \nUserId = ${attr.user}`;
                    }
                    markData.setAttribute('class', 'changes-placeholder')

                    markContent.append(markData)

                    changePlaceholder.append(markContent)
                    changePlaceholder.style.position = 'absolute';
                    changePlaceholder.setAttribute('class', 'changes-placeholder')


                    let buttonsContainer = document.createElement('div');
                    buttonsContainer.setAttribute('class', 'changes-placeholder')
                    buttonsContainer.setAttribute('style', `display:block`)

                    let acceptBtn = document.createElement('button')
                    acceptBtn.setAttribute('class', 'changes-placeholder')
                    let rejectBtn = document.createElement('button')
                    rejectBtn.setAttribute('class', 'changes-placeholder')
                    acceptBtn.textContent = 'Accept'
                    rejectBtn.textContent = 'Decline'
                    acceptBtn.setAttribute('style', `display: inline;
                    background-color: #eff9ef;
                    border-radius: 13px;
                    padding: 4px;
                    padding-left: 9px;cursor: pointer;
                    padding-right: 9px;
                    border: 1.4px solid black;`)
                    rejectBtn.setAttribute('style', `display: inline;
                    background-color: #fbdfd2;
                    border-radius: 13px;
                    padding: 4px;
                    padding-left: 9px;cursor: pointer;
                    padding-right: 9px;
                    margin-left: 7px;
                    border: 1.4px solid black;`)

                    acceptBtn.addEventListener('click', () => {
                      acceptReject.action = 'accept';
                      acceptReject.pos = markPos;
                      acceptReject.editorId = pluginState.sectionName;
                      relativeElement.style.display = 'none';
                    })
                    rejectBtn.addEventListener('click', () => {
                      acceptReject.action = 'reject';
                      acceptReject.pos = markPos;
                      acceptReject.editorId = pluginState.sectionName;
                      relativeElement.style.display = 'none';
                    })

                    buttonsContainer.append(acceptBtn, rejectBtn);

                    let arrow = document.createElement('div');
                    arrow.setAttribute('class', 'changes-placeholder')


                    changePlaceholder.append(buttonsContainer, arrow);

                    let backgroundColor = '#00b1b2eb'
                    relativeElement.appendChild(changePlaceholder);
                    if (editorCenter.top && editorCenter.left) {
                      /* createPopper(absElPosition, changePlaceholder , {
                        placement: 'top-start',
                        strategy:'absolute'
                      }); */
                      if (meta.coords.top <= editorCenter.top && meta.coords.left <= editorCenter.left) {
                        //topleft
                        changePlaceholder.setAttribute('style', `
                        position: absolute;
                        display: inline;
                        transform: translate(-8%, 34%);
                        background-color: ${backgroundColor};
                        border-radius: 2px;
                        width: 150px;
                        z-index: 10;
                        padding: 6px;`)
                        arrow.setAttribute('style', `
                        position: absolute;

                        border-bottom: 10px solid ${backgroundColor};
                        border-left: 6px solid rgba(0, 0, 0, 0);
                        border-right: 6px solid rgba(0, 0, 0, 0);
                        content: "";
                        display: inline-block;
                        height: 0;
                        vertical-align: top;
                        width: 0;
                        top: 0;
                        transform: translate(0, -9px);
                        `)
                      } else if (meta.coords.top <= editorCenter.top && meta.coords.left > editorCenter.left) {
                        //topright
                        changePlaceholder.setAttribute('style', `
                        position: absolute;
                        display: inline;
                        transform: translate(-92%, 34%);
                        background-color: ${backgroundColor};
                        border-radius: 2px;
                        width: 150px;
                        z-index: 10;
                        padding: 6px;`)
                        arrow.setAttribute('style', `
                        position: absolute;
                        left: 132px;
                        border-bottom: 10px solid ${backgroundColor};
                        border-left: 6px solid rgba(0, 0, 0, 0);
                        border-right: 6px solid rgba(0, 0, 0, 0);
                        content: "";
                        display: inline-block;
                        height: 0;
                        vertical-align: top;
                        width: 0;
                        top: 0;
                        transform: translate(0, -9px);
                        `)
                      } else if (meta.coords.top > editorCenter.top && meta.coords.left <= editorCenter.left) {
                        //bottomleft
                        changePlaceholder.setAttribute('style', `    position: absolute;
                        display: inline;
                        transform: translate(-10%, -111%);
                        background-color: ${backgroundColor};
                        border-radius: 2px;
                        width: 150px;
                        z-index: 10;
                        padding: 6px;`)
                        arrow.setAttribute('style', `    position: absolute;
                        border-bottom: 10px solid ${backgroundColor};
                        border-left: 6px solid rgba(0, 0, 0, 0);
                        border-right: 6px solid rgba(0, 0, 0, 0);
                        content: "";
                        display: inline-block;
                        height: 0;
                        vertical-align: top;
                        width: 0;
                        transform: rotate(
                        180deg) translate(-26%, -5px);
                        `)
                      } else if (meta.coords.top > editorCenter.top && meta.coords.left > editorCenter.left) {
                        //bottomright
                        changePlaceholder.setAttribute('style', `    position: absolute;
                        display: inline;
                        transform: translate(-91%, -111%);
                        background-color: ${backgroundColor};
                        border-radius: 2px;
                        width: 150px;
                        z-index: 10;
                        padding: 6px;`)
                        arrow.setAttribute('style', `    position: absolute;
                        right: 9%;
                        border-bottom: 10px solid ${backgroundColor};
                        border-left: 6px solid rgba(0, 0, 0, 0);
                        border-right: 6px solid rgba(0, 0, 0, 0);
                        content: "";
                        display: inline-block;
                        height: 0;
                        vertical-align: top;
                        width: 0;
                        transform: rotate(
                    180deg) translate(-50%, -5px);
                        `)
                      }

                      /* topleft
                            position: absolute;
    display: inline;
    transform: translate(-8%, 18%);
    background-color: #47d2d3;
    border-radius: 2px;
    width: 150px;
    z-index: 10;
    padding: 6px;
                      arrow
                      position: absolute;
    border-bottom: 10px solid #47d2d3;
    border-left: 6px solid rgba(0, 0, 0, 0);
    border-right: 6px solid rgba(0, 0, 0, 0);
    content: "";
    display: inline-block;
    height: 0;
    vertical-align: top;
    width: 0;
    top: -6%;
    transform: translate(15%, 0%);
                      */

                    }
                    return relativeElement;
                  })]);
                } else {
                  pluginState.createdDecorations = DecorationSet.empty
                }
              } else {
                pluginState.createdDecorations = DecorationSet.empty;
              }
            } catch (e) {
              console.error(e);
            }
          }
          return pluginState
        },

      }, props: {
        decorations: (state) => {
          let pluginState = hideShowPluginKey.getState(state);
          return pluginState.createdDecorations
        }
      },
      view: (editorView) => {
        return {
          update: (view, prevState) => {
            try {
              let pluginState = hideShowPluginKey.getState(view.state)
              let sectionName = pluginState.sectionName
              if (this.acceptReject.action && this.acceptReject.editorId == sectionName) {

                debugger
                let marks = (changesObject[sectionName] as Array<any>).filter((el) => { return el.from <= acceptReject.pos && el.to >= acceptReject.pos });
                if (marks.length == 0) {
                  return
                }
                if (this.acceptReject.action == 'accept') {
                  debugger
                  acceptChange(view,`${marks[0].type}`, {...marks[0].markattrs})
                } else if (this.acceptReject.action == 'reject') {
                  debugger
                  rejectChange(view,`${marks[0].type}`, {...marks[0].markattrs})
                }
                this.acceptReject.action = undefined
                this.acceptReject.editorId = undefined
                this.acceptReject.pos = undefined
              }
              /* if(!this.serviceShare.ProsemirrorEditorsService?.editorContainers[sectionName]){
                return;
              } */
              if (JSON.stringify(view.state.doc) == JSON.stringify(prevState.doc) && !view.hasFocus()) {
                return;
              }
              let deletionMark = view.state.schema.marks.deletion
              let insertionMark = view.state.schema.marks.insertion
              let format_changeMark = view.state.schema.marks.format_change

              let delFromPopup = view.state.schema.marks.delFromPopup
              let insFromPopup = view.state.schema.marks.insFromPopup

              let editor
              if (pluginState.editorType == 'popupEditor') {
                editor = document.getElementsByTagName('mat-dialog-container').item(0) as HTMLDivElement
              } else {
                editor = document.getElementsByClassName('editor-container').item(0) as HTMLDivElement
              }
              if (editor) {
                let elemRect = editor.getBoundingClientRect();
                let editorCoordinatesObj = {
                  top: elemRect.top,
                  //left: elemRect.left,
                  //right: elemRect.right,
                  bottom: elemRect.bottom,
                }
                this.editorCenter.top = (elemRect.top + elemRect.bottom) / 2
                this.editorCenter.left = (elemRect.left + elemRect.right) / 2
                let coords = { left: elemRect.left + 17, top: elemRect.top + 11 }
                let coords2 = { left: elemRect.right - 80, top: elemRect.bottom - 9 }
                //let startOfEditor = view.posAtCoords(coords);
                //let endOfEditor = view.posAtCoords(coords2);
                let startCoords = view.coordsAtPos(0)
                let startPosition = checkPosition(editorCoordinatesObj, { top: startCoords.top, bottom: startCoords.bottom })
                let endOfEditor = view.state.doc.content.size
                let endCoords = view.coordsAtPos(endOfEditor)
                let endPosition = checkPosition(editorCoordinatesObj, { top: endCoords.top, bottom: endCoords.bottom })
                if ((startPosition == endPosition && endPosition == 'above' || startPosition == endPosition && endPosition == 'under') && pluginState.editorType !== 'popupEditor') {

                  changesObject[sectionName] = [];

                  return
                } else {
                  let displayChangesFrom = 0;
                  let displayChangesTo = endOfEditor;
                  if (startPosition == 'above' && pluginState.editorType !== 'popupEditor') {
                    displayChangesFrom = view.posAtCoords(coords)?.pos!;
                  }
                  if (endPosition == 'under' && pluginState.editorType !== 'popupEditor') {
                    displayChangesTo = view.posAtCoords(coords2)?.pos!;
                  }
                  let allChangesMarksFound: any[] = []
                  let doc = view.state.doc
                  doc.nodesBetween(displayChangesFrom, displayChangesTo, (node, from) => {
                    if (node.marks) {
                      const actualMarks = node.marks.filter(mark =>
                        mark.type === deletionMark ||
                        mark.type === insertionMark ||
                        mark.type === delFromPopup ||
                        mark.type === insFromPopup ||
                        mark.type === format_changeMark
                      );
                      actualMarks.forEach((mark) => {
                        allChangesMarksFound.push({
                          mark: mark,
                          markattrs:{...mark.attrs},
                          from: from,
                          to: from + node.nodeSize,
                          text: doc.textBetween(from, from + node.nodeSize),
                          viewRef: view,
                          type: mark.type.name,
                          main:this.serviceShare.ProsemirrorEditorsService?.editorContainers[sectionName]&&true
                        })
                      })

                      /* if (actualMark) {
                        let comFound = allCommentMarksFound.length
                        if (comFound > 0 && allCommentMarksFound[comFound - 1].attrs.id == actualMark.attrs.id) {
                          allCommentMarksFound[comFound - 1].to = from + node.nodeSize
                          allCommentMarksFound[comFound - 1].text = doc.textBetween(allCommentMarksFound[comFound - 1].from,from + node.nodeSize)
                        } else {
                          let markFound = {
                            from,
                            to: from + node.nodeSize,
                            text:doc.textBetween(from,from + node.nodeSize),
                            section:sectionName,
                            attrs: actualMark.attrs,
                            viewRef:view
                          };
                          allCommentMarksFound.push(markFound)
                        }
                      } */
                    }
                  });

                  changesObject[sectionName] = allChangesMarksFound;
                }
                changesVisibilityChange.next(changesObject);
              }
            } catch (e) {
              console.error(e);
            }
          },
          destroy: () => {
            let pluginState = hideShowPluginKey.getState(editorView.state)
            let sectionName = pluginState.sectionName
            changesObject[sectionName]=[]
          }
        }
      }
    });
    this.hideShowPlugin = hideShowPlugin;
  }



  getHideShowPlugin() {
    return this.hideShowPlugin
  }

  getData() {
    return this.changesObject
  }
}
