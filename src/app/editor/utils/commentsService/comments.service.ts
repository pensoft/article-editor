import { Injectable } from '@angular/core';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Transaction } from 'yjs';
//@ts-ignore
import { DocumentHelpers } from 'wax-prosemirror-utilities';
//@ts-ignore
import { minBy, maxBy, last } from 'lodash';
import { from, Subject } from 'rxjs';
import { Observable } from 'lib0/observable';

@Injectable({
  providedIn:'root'
})

export class CommentsService {
  commentsPlugin: Plugin
  commentPluginKey: PluginKey
  storeData: any;
  editorsOuterDiv?: HTMLDivElement
  commentsObject: any
  commentsVisibilityChange:Subject<any>
  constructor() {
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

    let commentsVisibilityChange :Subject<any> = new Subject<any>();
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
          return prev
        },
      },
      
      view: function () {
        return {
          update: (view, prevState) => {
            let commentsMark = view.state.schema.marks.comment
            let editor = document.getElementsByClassName('editor-outer-div').item(0) as HTMLDivElement
            let sectionName = commentPluginKey.getState(view.state).sectionName



            if (editor) {
              let elemRect = editor.getBoundingClientRect();
              let editorCoordinatesObj = {
                top: elemRect.top,
                //left: elemRect.left,
                //right: elemRect.right,
                bottom: elemRect.bottom,
              }
              let coords = { left: elemRect.left + 10, top: elemRect.top + 10 }
              let coords2 = { left: elemRect.right - 14, top: elemRect.bottom - 4 }
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
      }
    });

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

