import { uuidv4 } from "lib0/random";
import { Fragment, Slice } from "prosemirror-model";
import { EditorState, Transaction } from "prosemirror-state";
import { ReplaceStep } from "prosemirror-transform";

export function changeNodesOnDragDrop(transactions: Transaction[], oldState: EditorState, newState: EditorState) {
  let moovingANodeWithUUID = false;
  let stepsIndexes: { from: number, to: number }[] = [];

  transactions.forEach((transaction) => {
    //@ts-ignore
    let meta = transaction.meta
    if (Object.keys(meta).includes("uiEvent")) {
      if (meta["uiEvent"] == 'drop') {
        if(transaction.steps.length == 1){
          // its drag with copy so we should change the ids
          // find the step that is with the ne content
          let step = transaction.steps[0]
          if (step instanceof ReplaceStep) {
            let s = step as any;
            let fr = (s.slice as Slice).content as Fragment
            fr.nodesBetween(0, fr.size, (node, start, parent, i) => {
              if (node.type.name == 'reference_citation') {
                moovingANodeWithUUID = true
                //@ts-ignore
                stepsIndexes.push({ from: step.from, to: step.from+fr.size })
              }
              if (node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0) {
                moovingANodeWithUUID = true
                //@ts-ignore
                stepsIndexes.push({ from: step.from, to: step.from+fr.size })
              }
            })
          }
        }else if(transaction.steps.length == 2){
          // its only drag so we does not have to do anything
        }
      }
    }
  })
  let tr = newState.tr;
  let changed = false;
  stepsIndexes.forEach((range)=>{
    let fr = range.from;
    let to = range.to;
    newState.doc.nodesBetween(fr,to,(node,pos,parent,i)=>{
      if (node.type.name == 'reference_citation') {
        console.log(node,pos);
        let oldAttrs = JSON.parse(JSON.stringify(node.attrs))
        oldAttrs.refCitationID = uuidv4();
        tr = tr.setNodeMarkup(pos,node.type,oldAttrs)
        changed = true
      }
      if (node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0) {
        let citationMark = node.marks.filter((mark) => { return mark.type.name == 'citation' })[0]
        console.log(node,pos);
        let newMark = newState.schema.mark('citation', { ...citationMark.attrs,citateid:uuidv4() })
        tr = tr.addMark(pos, pos + node.nodeSize, newMark).setMeta('addToLastHistoryGroup', true)
        changed = true
      }
    })
  })
  return changed?tr:undefined
}
