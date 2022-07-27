import { Injectable } from '@angular/core';
import { AllSelection, EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { Transaction } from 'yjs';
//@ts-ignore
import { DocumentHelpers } from 'wax-prosemirror-utilities';
//@ts-ignore
import { minBy, maxBy, last } from 'lodash';
import { from, Subject } from 'rxjs';
import { Observable } from 'lib0/observable';
import { state } from '@angular/animations';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { Mark } from 'prosemirror-model';

export interface commentData {
  pmDocStartPos: number,
  pmDocEndPos: number,
  domTop: number,
  commentTxt: string,
  section: string,
  commentAttrs: any,
  commentMarkId:string,
  selected?: true,
  lastSelected?: true
}
@Injectable({
  providedIn: 'root'
})

export class CommentsService {
  addCommentSubject
  commentsPlugin: Plugin
  commentPluginKey: PluginKey
  storeData: any;
  editorsOuterDiv?: HTMLDivElement
  commentsObject: any
  commentsVisibilityChange: Subject<any>
  addCommentData?: any = {}
  commentAllowdIn?: any = {} // editor id where comment can be made RN equals ''/undefined if there is no such editor RN
  selectedTextInEditors?: any = {} // selected text in every editor
  lastSelectedComments: { [key: string]: { [key: string]: { selected: boolean, markid: string } } }
  lastCommentSelected: {
    commentId?: string,
    pos?: number,
    sectionId?: string,
    commentMarkId?:string,
  }
  lastSelectedCommentSubject:Subject<{
    commentId?: string,
    pos?: number,
    sectionId?: string
  }> = new Subject()
  resetCommentsService() {
    this.storeData = undefined;
    this.editorsOuterDiv = undefined;
    Object.keys(this.commentsObject).forEach((key) => {
      this.commentsObject[key] = []
    })
    this.addCommentData = {}
    this.commentAllowdIn = {} // editor id where comment can be made RN equals ''/undefined if there is no such editor RN
    this.selectedTextInEditors = {}
  }
  constructor(private serviceShare: ServiceShare) {
    this.lastSelectedCommentSubject.subscribe((data)=>{
      this.lastCommentSelected.commentId = data.commentId
      this.lastCommentSelected.pos = data.pos
      this.lastCommentSelected.sectionId = data.sectionId
    })
    serviceShare.shareSelf('CommentsService', this)
    let addCommentSubject1 = new Subject<any>()
    this.addCommentSubject = addCommentSubject1
    this.addCommentSubject.subscribe((data) => {
      if (data.type == 'commentData') {
        this.addCommentData = data
      } else if (data.type == 'commentAllownes') {
        this.commentAllowdIn[data.sectionId] = data.allow

        this.selectedTextInEditors[data.sectionId] = data.text


      }
    })

    let commentPluginKey = new PluginKey('commentPlugin')
    this.commentPluginKey = commentPluginKey;
    let checkPosition = (editorP: { top: number, bottom: number }, positionToCheck: { top: number, bottom: number }) => {
      if (editorP.top > positionToCheck.top) {
        return 'above'
      } else if (editorP.top <= positionToCheck.top && editorP.bottom >= positionToCheck.bottom) {
        return 'in'
      } else if (editorP.bottom < positionToCheck.bottom) {
        return 'under'
      }
      return undefined
    }
    let getCommentsInDoc = this.getCommentsInDoc
    let commentsVisibilityChange: Subject<any> = new Subject<any>();
    this.commentsVisibilityChange = commentsVisibilityChange

    let commentsObject: any = {};
    this.commentsObject = commentsObject;
    let lastSelectedComments: { [key: string]: { [key: string]: { selected: boolean, markid: string } } } = {}
    let lastCommentSelected: {
      commentId?: string,
      pos?: number,
      sectionId?: string
    } = {}
    this.lastCommentSelected = lastCommentSelected
    this.lastSelectedComments = lastSelectedComments
    let setLastSelectedComment = this.setLastSelectedComment
    this.commentsPlugin = new Plugin({
      key: this.commentPluginKey,
      state: {
        init: (_, state) => {
          return { sectionName: _.sectionName };
        },
        apply(tr, prev, oldState, newState) {
          let { from, to, empty } = oldState.selection;
          let err = false
          let text = oldState.doc.textBetween(from, to)
          let commentableAttr = true
          let errorMessage = ''
          if (empty || from == to) {
            errorMessage = 'Selection is empty.'
            err = true
          }
          let selectedAComment = false;
          let commentsMark = oldState.schema.marks.comment
          let commentInSelection = (actualMark: Mark, pos: number) => {
            err = true
            errorMessage = "There is a comment here already"
            if (!lastSelectedComments[prev.sectionName]) {
              lastSelectedComments[prev.sectionName] = {}
            }
            lastSelectedComments[prev.sectionName][actualMark.attrs.id] = { selected: true, markid:actualMark.attrs.commentmarkid };
            setLastSelectedComment(actualMark.attrs.id,pos,prev.sectionName,actualMark.attrs.commentmarkid)
            Object.keys(lastSelectedComments).forEach((section) => {
              let selCommInSec = lastSelectedComments[section]
              Object.keys(selCommInSec).forEach((commentid) => {
                let comm = selCommInSec[commentid];
                if (commentid == actualMark.attrs.id && section != prev.sectionName) {
                  lastSelectedComments[section][commentid] = undefined
                }
              })
            })
          }
          let view = serviceShare.ProsemirrorEditorsService.editorContainers[prev.sectionName].editorView
          if (!(oldState.selection instanceof AllSelection)&&view.hasFocus()) {

            oldState.doc.nodesBetween(from, to, (node, pos, parent) => {
              if (node.marks.length > 0) {
                const actualMark = node.marks.find(mark => mark.type === commentsMark)
                if (actualMark) {
                  commentInSelection(actualMark, pos)
                  selectedAComment = true;
                }

              }
              if (node.attrs.commentable == 'false') {
                commentableAttr = false
              }
            })
          }
          if (!commentableAttr && !err) {
            errorMessage = "You can't leave comment there."
            err = true
          }
          if(!selectedAComment&&!(oldState.selection instanceof AllSelection)&&view.hasFocus()){
            let sel = newState.selection
            let nodeAfterSelection = sel.$to.nodeAfter
            let nodeBeforeSelection = sel.$from.nodeBefore
            let foundMark = false;
            if(nodeAfterSelection){
              let pos = sel.to
              let commentMark = nodeAfterSelection.marks.find(mark => mark.type === commentsMark)
              if(commentMark){
                commentInSelection(commentMark, pos)
                selectedAComment = true;
                foundMark = true;
              }
            }
            if(nodeBeforeSelection&&!foundMark){
              let pos = sel.from-nodeBeforeSelection.nodeSize
              let commentMark = nodeBeforeSelection.marks.find(mark => mark.type === commentsMark)
              if(commentMark){
                commentInSelection(commentMark, pos)
                selectedAComment = true;
              }
            }
          }
          if (!selectedAComment&&!(oldState.selection instanceof AllSelection)&&view.hasFocus()) {
            setLastSelectedComment(undefined,undefined,undefined,undefined)
          }
          let commentdata = { type: 'commentAllownes', sectionId: prev.sectionName, allow: !err, text, errorMessage, err }
          addCommentSubject1.next(commentdata)

          return { ...prev, commentsStatus: commentdata }
        },
      },

      view: function () {
        return {
          update: (view, prevState) => {
            let pluginData = commentPluginKey.getState(view.state)
            let sectionName = pluginData.sectionName
            getCommentsInDoc(view, sectionName)
            if (JSON.stringify(view.state.doc) == JSON.stringify(prevState.doc) && !view.hasFocus()) {
              return;
            }
            let commentsMark = view.state.schema.marks.comment
            let editor = document.getElementsByClassName('editor-container').item(0) as HTMLDivElement

            let commentsStatus = pluginData.commentsStatus
            attachCommentBtn(editor, view, commentsStatus)


            if (editor) {
              let elemRect = editor.getBoundingClientRect();
              let editorCoordinatesObj = {
                top: elemRect.top,
                //left: elemRect.left,
                //right: elemRect.right,
                bottom: elemRect.bottom,
              }
              let coords = { left: elemRect.left + 47, top: elemRect.top + 24 }
              let coords2 = { left: elemRect.right - 80, top: elemRect.bottom - 80 }
              //let startOfEditor = view.posAtCoords(coords);
              //let endOfEditor = view.posAtCoords(coords2);
              let startCoords = view.coordsAtPos(0)
              let startPosition = checkPosition(editorCoordinatesObj, { top: startCoords.top, bottom: startCoords.bottom })
              let endOfEditor = view.state.doc.content.size
              let endCoords = view.coordsAtPos(endOfEditor)
              let endPosition = checkPosition(editorCoordinatesObj, { top: endCoords.top, bottom: endCoords.bottom })
              if (startPosition == endPosition && endPosition == 'above' || startPosition == endPosition && endPosition == 'under') {

                commentsObject[sectionName] = [];

                return
              } else {
                let displayCommentsFrom = 0;
                let displayCommentsTo = endOfEditor;
                if (startPosition == 'above') {
                  displayCommentsFrom = view.posAtCoords(coords)?.pos!;
                }
                if (endPosition == 'under') {
                  displayCommentsTo = view.posAtCoords(coords2)?.pos!;

                }
                let allCommentMarksFound: any[] = []
                let doc = view.state.doc
                doc.nodesBetween(displayCommentsFrom, displayCommentsTo, (node, from) => {
                  if (node.marks) {
                    const actualMark = node.marks.find(mark => mark.type === commentsMark);

                    if (actualMark) {
                      let comFound = allCommentMarksFound.length
                      if (comFound > 0 && allCommentMarksFound[comFound - 1].attrs.id == actualMark.attrs.id) {
                        allCommentMarksFound[comFound - 1].to = from + node.nodeSize
                        allCommentMarksFound[comFound - 1].text = doc.textBetween(allCommentMarksFound[comFound - 1].from, from + node.nodeSize)
                      } else {
                        let markFound = {
                          from,
                          to: from + node.nodeSize,
                          text: doc.textBetween(from, from + node.nodeSize),
                          section: sectionName,
                          attrs: actualMark.attrs,
                          viewRef: view
                        };
                        allCommentMarksFound.push(markFound)
                      }
                    }
                  }
                });

                commentsObject[sectionName] = allCommentMarksFound;

              }
              commentsVisibilityChange.next(commentsObject);
            }
          },
          destroy: () => { }
        }
      },

    });
    let attachCommentBtn = (editor: HTMLDivElement, view: EditorView, commentsStatus: any) => {

      let { empty, from, to } = view.state.selection
      let commentBtnDiv = editor.getElementsByClassName('commentBtnDiv').item(0) as HTMLDivElement;
      let commentBtn = editor.getElementsByClassName('commentsBtn').item(0) as HTMLButtonElement;
      let editorBtnsWrapper = editor.getElementsByClassName('editor_buttons_wrapper').item(0) as HTMLDivElement;
      if (!view.hasFocus()) {
        return
      }
      if (!commentsStatus.allow) {
        commentBtnDiv.style.display = 'none'
        return
      }
      if (empty || from == to) {
        editorBtnsWrapper.style.display = 'none'
        return
      }
      commentBtn.removeAllListeners!('click');
      let sectionName = commentPluginKey.getState(view.state).sectionName

      let coordinatesAtFrom = view.coordsAtPos(from)
      let coordinatesAtTo = view.coordsAtPos(to)
      let averageValueTop = (coordinatesAtFrom.top + coordinatesAtTo.top) / 2
      let editorBtns = editor.getElementsByClassName('editor_buttons').item(0) as HTMLDivElement;
      editorBtnsWrapper.style.display = 'block'
      commentBtnDiv.style.display = 'inline-flex'
      editorBtnsWrapper.style.top = (averageValueTop - 42) + 'px';
      editorBtnsWrapper.style.position = 'fixed'
      editorBtnsWrapper.style.marginLeft = '-6px'
      commentBtn.addEventListener('click', () => {
        this.addCommentSubject.next({ type: 'commentData', sectionName, showBox: true })
      })
    }
  }

  setLastSelectedComment = (commentId?: string, pos?: number, sectionId?: string,commentMarkId?:string) => {
    if(
      this.lastCommentSelected.commentId!=commentId||
      this.lastCommentSelected.pos!=pos||
      this.lastCommentSelected.sectionId!=sectionId||
      this.lastCommentSelected.commentMarkId!=commentMarkId
      ){
      this.lastSelectedCommentSubject.next({commentId,pos,sectionId})
    }
  }

  commentsObj: { [key: string]: { [key: string]: commentData } } = {}
  commentsChangeSubject: Subject<any> = new Subject()
  shouldCalc = false;

  getCommentsInDoc = (view: EditorView, sectionId: string) => {
    this.getComments(view, sectionId);
    this.commentsChangeSubject.next('comments pos calc for section : ' + sectionId);
  }

  getCommentsInAllEditors = () => {
    this.commentsObj = {}
    let edCont = this.serviceShare.ProsemirrorEditorsService.editorContainers
    Object.keys(edCont).forEach((sectionId) => {
      let view = edCont[sectionId].editorView;
      this.getComments(view, sectionId);
    })
    this.commentsChangeSubject.next('comments pos calc for all sections');
  }

  getComments = (view: EditorView, sectionId: string) => {

    this.commentsObj[sectionId] = {}
    if (!this.shouldCalc) {
      return;
    }
    let commentsMark = view.state.schema.marks.comment

    let doc = view.state.doc
    let docSize: number = doc.content.size;

    doc.nodesBetween(0, docSize - 1, (node, pos, parent, index) => {
      const actualMark = node.marks.find(mark => mark.type === commentsMark);

      if (actualMark) {
        // should get the top position , the node document position , the section id of this view
        let articleElement = document.getElementById('app-article-element') as HTMLDivElement
        let articleElementRactangle = articleElement.getBoundingClientRect()
        let domCoords = view.coordsAtPos(pos)
        let selected: true | undefined
        let selectedInSection: string;
        let commentMarkId: string
        Object.keys(this.lastSelectedComments).forEach((secid) => {
          let selCommInSec = this.lastSelectedComments[secid];
          if (selCommInSec[actualMark.attrs.id]) {
            selectedInSection = secid
            selected = true;
            commentMarkId = selCommInSec[actualMark.attrs.id].markid
          }
        })
        let lastSelected: true | undefined
        if (
          this.lastCommentSelected.commentId == actualMark.attrs.id &&
          this.lastCommentSelected.commentMarkId == actualMark.attrs.commentmarkid &&
          this.lastCommentSelected.sectionId == sectionId
        ) {
          lastSelected = true
        }
        if (selected && (selectedInSection != sectionId || (selectedInSection == sectionId && actualMark.attrs.commentmarkid != commentMarkId))) {
          // do nothing beacouse the comment was not selected in this editor
        } else {
          this.commentsObj[sectionId][actualMark.attrs.id] = {
            commentMarkId:actualMark.attrs.commentmarkid,
            pmDocStartPos: pos,
            pmDocEndPos: pos + node.nodeSize,
            section: sectionId,
            domTop: domCoords.top - articleElementRactangle.top,
            commentTxt: node.textContent,
            commentAttrs: actualMark.attrs,
            selected,
            lastSelected
          }
        }
      }
    })
  }

  removeEditorComment(editorId: any) {
    this.commentsObject[editorId] = [];
  }

  init() {
    this.editorsOuterDiv = document.getElementsByClassName('editor')[0] as HTMLDivElement
  }

  getPlugin(): Plugin {
    return this.commentsPlugin
  }

  getData(): any {

    return this.commentsObject
  }
}

