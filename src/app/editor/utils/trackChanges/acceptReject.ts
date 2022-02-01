import { Fragment, Mark, Slice } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
//@ts-ignore
import removeNode from './track-changes/helpers/removeNode.js';
import { AddMarkStep, Mapping, RemoveMarkStep, ReplaceStep } from 'prosemirror-transform';
import { of } from "rxjs";

function removeTextWithChangeMark(view: EditorView, markattrs: any, action: 'accept' | 'decline', fromConnectionMark?: boolean) {
  let doc = view.state.doc;
  let markid = markattrs.id;
  let markConnection = markattrs.connectedTo;

  let docSize = +doc.nodeSize

  let textstart: any
  let textend: any
  let markfound = false;
  let markType: any

  let connType: any;
  let connMarkAttrs: any;
  let connectionFound = false;

  doc.nodesBetween(0, docSize - 2, (node, pos, parent) => {
    let mark = node.marks.filter(mark => mark.attrs.id == markid);
    let markConn = node.marks.filter(mark => mark.attrs.id == markConnection);
    if (markConn.length > 0) {
      connType = markConn[0].type.name;
      connMarkAttrs = markConn[0].attrs;
      connectionFound = true;
    }
    if (mark.length > 0) {
      markType = mark[0].type
      textstart = pos;
      textend = pos + node.nodeSize;
      markfound = true;
    }
  })

  if (markfound) {
    view.dispatch(view.state.tr.replaceWith(textstart, textend, Fragment.empty).setMeta('shouldTrack', false));
  }
  if (connectionFound&&!fromConnectionMark) {
    if (action == 'accept') {
      setTimeout(() => {
        acceptChange(view, connType, connMarkAttrs, true)
      }, 0)
    } else if (action == 'decline') {
      setTimeout(() => {
        rejectChange(view, connType, connMarkAttrs, true)
      }, 0)
    }
  }
}

function removeChangeMarkFromText(view: EditorView, markattrs: any, action: 'accept' | 'decline', fromConnectionMark?: boolean) {
  let doc = view.state.doc;
  let markid = markattrs.id;
  let markConnection = markattrs.connectedTo;

  let docSize = +doc.nodeSize

  let textstart: any
  let textend: any
  let markfound = false;
  let markType: any

  let connType: any;
  let connMarkAttrs: any;
  let connectionFound = false;

  doc.nodesBetween(0, docSize - 2, (node, pos, parent) => {
    let mark = node.marks.filter(mark => mark.attrs.id == markid);
    let markConn = node.marks.filter(mark => mark.attrs.id == markConnection);
    if (markConn.length > 0) {
      connType = markConn[0].type.name;
      connMarkAttrs = markConn[0].attrs;
      connectionFound = true;
    }
    if (mark.length > 0) {
      markType = mark[0].type
      textstart = pos;
      textend = pos + node.nodeSize;
      markfound = true;
    }
  })

  if (markfound) {
    let tr = view.state.tr.removeMark(textstart, textend, markType)
    view.dispatch(tr.setMeta('shouldTrack', false));
  }
  if (connectionFound&&!fromConnectionMark) {
    if (action == 'accept') {
      setTimeout(() => {
        acceptChange(view, connType, connMarkAttrs, true)
      }, 0)
    } else if (action == 'decline') {
      setTimeout(() => {
        rejectChange(view, connType, connMarkAttrs, true)
      }, 0)
    }
  }
}

export function acceptChange(view: EditorView, markType: any, markattrs: any, fromConnection?: boolean) {

  if (!fromConnection) {
    if (markType == 'insertion') {
      removeChangeMarkFromText(view, markattrs, 'accept');
    } else if (markType == 'deletion') {
      removeTextWithChangeMark(view, markattrs, 'accept');
    }
  } else {
    if (markType == 'insertion') {
      removeChangeMarkFromText(view, markattrs, 'accept',fromConnection);
    } else if (markType == 'deletion') {
      removeTextWithChangeMark(view, markattrs, 'accept',fromConnection);
    }
  }
}

export function rejectChange(view: EditorView, markType: any, markattrs: any, fromConnection?: boolean) {

  if (!fromConnection) {
    if (markType == 'insertion') {
      removeTextWithChangeMark(view, markattrs, 'decline');
    } else if (markType == 'deletion') {
      removeChangeMarkFromText(view, markattrs, 'decline');
    }
  } else {
    if (markType == 'insertion') {
      removeTextWithChangeMark(view, markattrs, 'decline',fromConnection);
    } else if (markType == 'deletion') {
      removeChangeMarkFromText(view, markattrs, 'decline',fromConnection);
    }
  }

}
