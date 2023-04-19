import { Fragment, Mark, Slice } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
//@ts-ignore
import removeNode from './track-changes/helpers/removeNode.js';
import { AddMarkStep, Mapping, RemoveMarkStep, ReplaceStep } from 'prosemirror-transform';
import { of } from "rxjs";

function removeTextWithChangeMark(view: EditorView, markattrs: any, action: 'accept' | 'decline', fromConnectionMark?: boolean) {
  let doc = view.state.doc;
  let markid = markattrs.id;
  // let markConnection = markattrs.connectedTo;

  let docSize = +doc.nodeSize

  // let textstart: any
  // let textend: any
  // let markfound = false;
  // let markType: any

  // let connType: any;
  // let connMarkAttrs: any;
  // let connectionFound = false;
  let from;
  let to;

  doc.nodesBetween(0, docSize - 2, (node, pos, parent) => {
    let mark = node.marks.find(mark => mark.attrs.id == markid);

    if(mark?.attrs.id == markid && !from) {
      from = pos;
    } 
    if (mark?.attrs.id) {
      to = pos + node.nodeSize;
    }
    // let mark = node.marks.filter(mark => mark.attrs.id == markid);
    // let markConn = node.marks.filter(mark => mark.attrs.id == markConnection);
    // if (markConn.length > 0) {
    //   connType = markConn[0].type.name;
    //   connMarkAttrs = markConn[0].attrs;
    //   connectionFound = true;
    // }
    // if (mark.length > 0) {
    //   markType = mark[0].type
    //   textstart = pos;
    //   textend = pos + node.nodeSize;
    //   markfound = true;
    // }
  })

  if (from && to) {
    view.dispatch(view.state.tr.replaceWith(from, to, Fragment.empty).setMeta('shouldTrack', false));
  } 
  // if (markfound /&& !connectionFound && !fromConnectionMark) {
  //   let resolvedPosAtStart = view.state.doc.resolve(textstart);
  //   let resolvedPosAtEnd = view.state.doc.resolve(textend);

  //   let nodeBefore = resolvedPosAtStart.nodeBefore;
  //   let nodeAfter = resolvedPosAtEnd.nodeAfter;

  //   let searchingFor = markType.name == 'insertion' ? 'insertion' : 'deletion';
  //   if (nodeBefore) {
  //     let markConn = nodeBefore.marks.filter(mark => mark.type.name == searchingFor)[0]
  //     if (markConn) {
  //       connType = markConn.type.name;
  //       connMarkAttrs = markConn.attrs;
  //       connectionFound = true;
  //     }
  //   }
  //   if (nodeAfter) {
  //     let markConn = nodeAfter.marks.filter(mark => mark.type.name == searchingFor)[0]
  //     if (markConn) {
  //       connType = markConn.type.name;
  //       connMarkAttrs = markConn.attrs;
  //       connectionFound = true;
  //     }
  //   }
  // }

  

  // if (connectionFound && !fromConnectionMark) {
  //   if (action == 'accept') {
  //     setTimeout(() => {
  //       acceptChange(view, connType, connMarkAttrs, true)
  //     }, 0)
  //   } else if (action == 'decline') {
  //     setTimeout(() => {
  //       rejectChange(view, connType, connMarkAttrs, true)
  //     }, 0)
  //   }
  // }
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

  if (markfound && !connectionFound && !fromConnectionMark) {
    let resolvedPosAtStart = view.state.doc.resolve(textstart);
    let resolvedPosAtEnd = view.state.doc.resolve(textend);

    let nodeBefore = resolvedPosAtStart.nodeBefore;
    let nodeAfter = resolvedPosAtEnd.nodeAfter;

    let searchingFor = markType.name == 'insertion' ? 'insertion' : 'deletion';
    if (nodeBefore) {
      let markConn = nodeBefore.marks.filter(mark => mark.type.name == searchingFor)[0]
      if (markConn) {
        connType = markConn.type.name;
        connMarkAttrs = markConn.attrs;
        connectionFound = true;
      }
    }
    if (nodeAfter) {
      let markConn = nodeAfter.marks.filter(mark => mark.type.name == searchingFor)[0]
      if (markConn) {
        connType = markConn.type.name;
        connMarkAttrs = markConn.attrs;
        connectionFound = true;
      }
    }
  }

  if (markfound) {
    let tr = view.state.tr.removeMark(textstart, textend, markType)
    view.dispatch(tr.setMeta('shouldTrack', false));
  }
  if (connectionFound && !fromConnectionMark) {
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

function acceptFormatChange(view:EditorView,markattrs:any){
  let doc = view.state.doc;
  let markid = markattrs.id;

  let docSize = +doc.nodeSize

  let textstart: any
  let textend: any
  let markfound = false;
  let markType: any



  doc.nodesBetween(0, docSize - 2, (node, pos, parent) => {
    let mark = node.marks.filter(mark => mark.attrs.id == markid);
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
}

function rejectFormatChange(view:EditorView,markattrs:any){
  let doc = view.state.doc;
  let markid = markattrs.id;

  let docSize = +doc.nodeSize

  let textstart: any
  let textend: any
  let markfound = false;
  let markType: any



  doc.nodesBetween(0, docSize - 2, (node, pos, parent) => {
    let mark = node.marks.filter(mark => mark.attrs.id == markid);
    if (mark.length > 0) {
      markType = mark[0].type
      textstart = pos;
      textend = pos + node.nodeSize;
      markfound = true;
    }
  })
  if (markfound) {
    let marksBefore = markattrs.before as string[];
    let marksAfter = markattrs.after as string[];
    marksBefore.forEach(element => {
      marksAfter.splice(marksBefore.indexOf(element),1);
    });
    let markThatShouldBeRemoved = marksAfter[0];
    let rmType = view.state.schema.marks[markThatShouldBeRemoved]
    let tr = view.state.tr.removeMark(textstart, textend, markType).removeMark(textstart,textend,rmType)
    view.dispatch(tr.setMeta('shouldTrack', false));
  }
}

export function acceptChange(view: EditorView, markType: any, markattrs: any, fromConnection?: boolean) {

  if (markType == 'insertion') {
    removeChangeMarkFromText(view, markattrs, 'accept', fromConnection);
  } else if (markType == 'deletion') {
    removeTextWithChangeMark(view, markattrs, 'accept', fromConnection);
  } else if (markType == 'format_change') {
    acceptFormatChange(view,markattrs)
  }
  /* if (!fromConnection) {
    if (markType == 'insertion') {
      removeChangeMarkFromText(view, markattrs, 'accept');
    } else if (markType == 'deletion') {
      removeTextWithChangeMark(view, markattrs, 'accept');
    }
  } else {
  } */
}

export function rejectChange(view: EditorView, markType: any, markattrs: any, fromConnection?: boolean) {

  if (markType == 'insertion') {
    removeTextWithChangeMark(view, markattrs, 'decline');
  } else if (markType == 'deletion') {
    removeChangeMarkFromText(view, markattrs, 'decline');
  } else if (markType == 'format_change') {
    rejectFormatChange(view,markattrs);
  }
  /* if (!fromConnection) {

  } else {
    if (markType == 'insertion') {
      removeTextWithChangeMark(view, markattrs, 'decline', fromConnection);
    } else if (markType == 'deletion') {
      removeChangeMarkFromText(view, markattrs, 'decline', fromConnection);
    }else if (markType == 'format_change') {
    }
  } */

}
