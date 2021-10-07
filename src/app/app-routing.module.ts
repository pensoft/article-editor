import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EditorComponent} from './editor/editor.component';
import {MainComponent} from './layout/pages/main/main.component';
import {LandingComponent} from './layout/pages/landing/landing.component';
import {LoginComponent} from './layout/pages/login/login.component';
import { ArticleComponent } from './editor/article/article.component';

const routes: Routes = [
  {
    path: '', component: MainComponent,
    children: [
      {path: '', component: LandingComponent},
      {path: 'login', component: LoginComponent},
      {path: 'formio', component: ArticleComponent},
      {path: ':id', component: EditorComponent},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
