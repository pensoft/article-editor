import { Injector } from "@angular/core";
import { registerComponent } from "src/app/formio-angular-material/angular-material-formio.module";
import { EditorSectionComponent } from "./editor/editor-section.component";
import { HtmlEditorComponent } from "./html-editor/html-editor.component";
import { TaxonomicCoverageComponent } from "./taxonomic-coverage/taxonomic-coverage.component";

export function registerFormIOComponents(injector:Injector){
    registerComponent('editorContentType', EditorSectionComponent);
    registerComponent('taxonomicCoverageContentType', TaxonomicCoverageComponent);
    registerComponent('codemirror-html-editor', HtmlEditorComponent);
}