import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

export interface editorContainer {
    name: string;
    containerDiv: HTMLDivElement;
    editorState: EditorState;
    editorView: EditorView;
    dispatchTransaction: (transaction: Transaction) => void;
  }