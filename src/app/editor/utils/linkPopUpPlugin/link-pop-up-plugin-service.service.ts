import { Injectable } from '@angular/core';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { ProsemirrorEditorsService } from '../../services/prosemirror-editors.service';
import { DetectFocusService } from '../detectFocusPlugin/detect-focus.service';
import { schema } from '../Schema';


@Injectable({
  providedIn: 'root'
})
export class LinkPopUpPluginServiceService {
  linkPopUpPluginKey
  linkPopUpPlugin : Plugin
  constructor(private detectFocusService :DetectFocusService) { 
    let lastFocusedEditor : any
    lastFocusedEditor = detectFocusService.sectionName
    this.detectFocusService.focusedEditor.subscribe((data) => {
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
        init: (_, state) => {
          return { sectionName: _.sectionName };
        },
        apply(tr, prev, _, newState) {
          return prev
        },
      },
      props: {
        decorations(state:EditorState) {
          const doc = state.doc;
          let {from,to,empty} = state.selection;
          let pluginState = linkPopUpPluginKey.getState(state);
          let focusRN = detectFocusPluginKey.getState(state);
          //if(empty)  return
          if(!(focusRN.hasFocus||(lastFocusedEditor==focusRN.sectionName))) return DecorationSet.empty
          let position = from == to ? from:Math.floor((from+to)/2)
          let node = doc.nodeAt(position)
          let mark = node?.marks.find((mark)=>mark.type == schema.marks.link)
          if(!mark) return DecorationSet.empty
          let linkPopUp = document.createElement('div')
          linkPopUp.classList.add('link_popup_div');
          let link = document.createElement('a') as HTMLAnchorElement
          link.addEventListener('click',(event)=>{
            event.preventDefault();
            window.open(mark?.attrs.href)
          })
          link.href = mark?.attrs.href
          link.textContent = mark?.attrs.href
          linkPopUp.appendChild(link)


          return DecorationSet.create(doc, [Decoration.widget(position, linkPopUp)]);
          
        }
      }
    })
  }
}
