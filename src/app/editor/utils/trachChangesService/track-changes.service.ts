import { Injectable } from '@angular/core';
import { changeData } from '@app/editor/changes-section/changes-section.component';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { undoItem } from 'prosemirror-menu';
import { Mark, Node } from 'prosemirror-model';
import { AllSelection, EditorState, Plugin, PluginKey, Selection } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { Subject } from 'rxjs';
//@ts-ignore
import { DocumentHelpers } from 'wax-prosemirror-utilities';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';
import { articlePosOffset } from '../commentsService/comments.service';
import { acceptChange, rejectChange } from '../trackChanges/acceptReject';
export let selInChange = (sel:Selection,node:Node,nodePos:number) =>{
  let nodestart= nodePos;
  let nodeend = nodePos+node.nodeSize;
  return nodestart<=sel.from&&nodeend>=sel.to
}

let changesMarksNames = ['insertion','deletion'];

let changeMarksOnNode = (node:Node)=>{
  return  node.marks.find(mark => changesMarksNames.includes(mark.type.name))
}

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
  hideShowPlugin
  hideshowPluginKey: PluginKey;
  acceptReject: any = {}

  focusedChangeIndex?:number
  lastSelectedChanges: { [key: string]: { changeMarkId: string, section: string,pos:number } }
  editorCenter: { top: number | undefined, left: number | undefined } = { top: undefined, left: undefined }

  resetTrackChangesService() {
    Object.keys(this.acceptReject).forEach((key)=>{
      this.acceptReject[key] = undefined
    })

    this.changesObj = {}
    this.editorCenter.top = undefined
    this.editorCenter.left = undefined
  }

  updateAllChanges() {
    this.getChangesInAllEditors()
    this.updateTimestamp = Date.now();
  }

  changesObj:{[kes:string]:changeData} = {}
  changesChangeSubject: Subject<any> = new Subject()

  getChangesInAllEditors = () => {
    this.changesObj = {}
    let edCont = this.serviceShare.ProsemirrorEditorsService.editorContainers
    Object.keys(edCont).forEach((sectionId) => {
      let view = edCont[sectionId].editorView;
      this.getChanges(view, sectionId);
    })
    this.changesChangeSubject.next('changes pos calc for all sections');
  }

  getChanges = (view: EditorView, sectionId: string) => {
    let doc = view.state.doc
    let docSize: number = doc.content.size;
    doc.nodesBetween(0, docSize - 1, (node, pos, parent, index) => {
      const actualMark = node.marks.find(mark => changesMarksNames.includes(mark.type.name));

      if (actualMark) {
        // should get the top position , the node document position , the section id of this view
        let articleElement = document.getElementById('app-article-element') as HTMLDivElement
        let articleElementRactangle = articleElement.getBoundingClientRect()
        let domCoords = view.coordsAtPos(pos)
        let markIsLastSelected = false

        let selComment = this.lastSelectedChanges[actualMark.attrs.id];
        if (selComment) {
          if (!this.serviceShare.ProsemirrorEditorsService.editorContainers[selComment.section]) {
            this.lastSelectedChanges[actualMark.attrs.id] = undefined
          } else if (selComment.pos == pos&&selComment.changeMarkId == actualMark.attrs.id && selComment.section == sectionId) {
            markIsLastSelected = true
          }
        }
        let lastSelected: true | undefined
        if (
          this.lastChangeSelected.changeMarkId == actualMark.attrs.id &&
          this.lastChangeSelected.section == sectionId &&
          this.lastChangeSelected.pmDocStartPos == pos
        ) {
          lastSelected = true
        }
        if (lastSelected) {
        }
        if (markIsLastSelected || lastSelected || (!(markIsLastSelected || lastSelected) && !this.changesObj[actualMark.attrs.id])) {
          /*
          {
    "changeMarkId": "0a2c76d6-33ad-435e-913e-f0ab78da94d0",
    "pmDocStartPos": 121,
    "pmDocEndPos": 133,
    "section": "endEditor",
    "domTop": 1599.869888305664,
    "changeTxt": "ауисдхасиудх",
    "changeAttrs": {
        "class": "insertion",
        "id": "0a2c76d6-33ad-435e-913e-f0ab78da94d0",
        "user": "96c57a87-3301-4ecf-8083-29a323b16b43",
        "username": "Минчо Милев",
        "userColor": "rgb(222, 254, 245)",
        "userContrastColor": "#000000",
        "date": 1673598474455,
        "group": "",
        "viewid": "",
        "style": " ;color: #000000;background: rgb(222, 254, 245);color: #000000;background: rgb(222, 254, 245);color: #000000;background: rgb(222, 254, 245);color: #000000;background: rgb(222, 254, 245)",
        "connectedTo": "1badf54d-3a54-41da-b73e-a6e99b942e9b"
    },
    "selected": false
} */
          this.changesObj[actualMark.attrs.id] = {
            changeMarkId: actualMark.attrs.id,
            pmDocStartPos: pos,
            pmDocEndPos: pos + node.nodeSize,
            section: sectionId,
            domTop: domCoords.top - articleElementRactangle.top - articlePosOffset,
            changeTxt: node.textContent,
            changeAttrs: actualMark.attrs,
            type:actualMark.type.name,
            selected: markIsLastSelected,
          }
        }
      }
    })
  }

  updateTimestamp
  updateTimeout
  changeInEditors = () => {
    let now = Date.now();
    if (!this.updateTimestamp) {
      this.updateTimestamp = Date.now();
      this.updateAllChanges()
    }
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    if (now - this.updateTimestamp > 500) {
      this.updateAllChanges()
    }
    this.updateTimeout = setTimeout(() => {
      this.updateAllChanges()
    }, 500)
  }
  lastSelectedChangeSubject: Subject<{
    pmDocStartPos?: number,
    section?: string,
    changeMarkId?: string,
  }> = new Subject()
  lastChangeSelected:{changeMarkId?:string,pmDocStartPos?:number, section?:string }
  sameAsLastSelectedChange = (pos?: number, sectionId?: string, changeMarkIdPrim?: string) => {
    if (
      this.lastChangeSelected.changeMarkId != changeMarkIdPrim ||
      this.lastChangeSelected.section != sectionId ||
      this.lastChangeSelected.pmDocStartPos != pos
    ) {
      return false;
    } else {
      return true;
    }
  }

  setLastSelectedChange = (pos?: number, sectionId?: string, changeMarkIdPrim?: string,focus?:true) => {
    if (!this.sameAsLastSelectedChange(pos, sectionId, changeMarkIdPrim)||focus) {
      this.lastSelectedChangeSubject.next({ pmDocStartPos:pos, section:sectionId, changeMarkId:changeMarkIdPrim })
    }
  }

  constructor(
    private ydocService: YdocService,
    private serviceShare:ServiceShare
  ) {
    serviceShare.shareSelf('TrackChangesService',this);
    this.lastSelectedChangeSubject.subscribe((data) => {
      this.lastChangeSelected.pmDocStartPos = data.pmDocStartPos
      this.lastChangeSelected.section = data.section
      this.lastChangeSelected.changeMarkId = data.changeMarkId
    })
    let hideShowPluginKey = new PluginKey('hideShowPlugin');
    this.hideshowPluginKey = hideShowPluginKey

    let changeInEditors = this.changeInEditors
    let lastChangeSelected: {
      pmDocStartPos?: number,
      section?: string,
      changeMarkId?: string,
    } = {}
    this.lastChangeSelected = lastChangeSelected
    let lastSelectedChanges: { [key: string]: { changeMarkId: string, section: string,pos:number } } = {}
    this.lastSelectedChanges = lastSelectedChanges

    let acceptReject = this.acceptReject
    let editorCenter = this.editorCenter
    let setLastSelectedChange = this.setLastSelectedChange
    let sameAsLastSelectedChange = this.sameAsLastSelectedChange
    let hideShowPlugin = new Plugin({
      key: hideShowPluginKey,
      state: {
        init: (_:any, state) => {
          return {
            sectionName: _.sectionName,
            createdDecorations: DecorationSet.empty,
            allMatches: undefined,
            editorType: _.editorType ? _.editorType : undefined
          };
        },
        apply(tr, prev, oldState, newState) {
          let { from, to, empty } = newState.selection;

          let meta = tr.getMeta(hideShowPluginKey)

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
                        || mark.attrs.class == 'format-change'
                    })[0].attrs!
                    if (attr.class == 'insertion') {
                      markData.textContent = `Insertion from ${attr.username} \nUserId = ${attr.user}`;
                    } else if (attr.class == 'deletion') {
                      markData.textContent = `Deletion from ${attr.username} \nUserId = ${attr.user}`;
                    } else if (attr.class == 'ins-from-popup') {
                      markData.textContent = `Isertion Change from dialog save made by ${attr.username} \nUserId = ${attr.user}`;
                    } else if (attr.class == 'del-from-popup') {
                      markData.textContent = `Deletion Change from dialog save made by ${attr.username} \nUserId = ${attr.user}`;
                    } else if (attr.class == 'format-change'){
                      markData.textContent = `Text Format Change made by ${attr.username} \nUserId = ${attr.user}`;
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
                      let view = serviceShare.ProsemirrorEditorsService.editorContainers[pluginState.sectionName].editorView;
                      acceptReject.action = 'accept';
                      acceptReject.pos = markPos;
                      acceptReject.editorId = pluginState.sectionName;
                      acceptChange(view, attr.class, attr);
                      relativeElement.style.display = 'none';
                    })
                    rejectBtn.addEventListener('click', () => {
                      let view = serviceShare.ProsemirrorEditorsService.editorContainers[pluginState.sectionName].editorView;
                      acceptReject.action = 'reject';
                      acceptReject.pos = markPos;
                      acceptReject.editorId = pluginState.sectionName;
                      rejectChange(view, attr.class, attr);
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
          let selectedAChange = false;

          let changeInSelection = (actualMark: Mark, pos: number) => {
            if (sameAsLastSelectedChange(pos, prev.sectionName, actualMark.attrs.id)) {
              return
            }
            setLastSelectedChange(pos, prev.sectionName, actualMark.attrs.id);
            lastSelectedChanges[actualMark.attrs.id] = {
              changeMarkId: actualMark.attrs.id,
              section: prev.sectionName,
              pos
            }
          }
          let sectionContainer = serviceShare.ProsemirrorEditorsService.editorContainers[prev.sectionName]
          let view = sectionContainer?sectionContainer.editorView:undefined

          if (!(newState.selection instanceof AllSelection) && view && view.hasFocus() ) {

            newState.doc.nodesBetween(from, to, (node, pos, parent) => {
              if (node.marks.length > 0) {
                const actualMark = changeMarksOnNode(node)
                if (actualMark && selInChange(newState.selection,node,pos)) {
                  changeInSelection(actualMark, pos)
                  selectedAChange = true;
                }
              }
            })
          }

          //check nodes before and after selection if there is no change in the selection
          if (!selectedAChange && !(newState.selection instanceof AllSelection) && view  && view.hasFocus() ) {
            let sel = newState.selection
            let nodeAfterSelection = sel.$to.nodeAfter
            let nodeBeforeSelection = sel.$from.nodeBefore
            let foundMark = false;
            if (nodeAfterSelection) {
              let pos = sel.to
              let commentMark = changeMarksOnNode(nodeAfterSelection)
              if (commentMark  && selInChange(newState.selection,nodeAfterSelection,pos)) {
                changeInSelection(commentMark, pos)
                selectedAChange = true;
                foundMark = true;
              }
            }
            if(nodeBeforeSelection && !foundMark){
              let pos = sel.from
              let commentMark = changeMarksOnNode(nodeBeforeSelection)
              if (commentMark  && selInChange(newState.selection,nodeBeforeSelection,pos)) {
                changeInSelection(commentMark, pos)
                selectedAChange = true;
                foundMark = true;
              }
            }
            /* if (nodeBeforeSelection && !foundMark) {
              let pos = sel.from - nodeBeforeSelection.nodeSize
              let commentMark = nodeBeforeSelection.marks.find(mark => mark.type === commentsMark)
              if (commentMark && selInComment(newState.selection,nodeBeforeSelection,pos)) {
                commentInSelection(commentMark, pos)
                selectedAComment = true;
              }
            } */
          }
          if (!selectedAChange && !(newState.selection instanceof AllSelection) && view  && view.hasFocus() ) {
            setLastSelectedChange(undefined, undefined, undefined, undefined)
          }
          if (!(newState.selection instanceof AllSelection) /* && view.hasFocus() && tr.steps.length > 0 */) {
            changeInEditors()
          }

          return pluginState
        },
      }, props: {
        decorations: (state) => {
          let pluginState = hideShowPluginKey.getState(state);
          return pluginState.createdDecorations
        }
      },
    });
    this.hideShowPlugin = hideShowPlugin;
  }

  getHideShowPlugin() {
    return this.hideShowPlugin
  }
}
