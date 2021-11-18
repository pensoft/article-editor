import { Node } from 'prosemirror-model';
//@ts-ignore
import { SchemaHelpers } from 'wax-prosemirror-utilities';

const format_change = {
  attrs: {
    class: { default: 'format-change' },
    id: { default: '' },
    user: { default: 0 },
    username: { default: '' },
    date: { default: 0 },
    before: { default: [] },
    after: { default: [] },
    group: { default: '' },
    viewid: { default: '' },
  },
  inclusive: false,
  group: 'track',
  parseDOM: [
    {
      tag: 'span.format-change',
      getAttrs(dom:any) {
        return {
          class: dom.getAttribute('class'),
          id: dom.dataset.id,
          user: dom.dataset.user,
          username: dom.dataset.username,
          date: parseInt(dom.dataset.date),
          before: SchemaHelpers.parseFormatList(dom.dataset.before),
          after: SchemaHelpers.parseFormatList(dom.dataset.after),
          group: dom.dataset.group,
          viewid: dom.dataset.viewid,
        }
      },
    },
  ],
  toDOM(node:Node) {
    return [
      'span',
      {
        class: node.attrs.class,
        'data-id': node.attrs.id,
        'data-user': node.attrs.user,
        'data-username': node.attrs.username,
        'data-date': node.attrs.date,
        'data-before': JSON.stringify(node.attrs.before),
        'data-after': JSON.stringify(node.attrs.after),
        'data-group':node.attrs.group,
        'data-viewid': node.attrs.viewid,
      },
    ];
  },
};

export default format_change;
