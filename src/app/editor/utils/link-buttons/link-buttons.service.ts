import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddLinkDialogComponent } from '@app/editor/add-link-dialog/add-link-dialog.component';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { MarkType } from 'prosemirror-model';
import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

import { createCustomIcon } from '../menu/common-methods';

@Injectable({
  providedIn: 'root',
})
export class LinkButtonsService {
  linkButtonsPluginKey = new PluginKey('linkButtonsPlugin');
  linkButtonsPlugin: Plugin;

  editButton: HTMLButtonElement;
  unlinkButton: HTMLButtonElement;

  linkActions = {
    editLink: () => {},
    unlink: () => {},
  };

  linkButtonsClasses = ['edit-link-button', 'unlink-button'];

  constructor(private serviceShare: ServiceShare, private dialog: MatDialog) {
    this.createButtons();
    this.linkButtonsPlugin = new Plugin({
      key: this.linkButtonsPluginKey,
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
          blur: (view, event) => {
            if (
              event.relatedTarget &&
              event.relatedTarget instanceof HTMLButtonElement &&
              this.linkButtonsClasses.includes(event.relatedTarget.className)
            ) {
              event.relatedTarget.click();
            }
          },
        },
        decorations: (state: EditorState) => {
          const pluginState = this.linkButtonsPluginKey.getState(state);
          const focusedEditor =
            this.serviceShare.DetectFocusService.sectionName;
          const currentEditor = pluginState.sectionName;
          const { from, to } = state.selection;

          if (from != to || currentEditor != focusedEditor) {
            return DecorationSet.empty;
          }

          const anchor = state.selection.$anchor;
          const linkMarkInfo = this.markPosition(
            state,
            anchor.pos,
            state.schema.marks.link
          );

          if (!linkMarkInfo) {
            return DecorationSet.empty;
          }

          const buttonsContainer = document.createElement('div');
          buttonsContainer.style.pointerEvents = 'all';
          buttonsContainer.className = 'link-edit-buttons';
          buttonsContainer.append(this.editButton, this.unlinkButton);

          const view =
            serviceShare.ProsemirrorEditorsService.editorContainers[
              currentEditor
            ].editorView;

          const coordsInCursorPos = view.coordsAtPos(from);
          const editorViewRectangle = view.dom.getBoundingClientRect();

          const top = coordsInCursorPos.top - editorViewRectangle.top;

          buttonsContainer.classList.add('edit-link-buttons');
          buttonsContainer.setAttribute(
            'style',
            `top:${top}px;`
          );
          buttonsContainer.setAttribute('tabindex', '-1');

          this.linkActions.editLink = () => {
            const { href, title } = linkMarkInfo.mark.attrs;

            this.dialog
              .open(AddLinkDialogComponent, {
                width: '582px',
                panelClass: 'insert-figure-in-editor',
                data: { url: href, text: title }
              })
              .afterClosed()
              .subscribe((result) => {
                if (result) {
                  const { from, to, mark: oldMark } = linkMarkInfo;

                  const newMark = state.schema.marks.link.create({
                    href: result.url,
                    title: result.text,
                  });

                  state.tr.removeMark(from, to, oldMark);
                  view.dispatch(state.tr.addMark(from, to, newMark));
                }
              });
          };

          this.linkActions.unlink = () => {
            const { from, to, mark } = linkMarkInfo;

            const tr = state.tr.removeMark(from, to, mark);
            view.dispatch(tr);
          };

          return DecorationSet.create(state.doc, [
            Decoration.widget(0, () => {
              return buttonsContainer;
            }),
          ]);
        },
      },
    });
  }

  markPosition(state: EditorState, pos: number, markType: MarkType) {
    const $pos = state.doc.resolve(pos);
    //@ts-ignore
    const path = $pos.path;
    const isSupplementary = path.find(
      (node) => node?.type && node.type.name === 'block_supplementary_file'
    );

    if (isSupplementary) return;

    const { parent, parentOffset } = $pos;
    const { node, offset } = parent.childAfter(parentOffset);
    if (!node) return;

    const mark = node.marks.find((mark) => mark.type === markType);
    if (!mark) return;

    let from = $pos.start() + offset;
    let to = from + node.nodeSize;

    return { from, to, mark };
  }

  createButtons() {
    this.editButton = document.createElement('button');
    this.editButton.className = 'edit-link-button';
    this.editButton.setAttribute('tabindex', '-1');
    this.editButton.style.cursor = 'pointer';
    this.editButton.title = 'Edit link.';
    const { dom: editImg } = createCustomIcon(
      'edit-green.svg',
      12,
      12,
      0,
      1.5,
      1.3
    );
    this.editButton.append(editImg);
    this.editButton.addEventListener('click', () => {
      this.linkActions.editLink();
    });

    this.unlinkButton = document.createElement('button');
    this.unlinkButton.className = 'unlink-button';
    this.unlinkButton.setAttribute('tabindex', '-1');
    this.unlinkButton.style.cursor = 'pointer';
    this.unlinkButton.title = 'Unlink.';
    const { dom: unlinkImg } = createCustomIcon(
      'anchortag.svg',
      12,
      12,
      0,
      1.5,
      1.3
    );
    this.unlinkButton.append(unlinkImg);
    this.unlinkButton.addEventListener('click', () => {
      this.linkActions.unlink();
    });
  }
}
