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
          return  DecorationSet.empty
        }
      },
    })
  }
}
