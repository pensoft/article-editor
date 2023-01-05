import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { Plugin, PluginKey } from 'prosemirror-state';
import { DecorationSet, EditorView } from 'prosemirror-view';
@Injectable({
  providedIn: 'root'
})
export class CitableElementsContextMenuService {
  plugin
  key
  constructor(private serviceShare:ServiceShare) {
    this.serviceShare.shareSelf('CitableElementsContextMenuService',this)
    this.key = new PluginKey('CitableElementsContextMenu')
    this.plugin = new Plugin({
      key: this.key,
      state: {
        init: (_:any, state) => {
          return {
            sectionName: _.sectionName,
            editorType: _.editorType ? _.editorType : undefined,
          };
        },
        apply(tr, prev, oldState, newState) {
          return { ...prev }
        },
      },
      props: {
        handleDOMEvents:{
          contextmenu:(view: EditorView,event: MouseEvent) => {
            // true prevents this event drom beeing handles by prosemirror and we should call preventDefault if we return true
            console.log(event);
          }
        },
        decorations(state) {
          return DecorationSet.empty;
        }
      },
      view: function () {
        return {
          update: (view, prevState) => {

          },
          destroy: () => { }
        }
      },

    })
  }

  getPlugin(){
    return this.plugin
  }

  getPluginKey(){
    return this.key
  }
}
