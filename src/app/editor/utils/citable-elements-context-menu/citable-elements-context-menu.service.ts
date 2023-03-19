import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InsertTableComponent } from '@app/editor/dialogs/citable-tables-dialog/insert-table/insert-table.component';
import { InsertEndNoteComponent } from '@app/editor/dialogs/end-notes/insert-end-note/insert-end-note.component';
import { InsertFigureComponent } from '@app/editor/dialogs/figures-dialog/insert-figure/insert-figure.component';
import { InsertSupplementaryFileComponent } from '@app/editor/dialogs/supplementary-files/insert-supplementary-file/insert-supplementary-file.component';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { Fragment } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { citationElementMap } from '../../services/citable-elements.service';
import { TrackChangesService } from '../trachChangesService/track-changes.service';

@Injectable({
  providedIn: 'root'
})
export class CitableElementsContextMenuService {
  plugin
  key

  elementCitationsHTMLtags = Object.values(citationElementMap).map((x) => x.htmlTag);
  elementCitationsMarkNames = Object.keys(citationElementMap)

  elementsDialogsComponentsMap ={
    'supplementary_file_citation':{
      editElementCitationComponent:InsertSupplementaryFileComponent,
    },
    'table_citation':{
      editElementCitationComponent:InsertTableComponent,
    },
    'citation':{
      editElementCitationComponent:InsertFigureComponent,
    },
    'end_note_citation':{
      editElementCitationComponent:InsertEndNoteComponent,
    }
  }

  editorCenter

  shouldCloseContextMenu = false;
  constructor(
    private serviceShare: ServiceShare,
    private trackChangePluginService: TrackChangesService,
    public dialog: MatDialog,
  ) {
    let editorCenter = trackChangePluginService.editorCenter
    this.editorCenter = editorCenter
    let shouldCloseContextMenu = this.shouldCloseContextMenu

    this.serviceShare.shareSelf('CitableElementsContextMenuService', this)
    let key = new PluginKey('CitableElementsContextMenu')
    this.key = key

    let getDeacorationHTML = (typeOfEl, meta, prev, mark, view:EditorView) => {
      let citableElementMap = citationElementMap[typeOfEl]
      let type = citableElementMap.contextMenuTxt
      let contextBoxWidth = citableElementMap.contextMenuBoxWidth

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
      editCitationButton.textContent = `Edit ${type} citation`
      deleteCitationButton.textContent = `Delete ${type} citation`
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

        if (mark) {
          let data = JSON.parse(JSON.stringify(mark.attrs));
          let dialogRef = dialog.open(this.elementsDialogsComponentsMap[typeOfEl].editElementCitationComponent, {
            width: '80%',
            height: '90%',
            panelClass: 'insert-figure-in-editor',
            data: { view, citatData: data, sectionID: prev.sectionName }
          });
          dialogRef.afterClosed().subscribe(result => {
            shouldCloseContextMenu = true
            view.dispatch(view.state.tr)
          });
        }else{
          shouldCloseContextMenu = true;
          view.dispatch(view.state.tr)
        }
      })
      deleteCitationButton.addEventListener('click', () => {
        if (mark) {
          let data = JSON.parse(JSON.stringify(mark.attrs));
          let citationId = data.citateid
          let nodePos
          let nodeSize
          let found = false;
          let docSize = view.state.doc.content.size
          view.state.doc.nodesBetween(0,docSize-2,(node,pos)=>{
            let mark = node.marks.find(mark=>mark.type.name == typeOfEl);
            if(mark&&mark.attrs.citateid == citationId){
              nodePos = pos
              nodeSize = node.nodeSize;
              found = true
            }
          })
          if(found){
            shouldCloseContextMenu = true;
            view.dispatch(view.state.tr.delete(nodePos,nodePos + nodeSize));
          }else{
            shouldCloseContextMenu = true;
            view.dispatch(view.state.tr)
          }
        }else{
          shouldCloseContextMenu = true;
          view.dispatch(view.state.tr)
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
          transform: translate(-20px, 30px);
          background-color: ${backgroundColor};
          border-radius: 2px;
          width: ${contextBoxWidth};
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
          transform: translate(8px, -10px);
          `)
        } else if (meta.coords.top <= editorCenter.top && meta.coords.left > editorCenter.left) {
          //topright

          //
          changePlaceholder.setAttribute('style', `
          position: absolute;
          display: inline;
          transform: translate(-93%, 35%);
          background-color: ${backgroundColor};
          border-radius: 2px;
          width: ${contextBoxWidth};
          z-index: 10;
          padding: 6px;`)
          arrow.setAttribute('style', `
          position: absolute;
          left:  ${citableElementMap.contextMenuArrowPosition.topright.left};
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
          transform: translate(-20px, -82px);
          background-color: ${backgroundColor};
          border-radius: 2px;
          width: ${contextBoxWidth};
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
          transform: rotate(180deg) translate(-8px, -5px);
          `)
        } else if (meta.coords.top > editorCenter.top && meta.coords.left > editorCenter.left) {
          //bottomright
          changePlaceholder.setAttribute('style', `    position: absolute;
          display: inline;
          transform: translate(-91%, -111%);
          background-color: ${backgroundColor};
          border-radius: 2px;
          width: ${contextBoxWidth};
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

    }

    this.plugin = new Plugin({
      key: this.key,
      state: {
        init: (_: any, state) => {
          return {
            sectionName: _.sectionName,
            editorType: _.editorType ? _.editorType : undefined,
            decorations: undefined,
            meta: undefined
          };
        },
        apply:(tr, prev, oldState, newState) =>{
          let {from,to} = newState.selection
          if ((tr.getMeta(key) && !tr.getMeta(key).citationIsClicked) || shouldCloseContextMenu) {
            prev.decorations = undefined
            shouldCloseContextMenu = false
          } else if (tr.getMeta(key)&&from == to) {

            let meta = tr.getMeta(key)
            let nodeAtSel = newState.doc.nodeAt(from);
            let citationMarkAtSel = nodeAtSel.marks.find((mark)=>this.elementCitationsMarkNames.includes(mark.type.name));
            let citationType = citationMarkAtSel.type.name;
            //let cursurCoord = view.coordsAtPos(view.state.);
            meta.coords = {top:meta.event.y,left:meta.event.x};
            if (citationMarkAtSel) {
              prev.meta = meta
              prev.decorations = DecorationSet.create(newState.doc, [Decoration.widget(newState.selection.from, (view) => {
                return getDeacorationHTML(citationType, meta, prev, citationMarkAtSel,view)
              })])
            }
          }
          return { ...prev }
        },
      },
      props: {
        handleClickOn:(view, pos, node, nodePos, e, direct)=> {
/*           if (node.marks.filter((mark) => this.elementCitationsMarkNames.includes(mark.type.name)).length > 0 &&
            (("which" in e && e.which == 3) ||
              ("button" in e && e.button == 2)
            )) {
            let cursurCoord = view.coordsAtPos(pos);

            setTimeout(() => {
              view.dispatch(view.state.tr.setMeta(key, {
                clickPos: pos,
                citatPos: nodePos,
                clickEvent: e,
                focus: view.hasFocus(),
                direct,
                coords: cursurCoord
              }))
            }, 0)
            return true
          } else */if (key.getState(view.state) && key.getState(view.state).decorations !== undefined) {
            return false
          }
        },
        handleClick: (view, pos, e) => {
          //let node = view.state.doc.nodeAt(view.state.selection.from);
          /* if (((event.target as HTMLElement).className == 'citat-menu-context') || (event.target as HTMLElement).tagName == 'CITATION') {
            return true
          } else if ((event.target as HTMLElement).className == 'citat-menu-context-delete-citat-btn') {
            setTimeout(() => { view.dispatch(view.state.tr.setMeta('addToLastHistoryGroup', true)) }, 0)
            return true
          }
          if (citatContextPluginkey) {
            let tr1 = view.state.tr.setMeta(hideshowPluginKEey, {})
            tr1 = tr1.setMeta('citatContextPlugin', { clickOutside: true }).setMeta('addToLastHistoryGroup', true)
            view.dispatch(tr1)
          }
          */

        },
        handleDOMEvents: {
          contextmenu: (view: EditorView, event: MouseEvent) => {
            // true prevents this event from beeing handles by prosemirror and we should call preventDefault if we return true
            //@ts-ignore
            let isCitation = this.elementCitationsHTMLtags.includes(event.target.localName)
            if (isCitation) {
              event.preventDefault();
              event.stopPropagation();
              setTimeout(()=>{
                view.dispatch(view.state.tr.setMeta(key, { event, citationIsClicked: isCitation }));
              },10)
              return true;
            } else {
              //@ts-ignore
              if (key.getState(view.state).decorations && event.target && event.target.className && event.target.className.split(' ').includes('citat-menu-context')) {
                /* view.dispatch(view.state.tr.setMeta(key, { citationIsClicked: isCitation })); */
              }
            }
          },
          click:(view,event)=>{
              //@ts-ignore
            if (key.getState(view.state).decorations && event.target && event.target.className && event.target.className.split(' ').includes('citat-menu-context')) {
              /* view.dispatch(view.state.tr.setMeta(key, { citationIsClicked: isCitation })); */
              //@ts-ignore
            }else if(key.getState(view.state).decorations && event.target && event.target.className && !event.target.className.split(' ').includes('citat-menu-context')){
              shouldCloseContextMenu = true;
              view.dispatch(view.state.tr)
            }
          }
        },
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
          },
          destroy: () => { }
        }
      },

    })
  }

  getPlugin() {
    return this.plugin
  }

  getPluginKey() {
    return this.key
  }
}
