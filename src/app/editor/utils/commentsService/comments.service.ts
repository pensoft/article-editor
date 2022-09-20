import { Injectable } from '@angular/core';
import { AllSelection, EditorState, Plugin, PluginKey, Selection, TextSelection } from 'prosemirror-state'
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
import { Mark, Node } from 'prosemirror-model';
import { YMap } from 'yjs/dist/src/internals';
import { checkAllEditorsIfMarkOfCommentExists } from './commentMarksHelpers';
import { I } from '@angular/cdk/keycodes';

export let selInComment = (sel:Selection,node:Node,nodePos:number) =>{
  let nodestart= nodePos;
  let nodeend = nodePos+node.nodeSize;
  return nodestart<=sel.from&&nodeend>=sel.to
}
export interface userDataInComment {
  created_at: string
  email: string
  email_verified_at: string
  id: String
  name: string
  updated_at: string
}

export interface ydocComment {
  comment: string
  date: number
  id: string
  userData: userDataInComment
}

export interface commentYdocSave { commentReplies: ydocComment[], initialComment: ydocComment }
export interface ydocCommentsObj { [key: string]: commentYdocSave }

export interface commentData {
  pmDocStartPos: number,
  pmDocEndPos: number,
  domTop: number,
  commentTxt: string,
  section: string,
  commentAttrs: any,
  commentMarkId: string,
  selected: boolean
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
  lastSelectedComments: { [key: string]: { commentId: string, commentMarkId: string, sectionId: string,pos:number } } = {}
  lastCommentSelected: {
    commentId?: string,
    pos?: number,
    sectionId?: string,
    commentMarkId?: string,
  }
  commentsMap?: YMap<any>
  lastSelectedCommentSubject: Subject<{
    commentId?: string,
    pos?: number,
    sectionId?: string,
    commentMarkId?: string
  }> = new Subject()

  shouldScrollComment = false;
  markIdOfScrollComment?:string = undefined
  commentsInYdoc: ydocCommentsObj = {}

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

  ydocCommentsChangeSubject: Subject<ydocCommentsObj> = new Subject()

  getCommentsFromYdoc():ydocCommentsObj{
    let commObj: ydocCommentsObj = {}
    Array.from(this.commentsMap.keys()).forEach((commentid) => {
      let comment = this.commentsMap.get(commentid)
      if (comment) {
        commObj[commentid] = comment
      }
    })
    return commObj
  }

  setYdocCommentsObj() {
    this.commentsInYdoc = this.getCommentsFromYdoc()
    this.ydocCommentsChangeSubject.next(this.commentsInYdoc)
  }

  addCommentsMapChangeListener() {
    this.commentsMap = this.serviceShare.YdocService.getCommentsMap()
    this.setYdocCommentsObj()
    this.commentsMap.observe((ymapEvent, trnasact) => {
      this.setYdocCommentsObj()
    })
  }

  scrollToCommentMarkAndSelect(){
    let markid = this.markIdOfScrollComment;
    let edCont = this.serviceShare.ProsemirrorEditorsService.editorContainers

    let commentFound = false;
    let sectionId;
    let start;
    let end;

    Object.keys(edCont).forEach((sectionid)=>{
      let edDoc = edCont[sectionid].editorView.state.doc;
      let docSize = edDoc.content.size;
      edDoc.nodesBetween(0,docSize-1,(node,pos,parent,i)=>{
        if(node.marks.find((mark)=>{
          return (mark.type.name == 'comment'&&mark.attrs.commentmarkid == markid)
        })&&!commentFound){
          commentFound = true;
          sectionId = sectionid;
          start = pos;
          end = pos+node.nodeSize
        }
      })
    })
    if(commentFound){
      setTimeout(()=>{
        let view = edCont[sectionId].editorView
        let state = view.state;
        let doc = state.doc
        view.focus()
        view.dispatch(state.tr.setSelection(TextSelection.between(doc.resolve(start),doc.resolve(end))));
        view.dispatch(view.state.tr.scrollIntoView())
      },100)
      return true;
    }else{
      return false;
    }
  }

  handleDeletedComments(deleted: any[]) {
    let filteredFromRepeatingMarks: string[] = []
    deleted.forEach((comAttrs) => {
      let commentId = comAttrs.attrs.id
      if (!filteredFromRepeatingMarks.includes(commentId)) {
        filteredFromRepeatingMarks.push(commentId)
      }
    })
    let edConts = this.serviceShare.ProsemirrorEditorsService.editorContainers;
    filteredFromRepeatingMarks.forEach((commentId) => {
      if (!checkAllEditorsIfMarkOfCommentExists(edConts, commentId)) {
        this.commentsMap.set(commentId, undefined);
      }
    })
  }



  updateAllComments() {
    this.getCommentsInAllEditors()
    this.updateTimestamp = Date.now();
  }

  updateTimestamp = 0;
  updateTimeout

  changeInEditors = () => {
    let now = Date.now();
    if (!this.updateTimestamp) {
      this.updateTimestamp = Date.now();
    }
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    if (now - this.updateTimestamp > 1200) {
      this.updateAllComments()
    }
    this.updateTimeout = setTimeout(() => {
      this.updateAllComments()
    }, 1200)
  }

  constructor(private serviceShare: ServiceShare) {
    this.lastSelectedCommentSubject.subscribe((data) => {
      this.lastCommentSelected.commentId = data.commentId
      this.lastCommentSelected.pos = data.pos
      this.lastCommentSelected.sectionId = data.sectionId
      this.lastCommentSelected.commentMarkId = data.commentMarkId
    })
    if (this.serviceShare.YdocService.editorIsBuild) {
      this.addCommentsMapChangeListener()
    } else {
      this.serviceShare.YdocService.ydocStateObservable.subscribe((event) => {
        if (event == 'docIsBuild') {
          this.addCommentsMapChangeListener()
        }
      });
    }
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
    let commentsVisibilityChange: Subject<any> = new Subject<any>();
    this.commentsVisibilityChange = commentsVisibilityChange

    let commentsObject: any = {};
    this.commentsObject = commentsObject;
    let lastSelectedComments: { [key: string]: { commentId: string, commentMarkId: string, sectionId: string,pos:number } } = {}
    let lastCommentSelected: {
      commentId?: string,
      pos?: number,
      sectionId?: string,
      commentMarkId?: string,
    } = {}
    this.lastCommentSelected = lastCommentSelected
    this.lastSelectedComments = lastSelectedComments
    let setLastSelectedComment = this.setLastSelectedComment
    let sameAsLastSelectedComment = this.sameAsLastSelectedComment
    let changeInEditors = this.changeInEditors
    this.commentsPlugin = new Plugin({
      key: this.commentPluginKey,
      state: {
        init: (_:any, state) => {
          return { sectionName: _.sectionName };
        },
        apply(tr, prev, oldState, newState) {
          let { from, to, empty } = newState.selection;
          let err = false
          let text = newState.doc.textBetween(from, to)
          let commentableAttr = true
          let errorMessage = ''
          if (empty || from == to) {
            errorMessage = 'Selection is empty.'
            err = true
          }
          let selectedAComment = false;
          let commentsMark = newState.schema.marks.comment
          let commentInSelection = (actualMark: Mark, pos: number) => {
            if (sameAsLastSelectedComment(actualMark.attrs.id, pos, prev.sectionName, actualMark.attrs.commentmarkid)) {
              return
            } else {
            }
            err = true
            errorMessage = "There is a comment here already"
            setLastSelectedComment(actualMark.attrs.id, pos, prev.sectionName, actualMark.attrs.commentmarkid)
            lastSelectedComments[actualMark.attrs.id] = {
              commentId: actualMark.attrs.id,
              commentMarkId: actualMark.attrs.commentmarkid,
              sectionId: prev.sectionName,
              pos
            }
          }
          let sectionContainer = serviceShare.ProsemirrorEditorsService.editorContainers[prev.sectionName]
          let view = sectionContainer?sectionContainer.editorView:undefined
          if (!(newState.selection instanceof AllSelection) && view && view.hasFocus() ) {

            newState.doc.nodesBetween(from, to, (node, pos, parent) => {
              if (node.marks.length > 0) {
                const actualMark = node.marks.find(mark => mark.type === commentsMark)
                if (actualMark && selInComment(newState.selection,node,pos)) {
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
          if (!selectedAComment && !(newState.selection instanceof AllSelection) && view  && view.hasFocus() ) {
            let sel = newState.selection
            let nodeAfterSelection = sel.$to.nodeAfter
            let nodeBeforeSelection = sel.$from.nodeBefore
            let foundMark = false;
            if (nodeAfterSelection) {
              let pos = sel.to
              let commentMark = nodeAfterSelection.marks.find(mark => mark.type === commentsMark)
              if (commentMark  && selInComment(newState.selection,nodeAfterSelection,pos)) {
                commentInSelection(commentMark, pos)
                selectedAComment = true;
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
          if (!selectedAComment && !(newState.selection instanceof AllSelection) && view  && view.hasFocus() ) {
            setLastSelectedComment(undefined, undefined, undefined, undefined)
          }
          if (!(newState.selection instanceof AllSelection) /* && view.hasFocus() && tr.steps.length > 0 */) {
            changeInEditors()
          }
          let commentdata = { type: 'commentAllownes', sectionId: prev.sectionName, allow: !err, text, errorMessage, err }
          addCommentSubject1.next(commentdata)

          return { ...prev, commentsStatus: commentdata }
        },
      },

      view: function () {
        return {
          update: (view, prevState) => {
            if (JSON.stringify(view.state.doc) == JSON.stringify(prevState.doc) && !view.hasFocus()) {
              return;
            }
            let pluginData = commentPluginKey.getState(view.state)
            let sectionName = pluginData.sectionName

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
        setTimeout(() => {
          this.getCommentsInAllEditors()
        }, 30)
      })
    }
  }

  sameAsLastSelectedComment = (commentId?: string, pos?: number, sectionId?: string, commentMarkId?: string) => {
    if (
      this.lastCommentSelected.commentId != commentId ||
      this.lastCommentSelected.sectionId != sectionId ||
      this.lastCommentSelected.commentMarkId != commentMarkId ||
      this.lastCommentSelected.pos!=pos
    ) {
      return false;
    } else {
      return true
    }
  }

  setLastSelectedComment = (commentId?: string, pos?: number, sectionId?: string, commentMarkId?: string,focus?:true) => {
    if (!this.sameAsLastSelectedComment(commentId, pos, sectionId, commentMarkId)||focus) {
      this.lastSelectedCommentSubject.next({ commentId, pos, sectionId, commentMarkId })
    }
  }

  commentsObj: { [key: string]: commentData } = {}
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
        let markIsLastSelected = false

        let selComment = this.lastSelectedComments[actualMark.attrs.id];
        if (selComment) {
          if (!this.serviceShare.ProsemirrorEditorsService.editorContainers[selComment.sectionId]) {
            this.lastSelectedComments[actualMark.attrs.id] = undefined
          } else if (selComment.pos == pos&&selComment.commentId == actualMark.attrs.id && selComment.commentMarkId == actualMark.attrs.commentmarkid && selComment.sectionId == sectionId) {
            markIsLastSelected = true
          }
        }
        let lastSelected: true | undefined
        if (
          this.lastCommentSelected.commentId == actualMark.attrs.id &&
          this.lastCommentSelected.commentMarkId == actualMark.attrs.commentmarkid &&
          this.lastCommentSelected.sectionId == sectionId&&
          this.lastCommentSelected.pos == pos
        ) {
          lastSelected = true
        }
        if (lastSelected) {
        }
        if (markIsLastSelected || lastSelected || (!(markIsLastSelected || lastSelected) && !this.commentsObj[actualMark.attrs.id])) {
          this.commentsObj[actualMark.attrs.id] = {
            commentMarkId: actualMark.attrs.commentmarkid,
            pmDocStartPos: pos,
            pmDocEndPos: pos + node.nodeSize,
            section: sectionId,
            domTop: domCoords.top - articleElementRactangle.top,
            commentTxt: node.textContent,
            commentAttrs: actualMark.attrs,
            selected: markIsLastSelected,
          }
        }
      }
    })
  }

  removeEditorComment(editorId: any) {
    this.commentsObject[editorId] = [];
    this.lastSelectedComments[editorId] = undefined

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

  register
}

