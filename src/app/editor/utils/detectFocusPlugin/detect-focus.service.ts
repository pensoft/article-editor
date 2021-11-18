import { Injectable } from '@angular/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Subject } from 'rxjs';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';

@Injectable({
  providedIn: 'root'
})
export class DetectFocusService {
  focusedEditor 
  detectFocusPlugin:Plugin
  detectFocusPluginKey
  sectionName:string|undefined
  sectionType?:string;
  constructor(
    private ydocService:YdocService
  ) { 
    let focusedE = new Subject<string>();
    this.focusedEditor = focusedE
    let detectFocusPluginKey = new PluginKey('detectFocusPluginKey')
    this.detectFocusPluginKey = detectFocusPluginKey;
    let sectionName :string
    let setLastEditorFocus = (id:string)=>{
      this.sectionName = id
      sectionName = id
    }
    let getLastFocus = ()=>{
      return this.sectionName
    }
    this.detectFocusPlugin = new Plugin({
      key: detectFocusPluginKey,
      state: {
        init: (_, state) => {
          return { sectionName: _.sectionName ,hasFocus:false};
        },
        apply(tr, prev, editorState, newState) {

          let pluginMeta = detectFocusPluginKey.getState(editorState)
          if(pluginMeta){
            let focusRN = pluginMeta.focusRN;
            prev.hasFocus = focusRN;
            /* if(focusRN){
              setTimeout(() => {
                focusedE.next(prev.sectionName);
              }, 10);
              setLastEditorFocus(prev.sectionName)
            }else if(!focusRN){
              focusedE.next('');

            } */
          }
          return prev
        },
      },
      
      view: function () {
        return {
          update: (view, prevState) => {
            let {sectionName,hasFocus} = detectFocusPluginKey.getState(view.state)
            let focusRN = view.hasFocus()
            
            
            if(focusRN){
              
              setTimeout(() => {
                focusedE.next(sectionName);
              }, 10);
              setLastEditorFocus(sectionName)
            }else if(getLastFocus() == sectionName){
              
            }
            /* if(focusRN !== hasFocus){
              hasFocus = focusRN
              let tr = view.state.tr.setMeta(detectFocusPluginKey,{focusRN});
            } */
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
