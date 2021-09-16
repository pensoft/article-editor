import { Injectable } from '@angular/core';
import { debug } from 'console';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DetectFocusService {
  focusedEditor 
  detectFocusPlugin:Plugin
  detectFocusPluginKey
  sectionName:String|undefined
  constructor() { 
    let focusedE = new Subject<string>();
    this.focusedEditor = focusedE
    let detectFocusPluginKey = new PluginKey('detectFocusPluginKey')
    this.detectFocusPluginKey = detectFocusPluginKey;
    let sectionName :string
    this.detectFocusPlugin = new Plugin({
      key: this.detectFocusPluginKey,
      state: {
        init: (_, state) => {
          return { sectionName: _.sectionName ,hasFocus:false};
        },
        apply(tr, prev, editorState, newState) {
          let pluginMeta = tr.getMeta(detectFocusPluginKey)
          if(pluginMeta){
            let focusRN = pluginMeta.focusRN;
            prev.hasFocus = focusRN;
            if(focusRN){
              setTimeout(() => {
                focusedE.next(prev.sectionName);
              }, 10);
              sectionName = prev.sectionName
            }else if(!focusRN){
              focusedE.next('');

            }
          }
          return prev
        },
      },
      
      view: function () {
        return {
          update: (view, prevState) => {
            let {sectionName,hasFocus} = detectFocusPluginKey.getState(view.state)
            let focusRN = view.hasFocus()
            if(focusRN !== hasFocus){
              hasFocus = focusRN
              let tr = view.state.tr.setMeta(detectFocusPluginKey,{focusRN});
              view.dispatch(tr);
            }
          },
          destroy: () => { }
        }
      }
    });
  }

  getPlugin(){
    return this.detectFocusPlugin
  }

  getSubject(){
    return this.focusedEditor
  }
}
