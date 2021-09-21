//@ts-ignore
import { DocumentHelpers } from 'wax-prosemirror-utilities';
//@ts-ignore
import { TextField, openPrompt } from "./prosemirror-example-setup-master/src/prompt"
import { MatDialog } from "@angular/material/dialog";
import { toggleMark } from "prosemirror-commands";
import { MenuItem } from "prosemirror-menu"
import { Fragment, MarkType, NodeType } from "prosemirror-model"
import { EditorState, NodeSelection, Transaction } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { schema } from "./schema";
import { TableSizePickerComponent } from "./table-size-picker/table-size-picker.component";
import { addColumnAfter, addColumnBefore, deleteColumn, addRowAfter, addRowBefore, deleteRow, mergeCells, splitCell, setCellAttr, toggleHeaderRow, toggleHeaderColumn, toggleHeaderCell, deleteTable } from "prosemirror-tables";
import { uuidv4 } from "lib0/random";
import { icons } from 'prosemirror-menu'
import { wrapItem, blockTypeItem, selectParentNodeItem as selectParentNodeItemPM, undoItem as undoPM, redoItem as redoPM } from "prosemirror-menu"
import { YMap } from "yjs/dist/src/internals";
import { AddCommentDialogComponent } from "../add-comment-dialog/add-comment-dialog.component";
import { AddLinkDialogComponent } from "../add-link-dialog/add-link-dialog.component";
import { wrapInList } from "prosemirror-schema-list";

import * as Y from 'yjs'
import { Subject } from 'rxjs';

const alignLeftIcon = {
    width: 35, height: 35,
    path: "M19.502,5H0.167V0h19.334L19.502,5L19.502,5z M0.167,8.889v5H31.5v-5H0.167z M19.502,17.777H0.167v5h19.334L19.502,17.777   L19.502,17.777z M0.167,31.668H31.5v-5H0.167V31.668z"
}

const alignRightIcon = {
    width: 35, height: 35,
    path: "M31.501,0v5H12.167V0H31.501z M0.167,13.889h31.334v-5H0.167V13.889z M12.167,22.777h19.334v-5H12.167V22.777z    M0.167,31.668h31.334v-5H0.167V31.668z"
}

const videoPlayerIcon = {
    width: 80, height: 53,
    path: "M57,6H1C0.448,6,0,6.447,0,7v44c0,0.553,0.448,1,1,1h56c0.552,0,1-0.447,1-1V7C58,6.447,57.552,6,57,6z M10,50H2v-9h8V50z   M10,39H2v-9h8V39z M10,28H2v-9h8V28z M10,17H2V8h8V17z M36.537,29.844l-11,7C25.374,36.947,25.187,37,25,37  c-0.166,0-0.331-0.041-0.481-0.123C24.199,36.701,24,36.365,24,36V22c0-0.365,0.199-0.701,0.519-0.877  c0.32-0.175,0.71-0.162,1.019,0.033l11,7C36.825,28.34,37,28.658,37,29S36.825,29.66,36.537,29.844z M56,50h-8v-9h8V50z M56,39h-8  v-9h8V39z M56,28h-8v-9h8V28z M56,17h-8V8h8V17z"
}

const addCommentIcon = {
    width: 1024, height: 1024,
    path: "M512 219q-116 0-218 39t-161 107-59 145q0 64 40 122t115 100l49 28-15 54q-13 52-40 98 86-36 157-97l24-21 32 3q39 4 74 4 116 0 218-39t161-107 59-145-59-145-161-107-218-39zM1024 512q0 99-68 183t-186 133-257 48q-40 0-82-4-113 100-262 138-28 8-65 12h-2q-8 0-15-6t-9-15v-0q-1-2-0-6t1-5 2-5l3-5t4-4 4-5q4-4 17-19t19-21 17-22 18-29 15-33 14-43q-89-50-141-125t-51-160q0-99 68-183t186-133 257-48 257 48 186 133 68 183z"
}

let sharedDialog: MatDialog

export const cut = (arr: MenuItem<any>[]) => arr.filter(x => x)

function insertImageItem(nodeType: NodeType) {
    return new MenuItem({
        title: "Insert image",
        label: "Image",
        enable(state) { return canInsert(state, nodeType) },
        run(state, _, view) {
            let { from, to } = state.selection, attrs = null
            if (state.selection instanceof NodeSelection && state.selection.node.type == nodeType)
                attrs = state.selection.node.attrs
            openPrompt({
                title: "Insert image",
                fields: {
                    src: new TextField({ label: "Location", required: true, value: attrs && attrs.src }),
                    title: new TextField({ label: "Title", value: attrs && attrs.title }),
                    alt: new TextField({
                        label: "Description",
                        value: attrs ? attrs.alt : state.doc.textBetween(from, to, " ")
                    })
                },
                callback(attrs: any) {
                    view.dispatch(view.state.tr.replaceSelectionWith(nodeType.createAndFill(attrs)!))
                    view.focus()
                }
            })
        }
    })
}

function markItem(markType: MarkType, options: any) {
    let passedOptions: any = {
        active(state: EditorState) { return markActive(state, markType) },
        enable: true
    }
    for (let prop in options) passedOptions[prop] = options[prop]
    return cmdItem(toggleMark(markType), passedOptions)
}

function wrapListItem(nodeType: NodeType, options: any) {
    return cmdItem(wrapInList(nodeType, options.attrs), options)
}

function cmdItem(cmd: any, options: any) {
    let passedOptions: any = {
        label: options.title,
        run: cmd
    }
    for (let prop in options) passedOptions[prop] = options[prop]
    if ((!options.enable || options.enable === true) && !options.select)
        passedOptions[options.enable ? "enable" : "select"] = (state: EditorState) => cmd(state)

    return new MenuItem(passedOptions)
}

function markActive(state: EditorState, type: MarkType) {
    let { from, $from, to, empty } = state.selection
    if (empty) return type.isInSet(state.storedMarks || $from.marks()) ? true : false
    else return state.doc.rangeHasMark(from, to, type)
}

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
        const dialogRef = sharedDialog.open(AddCommentDialogComponent, {
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

                    tr1 = tr1.setNodeMarkup(pos, node.type, { 'align': alignment })
                }
            })

            dispatch(tr1);
        }
        return true
    }
}

function addMathInline(mathType: string) {
    return function (state: EditorState, dispatch: any, view: EditorView) {
        let sel = state.selection
        if (dispatch) {
            if (sel.empty) {
                let mathExpresion;
                let { from, to } = state.selection
                let mathNode = state.schema.nodes[mathType]
                const dialogRef = sharedDialog.open(AddCommentDialogComponent, {
                    width: 'auto',

                    data: { url: mathExpresion, type: 'mathinline' }
                });
                dialogRef.afterClosed().subscribe(result => {
                    mathExpresion = result
                    let newmathNode = mathNode.create(undefined, state.schema.text(mathExpresion))
                    let tr = view.state.tr.replaceSelectionWith(newmathNode);
                    view.dispatch(tr)
                    if (mathType == 'math_display') {
                        view.dispatch(view.state.tr.setSelection(NodeSelection.create(tr.doc, from - 1)));
                    }
                });
            } else {
            }
        }
        return true
    }
}

const createComment = (commentsMap: YMap<any>,addCommentSubject:Subject<any>,sectionId:string) => {
    return (state: EditorState, dispatch: any) => {
        addCommentSubject.next({type:'commentData',sectionId,showBox:true})
        /*const {
            selection: { $from, $to },
            tr,
        } = state;
        let commentId = uuidv4()
        let commentContent
         const dialogRef = sharedDialog.open(AddCommentDialogComponent, {
            width: 'auto',

            data: { url: commentContent, type: 'comment' }
        });
        dialogRef.afterClosed().subscribe(result => {
            commentContent = result
            let userCommentId = uuidv4()
            let userComment = {
                id: userCommentId,
                comment: commentContent
            }
            if (result) {
                commentsMap.set(commentId, [userComment]);
                toggleMark(state.schema.marks.comment, {
                    id: commentId
                })(state, dispatch);
            }
        }); */


        return true
    };
}

export const isCommentAllowed = (state: EditorState): boolean => {
    const commentMark = state.schema.marks.comment;
    const mark = DocumentHelpers.findMark(state, commentMark, true);

    let allowed = true;
    if (state.selection.empty) {
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

const addLink = (state: EditorState, dispatch: any) => {
    const {
        selection: { $from, $to },
        tr,
    } = state;
    let url
    let text
    const dialogRef = sharedDialog.open(AddLinkDialogComponent, {
        width: 'auto',

        data: { url: url, text: text }
    });
    dialogRef.afterClosed().subscribe(result => {

        console.log("result", result);
        if (result) {
            let { from, to } = state.selection

            let mark = state.schema.marks.link.create({ href: result.url, title: result.text })
            let newtextNode = state.schema.text(result.text, [mark])
            console.log('newtextNode', newtextNode);
            let tr = state.tr.replaceRangeWith(from, to, newtextNode);
            dispatch(tr)
            toggleMark(state.schema.marks.linkM,)

        }
    })
}

const addMathInlineMenuItem = new MenuItem({
    title: 'Add mathematic expresions to the document',
    label: 'InlineMath',
    // @ts-ignore
    run: addMathInline('math_inline'),
    enable(state) { return state.tr.selection.empty }
})

const addMathBlockMenuItem = new MenuItem({
    title: 'Add mathematic expresions to the document',
    label: 'BlockMath',
    // @ts-ignore
    run: addMathInline('math_display'),
    enable(state) { return state.tr.selection.empty }
})

const toggleStrong = markItem(schema.marks.strong, { title: "Toggle strong style", icon: createCustomIcon('Text2.svg') })

const toggleEm = markItem(schema.marks.em, { title: "Toggle emphasis", icon: createCustomIcon('italic.svg') })

const toggleCode = markItem(schema.marks.code, { title: "Toggle code font", icon: icons.code })


const insertImage = insertImageItem(schema.nodes.image)

const wrapBulletList = wrapListItem(schema.nodes.bullet_list, {
    title: "Wrap in bullet list",
    icon: createCustomIcon('bullets.svg', 18, 18)
})

const wrapOrderedList = wrapListItem(schema.nodes.ordered_list, {
    title: "Wrap in ordered list",
    icon: createCustomIcon('numbering.svg')
})

const wrapBlockQuote = wrapItem(schema.nodes.blockquote, {
    title: "Wrap in block quote",
    icon: icons.blockquote
})

const makeParagraph = blockTypeItem(schema.nodes.paragraph, {
    title: "Change to paragraph",
    label: "Plain"
})

const makeCodeBlock = blockTypeItem(schema.nodes.code_block, {
    title: "Change to code block",
    label: "Code"
})
let headingsObj: any = {}
for (let i = 1; i <= 10; i++)
    headingsObj["makeHead" + i] = blockTypeItem(schema.nodes.heading, {
        title: "Change to heading " + i,
        label: "Level " + i,
        attrs: { level: i }
    })
const headings = headingsObj

const insertHorizontalRule = new MenuItem({
    title: "Insert horizontal rule",
    label: "Horizontal rule",
    enable(state) { return canInsert(state, schema.nodes.horizontal_rule) },
    run(state, dispatch) { dispatch(state.tr.replaceSelectionWith(schema.nodes.horizontal_rule.create())) }
})

const undoItem = undoPM
const redoItem = redoPM

const toggleSuperscriptItem = markItem(schema.marks.superscript, { title: 'Toggle superscript', icon: createCustomIcon('superscript.svg') })

const toggleSubscriptItem = markItem(schema.marks.subscript, { title: 'Toggle subscript', icon: createCustomIcon('subscript.svg') })

const insertLink = new MenuItem({
    title: 'Insert a link',
    // @ts-ignore
    run: addLink,
    enable(state) { return true },
    icon: createCustomIcon('connect.svg')
})

const setAlignLeft = new MenuItem({
    title: 'Align element to left',
    // @ts-ignore
    run: setAlignment('set-align-left'),
    enable(state) { return true },
    select: (state) => { return setAlignment('set-align-left')(state) },
    icon: alignLeftIcon
})

const setAlignCenter = new MenuItem({
    title: 'Align element to center',
    // @ts-ignore
    run: setAlignment('set-align-center'),
    enable(state) { return true },
    select: (state) => { return setAlignment('set-align-left')(state) },
    icon: createCustomIcon('align.svg')
})
const setAlignRight = new MenuItem({
    title: 'Align element to right',
    // @ts-ignore
    run: setAlignment('set-align-right'),
    enable(state) { return true },
    select: (state) => { return setAlignment('set-align-right')(state) },
    icon: alignRightIcon
})

const insertVideoItem = new MenuItem({
    title: 'Add video element',
    // @ts-ignore
    run: insertVideo,
    enable(state) { return canInsert(state, state.schema.nodes.video) },
    icon: videoPlayerIcon
})

const addCommentMenuItem = (ydoc: Y.Doc,addCommentSubject:Subject<any>,sectionId:string) => {
    let commentsMap = ydoc.getMap('comments')
    return new MenuItem({
        title: 'Add an annotation',
        // @ts-ignore
        run: createComment(commentsMap,addCommentSubject,sectionId),
        enable(state:EditorState) { 
            /* let {from,to,empty} = state.selection ;
            let text = state.doc.textBetween(from,to)
            if(!empty&&from!==to){
                addCommentSubject.next({type:'commentAllownes',sectionId,allow:true,text})
            }else{
                addCommentSubject.next({type:'commentAllownes',sectionId,allow:false,text})
            } */
            return isCommentAllowed(state)
        },
        icon: addCommentIcon
    });
}

const tableMenu = [
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


export function shereDialog(dialog: MatDialog) {
    sharedDialog = dialog
}

let exportsObj: { [key: string]: MenuItem | any } = {
    'addMathInlineMenuItem': addMathInlineMenuItem,
    'addMathBlockMenuItem': addMathBlockMenuItem,
    'toggleStrong': toggleStrong,
    'toggleEm': toggleEm,
    'toggleCode': toggleCode,
    'insertImage': insertImage,
    'wrapBulletList': wrapBulletList,
    'wrapOrderedList': wrapOrderedList,
    'wrapBlockQuote': wrapBlockQuote,
    'makeParagraph': makeParagraph,
    'makeCodeBlock': makeCodeBlock,
    'headings': headings,
    'insertHorizontalRule': insertHorizontalRule,
    'undoItem': undoItem,
    'redoItem': redoItem,
    'toggleSuperscriptItem': toggleSuperscriptItem,
    'toggleSubscriptItem': toggleSubscriptItem,
    'insertLink': insertLink,
    'setAlignLeft': setAlignLeft,
    'setAlignCenter': setAlignCenter,
    'setAlignRight': setAlignRight,
    'insertVideoItem': insertVideoItem,
    'addCommentMenuItem': addCommentMenuItem,
    'selectParentNodeItem': selectParentNodeItemPM,
    'tableMenu': tableMenu,
    'alignMenu': [setAlignLeft, setAlignCenter, setAlignRight]
}

export const getItems = () => {
    return exportsObj
}

function createCustomIcon(name: string, width?: number, height?: number) {
    width = width || 15;
    height = height || 15;
    let icon = document.createElement('img');
    icon.setAttribute('src', `./assets/icons/${name}`);
    icon.setAttribute('width', width.toString());
    return {
        width: width, height: height,
        dom: icon
    }
}
