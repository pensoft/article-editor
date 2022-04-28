import { HTTP_INTERCEPTORS, HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { Compiler, CompilerFactory, COMPILER_OPTIONS, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { SignupComponent } from '@app/layout/pages/signup/signup.component';
import { HTTPReqResInterceptor } from '@core/services/http-req-res.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MaterialModule } from 'src/app/shared/material.module';
import { STORAGE_PROVIDERS } from 'src/app/shared/storage.service';
import { ThemeToggleComponent } from 'src/app/layout/widgets/thema-toggle/theme-toggle.component';
import { windowProvider, WindowToken } from 'src/app/shared/window';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { EditorMenuComponent } from './editor/editor-menu/editor-menu.component';
import { MetaDataTreeComponent } from './editor/meta-data-tree/meta-data-tree.component';
import { CommentsSectionComponent } from './editor/comments-section/comments-section.component';
import { ChangesSectionComponent } from './editor/changes-section/changes-section.component';
import { CommentComponent } from './editor/comments-section/comment/comment.component';
import { AddCommentDialogComponent } from './editor/add-comment-dialog/add-comment-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MainComponent } from './layout/pages/main/main.component';
import { MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions } from '@angular/material/core';
import { IconsRegisterService } from './shared/icons-register.service';
import { TableSizePickerComponent } from './editor/utils/table-size-picker/table-size-picker.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkListRecursiveComponent } from './editor/meta-data-tree/cdk-list-recursive/cdk-list-recursive.component';
import { AddLinkDialogComponent } from './editor/add-link-dialog/add-link-dialog.component';
import { ArphaInputComponent } from './layout/widgets/arpha-input/arpha-input.component';
import { ArphaButtonComponent } from './layout/widgets/arpha-button/arpha-button.component';
import { ArphaCheckboxComponent } from './layout/widgets/arpha-checkbox/arpha-checkbox.component';
import { ArphaToggleButtonComponent } from './layout/widgets/arpha-toggle-button/arpha-toggle-button.component';
import { LandingComponent } from './layout/pages/landing/landing.component';
import { LoginComponent } from './layout/pages/login/login.component';
import { ChangeComponent } from './editor/changes-section/change/change.component';
import { ValidationSectionComponent } from './editor/validation-section/validation-section.component';
import { ArphaNavigationComponent } from './layout/widgets/arpha-navigation/arpha-navigation.component';
import { EditorSidebarComponent } from './layout/widgets/editor-sidebar/editor-sidebar.component';
import { ValidationSpinnerComponent } from 'src/app/editor/validation-section/validation-spinner/validation-spinner.component';
import { InsertImageDialogComponent } from './editor/dialogs/insert-image-dialog/insert-image-dialog.component';
import { InsertDiagramDialogComponent } from './editor/dialogs/insert-diagram-dialog/insert-diagram-dialog.component';
import { InsertSpecialSymbolDialogComponent } from './editor/dialogs/insert-special-symbol-dialog/insert-special-symbol-dialog.component';
import { FormioAppConfig, FormioModule } from '@formio/angular';
import { AppConfig } from './config';
import { SectionComponent } from './editor/section/section.component';
import { registerFormIOComponents } from './editor/formioComponents/registerFormIOComponents';
import { ArticleComponent } from './editor/article/article.component';
import { EditSectionDialogComponent } from './editor/dialogs/edit-section-dialog/edit-section-dialog.component';
import { MatFormioModule } from './formio-angular-material/angular-material-formio.module';
import { TaxonomicCoverageComponent } from './editor/formioComponents/taxonomic-coverage/taxonomic-coverage.component';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';
import { FormControlNameDirective } from './editor/directives/form-control-name.directive';
import { ArticleMetadataComponent } from './editor/article-metadata/article-metadata.component';
import { FiguresDialogComponent } from './editor/dialogs/figures-dialog/figures-dialog.component';
import { AddFigureDialogComponent } from './editor/dialogs/figures-dialog/add-figure-dialog/add-figure-dialog.component';
import { FigureComponent } from './editor/dialogs/figures-dialog/figure/figure.component';
import { LogSwUpdatesService } from './app-services/log-sw-updates.service';
import { PipesModule } from './shared/pipes.module';
import { FigurePreviewComponent } from './editor/formioComponents/figure-preview/figure-preview.component';
import { SectionLeafComponent } from './editor/meta-data-tree/cdk-list-recursive/section-leaf/section-leaf.component';
import { FiguresProsemirrorViewComponent } from './editor/figures-prosemirror-view/figures-prosemirror-view.component';
import { InsertFigureComponent } from './editor/dialogs/figures-dialog/insert-figure/insert-figure.component';
import { VerifyAccountComponent } from './layout/pages/verify-account/verify-account.component';
import { CreateNewProjectComponent } from './layout/pages/create-new-project/create-new-project.component';

import { NgxDropzoneModule } from 'ngx-dropzone';
import { DialogAddFilesComponent } from './layout/pages/create-new-project/dialog-add-files/dialog-add-files.component';
import { ChooseManuscriptDialogComponent } from './editor/dialogs/choose-manuscript-dialog/choose-manuscript-dialog.component';
import { AvatarComponent } from './layout/widgets/avatar/avatar.component';

import { AvatarModule } from 'ngx-avatar';
import { DashboardComponent } from './editor/dashboard/dashboard.component';
import { GravatarModule,GravatarConfig, FALLBACK, } from 'ngx-gravatar';
import { ChooseSectionComponent } from './editor/dialogs/choose-section/choose-section.component';
import { SettingsComponent } from './layout/pages/settings/settings.component';
import { AskBeforeDeleteComponent } from './editor/dialogs/ask-before-delete/ask-before-delete.component';
import { ComplexEditTreeComponent } from './editor/section/complex-edit-tree/complex-edit-tree.component';
import { SnackBarErrorComponentComponent } from './editor/meta-data-tree/snack-bar-error-component/snack-bar-error-component.component';
import { ArticleDataViewComponent } from './editor/dialogs/article-data-view/article-data-view.component';
import { ExportOptionsComponent } from './editor/dialogs/export-options/export-options.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { SectionDataViewComponent } from './editor/dialogs/article-data-view/section-data-view/section-data-view.component';
import { EditBeforeExportComponent } from './editor/dialogs/edit-before-export/edit-before-export.component';
import { PrintElementComponent } from './editor/dialogs/edit-before-export/print-element/print-element.component';
import { CopiedToClipBoardComponent } from './editor/snack-bars/copied-to-clip-board/copied-to-clip-board.component';
import { ProfileComponent } from './layout/pages/profile/profile.component';
import { ProfileInfoComponent } from './layout/pages/profile/profile-info/profile-info.component';
import { MyDevicesComponent } from './layout/pages/profile/profile-info/my-devices/my-devices.component';
import { PasswordSetupComponent } from './layout/pages/profile/profile-info/password-setup/password-setup.component';
import { SingInDetailsComponent } from './layout/pages/profile/profile-info/sing-in-details/sing-in-details.component';
import { RecentPermissionComponent } from './layout/pages/recent-permission/recent-permission.component';
import { PermissionComponent } from './layout/pages/recent-permission/permission/permission.component';
import { RecentComponent } from './layout/pages/recent-permission/recent/recent.component';
import { AddContributorsDialogComponent } from './editor/dialogs/add-contributors-dialog/add-contributors-dialog.component';
import { SearchFilterPipe } from './shared/pipes/search-filter.pipe';
import { LibraryPage } from './layout/pages/library/library.component';
import { ReferenceEditComponent } from './layout/pages/library/reference-edit/reference-edit.component';
import { CitateReferenceDialogComponent } from './layout/pages/library/citate-reference-dialog/citate-reference-dialog.component';
import { FakeBackendInterceptor } from './core/services/fakeBackendProvide';
import { SaveComponent } from './layout/pages/library/reference-edit/save/save.component';
import { ExportJsonLdComponent } from './editor/dialogs/export-json-ld/export-json-ld.component';


export function createCompiler(compilerFactory: CompilerFactory) {
  return compilerFactory.createCompiler();
}

const gravatarConfig: GravatarConfig = {
  fallback: FALLBACK.robohash,
};

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    TaxonomicCoverageComponent,
    EditorMenuComponent,
    MetaDataTreeComponent,
    CommentsSectionComponent,
    ChangesSectionComponent,
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
    SignupComponent,
    ChangeComponent,
    ValidationSectionComponent,
    ArphaNavigationComponent,
    EditorSidebarComponent,
    ValidationSpinnerComponent,
    InsertImageDialogComponent,
    InsertDiagramDialogComponent,
    InsertSpecialSymbolDialogComponent,
    SectionComponent,
    FigurePreviewComponent,
    ArticleDataViewComponent,
    ArticleComponent,
    EditSectionDialogComponent,
    FormControlNameDirective,
    ArticleMetadataComponent,
    FiguresDialogComponent,
    AddFigureDialogComponent,
    FigureComponent,
    SectionLeafComponent,
    FiguresProsemirrorViewComponent,
    InsertFigureComponent,
    VerifyAccountComponent,
    CreateNewProjectComponent,
    DialogAddFilesComponent,
    ChooseManuscriptDialogComponent,
    AvatarComponent,
    DashboardComponent,
    ChooseSectionComponent,
    SettingsComponent,
    AskBeforeDeleteComponent,
    ComplexEditTreeComponent,
    SnackBarErrorComponentComponent,
    ExportOptionsComponent,
    SectionDataViewComponent,
    EditBeforeExportComponent,
    PrintElementComponent,
    CopiedToClipBoardComponent,
    ProfileComponent,
    ProfileInfoComponent,
    MyDevicesComponent,
    PasswordSetupComponent,
    PasswordSetupComponent,
    MyDevicesComponent,
    SingInDetailsComponent,
    RecentPermissionComponent,
    PermissionComponent,
    RecentComponent,
    AddContributorsDialogComponent,
    SearchFilterPipe,
    LibraryPage,
    ReferenceEditComponent,
    CitateReferenceDialogComponent,
    SaveComponent,
    ExportJsonLdComponent,
  ],
  imports: [
    HttpClientJsonpModule,
    PipesModule,
    NgxJsonViewerModule,
    BrowserModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormioModule,
    FormioModule,
    DragDropModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxDropzoneModule,
    GravatarModule.forRoot(gravatarConfig),
    ServiceWorkerModule.register('editor-service-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stables
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    NgxSpinnerModule,
    AvatarModule,
  ],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HTTPReqResInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: FakeBackendInterceptor,
      multi: true,
    },
    STORAGE_PROVIDERS,
    { provide: WindowToken, useFactory: windowProvider },
    { provide: FormioAppConfig, useValue: AppConfig },
    { provide: COMPILER_OPTIONS, useValue: {}, multi: true },
    {
      provide: CompilerFactory,
      useClass: JitCompilerFactory,
      deps: [COMPILER_OPTIONS],
    },
    { provide: Compiler, useFactory: createCompiler, deps: [CompilerFactory] },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    public iconsRegisterService: IconsRegisterService,
    injector: Injector,
    private logSWUpdates: LogSwUpdatesService
  ) {
    registerFormIOComponents(injector);
  }
}
