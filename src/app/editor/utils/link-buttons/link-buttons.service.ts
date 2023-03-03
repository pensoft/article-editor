import { Injectable } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { AddTableDialogComponent } from '@app/editor/dialogs/citable-tables-dialog/add-table-dialog/add-table-dialog.component';
import { AddEndNoteComponent } from '@app/editor/dialogs/end-notes/add-end-note/add-end-note.component';
import { AddFigureDialogV2Component } from '@app/editor/dialogs/figures-dialog/add-figure-dialog-v2/add-figure-dialog-v2.component';
import { AddSupplementaryFileComponent } from '@app/editor/dialogs/supplementary-files/add-supplementary-file/add-supplementary-file.component';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { Node } from 'prosemirror-model';
import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { createCustomIcon } from '../menu/common-methods';

@Injectable({
  providedIn: 'root',
})
export class LinkButtonsService {
  linkButtonsPluginKey = new PluginKey('linkButtonsPlugin');
  linkButtonsPlugin: Plugin;

  blockNodesNames = [];

  buttonsContainer: HTMLDivElement;
  editButton: HTMLButtonElement;
  unlinkButton: HTMLButtonElement;

  linkButtonsClasses = ['edit-link-button', 'unlink-button'];

  constructor(private serviceShare: ServiceShare) {
    console.log('constructor');

    this.createButtons();
    this.linkButtonsPlugin = new Plugin({
      key: this.linkButtonsPluginKey,
      state: {
        init: (config: any, editorState: EditorState) => {
          return { sectionName: config.sectionName };
        },
        apply: (transaction: Transaction, value, _, newState) => {
          return value;
        },
      },
      props: {
        handleDOMEvents: {
          blur: (view, event) => {
            if (
              event.relatedTarget &&
              event.relatedTarget instanceof HTMLButtonElement &&
              this.linkButtonsClasses.includes(event.relatedTarget.className)
            ) {
              console.log('tuk');

              event.relatedTarget.click();
            }
          },
        },
        decorations: (state: EditorState) => {
          const pluginState = this.linkButtonsPluginKey.getState(state);
          const focusedEditor = serviceShare.DetectFocusService.sectionName;
          const currentEditor = pluginState.sectionName;
          const { from, to, $from } = state.selection;

          if (from != to || currentEditor != focusedEditor) {
            return DecorationSet.empty;
          }

          const nodeWithLinkMark = $from
            .marks()
            .find((mark) => mark.type.name == 'link');

          if (!nodeWithLinkMark) {
            return DecorationSet.empty;
          }

          this.buttonsContainer = document.createElement('div');
          this.buttonsContainer.className = 'link-edit-buttons';
          this.buttonsContainer.append(this.editButton, this.unlinkButton);

          const view =
            serviceShare.ProsemirrorEditorsService.editorContainers[
              currentEditor
            ].editorView;
          const coordsInCursorPos = view.coordsAtPos(from);
          const editorViewRectangle = view.dom.getBoundingClientRect();
          const top = coordsInCursorPos.top - editorViewRectangle.top;
          const left = editorViewRectangle.width;
          this.buttonsContainer.setAttribute(
            'style',
            `position:absolute;
             pointer-events:all;
             top:${top}px;
             left:${left}px;`
          );
          this.buttonsContainer.setAttribute('tabindex', '-1');

          return DecorationSet.create(state.doc, [
            Decoration.widget(0, () => {
              return this.buttonsContainer;
            }),
          ]);
        },
      },
    });
  }

  createButtons() {
    this.editButton = document.createElement('button');
    this.editButton.className = 'edit-link-button';
    this.editButton.setAttribute('tabindex', '-1');
    this.editButton.style.cursor = 'pointer';
    this.editButton.title = 'Edit link.';
    const editImg = createCustomIcon('edit-green.svg', 12, 12, 0, 1.5, 1.3);
    editImg.dom.className = 'edit-citable-item-img';
    editImg.dom.style.pointerEvents = 'all';
    editImg.dom.style.cursor = 'pointer';
    this.editButton.append(editImg.dom);
    this.editButton.append(editImg.dom);

    this.unlinkButton = document.createElement('button');
    this.unlinkButton.className = 'unlink-button';
    this.unlinkButton.setAttribute('tabindex', '-1');
    this.unlinkButton.style.cursor = 'pointer';
    this.unlinkButton.title = 'Unlink.';
    const unlinkImg = createCustomIcon('anchortag.svg', 12, 12, 0, 1.5, 1.3);
    unlinkImg.dom.className = 'edit-citable-item-img';
    unlinkImg.dom.style.pointerEvents = 'all';
    unlinkImg.dom.style.cursor = 'pointer';
    this.unlinkButton.append(unlinkImg.dom);
  }
}
