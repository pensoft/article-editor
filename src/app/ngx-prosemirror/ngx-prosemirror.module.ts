import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxProsemirrorComponent } from './ngx-prosemirror/ngx-prosemirror.component';
import { AngularDialogComponent } from './angular-dialog/angular-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import { TableSizePickerComponent } from './table-size-picker/table-size-picker.component';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  declarations: [
    NgxProsemirrorComponent,
    AngularDialogComponent,
    TableSizePickerComponent
  ],
  exports: [
    NgxProsemirrorComponent
  ]
})
export class NgxProsemirrorModule { }
