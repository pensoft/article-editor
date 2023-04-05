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

export const articlePosOffset = 24;

export let selInComment = (sel:Selection,node:Node,nodePos:number) =>{
  let nodestart= nodePos;
  let nodeend = nodePos+node.nodeSize;
  return ((sel.from>nodestart&&sel.from<nodeend)||(sel.from>nodestart&&sel.from<nodeend))
}
export interface userDataInComment {
  created_at: string
  email: string
  email_verified_at: string
  id: String
  name: string
  userColor:string
  userContrastColor:string
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
  selected: boolean,
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
      this.updateAllComments()
    }
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    if (now - this.updateTimestamp > 500) {
      this.updateAllComments()
    }
    this.updateTimeout = setTimeout(() => {
      this.updateAllComments()
    }, 500)
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
          let foundedChangesMark = false;
          let commentInSelection = (actualMark: Mark, pos: number) => {
            err = true
            errorMessage = "There is a comment here already"
            if (sameAsLastSelectedComment(actualMark.attrs.id, pos, prev.sectionName, actualMark.attrs.commentmarkid)) {
              return
            } else {
              setLastSelectedComment(actualMark.attrs.id, pos, prev.sectionName, actualMark.attrs.commentmarkid)
              lastSelectedComments[actualMark.attrs.id] = {
                commentId: actualMark.attrs.id,
                commentMarkId: actualMark.attrs.commentmarkid,
                sectionId: prev.sectionName,
                pos
              }
            }
          }
          let sectionContainer = serviceShare.ProsemirrorEditorsService.editorContainers[prev.sectionName];
          let view = sectionContainer ? sectionContainer.editorView : undefined;
          if (!(newState.selection instanceof AllSelection) && view && view.hasFocus() ) {

            newState.doc.nodesBetween(from, to, (node, pos, parent) => {
              if (node.marks.length > 0) {
                const actualMark = node.marks.find(mark => mark.type == commentsMark);

                if (actualMark) {
                  commentInSelection(actualMark, pos)
                  addCommentSubject1.next({ type: "commentData", sectionName: prev.sectionName, showBox: false })
                  selectedAComment = true;
                }

              }
              if (node.attrs.commentable == 'false') {
                commentableAttr = false
              }
            })
          }

          if (!commentableAttr && !err) {
            errorMessage = "You can't leave a comment there."
            err = true
          }

          if (!selectedAComment && !(newState.selection instanceof AllSelection) && view  && view.hasFocus() ) {

            let sel = newState.selection
            let nodeAfterSelection = sel.$to.nodeAfter
            let nodeBeforeSelection = sel.$from.nodeBefore
            let foundMark = false;
            if (nodeAfterSelection) {
              let pos = sel.to
              let commentMark = nodeAfterSelection?.marks.find(mark => mark.type === commentsMark);

              if (commentMark) {
                commentInSelection(commentMark, pos);
                selectedAComment = true;
                foundMark = true;
              }
            }
            if (nodeBeforeSelection) {
              let pos = sel.from - nodeBeforeSelection.nodeSize
              let commentMark = nodeAfterSelection?.marks.find(mark => mark.type === commentsMark)
             
              if (commentMark){
                commentInSelection(commentMark, pos);
                selectedAComment = true;
                foundMark = true;
              }
            }
          }
          if (!selectedAComment && !(newState.selection instanceof AllSelection) && view  && view.hasFocus() && lastCommentSelected.commentId) {
            setLastSelectedComment(undefined, undefined, undefined, undefined);
          }

          if (!(newState.selection instanceof AllSelection) /* && view.hasFocus() && tr.steps.length > 0 */) {
            changeInEditors();
          }
          let commentdata = { type: 'commentAllownes', sectionId: prev.sectionName, allow: !err, text, errorMessage, err }
          addCommentSubject1.next(commentdata);

          return { ...prev, commentsStatus: commentdata };
        },
      },

      view: function () {
        return {
          update: (view, prevState) => {
            if (JSON.stringify(view.state.doc) == JSON.stringify(prevState.doc) && !view.hasFocus()) {
              return;
            }
            let pluginData = commentPluginKey.getState(view.state)
            let editor = document.getElementsByClassName('editor-container').item(0) as HTMLDivElement
            let commentsStatus = pluginData.commentsStatus
            attachCommentBtn(editor, view, commentsStatus)
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

      commentBtn.removeAllListeners!('click');
      let sectionName = commentPluginKey.getState(view.state).sectionName;

      let coordinatesAtFrom = view.coordsAtPos(from);
      let coordinatesAtTo = view.coordsAtPos(to);

      let averageValueTop = (coordinatesAtFrom.top + coordinatesAtTo.top) / 2; // Selected element position
      let editorBtns = editor.getElementsByClassName('editor_buttons').item(0) as HTMLDivElement;

      let editorOffsetTop = editor.getBoundingClientRect().top; // Editor Top offset in DOM
      let editorBtnsHeight = editorBtnsWrapper.offsetHeight; // Editor buttons dynamic height
      // TODO: Get line height of the selected element
      let currentElement = document.elementFromPoint(coordinatesAtFrom.right, coordinatesAtTo.top)
      
      let editorLineHeight = 0;
      if (currentElement) {
        editorLineHeight = parseInt(window.getComputedStyle(currentElement).lineHeight, 10);
      }
      editorBtnsWrapper.style.display = 'block'

      editorBtnsWrapper.style.top = (averageValueTop - editorOffsetTop + editor.scrollTop - editorBtnsHeight/2 + editorLineHeight/2) + 'px';
      editorBtnsWrapper.style.position = 'absolute'
      if (!commentsStatus.allow) {
        commentBtnDiv.style.display = 'none';
        return
      }
      commentBtnDiv.style.display = 'block';

      commentBtn.addEventListener('click', () => {
        this.addCommentSubject.next({ type: 'commentData', sectionName, showBox: true })
        this.serviceShare.DetectFocusService.setSelectionDecorationOnLastSelecctedEditor()
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
      return true;
    }
  }

  setLastSelectedComment = (commentId?: string, pos?: number, sectionId?: string, commentMarkId?: string,focus?:true) => {
      this.lastSelectedCommentSubject.next({ commentId, pos, sectionId, commentMarkId })
  }

  commentsObj: { [key: string]: commentData } = {}
  commentsChangeSubject: Subject<any> = new Subject()
  shouldCalc = false;

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
            domTop: domCoords.top - articleElementRactangle.top-articlePosOffset,
            commentTxt: this.getallCommentOccurrences(actualMark.attrs.id, parent),
            commentAttrs: actualMark.attrs,
            selected: markIsLastSelected,
          }
        }
      }
    })
  }

  getallCommentOccurrences(commentId: string, parent: Node) {
    let nodeSize = parent.content.size;
    let textContent = '';

    parent.nodesBetween(0, nodeSize, (node: Node) => {
      const actualMark = node.marks.find(mark => mark.type.name === "comment");
      if(actualMark && actualMark.attrs.id == commentId) {
        textContent += node.textContent;
      }
    })

    return textContent;
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

}

