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
import { LoginGuard } from "@core/guards/login.guard";
import { DashboardComponent } from './editor/dashboard/dashboard.component';
import { SettingsComponent } from './layout/pages/settings/settings.component';
// import { ActivityPermissionComponent } from './layout/pages/activity-permission/activity-permission.component';
// import { SignPasswordDevicesComponent } from './layout/pages/sign-password-devices/sign-password-devices.component';
import { AnyProjectsGuard } from './core/guards/any-projects.guard';
import { EditBeforeExportComponent } from './editor/dialogs/edit-before-export/edit-before-export.component';
import { RecentPermissionComponent } from './layout/pages/recent-permission/recent-permission.component';

import { ProfileComponent } from './layout/pages/profile/profile.component';
import { ProfileInfoComponent } from './layout/pages/profile/profile-info/profile-info.component';
import { AddContributorsDialogComponent } from './editor/dialogs/add-contributors-dialog/add-contributors-dialog.component';

const routes: Routes = [
  { path: 'profile-info', component: ProfileInfoComponent },
  { path: 'add-contributer', component: AddContributorsDialogComponent },
  // { path: 'activity-permission', component: ActivityPermissionComponent },
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', canActivate: [LoginGuard], component: LandingComponent },
      { path: 'login', canActivate: [LoginGuard], component: LoginComponent },
      {
        path: 'register',
        canActivate: [LoginGuard],
        component: SignupComponent,
      },
      {
        path: 'recent-permission',
        canActivate: [AuthGuard],
        component: RecentPermissionComponent,
      },
      {
        path: 'user-profile',
        canActivate: [AuthGuard],
        component: SettingsComponent,
      },
      {
        path: 'edit-profile',
        canActivate: [AuthGuard],
        component: ProfileComponent,
      },
      {
        path: 'create',
        canActivate: [AuthGuard],
        component: CreateNewProjectComponent,
      },
      {
        path: 'add-files',
        canActivate: [AuthGuard],
        component: DialogAddFilesComponent,
      },
      {
        path: 'dashboard',
        canActivate: [AuthGuard, AnyProjectsGuard],
        component: DashboardComponent,
      },
      { path: ':id', canActivate: [AuthGuard], component: EditorComponent },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
