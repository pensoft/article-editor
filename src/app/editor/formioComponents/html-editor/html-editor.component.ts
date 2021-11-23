import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { FormioCustomComponent } from '@formio/angular';
import { uuidv4 } from 'lib0/random';
import { ProsemirrorEditorsService } from '../../services/prosemirror-editors.service';
import { YdocService } from '../../services/ydoc.service';
//@ts-ignore
import * as Y from 'yjs'
import { AbstractType } from 'yjs';
import { Components, MaterialComponent, registerComponent } from 'src/app/formio-angular-material/angular-material-formio.module';
import { articleSection, editorData, editorMeta, sectionContentData, titleContentData } from '../../utils/interfaces/articleSection';
import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup"
import { javascript } from "@codemirror/lang-javascript"
import { html } from "@codemirror/lang-html"


@Component({
  selector: 'app-html-editor',
  templateUrl: './html-editor.component.html',
  styleUrls: ['./html-editor.component.scss']
})
export class HtmlEditorComponent extends MaterialComponent implements AfterViewInit {
  newValue?: { contentData: editorData, sectionData: articleSection }
  value?: string;
  editor?: EditorView
  renderEditor = false;
  editorData?: editorData;

  @ViewChild('codemirror', { read: ElementRef }) codemirror?: ElementRef;

  constructor(
    public element: ElementRef,
    public ref: ChangeDetectorRef) {
    super(element, ref)
  }


  ngAfterViewInit(): void {
    let awaitValue = () => {
      setTimeout(() => {
        if (this.value !== undefined) {
          renderEditor()
        } else {
          awaitValue()
        }
      }, 100);
    }
    this.value = this.control.value as string
    awaitValue()
    let renderEditor = () => {
      try {
        this.render(this.value!)
      } catch (e) {
        console.error(e);
      }
    }
  }

  process(str:any) {

    var div = document.createElement('div');
    div.innerHTML = str.trim();

    return this.format(div, 0).innerHTML;
  }

  format(node:any, level:any) {

    var indentBefore = new Array(level++ + 1).join('  '),
      indentAfter = new Array(level - 1).join('  '),
      textNode;

    for (var i = 0; i < node.children.length; i++) {

      textNode = document.createTextNode('\n' + indentBefore);
      node.insertBefore(textNode, node.children[i]);

      this.format(node.children[i], level);

      if (node.lastElementChild == node.children[i]) {
        textNode = document.createTextNode('\n' + indentAfter);
        node.appendChild(textNode);
      }
    }

    return node;
  }
  render(editorData: string) {
    let doc = this.process(editorData)
      this.editor = new EditorView({
        state: EditorState.create({
          doc:editorData,
          extensions: [html()]
        }),
        parent: this.codemirror?.nativeElement,
        dispatch: (tr) => {
          this.editor?.update([tr]);

          this.instance.updateValue(this.editor?.state.doc.sliceString(0, this.editor?.state.doc.length), { modified: true });
        }
      })
    this.renderEditor = true;
  }
}
