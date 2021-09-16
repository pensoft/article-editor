import {Injectable} from '@angular/core';
import {Plugin, PluginKey} from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import {Node as ProseMirrorNode} from 'prosemirror-model';

@Injectable({
  providedIn: 'root'
})
export class PlaceholderPluginService {
  placeholderPlugin: Plugin;
  key: any;

  constructor() {
    this.key = new PluginKey('placeholderPlugin');
    this.placeholderPlugin = new Plugin({
      key: this.key,
      props: {
        decorations(state) {
          const doc: any = state.doc;
          const hasNoChildren = doc.childCount === 0;
          const isEmptyTextBlock =
            doc.childCount === 1 && doc.firstChild.isTextblock && doc.firstChild.content.size === 0;
          if (hasNoChildren || isEmptyTextBlock) {
            const position = doc.inlineContent ? 0 : 1;
            const placeholder = document.createElement('span');
            placeholder.classList.add('ProseMirror__placeholder');
            placeholder.setAttribute('data-placeholder', 'Type here...');

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
