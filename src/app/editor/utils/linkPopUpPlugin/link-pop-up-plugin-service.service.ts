import { Injectable } from '@angular/core';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { ProsemirrorEditorsService } from '../../services/prosemirror-editors.service';
import { DetectFocusService } from '../detectFocusPlugin/detect-focus.service';
import { schema } from '../Schema';
import { CsvServiceService } from "@app/editor/csv-service/csv-service.service";
import Papa from 'papaparse';
import { normalize } from 'path';

@Injectable({
  providedIn: 'root'
})
export class LinkPopUpPluginServiceService {
  linkPopUpPluginKey
  linkPopUpPlugin: Plugin;
  download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
    }
    else {
      pom.click();
    }
  }

  constructor(private detectFocusService: DetectFocusService, public csvServiceService: CsvServiceService) {
    const self = this;
    let lastFocusedEditor: any
    lastFocusedEditor = detectFocusService.sectionName
    this.detectFocusService.focusedEditor.subscribe((data: any) => {
      if (data) {
        lastFocusedEditor = data
      }
    })

    let linkPopUpPluginKey = new PluginKey('commentPlugin')
    let detectFocusPluginKey = detectFocusService.detectFocusPluginKey
    this.linkPopUpPluginKey = linkPopUpPluginKey
    this.linkPopUpPlugin = new Plugin({
      key: this.linkPopUpPluginKey,
      state: {
        init: (_:any, state) => {
          return { sectionName: _.sectionName };
        },
        apply(tr, prev, _, newState) {
          return prev
        },
      },
      props: {
        decorations(state: EditorState) {
          const doc = state.doc;
          let { from, to, empty } = state.selection;
          let pluginState = linkPopUpPluginKey.getState(state);
          let focusRN = detectFocusPluginKey.getState(state);
          //if(empty)  return
          if (!(focusRN.hasFocus || (lastFocusedEditor == focusRN.sectionName))) return DecorationSet.empty
          let position = from == to ? from : Math.floor((from + to) / 2)
          let node = doc.nodeAt(position)
          let mark = node?.marks.find((mark) => mark.type == state.schema.marks.link);
          if (!mark) return DecorationSet.empty
          if (mark?.attrs?.download) {

          } else {
            let linkPopUp = document.createElement('div')
            linkPopUp.classList.add('link_popup_div');
            let link = document.createElement('a') as HTMLAnchorElement;
            link.addEventListener('click', (event) => {
              if (!mark?.attrs.download) {
                event.preventDefault();
                window.open(mark?.attrs.href)
              }
            })
            link.href = mark?.attrs.href;
            link.textContent = mark?.attrs.href
            if (mark?.attrs.download) {

              link.href = 'data:text/plain;charset=utf-8,' + csvServiceService.arrayToCSV(lastFocusedEditor);
              link.download = mark?.attrs.download;
              link.textContent = mark?.attrs.download
            }
            linkPopUp.appendChild(link)


            return DecorationSet.create(doc, [Decoration.widget(position, linkPopUp)]);
          }

        },
        handleClick(this: Plugin, view: EditorView, pos: number, event: MouseEvent) {
          let sectionId = linkPopUpPluginKey.getState(view.state).sectionName
          let node = view.state.doc.nodeAt(pos);
          if (node&&node.marks.filter((mark) => mark.attrs.download && mark.attrs.download != "").length > 0) {
            let mark = node.marks.find((mark) => mark.attrs.download && mark.attrs.download != "");
            const text = csvServiceService.arrayToCSV(sectionId);
            const fileName = mark?.attrs.download;
            self.download(fileName, text);
            lastFocusedEditor = null;
          }
          return false
        },
      },
    })
  }
}
