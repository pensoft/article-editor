import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InsertFigureComponent } from '@app/editor/dialogs/figures-dialog/insert-figure/insert-figure.component';
import { FiguresControllerService } from '@app/editor/services/figures-controller.service';
import { YdocService } from '@app/editor/services/ydoc.service';
import { Fragment } from 'prosemirror-model';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { DecorationSet, Decoration, EditorView } from 'prosemirror-view';
import { TrackChangesService } from '../trachChangesService/track-changes.service';

@Injectable({
  providedIn: 'root'
})
export class CitatContextMenuService {

  citatContextPlugin: Plugin<any>
  citatContextPluginKey: PluginKey
  editorCenter: any

  

  shouldCloseContextMenu = false;
  constructor(
    private trackChangePluginService: TrackChangesService,
    public dialog: MatDialog,
    private ydocServide:YdocService,
  ) {
    let key = new PluginKey('citatContextPlugin')
    this.citatContextPluginKey = key;
    let editorCenter = trackChangePluginService.editorCenter
    this.editorCenter = editorCenter

    let shouldCloseContextMenu = this.shouldCloseContextMenu

    let deleteData:any

    this.citatContextPlugin = new Plugin({
      key: this.citatContextPluginKey,
      state: {
        init: (_, state) => {
          return {
            sectionName: _.sectionName,
            editorType: _.editorType ? _.editorType : undefined
          };
        },
        apply(tr, prev, _, newState) {
          if ((tr.getMeta('citatContextPlugin') && tr.getMeta('citatContextPlugin').clickOutside) || shouldCloseContextMenu) {
            prev.decorations = undefined
            shouldCloseContextMenu = false
          } else if (tr.getMeta('citatContextPlugin')) {
            
            let meta = tr.getMeta('citatContextPlugin')
            prev.meta = meta
            let citationMark = newState.doc.nodeAt(newState.selection.from)?.marks.filter((mark) => { return mark.type.name == 'citation' })[0]
            prev.decorations = DecorationSet.create(newState.doc, [Decoration.widget(newState.selection.from, (view) => {
              let relativeElement = document.createElement('div');
              relativeElement.setAttribute('style', 'position: relative;display: inline;line-height: 21px;font-size: 14px;')
              relativeElement.setAttribute('class', 'citat-menu-context')

              let absElPosition = document.createElement('div');
              absElPosition.setAttribute('class', 'citat-menu-context')

              let changePlaceholder = document.createElement('div');
              let markContent = document.createElement('div');






              changePlaceholder.style.position = 'absolute';
              changePlaceholder.setAttribute('class', 'citat-menu-context')


              let buttonsContainer = document.createElement('div');
              buttonsContainer.setAttribute('class', 'citat-menu-context')
              buttonsContainer.setAttribute('style', `display:block`)

              let editCitationButton = document.createElement('button')
              editCitationButton.setAttribute('class', 'citat-menu-context')
              let deleteCitationButton = document.createElement('button')
              deleteCitationButton.setAttribute('class', 'citat-menu-context-delete-citat-btn')
              editCitationButton.textContent = 'Edit figure citation'
              deleteCitationButton.textContent = 'Delete figure citation'
              editCitationButton.setAttribute('style', `
              background-color: #eff9ef;
              border-radius: 13px;
              padding: 4px;
              padding-left: 9px;
              padding-right: 9px;
              border: 2px solid black;
              display: block;cursor: pointer;
              width: 100%;`)
              deleteCitationButton.setAttribute('style', `
              background-color: #fbdfd2;
              border-radius: 13px;
              padding: 4px;
              padding-left: 9px;
              padding-right: 9px;cursor: pointer;
              margin-top: 8px;
              display: block;
              width: 100%;
              border: 2px solid black;`)

              editCitationButton.addEventListener('click', () => {
                let data
                if (citationMark) {
                  data = JSON.parse(JSON.stringify(citationMark.attrs));
                }
                const dialogRef = dialog.open(InsertFigureComponent, {
                  width: '80%',
                  height: '90%',
                  panelClass: 'insert-figure-in-editor',
                  data: { view, citatData: data, sectionID: prev.sectionName }
                });
                dialogRef.afterClosed().subscribe(result => {
                  shouldCloseContextMenu = true
                });
              })
              deleteCitationButton.addEventListener('click', () => {
                if (citationMark) {
                  deleteData = {mark:citationMark,sectionID:prev.sectionName}

                  shouldCloseContextMenu = true
                }
              })

              buttonsContainer.append(editCitationButton, deleteCitationButton);

              let arrow = document.createElement('div');
              arrow.setAttribute('class', 'citat-menu-context')


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
                  width: 160px;
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
                  width: 160px;
                  z-index: 10;
                  padding: 6px;`)
                  arrow.setAttribute('style', `
                  position: absolute;
                  left:  142px;
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
                  width: 160px;
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
                  width: 160px;
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
              }
              return relativeElement;
            })])
          }
          return { ...prev }
        },
      },
      props: {
        decorations(state) {
          return key.getState(state).decorations || DecorationSet.empty;
        }
      },
      view: function () {
        return {
          update: (view, prevState) => {
            let pluginState = key.getState(view.state)
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
              editorCenter.top = (elemRect.top + elemRect.bottom) / 2
              editorCenter.left = (elemRect.left + elemRect.right) / 2
            }

            if(deleteData){
              let mark = deleteData.mark
              let sectionID = deleteData.sectionID

              if(pluginState.sectionName == sectionID){
                let citatsData = ydocServide.figuresMap?.get('articleCitatsObj');
                let markActualData = citatsData[sectionID][mark.attrs.citateid]
                if(markActualData){
                  deleteData = undefined
                  let start = +markActualData.position
                  let end = +markActualData.position+view.state.doc.nodeAt(markActualData.position)?.nodeSize!
                  //citatsData[sectionID][mark.attrs.citateid] = undefined
                  //ydocServide.figuresMap?.set('articleCitatsObj',citatsData)
                  view.dispatch(view.state.tr.replaceWith(start,end,Fragment.empty))
                }
              }
            }
          },
          destroy: () => { }
        }
      },

    })
  }

  

}
