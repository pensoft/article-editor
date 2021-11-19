import { Injectable } from '@angular/core';
import { Mark, Node } from 'prosemirror-model';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Subject } from 'rxjs';
//@ts-ignore
import { DocumentHelpers } from 'wax-prosemirror-utilities';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';


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
  constructor(
    private ydocService: YdocService
  ) {
    let hideShowPluginKey = new PluginKey('hideShowPlugin');

    let changesVisibilityChange: Subject<any> = new Subject<any>();
    this.changesVisibilityChange = changesVisibilityChange

     let changesObject: any = {};
    this.changesObject = changesObject;
    /*let initArtcleStructureMap = ()=>{

     let hideshowData = this.ydocService.articleStructure!.get('trackChangesMetadata');
      showChanges = hideshowData.hideshowStatus;
       this.ydocService.articleStructure!.observe((ymap)=>{
        let hideshowData = this.ydocService.articleStructure!.get('trackChangesMetadata');
        if(hideshowData.lastUpdateFromUser!==this.ydocService.articleStructure!.doc?.guid){
          showChanges = hideshowData.hideshowStatus
          
        }
      }) 
    }
    if (this.ydocService.editorIsBuild) {
      initArtcleStructureMap()
    } else {
      this.ydocService.ydocStateObservable.subscribe((event) => {
        if (event == 'docIsBuild') {
          initArtcleStructureMap()
        }
      });
    }*/
    /* this.showChangesSubject.subscribe((data) => {
      let hideshowData = this.ydocService.articleStructure!.get('trackChangesMetadata');
      hideshowData.hideshowStatus = data
      hideshowData.lastUpdateFromUser = this.ydocService.articleStructure!.doc?.guid;
      this.ydocService.articleStructure!.set('trackChangesMetadata',hideshowData);
      showChanges = data
    }) */

    let hideShowPlugin = new Plugin({
      key: hideShowPluginKey,
      state: {
        init: (_, state) => {
          return {
            sectionName: _.sectionName,
            createdDecorations: DecorationSet.empty,
            allMatches: undefined,
          };
        },
        apply(tr, prev, _, newState) {

          let decorations;
          let createdDecorations = DecorationSet.empty;
           const allMatches = getTrackChanges(newState);
          /*if (allMatches.length > 0 && !showChanges) {

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

          return {
            sectionName: prev.sectionName,
            createdDecorations,
            allMatches,
          };
        },
      }, props: {
        decorations: state => {
          const hideShowPluginState: any = state && hideShowPlugin.getState(state);
          return hideShowPluginState.createdDecorations;
        }
      },
      view: (editorView) => {
        return {
          update: (view, prevState) => {
            let deletionMark = view.state.schema.marks.deletion
            let insertionMark = view.state.schema.marks.insertion
            let format_changeMark = view.state.schema.marks.format_change
            let editor = document.getElementsByClassName('editor-container').item(0) as HTMLDivElement
            let sectionName = hideShowPluginKey.getState(view.state).sectionName
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

                changesObject[sectionName] = [];

                return
              } else {
                let displayChangesFrom = 0;
                let displayChangesTo = endOfEditor;
                if (startPosition == 'above') {
                  displayChangesFrom = view.posAtCoords(coords)?.pos!;
                }
                if (endPosition == 'under') {
                  displayChangesTo = view.posAtCoords(coords2)?.pos!;
                }
                let allChangesMarksFound: any[] = []
                let doc = view.state.doc
                doc.nodesBetween(displayChangesFrom, displayChangesTo, (node, from) => {
                  if (node.marks) {

                    const actualMarks = node.marks.filter(mark => mark.type === deletionMark || mark.type === insertionMark || mark.type === format_changeMark);
                    actualMarks.forEach((mark) => {
                      allChangesMarksFound.push({
                        mark: mark,
                        from: from,
                        to: from + node.nodeSize,
                        text: doc.textBetween(from, from + node.nodeSize),
                        viewRef: view,
                        type: mark.type.name
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
          },
          destroy: () => {

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
