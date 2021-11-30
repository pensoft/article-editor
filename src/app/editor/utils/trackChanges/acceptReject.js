import { Mark, Slice } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
//@ts-ignore
import removeNode from './track-changes/helpers/removeNode.js';
import { AddMarkStep, Mapping, RemoveMarkStep, ReplaceStep } from 'prosemirror-transform';


const checkFromConfig = (mark, user, config) => {
  /* if (mark.attrs.username === user.username && !config.own.accept) {
    return false;
  }

  if (mark.attrs.username !== user.username && !config.others.accept) {
    return false;
  } */

  return true;
};

export function acceptChange(view,position/* user:any,config:any */){
  try{

    const {
      tr,
    } = view.state;

    const {
      from,to
    } = position

    tr.setMeta('AcceptReject', true);
    const map = view.state.tr.mapping;
    view?.state?.doc.nodesBetween(from, to, (node, pos) => {
      if (
        node.attrs.track &&
        node.attrs.track.find((track) => track.type === 'deletion')
      ) {
        removeNode(tr, node, pos, map);
      }
      if (
        node.marks &&
        node.marks.find(mark => {return mark.type.name === 'deletion'||mark.type.name === 'delFromPopup'})
      ) {
        const deletionMark = node.marks.find(
          mark => mark.type.name === 'deletion'||mark.type.name === 'delFromPopup',
        );

        /* const configCheck = checkFromConfig(deletionMark!, user, config);
        if (!configCheck) return; */

        const deletionStep = new ReplaceStep(
          map.map(Math.max(pos, from)),
          map.map(Math.min(pos + node.nodeSize, to)),
          Slice.empty,
        );
        tr.step(deletionStep);
        map.appendMap(deletionStep.getMap());
      } else if (
        node.attrs.track &&
        node.attrs.track.find((track) => track.type === 'insertion')
      ) {
        const track = node.attrs.track.filter(
          (track) => track.type !== 'insertion',
        );
        tr.setNodeMarkup(
          map.map(pos),
          undefined,
          Object.assign(node.attrs, { track }),
          node.marks,
        );
      } else if (
        node.marks &&
        node.marks.find(mark => mark.type.name === 'insertion'||mark.type.name === 'insFromPopup')
      ) {
        const insertionMark = node.marks.find(
          mark => mark.type.name === 'insertion'||mark.type.name === 'insFromPopup',
        );
        /* const configCheck = checkFromConfig(insertionMark!, user, config);
        if (!configCheck) return; */
        tr.step(

          new RemoveMarkStep(
            map.map(Math.max(pos, from)),
            map.map(Math.min(pos + node.nodeSize, to)),
            insertionMark,
          ),
        );
      } else if (
        node.marks &&
        node.marks.find(mark => mark.type.name === 'format_change')
      ) {
        const formatChangeMark = node.marks.find(
          mark => mark.type.name === 'format_change',
        );
        /* const configCheck = checkFromConfig(
          formatChangeMark!,
          user,
          config,
        ); 
        if (!configCheck) return;*/
        tr.step(
          new RemoveMarkStep(
            map.map(Math.max(pos, from)),
            map.map(Math.min(pos + node.nodeSize, to)),
            formatChangeMark,
          ),
        );
      } else if (
        node.attrs.track &&
        node.attrs.track.find((track) => track.type === 'block_change')
      ) {
        const blockChangeTrack = node.attrs.track.find(
          (track) => track.type === 'block_change',
        );

        const track = node.attrs.track.filter(
          (track) => track !== blockChangeTrack,
        );

        tr.setNodeMarkup(
          map.map(pos),
          undefined,
          {
            class: node.attrs.class,
            track: [],
          },
          // Object.assign(node.attrs.track, { track }),
          node.marks,
        );
      }
    });
    if (tr.steps.length) {
      view?.dispatch(tr)
    };
  }catch(e){
    console.error(e)
  }
  }

  export function   rejectChange(view,position/* ,user:any,config:any */){
    try{

      const {
        tr,
      } = view.state;
  
      const {
        from,to
      } = position
  
      tr.setMeta('AcceptReject', true);
      const map = new Mapping();
  
      view?.state.doc.nodesBetween(from, to, (node, pos) => {
        if (
          node.marks &&
          node.marks.find(mark => mark.type.name === 'deletion'||mark.type.name === 'delFromPopup')
        ) {
          const deletionMark = node.marks.find(
            mark => mark.type.name === 'deletion'||mark.type.name === 'delFromPopup',
          );
          /* const configCheck = checkFromConfig(deletionMark!, user, config);
          if (!configCheck) return; */
  
          tr.step(
            new RemoveMarkStep(
              map.map(Math.max(pos, from)),
              map.map(Math.min(pos + node.nodeSize, to)),
              deletionMark,
            ),
          );
        } else if (
          node.attrs.track &&
          node.attrs.track.find((track) => track.type === 'insertion'||mark.type.name === 'insFromPopup')
        ) {
          removeNode(tr, node, pos, map);
        } else if (
          node.marks &&
          node.marks.find(mark => mark.type.name === 'insertion'||mark.type.name === 'insFromPopup')
        ) {
          const insertionMark = node.marks.find(
            mark => mark.type.name === 'insertion'||mark.type.name === 'insFromPopup',
          );
  
          /* const configCheck = checkFromConfig(insertionMark!, user, config);
          if (!configCheck) return; */
  
          const deletionStep = new ReplaceStep(
            map.map(Math.max(pos, from)),
            map.map(Math.min(pos + node.nodeSize, to)),
            Slice.empty,
          );
          tr.step(deletionStep);
          map.appendMap(deletionStep.getMap());
        } else if (
          node.marks &&
          node.marks.find(mark => mark.type.name === 'format_change')
        ) {
          const formatChangeMark = node.marks.find(
            mark => mark.type.name === 'format_change',
          );
          formatChangeMark?.attrs.before.forEach((oldMark) => {
            tr.step(
              new AddMarkStep(
                map.map(Math.max(pos, from)),
                map.map(Math.min(pos + node.nodeSize, to)),
                view?.state.schema.marks[oldMark].create(),
              ),
            );
          });
          formatChangeMark?.attrs.after.forEach((newMark) => {
            tr.step(
              new RemoveMarkStep(
                map.map(Math.max(pos, from)),
                map.map(Math.min(pos + node.nodeSize, to)),
                node.marks.find(mark => mark.type.name === newMark),
              ),
            );
          });
  
          tr.step(
            new RemoveMarkStep(
              map.map(Math.max(pos, from)),
              map.map(Math.min(pos + node.nodeSize, to)),
              formatChangeMark,
            ),
          );
        } else if (!node.isInline && node.attrs.track) {
          const blockChangeTrack = node.attrs.track.find(
            (track) => track.type === 'block_change',
          );
          if (blockChangeTrack) {
            const track = node.attrs.track.filter(
              (track) => track !== blockChangeTrack,
            );
            tr.setNodeMarkup(
              map.map(pos),
              view?.state.schema.nodes[blockChangeTrack.before.type],
              Object.assign({}, node.attrs, blockChangeTrack.before.attrs, {
                track,
              }),
              node.marks,
            );
          }
        }
      });
      if (tr.steps.length) view?.dispatch(tr);
    }catch(e){
      console.error(e)
    }
  }