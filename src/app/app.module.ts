import { HTTP_INTERCEPTORS, HttpClient, HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, Compiler, COMPILER_OPTIONS, CompilerFactory, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule, SwRegistrationOptions } from '@angular/service-worker';
import { SignupComponent } from '@app/layout/pages/signup/signup.component';
import { HTTPReqResInterceptor } from '@core/services/http-req-res.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MaterialModule } from 'src/app/shared/material.module';
import { STORAGE_PROVIDERS } from 'src/app/shared/storage.service';
import { ThemeToggleComponent } from 'src/app/layout/widgets/thema-toggle/theme-toggle.component';
import { windowProvider, WindowToken } from 'src/app/shared/window';
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
import { IconsRegisterService } from '@shared/icons-register.service';
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
import {
  ValidationSpinnerComponent
} from 'src/app/editor/validation-section/validation-spinner/validation-spinner.component';
import { InsertImageDialogComponent } from './editor/dialogs/insert-image-dialog/insert-image-dialog.component';
import { InsertDiagramDialogComponent } from './editor/dialogs/insert-diagram-dialog/insert-diagram-dialog.component';
import {
  InsertSpecialSymbolDialogComponent
} from './editor/dialogs/insert-special-symbol-dialog/insert-special-symbol-dialog.component';
import { FormioAppConfig, FormioModule } from '@formio/angular';
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
import {
  ChooseManuscriptDialogComponent
} from './editor/dialogs/choose-manuscript-dialog/choose-manuscript-dialog.component';
import { AvatarComponent } from './layout/widgets/avatar/avatar.component';

import { AvatarModule } from 'ngx-avatar';
import { DashboardComponent } from './editor/dashboard/dashboard.component';
import { FALLBACK, GravatarConfig, GravatarModule, } from 'ngx-gravatar';
import { ChooseSectionComponent } from './editor/dialogs/choose-section/choose-section.component';
import { SettingsComponent } from './layout/pages/settings/settings.component';
import { AskBeforeDeleteComponent } from './editor/dialogs/ask-before-delete/ask-before-delete.component';
import { ComplexEditTreeComponent } from './editor/section/complex-edit-tree/complex-edit-tree.component';
import {
  SnackBarErrorComponentComponent
} from './editor/meta-data-tree/snack-bar-error-component/snack-bar-error-component.component';
import { ArticleDataViewComponent } from './editor/dialogs/article-data-view/article-data-view.component';
import { ExportOptionsComponent } from './editor/dialogs/export-options/export-options.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import {
  SectionDataViewComponent
} from './editor/dialogs/article-data-view/section-data-view/section-data-view.component';
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
import {
  AddContributorsDialogComponent
} from './editor/dialogs/add-contributors-dialog/add-contributors-dialog.component';
import { SearchFilterPipe } from '@shared/pipes/search-filter.pipe';
import { ReferenceEditComponent } from './layout/pages/library/reference-edit/reference-edit.component';
import {
  CitateReferenceDialogComponent
} from './layout/pages/library/citate-reference-dialog/citate-reference-dialog.component';
import { FakeBackendInterceptor } from '@core/services/fakeBackendProvide';
import { SaveComponent } from './layout/pages/library/reference-edit/save/save.component';
import { ExportJsonLdComponent } from './editor/dialogs/export-json-ld/export-json-ld.component';
import { TreeChecklistComponent } from './editor/section/tree-checklist/tree-checklist.component';
import { SkipCurrentPipe } from './skip-current.pipe';
import { CurrentColorPipe } from './current-color.pipe';
import { TaxonSectionComponent } from './editor/section/taxon-section/taxon-section.component';
import { MaterialsSectionComponent } from "@app/editor/section/materials-section/materials-section.component";
import { MaterialSectionComponent } from "@app/editor/section/material-section/material-section.component";
import { RefsApiService } from "@app/layout/pages/library/lib-service/refs-api.service";
import { OauthCallbackComponent } from "@app/layout/pages/oauth-callback/oauth-callback.component";
import { CookieService } from "ngx-cookie-service";
import { CommentsInterceptorService } from '@core/services/comments/comments-interceptor.service';
import { TestingComponent } from './editor/dialogs/testing/testing.component';
import {
  SendInvitationComponent
} from './editor/dialogs/add-contributors-dialog/send-invitation/send-invitation.component';
import {
  EditContributorComponent
} from './editor/dialogs/add-contributors-dialog/edit-contributor/edit-contributor.component';
import {
  CollaboratorsAutoCompleteComponent
} from './editor/comments-section/collaborators-auto-complete/collaborators-auto-complete.component';
import { EmailPipe } from './editor/comments-section/email.pipe';
import {
  EditCommentDialogComponent
} from './editor/comments-section/edit-comment-dialog/edit-comment-dialog.component';
import {
  CantOpenArticleDialogComponent
} from './layout/widgets/arpha-navigation/cant-open-article-dialog/cant-open-article-dialog.component';
import {
  UsersRoleIsChangedComponent
} from './layout/widgets/arpha-navigation/users-role-is-changed/users-role-is-changed.component';
import { TestPageComponent } from './casbin/test-page/test-page.component';
import { HasPermissionPipe } from './casbin/permission-pipe/has-permission.pipe';
import { CasbinInterceptor } from './casbin/interceptor/casbin.interceptor';
import { NotificationsComponent } from './layout/widgets/arpha-navigation/notifications/notifications.component';
import {
  AllnotificationsComponent
} from './layout/widgets/arpha-navigation/allnotifications/allnotifications.component';
import { ClickOutsideModule } from 'ng4-click-outside';
import { CitableTablesDialogComponent } from './editor/dialogs/citable-tables-dialog/citable-tables-dialog.component';
import {
  AddTableDialogComponent
} from './editor/dialogs/citable-tables-dialog/add-table-dialog/add-table-dialog.component';
import { CitableTableComponent } from './editor/dialogs/citable-tables-dialog/citable-table/citable-table.component';
import { InsertTableComponent } from './editor/dialogs/citable-tables-dialog/insert-table/insert-table.component';
import { JwtModule } from '@auth0/angular-jwt';
import { ECHO_CONFIG, EchoService } from 'ngx-laravel-echo';
import { EditorContainerComponent } from './editor/editor-container/editor-container.component';
import { SupplementaryFilesDialogComponent } from './editor/dialogs/supplementary-files/supplementary-files.component';
import { EndNotesDialogComponent } from './editor/dialogs/end-notes/end-notes.component';
import {
  AddSupplementaryFileComponent
} from './editor/dialogs/supplementary-files/add-supplementary-file/add-supplementary-file.component';
import {
  SupplementaryFileComponent
} from './editor/dialogs/supplementary-files/supplementary-file/supplementary-file.component';
import {
  InsertSupplementaryFileComponent
} from './editor/dialogs/supplementary-files/insert-supplementary-file/insert-supplementary-file.component';
import { AddEndNoteComponent } from './editor/dialogs/end-notes/add-end-note/add-end-note.component';
import { EndNoteComponent } from './editor/dialogs/end-notes/end-note/end-note.component';
import { InsertEndNoteComponent } from './editor/dialogs/end-notes/insert-end-note/insert-end-note.component';
import { JatsErrorsDialogComponent } from './editor/dialogs/jats-errors-dialog/jats-errors-dialog.component';
import { BoldPipe } from './editor/dialogs/add-contributors-dialog/bold.pipe';
import { RefsInArticleDialogComponent } from './editor/dialogs/refs-in-article-dialog/refs-in-article-dialog.component';
import {
  RefsInArticleCiteDialogComponent
} from './editor/dialogs/refs-in-article-cite-dialog/refs-in-article-cite-dialog.component';
import {
  RefsAddNewInArticleDialogComponent
} from './editor/dialogs/refs-add-new-in-article-dialog/refs-add-new-in-article-dialog.component';
import {
  AddFigureDialogV2Component
} from './editor/dialogs/figures-dialog/add-figure-dialog-v2/add-figure-dialog-v2.component';
import {
  FigureComponentPreviewComponent
} from './editor/dialogs/figures-dialog/add-figure-dialog-v2/figure-component-preview/figure-component-preview.component';
import {
  AddFigureComponentDialogComponent
} from './editor/dialogs/figures-dialog/add-figure-dialog-v2/add-figure-component-dialog/add-figure-component-dialog.component';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig } from '@angular/material/dialog';
import { HeadProsemirrorViewComponent } from './editor/article/head-prosemirror-view/head-prosemirror-view.component';
import {
  FigurePdfPreviewComponent
} from './editor/dialogs/figures-dialog/add-figure-dialog-v2/figure-pdf-preview/figure-pdf-preview.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TaxonsSectionComponent } from './editor/taxons/taxons-section/taxons-section.component';
import { TaxonComponent } from './editor/taxons/taxon/taxon.component';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DropzoneComponent } from './editor/dropzone/dropzone.component';
import { EmbedVideo } from 'ngx-embed-video';
import { LogoutComponent } from './layout/pages/logout/logout.component';
import { InsertVideoComponent } from './editor/dialogs/insert-video/insert-video.component';
import { FunderSectionComponent } from './editor/section/funder-section/funder-section.component';
import { AuthService } from '@core/services/auth.service';
import { FormBuilderConfig } from '@app/form-builder-config';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';


//@ts-ignore
/*EchoInterceptor.prototype.routesToIntercept = [environment.eventDispatcherService, 'event-dispatcher']

EchoInterceptor.prototype.intercept = function (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

  const socketId = this.echoService.socketId;
  if (this.routesToIntercept.some(x => req.url.includes(x)) && this.echoService.connected && socketId) {
    req = req.clone({ headers: req.headers.append('X-Socket-ID', socketId) });
  }

  return next.handle(req);
}*/

export function createCompiler(compilerFactory: CompilerFactory) {
  return compilerFactory.createCompiler();
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}


const gravatarConfig: GravatarConfig = {
  fallback: FALLBACK.robohash,
};

function appInitializer(authService: AuthService) {
  return () => {
    return new Promise((resolve) => {
      authService.getUserInfo().subscribe().add(resolve);
    });
  };
}

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    TaxonomicCoverageComponent,
    EditorMenuComponent,
    MetaDataTreeComponent,
    CommentsSectionComponent,
    ChangesSectionComponent,
    OauthCallbackComponent,
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
    FigureComponent,
    SectionLeafComponent,
    FiguresProsemirrorViewComponent,
    InsertFigureComponent,
    AddFigureComponentDialogComponent,
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
    ReferenceEditComponent,
    CitateReferenceDialogComponent,
    SaveComponent,
    ExportJsonLdComponent,
    TreeChecklistComponent,
    SkipCurrentPipe,
    CurrentColorPipe,
    TaxonSectionComponent,
    MaterialsSectionComponent,
    MaterialSectionComponent,
    TestingComponent,
    SendInvitationComponent,
    EditContributorComponent,
    CollaboratorsAutoCompleteComponent,
    EmailPipe,
    EditCommentDialogComponent,
    CantOpenArticleDialogComponent,
    UsersRoleIsChangedComponent,
    TestPageComponent,
    HasPermissionPipe,
    BoldPipe,
    NotificationsComponent,
    AllnotificationsComponent,
    CitableTablesDialogComponent,
    AddTableDialogComponent,
    CitableTableComponent,
    InsertTableComponent,
    EditorContainerComponent,
    SupplementaryFilesDialogComponent,
    EndNotesDialogComponent,
    SupplementaryFileComponent,
    AddSupplementaryFileComponent,
    SupplementaryFileComponent,
    InsertSupplementaryFileComponent,
    AddEndNoteComponent,
    EndNoteComponent,
    InsertEndNoteComponent,
    JatsErrorsDialogComponent,
    RefsInArticleDialogComponent,
    RefsInArticleCiteDialogComponent,
    RefsAddNewInArticleDialogComponent,
    AddFigureDialogV2Component,
    FigureComponentPreviewComponent,
    HeadProsemirrorViewComponent,
    FigurePdfPreviewComponent,
    TaxonsSectionComponent,
    TaxonComponent,
    DropzoneComponent,
    LogoutComponent,
    InsertVideoComponent,
    FunderSectionComponent,
  ],
  imports: [
    HttpClientJsonpModule,
    PipesModule,
    DropzoneModule,
    NgxJsonViewerModule,
    BrowserModule,
    MaterialModule,
    FormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: function () {
          return localStorage.getItem("access_token");
        },
      },
    }),
    ReactiveFormsModule,
    MatFormioModule,
    FormioModule,
    ClickOutsideModule,
    DragDropModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxDropzoneModule,
    GravatarModule.forRoot(gravatarConfig),
    AvatarModule,
    ServiceWorkerModule.register('editor-service-worker.js'),
    NgxSpinnerModule,
    TranslateModule.forRoot({
      defaultLanguage: 'bg',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    EmbedVideo.forRoot(),
  ],

  providers: [
    EchoService,
    {
      provide: ECHO_CONFIG,
      deps:[AppConfig],
      useFactory: (config: AppConfig) => ({
        userModel: 'users',
        notificationNamespace: 'App\\Notifications',
        options: {
          broadcaster: 'socket.io',
          host: config.eventDispatcherService,
        }
      })
    },
    {
      provide: SwRegistrationOptions,
      useFactory: (config: AppConfig) => ({
        enabled: config.production,
        // Register the ServiceWorker as soon as the app is stables
        // or after 30 seconds (whichever comes first).
        registrationStrategy: 'registerWhenStable:30000',
      }),
      deps: [AppConfig]
    },
    {
      provide: 'API_GATEWAY_SERVICE',
      useFactory: (config: AppConfig) => config.apiGatewayService,
      deps: [AppConfig]
    },
    {
      provide: 'AUTH_SERVICE',
      useFactory: (config: AppConfig) => config.authService,
      deps: [AppConfig]
    },
    {
      provide: APP_CONFIG,
      useFactory: (config: AppConfig) => config,
      deps: [AppConfig]
    },
    HasPermissionPipe,
    BoldPipe,
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HTTPReqResInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: FakeBackendInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CommentsInterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CasbinInterceptor,
      multi: true,
    },
    STORAGE_PROVIDERS,
    { provide: WindowToken, useFactory: windowProvider },
    { provide: FormioAppConfig, useValue: FormBuilderConfig },
    { provide: COMPILER_OPTIONS, useValue: {}, multi: true },
    {
      provide: CompilerFactory,
      useClass: JitCompilerFactory,
      deps: [COMPILER_OPTIONS],
    },
    { provide: Compiler, useFactory: createCompiler, deps: [CompilerFactory] },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        ...new MatDialogConfig(),
        autoFocus: false,
        restoreFocus: false,
      } as MatDialogConfig,
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    public iconsRegisterService: IconsRegisterService,
    injector: Injector,
    private logSWUpdates: LogSwUpdatesService,
    private refsAPI: RefsApiService,
  ) {
    registerFormIOComponents(injector);
  }
}
