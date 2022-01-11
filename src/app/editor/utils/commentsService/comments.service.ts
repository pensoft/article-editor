import { Injectable } from '@angular/core';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
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

  resetCommentsService(){
    this.storeData= undefined;
    this.editorsOuterDiv= undefined;
    Object.keys(this.commentsObject).forEach((key)=>{
      this.commentsObject[key] = []
    })
    this.addCommentData= {}
    this.commentAllowdIn = {} // editor id where comment can be made RN equals ''/undefined if there is no such editor RN
    this.selectedTextInEditors = {}
  }
  constructor(private serviceShare:ServiceShare) {
    serviceShare.shareSelf('CommentsService',this)
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
    this.commentsPlugin = new Plugin({
      key: this.commentPluginKey,
      state: {
        init: (_, state) => {
          return { sectionName: _.sectionName };
        },
        apply(tr, prev, _, newState) {
          let { from, to, empty } = newState.selection;
          let err = false
          let text = newState.doc.textBetween(from, to)
          let commentableAttr = true
          let errorMessage = ''
          if (empty || from == to) {
            errorMessage = 'Selection is empty.'
            err = true
          }

          if (!err) {
            newState.doc.nodesBetween(from, to, (node, pos, parent) => {
              /* if (node.marks.length > 0) {
                if (node.marks.filter((el) => { return el.type.name == 'comment' }).length > 0) {
                  err = true
                  errorMessage = "There is a comment here already"
                }
              } */
              if (node.attrs.commentable == 'false') {
                commentableAttr = false
              }
            })
          }
          if (!commentableAttr && !err) {
            errorMessage = "You can't leave comment there."
            err = true
          }
          let commentdata = { type: 'commentAllownes', sectionId: prev.sectionName, allow: !err, text, errorMessage, err }
          addCommentSubject1.next(commentdata)
          return { ...prev, commentsStatus: commentdata }
        },
      },

      view: function () {
        return {
          update: (view, prevState) => {

            if(JSON.stringify(view.state.doc)== JSON.stringify(prevState.doc)&&!view.hasFocus()){
              return;
            }
            let commentsMark = view.state.schema.marks.comment
            let editor = document.getElementsByClassName('editor-container').item(0) as HTMLDivElement
            let pluginData = commentPluginKey.getState(view.state)
            let sectionName = pluginData.sectionName
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

