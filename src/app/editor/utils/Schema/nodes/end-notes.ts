import { genericAttributtesToDom, getGenericAttributes, parseGenericAttributes } from "../helpers"
import { Node } from "prosemirror-model"
export const end_notes_nodes_container = {
  content: "block*",
  group: 'block',
  inline: false,
  isolating: true,
  attrs: {
    containerid: { default: '' },
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "end-notes-nodes-container", getAttrs(dom: HTMLElement) {
      return {
        containerid: dom.getAttribute('containerid'),
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node: any) {
    return ["end-notes-nodes-container", {
      'containerid': node.attrs.containerid,
      ...genericAttributtesToDom(node)
    }, 0]
  }
}

export const block_end_note = {
  group: 'block',
  content: "block+",
  inline: false,
  isolating: true,
  attrs: {
    end_note_number: {},
    end_note_id: {},
    viewed_by_citat: { default: "" },
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "block-end-note", getAttrs(dom: HTMLElement) {
      return {
        end_note_number: dom.getAttribute('end_note_number'),
        end_note_id: dom.getAttribute('end_note_id'),
        viewed_by_citat: dom.getAttribute('viewed_by_citat'),
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node: any) {
    return ["block-end-note", {
      'end_note_number': node.attrs.end_note_number,
      'end_note_id': node.attrs.end_note_id,
      'viewed_by_citat': node.attrs.viewed_by_citat,
      ...genericAttributtesToDom(node)
    }, 0]
  }
}

export const end_note = {
  group: 'block',
  content: "block+",
  isolating: true,
  inline: false,
  attrs: {
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "end-note", getAttrs(dom: any) {
      return {
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node: Node) {
    return ["end-note", {
      ...genericAttributtesToDom(node)
    }, 0]
  }
}

export const endNotesNodes = {
  end_notes_nodes_container,
  block_end_note,
  end_note
}
