import {Injectable} from '@angular/core';
import {Plugin, PluginKey} from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import {Node as ProseMirrorNode} from 'prosemirror-model';
import { editorMeta } from '../interfaces/articleSection';
import { ServiceShare } from '@app/editor/services/service-share.service';

@Injectable({
  providedIn: 'root'
})
export class PlaceholderPluginService {
  placeholderPlugin: Plugin;
  key: any;

  constructor(private sharedService:ServiceShare) {
    let key =  new PluginKey('placeholderPlugin');
    this.key =key

    this.placeholderPlugin = new Plugin({
      key: this.key,
      state: {
        init: (_:any, state)=> {
          return JSON.parse(JSON.stringify({ data: _.data,sectionID:_.sectionID }));
        },
        apply(tr, prev, _, newState) {
          return prev
        },
      },
      props: {
        decorations(state) {
          let pluginData = key.getState(state)
          let data = pluginData.data;
          let doc = state.doc!;
          let hasNoChildren = doc.childCount === 0;
          let isEmptyTextBlock =
            doc.childCount === 1 && doc.firstChild!.isTextblock && doc.firstChild!.content.size === 0;
            let hasNoTextContent = doc.textContent == ''
            let formGroup = sharedService.TreeService!.sectionFormGroups[pluginData.sectionID]

          if (pluginData?.data?.path == 'tableContent') {
           return DecorationSet.empty
          }
          if(data&&data.placeHolder){
            if (hasNoChildren || isEmptyTextBlock || hasNoTextContent) {
              let position = doc.inlineContent ? 0 : 1;
              let placeholder = document.createElement('span');
              placeholder.classList.add('ProseMirror__placeholder');
              placeholder.setAttribute('data-placeholder', data.placeHolder);
              return DecorationSet.create(doc, [Decoration.widget(position, placeholder)]);
            }
          }else if(formGroup){
            let decorations:Decoration[] = []
            if(state.doc&&formGroup){
              let nodeSize = state.doc.content.size
              state.doc.nodesBetween(0,nodeSize,(node,pos,parent,i)=>{
                if(node.attrs.controlPath&&node.attrs.controlPath!==''&&node.textContent == ''){
                  let control = formGroup.get(node.attrs.controlPath);
                  if(control){
                    let placeholder = document.createElement('span');
                    placeholder.classList.add('ProseMirror__placeholder');
                    //@ts-ignore
                    placeholder.setAttribute('data-placeholder', (control.componentProps&&control.componentProps.placeholder)?control.componentProps.placeholder:'');
                    decorations.push(Decoration.widget(pos+1,placeholder))
                  }
                }
              })
              return DecorationSet.create(doc,decorations);
            }
          }else{
            if (hasNoChildren || isEmptyTextBlock || hasNoTextContent) {
              let position = doc.inlineContent ? 0 : 1;
              let placeholder = document.createElement('span');
              placeholder.classList.add('ProseMirror__placeholder');
              placeholder.setAttribute('data-placeholder', 'Type here...');
              return DecorationSet.create(doc, [Decoration.widget(position, placeholder)]);
            }
          }
        }
      }
    })
  }

  getPlugin(){
    return this.placeholderPlugin
  }
}
