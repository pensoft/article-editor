import { MatDialog } from "@angular/material/dialog";
import { toggleMark } from "prosemirror-commands";
import { MenuItem, Dropdown } from "prosemirror-menu"
import { Fragment, NodeType } from "prosemirror-model"
import { EditorState, NodeSelection, Transaction } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { addAnnotation, annotationIcon } from "./comment";
import { schema } from "./schema";
import { AngularDialogComponent } from '../../angular-dialog/angular-dialog.component'
import { TableSizePickerComponent } from "../../table-size-picker/table-size-picker.component";
import { addColumnAfter, addColumnBefore, deleteColumn, addRowAfter, addRowBefore, deleteRow, mergeCells, splitCell, setCellAttr, toggleHeaderRow, toggleHeaderColumn, toggleHeaderCell, deleteTable } from "prosemirror-tables";

const alignLeftIcon = {
    width: 35, height: 35,
    path: "M19.502,5H0.167V0h19.334L19.502,5L19.502,5z M0.167,8.889v5H31.5v-5H0.167z M19.502,17.777H0.167v5h19.334L19.502,17.777   L19.502,17.777z M0.167,31.668H31.5v-5H0.167V31.668z"
}

const alignCenterIcon = {
    width: 35, height: 35,
    path: "M25.501,5H6.167V0h19.334V5z M0.168,8.889v5H31.5v-5H0.168z M6.167,17.777v5h19.334v-5H6.167z M0.168,31.668H31.5v-5H0.168   V31.668z"
}

const alignRightIcon = {
    width: 35, height: 35,
    path: "M31.501,0v5H12.167V0H31.501z M0.167,13.889h31.334v-5H0.167V13.889z M12.167,22.777h19.334v-5H12.167V22.777z    M0.167,31.668h31.334v-5H0.167V31.668z"
}

const superscriptIcon = {
    width: 18, height: 18,
    path: "M12.714 15.3a.972.972 0 0 1-.1 1.4.713.713 0 0 1-.6.3.908.908 0 0 1-.7-.3l-4.8-5.2-4.8 5.2a.908.908 0 0 1-.7.3.908.908 0 0 1-.7-.3 1.07 1.07 0 0 1-.1-1.4l4.9-5.3-4.8-5.3a.972.972 0 0 1 .1-1.4.972.972 0 0 1 1.4.1l4.8 5.2 4.8-5.2a1.07 1.07 0 0 1 1.4-.1 1.063 1.063 0 0 1 .1 1.4l-5 5.3zm5.3-13.8v3a.472.472 0 0 1-.5.5h-2a.472.472 0 0 1-.5-.5.472.472 0 0 1 .5-.5h1.5v-.5h-.5a.472.472 0 0 1-.5-.5.472.472 0 0 1 .5-.5h.5V2h-1.5a.472.472 0 0 1-.5-.5.472.472 0 0 1 .5-.5h2a.472.472 0 0 1 .5.5z"
}

const subscriptIcon = {
    width: 18, height: 18,
    path: "M12.714 13.255a.972.972 0 0 1-.1 1.4.713.713 0 0 1-.6.3.908.908 0 0 1-.7-.3l-4.8-5.2-4.8 5.2a.908.908 0 0 1-.7.3.908.908 0 0 1-.7-.3 1.07 1.07 0 0 1-.1-1.4l4.9-5.3-4.8-5.3a.972.972 0 0 1 .1-1.4.972.972 0 0 1 1.4.1l4.8 5.2 4.8-5.2a1.07 1.07 0 0 1 1.4-.1 1.063 1.063 0 0 1 .1 1.4l-5 5.3zm5.3.2v3a.472.472 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h1.5v-.5h-.5a.5.5 0 0 1 0-1h.5v-.5h-1.5a.5.5 0 0 1 0-1h2a.472.472 0 0 1 .5.5z"
}

const videoPlayerIcon = {
    width: 80, height: 53,
    path: "M57,6H1C0.448,6,0,6.447,0,7v44c0,0.553,0.448,1,1,1h56c0.552,0,1-0.447,1-1V7C58,6.447,57.552,6,57,6z M10,50H2v-9h8V50z   M10,39H2v-9h8V39z M10,28H2v-9h8V28z M10,17H2V8h8V17z M36.537,29.844l-11,7C25.374,36.947,25.187,37,25,37  c-0.166,0-0.331-0.041-0.481-0.123C24.199,36.701,24,36.365,24,36V22c0-0.365,0.199-0.701,0.519-0.877  c0.32-0.175,0.71-0.162,1.019,0.033l11,7C36.825,28.34,37,28.658,37,29S36.825,29.66,36.537,29.844z M56,50h-8v-9h8V50z M56,39h-8  v-9h8V39z M56,28h-8v-9h8V28z M56,17h-8V8h8V17z"
}

/* const mathIcon = {
    width: 600, height: 500,
    path: "M256,0C114.844,0,0,114.839,0,256s114.844,256,256,256s256-114.839,256-256S397.156,0,256,0z M350.629,368.442H150.238    c-9.219,0-16.699-7.475-16.699-16.699c0-9.225,7.48-16.699,16.699-16.699h200.391c9.219,0,16.699,7.475,16.699,16.699    C367.329,360.967,359.848,368.442,350.629,368.442z M365.426,214.252L226.265,306.56c-2.838,1.886-6.045,2.783-9.219,2.783    c-5.404,0-10.709-2.621-13.927-7.469c-5.099-7.686-3-18.047,4.686-23.146l118.177-78.392l-118.177-78.392    c-7.686-5.099-9.785-15.46-4.686-23.146c5.121-7.703,15.492-9.779,23.146-4.686l139.161,92.308    c4.664,3.093,7.469,8.317,7.469,13.916C372.895,205.934,370.09,211.159,365.426,214.252z"
} */

let sharedDialog: MatDialog

let cut = (arr: MenuItem<any>[]) => arr.filter(x => x)

function canInsert(state: EditorState, nodeType: NodeType) {
    let $from = state.selection.$from
    for (let d = $from.depth; d >= 0; d--) {
        let index = $from.index(d)
        if ($from.node(d).canReplaceWith(index, index, nodeType)) return true
    }
    return false
}

function insertVideo(state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) {
    if (dispatch) {
        let url
        let nodetype = state.schema.nodes.video;
        const dialogRef = sharedDialog.open(AngularDialogComponent, {
            width: '500px',
            data: { url: url, type: 'video' }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }
            url = result;
            let node = nodetype.create({ 'src': url })
            view?.dispatch(view.state.tr.replaceSelectionWith(node))
            view?.focus()
        });
    }
    return true
}

function insertTable(state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) {
    if (dispatch) {
        let rows, cols;
        const tableSizePickerDialog = sharedDialog.open(TableSizePickerComponent, {
            width: '275px',
            data: { rows: rows, cols: cols }
        });

        tableSizePickerDialog.afterClosed().subscribe(result => {
            const { rows, cols } = result;
            let singleRow = Fragment.fromArray(new Array(cols).fill(state.schema.nodes.table_cell.createAndFill(), 0, cols));
            let table = Fragment.fromArray(new Array(rows).fill(state.schema.nodes.table_row.create(undefined, singleRow), 0, rows));
            const tr = state.tr.replaceSelectionWith(state.schema.nodes.table.create(undefined, table));
            if (dispatch) { dispatch(tr); }
            return true;
        });
    }
}

function setAlignment(alignment: string) {
    return function (state: EditorState, dispatch?: (tr: Transaction) => boolean) {
        let sel = state.selection

        if (dispatch) {

            let tr1 = state.tr;
            state.tr.doc.nodesBetween(sel.from, sel.to, (node, pos, parent, index) => {
                if (node.attrs.align) {
                    /* console.log(node.attrs.align);
                    console.log(pos);
                    console.log(parent); */
                    tr1 = tr1.setNodeMarkup(pos, node.type, { 'align': alignment })
                }
            })

            dispatch(tr1);
        }
        return true
    }
}

// function setScript(type: string) {
//     return function (state: EditorState, dispatch?: (tr: Transaction) => boolean) {
//         let sel = state.selection
//         if (sel.empty) return true
//         if (dispatch) {
//             let tr = state.tr.addMark(sel.from, sel.to, state.schema.spec.marks.superscript)
//             dispatch(tr);
//         }
//         return true
//     }
// }

function addMathInline(mathType: string) {
    return function (state: EditorState, dispatch: any, view: EditorView) {
        let sel = state.selection
        if (dispatch) {
            if (sel.empty) {
                let mathExpresion;
                let { from, to } = state.selection
                let mathNode = state.schema.nodes[mathType]
                console.log('noselection');
                const dialogRef = sharedDialog.open(AngularDialogComponent, {
                    width: 'auto',
                    
                    data: { url: mathExpresion, type: 'mathinline' }
                });
                dialogRef.afterClosed().subscribe(result => {
                    console.log('The dialog was closed');
                    mathExpresion = result
                    let newmathNode = mathNode.create(undefined, state.schema.text(mathExpresion))
                    let tr = view.state.tr.replaceSelectionWith(newmathNode);
                    view.dispatch(tr)
                    if (mathType == 'math_display') {
                        view.dispatch(view.state.tr.setSelection(NodeSelection.create(tr.doc, from - 1)));
                    }
                });
            } else {
                console.log('selection');
            }
        }
        return true
    }
}

export const mathInlineItem = new MenuItem({
    title: 'Add mathematic expresions to the document',
    label: 'InlineMath',
    // @ts-ignore
    run: addMathInline('math_inline'),
    enable(state) { return state.tr.selection.empty }
})

export const mathBlockItem = new MenuItem({
    title: 'Add mathematic expresions to the document',
    label: 'BlockMath',
    // @ts-ignore
    run: addMathInline('math_display'),
    enable(state) {return state.tr.selection.empty }
})

export const superscriptItem = new MenuItem({
    title: 'Transform selection to superscript',
    // @ts-ignore
    run: toggleMark(schema.marks.superscript),
    enable(state) { return !state.selection.empty },
    icon: superscriptIcon
})

export const subscriptItem = new MenuItem({
    title: 'Transform selection to subscript',
    // @ts-ignore
    run: toggleMark(schema.marks.subscript),
    enable(state) { return !state.selection.empty },
    icon: subscriptIcon
})

export const setAlignLeft = new MenuItem({
    title: 'Align element to left',
    // @ts-ignore
    run: setAlignment('set-align-left'),
    enable(state) { return true },
    select: (state) => { return setAlignment('set-align-left')(state) },
    icon: alignLeftIcon
})

export const setAlignCenter = new MenuItem({
    title: 'Align element to center',
    // @ts-ignore
    run: setAlignment('set-align-center'),
    enable(state) { return true },
    select: (state) => { return setAlignment('set-align-left')(state) },
    icon: alignCenterIcon
})

export const setAlignRight = new MenuItem({
    title: 'Align element to right',
    // @ts-ignore
    run: setAlignment('set-align-right'),
    enable(state) { return true },
    select: (state) => { return setAlignment('set-align-right')(state) },
    icon: alignRightIcon
})

export const insertVideoItem = new MenuItem({
    title: 'Add video element',
    // @ts-ignore
    run: insertVideo,
    enable(state) { return canInsert(state, state.schema.nodes.video) },
    icon: videoPlayerIcon
})

const annotationMenuItem = new MenuItem({
    title: 'Add an annotation',
    // @ts-ignore
    run: addAnnotation,
    enable(state) { return !state.selection.empty },
    select: state => addAnnotation(state),
    icon: annotationIcon
});

let tableMenu = [
    //@ts-ignore
    new MenuItem({ label: "Insert table", run: insertTable }),
    new MenuItem({ label: "Insert column before", enable: addColumnBefore, run: addColumnBefore }),
    new MenuItem({ label: "Insert column after", enable: addColumnAfter, run: addColumnAfter }),
    new MenuItem({ label: "Delete column", enable: deleteColumn, run: deleteColumn }),
    new MenuItem({ label: "Insert row before", enable: addRowBefore, run: addRowBefore }),
    new MenuItem({ label: "Insert row after", enable: addRowAfter, run: addRowAfter }),
    new MenuItem({ label: "Delete row", enable: deleteRow, run: deleteRow }),
    new MenuItem({ label: "Delete table", enable: deleteTable, run: deleteTable }),
    new MenuItem({ label: "Merge cells", enable: mergeCells, run: mergeCells }),
    new MenuItem({ label: "Split cell", enable: splitCell, run: splitCell }),
    new MenuItem({ label: "Toggle header column", enable: toggleHeaderColumn, run: toggleHeaderColumn }),
    new MenuItem({ label: "Toggle header row", enable: toggleHeaderRow, run: toggleHeaderRow }),
    new MenuItem({ label: "Toggle header cells", enable: toggleHeaderCell, run: toggleHeaderCell }),
    new MenuItem({ label: "Make cell green", enable: setCellAttr("background", "#dfd"), run: setCellAttr("background", "#dfd") }),
    new MenuItem({ label: "Make cell not-green", enable: setCellAttr("background", null), run: setCellAttr("background", null) }),
];

export function attachMenuItems(menu: any) {
    menu.fullMenu[0].push(annotationMenuItem);
    menu.fullMenu[4] = []
    menu.fullMenu[4].push(setAlignLeft);
    menu.fullMenu[4].push(setAlignCenter);
    menu.fullMenu[4].push(setAlignRight);
    menu.fullMenu[5] = []
    menu.fullMenu[5].push(superscriptItem);
    menu.fullMenu[5].push(subscriptItem);
    menu.fullMenu[6] = []
    menu.fullMenu[6].push(insertVideoItem);
    menu.fullMenu[6].push(new Dropdown(cut([mathInlineItem, mathBlockItem]), { label: "Math" }));
    menu.fullMenu[7] = [];
    menu.fullMenu[7].push(new Dropdown(tableMenu, { label: "Table", title: "Table" }));
}

export function shereDialog(dialog: MatDialog) {
    sharedDialog = dialog
}
