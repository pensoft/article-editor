import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from '@app/layout/pages/signup/signup.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { EditorComponent } from './editor/editor.component';
import { MainComponent } from './layout/pages/main/main.component';
import { LandingComponent } from './layout/pages/landing/landing.component';
import { LoginComponent } from './layout/pages/login/login.component';
import { ArticleComponent } from './editor/article/article.component';
import { VerifyAccountComponent } from './layout/pages/verify-account/verify-account.component';

const routes: Routes = [
  {
    path: '', component: MainComponent,
    children: [
      { path: '', component: LandingComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: SignupComponent },
      { path: ':id', canActivate: [AuthGuard], component: EditorComponent },     
    ]
  },
  { path: 'verify', component: VerifyAccountComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
