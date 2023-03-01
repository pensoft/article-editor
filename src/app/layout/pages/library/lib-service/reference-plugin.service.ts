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
          let docs = referencePluginKey.getState(state).decs ? referencePluginKey.getState(state).decs.filter((dec: any) => dec) : undefined;
          return docs && docs.length > 0 ? DecorationSet.create(state.doc, referencePluginKey.getState(state).decs) : DecorationSet.empty;
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
