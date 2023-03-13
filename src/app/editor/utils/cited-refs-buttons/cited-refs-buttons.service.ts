import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

import { RefsInArticleCiteDialogComponent } from '@app/editor/dialogs/refs-in-article-cite-dialog/refs-in-article-cite-dialog.component';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { createCustomIcon } from '../menu/common-methods';

@Injectable({
  providedIn: 'root',
})
export class CitedRefsButtonsService {
  citedRefsPluginKey = new PluginKey('citedRefsButtonsPlugin');
  citedRefsButtonsPlugin: Plugin;

  citeEditButton: HTMLButtonElement;
  citeDeleteButton: HTMLButtonElement;

  citeActions = {
    editCiteRef: () => {},
    deleteCiteRef: () => {},
  };

  citeButtonsClasses = ['edit-cite-ref-button', 'delete-cite-ref-button'];

  constructor(private serviceShare: ServiceShare, private dialog: MatDialog) {
    this.createButtons();
    this.citedRefsButtonsPlugin = new Plugin({
      key: this.citedRefsPluginKey,
      state: {
        init: (config: any, _: EditorState) => {
          return { sectionName: config.sectionName };
        },
        apply: (transaction: Transaction, value, _, newState) => {
          return value;
        },
      },
      props: {
        handleDOMEvents: {
          blur: (view: EditorView, event: MouseEvent) => {
            if (
              event.relatedTarget &&
              event.relatedTarget instanceof HTMLButtonElement &&
              this.citeButtonsClasses.includes(event.relatedTarget.className)
            ) {
              event.relatedTarget.click();
            }
          },
        },
        decorations: (state: EditorState) => {
          const pluginState = this.citedRefsPluginKey.getState(state);
          const focusedEditor =
            this.serviceShare.DetectFocusService.sectionName;
          const currentEditor = pluginState.sectionName;
          const { from, to } = state.selection;

          if (from != to || currentEditor != focusedEditor) {
            return DecorationSet.empty;
          }

          const anchor = state.selection.$anchor;
          const referenceCitationInfo = this.citeRefPosition(state, anchor.pos);

          if (!referenceCitationInfo) {
            return DecorationSet.empty;
          }

          const buttonsContainer = document.createElement('div');
          buttonsContainer.className = 'cite-ref-buttons';
          buttonsContainer.style.pointerEvents = 'all';
          buttonsContainer.append(this.citeEditButton);
          buttonsContainer.append(this.citeDeleteButton);

          const view =
            serviceShare.ProsemirrorEditorsService.editorContainers[
              currentEditor
            ].editorView;

          const coordsInCursorPos = view.coordsAtPos(from);
          const editorViewRectangle = view.dom.getBoundingClientRect();

          const top = coordsInCursorPos.top - editorViewRectangle.top;

          buttonsContainer.setAttribute('style', `top: ${top}px`);
          buttonsContainer.setAttribute('tabindex', '-1');

          this.citeActions.editCiteRef = () => {
            const { from, referenceCitation } = referenceCitationInfo;
            const { citedRefsCiTOs, citedRefsIds } = referenceCitation.attrs;

            this.dialog
              .open(RefsInArticleCiteDialogComponent, {
                panelClass: 'editor-dialog-container',
                data: { citedRefsIds, citedRefsCiTOs, isEditMode: true },
                width: '680px',
              })
              .afterClosed()
              .subscribe((result) => {
                if (result) {
                  const citationObj = {
                    citedRefsIds,
                    citationNode: referenceCitation,
                    citationPos: from,
                  };

                  serviceShare.EditorsRefsManagerService.citateSelectedReferencesInEditor(
                    result.citedRefs,
                    view,
                    citationObj
                  );
                }
              });
          };

          this.citeActions.deleteCiteRef = () => {
            const { from, referenceCitation } = referenceCitationInfo;

            const tr = state.tr.deleteRange(
              from - 1,
              from + referenceCitation.nodeSize - 1
            );
            view.dispatch(tr);
          };

          return DecorationSet.create(state.doc, [
            Decoration.widget(0, () => buttonsContainer),
          ]);
        },
      },
    });
  }

  citeRefPosition(state: EditorState, pos: number) {
    const $pos = state.doc.resolve(pos);

    const { parent: node } = $pos;
    if (!node || node.type.name !== 'reference_citation') return;

    let from = $pos.start();

    return { from, referenceCitation: node };
  }

  createButtons() {
    this.citeEditButton = document.createElement('button');
    this.citeEditButton.className = 'edit-cite-ref-button';
    this.citeEditButton.setAttribute('tabindex', '-1');
    this.citeEditButton.style.cursor = 'pointer';
    this.citeEditButton.title = 'Edit Citation';
    const { dom: trfCitation } = createCustomIcon(
      'refCitation.svg',
      16,
      16,
      0,
      1.5,
      1.3
    );
    this.citeEditButton.append(trfCitation);
    this.citeEditButton.addEventListener('click', () => {
      this.citeActions.editCiteRef();
    });

    this.citeDeleteButton = document.createElement('button');
    this.citeDeleteButton.className = 'delete-cite-ref-button';
    this.citeDeleteButton.setAttribute('tabindex', '-1');
    this.citeDeleteButton.style.cursor = 'pointer';
    this.citeDeleteButton.title = 'Delete Citation.';
    const { dom: deleteImg } = createCustomIcon(
      'delete_forever-red.svg',
      16,
      16,
      0,
      1.5,
      1.3
    );
    this.citeDeleteButton.append(deleteImg);
    this.citeDeleteButton.addEventListener('click', () => {
      this.citeActions.deleteCiteRef();
    });
  }
}
