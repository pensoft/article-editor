
import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialNestedComponent } from '../MaterialNestedComponent';
//@ts-ignore
import DataGridComponent from 'formiojs/components/datagrid/DataGrid.js';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { MatTable } from '@angular/material/table';
import { FormioEventsService } from 'src/app/editor/formioComponents/formio-events.service';
import { ElementRef, ChangeDetectorRef } from '@angular/core';
import { ViewFlags } from '@angular/compiler/src/core';
import { F, T } from '@angular/cdk/keycodes';
@Component({
  selector: 'mat-formio-datagrid',
  styleUrls: ['./datagrid.component.scss'],
  template: `
    <mat-formio-form-field [instance]="instance"
                           [componentTemplate]="componentTemplate"
                           [labelTemplate]="labelTemplate"
    ></mat-formio-form-field>
    <ng-template #componentTemplate let-hasLabel>
      <mat-card fxFill >
        <ng-container *ngIf="hasLabel">
          <ng-container *ngTemplateOutlet="labelTemplate"></ng-container>
        </ng-container>
        <mat-card-content>
          <mat-card-actions
                  *ngIf="instance.hasAddButton() && (instance.component.addAnotherPosition === 'both' || instance.component.addAnotherPosition === 'top')">
            <button mat-raised-button color="primary" (click)="addAnother()">
              <mat-icon>add</mat-icon>
              {{instance.component.addAnother || 'Add Another'}}
            </button>
          </mat-card-actions>
          <table
                  mat-table
                  [dataSource]="dataSource"
                  class="mat-elevation-z8 datagrid-list"
                  fxFill
                  cdkDropList
                  [cdkDropListData]="dataSource"
                  (cdkDropListDropped)="dropTable($event)">
            >
            <ng-container *ngFor="let column of formColumns" [matColumnDef]="column">
              <th mat-header-cell *matHeaderCellDef>{{ getColumnLabel(columns[column]) }}</th>
              <td mat-cell *matCellDef="let i = index;" [attr.rowIndex]="i" [attr.component]="column">
                <ng-template #components></ng-template>
              </td>
            </ng-container>
            <div class="">

            </div>
            <ng-container matColumnDef="__removeRow">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let i = index;">
                <button mat-button *ngIf="instance.hasRemoveButtons()" (click)="removeRow(i)">
                  <mat-icon aria-hidden="false" aria-label="Remove row">delete</mat-icon>
                </button>
              </td>
            </ng-container>
            <ng-container  matColumnDef="position" *ngIf="instance.component.reorder">
              <th mat-header-cell *matHeaderCellDef> No.</th>
              <td cdkDragHandle  mat-cell *matCellDef="let element" (mouseenter)="dragEnabled = true"
            (mouseleave)="dragEnabled = false">
                <mat-icon >reorder</mat-icon>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <div *ngIf="instance?.component?.reorder">

              <tr class="row-placeholder" *cdkDragPlaceholder ></tr>
              <tr class="datagrid-row" mat-row *matRowDef="let row; columns: displayedColumns;" cdkDrag [cdkDragDisabled]="!dragEnabled"
                  [cdkDragData]="row"></tr>
            </div>
            <div *ngIf="!instance?.component?.reorder">
              <tr class="datagrid-row" mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </div>
          </table>
        </mat-card-content>
        <mat-card-actions *ngIf="instance.hasAddButton() && instance.component.addAnotherPosition !== 'top'">
          <button mat-raised-button color="primary" (click)="addAnother()">
            <mat-icon>add</mat-icon>
            {{instance.component.addAnother || 'Add Another'}}
          </button>
        </mat-card-actions>
      </mat-card>
    </ng-template>

    <ng-template #labelTemplate>
      <mat-card-title>
        <span [instance]="instance" matFormioLabel></span>
      </mat-card-title>
    </ng-template>
  `,
  styles: [
    '.datagrid-row { height: auto; }'
  ]
})
export class MaterialDataGridComponent extends MaterialNestedComponent {
  displayedColumns?: string[];
  formColumns?: string[];
  columns: any;
  dataSource = new MatTableDataSource();
  dragEnabled = false;
  constructor(ref: ElementRef, changeDetection: ChangeDetectorRef, private formioEventsService: FormioEventsService) {
    super(ref, changeDetection)
  }

  getColumnLabel(column: any) {
    return column.label || column.key;
  }

  setInstance(instance: any) {
    super.setInstance(instance);
    let newValue = JSON.parse(JSON.stringify(instance.defaultValue))
    this.instance.dataValue = newValue;
    this.instance.setValue(newValue);
    this.dataSource.data = instance.dataValue;
    this.columns = {};
    this.displayedColumns = [];
    this.formColumns = [];
    instance.component.clearOnHide = false;
    instance.getColumns().map((column: any) => {
      this.formColumns!.push(column.key);
      this.displayedColumns!.push(column.key);
      this.columns[column.key] = column;
    });
    this.displayedColumns.push('__removeRow');
    if (this.instance.component.reorder) {
      this.displayedColumns.push('position');
    }
    instance.viewContainer = (component: any) => {
      let viewContainer;
      if (this.instance.component.disabled) {
        component.component.disabled = true;
      }
      this.viewContainers.forEach((container: any) => {
        const td = container.element.nativeElement.parentNode;
        if (
          component.rowIndex === parseInt(td.getAttribute('rowIndex'), 10) &&
          component.component.key === td.getAttribute('component')
        ) {
          viewContainer = container;
        }
      });

      return viewContainer ? viewContainer : null;
    };
  }

  addAnother() {
    //this.dataSource._updateChangeSubscription
    this.checkRowsNumber();
    this.instance.addRow();
    if (this.dataSource.data.length < this.instance.rows.length) {
      this.dataSource.data.push({});
    }
    this.dataSource.data = [...this.dataSource.data];
  }

  checkRowsNumber() {
    while (this.instance.rows.length < this.dataSource.data.length) {
      this.instance.addRow();
    }
  }

  removeRow(index: any) {
    this.instance.removeRow(index);
    this.dataSource.data.splice(index, 1);
    this.dataSource.data = [...this.dataSource.data];
  }

  dropTable(event: CdkDragDrop<any>) {
    try {
      const prevIndex = this.dataSource.data.findIndex((d) => d === event.item.data);


      moveItemInArray(this.control.value, prevIndex, event.currentIndex);

      this.renderComponents();

      this.formioEventsService.events.next({ event: 'data-grid-drag-drop' })
    } catch (e) {
      console.error(e);
    }
  }

  findAndSetValue() {
    setTimeout(() => {
      if (this.instance.root._submission.data[this.instance.component.key]) {
        this.instance.updateValue(this.instance.root._submission.data[this.instance.component.key], { modified: true });

        /* this.dataSource.data = [...this.dataSource.data]
        for (let i = this.instance.rows.length - 1; i > -1; i--) {
          //this.dataSource.data.splice(i, 1);
          this.instance.removeRow(i);
        }
        this.checkRowsNumber() */
      }

      /* this.dataSource.data = this.instance.root._submission.data[this.instance.component.key]; */
      /* if(this.instance.root._submission.data[this.instance.component.key]){
        this.dataSource.data = []
        this.instance.root._submission.data[this.instance.component.key].forEach((el:any)=>{
          this.dataSource.data.push(el);
          this.instance
        })
        //this.dataSource.data = this.dataSource.data.map(()=>{this.instance.addRow();return {}});
      } */
    }, 300)
  }

  /* updateVisibility(instance: any) {
    if(instance == null){
      this.setVisible(this.instance.visible)
    }
    if (instance&&
      this.instance.component.conditional &&
      this.instance.component.conditional.when == instance.component.key) {
        this.instance.root.setFullValue();
        setTimeout(()=>{
          this.setVisible((instance.getValue() == this.instance.component.conditional.eq)?this.instance.component.conditional.show:!this.instance.component.conditional.show)
        },200)
    }
    if (this.instance.components && this.instance.components.length > 0) {
      this.instance.components.forEach((component: any) => {
        if (component.materialComponent) {
          component.materialComponent.updateVisibility(instance);
        }
      })
    }
  }

  updateVisibility(instance: any) {

    if (instance == null) {
      this.setVisible(this.instance.visible)
    }
    if (instance &&
      this.instance.component.conditional &&
      this.instance.component.conditional.when == instance.component.key) {
      this.instance.root.setFullValue();
      setTimeout(() => {
        this.setVisible((instance.getValue() == this.instance.component.conditional.eq) ? this.instance.component.conditional.show : !this.instance.component.conditional.show)
      }, 200)
    }
    if (this.instance.components && this.instance.components.length > 0) {
      this.instance.components.forEach((component: any) => {
        if (component.materialComponent) {
          component.materialComponent.updateVisibility(instance);
        }
      })
    }

  } */

  renderComponents() {
    try {
      /* this.setVisible(this.instance.visible); */
      let recursiveSetRealValue = (instance: any) => {
        instance.components.forEach((el: any) => {
          if (el.component.type == 'textarea') {
            if (el.materialComponent) {
              el.materialComponent.setRealValue();
            }
          }
          if (el.components && el.components.length > 0) {
            recursiveSetRealValue(el);
          }
        })
      }
      recursiveSetRealValue(this.instance);
      this.instance.getRows();
      this.instance.updateValue(this.control.value || [], { modified: true });
      this.instance.setValue(this.control.value || []);
      super.renderComponents()
    } catch (e) {
      console.error(e);
    }
  }
  updateVisibility(instance: any,visibleParent?:true) {
    if(instance == null/* ||visibleParent */){
      this.setVisible(this.instance._visible)
    }

    let isvisible = this.instance.conditionallyVisible()
    if(instance){
      this.instance.root.setFullValue();
      setTimeout(()=>{
        this.setVisible(isvisible);
      },200)
    }
    this.instance.rows.forEach((row:any)=>{
      Object.keys(row).forEach(key=>{
        if(row[key]){
          let rowEL = row[key];
          if(rowEL.materialComponent){
            rowEL.materialComponent.updateVisibility(instance);
          }else{
            rowEL.render();
          }
          setTimeout(()=>{
          },1000 )
        }
      })
    })
    /* if (this.instance.components && this.instance.components.length > 0) {
      this.instance.components.forEach((component: any) => {
        if (component.materialComponent) {
          component.materialComponent.updateVisibility(instance);
        }
      })
    } */
  }
  oldvalue :any
  setValue(value: [] | null) {

    if(value!==null&&value?.length>0&&value?.reduce((prev:any,curr:any,i:number,arr)=>{return prev&&(Object.keys(curr).length==0)},true)){
      value = JSON.parse(JSON.stringify(this.oldvalue))
      setTimeout(()=>{
        this.instance.getRows();
        this.instance.updateValue(value, { modified: true });
        this.instance.setValue(value);
      },10)
    }else{
      this.oldvalue =  JSON.parse(JSON.stringify(value))
    }
    const gridLength = value ? value.length : 0;
    while (this.instance.rows.length < gridLength) {
      this.addAnother();
      this.instance.dataValue = value;
      this.instance.setValue(value);
    }
    //this.dataSource = new MatTableDataSource(this.instance.dataValue);
    if (!value && this.instance.component.clearOnHide) {
      this.dataSource = new MatTableDataSource(this.instance.defaultValue);
    }
    super.setValue(value);
  }
}
DataGridComponent.MaterialComponent = MaterialDataGridComponent;
export { DataGridComponent };
