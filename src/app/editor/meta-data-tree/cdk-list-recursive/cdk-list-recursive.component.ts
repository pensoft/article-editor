import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddTaxonomyComponent } from 'src/app/editor/dialogs/add-taxonomy/add-taxonomy.component';
import { TaxonomyService } from 'src/app/editor/dialogs/add-taxonomy/taxonomy.service';
import { EditSectionDialogComponent } from '../../dialogs/edit-section-dialog/edit-section-dialog.component';
import { ProsemirrorEditorsService } from '../../services/prosemirror-editors.service';
import { YdocCopyService } from '../../services/ydoc-copy.service';
import { YdocService } from '../../services/ydoc.service';
import { DetectFocusService } from '../../utils/detectFocusPlugin/detect-focus.service';
import { articleSection } from '../../utils/interfaces/articleSection';
import { TreeService } from '../tree-service/tree.service';
import { DOMParser } from 'prosemirror-model';
//@ts-ignore
import { updateYFragment } from '../../../y-prosemirror-src/plugins/sync-plugin.js'
import { schema, } from '../../utils/schema';

@Component({
  selector: 'app-cdk-list-recursive',
  templateUrl: './cdk-list-recursive.component.html',
  styleUrls: ['./cdk-list-recursive.component.scss']
})
export class CdkListRecursiveComponent implements OnInit {

  @Input() articleSectionsStructure!: articleSection[];
  @Output() articleSectionsStructureChange = new EventEmitter<any>();

  @Input() startFromIndex!: number;

  @Input() parentListData!: { expandParentFunc: any, listDiv: HTMLDivElement };
  @Input() id?: string; // the id of the parent of this node
  focusedId?: string;
  mouseOn?: string;

  icons: string[] = [];
  focusIdHold?: string;
  taxonomyData: any;

  constructor(
    private taxonomyService: TaxonomyService,
    public treeService: TreeService,
    public ydocService: YdocService,
    public ydocCopyService: YdocCopyService,
    public detectFocusService: DetectFocusService,
    public prosemirrorEditorsService: ProsemirrorEditorsService,
    public dialog: MatDialog
  ) {
    detectFocusService.getSubject().subscribe((focusedEditorId) => {
      if (focusedEditorId) {
        this.focusedId = focusedEditorId;
      }

      if (this.id !== 'parentList' && this.articleSectionsStructure.some((el) => {
        return el.sectionID == focusedEditorId;
      })) {
        this.expandParentFunc();
      }
    });
  }

  ngOnInit(): void {
    this.taxonomyService.taxonomy.subscribe(x => {
      this.taxonomyData = {
        'title': 'Angular Formio',
        components: [
          {
            type: 'textfield',
            label: 'rank',
            defaultValue: x.rank,
            key: 'firstName',
            input: true
          },
          {
            type: 'textfield',
            label: 'Scientific Name',
            defaultValue: x.scientificName,
            key: 'lastName',
            input: true
          },
          {
            type: 'textfield',
            label: 'Common Name',
            defaultValue: x.commonName,
            key: 'email',
            input: true
          },
        ]
      };
    })
    this.articleSectionsStructure.forEach((node: any, index: number) => {
      this.icons[index] = 'chevron_right';
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.articleSectionsStructure, event.previousIndex, event.currentIndex);

    this.treeService.dragNodeChange(event.previousIndex, event.currentIndex, this.id!);

  }

  editNodeHandle(node: articleSection) {
    this.dialog.open(EditSectionDialogComponent, {
      width: '70%',
      height: '70%',
      data: node,
      disableClose: false
    }).afterClosed().subscribe(result => {
      let prosemirrorNodeHtml = result.data.textAreaHTMLEditor as string
      let str = prosemirrorNodeHtml.supplant(result);
      let sectionID = result.section.sectionID
      let xmlFragment = this.ydocService.ydoc.getXmlFragment(sectionID);    // oldEditorXmlFragment

      let templDiv = document.createElement('div');
      templDiv.innerHTML = str!
      let node1 = DOMParser.fromSchema(schema).parse(templDiv.firstChild!);
      console.log(str!);
      updateYFragment(xmlFragment.doc, xmlFragment, node1, new Map());

      this.treeService.editNodeChange(node.sectionID)
      /* if(result.submitType == 'TaxonTreatmentsMaterial'){
        
      }else if(result.submitType =='sectionUpdate'){
      }
      this.prosemirrorEditorsService.markSectionForDelete(result)
      this.prosemirrorEditorsService.clearDeleteArray(); */
    });
  }

  addNodeHandle(nodeId: string) {
    this.treeService.addNodeChange(nodeId);
  }

  deleteNodeHandle(nodeId: string) {
    this.treeService.deleteNodeChange(nodeId, this.id!);
  }

  changeDisplay(div: HTMLDivElement) {
    if (div.style.display == 'none') {
      div.style.display = 'block';
    } else {
      div.style.display = 'none';
    }
  }

  expandParentFunc = () => {
    if (this.id !== 'parentList') {
      if (this.parentListData) {
        if (this.parentListData.listDiv.style.display == 'none') {
          this.parentListData.listDiv.style.display = 'block';
        }
        this.parentListData.expandParentFunc();
      }
    }
  };

  showButtons(div: HTMLDivElement, mouseOn: boolean, borderClass: string, focusClass: string, node: any) {
    if (mouseOn) {
      this.mouseOn = node.id;
    } else {
      this.mouseOn = '';
    }
    Array.from(div.children).forEach((el: any) => {
      if (el.classList.contains('section_btn_container')) {
        Array.from(el.children).forEach((el: any) => {
          if (el.classList.contains('hidden')) {

            if (mouseOn) {
              el.style.display = 'inline';
            } else {
              el.style.display = 'none';
            }

          }
        });
      } else if (el.classList.contains('hidden')) {

        if (mouseOn) {
          el.style.display = 'inline';
        } else {
          el.style.display = 'none';
        }

      } else if (el.classList.contains('border')) {
        if (mouseOn) {
          if (this.focusedId == node.id) {
            this.focusIdHold = node.id;
            this.focusedId = '';
            /* el.classList.add(focusClass); */
          }
          el.className = `border ${borderClass} `;
          /* el.classList.remove(borderClass+"Inactive")

          el.classList.remove(borderClass)
          el.classList.add(borderClass)

          el.classList.remove(focusClass) */

          el.children.item(0).style.display = 'inline';
        } else {
          if (this.focusIdHold == node.id) {

            this.focusedId = this.focusIdHold;
            this.focusIdHold = '';

            /* el.classList.add(focusClass); */
          }
          el.className = `border ${borderClass}Inactive`;


          /* el.classList.remove(borderClass)
          el.classList.remove(borderClass)
          el.classList.add(borderClass+"Inactive") */
          el.children.item(0).style.display = 'none';
        }

      }
    });
  }


}
