import { Injectable } from '@angular/core';
import { EditorState, Plugin,PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
@Injectable({
  providedIn: 'root'
})
export class CitableElementsEditButtonsService {
  citableElementsEditButtonsPluginKey = new PluginKey('commentPlugin')
  citableElementsEditButtonsPlugin : Plugin
  constructor() {
    this.citableElementsEditButtonsPlugin = new Plugin({
      key: this.citableElementsEditButtonsPluginKey,
      state: {
        init: (_:any, state) => {
          return { sectionName: _.sectionName };
        },
        apply(tr, prev, _, newState) {
          return prev
        },
      },
      props: {
        decorations:(state: EditorState) => {
          let pluginState = this.citableElementsEditButtonsPluginKey.getState(state);

          let {from,to,$from,$to} = state.selection;
          if(from!=to) return DecorationSet.empty;
          //console.log(state,pluginState);
          //console.log($from);
          return  DecorationSet.empty
        }
      },
    })
  }
}
