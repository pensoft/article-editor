import { Injectable } from '@angular/core';
import { undoItem } from 'prosemirror-menu';
import { Mark, Node } from 'prosemirror-model';
import { EditorState, Plugin, PluginKey, Selection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Subject } from 'rxjs';
//@ts-ignore
import { DocumentHelpers } from 'wax-prosemirror-utilities';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';
//@ts-ignore
import { acceptChange, rejectChange } from '../trackChanges/acceptReject.js';


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
  acceptReject:any = {}
  constructor(
    private ydocService: YdocService
  ) {
    let hideShowPluginKey = new PluginKey('hideShowPlugin');
    this.hideshowPluginKey = hideShowPluginKey
    let changesVisibilityChange: Subject<any> = new Subject<any>();
    this.changesVisibilityChange = changesVisibilityChange

    let changesObject: any = {};
    this.changesObject = changesObject;

    let acceptReject = this.acceptReject 

    let hideShowPlugin = new Plugin({
      key: hideShowPluginKey,
      state: {
        init: (_, state) => {
          return {
            sectionName: _.sectionName,
            createdDecorations: DecorationSet.empty,
            allMatches: undefined,
            editorType:_.editorType?_.editorType:undefined
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
          if (acceptReject.action){
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
                    relativeElement.setAttribute('style', 'position: relative;display: inline;')
                    relativeElement.setAttribute('class', 'changes-placeholder')
                    
                    let changePlaceholder = document.createElement('div');
                    let markContent = document.createElement('div');
                    nodeAtSelect?.marks.forEach((mark) => {
                      let markData = document.createElement('div');
                      let attr = mark.attrs
                      let content = `${attr.class} from ${attr.username} \nUserId = ${attr.user}`;
                      markData.textContent = content
                      markData.setAttribute('class', 'changes-placeholder')

                      markContent.append(markData)
                    })
                    changePlaceholder.append(markContent)
                    changePlaceholder.style.position = 'absolute';
                    changePlaceholder.setAttribute('class', 'changes-placeholder')
                    changePlaceholder.setAttribute('style', `position: fixed;
                    display: inline;
                    transform: translate(-50%, -111%);
                    background-color: #47d2d3;
                    border-radius: 2px;
                    width: fit-content;
                    z-index: 10;
                    padding: 6px;`)

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
                    padding-left: 9px;
                    padding-right: 9px;
                    border: 1.4px solid black;`)
                    rejectBtn.setAttribute('style', `display: inline;
                    background-color: #fbdfd2;
                    border-radius: 13px;
                    padding: 4px;
                    padding-left: 9px;
                    padding-right: 9px;
                    margin-left: 7px;
                    border: 1.4px solid black;`)
                    
                    acceptBtn.addEventListener('click',()=>{
                      acceptReject.action = 'accept';
                      acceptReject.pos = markPos;
                      acceptReject.editorId = pluginState.sectionName;
                      relativeElement.style.display = 'none';
                    })
                    rejectBtn.addEventListener('click',()=>{
                      acceptReject.action = 'reject';
                      acceptReject.pos = markPos;
                      acceptReject.editorId = pluginState.sectionName;
                      relativeElement.style.display = 'none';
                    })

                    buttonsContainer.append(acceptBtn, rejectBtn);

                    let arrow = document.createElement('div');
                    arrow.setAttribute('class', 'changes-placeholder')
                    arrow.setAttribute('style',`
                    position: absolute;
                    right: 50%;
                    border-bottom: 10px solid #47d2d3;
                    border-left: 6px solid rgba(0, 0, 0, 0);
                    border-right: 6px solid rgba(0, 0, 0, 0);
                    content: "";
                    display: inline-block;
                    height: 0;
                    vertical-align: top;
                    width: 0;
                    transform: rotate(180deg) translate(-50%, -5px);
                    `)

                    changePlaceholder.append(buttonsContainer,arrow);


                    relativeElement.appendChild(changePlaceholder);
                    return relativeElement;
                  })]);
                } else {
                  pluginState.createdDecorations = DecorationSet.empty
                }
              } else {
                pluginState.createdDecorations = DecorationSet.empty;
              }
            } catch (e) {
              console.log(e);
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
              if(this.acceptReject.action && this.acceptReject.editorId == sectionName){
                let marks = (changesObject[sectionName] as Array<any>).filter((el)=>{return el.from<=acceptReject.pos&&el.to>=acceptReject.pos});
                console.log(changesObject[sectionName]);
                if(marks.length==0){
                  return
                }
                if(this.acceptReject.action == 'accept'){
                  acceptChange(view,{from:marks[0].from,to:marks[0].to})
                }else if(this.acceptReject.action == 'reject'){
                  rejectChange(view,{from:marks[0].from,to:marks[0].to})
                }
                this.acceptReject.action = undefined
                this.acceptReject.editorId = undefined
                this.acceptReject.pos = undefined
              }
              if(JSON.stringify(view.state.doc)== JSON.stringify(prevState.doc)&&!view.hasFocus()){
                return;
              }
              let deletionMark = view.state.schema.marks.deletion
              let insertionMark = view.state.schema.marks.insertion
              let format_changeMark = view.state.schema.marks.format_change
              let editor = document.getElementsByClassName('editor-container').item(0) as HTMLDivElement
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
                if ((startPosition == endPosition && endPosition == 'above' || startPosition == endPosition && endPosition == 'under')&&pluginState.editorType!=='popupEditor') {

                  changesObject[sectionName] = [];

                  return
                } else {
                  let displayChangesFrom = 0;
                  let displayChangesTo = endOfEditor;
                  if (startPosition == 'above'&&pluginState.editorType!=='popupEditor') {
                    displayChangesFrom = view.posAtCoords(coords)?.pos!;
                  }
                  if (endPosition == 'under'&&pluginState.editorType!=='popupEditor') {
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
            } catch (e) {
              console.error(e);
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
