import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from '@app/layout/pages/signup/signup.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { EditorComponent } from './editor/editor.component';
import { MainComponent } from './layout/pages/main/main.component';
import { LandingComponent } from './layout/pages/landing/landing.component';
import { LoginComponent } from './layout/pages/login/login.component';
import { ArticleComponent } from './editor/article/article.component';

import { DialogAddFilesComponent } from './layout/pages/create-new-project/dialog-add-files/dialog-add-files.component';
import { ChooseManuscriptDialogComponent } from './editor/dialogs/choose-manuscript-dialog/choose-manuscript-dialog.component';
import { CreateNewProjectComponent } from './layout/pages/create-new-project/create-new-project.component';


const routes: Routes = [
  {
    path: '', component: MainComponent,
    children: [
      { path: '', component: LandingComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: SignupComponent },
      { path: 'choose', component: ChooseManuscriptDialogComponent },
      { path: 'create', canActivate: [AuthGuard], component: CreateNewProjectComponent },
      { path: 'add-files', component: DialogAddFilesComponent },
      { path: ':id', canActivate: [AuthGuard], component: EditorComponent },     
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
