import { uuidv4 } from "lib0/random";
import { articleSection, editorData, editorMeta } from "./interfaces/articleSection";
import { formIOSchema, defaultValues } from '../section/formIO.schema';

export function editorFactory(data?: editorMeta): editorData {
  return { editorId: uuidv4(), menuType: 'fullMenu', editorMeta: data }
}

let taxonomicCoverageTemplate = `<h2 contenteditable="false">Taxonomic coverage</h2>
<p class="set-align-left" formControlName="description">
</p>
<div class="tableWrapper">
	<table style="min-width: 50px;" formArrayName="taxonomicCoverage">
		<thead>
			<tr>
				<td>
					<p contenteditable="false">
						<b>Rank</b>
					</p>
				</td>
				<td>
					<p contenteditable="false">
						<b>Scientific Name</b>
					</p>
				</td>
				<td>
					<p contenteditable="false">
						<b>Common Name</b>
					</p>
				</td>
			</tr>
		</thead>
		<tbody>
			<tr *ngFor="let control of formGroup.controls.taxonomicCoverage.controls;let i=index" formGroupName="{{i}}">
				<td>
					<p class="set-align-left" formControlName="rank" contenteditable="false">
					</p>
				</td>
				<td>
					<p class="set-align-left " formControlName="scientificName">
					</p>
				</td>
				<td>
					<p class="set-align-left " formControlName="commonName">
					</p>
				</td>
			</tr>
		</tbody>
	</table>
</div>`;


let collectionDataTemplate = `<h2 contenteditable="false">Collection Data</h2>
<inline-span contenteditable="false">
    <b>Collection Name:</b>
</inline-span>
<inline-text style="padding-left:8px" formControlName="collectionName"></inline-text>
<br>
<inline-span contenteditable="false">
    <b>Collection identifier:</b>
    </inline-span>
<inline-text style="padding-left:8px" formControlName="collectionIdentifier"></inline-text>
<br>
<inline-span contenteditable="false">
    <b>Parent collection identifier:</b>
    </inline-span>
<inline-text style="padding-left:8px" formControlName="parentCollectionIdentifier"></inline-text>
<br>
<inline-span contenteditable="false">
    <b>Specimen preservation method:</b>
</inline-span>
<inline-text style="padding-left:8px" formControlName="specimenPreservationMethod"></inline-text>
<br>
<inline-span contenteditable="false">
    <b>Curatorial unit:</b>
</inline-span>
<inline-text style="padding-left:8px" formControlName="curatorialUnit"></inline-text>`;

export const articleBasicStructure: articleSection[] = [
  {
    title: { type: 'content', contentData: 'Title233', titleContent: 'Taxonomic coverage', key: 'titleContent' },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
    sectionContent: {
      type: 'TaxonTreatmentsMaterial', contentData: editorFactory(
        {
          prosemirrorJsonTemplate:
          {
            "type": "doc",
          }
        }), key: 'sectionContent'
    },
    sectionID: uuidv4(),
    active: false,
    edit: { bool: true, main: true },
    add: { bool: true, main: false },
    delete: { bool: true, main: false },
    mode: 'documentMode',
    formIOSchema: formIOSchema.taxonomicCoverage,
    defaultFormIOValues: defaultValues['taxonomicCoverage'],
    prosemirrorHTMLNodesTempl: taxonomicCoverageTemplate,
    children: [],
  },
  {
    title: { type: 'content', contentData: 'Title233', titleContent: 'Colection Data', key: 'titleContent' },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
    sectionContent: {
      type: 'TaxonTreatmentsMaterial', contentData: editorFactory(
        {
          prosemirrorJsonTemplate:
          {
            "type": "doc",
          }
        }), key: 'sectionContent'
    },
    sectionID: uuidv4(),
    active: false,
    edit: { bool: true, main: true },
    add: { bool: true, main: false },
    delete: { bool: true, main: false },
    mode: 'documentMode',
    formIOSchema: formIOSchema.collectionData,
    defaultFormIOValues: defaultValues['collectionData'],
    prosemirrorHTMLNodesTempl: collectionDataTemplate,
    children: []
  }];
