import { ReplaceStep } from "prosemirror-transform";
import { DocumentHelpers } from "wax-prosemirror-utilities";

import markDeletion from "./markDeletion";
import markInsertion from "./markInsertion";
import { findMark, findInsertionMark } from "..";
import { uuidv4 } from "lib0/random";

const replaceStep = (
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
  viewId
) => {
  const deletionMarkSchema = state.schema.marks.deletion;
  const deletionMark = findMark(state, deletionMarkSchema, false);
  //const positionTo = step.to;
  const positionTo =
    deletionMark && deletionMark.selIsInsideMark ? deletionMark.to : step.to;

  let deleteMarkId = deletionMark ? deletionMark.attrs.id : uuidv4();

  let insideDeleteMark = deletionMark ? deletionMark.selIsInsideMark : false;
  let atednOfDeleteMark =
    deletionMark && deletionMark.atStartOfSel ? true : false;
  let atStartOfDeletionMark =
    deletionMark && deletionMark.atEndOfSel ? true : false;

  const newStep = new ReplaceStep(
    positionTo, // We insert all the same steps, but with "from"/"to" both set to "to" in order not to delete content. Mapped as needed.
    positionTo,
    step.slice,
    step.structure
  );
  let insertionMarkID;
  // We didn't apply the original step in its original place. We adjust the map accordingly.
  map.appendMap(step.invert(doc).getMap());
  if (newStep) {
    const trTemp = state.apply(newTr).tr;
    if (trTemp.maybeStep(newStep).failed) {
      return;
    }
    const mappedNewStepTo = newStep.getMap().map(newStep.to);

    const insertionMarkFromSchema = state.schema.marks.insertion;
    const insertionMark = findMark(state, insertionMarkFromSchema, false);

    insertionMarkID = insertionMark ? insertionMark.attrs.id : uuidv4();
    let insertionMarkAttrs = insertionMark ? insertionMark.attrs : undefined;

    let userHasInsertionMarkAtEndOdDeletionMark = false;
    let userHasInsertionMarkAtStartOFDeletionMark = false;

    if (insideDeleteMark && state.selection.$to.nodeAfter) {
      let resolvedPosAtEndOfContainedDeletion = state.doc.resolve(
        state.selection.to + state.selection.$to.nodeAfter.nodeSize
      );
      if (resolvedPosAtEndOfContainedDeletion.nodeAfter) {
        let insertionMarkAtEndOfDeletionMark =
          resolvedPosAtEndOfContainedDeletion.nodeAfter.marks.filter(
            (mark) => mark.type.name == insertionMarkFromSchema.name
          )[0];

        if (insertionMarkAtEndOfDeletionMark) {
          insertionMarkAttrs = insertionMarkAtEndOfDeletionMark.attrs;
          userHasInsertionMarkAtEndOdDeletionMark =
            insertionMarkAtEndOfDeletionMark.attrs.user == user.userId;
        }
      }
    } /* else if(state.selection.from != state.selection.to&&insertionMark&&deletionMark){
      if(deletionMark.atStartOfSel){
        let insetrionMarkAtEndOfSelection =
        state.selection.$to.nodeAfter.marks.filter(
          (mark) => mark.type.name == insertionMarkFromSchema.name
        )[0];
        if (insetrionMarkAtEndOfSelection) {
          insertionMarkAttrs = insetrionMarkAtEndOfSelection.attrs;
          userHasInsertionMarkAtEndOdDeletionMark =
          insetrionMarkAtEndOfSelection.attrs.user == user.userId;
        }
      }else if(deletionMark.atEndOfSel){
        let insetrionMarkAtEndOfSelection =
        state.selection.$from.nodeAfter.marks.filter(
          (mark) => mark.type.name == insertionMarkFromSchema.name
        )[0];
        if (insetrionMarkAtEndOfSelection) {
          insertionMarkAttrs = insetrionMarkAtEndOfSelection.attrs;
          userHasInsertionMarkAtEndOdDeletionMark =
          insetrionMarkAtEndOfSelection.attrs.user == user.userId;
        }
      }
    } */else if (atednOfDeleteMark && state.selection.$to.nodeAfter) {
      let insertionMarkAtEndOfDeletionMark =
        state.selection.$to.nodeAfter.marks.filter(
          (mark) => mark.type.name == insertionMarkFromSchema.name
        )[0];
      if (insertionMarkAtEndOfDeletionMark) {
        insertionMarkAttrs = insertionMarkAtEndOfDeletionMark.attrs;
        userHasInsertionMarkAtEndOdDeletionMark =
          insertionMarkAtEndOfDeletionMark.attrs.user == user.userId;
      }
    } else if (atStartOfDeletionMark && state.selection.$from.nodeBefore) {
      let insertionMarkAtStartOfDeletionMark =
        state.selection.$from.nodeBefore.marks.filter(
          (mark) => mark.type.name == insertionMarkFromSchema.name
        )[0];
      if (insertionMarkAtStartOfDeletionMark) {
        insertionMarkAttrs = insertionMarkAtStartOfDeletionMark.attrs;
        userHasInsertionMarkAtStartOFDeletionMark =
          insertionMarkAtStartOfDeletionMark.attrs.user == user.userId;
      }
    }

    let theFoundInsMarkIsFromThisUser = false;

    if(insertionMark&&insertionMark.attrs.user == user.userId){
      theFoundInsMarkIsFromThisUser = true;
    }

    let userIsContinuingItsOwnMarkAroundADeletion =
      userHasInsertionMarkAtEndOdDeletionMark ||
      userHasInsertionMarkAtStartOFDeletionMark ||
      theFoundInsMarkIsFromThisUser;
    let thereIsADeletionAroundcursur = deletionMark && true;
    let userIsInInsertion = insertionMark && true;

    //let shouldContinueInsertionMark = (userHasInsertionMarkAtEndOdDeletionMark || userHasInsertionMarkAtStartOFDeletionMark) ||
    if (thereIsADeletionAroundcursur) {
      if (userIsContinuingItsOwnMarkAroundADeletion) {
        markInsertion(
          trTemp,
          newStep.from,
          mappedNewStepTo,
          user,
          date,
          group,
          insertionMarkID,
          deleteMarkId,
          insertionMarkAttrs
        );
      } else {
        insertionMarkID = uuidv4();

        markInsertion(
          trTemp,
          newStep.from,
          mappedNewStepTo,
          user,
          date,
          group,
          insertionMarkID,
          deleteMarkId,
          undefined
        );
      }
    } else {
      let insMarkBefore;
      let insMarkAfter;
      let nodeBefore =
        state.selection.$from.nodeBefore || state.selection.$to.nodeBefore;
      let nodeAfter =
        state.selection.$from.nodeAfter || state.selection.$to.nodeAfter;
      if (nodeBefore) {
        insMarkBefore = nodeBefore.marks.filter(
          (mark) => mark.type.name == insertionMarkFromSchema.name
        )[0];
      }
      if (nodeAfter) {
        insMarkAfter = nodeAfter.marks.filter(
          (mark) => mark.type.name == insertionMarkFromSchema.name
        )[0];
      }
      if (
        insMarkBefore &&
        insMarkBefore.attrs.id == lastContainingInsertionMark
      ) {
        insertionMarkAttrs = insMarkBefore.attrs;
      }
      if (
        insMarkAfter &&
        insMarkAfter.attrs.id == lastContainingInsertionMark
      ) {
        insertionMarkAttrs = insMarkAfter.attrs;
      }
      if (!lastContainingInsertionMark) {
        if (insMarkBefore && insMarkBefore.attrs.user == user.userId) {
          insertionMarkAttrs = insMarkBefore.attrs;
        }
        if (insMarkAfter && insMarkAfter.attrs.id == user.userId) {
          insertionMarkAttrs = insMarkAfter.attrs;
        }
      }
      markInsertion(
        trTemp,
        newStep.from,
        mappedNewStepTo,
        user,
        date,
        group,
        insertionMarkID,
        deleteMarkId,
        insertionMarkAttrs
      );
    }
    // We condense it down to a single replace step.
    const condensedStep = new ReplaceStep(
      newStep.from,
      newStep.to,
      trTemp.doc.slice(newStep.from, mappedNewStepTo)
    );

    newTr.step(condensedStep);
    const mirrorIndex = map.maps.length - 1;
    map.appendMap(condensedStep.getMap(), mirrorIndex);
    if (!newTr.selection.eq(trTemp.selection)) {
      newTr.setSelection(trTemp.selection);
    }
  }
  if (step.from !== step.to) {
    map.appendMap(
      markDeletion(
        newTr,
        step.from,
        step.to,
        user,
        date,
        group,
        deleteMarkId,
        insertionMarkID ? insertionMarkID : "",
        deletionMark ? deletionMark.attrs : undefined
      )
    );
  }
};

export default replaceStep;
