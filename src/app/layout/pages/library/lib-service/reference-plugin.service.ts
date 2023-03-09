import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { createCustomIcon } from '@app/editor/utils/menu/common-methods';
import { EditorView } from '@codemirror/basic-setup';
import { timeStamp } from 'console';
import { PluginKey, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

@Injectable({
  providedIn: 'root'
})
export class ReferencePluginService {
  referencePluginKey?: PluginKey;
  referencePlugin?: Plugin
  refsObj: any = {}
  referenceActionButtons = ['update-data-reference-button'];
  decorationsByEditors: any = {}
  constructor(
    private serviceShare: ServiceShare
  ) {
    serviceShare.shareSelf('ReferencePluginService', this);
    let referencePluginKey = new PluginKey('referencePluginKey');
    this.referencePluginKey = referencePluginKey;
    let refsObj = this.refsObj;
    this.referencePlugin = new Plugin({
      key: referencePluginKey,
      state: {
        init: (_:any, state) => {
          return { sectionName: _.sectionName,decs:undefined };
        },
        apply:(tr, prev, editorState, newState)=> {
          let decs: Decoration[] = [];
          if (/* refsObj.refs&& */!serviceShare.ProsemirrorEditorsService!.previewArticleMode.mode) {
            let docSize = editorState.doc.content.size
            editorState.doc.nodesBetween(0, docSize - 1, (node, pos, parent, index) => {
              if (node.type.name == 'reference_citation_end') {
                let buttonContainer = document.createElement('div');
                buttonContainer.className = 'citable-items-edit-buttons';

                let nodeStart = pos;
                let nodeEnd = node.nodeSize+ pos;
                if ((
                  editorState.selection.from>=nodeStart&&editorState.selection.from<=nodeEnd
                )||(
                  editorState.selection.to>=nodeStart&&editorState.selection.to<=nodeEnd
                )) {
                  let button1 = document.createElement('button')
                  button1.className = 'edit-citable-item-button';
                  button1.addEventListener('click', () => {
                    serviceShare.CslService!.editReferenceThroughPMEditor(node,prev.sectionName);
                  })
                  button1.style.cursor = 'pointer'
                  button1.title = 'Click this button to edit this reference.'
                  let img1 =  createCustomIcon('edit-green.svg', 20, 22)
                  img1.dom.className = 'update-data-reference-img'
                  button1.append(img1.dom)
                  buttonContainer.append(button1);
                }
                if (buttonContainer.childNodes.length > 0) {
                  decs.push(Decoration.widget(pos, (view) => {
                    return buttonContainer
                  }))
                }
              }
            })
          }
          if (decs.length > 0) {
            prev.decs = decs;
            return { ...prev }
          }
          return prev
        },
      },
      props: {
        handleDOMEvents:{
          'blur':(view,event)=>{
            if(event.relatedTarget && event.relatedTarget instanceof HTMLButtonElement && this.referenceActionButtons.includes(event.relatedTarget.className)){
              event.relatedTarget.click();
            }
          }
        },
        decorations(state) {
          let pluginState = referencePluginKey.getState(state);
          let focusedEditor = serviceShare.DetectFocusService.sectionName
          let currentEditor = pluginState.sectionName
        
          let {from,to} = state.selection;
          if(from!=to || currentEditor!=focusedEditor) return DecorationSet.empty;

          
          let docs = pluginState.decs ? pluginState.decs.filter((dec: any) => dec) : undefined;
          return docs && docs.length > 0 ? DecorationSet.create(state.doc, pluginState.decs) : DecorationSet.empty;
        }
      },
      view: function () {
        return {
          update: (view, prevState) => {
          },
          destroy: () => { }
        }
      }
    });
  }


  setRefs(refs: any[]) {
    this.refsObj.refs = refs;
  }
}
