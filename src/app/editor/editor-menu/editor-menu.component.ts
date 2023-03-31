import { AfterViewInit, Compiler, Component, CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlPipe, SafePipe } from '@app/formio-angular-material/components/MaterialComponent';
import { MaterialModule } from '@app/shared/material.module';
import { Subject } from 'rxjs';
import { FormControlNameDirective } from '../directives/form-control-name.directive';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';

@Component({
  selector: 'app-editor-menu',
  templateUrl: './editor-menu.component.html',
  styleUrls: ['./editor-menu.component.scss']
})
export class EditorMenuComponent implements OnInit {
  @ViewChild('container', { read: ViewContainerRef }) container?: ViewContainerRef;

  constructor(private compiler: Compiler,private rposemirrorEditorsService:ProsemirrorEditorsService) { }

  ngOnInit(): void {
    this.rposemirrorEditorsService.setIntFunction(this.interpolateTemplate)
  }

  interpolateTemplate = (htmlToCompile: string, data: any, formGroup: FormGroup=new FormGroup({}), template?, options?: any) => {
    let compiler = this.compiler
    let container = this.container
    const regex1 = /\[innerHTML\]="[^\"\|]+"/gm

    if (options?.hTag) {
      htmlToCompile = htmlToCompile.replace(/\${level}/gm, `${options.hTag > 6 ? 6 : options.hTag}`)
    } else if (options?.hTag == 0) {
      htmlToCompile = htmlToCompile.replace(/\${level}/gm, `2`);
    }

    if (data.tableContent) {
      data.tableContent = data.tableContent.replace(/<p[^>]*><\/p>/gm, "")
    }

    let array1;
    while ((array1 = regex1.exec(htmlToCompile)) !== null) {
      let newStr = array1[0].slice(0,array1[0].length-1)
      htmlToCompile = htmlToCompile.replace(array1[0],newStr+' | safehtml"')
    }

    function getRenderedHtml(templateString: string) {
      return new Promise(resolve => {
        let html = { template: templateString }
        compiler.clearCache();
        let afterViewInitSubject = new Subject()
        // let regExp = new RegExp(">[^<>{{]*<*b*r*>*[^<>{{]*{{[^.}}]*.([^}}]*)}}[^<]*", "g");
        // let matchs = templateString.match(regExp);
        // matchs?.forEach((match) => {
        //   let regexGroups = regExp.exec(match);
        //   let formControlName = regexGroups![1];
        //   templateString = templateString.replace(match, ` formControlName="${formControlName}"` + match)
        // })
        const component = Component({
          ...html,
          styles: [':host {table: {border: red}}'],

        })(class implements AfterViewInit {
          data = data ? JSON.parse(JSON.stringify(data)) : data;

          formGroup = formGroup;

          getCharValue(i:number){
            return String.fromCharCode(97 + i)
          }
          ngAfterViewInit() {
            afterViewInitSubject.next('build')
          }
        });

        const module = NgModule({
          imports: [
            BrowserModule,
            FormsModule,
            ReactiveFormsModule,
            MaterialModule
          ],
          declarations: [component
           ,FormControlNameDirective,
           SafePipe,
           SafeHtmlPipe
          ],
          schemas: [CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA]
        })(class newModule {
        });

        compiler.compileModuleAndAllComponentsAsync(module)
          .then(factories => {
            const componentFactory = factories.componentFactories[0];
            const componentRef = container!.createComponent(componentFactory);
            let sub = afterViewInitSubject.subscribe(() => {
              sub.unsubscribe()
              let clearString = componentRef.location.nativeElement.innerHTML
              resolve(clearString)
              compiler.clearCache();
            })
          });
      })
    }

    /* interpolateTemplate(htmlToCompile: string, data: any, formGroup: FormGroup) {
      let compiler = this.compiler
      let container = this.container
      function getRenderedHtml(templateString: string) {
        return new Promise(resolve => {
          let html = { template: templateString }
          compiler.clearCache();
          let afterViewInitSubject = new Subject()
          // let regExp = new RegExp(">[^<>{{]*<*b*r*>*[^<>{{]*{{[^.}}]*.([^}}]*)}}[^<]*", "g");
          // let matchs = templateString.match(regExp);
          // matchs?.forEach((match) => {
          //   let regexGroups = regExp.exec(match);
          //   let formControlName = regexGroups![1];
          //   templateString = templateString.replace(match, ` formControlName="${formControlName}"` + match)
          // })
          const component = Component({
            ...html,
            styles: [':host {table: {border: red}}'],

          })(class implements AfterViewInit {
            data = data;
            formGroup = formGroup;

            ngAfterViewInit() {
              afterViewInitSubject.next('build')
            }
          });

          const module = NgModule({
            imports: [
              BrowserModule,
              FormsModule,
              ReactiveFormsModule,
              MaterialModule
            ],
            declarations: [component,
              FormControlNameDirective
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
          })(class newModule {
          });

          compiler.compileModuleAndAllComponentsAsync(module)
            .then(factories => {
              const componentFactory = factories.componentFactories[0];
              const componentRef = container!.createComponent(componentFactory);
              let sub = afterViewInitSubject.subscribe(() => {
                sub.unsubscribe()
                let clearString = componentRef.location.nativeElement.innerHTML
                resolve(clearString)
              })
            });
        })
      }

      return getRenderedHtml(`<ng-container [formGroup]="formGroup">
      <div contenteditableNode="true" translate="no" class="ProseMirror ProseMirror-example-setup-style ProseMirror-focused">${htmlToCompile}
      </div></ng-container>`)
    } */

    if(template) {
      return getRenderedHtml(`<ng-container *ngIf="formGroup" [formGroup]="formGroup">
    <div>
            <ng-container  *ngTemplateOutlet="${template}"></ng-container>
            ${htmlToCompile}
    </div></ng-container>`);
    } else {
      return getRenderedHtml(`<ng-container *ngIf="formGroup" [formGroup]="formGroup">
    <div>${htmlToCompile}
    </div></ng-container>`)
    }
  }

}
