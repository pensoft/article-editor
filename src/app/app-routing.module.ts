import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './editor/editor.component';
import { MainComponent } from './layout/main/main.component';

const routes: Routes = [
  {path:'',component:MainComponent,
  children:[
    {path:':id',component:EditorComponent},
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
