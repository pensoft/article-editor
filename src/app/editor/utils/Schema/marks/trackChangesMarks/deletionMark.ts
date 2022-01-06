/* eslint-disable no-param-reassign */

import { Node } from "prosemirror-model";

/* eslint-disable radix */
const deletion = {
  attrs: {
    class: { default: 'deletion' },
    id: { default: '' },
    user: { default: 0 },
    username: { default: '' },
    date: { default: 0 },
    group: { default: '' },
    viewid: { default: '' },
    style: { default: null },
  },
  inclusive: false,
  group: 'track',
  parseDOM: [
    {
      tag: 'span.deletion',
      getAttrs(dom:any) {
        return {
          class: dom.getAttribute('class'),
          style: dom.getAttribute('style'),
          id: dom.dataset.id,
          user: dom.getAttribute('user'),
          username: dom.dataset.username,
          date: parseInt(dom.dataset.date),
          group: dom.dataset.group,
          viewid: dom.dataset.viewid,
          color: dom.dataset.color,
        }
      },
    },
  ],
  toDOM(node:Node) {
    /* let deletionSpan = document.createElement('span');
    Object.keys(node.attrs).forEach((key:string)=>{
      deletionSpan.setAttribute(key,node.attrs[key]);
    })
    deletionSpan.addEventListener('mouseover',(e)=>{
      let mouseX = e.clientX
      let mouseY = e.clientY
    })
    return deletionSpan */
    return [
      'span',
      {
        class: node.attrs.class,
        'data-id': node.attrs.id,
        'user': node.attrs.user,
        'data-username': node.attrs.username,
        'data-date': node.attrs.date,
        'data-group': node.attrs.group,
        'data-viewid': node.attrs.viewid,
        style: node.attrs.style,
      },
    ];
  },
};
export default deletion;
