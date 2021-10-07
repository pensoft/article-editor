import { AfterViewInit, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { MaterialNestedComponent } from '../MaterialNestedComponent';
//@ts-ignore
import TableComponent from 'formiojs/components/table/Table.js';
import { articleSection, taxonomicCoverageContentData } from 'src/app/editor/utils/interfaces/articleSection';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { YdocService } from 'src/app/editor/services/ydoc.service';
import { editorFactory } from 'src/app/editor/utils/articleBasicStructure';
import { EditSectionService } from 'src/app/editor/dialogs/edit-section-dialog/edit-section.service';

@Component({
  selector: 'mat-formio-table',
  styleUrls: ['./table.component.scss'],
  template: `
      <table class="mat-table" style="width: 100%;" [ngClass]="{'is-bordered' : instance.component.bordered}">
        <thead>
        <tr class="mat-header-row">
          <th *ngFor="let header of instance.component.header"
              class="mat-header-cell"
          >
            {{ instance.t(header) }}
          </th>
        </tr>
        </thead>

        <tbody cdkDropList (cdkDropListDropped)="onDrop($event)">
        <tr *ngFor="let row of instance.table; let i = index" cdkDrag cdkDragLockAxis="y"
            role="row"
            class="mat-row"
            [ngClass]="{
                'is-hover': instance.component.hover,
                'is-striped': instance.component.striped && i % 2 === 0
              }"
        >
          <td *ngFor="let col of row"
              role="gridcell"
              class="mat-cell"
              [ngClass]="getTableColClasses()"
          >
            <ng-template #components></ng-template>
          </td>
          <div *ngIf="editMode" class="drag-handle" >
            <button mat-icon-button (click)="deleteTaxa(i)"><mat-icon>delete</mat-icon></button>
            <mat-icon cdkDragHandle>drag_indicator</mat-icon>

          </div>
        </tr>
        </tbody>
      </table>
      <button *ngIf="editMode" mat-button (click)="addTaxa()"><mat-icon>add</mat-icon>Add taxa</button>
  `
})
export class MaterialTableComponent extends MaterialNestedComponent {
  value?: { contentData: taxonomicCoverageContentData, sectionData: articleSection, type: string }
  editMode?:boolean
  setInstance(instance: any) {
    super.setInstance(instance);
    instance.viewContainer = (component: any) => {
      return this.viewContainers ?
        this.viewContainers[(component.tableRow * this.instance.component.numCols) + component.tableColumn] :
        null;
    };
  }
  constructor(public element: ElementRef<any>, public ref: ChangeDetectorRef, public ydocService: YdocService,public editSectionService:EditSectionService,) {
    super(element, ref);
  }

  onDrop(event: CdkDragDrop<string[]>) {
    console.log(event);
    let movedElement = this.value?.contentData.taxaArray.splice(event.previousIndex, 1);
    this.value?.contentData.taxaArray.splice(event.currentIndex, 0, ...movedElement!);
    console.log(this.value);
    if (this.value?.sectionData.mode == 'documentMode') {
      this.ydocService.applySectionChange(this.value);
    }else if(this.value?.sectionData.mode == 'editMode'){
      this.editSectionService.editChangeSubject.next(this.value)
    }
  }

  deleteTaxa(i: number) {
    this.value?.contentData.taxaArray.splice(i, 1);
    if (this.value?.sectionData.mode == 'documentMode') {
      this.ydocService.applySectionChange(this.value);
    }else if(this.value?.sectionData.mode == 'editMode'){
      this.editSectionService.editChangeSubject.next(this.value)
    }
  }

  addTaxa() {
    this.value?.contentData.taxaArray.push({
      scietificName: editorFactory({ placeHolder: 'ScietificName...', label: 'Scietific name' }),
      commonName: editorFactory({ placeHolder: 'CommonName...', label: 'Common name' }),
      rank: { options: ['kingdom', 'genus', 'genus2', 'kingdom', 'genus', 'genus2'] }
    });
    if (this.value?.sectionData.mode == 'documentMode') {
      this.ydocService.applySectionChange(this.value);
    }else if(this.value?.sectionData.mode == 'editMode'){
      this.editSectionService.editChangeSubject.next(this.value)
    }
  }

  ngAfterViewInit() {
    this.components?.changes.subscribe(() => this.render());
    this.render();
    this.value = this.control.value
    this.editMode = this.value?.sectionData.mode == 'editMode'
  }

  getTableColClasses() {
    return;
    if (!this.instance) {
      return;
    }
    const { condensed, cellAlignment } = this.instance.component;
    return {
      'is-condensed': condensed,
      ...(cellAlignment && { [cellAlignment]: true })
    }
  }
}
TableComponent.MaterialComponent = MaterialTableComponent;
export { TableComponent };
