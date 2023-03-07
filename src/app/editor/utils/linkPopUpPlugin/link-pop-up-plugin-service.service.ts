import { Injectable } from '@angular/core';
import { EditorState, Plugin, PluginKey, TextSelection } from 'prosemirror-state'
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { ProsemirrorEditorsService } from '../../services/prosemirror-editors.service';
import { DetectFocusService } from '../detectFocusPlugin/detect-focus.service';
import { CsvServiceService } from "@app/editor/csv-service/csv-service.service";
import Papa from 'papaparse';
import { normalize } from 'path';
import { ViewportScroller } from '@angular/common';
import { saveAs } from 'file-saver'
import { MarkType } from 'prosemirror-model';

@Injectable({
  providedIn: 'root'
})
export class LinkPopUpPluginServiceService {

  linkPopUpPluginKey
  linkPopUpPlugin: Plugin;

  download(filename, text,url:boolean) {
    if(url){
      fetch(text).then((res:any) => {return res.blob()}).then(file => {
        let tempUrl = URL.createObjectURL(file);
        const aTag = document.createElement("a");
        aTag.href = tempUrl;
        aTag.download = text.split('?')[0].split('/').pop()
        document.body.appendChild(aTag);
        aTag.click();
        URL.revokeObjectURL(tempUrl);
        aTag.remove();
    }).catch(() => {
    });
    }else{
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
          const pluginState = linkPopUpPluginKey.getState(state);
          const focusRN = detectFocusPluginKey.getState(state);

          if (!(focusRN.hasFocus || (lastFocusedEditor == focusRN.sectionName))) return DecorationSet.empty
          if(pluginState.sectionName == "endEditor") return DecorationSet.empty;

          const { $anchor } = state.selection;
          const linkMarkInfo = self.markPosition(state,$anchor.pos, state.schema.marks.link)

          if(!linkMarkInfo) return DecorationSet.empty;

          const { from, mark } = linkMarkInfo;
          
          if (mark.attrs.download) {

          } else {            
            const linkPopUp = document.createElement('div')
            linkPopUp.classList.add('link_popup_div');
            const link = document.createElement('a') as HTMLAnchorElement;            
            link.href = mark.attrs.href;
            link.textContent = mark.attrs.href;

            linkPopUp.addEventListener('click', e => {
              e.preventDefault();
              window.open(link.href, "_blank");
            })

            if (mark?.attrs.download) {
              link.href = 'data:text/plain;charset=utf-8,' + csvServiceService.arrayToCSV(lastFocusedEditor);
              link.download = mark.attrs.download;
              link.textContent = mark.attrs.download
            }
            linkPopUp.appendChild(link)

            return DecorationSet.create(state.doc, [Decoration.widget(from, linkPopUp)]);
          }

        },
        handleClick(this: Plugin, view: EditorView, pos: number, event: MouseEvent) {
          let {from, to} = view.state.selection;
          let linkNere = false;
          view.state.doc.nodesBetween(from,to,(node)=>{
            if(node.type.name == 'supplementary_file_url'){
              //@ts-ignore
              let link = node.content.content[0].content.content[0].marks[0].attrs.href;
              self.download('file.pdf',link,true);
              linkNere = true;
              lastFocusedEditor = null;
            }
          })
          let sectionId = linkPopUpPluginKey.getState(view.state).sectionName
          let node = view.state.doc.nodeAt(pos);
          if (!linkNere&&node&&node.marks.filter((mark) => mark.attrs.download && mark.attrs.download != "").length > 0) {
            let mark = node.marks.find((mark) => mark.attrs.download && mark.attrs.download != "");
            const text = csvServiceService.arrayToCSV(sectionId);
            const fileName = mark?.attrs.download;
            self.download(fileName, text,false);
            lastFocusedEditor = null;
          }
          return false
        },
        handleDOMEvents: {
          blur(this: Plugin, view: EditorView, event: MouseEvent) {
            const { pos } = view.state.selection.$anchor;
            const { link } = view.state.schema.marks;
            const markInfo = self.markPosition(view.state, pos, link);
            
            if(markInfo && 
              event.relatedTarget && 
              event.relatedTarget instanceof HTMLAnchorElement) {
              event.relatedTarget.click();
            }
          }
        }
      },
    })
  }
  
  markPosition(state: EditorState, pos: number, markType: MarkType) {
    const $pos = state.doc.resolve(pos);
    const { parent, parentOffset } = $pos;
    const { node, offset } = parent.childAfter(parentOffset);
    if (!node) return;
    
    const mark = node.marks.find((mark) => mark.type === markType);
    if (!mark) return;
    
    let from = $pos.start() + offset;
    let to = from + node.nodeSize;
    
    return { from, to, mark };
  }
}
