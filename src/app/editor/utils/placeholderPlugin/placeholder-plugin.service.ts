import {Injectable} from '@angular/core';
import {Plugin, PluginKey} from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import {Node as ProseMirrorNode} from 'prosemirror-model';
import { editorMeta } from '../interfaces/articleSection';

@Injectable({
  providedIn: 'root'
})
export class PlaceholderPluginService {
  placeholderPlugin: Plugin;
  key: any;

  constructor() {
    let key =  new PluginKey('placeholderPlugin');
    this.key =key

    this.placeholderPlugin = new Plugin({
      key: this.key,
      state: {
        init: (_, state)=> {
          return { data: _.data };
        },
        apply(tr, prev, _, newState) {
          return prev
        },
      },
      props: {
        decorations(state) {
          let data = key.getState(state).data;
          const doc: any = state.doc;
          const hasNoChildren = doc.childCount === 0;
          const isEmptyTextBlock =
            doc.childCount === 1 && doc.firstChild.isTextblock && doc.firstChild.content.size === 0;
          if (hasNoChildren || isEmptyTextBlock) {
            const position = doc.inlineContent ? 0 : 1;
            const placeholder = document.createElement('span');
            placeholder.classList.add('ProseMirror__placeholder');
            placeholder.setAttribute('data-placeholder', data?data.placeHolder:'Type here...');

            return DecorationSet.create(doc, [Decoration.widget(position, placeholder)]);
          }
        }
      }
    })
  }

  getPlugin(){
    return this.placeholderPlugin
  }
}
