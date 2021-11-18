import { Node } from "prosemirror-model";
export const comment = {
    attrs: {
        class: { default: 'comment' },
        id: { default: '' },
        group: { default: '' },
        viewid: { default: '' },
        conversation: { default: [] },
    },
    inclusive: false,
    excludes: '',
    parseDOM: [{
        tag: 'span.comment',
        getAttrs(dom:any) {
            return {
                class: dom.getAttribute('class'),
                id: dom.dataset.id,
                group: dom.dataset.group,
                viewid: dom.dataset.viewid,
                //conversation: JSON.parse(dom.dataset.conversation),
            }
        },
    }],
    toDOM(node:Node) {
        return[
            'span',
            {
                class: node.attrs.class,
                'data-id': node.attrs.id,
                'data-conversation': JSON.stringify(node.attrs.conversation),
                'data-viewid': node.attrs.viewid,
                'data-group': node.attrs.group,
            },
        ];
    },
};
