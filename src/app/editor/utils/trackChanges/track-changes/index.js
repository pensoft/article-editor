import { TextSelection } from 'prosemirror-state';
import { Selection } from 'prosemirror-state';
import {
  ReplaceStep,
  ReplaceAroundStep,
  AddMarkStep,
  RemoveMarkStep,
  Mapping,
} from 'prosemirror-transform';

import { DocumentHelpers } from 'wax-prosemirror-utilities';
import replaceStep from './helpers/replaceStep.js';
import replaceAroundStep from './helpers/replaceAroundStep.js';
import addMarkStep from './helpers/addMarkStep.js';
import removeMarkStep from './helpers/removeMarkStep.js';

export const findMark = (state, PMmark, toArr = false) => {
  const {
    selection: {
      $from,
      $to
    },
    doc
  } = state;
  const fromMark = $from.marks().find(mark => mark.type === PMmark);
  const toMark = $to.marks().find(mark => mark.type === PMmark);
  let markFound;
  const marksFound = [];
  doc.nodesBetween($from.pos, $to.pos, (node, from) => {
    if (node.marks) {
      const actualMark = node.marks.find(mark => mark.type === PMmark);

      if (actualMark) {
        markFound = {
          from,
          to: from + node.nodeSize,
          attrs: actualMark.attrs,
          contained: !fromMark || !toMark || fromMark === toMark,
          selIsInsideMark:fromMark === toMark
        };
        marksFound.push(markFound);
      }
    }
  });

  let markAtEndOfSel = $to.nodeAfter ? $to.nodeAfter.marks.find(mark => mark.type === PMmark) : undefined;
  let markAtStartOfSel = $to.nodeBefore ? $to.nodeBefore.marks.find(mark => mark.type === PMmark) : undefined;

  let containedMark = false;

  if (!markFound) {
    if (markAtEndOfSel == markAtStartOfSel) {
      containedMark = true
    }
  }
  if (!markFound && $to.nodeAfter) {
    let markAfterTo = $to.nodeAfter.marks.find(mark => mark.type === PMmark);
    if (markAfterTo) {
      markFound = {
        from: $to.pos,
        to: $to.pos + $to.nodeAfter.nodeSize,
        attrs: markAfterTo.attrs,
        contained: false,
        atEndOfSel: true,
      }
    }
  }

  if (!markFound && $to.nodeBefore) {
    let markAfterTo = $to.nodeBefore.marks.find(mark => mark.type === PMmark);
    if (markAfterTo) {
      markFound = {
        from: $to.pos,
        to: $to.pos + $to.nodeBefore.nodeSize,
        attrs: markAfterTo.attrs,
        contained: false,
        atStartOfSel: true,
      }
    }
  }


  if (containedMark && markAtEndOfSel) {
    markFound.contained = true;
    markFound.atEndOfSel = false;
  }

  if(
    markFound &&
    (state.doc.nodeAt($to.pos) && state.doc.nodeAt($to.pos).marks.find(mark=>mark.type === PMmark)) &&
    (state.doc.nodeAt($from.pos) && !state.doc.nodeAt($from.pos).marks.find(mark=>mark.type === PMmark))
    ){
      markFound.onlyEndOfSelIsInMark = true;
  }

  if(
    markFound &&
    (state.doc.nodeAt($to.pos) && !state.doc.nodeAt($to.pos).marks.find(mark=>mark.type === PMmark)) &&
    (state.doc.nodeAt($from.pos) && state.doc.nodeAt($from.pos).marks.find(mark=>mark.type === PMmark))
    ){
      markFound.onlyStartOfSelIsInMark = true;
  }


  if (toArr) return marksFound;
  return markFound;
};

export const findMark1 = (state, PMmark, toArr = false) => {
  const {
    selection: {
      $from,
      $to
    },
    doc
  } = state;
  const fromMark = $from.marks().find(mark => mark.type === PMmark);
  const toMark = $to.marks().find(mark => mark.type === PMmark);
  let markFound;
  const marksFound = [];
  doc.nodesBetween($from.pos, $to.pos, (node, from) => {
    if (node.marks) {
      const actualMark = node.marks.find(mark => mark.type === PMmark);

      if (actualMark) {
        markFound = {
          from,
          to: from + node.nodeSize,
          attrs: actualMark.attrs,
          contained: !fromMark || !toMark || fromMark === toMark
        };
        marksFound.push(markFound);
      }
    }
  });
  if (!markFound) {
    let markAfterTo = $to.nodeAfter.marks.find(mark => mark.type === PMmark);
    if (markAfterTo) {
      markFound = {
        from: $to.pos,
        to: $to.pos + $to.nodeAfter.nodeSize,
        attrs: markAfterTo.attrs,
        contained: false,
        atEndOfSel: true,
      }
    }
  }

  if (toArr) return marksFound;
  return markFound;
};

const trackedTransaction = (
  tr,
  view,
  state,
  user,
  lastContainingInsertionMark,
  group = 'main',
  viewId = 'main',
) => {
  // Don't track table operations
  if (!tr.selectionSet) {
    const $pos = state.selection.$anchor;
    for (let { depth } = $pos; depth > 0; depth -= 1) {
      const node = $pos.node(depth);
      if (node.type.spec.tableRole === 'table') {
        return tr;
      }
    }
  }

  if (state.selection.node && state.selection.node.type.name === 'image') {
    return tr;
  }
  // images
  if (state.selection.node && state.selection.node.type.name === 'figure') {
    return tr;
  }

  if (!tr.steps.length ||
    (tr.meta &&
      !Object.keys(tr.meta).every(meta => ['inputType', 'uiEvent', 'paste'].includes(meta), )) || ['AcceptReject', 'Undo', 'Redo'].includes(tr.getMeta('inputType'))
  ) {
    return tr;
  }

  // const group = tr.getMeta('outsideView') ? tr.getMeta('outsideView') : 'main';
  let newTr = state.tr;
  const map = new Mapping();
  const date = Math.floor(Date.now());

/*   let diffTrackingMarksAtStartAndEnd = false;
  let newStart // moved start so that it only containes the insertion mark
  let newEnd //  moved end
  let replaceWith

  tr.steps.forEach((step)=>{

    if(step.constructor == ReplaceStep&&step.from != step.to){
      let nodeAtFrom = state.doc.nodeAt(step.from)
      let nodeAtTo = state.doc.nodeAt(step.to)
      if(
        (nodeAtFrom.marks.find((mark)=>mark.type.name == "deletion")&&nodeAtTo.marks.find((mark)=>mark.type.name == "insertion"))||
        (nodeAtTo.marks.find((mark)=>mark.type.name == "deletion")&&nodeAtFrom.marks.find((mark)=>mark.type.name == "insertion"))
        ){
          diffTrackingMarksAtStartAndEnd = true;
      }
      if(diffTrackingMarksAtStartAndEnd){ // search for the insertion mark
        let resolvedAtFrom = state.doc.resolve(step.from);
        let resolvedAtTo = state.doc.resolve(step.to);
        let insAtFrom = nodeAtFrom.marks.find((mark)=>mark.type.name == "insertion");
        let insAtTo = nodeAtTo.marks.find((mark)=>mark.type.name == "insertion");
        if(insAtFrom){
          newStart = step.from
          newEnd = resolvedAtFrom.nodeAfter.nodeSize + step.from
        }else if(insAtTo){
          newStart = step.to - resolvedAtTo.nodeBefore.nodeSize
          newEnd = step.to
        }
        replaceWith = step.slice
      }
    }
  })
  if(diffTrackingMarksAtStartAndEnd){
    let setSelectionTr = state.tr.setSelection(TextSelection.between(state.tr.doc.resolve(newStart),state.tr.doc.resolve(newEnd)));
    let newstate = view?.state.apply(setSelectionTr);
    view?.updateState(newstate);
    state = newstate
    newTr = state.tr
    tr = state.tr.replaceRange(newStart,newEnd,replaceWith);
  } */

  tr.steps.forEach(originalStep => {
    const step = originalStep.map(map);
    const { doc } = newTr;
    if (!step) return;



    switch (step.constructor) {
      case ReplaceStep:
        replaceStep(
          state,
          tr,
          step,
          newTr,
          map,
          doc,
          user,
          date,
          lastContainingInsertionMark,
          group,
          viewId,
        );
        break;
      case ReplaceAroundStep:
        replaceAroundStep(
          state,
          tr,
          step,
          newTr,
          map,
          doc,
          user,
          date,
          lastContainingInsertionMark,
          group,
          viewId,
        );
        break;
      case AddMarkStep:
        addMarkStep(
          state,
          tr,
          step,
          newTr,
          map,
          doc,
          user,
          date,
          lastContainingInsertionMark,
          group,
          viewId,
        );
        break;
      case RemoveMarkStep:
        removeMarkStep(
          state,
          tr,
          step,
          newTr,
          map,
          doc,
          user,
          date,
          lastContainingInsertionMark,
          group,
          viewId,
        );
        break;
      default:
    }
  });
  let { $head, $anchor } = tr.curSelection

  if (tr.getMeta('inputType')) newTr.setMeta(tr.getMeta('inputType'));

  if (tr.getMeta('uiEvent')) newTr.setMeta(tr.getMeta('uiEvent'));

  if (tr.selectionSet) {
    const deletionMarkSchema = state.schema.marks.deletion;
    const insertionMarkSchema = state.schema.marks.insertion;
    const deletionMark = findMark(
      state,
      deletionMarkSchema,
      false,
    );
    const insertionMark = findMark(
      state,
      insertionMarkSchema,
      false,
    );
    if (
      tr.selection instanceof TextSelection &&
      (tr.selection.from < state.selection.from ||
        tr.getMeta('inputType') === 'backwardsDelete')
    ) {

      const caretPos = map.map(tr.selection.from, -1);
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
    } else if (tr.selection.from > state.selection.from && deletionMark &&state.selection.to!=state.selection.from&& (deletionMark.onlyStartOfSelIsInMark || deletionMark.onlyEndOfSelIsInMark )) {
      if(deletionMark.onlyEndOfSelIsInMark){
        newTr.setSelection(tr.selection.map(newTr.doc, map))
      }else if(deletionMark.onlyStartOfSelIsInMark){
        newTr.setSelection(tr.selection.map(newTr.doc, map));
      }
    } else if (tr.selection.from > state.selection.from && state.selection.from==state.selection.to && deletionMark && deletionMark.contained){
      let newPos = deletionMark.to  + (tr.selection.from-deletionMark.to)+(deletionMark.to-state.selection.to)
      const caretPos = map.map(newPos);
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
    }else if(tr.selection.from > state.selection.from && state.selection.from==state.selection.to && deletionMark && (deletionMark.atEndOfSel || deletionMark.atStartOfSel)){
      newTr.setSelection(tr.selection.map(newTr.doc, map));
    }/* else if (tr.selection.from > state.selection.from && deletionMark && state.selection.from!=state.selection.to ) {
      const caretPos = map.map(deletionMark.to + 1 - (state.selection.to-state.selection.from), 1);
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
    } */else if (tr.selection.from > state.selection.from && deletionMark) {
      const caretPos = map.map(deletionMark.to + 1, 1);
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
    } else {
      newTr.setSelection(tr.selection.map(newTr.doc, map));
    }
  } else if (
    state.selection.from - tr.selection.from > 1 &&
    tr.selection.$head.depth > 1
  ) {
    if ($head.pos == $anchor.pos && $head.nodeBefore == null && $head.parent.type.name == "paragraph") {
      return tr
    }
    const caretPos = map.map(tr.selection.from - 2, -1);
    newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
  } else {
    if (
      state.selection.from === state.selection.to &&
      tr.selection.$head.depth > 1 &&
      state.selection.from - tr.selection.from === 1
    ) {
      tr.steps.forEach(originalStep => {
        const step = originalStep.map(map);
        step.from += 1;
        step.to += 1;
        const { doc } = newTr;

        replaceStep(state, tr, step, newTr, map, doc, user, date, group);
      });
      const caretPos = map.map(tr.selection.from - 1, -1);
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
    } else if (state.selection.from === state.selection.to) {
      const caretPos = map.map(tr.selection.from, -1);
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
    }
    const slice = map.slice(newTr.selection.from, newTr.selection.to);
    map.appendMap(slice);
  }

  if (tr.storedMarksSet) newTr.setStoredMarks(tr.storedMarks);

  if (tr.scrolledIntoView) newTr.scrollIntoView();
  return newTr;
};

export default trackedTransaction;
