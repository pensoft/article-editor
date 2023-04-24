import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { AllSelection, EditorState, Plugin, PluginKey, Selection, TextSelection } from 'prosemirror-state'
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { YMap } from 'yjs/dist/src/internals';
import { Mark, Node } from 'prosemirror-model';

import { ServiceShare } from '@app/editor/services/service-share.service';
import { checkAllEditorsIfMarkOfCommentExists, commentData, ydocCommentsObj } from './commentMarksHelpers';

export const articlePosOffset = 24;

// export let selInComment = (sel:Selection,node:Node,nodePos:number) =>{
//   let nodestart= nodePos;
//   let nodeend = nodePos+node.nodeSize;
//   return ((sel.from>nodestart&&sel.from<nodeend)||(sel.from>nodestart&&sel.from<nodeend))
// }

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
          return ((mark.type.name == 'comment' || mark.type.name == 'overlapComment') && mark.attrs.commentmarkid == markid)
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

  addInlineDecoration(state: EditorState, pos: number) {
    const node = state.doc.nodeAt(pos);
    if (!node) return;

    const nodeBefore = state.doc.resolve(pos - node.textContent.length > 0 ? pos - node.textContent.length : pos).nodeBefore;

    const comment = node.marks.find((mark) => mark.type.name === 'comment');
    const overlapComment = node.marks.find((mark) => mark.type.name == 'overlapComment');

    let selectedComment: {
      mark: Mark,
      name: string
    };

    if(comment && overlapComment) {
      const comment2 = nodeBefore?.marks.find((mark) => mark.type.name === 'comment');
      const overlapComment2 = nodeBefore?.marks.find((mark) => mark.type.name == 'overlapComment');

      if(comment2) {
        selectedComment = { mark: comment2, name: 'comment'};
      } else if (overlapComment2) {
        selectedComment = { mark: overlapComment2, name: 'overlapComment'};
      } else {
        selectedComment = { mark: comment, name: 'comment'};
      }
    } else if (comment && !overlapComment) {
      selectedComment = { mark: comment, name: 'comment'};
    } else if (!comment && overlapComment){
      selectedComment = { mark: overlapComment, name: 'overlapComment'};
    } else {
      return;
    }

    let from: number;
    let to: number;

    const nodeSize = state.doc.content.size;
    state.doc.nodesBetween(0, nodeSize, (node, pos, parent, i) => {
      const mark2 = node?.marks.find(mark => mark.type.name == selectedComment.name);
      if(mark2 && mark2.attrs.id == selectedComment.mark.attrs.id && !from) {
        from = pos;
      }
      if(mark2 && mark2.attrs.id == selectedComment.mark.attrs.id){
        to = pos + node.nodeSize;
      }
    })
    
    return { from, to };
  }

  constructor(private serviceShare: ServiceShare) {
    const self = this;

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
    let changeInEditors = this.changeInEditors
    let addInlineDecoration = this.addInlineDecoration;
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
          let overlapCommentMark = newState.schema.marks.overlapComment

          let sectionContainer = serviceShare.ProsemirrorEditorsService.editorContainers[prev.sectionName];
          let view = sectionContainer ? sectionContainer.editorView : undefined;

          if (!(newState.selection instanceof AllSelection) && view  && view.hasFocus()) {
            const pos = newState.selection.from;
            const node = newState.doc.nodeAt(newState.selection.from);

            if(node) {
              const nodeBefore = newState.doc.resolve(pos - node?.textContent.length > 0 ? pos - node?.textContent.length : pos).nodeBefore;

              const comment = node.marks.find((mark) => mark.type.name === 'comment');
              const overlapComment = node.marks.find((mark) => mark.type.name == 'overlapComment');

              if(comment && overlapComment && nodeBefore) {
                const comment2 = nodeBefore?.marks.find((mark) => mark.type.name === 'comment');
                const overlapComment2 = nodeBefore?.marks.find((mark) => mark.type.name == 'overlapComment');

                if(comment2) {
                  self.commentInSelection(comment2, pos, prev.sectionName);
                  selectedAComment = true;
                } else if (overlapComment2) {
                  self.commentInSelection(overlapComment2, pos, prev.sectionName);
                  selectedAComment = true;
                } else {
                  self.commentInSelection(comment, pos, prev.sectionName);
                  selectedAComment = true;
                }
              } else if (comment && !overlapComment) {
                self.commentInSelection(comment, pos, prev.sectionName);
                selectedAComment = true;
              } else if (!comment && overlapComment){
                self.commentInSelection(overlapComment, pos, prev.sectionName);
                selectedAComment = true;
              }
            }
            
            let node1: Node;
            let node2: Node;
            if(node && from !== to) {
              node1 = newState.doc.nodeAt(from + 1);
              node2 = newState.doc.nodeAt(to - 2);
            } 
            

            if(node1 && node2 && from !== to) {
              let commentMark1 = node1?.marks.find(mark => mark.type === commentsMark);
              let commentMark2 = node2?.marks.find(mark => mark.type === commentsMark);
              let commentMark3 = node1?.marks.find(mark => mark.type === overlapCommentMark);
              let commentMark4 = node2?.marks.find(mark => mark.type === overlapCommentMark);
              
              if(commentMark1 && commentMark2 && commentMark1?.attrs.id == commentMark2?.attrs.id) {
                err = true;
                errorMessage = "There is a comment here already";
              }
              if (commentMark3 && commentMark4 && commentMark3?.attrs.id == commentMark4?.attrs.id) {
                err = true;
                errorMessage = "There is a comment here already";
              }
              if((commentMark1 || commentMark3) && (commentMark2 || commentMark4) || (commentMark1 || commentMark2) && (commentMark3 || commentMark4)) {
                err = true;
                errorMessage = "There is a comment here already";
              }
              
              let count = 0;
              newState.doc.nodesBetween(from, to, (node, pos, parent) => {    
                if(node?.marks.find(mark => mark.type === commentsMark ||  mark.type === overlapCommentMark)) {
                  count++;
                }
                if(count > 1) {
                  err = true;
                  errorMessage = "There is a comment here already";
                }
                if (node?.attrs.commentable == 'false') {
                  commentableAttr = false
                }
              })
            }
          }

          if (!commentableAttr && !err) {
            errorMessage = "You can't leave a comment there.";
            err = true;
          }

          if (!selectedAComment && !(newState.selection instanceof AllSelection) && view  && view.hasFocus() && lastCommentSelected.commentId) {
            setLastSelectedComment(undefined, undefined, undefined, undefined);
          }

          if (!(newState.selection instanceof AllSelection) /* && view.hasFocus() && tr.steps.length > 0 */) {
            changeInEditors();
          }
          let commentdata = { type: 'commentAllownes', sectionId: prev?.sectionName, allow: !err, text, errorMessage, err }
          addCommentSubject1.next(commentdata);

          return { ...prev, commentsStatus: commentdata };
        },
      },
      props: {
        decorations: (state: EditorState) => {
          const pluginState = this.commentPluginKey.getState(state);
          const focusedEditor = this.serviceShare.DetectFocusService.sectionName;
          const currentEditor = pluginState.sectionName;
          const { from } = state.selection;

          if (currentEditor != focusedEditor) return DecorationSet.empty;

          const markInfo = addInlineDecoration(state, from);
          if(!markInfo) return DecorationSet.empty;
          
          return DecorationSet.create(state.doc, [
            Decoration.inline(markInfo.from, markInfo.to, { class: 'active-comment' })
          ])
        }
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

  commentInSelection = (actualMark: Mark, pos: number, sectionName: string) => {
    if (this.sameAsLastSelectedComment(actualMark.attrs.id, pos, sectionName, actualMark.attrs.commentmarkid)) {
      return
    } else {
      this.setLastSelectedComment(actualMark.attrs.id, pos, sectionName, actualMark.attrs.commentmarkid)
      this.lastSelectedComments[actualMark.attrs.id] = {
        commentId: actualMark.attrs.id,
        commentMarkId: actualMark.attrs.commentmarkid,
        sectionId: sectionName,
        pos
      }
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
    let commentsMark = view.state.schema.marks.comment;
    let overlapComment = view.state.schema.marks.overlapComment;
    let doc = view.state.doc
    let docSize: number = doc.content.size;
    doc.nodesBetween(0, docSize - 1, (node, pos, parent, index) => {
      const actualMark = node.marks.find(mark => mark.type === commentsMark || mark.type === overlapComment);

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
          const { textContent, position } = this.getallCommentOccurrences(actualMark.attrs.id, view);
          this.commentsObj[actualMark.attrs.id] = {
            commentMarkId: actualMark.attrs.commentmarkid,
            pmDocStartPos: position,
            pmDocEndPos: position,
            section: sectionId,
            domTop: domCoords.top - articleElementRactangle.top-articlePosOffset,
            commentTxt: textContent,
            commentAttrs: actualMark.attrs,
            selected: markIsLastSelected,
          }
        }
      }
    })
  }

  getallCommentOccurrences(commentId: string, view: EditorView) {
    let nodeSize = view.state.doc.content.size;
    let textContent = '';
    let position: number;

    view.state.doc.nodesBetween(0, nodeSize, (node: Node, pos: number) => {
      const actualMark = node.marks.find(mark => mark.type.name === "comment");
      const actualMark2 = node.marks.find(mark => mark.type.name === "overlapComment");
      if(actualMark && actualMark.attrs.id == commentId) {
        textContent += node.textContent;
        position = pos;
      }
      if(actualMark2 && actualMark2.attrs.id == commentId) {
        textContent += node.textContent;
        position = pos;
      }
    })

    return { textContent, position };
  }

  removeEditorComment(editorId: any) {
    this.commentsObject[editorId] = [];
    this.lastSelectedComments[editorId] = undefined;
  }

  // init() {
  //   this.editorsOuterDiv = document.getElementsByClassName('editor')[0] as HTMLDivElement
  // }

  getPlugin(): Plugin {
    return this.commentsPlugin
  }

}

