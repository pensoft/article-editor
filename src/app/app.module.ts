import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {MaterialModule} from 'src/app/shared/material.module';
import {STORAGE_PROVIDERS} from 'src/app/shared/storage.service';
import {ThemeToggleComponent} from 'src/app/layout/thema-toggle/theme-toggle.component';
import {windowProvider, WindowToken} from 'src/app/shared/window';
import {environment} from '../environments/environment';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
//import {NgxProsemirrorModule} from './ngx-prosemirror/ngx-prosemirror.module';
import {EditorComponent} from './editor/editor.component';
import {EditorMenuComponent} from './editor/editor-menu/editor-menu.component';
import {MetaDataTreeComponent} from './editor/meta-data-tree/meta-data-tree.component';
import {CommentsSectionComponent} from './editor/comments-section/comments-section.component';
import {ChangesSectionComponent} from './editor/changes-section/changes-section.component';
import {ProsemirrorEditorComponent} from './editor/prosemirror-editor/prosemirror-editor.component';
import {CommentComponent} from './editor/comments-section/comment/comment.component';
import {AddCommentDialogComponent} from './editor/add-comment-dialog/add-comment-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MainComponent} from './layout/main/main.component';
import {MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions} from '@angular/material/core';
import {IconsRegisterService} from './shared/icons-register.service';
import { TableSizePickerComponent } from './editor/utils/table-size-picker/table-size-picker.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { CdkListRecursiveComponent } from './editor/meta-data-tree/cdk-list-recursive/cdk-list-recursive.component';
import { AddLinkDialogComponent } from './editor/add-link-dialog/add-link-dialog.component';
import { ArphaInputComponent } from './layout/design/arpha-input/arpha-input.component';
import { ArphaButtonComponent } from './layout/design/arpha-button/arpha-button.component';
import { ArphaCheckboxComponent } from './layout/design/arpha-checkbox/arpha-checkbox.component';
import { ArphaToggleButtonComponent } from './layout/design/arpha-toggle-button/arpha-toggle-button.component';
import { LandingComponent } from './layout/landing/landing.component';
import { LoginComponent } from './layout/login/login.component';
import { ChangeComponent } from './editor/changes-section/change/change.component';
import { ValidationSectionComponent } from './editor/validation-section/validation-section.component';

const globalRippleConfig: RippleGlobalOptions = {
  disabled: true,
  animation: {
    enterDuration: 0,
    exitDuration: 0
  }
};

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    EditorMenuComponent,
    MetaDataTreeComponent,
    CommentsSectionComponent,
    ChangesSectionComponent,
    ProsemirrorEditorComponent,
    CommentComponent,
    AddCommentDialogComponent,
    MainComponent,
    TableSizePickerComponent,
    ThemeToggleComponent,
    CdkListRecursiveComponent,
    AddLinkDialogComponent,
    ArphaInputComponent,
    ArphaButtonComponent,
    ArphaCheckboxComponent,
    ArphaToggleButtonComponent,
    LandingComponent,
    LoginComponent,
    ChangeComponent,
    ValidationSectionComponent,
  ],
  imports: [
    provideFirebaseApp(() => initializeApp({
      apiKey: 'AIzaSyA3W87Y6Ph2Evh8E-YPYI3oWSdhAb6Lxus',
      authDomain: 'arte-soft.firebaseapp.com',
      databaseURL: 'https://arte-soft.firebaseio.com',
      projectId: 'arte-soft',
      storageBucket: 'arte-soft.appspot.com',
      messagingSenderId: '776064193529',
      appId: '1:776064193529:web:9fbf7aa008a117fc3a2328',
      measurementId: 'G-G76VN4T29R'
    })),
    provideFirestore(() => getFirestore()),
    BrowserModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    HttpClientModule,
    AppRoutingModule,
    //NgxProsemirrorModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('editor-service-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stables
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [STORAGE_PROVIDERS,
    {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig},
    {provide: WindowToken, useFactory: windowProvider}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public iconsRegisterService: IconsRegisterService) {

  }


}
