import { FnParam } from "@angular/compiler/src/output/output_ast";
import { uuidv4 } from "lib0/random";
import { toggleMark } from "prosemirror-commands";
import { MenuItem } from "prosemirror-menu";
import { Plugin,EditorState, PluginKey, Transaction } from "prosemirror-state";
//@ts-ignore
import { minBy, maxBy, last } from 'lodash';
//@ts-ignore
import { DocumentHelpers } from 'wax-prosemirror-utilities';
import { Decoration, DecorationSet } from "prosemirror-view";



const createComment = (state:EditorState, dispatch:any) => {
    const {
        selection: { $from, $to },
        tr,
    } = state;


    toggleMark(state.schema.marks.comment, {
        id: uuidv4()
    })(state, dispatch);

    return true
};

const isCommentAllowed = (state:EditorState):boolean => {
    const commentMark = state.schema.marks.comment;
    const mark = DocumentHelpers.findMark(state, commentMark, true);

    let allowed = true;
    if(state.selection.empty){
        allowed = false;
    }
    state.doc.nodesBetween(
        state.selection.$from.pos,
        state.selection.$to.pos,
        (node, from) => {
            if (
                node.type.name === 'math_display' ||
                node.type.name === 'math_inline' ||
                node.type.name === 'image'
            ) {
                allowed = false;
            }
        },
    );

    // TODO Overlapping comments . for now don't allow
    if (mark.length >= 1) allowed = false;
    return allowed;
};

//comments mark 



export const addCommentIcon = {
    width: 1024, height: 1024,
    path: "M512 219q-116 0-218 39t-161 107-59 145q0 64 40 122t115 100l49 28-15 54q-13 52-40 98 86-36 157-97l24-21 32 3q39 4 74 4 116 0 218-39t161-107 59-145-59-145-161-107-218-39zM1024 512q0 99-68 183t-186 133-257 48q-40 0-82-4-113 100-262 138-28 8-65 12h-2q-8 0-15-6t-9-15v-0q-1-2-0-6t1-5 2-5l3-5t4-4 4-5q4-4 17-19t19-21 17-22 18-29 15-33 14-43q-89-50-141-125t-51-160q0-99 68-183t186-133 257-48 257 48 186 133 68 183z"
}

export const addCommentMenuItem = new MenuItem({
    title: 'Add an annotation',
    // @ts-ignore
    run: createComment,
    enable(state) { return isCommentAllowed(state) },
    icon: addCommentIcon
});







