import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddTaxonomyComponent } from 'src/app/editor/dialogs/add-taxonomy/add-taxonomy.component';
import { TaxonomyService } from 'src/app/editor/dialogs/add-taxonomy/taxonomy.service';
import { DetectFocusService } from '../../utils/detectFocusPlugin/detect-focus.service';
import { TreeService } from '../tree-service/tree.service';

@Component({
  selector: 'app-cdk-list-recursive',
  templateUrl: './cdk-list-recursive.component.html',
  styleUrls: [ './cdk-list-recursive.component.scss' ]
})
export class CdkListRecursiveComponent implements OnInit {

  @Input() TREE_DATA!: any[];
  @Output() TREE_DATAChange = new EventEmitter<any>();

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
    public detectFocusService: DetectFocusService,
    public dialog: MatDialog
  ) {
    detectFocusService.getSubject().subscribe((focusedEditorId) => {
      if (focusedEditorId) {
        this.focusedId = focusedEditorId;
      }

      if (this.id !== 'parentList' && this.TREE_DATA.some((el) => {
        return el.id == focusedEditorId;
      })) {
        this.expandParentFunc();
      }
    });
  }

  ngOnInit(): void {
    this.taxonomyService.taxonomy.subscribe(x=>{
      this.taxonomyData =  {
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
    this.TREE_DATA.forEach((node: any, index: number) => {
      this.icons[index] = 'chevron_right';
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.TREE_DATA, event.previousIndex, event.currentIndex);

    this.treeService.dragNodeChange(event.previousIndex, event.currentIndex, this.id!);

  }

  editNodeHandle(node: any) {
    this.treeService.editNodeChange(node.id);
    if (node.name == 'Taxonomy') {
      this.dialog.open(AddTaxonomyComponent, {
        width: '250px',
        data: this.taxonomyData
      }).afterClosed().subscribe(result => {
        this.taxonomyService.taxonomy.next(result)
      });
    }

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
          el.className = `border ${ borderClass } `;
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
          el.className = `border ${ borderClass }Inactive`;


          /* el.classList.remove(borderClass)
          el.classList.remove(borderClass)
          el.classList.add(borderClass+"Inactive") */
          el.children.item(0).style.display = 'none';
        }

      }
    });
  }


}
