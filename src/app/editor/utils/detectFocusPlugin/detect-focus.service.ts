import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Subject } from 'rxjs';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';

@Injectable({
  providedIn: 'root'
})
export class DetectFocusService {
  focusedEditor :any
  detectFocusPlugin:Plugin
  detectFocusPluginKey
  sectionName:string|undefined
  sectionType?:string;
  resetDetectFocusService(){
    this.sectionName= undefined;
    this.sectionType= undefined;
  }
  constructor(
    private ydocService:YdocService,
    private serviceShare:ServiceShare
  ) {
    serviceShare.shareSelf('DetectFocusService',this);
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
        init: (_:any, state) => {
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
      props:{
        handleDOMEvents:{
          focus:(view)=>{
            let {sectionName,hasFocus} = detectFocusPluginKey.getState(view.state)
            setLastEditorFocus(sectionName)
          }
        },
        decorations:(state)=>{
          if(this.shouldCreateSelDecoration){
            let {sectionName} = detectFocusPluginKey.getState(state)
            if(sectionName == this.sectionName){ // this is the same as last selected editor
              let {from,to} = state.selection;
              let dec = Decoration.inline(from,to,{decoration:'selection-decoration-placeholder'});
              return DecorationSet.create(state.doc,[dec]);
            }
          }
          return DecorationSet.empty
        }
      },

      view:  () => {
        return {
          update: (view, prevState) => {
            let {sectionName,hasFocus} = detectFocusPluginKey.getState(view.state)
            let focusRN = view.hasFocus()
            if(view.hasFocus()){
              this.removeSelectionDecorationOnLastSelecctedEditor()
            }
            if(focusRN&&getLastFocus()!==sectionName){
              setTimeout(() => {
                focusedE.next(sectionName);
              }, 10);
              setLastEditorFocus(sectionName)
            }
          },
          destroy: () => { },

        }
      },
    });
  }

  shouldCreateSelDecoration = false;

  setSelectionDecorationOnLastSelecctedEditor(){
    if(!this.sectionName)return;
    this.shouldCreateSelDecoration = true;
    setTimeout(()=>{
      this.serviceShare.ProsemirrorEditorsService.dispatchEmptyTransaction()
    },10)
  }

  removeSelectionDecorationOnLastSelecctedEditor(){
    this.shouldCreateSelDecoration = false;
  }

  getPlugin(){
    return this.detectFocusPlugin
  }

  getSubject(){
    return this.focusedEditor
  }
}
