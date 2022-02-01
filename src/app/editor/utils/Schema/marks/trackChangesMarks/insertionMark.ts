/* eslint-disable no-param-reassign */
/* eslint-disable radix */
import { Node } from "prosemirror-model";
const insertion = {
  attrs: {
    class: { default: 'insertion' },
    id: { default: '' },
    user: { default: 0 },
    username: { default: '' },
    date: { default: 0 },
    group: { default: '' },
    viewid: { default: '' },
    style: { default: null },
    connectedTo:{default:''},
    color:{default:''},
  },
  inclusive: false,
  group: 'track',
  parseDOM: [{
    tag: "span.insertion", getAttrs(dom:any) {
      return {
        src: dom.getAttribute('class'),
        style: dom.getAttribute('style').split(';background: ')[0],
        id: dom.dataset.id,
        user: dom.getAttribute('user'),
        username: dom.dataset.username,
        date: parseInt(dom.dataset.date),
        group: dom.dataset.group,
        viewid: dom.dataset.viewid,
        connectedTo: dom.getAttribute('connectedto'),
        color: dom.getAttribute('style').split(';background: ')[1],
      }
    }
  }],
  toDOM(node:Node) {
    return ["span", {
      class: node.attrs.class,
      'data-id': node.attrs.id,
      'user': node.attrs.user,
      'connectedto': node.attrs.connectedTo,
      'data-color': node.attrs.color,
      'data-username': node.attrs.username,
      'data-date': node.attrs.date,
      'data-group': node.attrs.group,
      'data-viewid': node.attrs.viewid,
      style: node.attrs.style + ';background: '+ node.attrs.color,
    }]
  }
};

export default insertion;
