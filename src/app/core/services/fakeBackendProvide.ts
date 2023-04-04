import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';

import { Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {AuthService} from './auth.service';
import {basicStyle, harvardstyle, pensoftStyle} from '@app/layout/pages/library/data/styles';
import {journalTree} from "@core/services/journalTreeConstants";
import {materials} from "@core/services/custom_sections/materials";
import {treatmentSections} from "@core/services/custom_sections/treatment_sections";
import {externalLinks, taxonSection} from "@core/services/custom_sections/taxon";
import {taxonTreatmentSection} from "@core/services/custom_sections/taxon_treatment_section";
import {treatmentSectionsSubsection} from "@core/services/custom_sections/tratment_sections_subsection";

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  private tokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  references: any[] = [];

  constructor(
    private _authservice: AuthService
  ) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this._authservice.getToken();
    if (token && req.url.endsWith('/journaltree') && req.method === 'GET') {
      return of(new HttpResponse({
        status: 200, body: journalTree
      }));
    }
    if (token && req.url.endsWith('/references/types') && req.method === 'GET') {
      return of(new HttpResponse({
        status: 200, body: {
          data: ReferenceTypesData1
        }
      }));
    }
    if (token && req.url.endsWith('/references/styles1') && req.method === 'GET') {
      return of(new HttpResponse({
        status: 200, body: {
          data: styles3
        }
      }));
    }

    // и останалите секции да се дублират!!!
    // if (token && req.url.endsWith('/9902') && req.method === 'GET') {
    let customSections = [treatmentSections, taxonTreatmentSection, taxonSection, externalLinks, materials, treatmentSectionsSubsection];
    if (token && customSections.some((section: any) => {
      return req.url.endsWith(`/${section.id}`)
    }) && req.method === 'GET') {
      const customSection = customSections.find(section => {
        return req.url.endsWith(`/${section.id}`)
      })
      return of(new HttpResponse({
        status: 200, body: {
          data: JSON.parse(JSON.stringify(customSection))

        }
      }));
    }

    if (token && req.url.endsWith('/references') && req.method === 'GET') {

      // check local storage if there is saved references if no save the default refs and return

      let references = localStorage.getItem('saved_references')
      if (!references) {
        this.references = defaultReferences;
        localStorage.setItem('saved_references', JSON.stringify(this.references));
      } else {
        this.references = JSON.parse(references);
      }
      return of(new HttpResponse({
        status: 200, body: {
          data: this.references
        }
      }));
    }
    if (token && req.url.endsWith('/references') && req.method === 'POST') {
      let newRef = req.body.ref;
      this.references.push(newRef);
      localStorage.setItem('saved_references', JSON.stringify(this.references));
      return of(new HttpResponse({
        status: 200, body: {
          data: this.references
        }
      }));
    }
    if (token && req.url.endsWith('/references') && req.method === 'PATCH') {
      let newRef = req.body.ref;
      let global = req.body.global;
      newRef.refData.global = global;
      let i = this.references.findIndex((val) => {
        return val.refData.referenceData.id == newRef.refData.referenceData.id;
      })
      if (i > -1) {
        this.references[i] = newRef;
      }
      localStorage.setItem('saved_references', JSON.stringify(this.references));
      return of(new HttpResponse({
        status: 200, body: {
          data: this.references
        }
      }));
    }
    if (token && req.url.endsWith('/references') && req.method === 'DELETE') {
      let newRef = req.body.ref;
      let i = this.references.findIndex((val) => {
        return val.refData.referenceData.id == newRef.refData.referenceData.id;
      })
      if (i > -1) {
        this.references.splice(i, 1)
      }
      localStorage.setItem('saved_references', JSON.stringify(this.references));
      return of(new HttpResponse({
        status: 200, body: {
          data: this.references
        }
      }));
    }

    return next.handle(req);
  }
}

let styles3 = [
  {
    name: 'harvard-cite-them-right',
    label: 'Harvard Cite Them Right',
  }, {
    name: 'demo-style',
    label: 'CSL Demo Style',
  }, {
    name: 'pensoft-style',
    label: 'Pensoft Style',
  }, {
    name: 'acta-amazonica',
    label: 'Acta Amazonica',
  }, {
    name: 'ios-press-books',
    label: 'IOS Press Books',
  }, {
    name: 'university-of-zabol',
    label: 'University Of Zabol',
  }, {
    name: 'university-of-york-apa',
    label: 'University Of York Apa',
  }, {
    name: 'university-of-lincoln-harvard',
    label: 'University Of Lincoln Harvarf',
  }, {
    name: 'university-of-york-harvard-environment',
    label: 'University Of York Harvard Environment',
  }, {
    name: 'pisa-university-press',
    label: 'Pisa University Press',
  }
]

let styles1 = [
  {
    name: 'harvard-cite-them-right',
    label: 'Harvard Cite Them Right',
    style: harvardstyle,
    last_modified: 1649665699315,
  }, {
    name: 'demo-style',
    label: 'CSL Demo',
    style: basicStyle,
    last_modified: 1649665699315,
  }, {
    name: 'pensoft-style',
    label: 'Pensoft',
    style: pensoftStyle,
    last_modified: 1649665699315,
  }
]
let styles2 = [{
  name: 'harvard-cite-them-right',
  label: 'Harvard Cite Them Right',
  style: harvardstyle,
  last_modified: 1649665790828,
}, {
  name: 'demo-style',
  label: 'CSL Demo',
  style: basicStyle,
  last_modified: 1649665790828,
}, {
  name: 'pensoft-style',
  label: 'Pensoft',
  style: pensoftStyle,
  last_modified: 1649665790828,
}
]

let ReferenceTypesData1 = [
  {
    name: 'JOURNAL ARTICLE',
    label: 'Journal Article',
    type: "article-journal",
    last_modified: 1649665699315,
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {}
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Article title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Journal name",
          "tableView": true,
          "key": "container-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Volume",
          "tableView": true,
          "key": "volume",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Issue",
          "tableView": true,
          "key": "issue",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Start page - EndPage",
          "tableView": true,
          "key": "page",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publication Language",
          "tableView": true,
          "key": "language",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "DOI",
          "tableView": true,
          "key": "DOI",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'BOOK',
    label: 'Book',
    last_modified: 1649665699315,
    type: "book",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Book title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Translated title",
          "tableView": true,
          "key": "translated-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Edition",
          "tableView": true,
          "key": "edition",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Volume",
          "tableView": true,
          "key": "volume",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Number of pages",
          "tableView": true,
          "key": "number-of-pages",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publisher",
          "tableView": true,
          "key": "publisher",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "City",
          "tableView": true,
          "key": "city",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "ublication language",
          "tableView": true,
          "key": "language",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "ISBN",
          "tableView": true,
          "key": "ISBN",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "DOI",
          "tableView": true,
          "key": "DOI",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'BOOK CHAPTER',
    label: 'Book Chapter',
    last_modified: 1649665699315,
    type: "chapter",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Chapter title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Book title",
          "tableView": true,
          "key": "container-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Editors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {}
          ],
          "key": "editor",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Volume",
          "tableView": true,
          "key": "volume",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publisher",
          "tableView": true,
          "key": "publisher",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "City",
          "tableView": true,
          "key": "city",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Number of pages",
          "tableView": true,
          "key": "number-of-pages",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publication language",
          "tableView": true,
          "key": "language",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "ISBN",
          "tableView": true,
          "key": "ISBN",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "DOI",
          "tableView": true,
          "key": "DOI",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'CONFERENCE PAPER',
    label: 'Conference Paper',
    last_modified: 1649665699315,
    type: "paper-conference",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Editors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "editor",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Volume",
          "tableView": true,
          "key": "volume",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Book title",
          "tableView": true,
          "key": "container-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Conference name",
          "tableView": true,
          "key": "event-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Conference location",
          "tableView": true,
          "key": "event-place",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Conference date",
          "tableView": true,
          "key": "event-date",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Number of pages",
          "tableView": true,
          "key": "number-of-pages",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publisher",
          "tableView": true,
          "key": "publisher",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "City",
          "tableView": true,
          "key": "city",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Journal name",
          "tableView": true,
          "key": "collection-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Journal volume",
          "tableView": true,
          "key": "journal-volume",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publication language",
          "tableView": true,
          "key": "language",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "ISBN",
          "tableView": true,
          "key": "ISBN",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "DOI",
          "tableView": true,
          "key": "DOI",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'CONFERENCE PROCEEDINGS',
    label: 'Conference Proceedings',
    last_modified: 1649665699315,
    type: "paper-conference",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Volume",
          "tableView": true,
          "key": "volume",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Conference name",
          "tableView": true,
          "key": "event-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Conference location",
          "tableView": true,
          "key": "event-place",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Conference date",
          "tableView": true,
          "key": "event-date",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Number of pages",
          "tableView": true,
          "key": "number-of-pages",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publisher",
          "tableView": true,
          "key": "publisher",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "City",
          "tableView": true,
          "key": "city",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Journal name",
          "tableView": true,
          "key": "collection-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Journal volume",
          "tableView": true,
          "key": "journal-volume",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publication language",
          "tableView": true,
          "key": "language",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "ISBN",
          "tableView": true,
          "key": "ISBN",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "DOI",
          "tableView": true,
          "key": "DOI",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'THESIS',
    label: 'Thesis',
    last_modified: 1649665699315,
    type: "thesis",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Institution",
          "tableView": true,
          "key": "institution",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Book title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Translated title",
          "tableView": true,
          "key": "translated-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publisher",
          "tableView": true,
          "key": "publisher",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "City",
          "tableView": true,
          "key": "city",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Number of pages",
          "tableView": true,
          "key": "number-of-pages",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publication language",
          "tableView": true,
          "key": "language",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "ISBN",
          "tableView": true,
          "key": "ISBN",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "DOI",
          "tableView": true,
          "key": "DOI",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'SOFTWARE / DATA',
    last_modified: 1649665699315,
    label: 'Software / Data',
    type: "software",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Version",
          "tableView": true,
          "key": "version",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publisher",
          "tableView": true,
          "key": "publisher",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Release date",
          "tableView": true,
          "key": "release-date",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'WEBSITE',
    label: 'Website',
    last_modified: 1649665699315,
    type: "webpage",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Date of access",
          "tableView": true,
          "key": "access-date",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'OTHER',
    label: 'Other',
    last_modified: 1649665699315,
    type: "article",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Notes",
          "tableView": true,
          "key": "notes",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publisher",
          "tableView": true,
          "key": "publisher",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "DOI",
          "tableView": true,
          "key": "DOI",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  }
]
let ReferenceTypesData2 = [
  {
    name: 'JOURNAL ARTICLE',
    label: 'Journal Article',
    type: "article-journal",
    last_modified: 1649665790828,
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {}
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Article title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Journal name",
          "tableView": true,
          "key": "container-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Volume",
          "tableView": true,
          "key": "volume",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Issue",
          "tableView": true,
          "key": "issue",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Start page - EndPage",
          "tableView": true,
          "key": "page",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publication Language",
          "tableView": true,
          "key": "language",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "DOI",
          "tableView": true,
          "key": "DOI",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'BOOK',
    label: 'Book',
    last_modified: 1649665790828,
    type: "book",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },

        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Book title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Translated title",
          "tableView": true,
          "key": "translated-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Edition",
          "tableView": true,
          "key": "edition",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Volume",
          "tableView": true,
          "key": "volume",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Number of pages",
          "tableView": true,
          "key": "number-of-pages",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publisher",
          "tableView": true,
          "key": "publisher",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "City",
          "tableView": true,
          "key": "city",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "ublication language",
          "tableView": true,
          "key": "language",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "ISBN",
          "tableView": true,
          "key": "ISBN",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "DOI",
          "tableView": true,
          "key": "DOI",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'BOOK CHAPTER',
    label: 'Book Chapter',
    last_modified: 1649665790828,
    type: "chapter",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Chapter title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Book title",
          "tableView": true,
          "key": "container-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Editors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {}
          ],
          "key": "editor",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Volume",
          "tableView": true,
          "key": "volume",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publisher",
          "tableView": true,
          "key": "publisher",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "City",
          "tableView": true,
          "key": "city",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Number of pages",
          "tableView": true,
          "key": "number-of-pages",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publication language",
          "tableView": true,
          "key": "language",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "ISBN",
          "tableView": true,
          "key": "ISBN",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "DOI",
          "tableView": true,
          "key": "DOI",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'CONFERENCE PAPER',
    label: 'Conference Paper',
    last_modified: 1649665790828,
    type: "paper-conference",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Editors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "editor",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Volume",
          "tableView": true,
          "key": "volume",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Book title",
          "tableView": true,
          "key": "container-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Conference name",
          "tableView": true,
          "key": "event-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Conference location",
          "tableView": true,
          "key": "event-place",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Conference date",
          "tableView": true,
          "key": "event-date",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Number of pages",
          "tableView": true,
          "key": "number-of-pages",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publisher",
          "tableView": true,
          "key": "publisher",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "City",
          "tableView": true,
          "key": "city",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Journal name",
          "tableView": true,
          "key": "collection-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Journal volume",
          "tableView": true,
          "key": "journal-volume",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publication language",
          "tableView": true,
          "key": "language",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "ISBN",
          "tableView": true,
          "key": "ISBN",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "DOI",
          "tableView": true,
          "key": "DOI",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'CONFERENCE PROCEEDINGS',
    label: 'Conference Proceedings',
    last_modified: 1649665790828,
    type: "paper-conference",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Volume",
          "tableView": true,
          "key": "volume",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Conference name",
          "tableView": true,
          "key": "event-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Conference location",
          "tableView": true,
          "key": "event-place",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Conference date",
          "tableView": true,
          "key": "event-date",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Number of pages",
          "tableView": true,
          "key": "number-of-pages",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publisher",
          "tableView": true,
          "key": "publisher",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "City",
          "tableView": true,
          "key": "city",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Journal name",
          "tableView": true,
          "key": "collection-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Journal volume",
          "tableView": true,
          "key": "journal-volume",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publication language",
          "tableView": true,
          "key": "language",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "ISBN",
          "tableView": true,
          "key": "ISBN",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "DOI",
          "tableView": true,
          "key": "DOI",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'THESIS',
    label: 'Thesis',
    last_modified: 1649665790828,
    type: "thesis",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Institution",
          "tableView": true,
          "key": "institution",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Book title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Translated title",
          "tableView": true,
          "key": "translated-title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publisher",
          "tableView": true,
          "key": "publisher",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "City",
          "tableView": true,
          "key": "city",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Number of pages",
          "tableView": true,
          "key": "number-of-pages",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publication language",
          "tableView": true,
          "key": "language",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "ISBN",
          "tableView": true,
          "key": "ISBN",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "DOI",
          "tableView": true,
          "key": "DOI",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'SOFTWARE / DATA',
    last_modified: 1649665790828,
    label: 'Software / Data',
    type: "software",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Version",
          "tableView": true,
          "key": "version",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publisher",
          "tableView": true,
          "key": "publisher",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Release date",
          "tableView": true,
          "key": "release-date",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'WEBSITE',
    label: 'Website',
    last_modified: 1649665790828,
    type: "webpage",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Date of access",
          "tableView": true,
          "key": "access-date",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  },
  {
    name: 'OTHER',
    label: 'Other',
    last_modified: 1649665790828,
    type: "article",
    formIOScheme: {
      "components": [
        {
          "label": "Authors",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "defaultOpen": false,
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "clearOnHide": false,
          "tableView": false,
          "defaultValue": [
            {
              "first": "",
              "last": "",
              "name": "",
              "role": "",
              "type": ""
            }
          ],
          "key": "authors",
          "type": "datagrid",
          "input": true,
          "components": [
            {
              "label": "First",
              "tableView": true,
              "key": "first",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Last",
              "tableView": true,
              "key": "last",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Name",
              "tableView": true,
              "key": "name",
              "type": "textfield",
              "input": true
            },
            {
              "label": "Role",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Author",
                    "value": "author"
                  },
                  {
                    "label": "Contributor",
                    "value": "contributor"
                  },
                  {
                    "label": "Editor",
                    "value": "editor"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "role",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            },
            {
              "label": "Type",
              "widget": "choicesjs",
              "tableView": true,
              "data": {
                "values": [
                  {
                    "label": "Anonymous",
                    "value": "anonymous"
                  },
                  {
                    "label": "Person",
                    "value": "person"
                  },
                  {
                    "label": "Institution",
                    "value": "institution"
                  }
                ]
              },
              "selectThreshold": 0.3,
              "key": "type",
              "type": "select",
              "indexeddb": {
                "filter": {}
              },
              "input": true
            }
          ]
        },
        {
          "label": "Year of publication",
          "tableView": true,
          "key": "issued",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true,
            pattern: '[0-9]{4}'
          }
        },
        {
          "label": "Title",
          "tableView": true,
          "key": "title",
          "type": "textfield",
          "input": true,
          "clearOnHide": false,
          "validate": {
            "required": true
          }
        },
        {
          "label": "Notes",
          "tableView": true,
          "key": "notes",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "Publisher",
          "tableView": true,
          "key": "publisher",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "URL",
          "tableView": true,
          "key": "URL",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "label": "DOI",
          "tableView": true,
          "key": "DOI",
          "type": "textfield",
          "input": true,
          "clearOnHide": false
        },
        {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
        }
      ]
    }
  }
]
let defaultReferences = [
  {
    "refData": {
      "basicCitation": {
        "data": {
          "html": "(Ivan , 1999)",
          "text": "(Ivan , 1999)",
          "rtx": "(Ivan , 1999)"
        },
        "citatId": "4e676bad-b141-4503-98e3-0124dbbd5774",
        "style": "basicStyle",
        "bibliography": "  <div class=\"csl-entry\">Ivan , N. (1999) “Title,” <i>Journal name</i>, volume(issue), pp. 22–23. doi:doiiiii.</div>\n"
      },
      "referenceData": {
        "author": [
          {
            "family": "Ivan ",
            "given": "Nikolov"
          }
        ],
        "issued": {
          "date-parts": [
            [
              "1999",
              "03",
              "03"
            ]
          ]
        },
        "title": "Title",
        "container-title": "Journal name",
        "volume": "volume",
        "issue": "issue",
        "page": "22-23",
        "language": "language",
        "URL": "https://qweqwe.qweqwe",
        "DOI": "doiiiii",
        "submit": true,
        "type": "article-journal",
        "id": "5d86ba68-1cef-4ed7-8284-1cd3c6cb9761"
      },
      "formioData": {
        "authors": [
          {
            "first": "Ivan ",
            "last": "Nikolov",
            "name": "",
            "role": "author",
            "type": "person"
          }
        ],
        "issued": "1999-03-03",
        "title": "Title",
        "container-title": "Journal name",
        "volume": "volume",
        "issue": "issue",
        "page": "22-23",
        "language": "language",
        "URL": "https://qweqwe.qweqwe",
        "DOI": "doiiiii",
        "submit": true
      },
      "last_modified": 1649665699315,
    },
    "refType": {
      "name": "JOURNAL ARTICLE",
      "label": "Journal Article",
      "type": "article-journal",
      "last_modified": 1649665699315,
      "formIOScheme": {
        "components": [
          {
            "label": "Authors",
            "reorder": false,
            "addAnotherPosition": "bottom",
            "defaultOpen": false,
            "layoutFixed": false,
            "enableRowGroups": false,
            "initEmpty": false,
            "clearOnHide": false,
            "tableView": false,
            "defaultValue": [
              {}
            ],
            "key": "authors",
            "type": "datagrid",
            "input": true,
            "components": [
              {
                "label": "First",
                "tableView": true,
                "key": "first",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Last",
                "tableView": true,
                "key": "last",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Name",
                "tableView": true,
                "key": "name",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Role",
                "widget": "choicesjs",
                "tableView": true,
                "data": {
                  "values": [
                    {
                      "label": "Author",
                      "value": "author"
                    },
                    {
                      "label": "Contributor",
                      "value": "contributor"
                    },
                    {
                      "label": "Editor",
                      "value": "editor"
                    }
                  ]
                },
                "selectThreshold": 0.3,
                "key": "role",
                "type": "select",
                "indexeddb": {
                  "filter": {}
                },
                "input": true
              },
              {
                "label": "Type",
                "widget": "choicesjs",
                "tableView": true,
                "data": {
                  "values": [
                    {
                      "label": "Anonymous",
                      "value": "anonymous"
                    },
                    {
                      "label": "Person",
                      "value": "person"
                    },
                    {
                      "label": "Institution",
                      "value": "institution"
                    }
                  ]
                },
                "selectThreshold": 0.3,
                "key": "type",
                "type": "select",
                "indexeddb": {
                  "filter": {}
                },
                "input": true
              }
            ]
          },
          {
            "label": "Year of publication",
            "tableView": true,
            "key": "issued",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "validate": {
              pattern: '[0-9]{4}'
            }
          },
          {
            "label": "Article title",
            "tableView": true,
            "key": "title",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "validate": {
              "required": true
            }
          },
          {
            "label": "Journal name",
            "tableView": true,
            "key": "container-title",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "validate": {
              "required": true
            }
          },
          {
            "label": "Volume",
            "tableView": true,
            "key": "volume",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "Issue",
            "tableView": true,
            "key": "issue",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "Start page - EndPage",
            "tableView": true,
            "key": "page",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "Publication Language",
            "tableView": true,
            "key": "language",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "URL",
            "tableView": true,
            "key": "URL",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "DOI",
            "tableView": true,
            "key": "DOI",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "type": "button",
            "label": "Submit",
            "key": "submit",
            "disableOnInvalid": true,
            "input": true,
            "tableView": false
          }
        ]
      }
    },
    "refStyle": {
      "name": "harvard-cite-them-right",
      "label": "Harvard Cite Them Right",
      "style": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<style xmlns=\"http://purl.org/net/xbiblio/csl\" class=\"in-text\" version=\"1.0\" demote-non-dropping-particle=\"sort-only\" default-locale=\"en-GB\">\n<info>\n\n    <title>Cite Them Right 11th edition - Harvard</title>\n    <id>http://www.zotero.org/styles/harvard-cite-them-right</id>\n    <link href=\"http://www.zotero.org/styles/harvard-cite-them-right\" rel=\"self\"/>\n    <link href=\"http://www.zotero.org/styles/harvard-cite-them-right-10th-edition\" rel=\"template\"/>\n    <link href=\"http://www.citethemrightonline.com/\" rel=\"documentation\"/>\n    <author>\n      <name>Patrick O'Brien</name>\n    </author>\n    <category citation-format=\"author-date\"/>\n    <category field=\"generic-base\"/>\n    <summary>Harvard according to Cite Them Right, 11th edition.</summary>\n    <updated>2021-09-01T07:43:59+00:00</updated>\n    <rights license=\"http://creativecommons.org/licenses/by-sa/3.0/\">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>\n  </info>\n  <locale xml:lang=\"en-GB\">\n    <terms>\n      <term name=\"editor\" form=\"short\">\n        <single>ed.</single>\n        <multiple>eds</multiple>\n      </term>\n      <term name=\"editortranslator\" form=\"verb\">edited and translated by</term>\n      <term name=\"edition\" form=\"short\">edn.</term>\n    </terms>\n  </locale>\n  <macro name=\"editor\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"any\">\n        <names variable=\"container-author\" delimiter=\", \" suffix=\", \">\n          <name and=\"text\" initialize-with=\". \" delimiter=\", \" sort-separator=\", \" name-as-sort-order=\"all\"/>\n        </names>\n        <choose>\n          <if variable=\"container-author\" match=\"none\">\n            <names variable=\"editor translator\" delimiter=\", \">\n              <name and=\"text\" initialize-with=\".\" name-as-sort-order=\"all\"/>\n              <label form=\"short\" prefix=\" (\" suffix=\")\"/>\n            </names>\n          </if>\n        </choose>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"secondary-contributors\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"none\">\n        <names variable=\"editor translator\" delimiter=\". \">\n          <label form=\"verb\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <name and=\"text\" initialize-with=\".\"/>\n        </names>\n      </if>\n      <else-if variable=\"container-author\" match=\"any\">\n        <names variable=\"editor translator\" delimiter=\". \">\n          <label form=\"verb\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <name and=\"text\" initialize-with=\". \" delimiter=\", \"/>\n        </names>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"author\">\n    <names variable=\"author\">\n      <name and=\"text\" delimiter-precedes-last=\"never\" initialize-with=\".\" name-as-sort-order=\"all\"/>\n      <label form=\"short\" prefix=\" (\" suffix=\")\"/>\n      <et-al font-style=\"italic\"/>\n      <substitute>\n        <names variable=\"editor\"/>\n        <names variable=\"translator\"/>\n        <choose>\n          <if type=\"article-newspaper article-magazine\" match=\"any\">\n            <text variable=\"container-title\" text-case=\"title\" font-style=\"italic\"/>\n          </if>\n          <else>\n            <text macro=\"title\"/>\n          </else>\n        </choose>\n      </substitute>\n    </names>\n  </macro>\n  <macro name=\"author-short\">\n    <names variable=\"author\">\n      <name form=\"short\" and=\"text\" delimiter=\", \" delimiter-precedes-last=\"never\" initialize-with=\". \"/>\n      <et-al font-style=\"italic\"/>\n      <substitute>\n        <names variable=\"editor\"/>\n        <names variable=\"translator\"/>\n        <choose>\n          <if type=\"article-newspaper article-magazine\" match=\"any\">\n            <text variable=\"container-title\" text-case=\"title\" font-style=\"italic\"/>\n          </if>\n          <else>\n            <text macro=\"title\"/>\n          </else>\n        </choose>\n      </substitute>\n    </names>\n  </macro>\n  <macro name=\"access\">\n    <choose>\n      <if variable=\"DOI\">\n        <text variable=\"DOI\" prefix=\"doi:\"/>\n      </if>\n      <else-if variable=\"URL\">\n        <text term=\"available at\" suffix=\": \" text-case=\"capitalize-first\"/>\n        <text variable=\"URL\"/>\n        <group prefix=\" (\" delimiter=\": \" suffix=\")\">\n          <text term=\"accessed\" text-case=\"capitalize-first\"/>\n          <date form=\"text\" variable=\"accessed\">\n            <date-part name=\"day\"/>\n            <date-part name=\"month\"/>\n            <date-part name=\"year\"/>\n          </date>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"number-volumes\">\n    <choose>\n      <if variable=\"volume\" match=\"none\">\n        <group delimiter=\" \" prefix=\"(\" suffix=\")\">\n          <text variable=\"number-of-volumes\"/>\n          <label variable=\"volume\" form=\"short\" strip-periods=\"true\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"title\">\n    <choose>\n      <if type=\"bill book legal_case legislation motion_picture report song thesis webpage graphic\" match=\"any\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <group delimiter=\" \">\n              <text variable=\"title\" font-style=\"italic\"/>\n              <text variable=\"medium\" prefix=\"[\" suffix=\"]\"/>\n            </group>\n            <text macro=\"number-volumes\"/>\n          </group>\n          <text macro=\"edition\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"title\" form=\"long\" quotes=\"true\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"publisher\">\n    <choose>\n      <if type=\"thesis\">\n        <group delimiter=\". \">\n          <text variable=\"genre\"/>\n          <text variable=\"publisher\"/>\n        </group>\n      </if>\n      <else-if type=\"report\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <text variable=\"genre\"/>\n            <text variable=\"number\"/>\n          </group>\n          <group delimiter=\": \">\n            <text variable=\"publisher-place\"/>\n            <text variable=\"publisher\"/>\n          </group>\n        </group>\n      </else-if>\n      <else-if type=\"article-journal article-newspaper article-magazine\" match=\"none\">\n        <group delimiter=\" \">\n          <group delimiter=\", \">\n            <choose>\n              <if type=\"speech\" variable=\"event\" match=\"any\">\n                <text variable=\"event\" font-style=\"italic\"/>\n              </if>\n            </choose>\n            <group delimiter=\": \">\n              <text variable=\"publisher-place\"/>\n              <text variable=\"publisher\"/>\n            </group>\n          </group>\n          <group prefix=\"(\" suffix=\")\" delimiter=\", \">\n            <text variable=\"collection-title\"/>\n            <text variable=\"collection-number\"/>\n          </group>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"year-date\">\n    <choose>\n      <if variable=\"issued\">\n        <date variable=\"issued\">\n          <date-part name=\"year\"/>\n        </date>\n        <text variable=\"year-suffix\"/>\n      </if>\n      <else>\n        <text term=\"no date\"/>\n        <text variable=\"year-suffix\" prefix=\" \"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"locator\">\n    <choose>\n      <if type=\"article-journal\">\n        <text variable=\"volume\"/>\n        <text variable=\"issue\" prefix=\"(\" suffix=\")\"/>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"published-date\">\n    <choose>\n      <if type=\"article-newspaper article-magazine post-weblog speech\" match=\"any\">\n        <date variable=\"issued\">\n          <date-part name=\"day\" suffix=\" \"/>\n          <date-part name=\"month\" form=\"long\"/>\n        </date>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"pages\">\n    <choose>\n      <if type=\"chapter paper-conference article-journal article article-magazine article-newspaper book review review-book report\" match=\"any\">\n        <group delimiter=\" \">\n          <label variable=\"page\" form=\"short\"/>\n          <text variable=\"page\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"container-title\">\n    <choose>\n      <if variable=\"container-title\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <text variable=\"container-title\" font-style=\"italic\"/>\n            <choose>\n              <if type=\"article article-journal\" match=\"any\">\n                <choose>\n                  <if match=\"none\" variable=\"page volume\">\n                    <text value=\"Preprint\" prefix=\"[\" suffix=\"]\"/>\n                  </if>\n                </choose>\n              </if>\n            </choose>\n          </group>\n          <text macro=\"edition\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"edition\">\n    <choose>\n      <if is-numeric=\"edition\">\n        <group delimiter=\" \">\n          <number variable=\"edition\" form=\"ordinal\"/>\n          <text term=\"edition\" form=\"short\" strip-periods=\"true\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"edition\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"container-prefix\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"any\">\n        <text term=\"in\"/>\n      </if>\n    </choose>\n  </macro>\n  <citation et-al-min=\"4\" et-al-use-first=\"1\" disambiguate-add-year-suffix=\"true\" disambiguate-add-names=\"true\" disambiguate-add-givenname=\"true\" collapse=\"year\">\n    <sort>\n      <key macro=\"year-date\"/>\n    </sort>\n    <layout prefix=\"(\" suffix=\")\" delimiter=\"; \">\n      <group delimiter=\", \">\n        <group delimiter=\", \">\n          <text macro=\"author-short\"/>\n          <text macro=\"year-date\"/>\n        </group>\n        <group>\n          <label variable=\"locator\" form=\"short\" suffix=\" \"/>\n          <text variable=\"locator\"/>\n        </group>\n      </group>\n    </layout>\n  </citation>\n  <bibliography and=\"text\" et-al-min=\"4\" et-al-use-first=\"1\">\n    <sort>\n      <key macro=\"author\"/>\n      <key macro=\"year-date\"/>\n      <key variable=\"title\"/>\n    </sort>\n    <layout suffix=\".\">\n      <group delimiter=\". \">\n        <group delimiter=\" \">\n          <text macro=\"author\"/>\n          <text macro=\"year-date\" prefix=\"(\" suffix=\")\"/>\n          <group delimiter=\", \">\n            <text macro=\"title\"/>\n            <group delimiter=\" \">\n              <text macro=\"container-prefix\"/>\n              <text macro=\"editor\"/>\n              <text macro=\"container-title\"/>\n            </group>\n          </group>\n        </group>\n        <text macro=\"secondary-contributors\"/>\n        <text macro=\"publisher\"/>\n      </group>\n      <group delimiter=\", \" prefix=\", \">\n        <text macro=\"locator\"/>\n        <text macro=\"published-date\"/>\n        <text macro=\"pages\"/>\n      </group>\n      <text macro=\"access\" prefix=\". \"/>\n    </layout>\n  </bibliography>\n</style>",
      "last_modified": 1649665699315
    }
  },
  {
    "refData": {
      "basicCitation": {
        "data": {
          "html": "(Anonymous, 1999)",
          "text": "(Anonymous, 1999)",
          "rtx": "(Anonymous, 1999)"
        },
        "citatId": "fa68f98a-6ea3-4d4e-b7c8-cb3578efd1ec",
        "style": "basicStyle",
        "bibliography": "  <div class=\"csl-entry\">Anonymous, A. (1999) <i>BookTitle</i>. Publisher. doi:DOIIII.</div>\n"
      },
      "referenceData": {
        "author": [
          {
            "family": "Anonymous",
            "given": "Anonymous"
          }
        ],
        "institution": "Institution",
        "issued": {
          "date-parts": [
            [
              "1999",
              "04",
              "04"
            ]
          ]
        },
        "title": "BookTitle",
        "translated-title": "TranslatedTitle",
        "publisher": "Publisher",
        "city": "City",
        "number-of-pages": "NumberOfPage",
        "language": "PubLang",
        "URL": "https://dw/wd/wd/wd.wd",
        "ISBN": "ISBSBSBSB",
        "DOI": "DOIIII",
        "submit": true,
        "type": "thesis",
        "id": "aa11cb84-6cf0-465a-9e96-61ffce4a6dca"
      },
      "formioData": {
        "authors": [
          {
            "first": "",
            "last": "",
            "name": "",
            "role": "",
            "type": "anonymous"
          }
        ],
        "institution": "Institution",
        "issued": "1999-04-04",
        "title": "BookTitle",
        "translated-title": "TranslatedTitle",
        "publisher": "Publisher",
        "city": "City",
        "number-of-pages": "NumberOfPage",
        "language": "PubLang",
        "URL": "https://dw/wd/wd/wd.wd",
        "ISBN": "ISBSBSBSB",
        "DOI": "DOIIII",
        "submit": true
      },
      "last_modified": 1649665699315,
    },
    "refType": {
      "name": "THESIS",
      "label": "Thesis",
      "last_modified": 1649665699315,
      "type": "thesis",
      "formIOScheme": {
        "components": [
          {
            "label": "Authors",
            "reorder": false,
            "addAnotherPosition": "bottom",
            "defaultOpen": false,
            "layoutFixed": false,
            "enableRowGroups": false,
            "initEmpty": false,
            "clearOnHide": false,
            "tableView": false,
            "defaultValue": [
              {
                "first": "",
                "last": "",
                "name": "",
                "role": "",
                "type": "anonymous"
              }
            ],
            "key": "authors",
            "type": "datagrid",
            "input": true,
            "components": [
              {
                "label": "First",
                "tableView": true,
                "key": "first",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Last",
                "tableView": true,
                "key": "last",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Name",
                "tableView": true,
                "key": "name",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Role",
                "widget": "choicesjs",
                "tableView": true,
                "data": {
                  "values": [
                    {
                      "label": "Author",
                      "value": "author"
                    },
                    {
                      "label": "Contributor",
                      "value": "contributor"
                    },
                    {
                      "label": "Editor",
                      "value": "editor"
                    }
                  ]
                },
                "selectThreshold": 0.3,
                "key": "role",
                "type": "select",
                "indexeddb": {
                  "filter": {}
                },
                "input": true
              },
              {
                "label": "Type",
                "widget": "choicesjs",
                "tableView": true,
                "data": {
                  "values": [
                    {
                      "label": "Anonymous",
                      "value": "anonymous"
                    },
                    {
                      "label": "Person",
                      "value": "person"
                    },
                    {
                      "label": "Institution",
                      "value": "institution"
                    }
                  ]
                },
                "selectThreshold": 0.3,
                "key": "type",
                "type": "select",
                "indexeddb": {
                  "filter": {}
                },
                "input": true
              }
            ]
          },
          {
            "label": "Institution",
            "tableView": true,
            "key": "institution",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "defaultValue": "Institution"
          },
          {
            "label": "Year of publication",
            "tableView": true,
            "key": "issued",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "validate": {
              "required": true,
              pattern: '[0-9]{4}'
            },
            "defaultValue": "1999-04-04"
          },
          {
            "label": "Book title",
            "tableView": true,
            "key": "title",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "validate": {
              "required": true
            },
            "defaultValue": "BookTitle"
          },
          {
            "label": "Translated title",
            "tableView": true,
            "key": "translated-title",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "defaultValue": "TranslatedTitle"
          },
          {
            "label": "Publisher",
            "tableView": true,
            "key": "publisher",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "validate": {
              "required": true
            },
            "defaultValue": "Publisher"
          },
          {
            "label": "City",
            "tableView": true,
            "key": "city",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "defaultValue": "City"
          },
          {
            "label": "Number of pages",
            "tableView": true,
            "key": "number-of-pages",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "defaultValue": "NumberOfPage"
          },
          {
            "label": "Publication language",
            "tableView": true,
            "key": "language",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "defaultValue": "PubLang"
          },
          {
            "label": "URL",
            "tableView": true,
            "key": "URL",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "defaultValue": "https://dw/wd/wd/wd.wd"
          },
          {
            "label": "ISBN",
            "tableView": true,
            "key": "ISBN",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "defaultValue": "ISBSBSBSB"
          },
          {
            "label": "DOI",
            "tableView": true,
            "key": "DOI",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "defaultValue": "DOIIII"
          },
          {
            "type": "button",
            "label": "Submit",
            "key": "submit",
            "disableOnInvalid": true,
            "input": true,
            "tableView": false,
            "defaultValue": true
          }
        ]
      }
    },
    "refStyle": {
      "name": "harvard-cite-them-right",
      "label": "Harvard Cite Them Right",
      "style": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<style xmlns=\"http://purl.org/net/xbiblio/csl\" class=\"in-text\" version=\"1.0\" demote-non-dropping-particle=\"sort-only\" default-locale=\"en-GB\">\n<info>\n\n    <title>Cite Them Right 11th edition - Harvard</title>\n    <id>http://www.zotero.org/styles/harvard-cite-them-right</id>\n    <link href=\"http://www.zotero.org/styles/harvard-cite-them-right\" rel=\"self\"/>\n    <link href=\"http://www.zotero.org/styles/harvard-cite-them-right-10th-edition\" rel=\"template\"/>\n    <link href=\"http://www.citethemrightonline.com/\" rel=\"documentation\"/>\n    <author>\n      <name>Patrick O'Brien</name>\n    </author>\n    <category citation-format=\"author-date\"/>\n    <category field=\"generic-base\"/>\n    <summary>Harvard according to Cite Them Right, 11th edition.</summary>\n    <updated>2021-09-01T07:43:59+00:00</updated>\n    <rights license=\"http://creativecommons.org/licenses/by-sa/3.0/\">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>\n  </info>\n  <locale xml:lang=\"en-GB\">\n    <terms>\n      <term name=\"editor\" form=\"short\">\n        <single>ed.</single>\n        <multiple>eds</multiple>\n      </term>\n      <term name=\"editortranslator\" form=\"verb\">edited and translated by</term>\n      <term name=\"edition\" form=\"short\">edn.</term>\n    </terms>\n  </locale>\n  <macro name=\"editor\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"any\">\n        <names variable=\"container-author\" delimiter=\", \" suffix=\", \">\n          <name and=\"text\" initialize-with=\". \" delimiter=\", \" sort-separator=\", \" name-as-sort-order=\"all\"/>\n        </names>\n        <choose>\n          <if variable=\"container-author\" match=\"none\">\n            <names variable=\"editor translator\" delimiter=\", \">\n              <name and=\"text\" initialize-with=\".\" name-as-sort-order=\"all\"/>\n              <label form=\"short\" prefix=\" (\" suffix=\")\"/>\n            </names>\n          </if>\n        </choose>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"secondary-contributors\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"none\">\n        <names variable=\"editor translator\" delimiter=\". \">\n          <label form=\"verb\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <name and=\"text\" initialize-with=\".\"/>\n        </names>\n      </if>\n      <else-if variable=\"container-author\" match=\"any\">\n        <names variable=\"editor translator\" delimiter=\". \">\n          <label form=\"verb\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <name and=\"text\" initialize-with=\". \" delimiter=\", \"/>\n        </names>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"author\">\n    <names variable=\"author\">\n      <name and=\"text\" delimiter-precedes-last=\"never\" initialize-with=\".\" name-as-sort-order=\"all\"/>\n      <label form=\"short\" prefix=\" (\" suffix=\")\"/>\n      <et-al font-style=\"italic\"/>\n      <substitute>\n        <names variable=\"editor\"/>\n        <names variable=\"translator\"/>\n        <choose>\n          <if type=\"article-newspaper article-magazine\" match=\"any\">\n            <text variable=\"container-title\" text-case=\"title\" font-style=\"italic\"/>\n          </if>\n          <else>\n            <text macro=\"title\"/>\n          </else>\n        </choose>\n      </substitute>\n    </names>\n  </macro>\n  <macro name=\"author-short\">\n    <names variable=\"author\">\n      <name form=\"short\" and=\"text\" delimiter=\", \" delimiter-precedes-last=\"never\" initialize-with=\". \"/>\n      <et-al font-style=\"italic\"/>\n      <substitute>\n        <names variable=\"editor\"/>\n        <names variable=\"translator\"/>\n        <choose>\n          <if type=\"article-newspaper article-magazine\" match=\"any\">\n            <text variable=\"container-title\" text-case=\"title\" font-style=\"italic\"/>\n          </if>\n          <else>\n            <text macro=\"title\"/>\n          </else>\n        </choose>\n      </substitute>\n    </names>\n  </macro>\n  <macro name=\"access\">\n    <choose>\n      <if variable=\"DOI\">\n        <text variable=\"DOI\" prefix=\"doi:\"/>\n      </if>\n      <else-if variable=\"URL\">\n        <text term=\"available at\" suffix=\": \" text-case=\"capitalize-first\"/>\n        <text variable=\"URL\"/>\n        <group prefix=\" (\" delimiter=\": \" suffix=\")\">\n          <text term=\"accessed\" text-case=\"capitalize-first\"/>\n          <date form=\"text\" variable=\"accessed\">\n            <date-part name=\"day\"/>\n            <date-part name=\"month\"/>\n            <date-part name=\"year\"/>\n          </date>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"number-volumes\">\n    <choose>\n      <if variable=\"volume\" match=\"none\">\n        <group delimiter=\" \" prefix=\"(\" suffix=\")\">\n          <text variable=\"number-of-volumes\"/>\n          <label variable=\"volume\" form=\"short\" strip-periods=\"true\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"title\">\n    <choose>\n      <if type=\"bill book legal_case legislation motion_picture report song thesis webpage graphic\" match=\"any\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <group delimiter=\" \">\n              <text variable=\"title\" font-style=\"italic\"/>\n              <text variable=\"medium\" prefix=\"[\" suffix=\"]\"/>\n            </group>\n            <text macro=\"number-volumes\"/>\n          </group>\n          <text macro=\"edition\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"title\" form=\"long\" quotes=\"true\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"publisher\">\n    <choose>\n      <if type=\"thesis\">\n        <group delimiter=\". \">\n          <text variable=\"genre\"/>\n          <text variable=\"publisher\"/>\n        </group>\n      </if>\n      <else-if type=\"report\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <text variable=\"genre\"/>\n            <text variable=\"number\"/>\n          </group>\n          <group delimiter=\": \">\n            <text variable=\"publisher-place\"/>\n            <text variable=\"publisher\"/>\n          </group>\n        </group>\n      </else-if>\n      <else-if type=\"article-journal article-newspaper article-magazine\" match=\"none\">\n        <group delimiter=\" \">\n          <group delimiter=\", \">\n            <choose>\n              <if type=\"speech\" variable=\"event\" match=\"any\">\n                <text variable=\"event\" font-style=\"italic\"/>\n              </if>\n            </choose>\n            <group delimiter=\": \">\n              <text variable=\"publisher-place\"/>\n              <text variable=\"publisher\"/>\n            </group>\n          </group>\n          <group prefix=\"(\" suffix=\")\" delimiter=\", \">\n            <text variable=\"collection-title\"/>\n            <text variable=\"collection-number\"/>\n          </group>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"year-date\">\n    <choose>\n      <if variable=\"issued\">\n        <date variable=\"issued\">\n          <date-part name=\"year\"/>\n        </date>\n        <text variable=\"year-suffix\"/>\n      </if>\n      <else>\n        <text term=\"no date\"/>\n        <text variable=\"year-suffix\" prefix=\" \"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"locator\">\n    <choose>\n      <if type=\"article-journal\">\n        <text variable=\"volume\"/>\n        <text variable=\"issue\" prefix=\"(\" suffix=\")\"/>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"published-date\">\n    <choose>\n      <if type=\"article-newspaper article-magazine post-weblog speech\" match=\"any\">\n        <date variable=\"issued\">\n          <date-part name=\"day\" suffix=\" \"/>\n          <date-part name=\"month\" form=\"long\"/>\n        </date>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"pages\">\n    <choose>\n      <if type=\"chapter paper-conference article-journal article article-magazine article-newspaper book review review-book report\" match=\"any\">\n        <group delimiter=\" \">\n          <label variable=\"page\" form=\"short\"/>\n          <text variable=\"page\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"container-title\">\n    <choose>\n      <if variable=\"container-title\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <text variable=\"container-title\" font-style=\"italic\"/>\n            <choose>\n              <if type=\"article article-journal\" match=\"any\">\n                <choose>\n                  <if match=\"none\" variable=\"page volume\">\n                    <text value=\"Preprint\" prefix=\"[\" suffix=\"]\"/>\n                  </if>\n                </choose>\n              </if>\n            </choose>\n          </group>\n          <text macro=\"edition\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"edition\">\n    <choose>\n      <if is-numeric=\"edition\">\n        <group delimiter=\" \">\n          <number variable=\"edition\" form=\"ordinal\"/>\n          <text term=\"edition\" form=\"short\" strip-periods=\"true\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"edition\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"container-prefix\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"any\">\n        <text term=\"in\"/>\n      </if>\n    </choose>\n  </macro>\n  <citation et-al-min=\"4\" et-al-use-first=\"1\" disambiguate-add-year-suffix=\"true\" disambiguate-add-names=\"true\" disambiguate-add-givenname=\"true\" collapse=\"year\">\n    <sort>\n      <key macro=\"year-date\"/>\n    </sort>\n    <layout prefix=\"(\" suffix=\")\" delimiter=\"; \">\n      <group delimiter=\", \">\n        <group delimiter=\", \">\n          <text macro=\"author-short\"/>\n          <text macro=\"year-date\"/>\n        </group>\n        <group>\n          <label variable=\"locator\" form=\"short\" suffix=\" \"/>\n          <text variable=\"locator\"/>\n        </group>\n      </group>\n    </layout>\n  </citation>\n  <bibliography and=\"text\" et-al-min=\"4\" et-al-use-first=\"1\">\n    <sort>\n      <key macro=\"author\"/>\n      <key macro=\"year-date\"/>\n      <key variable=\"title\"/>\n    </sort>\n    <layout suffix=\".\">\n      <group delimiter=\". \">\n        <group delimiter=\" \">\n          <text macro=\"author\"/>\n          <text macro=\"year-date\" prefix=\"(\" suffix=\")\"/>\n          <group delimiter=\", \">\n            <text macro=\"title\"/>\n            <group delimiter=\" \">\n              <text macro=\"container-prefix\"/>\n              <text macro=\"editor\"/>\n              <text macro=\"container-title\"/>\n            </group>\n          </group>\n        </group>\n        <text macro=\"secondary-contributors\"/>\n        <text macro=\"publisher\"/>\n      </group>\n      <group delimiter=\", \" prefix=\", \">\n        <text macro=\"locator\"/>\n        <text macro=\"published-date\"/>\n        <text macro=\"pages\"/>\n      </group>\n      <text macro=\"access\" prefix=\". \"/>\n    </layout>\n  </bibliography>\n</style>",
      "last_modified": 1649665699315
    }
  },
  {
    "refData": {
      "basicCitation": {
        "data": {
          "html": "(Anon 2003)",
          "text": "(Anon 2003)",
          "rtx": "(Anon 2003)"
        },
        "citatId": "2609f2a9-402e-492d-8f6a-ca8d9a2a6261",
        "style": "basicStyle",
        "bibliography": "  <div class=\"csl-entry\">Anon (2003) Title. Available from: http://dwqwdqwd.wd. </div>\n"
      },
      "referenceData": {
        "issued": {
          "date-parts": [
            [
              "2003",
              "04",
              "04"
            ]
          ]
        },
        "URL": "http://dwqwdqwd.wd",
        "title": "Title",
        "access-date": "Date of access",
        "submit": true,
        "type": "webpage",
        "id": "d7766036-379c-4667-b37f-62baf4f03e5f"
      },
      "formioData": {
        "authors": [
          {
            "first": "Someone",
            "last": "qweqwe",
            "name": "",
            "role": "author",
            "type": "institution"
          }
        ],
        "issued": "2003-04-04",
        "URL": "http://dwqwdqwd.wd",
        "title": "Title",
        "access-date": "Date of access",
        "submit": true
      },
      "last_modified": 1649665699315,
    },
    "refType": {
      "name": "WEBSITE",
      "label": "Website",
      "last_modified": 1649665699315,
      "type": "webpage",
      "formIOScheme": {
        "components": [
          {
            "label": "Authors",
            "reorder": false,
            "addAnotherPosition": "bottom",
            "defaultOpen": false,
            "layoutFixed": false,
            "enableRowGroups": false,
            "initEmpty": false,
            "clearOnHide": false,
            "tableView": false,
            "defaultValue": [
              {
                "first": "Someone",
                "last": "qweqwe",
                "name": "",
                "role": "author",
                "type": "institution"
              }
            ],
            "key": "authors",
            "type": "datagrid",
            "input": true,
            "components": [
              {
                "label": "First",
                "tableView": true,
                "key": "first",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Last",
                "tableView": true,
                "key": "last",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Name",
                "tableView": true,
                "key": "name",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Role",
                "widget": "choicesjs",
                "tableView": true,
                "data": {
                  "values": [
                    {
                      "label": "Author",
                      "value": "author"
                    },
                    {
                      "label": "Contributor",
                      "value": "contributor"
                    },
                    {
                      "label": "Editor",
                      "value": "editor"
                    }
                  ]
                },
                "selectThreshold": 0.3,
                "key": "role",
                "type": "select",
                "indexeddb": {
                  "filter": {}
                },
                "input": true
              },
              {
                "label": "Type",
                "widget": "choicesjs",
                "tableView": true,
                "data": {
                  "values": [
                    {
                      "label": "Anonymous",
                      "value": "anonymous"
                    },
                    {
                      "label": "Person",
                      "value": "person"
                    },
                    {
                      "label": "Institution",
                      "value": "institution"
                    }
                  ]
                },
                "selectThreshold": 0.3,
                "key": "type",
                "type": "select",
                "indexeddb": {
                  "filter": {}
                },
                "input": true
              }
            ]
          },
          {
            "label": "Year",
            "tableView": true,
            "key": "issued",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "validate": {
              "required": true,
              pattern: '[0-9]{4}'
            },
            "defaultValue": "2003-04-04"
          },
          {
            "label": "URL",
            "tableView": true,
            "key": "URL",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "validate": {
              "required": true
            },
            "defaultValue": "http://dwqwdqwd.wd"
          },
          {
            "label": "Title",
            "tableView": true,
            "key": "title",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "defaultValue": "Title"
          },
          {
            "label": "Date of access",
            "tableView": true,
            "key": "access-date",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "defaultValue": "Date of access"
          },
          {
            "type": "button",
            "label": "Submit",
            "key": "submit",
            "disableOnInvalid": true,
            "input": true,
            "tableView": false,
            "defaultValue": true
          }
        ]
      }
    },
    "refStyle": {
      "name": "pensoft-style",
      "label": "Pensoft",
      "style": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<style xmlns=\"http://purl.org/net/xbiblio/csl\" class=\"in-text\" version=\"1.0\" demote-non-dropping-particle=\"sort-only\" default-locale=\"en-US\">\n  <info>\n    <title>Pensoft Journals</title>\n    <id>http://www.zotero.org/styles/pensoft-journals</id>\n    <link href=\"http://www.zotero.org/styles/pensoft-journals\" rel=\"self\"/>\n    <link href=\"http://www.zotero.org/styles/zootaxa\" rel=\"template\"/>\n    <link href=\"https://zookeys.pensoft.net/about#CitationsandReferences\" rel=\"documentation\"/>\n    <author>\n      <name>Brian Stucky</name>\n      <email>stuckyb@colorado.edu</email>\n    </author>\n    <author>\n      <name>Teodor Georgiev</name>\n      <email>t.georgiev@pensoft.net</email>\n    </author>\n    <category citation-format=\"author-date\"/>\n    <summary>The Pensoft Journals style</summary>\n    <updated>2020-08-21T12:00:00+00:00</updated>\n    <rights license=\"http://creativecommons.org/licenses/by-sa/3.0/\">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>\n  </info>\n  <locale xml:lang=\"en-US\">\n    <date form=\"text\">\n      <date-part name=\"month\" suffix=\" \"/>\n      <date-part name=\"day\" suffix=\", \"/>\n      <date-part name=\"year\"/>\n    </date>\n    <terms>\n      <term name=\"editor\" form=\"short\">\n        <single>ed.</single>\n        <multiple>eds</multiple>\n      </term>\n    </terms>\n  </locale>\n  <macro name=\"editor\">\n    <names variable=\"editor\" delimiter=\", \">\n      <name initialize-with=\"\" name-as-sort-order=\"all\" sort-separator=\" \"/>\n      <label form=\"short\" prefix=\" (\" text-case=\"capitalize-first\" suffix=\")\"/>\n    </names>\n  </macro>\n  <macro name=\"anon\">\n    <text term=\"anonymous\" form=\"short\" text-case=\"capitalize-first\" strip-periods=\"true\"/>\n  </macro>\n  <macro name=\"author\">\n    <names variable=\"author\">\n      <name delimiter-precedes-last=\"never\" initialize-with=\"\" name-as-sort-order=\"all\" sort-separator=\" \"/>\n      <et-al font-style=\"italic\"/>\n      <label form=\"short\" prefix=\" (\" text-case=\"capitalize-first\" suffix=\")\"/>\n      <substitute>\n        <names variable=\"editor\"/>\n        <text macro=\"anon\"/>\n      </substitute>\n    </names>\n  </macro>\n  <macro name=\"author-short\">\n    <names variable=\"author\">\n      <name form=\"short\" delimiter=\" \" and=\"text\" delimiter-precedes-last=\"never\" initialize-with=\". \"/>\n      <substitute>\n        <names variable=\"editor\"/>\n        <names variable=\"translator\"/>\n        <text macro=\"anon\"/>\n      </substitute>\n    </names>\n  </macro>\n  <macro name=\"authorcount\">\n    <names variable=\"author\">\n      <name form=\"count\"/>\n    </names>\n  </macro>\n  <macro name=\"access\">\n    <choose>\n      <if type=\"legal_case\" match=\"none\">\n        <choose>\n          <if variable=\"DOI\">\n            <group delimiter=\" \">\n              <text variable=\"DOI\" prefix=\"https://doi.org/\"/>\n            </group>\n          </if>\n          <else-if variable=\"URL\">\n            <group delimiter=\" \" suffix=\".\">\n              <text variable=\"URL\" prefix=\"Available from: \"/>\n              <group prefix=\"(\" suffix=\")\">\n                <date variable=\"accessed\" form=\"text\"/>\n              </group>\n            </group>\n          </else-if>\n        </choose>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"title\">\n    <text variable=\"title\"/>\n  </macro>\n  <macro name=\"legal_case\">\n    <group prefix=\" \" delimiter=\" \">\n      <text variable=\"volume\"/>\n      <text variable=\"container-title\"/>\n    </group>\n    <text variable=\"authority\" prefix=\" (\" suffix=\")\"/>\n  </macro>\n  <macro name=\"publisher\">\n    <choose>\n      <if type=\"thesis\" match=\"none\">\n        <group delimiter=\", \">\n          <text variable=\"publisher\"/>\n          <text variable=\"publisher-place\"/>\n        </group>\n        <text variable=\"genre\" prefix=\". \"/>\n      </if>\n      <else>\n        <group delimiter=\". \">\n          <text variable=\"genre\"/>\n          <text variable=\"publisher\"/>\n        </group>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"year-date\">\n    <choose>\n      <if variable=\"issued\">\n        <group>\n          <date variable=\"issued\">\n            <date-part name=\"year\"/>\n          </date>\n        </group>\n      </if>\n      <else>\n        <text term=\"no date\" form=\"short\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"edition\">\n    <choose>\n      <if is-numeric=\"edition\">\n        <group delimiter=\" \">\n          <number variable=\"edition\" form=\"ordinal\"/>\n          <text term=\"edition\" form=\"short\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"edition\" suffix=\".\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"locator\">\n    <choose>\n      <if locator=\"page\">\n        <text variable=\"locator\"/>\n      </if>\n      <else>\n        <group delimiter=\" \">\n          <label variable=\"locator\" form=\"short\"/>\n          <text variable=\"locator\"/>\n        </group>\n      </else>\n    </choose>\n  </macro>\n  <citation name-form=\"short\" et-al-min=\"3\" et-al-use-first=\"1\" disambiguate-add-year-suffix=\"true\" collapse=\"year\">\n    <sort>\n      <key macro=\"year-date\"/>\n      <key macro=\"author-short\"/>\n    </sort>\n    <layout delimiter=\", \" prefix=\"(\" suffix=\")\">\n      <group delimiter=\", \">\n        <group delimiter=\" \">\n          <text macro=\"author-short\"/>\n          <text macro=\"year-date\"/>\n        </group>\n        <text macro=\"locator\"/>\n      </group>\n    </layout>\n  </citation>\n  <bibliography hanging-indent=\"true\">\n    <sort>\n      <key macro=\"author\" names-min=\"1\" names-use-first=\"1\"/>\n      <key macro=\"authorcount\"/>\n      <key macro=\"year-date\"/>\n      <key variable=\"title\"/>\n    </sort>\n    <layout suffix=\" \">\n      <text macro=\"author\" suffix=\" \"/>\n      <date variable=\"issued\" prefix=\"(\" suffix=\")\">\n        <date-part name=\"year\"/>\n      </date>\n      <choose>\n        <if type=\"book\" match=\"any\">\n          <text macro=\"legal_case\"/>\n          <group prefix=\" \" delimiter=\" \">\n            <text macro=\"title\" font-style=\"normal\" suffix=\".\"/>\n            <text macro=\"edition\"/>\n            <text macro=\"editor\" suffix=\".\"/>\n          </group>\n          <group prefix=\" \" suffix=\".\" delimiter=\", \">\n            <text macro=\"publisher\"/>\n            <text variable=\"number-of-pages\" prefix=\" \" suffix=\" pp\"/>\n          </group>\n        </if>\n        <else-if type=\"chapter paper-conference\" match=\"any\">\n          <text macro=\"title\" prefix=\" \" suffix=\".\"/>\n          <group prefix=\" In: \" delimiter=\" \">\n            <text macro=\"editor\" suffix=\",\"/>\n            <text variable=\"container-title\" suffix=\".\"/>\n            <text variable=\"collection-title\" suffix=\".\"/>\n            <group suffix=\".\">\n              <text macro=\"publisher\"/>\n              <group delimiter=\" \" prefix=\", \" suffix=\".\">\n                <text variable=\"page\"/>\n              </group>\n            </group>\n          </group>\n        </else-if>\n        <else-if type=\"bill graphic legal_case legislation manuscript motion_picture report song thesis\" match=\"any\">\n          <text macro=\"legal_case\"/>\n          <group prefix=\" \" delimiter=\" \">\n            <text macro=\"title\" suffix=\".\"/>\n            <text macro=\"edition\"/>\n            <text macro=\"editor\" suffix=\".\"/>\n          </group>\n          <group prefix=\" \" delimiter=\", \">\n            <text macro=\"publisher\"/>\n            <text variable=\"page\" prefix=\" \" suffix=\"pp.\"/>\n          </group>\n        </else-if>\n        <else>\n          <group prefix=\" \" delimiter=\". \" suffix=\".\">\n            <text macro=\"title\"/>\n            <text macro=\"editor\"/>\n          </group>\n          <group prefix=\" \" suffix=\".\">\n            <text variable=\"container-title\"/>\n            <group prefix=\" \">\n              <text variable=\"volume\"/>\n            </group>\n            <text variable=\"page\" prefix=\": \" suffix=\".\"/>\n          </group>\n        </else>\n      </choose>\n      <text macro=\"access\" prefix=\" \"/>\n    </layout>\n  </bibliography>\n</style>\n",
      "last_modified": 1649665699315
    }
  },
  {
    "refData": {
      "last_modified": 1649665699315,
      "basicCitation": {
        "data": {
          "html": "(Aleksandur, 2222)",
          "text": "(Aleksandur, 2222)",
          "rtx": "(Aleksandur, 2222)"
        },
        "citatId": "57fdfc80-9672-4961-99b4-1822f019246f",
        "style": "basicStyle",
        "bibliography": "  <div class=\"csl-entry\">Aleksandur. (2222). <i>Title</i>. Retrieved from https://qwdqwdqwdqwd</div>\n"
      },
      "referenceData": {
        "author": [
          {
            "family": "Aleksandur",
            "given": ""
          }
        ],
        "issued": {
          "date-parts": [
            [
              "2222",
              "02",
              "02"
            ]
          ]
        },
        "title": "Title",
        "version": "Version",
        "publisher": "Publisher",
        "release-date": "Release date",
        "URL": "https://qwdqwdqwdqwd",
        "submit": true,
        "type": "software",
        "id": "a4054dd1-a15b-4ad7-b57a-040dbbcfe776"
      },
      "formioData": {
        "authors": [
          {
            "first": "Aleksandur",
            "last": "",
            "name": "",
            "role": "author",
            "type": "person"
          }
        ],
        "issued": "2222-02-02",
        "title": "Title",
        "version": "Version",
        "publisher": "Publisher",
        "release-date": "Release date",
        "URL": "https://qwdqwdqwdqwd",
        "submit": true
      }
    },
    "refType": {
      "name": "SOFTWARE / DATA",
      "last_modified": 1649665699315,
      "label": "Software / Data",
      "type": "software",
      "formIOScheme": {
        "components": [
          {
            "label": "Authors",
            "reorder": false,
            "addAnotherPosition": "bottom",
            "defaultOpen": false,
            "layoutFixed": false,
            "enableRowGroups": false,
            "initEmpty": false,
            "clearOnHide": false,
            "tableView": false,
            "defaultValue": [
              {
                "first": "Aleksandur",
                "last": "",
                "name": "",
                "role": "author",
                "type": "person"
              }
            ],
            "key": "authors",
            "type": "datagrid",
            "input": true,
            "components": [
              {
                "label": "First",
                "tableView": true,
                "key": "first",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Last",
                "tableView": true,
                "key": "last",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Name",
                "tableView": true,
                "key": "name",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Role",
                "widget": "choicesjs",
                "tableView": true,
                "data": {
                  "values": [
                    {
                      "label": "Author",
                      "value": "author"
                    },
                    {
                      "label": "Contributor",
                      "value": "contributor"
                    },
                    {
                      "label": "Editor",
                      "value": "editor"
                    }
                  ]
                },
                "selectThreshold": 0.3,
                "key": "role",
                "type": "select",
                "indexeddb": {
                  "filter": {}
                },
                "input": true
              },
              {
                "label": "Type",
                "widget": "choicesjs",
                "tableView": true,
                "data": {
                  "values": [
                    {
                      "label": "Anonymous",
                      "value": "anonymous"
                    },
                    {
                      "label": "Person",
                      "value": "person"
                    },
                    {
                      "label": "Institution",
                      "value": "institution"
                    }
                  ]
                },
                "selectThreshold": 0.3,
                "key": "type",
                "type": "select",
                "indexeddb": {
                  "filter": {}
                },
                "input": true
              }
            ]
          },
          {
            "label": "Year of publication",
            "tableView": true,
            "key": "issued",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "validate": {
              "required": true,
              pattern: '[0-9]{4}'
            },
            "defaultValue": "2222-02-02"
          },
          {
            "label": "Title",
            "tableView": true,
            "key": "title",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "validate": {
              "required": true
            },
            "defaultValue": "Title"
          },
          {
            "label": "Version",
            "tableView": true,
            "key": "version",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "defaultValue": "Version"
          },
          {
            "label": "Publisher",
            "tableView": true,
            "key": "publisher",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "defaultValue": "Publisher"
          },
          {
            "label": "Release date",
            "tableView": true,
            "key": "release-date",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "defaultValue": "Release date"
          },
          {
            "label": "URL",
            "tableView": true,
            "key": "URL",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "defaultValue": "https://qwdqwdqwdqwd"
          },
          {
            "type": "button",
            "label": "Submit",
            "key": "submit",
            "disableOnInvalid": true,
            "input": true,
            "tableView": false,
            "defaultValue": true
          }
        ]
      }
    },
    "refStyle": {
      "name": "demo-style",
      "label": "CSL Demo",
      "style": "\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<style xmlns=\"http://purl.org/net/xbiblio/csl\" class=\"in-text\" version=\"1.0\" demote-non-dropping-particle=\"never\" page-range-format=\"expanded\">\n  <info>\n    <title>American Psychological Association 6th edition</title>\n    <title-short>APA</title-short>\n    <id>http://www.zotero.org/styles/apa</id>\n    <link href=\"http://www.zotero.org/styles/apa\" rel=\"self\"/>\n    <link href=\"http://owl.english.purdue.edu/owl/resource/560/01/\" rel=\"documentation\"/>\n    <author>\n      <name>Simon Kornblith</name>\n      <email>simon@simonster.com</email>\n    </author>\n    <author>\n      <name> Brenton M. Wiernik</name>\n      <email>zotero@wiernik.org</email>\n    </author>\n    <contributor>\n      <name>Bruce D'Arcus</name>\n    </contributor>\n    <contributor>\n      <name>Curtis M. Humphrey</name>\n    </contributor>\n    <contributor>\n      <name>Richard Karnesky</name>\n      <email>karnesky+zotero@gmail.com</email>\n      <uri>http://arc.nucapt.northwestern.edu/Richard_Karnesky</uri>\n    </contributor>\n    <contributor>\n      <name>Sebastian Karcher</name>\n    </contributor>\n    <category citation-format=\"author-date\"/>\n    <category field=\"psychology\"/>\n    <category field=\"generic-base\"/>\n    <updated>2016-09-28T13:09:49+00:00</updated>\n    <rights license=\"http://creativecommons.org/licenses/by-sa/3.0/\">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>\n  </info>\n  <locale xml:lang=\"en\">\n    <terms>\n      <term name=\"editortranslator\" form=\"short\">\n        <single>ed. &amp; trans.</single>\n        <multiple>eds. &amp; trans.</multiple>\n      </term>\n      <term name=\"translator\" form=\"short\">trans.</term>\n      <term name=\"interviewer\" form=\"short\">interviewer</term>\n      <term name=\"circa\" form=\"short\">ca.</term>\n      <term name=\"collection-editor\" form=\"short\">series ed.</term>\n    </terms>\n  </locale>\n  <locale xml:lang=\"es\">\n    <terms>\n      <term name=\"from\">de</term>\n    </terms>\n  </locale>\n  <macro name=\"container-contributors-booklike\">\n    <choose>\n      <if variable=\"container-title\">\n        <names variable=\"editor translator\" delimiter=\", &amp; \">\n          <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n          <label form=\"short\" prefix=\" (\" text-case=\"title\" suffix=\")\"/>\n          <substitute>\n            <names variable=\"editorial-director\"/>\n            <names variable=\"collection-editor\"/>\n            <names variable=\"container-author\"/>\n          </substitute>\n        </names>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"container-contributors\">\n    <choose>\n      <!-- book is here to catch software with container titles -->\n      <if type=\"book broadcast chapter entry entry-dictionary entry-encyclopedia graphic map personal_communication report speech\" match=\"any\">\n        <text macro=\"container-contributors-booklike\"/>\n      </if>\n      <else-if type=\"paper-conference\">\n        <choose>\n          <if variable=\"collection-editor container-author editor\" match=\"any\">\n            <text macro=\"container-contributors-booklike\"/>\n          </if>\n        </choose>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"secondary-contributors-booklike\">\n    <group delimiter=\"; \">\n      <choose>\n        <if variable=\"title\">\n          <names variable=\"interviewer\">\n            <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n            <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n          </names>\n        </if>\n      </choose>\n      <choose>\n        <if variable=\"container-title\" match=\"none\">\n          <group delimiter=\"; \">\n            <names variable=\"container-author\">\n              <label form=\"verb-short\" suffix=\" \" text-case=\"title\"/>\n              <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n            </names>\n            <names variable=\"editor translator\" delimiter=\"; \">\n              <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n              <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n            </names>\n          </group>\n        </if>\n      </choose>\n    </group>\n  </macro>\n  <macro name=\"secondary-contributors\">\n    <choose>\n      <!-- book is here to catch software with container titles -->\n      <if type=\"book broadcast chapter entry entry-dictionary entry-encyclopedia graphic map report\" match=\"any\">\n        <text macro=\"secondary-contributors-booklike\"/>\n      </if>\n      <else-if type=\"personal_communication\">\n        <group delimiter=\"; \">\n          <group delimiter=\" \">\n            <choose>\n              <if variable=\"genre\" match=\"any\">\n                <text variable=\"genre\" text-case=\"capitalize-first\"/>\n              </if>\n              <else>\n                <text term=\"letter\" text-case=\"capitalize-first\"/>\n              </else>\n            </choose>\n            <names variable=\"recipient\" delimiter=\", \">\n              <label form=\"verb\" suffix=\" \"/>\n              <name and=\"symbol\" delimiter=\", \"/>\n            </names>\n          </group>\n          <text variable=\"medium\" text-case=\"capitalize-first\"/>\n          <choose>\n            <if variable=\"container-title\" match=\"none\">\n              <names variable=\"editor translator\" delimiter=\"; \">\n                <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n                <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n              </names>\n            </if>\n          </choose>\n        </group>\n      </else-if>\n      <else-if type=\"song\">\n        <choose>\n          <if variable=\"original-author composer\" match=\"any\">\n            <group delimiter=\"; \">\n              <!-- Replace prefix with performer label as that becomes available -->\n              <names variable=\"author\" prefix=\"Recorded by \">\n                <label form=\"verb\" text-case=\"title\"/>\n                <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n              </names>\n              <names variable=\"translator\">\n                <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n                <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n              </names>\n            </group>\n          </if>\n        </choose>\n      </else-if>\n      <else-if type=\"article-journal article-magazine article-newspaper\" match=\"any\">\n        <group delimiter=\"; \">\n          <choose>\n            <if variable=\"title\">\n              <names variable=\"interviewer\" delimiter=\"; \">\n                <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n                <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n              </names>\n            </if>\n          </choose>\n          <names variable=\"translator\" delimiter=\"; \">\n            <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n            <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n          </names>\n        </group>\n      </else-if>\n      <else-if type=\"paper-conference\">\n        <choose>\n          <if variable=\"collection-editor editor\" match=\"any\">\n            <text macro=\"secondary-contributors-booklike\"/>\n          </if>\n          <else>\n            <group delimiter=\"; \">\n              <choose>\n                <if variable=\"title\">\n                  <names variable=\"interviewer\" delimiter=\"; \">\n                    <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n                    <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n                  </names>\n                </if>\n              </choose>\n              <names variable=\"translator\" delimiter=\"; \">\n                <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n                <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n              </names>\n            </group>\n          </else>\n        </choose>\n      </else-if>\n      <else>\n        <group delimiter=\"; \">\n          <choose>\n            <if variable=\"title\">\n              <names variable=\"interviewer\">\n                <name and=\"symbol\" initialize-with=\". \" delimiter=\"; \"/>\n                <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n              </names>\n            </if>\n          </choose>\n          <names variable=\"editor translator\" delimiter=\"; \">\n            <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n            <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n          </names>\n        </group>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"author\">\n    <choose>\n      <if type=\"song\">\n        <names variable=\"composer\" delimiter=\", \">\n          <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n          <substitute>\n            <names variable=\"original-author\"/>\n            <names variable=\"author\"/>\n            <names variable=\"translator\">\n              <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n              <label form=\"short\" prefix=\" (\" suffix=\")\" text-case=\"title\"/>\n            </names>\n            <group delimiter=\" \">\n              <text macro=\"title\"/>\n              <text macro=\"description\"/>\n              <text macro=\"format\"/>\n            </group>\n          </substitute>\n        </names>\n      </if>\n      <else-if type=\"treaty\"/>\n      <else>\n        <names variable=\"author\" delimiter=\", \">\n          <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n          <substitute>\n            <names variable=\"illustrator\"/>\n            <names variable=\"composer\"/>\n            <names variable=\"director\">\n              <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n              <label form=\"long\" prefix=\" (\" suffix=\")\" text-case=\"title\"/>\n            </names>\n            <choose>\n              <if variable=\"container-title\">\n                <choose>\n                  <if type=\"book entry entry-dictionary entry-encyclopedia\">\n                    <text macro=\"title\"/>\n                  </if>\n                  <else>\n                    <names variable=\"translator\"/>\n                  </else>\n                </choose>\n                <names variable=\"translator\">\n                  <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n                    <label form=\"short\" prefix=\" (\" suffix=\")\" text-case=\"title\"/>\n                </names>\n              </if>\n            </choose>\n            <names variable=\"editor translator\" delimiter=\", \">\n              <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n                <label form=\"short\" prefix=\" (\" suffix=\")\" text-case=\"title\"/>\n            </names>\n            <names variable=\"editorial-director\">\n              <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n                <label form=\"short\" prefix=\" (\" suffix=\")\" text-case=\"title\"/>\n            </names>\n            <names variable=\"collection-editor\">\n              <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n                <label form=\"short\" prefix=\" (\" suffix=\")\" text-case=\"title\"/>\n            </names>\n            <choose>\n              <if type=\"report\">\n                <text variable=\"publisher\"/>\n              </if>\n            </choose>\n            <group delimiter=\" \">\n              <text macro=\"title\"/>\n              <text macro=\"description\"/>\n              <text macro=\"format\"/>\n            </group>\n          </substitute>\n        </names>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"author-short\">\n    <choose>\n      <if type=\"patent\" variable=\"number\" match=\"all\">\n        <text macro=\"patent-number\"/>\n      </if>\n      <else-if type=\"treaty\">\n        <text variable=\"title\" form=\"short\"/>\n      </else-if>\n      <else-if type=\"personal_communication\">\n        <choose>\n          <if variable=\"archive DOI publisher URL\" match=\"none\">\n            <group delimiter=\", \">\n              <names variable=\"author\">\n                <name and=\"symbol\" delimiter=\", \" initialize-with=\". \"/>\n                <substitute>\n                  <text variable=\"title\" form=\"short\" quotes=\"true\"/>\n                </substitute>\n              </names>\n              <!-- This should be localized -->\n              <text value=\"personal communication\"/>\n            </group>\n          </if>\n          <else>\n            <names variable=\"author\" delimiter=\", \">\n              <name form=\"short\" and=\"symbol\" delimiter=\", \" initialize-with=\". \"/>\n              <substitute>\n                <names variable=\"editor\"/>\n                <names variable=\"translator\"/>\n                <choose>\n                  <if variable=\"container-title\">\n                    <text variable=\"title\" form=\"short\" quotes=\"true\"/>\n                  </if>\n                  <else>\n                    <text variable=\"title\" form=\"short\" font-style=\"italic\"/>\n                  </else>\n                </choose>\n                <text macro=\"format-short\" prefix=\"[\" suffix=\"]\"/>\n              </substitute>\n            </names>\n          </else>\n        </choose>\n      </else-if>\n      <else-if type=\"song\">\n        <names variable=\"composer\" delimiter=\", \">\n          <name form=\"short\" and=\"symbol\" delimiter=\", \" initialize-with=\". \"/>\n          <substitute>\n            <names variable=\"original-author\"/>\n            <names variable=\"author\"/>\n            <names variable=\"translator\"/>\n             <choose>\n              <if variable=\"container-title\">\n                <text variable=\"title\" form=\"short\" quotes=\"true\"/>\n              </if>\n              <else>\n                <text variable=\"title\" form=\"short\" font-style=\"italic\"/>\n              </else>\n            </choose>\n            <text macro=\"format-short\" prefix=\"[\" suffix=\"]\"/>\n          </substitute>\n        </names>\n      </else-if>\n      <else>\n        <names variable=\"author\" delimiter=\", \">\n          <name form=\"short\" and=\"symbol\" delimiter=\", \" initialize-with=\". \"/>\n          <substitute>\n            <names variable=\"illustrator\"/>\n            <names variable=\"composer\"/>\n            <names variable=\"director\"/>\n            <choose>\n              <if variable=\"container-title\">\n                <choose>\n                  <if type=\"book entry entry-dictionary entry-encyclopedia\">\n                    <text variable=\"title\" form=\"short\" quotes=\"true\"/>\n                  </if>\n                  <else>\n                    <names variable=\"translator\"/>\n                  </else>\n                </choose>\n              </if>\n            </choose>\n            <names variable=\"editor\"/>\n            <names variable=\"editorial-director\"/>\n            <names variable=\"translator\"/>\n            <choose>\n              <if type=\"report\" variable=\"publisher\" match=\"all\">\n                <text variable=\"publisher\"/>\n              </if>\n              <else-if type=\"legal_case\">\n                <text variable=\"title\" font-style=\"italic\"/>\n              </else-if>\n              <else-if type=\"bill legislation\" match=\"any\">\n                <text variable=\"title\" form=\"short\"/>\n              </else-if>\n              <else-if variable=\"reviewed-author\" type=\"review review-book\" match=\"any\">\n                <text macro=\"format-short\" prefix=\"[\" suffix=\"]\"/>\n              </else-if>\n              <else-if type=\"post post-weblog webpage\" variable=\"container-title\" match=\"any\">\n                <text variable=\"title\" form=\"short\" quotes=\"true\"/>\n              </else-if>\n              <else>\n                <text variable=\"title\" form=\"short\" font-style=\"italic\"/>\n              </else>\n            </choose>\n            <text macro=\"format-short\" prefix=\"[\" suffix=\"]\"/>\n          </substitute>\n        </names>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"patent-number\">\n    <!-- authority: U.S. ; genre: patent ; number: 123,445 -->\n    <group delimiter=\" \">\n      <text variable=\"authority\"/>\n      <choose>\n        <if variable=\"genre\">\n          <text variable=\"genre\" text-case=\"capitalize-first\"/>\n        </if>\n        <else>\n          <!-- This should be localized -->\n          <text value=\"patent\" text-case=\"capitalize-first\"/>\n        </else>\n      </choose>\n      <group delimiter=\" \">\n        <text term=\"issue\" form=\"short\" text-case=\"capitalize-first\"/>\n        <text variable=\"number\"/>\n      </group>\n    </group>\n  </macro>\n  <macro name=\"access\">\n    <choose>\n      <if type=\"bill legal_case legislation\" match=\"any\"/>\n      <else-if variable=\"DOI\" match=\"any\">\n        <text variable=\"DOI\" prefix=\"https://doi.org/\"/>\n      </else-if>\n      <else-if variable=\"URL\">\n        <group delimiter=\" \">\n          <text term=\"retrieved\" text-case=\"capitalize-first\"/>\n          <choose>\n            <if type=\"post post-weblog webpage\" match=\"any\">\n              <date variable=\"accessed\" form=\"text\" suffix=\",\"/>\n            </if>\n          </choose>\n          <text term=\"from\"/>\n          <choose>\n            <if type=\"report\">\n              <choose>\n                <if variable=\"author editor translator\" match=\"any\">\n                  <!-- This should be localized -->\n                  <text variable=\"publisher\" suffix=\" website:\"/>\n                </if>\n              </choose>\n            </if>\n            <else-if type=\"post post-weblog webpage\" match=\"any\">\n              <!-- This should be localized -->\n              <text variable=\"container-title\" suffix=\" website:\"/>\n            </else-if>\n          </choose>\n          <text variable=\"URL\"/>\n        </group>\n      </else-if>\n      <else-if variable=\"archive\">\n        <choose>\n          <if type=\"article article-journal article-magazine article-newspaper dataset paper-conference report speech thesis\" match=\"any\">\n            <!-- This section is for electronic database locations. Physical archives for these and other item types are called in 'publisher' macro -->\n            <choose>\n              <if variable=\"archive-place\" match=\"none\">\n                <group delimiter=\" \">\n                  <text term=\"retrieved\" text-case=\"capitalize-first\"/>\n                  <text term=\"from\"/>\n                  <text variable=\"archive\" suffix=\".\"/>\n                  <text variable=\"archive_location\" prefix=\"(\" suffix=\")\"/>\n                </group>\n              </if>\n              <else>\n                <text macro=\"publisher\" suffix=\".\"/>\n              </else>\n            </choose>\n          </if>\n          <else>\n            <text macro=\"publisher\" suffix=\".\"/>\n          </else>\n        </choose>\n      </else-if>\n      <else>\n        <text macro=\"publisher\" suffix=\".\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"title\">\n    <choose>\n      <if type=\"treaty\">\n        <group delimiter=\", \">\n          <text variable=\"title\" text-case=\"title\"/>\n          <names variable=\"author\">\n            <name initialize-with=\".\" form=\"short\" delimiter=\"-\"/>\n          </names>\n        </group>\n      </if>\n      <else-if type=\"patent\" variable=\"number\" match=\"all\">\n        <text macro=\"patent-number\" font-style=\"italic\"/>\n      </else-if>\n      <else-if variable=\"title\">\n        <choose>\n          <if variable=\"version\" type=\"book\" match=\"all\">\n            <!---This is a hack until we have a software type -->\n            <text variable=\"title\"/>\n          </if>\n          <else-if variable=\"reviewed-author reviewed-title\" type=\"review review-book\" match=\"any\">\n            <choose>\n              <if variable=\"reviewed-title\">\n                <choose>\n                  <if type=\"post post-weblog webpage\" variable=\"container-title\" match=\"any\">\n                    <text variable=\"title\"/>\n                  </if>\n                  <else>\n                    <text variable=\"title\" font-style=\"italic\"/>\n                  </else>\n                </choose>\n              </if>\n            </choose>\n          </else-if>\n          <else-if type=\"post post-weblog webpage\" variable=\"container-title\" match=\"any\">\n            <text variable=\"title\"/>\n          </else-if>\n          <else>\n            <text variable=\"title\" font-style=\"italic\"/>\n          </else>\n        </choose>\n      </else-if>\n      <else-if variable=\"interviewer\" type=\"interview\" match=\"any\">\n        <names variable=\"interviewer\">\n          <label form=\"verb-short\" suffix=\" \" text-case=\"capitalize-first\"/>\n          <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n        </names>\n      </else-if>\n    </choose>\n  </macro>\n  <!-- APA has four descriptive sections following the title: -->\n  <!-- (description), [format], container, event -->\n  <macro name=\"description\">\n    <group prefix=\"(\" suffix=\")\">\n      <choose>\n        <!-- book is here to catch software with container titles -->\n        <if type=\"book report\" match=\"any\">\n          <choose>\n            <if variable=\"container-title\">\n              <text macro=\"secondary-contributors\"/>\n            </if>\n            <else>\n              <group delimiter=\"; \">\n                <text macro=\"description-report\"/>\n                <text macro=\"secondary-contributors\"/>\n              </group>\n            </else>\n          </choose>\n        </if>\n        <else-if type=\"thesis\">\n          <group delimiter=\"; \">\n            <group delimiter=\", \">\n              <text variable=\"genre\" text-case=\"capitalize-first\"/>\n              <choose>\n                <!-- In APA journals, the university of a thesis is always cited, even if another locator is given -->\n                <if variable=\"DOI URL archive\" match=\"any\">\n                  <text variable=\"publisher\"/>\n                </if>\n              </choose>\n            </group>\n            <text macro=\"locators\"/>\n            <text macro=\"secondary-contributors\"/>\n          </group>\n        </else-if>\n        <else-if type=\"book interview manuscript motion_picture musical_score pamphlet post-weblog speech webpage\" match=\"any\">\n          <group delimiter=\"; \">\n            <text macro=\"locators\"/>\n            <text macro=\"secondary-contributors\"/>\n          </group>\n        </else-if>\n        <else-if type=\"song\">\n          <choose>\n            <if variable=\"container-title\" match=\"none\">\n              <text macro=\"locators\"/>\n            </if>\n          </choose>\n        </else-if>\n        <else-if type=\"article dataset figure\" match=\"any\">\n          <choose>\n            <if variable=\"container-title\">\n              <text macro=\"secondary-contributors\"/>\n            </if>\n            <else>\n              <group delimiter=\"; \">\n                <text macro=\"locators\"/>\n                <text macro=\"secondary-contributors\"/>\n              </group>\n            </else>\n          </choose>\n        </else-if>\n        <else-if type=\"bill legislation legal_case patent treaty personal_communication\" match=\"none\">\n          <text macro=\"secondary-contributors\"/>\n        </else-if>\n      </choose>\n    </group>\n  </macro>\n  <macro name=\"format\">\n    <group prefix=\"[\" suffix=\"]\">\n      <choose>\n        <if variable=\"reviewed-author reviewed-title\" type=\"review review-book\" match=\"any\">\n          <group delimiter=\", \">\n            <choose>\n              <if variable=\"genre\">\n                <!-- Delimiting by , rather than \"of\" to avoid incorrect grammar -->\n                <group delimiter=\", \">\n                  <text variable=\"genre\" text-case=\"capitalize-first\"/>\n                  <choose>\n                    <if variable=\"reviewed-title\">\n                      <text variable=\"reviewed-title\" font-style=\"italic\"/>\n                    </if>\n                    <else>\n                      <!-- Assume 'title' is title of reviewed work -->\n                      <text variable=\"title\" font-style=\"italic\"/>\n                    </else>\n                  </choose>\n                </group>\n              </if>\n              <else>\n                <!-- This should be localized -->\n                <group delimiter=\" \">\n                  <text value=\"Review of\"/>\n                  <choose>\n                    <if variable=\"reviewed-title\">\n                      <text variable=\"reviewed-title\" font-style=\"italic\"/>\n                    </if>\n                    <else>\n                      <!-- Assume 'title' is title of reviewed work -->\n                      <text variable=\"title\" font-style=\"italic\"/>\n                    </else>\n                  </choose>\n                </group>\n              </else>\n            </choose>\n            <names variable=\"reviewed-author\">\n              <label form=\"verb-short\" suffix=\" \"/>\n              <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n            </names>\n          </group>\n        </if>\n        <else>\n          <text macro=\"format-short\"/>\n        </else>\n      </choose>\n    </group>\n  </macro>\n  <macro name=\"format-short\">\n    <choose>\n      <if variable=\"reviewed-author reviewed-title\" type=\"review review-book\" match=\"any\">\n        <choose>\n          <if variable=\"reviewed-title\" match=\"none\">\n            <choose>\n              <if variable=\"genre\">\n                <!-- Delimiting by , rather than \"of\" to avoid incorrect grammar -->\n                <group delimiter=\", \">\n                  <text variable=\"genre\" text-case=\"capitalize-first\"/>\n                  <text variable=\"title\" form=\"short\" font-style=\"italic\"/>\n                </group>\n              </if>\n              <else>\n                <!-- This should be localized -->\n                <group delimiter=\" \">\n                  <text value=\"Review of\"/>\n                  <text variable=\"title\" form=\"short\" font-style=\"italic\"/>\n                </group>\n              </else>\n            </choose>\n          </if>\n          <else>\n            <text variable=\"title\" form=\"short\" quotes=\"true\"/>\n          </else>\n        </choose>\n      </if>\n      <else-if type=\"speech thesis\" match=\"any\">\n        <text variable=\"medium\" text-case=\"capitalize-first\"/>\n      </else-if>\n      <!-- book is here to catch software with container titles -->\n      <else-if type=\"book report\" match=\"any\">\n        <choose>\n          <if variable=\"container-title\" match=\"none\">\n            <text macro=\"format-report\"/>\n          </if>\n        </choose>\n      </else-if>\n      <else-if type=\"manuscript pamphlet\" match=\"any\">\n        <text variable=\"medium\" text-case=\"capitalize-first\"/>\n      </else-if>\n      <else-if type=\"personal_communication\">\n        <text macro=\"secondary-contributors\"/>\n      </else-if>\n      <else-if type=\"song\">\n        <group delimiter=\"; \">\n          <text macro=\"secondary-contributors\"/>\n          <choose>\n            <if variable=\"container-title\" match=\"none\">\n              <group delimiter=\", \">\n                <text variable=\"genre\" text-case=\"capitalize-first\"/>\n                <text variable=\"medium\" text-case=\"capitalize-first\"/>\n              </group>\n            </if>\n          </choose>\n        </group>\n      </else-if>\n      <else-if type=\"paper-conference\">\n        <group delimiter=\", \">\n          <choose>\n            <if variable=\"collection-editor editor issue page volume\" match=\"any\">\n              <text variable=\"genre\" text-case=\"capitalize-first\"/>\n            </if>\n          </choose>\n          <text variable=\"medium\" text-case=\"capitalize-first\"/>\n        </group>\n      </else-if>\n      <else-if type=\"bill legislation legal_case patent treaty\" match=\"none\">\n        <choose>\n          <if variable=\"genre medium\" match=\"any\">\n            <group delimiter=\", \">\n              <text variable=\"genre\" text-case=\"capitalize-first\"/>\n              <text variable=\"medium\" text-case=\"capitalize-first\"/>\n            </group>\n          </if>\n          <else-if type=\"dataset\">\n            <!-- This should be localized -->\n            <text value=\"Data set\"/>\n          </else-if>\n        </choose>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"description-report\">\n    <choose>\n      <if variable=\"number\">\n        <group delimiter=\"; \">\n          <group delimiter=\" \">\n            <text variable=\"genre\" text-case=\"title\"/>\n            <!-- Replace with term=\"number\" if that becomes available -->\n            <text term=\"issue\" form=\"short\" text-case=\"capitalize-first\"/>\n            <text variable=\"number\"/>\n          </group>\n          <text macro=\"locators\"/>\n        </group>\n      </if>\n      <else>\n        <text macro=\"locators\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"format-report\">\n    <choose>\n      <if variable=\"number\">\n        <text variable=\"medium\" text-case=\"capitalize-first\"/>\n      </if>\n      <else>\n        <group delimiter=\", \">\n          <text variable=\"genre\" text-case=\"capitalize-first\"/>\n          <text variable=\"medium\" text-case=\"capitalize-first\"/>\n        </group>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"archive\">\n    <group delimiter=\". \">\n      <group delimiter=\", \">\n        <choose>\n          <if type=\"manuscript\">\n            <text variable=\"genre\"/>\n          </if>\n        </choose>\n        <group delimiter=\" \">\n          <!-- Replace \"archive\" with \"archive_collection\" as that becomes available -->\n          <text variable=\"archive\"/>\n          <text variable=\"archive_location\" prefix=\"(\" suffix=\")\"/>\n        </group>\n      </group>\n      <group delimiter=\", \">\n        <!-- Move \"archive\" here when \"archive_collection\" becomes available -->\n        <text variable=\"archive-place\"/>\n      </group>\n    </group>\n  </macro>\n  <macro name=\"publisher\">\n    <choose>\n      <if type=\"manuscript pamphlet\" match=\"any\">\n        <choose>\n          <if variable=\"archive archive_location archive-place\" match=\"any\">\n            <group delimiter=\". \">\n              <group delimiter=\": \">\n                <text variable=\"publisher-place\"/>\n                <text variable=\"publisher\"/>\n              </group>\n              <text macro=\"archive\"/>\n            </group>\n          </if>\n          <else>\n            <group delimiter=\", \">\n              <text variable=\"genre\"/>\n              <text variable=\"publisher\"/>\n              <text variable=\"publisher-place\"/>\n            </group>\n          </else>\n        </choose>\n      </if>\n      <else-if type=\"thesis\" match=\"any\">\n        <group delimiter=\". \">\n          <group delimiter=\", \">\n            <text variable=\"publisher\"/>\n            <text variable=\"publisher-place\"/>\n          </group>\n          <text macro=\"archive\"/>\n        </group>\n      </else-if>\n      <else-if type=\"patent\">\n        <group delimiter=\". \">\n          <group delimiter=\": \">\n            <text variable=\"publisher-place\"/>\n            <text variable=\"publisher\"/>\n          </group>\n          <text macro=\"archive\"/>\n        </group>\n      </else-if>\n      <else-if type=\"article-journal article-magazine article-newspaper\" match=\"any\">\n        <text macro=\"archive\"/>\n      </else-if>\n      <else-if type=\"post post-weblog webpage\" match=\"none\">\n        <group delimiter=\". \">\n          <choose>\n            <if variable=\"event\">\n              <choose>\n                <!-- Only print publisher info if published in a proceedings -->\n                <if variable=\"collection-editor editor issue page volume\" match=\"any\">\n                  <group delimiter=\": \">\n                    <text variable=\"publisher-place\"/>\n                    <text variable=\"publisher\"/>\n                  </group>\n                </if>\n              </choose>\n            </if>\n            <else>\n              <group delimiter=\": \">\n                <text variable=\"publisher-place\"/>\n                <text variable=\"publisher\"/>\n              </group>\n            </else>\n          </choose>\n          <text macro=\"archive\"/>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"event\">\n    <choose>\n      <if variable=\"event\" type=\"speech paper-conference\" match=\"any\">\n        <choose>\n          <!-- Don't print event info if published in a proceedings -->\n          <if variable=\"collection-editor editor issue page volume\" match=\"none\">\n            <group delimiter=\" \">\n              <text variable=\"genre\" text-case=\"capitalize-first\"/>\n              <group delimiter=\" \">\n                <choose>\n                  <if variable=\"genre\">\n                    <text term=\"presented at\"/>\n                  </if>\n                  <else>\n                    <text term=\"presented at\" text-case=\"capitalize-first\"/>\n                  </else>\n                </choose>\n                <group delimiter=\", \">\n                  <text variable=\"event\"/>\n                  <text variable=\"event-place\"/>\n                </group>\n              </group>\n            </group>\n          </if>\n        </choose>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"issued\">\n    <choose>\n      <if type=\"bill legal_case legislation\" match=\"any\"/>\n      <else-if variable=\"issued\">\n        <group>\n          <date variable=\"issued\">\n            <date-part name=\"year\"/>\n          </date>\n          <text variable=\"year-suffix\"/>\n          <choose>\n            <if type=\"speech\">\n              <date variable=\"issued\" delimiter=\" \">\n                <date-part prefix=\", \" name=\"month\"/>\n              </date>\n            </if>\n            <else-if type=\"article article-magazine article-newspaper broadcast interview pamphlet personal_communication post post-weblog treaty webpage\" match=\"any\">\n              <date variable=\"issued\">\n                <date-part prefix=\", \" name=\"month\"/>\n                <date-part prefix=\" \" name=\"day\"/>\n              </date>\n            </else-if>\n            <else-if type=\"paper-conference\">\n              <choose>\n                <if variable=\"container-title\" match=\"none\">\n                  <date variable=\"issued\">\n                    <date-part prefix=\", \" name=\"month\"/>\n                    <date-part prefix=\" \" name=\"day\"/>\n                  </date>\n                </if>\n              </choose>\n            </else-if>\n            <!-- Only year: article-journal chapter entry entry-dictionary entry-encyclopedia dataset figure graphic motion_picture manuscript map musical_score paper-conference [published] patent report review review-book song thesis -->\n          </choose>\n        </group>\n      </else-if>\n      <else-if variable=\"status\">\n        <group>\n          <text variable=\"status\" text-case=\"lowercase\"/>\n          <text variable=\"year-suffix\" prefix=\"-\"/>\n        </group>\n      </else-if>\n      <else>\n        <group>\n          <text term=\"no date\" form=\"short\"/>\n          <text variable=\"year-suffix\" prefix=\"-\"/>\n        </group>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"issued-sort\">\n    <choose>\n      <if type=\"article article-magazine article-newspaper broadcast interview pamphlet personal_communication post post-weblog speech treaty webpage\" match=\"any\">\n        <date variable=\"issued\">\n          <date-part name=\"year\"/>\n          <date-part name=\"month\"/>\n          <date-part name=\"day\"/>\n        </date>\n      </if>\n      <else>\n        <date variable=\"issued\">\n          <date-part name=\"year\"/>\n        </date>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"issued-year\">\n    <group>\n      <choose>\n        <if type=\"personal_communication\">\n          <choose>\n            <if variable=\"archive DOI publisher URL\" match=\"none\">\n              <!-- These variables indicate that the letter is retrievable by the reader. If not, then use the APA in-text-only personal communication format -->\n              <date variable=\"issued\" form=\"text\"/>\n            </if>\n            <else>\n              <date variable=\"issued\">\n                <date-part name=\"year\"/>\n              </date>\n            </else>\n          </choose>\n        </if>\n        <else>\n          <date variable=\"issued\">\n            <date-part name=\"year\"/>\n          </date>\n        </else>\n      </choose>\n      <text variable=\"year-suffix\"/>\n    </group>\n  </macro>\n  <macro name=\"issued-citation\">\n    <choose>\n      <if variable=\"issued\">\n        <group delimiter=\"/\">\n          <choose>\n            <if is-uncertain-date=\"original-date\">\n              <group prefix=\"[\" suffix=\"]\" delimiter=\" \">\n                <text term=\"circa\" form=\"short\"/>\n                <date variable=\"original-date\">\n                  <date-part name=\"year\"/>\n                </date>\n              </group>\n            </if>\n            <else>\n              <date variable=\"original-date\">\n                <date-part name=\"year\"/>\n              </date>\n            </else>\n          </choose>\n          <choose>\n            <if is-uncertain-date=\"issued\">\n              <group prefix=\"[\" suffix=\"]\" delimiter=\" \">\n                <text term=\"circa\" form=\"short\"/>\n                <text macro=\"issued-year\"/>\n              </group>\n            </if>\n            <else>\n              <text macro=\"issued-year\"/>\n            </else>\n          </choose>\n        </group>\n      </if>\n      <else-if variable=\"status\">\n        <text variable=\"status\" text-case=\"lowercase\"/>\n        <text variable=\"year-suffix\" prefix=\"-\"/>\n      </else-if>\n      <else>\n        <text term=\"no date\" form=\"short\"/>\n        <text variable=\"year-suffix\" prefix=\"-\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"original-date\">\n    <choose>\n      <if type=\"bill legal_case legislation\" match=\"any\"/>\n      <else-if type=\"speech\">\n        <date variable=\"original-date\" delimiter=\" \">\n          <date-part name=\"month\"/>\n          <date-part name=\"year\"/>\n        </date>\n      </else-if>\n      <else-if type=\"article article-magazine article-newspaper broadcast interview pamphlet personal_communication post post-weblog treaty webpage\" match=\"any\">\n        <date variable=\"original-date\" form=\"text\"/>\n      </else-if>\n      <else>\n        <date variable=\"original-date\">\n          <date-part name=\"year\"/>\n        </date>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"original-published\">\n    <!--This should be localized -->\n    <choose>\n      <if type=\"bill legal_case legislation\" match=\"any\"/>\n      <else-if type=\"interview motion_picture song\" match=\"any\">\n        <text value=\"Original work recorded\"/>\n      </else-if>\n      <else-if type=\"broadcast\">\n        <text value=\"Original work broadcast\"/>\n      </else-if>\n      <else>\n        <text value=\"Original work published\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"edition\">\n    <choose>\n      <if is-numeric=\"edition\">\n        <group delimiter=\" \">\n          <number variable=\"edition\" form=\"ordinal\"/>\n          <text term=\"edition\" form=\"short\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"edition\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"locators\">\n    <choose>\n      <if type=\"article-journal article-magazine figure review review-book\" match=\"any\">\n        <group delimiter=\", \">\n          <group>\n            <text variable=\"volume\" font-style=\"italic\"/>\n            <text variable=\"issue\" prefix=\"(\" suffix=\")\"/>\n          </group>\n          <text variable=\"page\"/>\n        </group>\n      </if>\n      <else-if type=\"article-newspaper\">\n        <group delimiter=\" \">\n          <label variable=\"page\" form=\"short\"/>\n          <text variable=\"page\"/>\n        </group>\n      </else-if>\n      <else-if type=\"paper-conference\">\n        <choose>\n          <if variable=\"collection-editor editor\" match=\"any\">\n            <text macro=\"locators-booklike\"/>\n          </if>\n          <else>\n            <group delimiter=\", \">\n              <group>\n                <text variable=\"volume\" font-style=\"italic\"/>\n                <text variable=\"issue\" prefix=\"(\" suffix=\")\"/>\n              </group>\n              <text variable=\"page\"/>\n            </group>\n          </else>\n        </choose>\n      </else-if>\n      <else-if type=\"bill broadcast interview legal_case legislation patent post post-weblog speech treaty webpage\" match=\"none\">\n        <text macro=\"locators-booklike\"/>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"locators-booklike\">\n    <group delimiter=\", \">\n      <text macro=\"edition\"/>\n      <group delimiter=\" \">\n        <text term=\"version\" text-case=\"capitalize-first\"/>\n        <text variable=\"version\"/>\n      </group>\n      <choose>\n        <if variable=\"volume\" match=\"any\">\n          <choose>\n            <if is-numeric=\"volume\" match=\"none\"/>\n            <else-if variable=\"collection-title\">\n              <choose>\n                <if variable=\"editor translator\" match=\"none\">\n                  <choose>\n                    <if variable=\"collection-number\">\n                      <group>\n                        <text term=\"volume\" form=\"short\" text-case=\"capitalize-first\" suffix=\" \"/>\n                        <number variable=\"volume\" form=\"numeric\"/>\n                      </group>\n                    </if>\n                  </choose>\n                </if>\n              </choose>\n            </else-if>\n            <else>\n              <group>\n                <text term=\"volume\" form=\"short\" text-case=\"capitalize-first\" suffix=\" \"/>\n                <number variable=\"volume\" form=\"numeric\"/>\n              </group>\n            </else>\n          </choose>\n        </if>\n        <else>\n          <group>\n            <text term=\"volume\" form=\"short\" plural=\"true\" text-case=\"capitalize-first\" suffix=\" \"/>\n            <number variable=\"number-of-volumes\" form=\"numeric\" prefix=\"1&#8211;\"/>\n          </group>\n        </else>\n      </choose>\n      <group>\n        <label variable=\"page\" form=\"short\" suffix=\" \"/>\n        <text variable=\"page\"/>\n      </group>\n    </group>\n  </macro>\n  <macro name=\"citation-locator\">\n    <group>\n      <choose>\n        <if locator=\"chapter\">\n          <label variable=\"locator\" text-case=\"capitalize-first\"/>\n        </if>\n        <else>\n          <label variable=\"locator\" form=\"short\"/>\n        </else>\n      </choose>\n      <text variable=\"locator\" prefix=\" \"/>\n    </group>\n  </macro>\n  <macro name=\"container\">\n    <choose>\n      <if type=\"article article-journal article-magazine article-newspaper review review-book\" match=\"any\">\n        <group delimiter=\", \">\n          <text macro=\"container-title\"/>\n          <text macro=\"locators\"/>\n        </group>\n        <choose>\n          <!--for advance online publication-->\n          <if variable=\"issued\">\n            <choose>\n              <if variable=\"page issue\" match=\"none\">\n                <text variable=\"status\" text-case=\"capitalize-first\" prefix=\". \"/>\n              </if>\n            </choose>\n          </if>\n        </choose>\n      </if>\n      <else-if type=\"article dataset figure\" match=\"any\">\n        <choose>\n          <if variable=\"container-title\">\n            <group delimiter=\", \">\n              <text macro=\"container-title\"/>\n              <text macro=\"locators\"/>\n            </group>\n            <choose>\n              <!--for advance online publication-->\n              <if variable=\"issued\">\n                <choose>\n                  <if variable=\"page issue\" match=\"none\">\n                    <text variable=\"status\" text-case=\"capitalize-first\" prefix=\". \"/>\n                  </if>\n                </choose>\n              </if>\n            </choose>\n          </if>\n        </choose>\n      </else-if>\n      <!-- book is here to catch software with container titles -->\n      <else-if type=\"book\" variable=\"container-title\" match=\"all\">\n        <group delimiter=\" \">\n          <text term=\"in\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <group delimiter=\", \">\n            <text macro=\"container-contributors\"/>\n            <group delimiter=\" \">\n              <text macro=\"container-title\"/>\n              <text macro=\"description-report\" prefix=\"(\" suffix=\")\"/>\n              <text macro=\"format-report\" prefix=\"[\" suffix=\"]\"/>\n            </group>\n          </group>\n        </group>\n      </else-if>\n      <else-if type=\"report\" variable=\"container-title\" match=\"all\">\n        <group delimiter=\" \">\n          <text term=\"in\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <group delimiter=\", \">\n            <text macro=\"container-contributors\"/>\n            <group delimiter=\" \">\n              <text macro=\"container-title\"/>\n              <text macro=\"description-report\" prefix=\"(\" suffix=\")\"/>\n              <text macro=\"format-report\" prefix=\"[\" suffix=\"]\"/>\n            </group>\n          </group>\n        </group>\n      </else-if>\n      <else-if type=\"song\" variable=\"container-title\" match=\"all\">\n        <group delimiter=\" \">\n          <text term=\"in\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <group delimiter=\", \">\n            <text macro=\"container-contributors\"/>\n            <group delimiter=\" \">\n              <text macro=\"container-title\"/>\n              <text macro=\"locators\" prefix=\"(\" suffix=\")\"/>\n              <group delimiter=\", \" prefix=\"[\" suffix=\"]\">\n                <text variable=\"genre\" text-case=\"capitalize-first\"/>\n                <text variable=\"medium\" text-case=\"capitalize-first\"/>\n              </group>\n            </group>\n          </group>\n        </group>\n      </else-if>\n      <else-if type=\"paper-conference\">\n        <choose>\n          <if variable=\"editor collection-editor container-author\" match=\"any\">\n            <text macro=\"container-booklike\"/>\n          </if>\n          <else>\n            <group delimiter=\", \">\n              <text macro=\"container-title\"/>\n              <text macro=\"locators\"/>\n            </group>\n          </else>\n        </choose>\n      </else-if>\n      <else-if type=\"book broadcast chapter entry entry-dictionary entry-encyclopedia graphic map speech\" match=\"any\">\n        <text macro=\"container-booklike\"/>\n      </else-if>\n      <else-if type=\"bill legal_case legislation treaty\" match=\"any\">\n        <text macro=\"legal-cites\"/>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"container-booklike\">\n    <choose>\n      <if variable=\"container-title collection-title\" match=\"any\">\n        <group delimiter=\" \">\n          <text term=\"in\" text-case=\"capitalize-first\"/>\n          <group delimiter=\", \">\n            <text macro=\"container-contributors\"/>\n            <choose>\n              <if variable=\"container-author editor translator\" match=\"none\">\n                <group delimiter=\". \">\n                  <group delimiter=\": \">\n                    <text variable=\"collection-title\" font-style=\"italic\" text-case=\"title\"/>\n                    <choose>\n                      <if variable=\"collection-title\">\n                        <group delimiter=\" \">\n                          <text term=\"volume\" form=\"short\" font-style=\"italic\" text-case=\"capitalize-first\"/>\n                          <number variable=\"collection-number\" font-style=\"italic\" form=\"numeric\"/>\n                          <choose>\n                            <if variable=\"collection-number\" match=\"none\">\n                              <number variable=\"volume\" font-style=\"italic\" form=\"numeric\"/>\n                            </if>\n                          </choose>\n                        </group>\n                      </if>\n                    </choose>\n                  </group>\n                  <!-- Replace with volume-title as that becomes available -->\n                  <group delimiter=\": \">\n                    <text macro=\"container-title\"/>\n                    <choose>\n                      <if variable=\"collection-title\" is-numeric=\"volume\" match=\"none\">\n                        <group delimiter=\" \">\n                          <text term=\"volume\" form=\"short\" font-style=\"italic\" text-case=\"capitalize-first\"/>\n                          <text variable=\"volume\" font-style=\"italic\"/>\n                        </group>\n                      </if>\n                    </choose>\n                  </group>\n                </group>\n              </if>\n              <else>\n                <!-- Replace with volume-title as that becomes available -->\n                <group delimiter=\": \">\n                  <text macro=\"container-title\"/>\n                  <choose>\n                    <if is-numeric=\"volume\" match=\"none\">\n                      <group delimiter=\" \">\n                        <text term=\"volume\" form=\"short\" font-style=\"italic\" text-case=\"capitalize-first\"/>\n                        <text variable=\"volume\" font-style=\"italic\"/>\n                      </group>\n                    </if>\n                  </choose>\n                </group>\n              </else>\n            </choose>\n          </group>\n          <group delimiter=\"; \" prefix=\"(\" suffix=\")\">\n            <text macro=\"locators\"/>\n            <names variable=\"container-author\">\n              <label form=\"verb-short\" suffix=\" \" text-case=\"title\"/>\n              <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n            </names>\n          </group>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"container-title\">\n    <choose>\n      <if type=\"article article-journal article-magazine article-newspaper dataset\" match=\"any\">\n        <text variable=\"container-title\" font-style=\"italic\" text-case=\"title\"/>\n      </if>\n      <else-if type=\"paper-conference speech\">\n        <choose>\n          <if variable=\"collection-editor container-author editor\" match=\"any\">\n            <text variable=\"container-title\" font-style=\"italic\"/>\n          </if>\n          <else>\n            <text variable=\"container-title\" font-style=\"italic\" text-case=\"title\"/>\n          </else>\n        </choose>\n      </else-if>\n      <else-if type=\"bill legal_case legislation post-weblog webpage\" match=\"none\">\n        <text variable=\"container-title\" font-style=\"italic\"/>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"legal-cites\">\n    <choose>\n      <if type=\"legal_case\">\n        <group prefix=\", \" delimiter=\" \">\n          <group delimiter=\" \">\n            <choose>\n              <if variable=\"container-title\">\n                <text variable=\"volume\"/>\n                <text variable=\"container-title\"/>\n                <group delimiter=\" \">\n                  <!--change to label variable=\"section\" as that becomes available -->\n                  <text term=\"section\" form=\"symbol\"/>\n                  <text variable=\"section\"/>\n                </group>\n                <text variable=\"page\"/>\n              </if>\n              <else>\n                <group delimiter=\" \">\n                  <choose>\n                    <if is-numeric=\"number\">\n                      <!-- Replace with term=\"number\" if that becomes available -->\n                      <text term=\"issue\" form=\"short\" text-case=\"capitalize-first\"/>\n                    </if>\n                  </choose>\n                  <text variable=\"number\"/>\n                </group>\n              </else>\n            </choose>\n          </group>\n          <group prefix=\"(\" suffix=\")\" delimiter=\" \">\n            <text variable=\"authority\"/>\n            <choose>\n              <if variable=\"container-title\" match=\"any\">\n                <!--Only print year for cases published in reporters-->\n                <date variable=\"issued\" form=\"numeric\" date-parts=\"year\"/>\n              </if>\n              <else>\n                <date variable=\"issued\" form=\"text\"/>\n              </else>\n            </choose>\n          </group>\n        </group>\n      </if>\n      <else-if type=\"bill legislation\" match=\"any\">\n        <group prefix=\", \" delimiter=\" \">\n          <group delimiter=\", \">\n            <choose>\n              <if variable=\"number\">\n                <!--There's a public law number-->\n                <text variable=\"number\" prefix=\"Pub. L. No. \"/>\n                <group delimiter=\" \">\n                  <!--change to label variable=\"section\" as that becomes available -->\n                  <text term=\"section\" form=\"symbol\"/>\n                  <text variable=\"section\"/>\n                </group>\n                <group delimiter=\" \">\n                  <text variable=\"volume\"/>\n                  <text variable=\"container-title\"/>\n                  <text variable=\"page-first\"/>\n                </group>\n              </if>\n              <else>\n                <group delimiter=\" \">\n                  <text variable=\"volume\"/>\n                  <text variable=\"container-title\"/>\n                  <!--change to label variable=\"section\" as that becomes available -->\n                  <text term=\"section\" form=\"symbol\"/>\n                  <text variable=\"section\"/>\n                </group>\n              </else>\n            </choose>\n          </group>\n          <date variable=\"issued\" prefix=\"(\" suffix=\")\">\n            <date-part name=\"year\"/>\n          </date>\n        </group>\n      </else-if>\n      <else-if type=\"treaty\">\n        <group delimiter=\" \">\n          <number variable=\"volume\"/>\n          <text variable=\"container-title\"/>\n          <text variable=\"page\"/>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <citation et-al-min=\"6\" et-al-use-first=\"1\" et-al-subsequent-min=\"3\" et-al-subsequent-use-first=\"1\" disambiguate-add-year-suffix=\"true\" disambiguate-add-names=\"true\" disambiguate-add-givenname=\"true\" collapse=\"year\" givenname-disambiguation-rule=\"primary-name\">\n    <sort>\n      <key macro=\"author\" names-min=\"8\" names-use-first=\"6\"/>\n      <key macro=\"issued-sort\"/>\n    </sort>\n    <layout prefix=\"(\" suffix=\")\" delimiter=\"; \">\n      <group delimiter=\", \">\n        <text macro=\"author-short\"/>\n        <text macro=\"issued-citation\"/>\n        <text macro=\"citation-locator\"/>\n      </group>\n    </layout>\n  </citation>\n  <bibliography hanging-indent=\"true\" et-al-min=\"8\" et-al-use-first=\"6\" et-al-use-last=\"true\" entry-spacing=\"0\" line-spacing=\"2\">\n    <sort>\n      <key macro=\"author\"/>\n      <key macro=\"issued-sort\" sort=\"ascending\"/>\n      <key macro=\"title\"/>\n    </sort>\n    <layout>\n      <group suffix=\".\">\n        <group delimiter=\". \">\n          <text macro=\"author\"/>\n          <choose>\n            <if is-uncertain-date=\"issued\">\n              <group prefix=\" [\" suffix=\"]\" delimiter=\" \">\n                <text term=\"circa\" form=\"short\"/>\n                <text macro=\"issued\"/>\n              </group>\n            </if>\n            <else>\n              <text macro=\"issued\" prefix=\" (\" suffix=\")\"/>\n            </else>\n          </choose>\n          <group delimiter=\" \">\n            <text macro=\"title\"/>\n            <choose>\n              <if variable=\"title interviewer\" type=\"interview\" match=\"any\">\n                <group delimiter=\" \">\n                  <text macro=\"description\"/>\n                  <text macro=\"format\"/>\n                </group>\n              </if>\n              <else>\n                <group delimiter=\" \">\n                  <text macro=\"format\"/>\n                  <text macro=\"description\"/>\n                </group>\n              </else>\n            </choose>\n          </group>\n          <text macro=\"container\"/>\n        </group>\n        <text macro=\"event\" prefix=\". \"/>\n      </group>\n      <text macro=\"access\" prefix=\" \"/>\n      <choose>\n        <if is-uncertain-date=\"original-date\">\n          <group prefix=\" [\" suffix=\"]\" delimiter=\" \">\n            <text macro=\"original-published\"/>\n            <text term=\"circa\" form=\"short\"/>\n            <text macro=\"original-date\"/>\n          </group>\n        </if>\n        <else-if variable=\"original-date\">\n          <group prefix=\" (\" suffix=\")\" delimiter=\" \">\n            <text macro=\"original-published\"/>\n            <text macro=\"original-date\"/>\n          </group>\n        </else-if>\n      </choose>\n    </layout>\n  </bibliography>\n</style>",
      "last_modified": 1649665699315
    }
  },
  {
    "refData": {
      "last_modified": 1649665699315,
      "basicCitation": {
        "data": {
          "html": "(Dido, 1823)",
          "text": "(Dido, 1823)",
          "rtx": "(Dido, 1823)"
        },
        "citatId": "10956915-fedc-4804-9649-2ed180dc7d44",
        "style": "basicStyle",
        "bibliography": "  <div class=\"csl-entry\">Dido, K. (1823). Title. In Trove OOD (Ed.), <i>BookTitle</i>: <i>Vol.</i> <i>Vol</i>. https://doi.org/DOI</div>\n"
      },
      "referenceData": {
        "author": [
          {
            "family": "Dido",
            "given": "Kolev"
          }
        ],
        "issued": {
          "date-parts": [
            [
              "1823",
              "05",
              "05"
            ]
          ]
        },
        "title": "Title",
        "editor": [
          {
            "family": "",
            "given": "Trove OOD"
          }
        ],
        "volume": "Vol",
        "container-title": "BookTitle",
        "event-title": "ConferenceNAme",
        "event-place": "ConferenceLocation",
        "event-date": "ConferenceDate",
        "number-of-pages": "NumberOfPages",
        "publisher": "Publisher",
        "city": "City",
        "collection-title": "JournalName",
        "journal-volume": "JournalVolume",
        "language": "PublisherLanguage",
        "URL": "https://dqwdqdw.com",
        "ISBN": "ISBN",
        "DOI": "DOI",
        "submit": true,
        "type": "paper-conference",
        "id": "1665a670-e416-458b-8768-0f1dfec4da2a"
      },
      "formioData": {
        "authors": [
          {
            "first": "Dido",
            "last": "Kolev",
            "name": "",
            "role": "author",
            "type": "person"
          }
        ],
        "issued": "1823-05-05",
        "title": "Title",
        "editor": [
          {
            "first": "",
            "last": "",
            "name": "Trove OOD",
            "role": "contributor",
            "type": "institution"
          }
        ],
        "volume": "Vol",
        "container-title": "BookTitle",
        "event-title": "ConferenceNAme",
        "event-place": "ConferenceLocation",
        "event-date": "ConferenceDate",
        "number-of-pages": "NumberOfPages",
        "publisher": "Publisher",
        "city": "City",
        "collection-title": "JournalName",
        "journal-volume": "JournalVolume",
        "language": "PublisherLanguage",
        "URL": "https://dqwdqdw.com",
        "ISBN": "ISBN",
        "DOI": "DOI",
        "submit": true
      }
    },
    "refType": {
      "name": "CONFERENCE PAPER",
      "label": "Conference Paper",
      "last_modified": 1649665699315,
      "type": "paper-conference",
      "formIOScheme": {
        "components": [
          {
            "label": "Authors",
            "reorder": false,
            "addAnotherPosition": "bottom",
            "defaultOpen": false,
            "layoutFixed": false,
            "enableRowGroups": false,
            "initEmpty": false,
            "clearOnHide": false,
            "tableView": false,
            "defaultValue": [
              {
                "first": "",
                "last": "",
                "name": "",
                "role": "",
                "type": ""
              }
            ],
            "key": "authors",
            "type": "datagrid",
            "input": true,
            "components": [
              {
                "label": "First",
                "tableView": true,
                "key": "first",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Last",
                "tableView": true,
                "key": "last",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Name",
                "tableView": true,
                "key": "name",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Role",
                "widget": "choicesjs",
                "tableView": true,
                "data": {
                  "values": [
                    {
                      "label": "Author",
                      "value": "author"
                    },
                    {
                      "label": "Contributor",
                      "value": "contributor"
                    },
                    {
                      "label": "Editor",
                      "value": "editor"
                    }
                  ]
                },
                "selectThreshold": 0.3,
                "key": "role",
                "type": "select",
                "indexeddb": {
                  "filter": {}
                },
                "input": true
              },
              {
                "label": "Type",
                "widget": "choicesjs",
                "tableView": true,
                "data": {
                  "values": [
                    {
                      "label": "Anonymous",
                      "value": "anonymous"
                    },
                    {
                      "label": "Person",
                      "value": "person"
                    },
                    {
                      "label": "Institution",
                      "value": "institution"
                    }
                  ]
                },
                "selectThreshold": 0.3,
                "key": "type",
                "type": "select",
                "indexeddb": {
                  "filter": {}
                },
                "input": true
              }
            ]
          },
          {
            "label": "Year of publication",
            "tableView": true,
            "key": "issued",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "validate": {
              "required": true,
              pattern: '[0-9]{4}'
            }
          },
          {
            "label": "Title",
            "tableView": true,
            "key": "title",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "validate": {
              "required": true
            }
          },
          {
            "label": "Editors",
            "reorder": false,
            "addAnotherPosition": "bottom",
            "defaultOpen": false,
            "layoutFixed": false,
            "enableRowGroups": false,
            "initEmpty": false,
            "clearOnHide": false,
            "tableView": false,
            "defaultValue": [
              {
                "first": "",
                "last": "",
                "name": "",
                "role": "",
                "type": ""
              }
            ],
            "key": "editor",
            "type": "datagrid",
            "input": true,
            "components": [
              {
                "label": "First",
                "tableView": true,
                "key": "first",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Last",
                "tableView": true,
                "key": "last",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Name",
                "tableView": true,
                "key": "name",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Role",
                "widget": "choicesjs",
                "tableView": true,
                "data": {
                  "values": [
                    {
                      "label": "Author",
                      "value": "author"
                    },
                    {
                      "label": "Contributor",
                      "value": "contributor"
                    },
                    {
                      "label": "Editor",
                      "value": "editor"
                    }
                  ]
                },
                "selectThreshold": 0.3,
                "key": "role",
                "type": "select",
                "indexeddb": {
                  "filter": {}
                },
                "input": true
              },
              {
                "label": "Type",
                "widget": "choicesjs",
                "tableView": true,
                "data": {
                  "values": [
                    {
                      "label": "Anonymous",
                      "value": "anonymous"
                    },
                    {
                      "label": "Person",
                      "value": "person"
                    },
                    {
                      "label": "Institution",
                      "value": "institution"
                    }
                  ]
                },
                "selectThreshold": 0.3,
                "key": "type",
                "type": "select",
                "indexeddb": {
                  "filter": {}
                },
                "input": true
              }
            ]
          },
          {
            "label": "Volume",
            "tableView": true,
            "key": "volume",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "Book title",
            "tableView": true,
            "key": "container-title",
            "type": "textfield",
            "input": true,
            "clearOnHide": false,
            "validate": {
              "required": true
            }
          },
          {
            "label": "Conference name",
            "tableView": true,
            "key": "event-title",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "Conference location",
            "tableView": true,
            "key": "event-place",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "Conference date",
            "tableView": true,
            "key": "event-date",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "Number of pages",
            "tableView": true,
            "key": "number-of-pages",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "Publisher",
            "tableView": true,
            "key": "publisher",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "City",
            "tableView": true,
            "key": "city",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "Journal name",
            "tableView": true,
            "key": "collection-title",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "Journal volume",
            "tableView": true,
            "key": "journal-volume",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "Publication language",
            "tableView": true,
            "key": "language",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "URL",
            "tableView": true,
            "key": "URL",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "ISBN",
            "tableView": true,
            "key": "ISBN",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "label": "DOI",
            "tableView": true,
            "key": "DOI",
            "type": "textfield",
            "input": true,
            "clearOnHide": false
          },
          {
            "type": "button",
            "label": "Submit",
            "key": "submit",
            "disableOnInvalid": true,
            "input": true,
            "tableView": false
          }
        ]
      }
    },
    "refStyle": {
      "name": "demo-style",
      "label": "CSL Demo",
      "style": "\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<style xmlns=\"http://purl.org/net/xbiblio/csl\" class=\"in-text\" version=\"1.0\" demote-non-dropping-particle=\"never\" page-range-format=\"expanded\">\n  <info>\n    <title>American Psychological Association 6th edition</title>\n    <title-short>APA</title-short>\n    <id>http://www.zotero.org/styles/apa</id>\n    <link href=\"http://www.zotero.org/styles/apa\" rel=\"self\"/>\n    <link href=\"http://owl.english.purdue.edu/owl/resource/560/01/\" rel=\"documentation\"/>\n    <author>\n      <name>Simon Kornblith</name>\n      <email>simon@simonster.com</email>\n    </author>\n    <author>\n      <name> Brenton M. Wiernik</name>\n      <email>zotero@wiernik.org</email>\n    </author>\n    <contributor>\n      <name>Bruce D'Arcus</name>\n    </contributor>\n    <contributor>\n      <name>Curtis M. Humphrey</name>\n    </contributor>\n    <contributor>\n      <name>Richard Karnesky</name>\n      <email>karnesky+zotero@gmail.com</email>\n      <uri>http://arc.nucapt.northwestern.edu/Richard_Karnesky</uri>\n    </contributor>\n    <contributor>\n      <name>Sebastian Karcher</name>\n    </contributor>\n    <category citation-format=\"author-date\"/>\n    <category field=\"psychology\"/>\n    <category field=\"generic-base\"/>\n    <updated>2016-09-28T13:09:49+00:00</updated>\n    <rights license=\"http://creativecommons.org/licenses/by-sa/3.0/\">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>\n  </info>\n  <locale xml:lang=\"en\">\n    <terms>\n      <term name=\"editortranslator\" form=\"short\">\n        <single>ed. &amp; trans.</single>\n        <multiple>eds. &amp; trans.</multiple>\n      </term>\n      <term name=\"translator\" form=\"short\">trans.</term>\n      <term name=\"interviewer\" form=\"short\">interviewer</term>\n      <term name=\"circa\" form=\"short\">ca.</term>\n      <term name=\"collection-editor\" form=\"short\">series ed.</term>\n    </terms>\n  </locale>\n  <locale xml:lang=\"es\">\n    <terms>\n      <term name=\"from\">de</term>\n    </terms>\n  </locale>\n  <macro name=\"container-contributors-booklike\">\n    <choose>\n      <if variable=\"container-title\">\n        <names variable=\"editor translator\" delimiter=\", &amp; \">\n          <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n          <label form=\"short\" prefix=\" (\" text-case=\"title\" suffix=\")\"/>\n          <substitute>\n            <names variable=\"editorial-director\"/>\n            <names variable=\"collection-editor\"/>\n            <names variable=\"container-author\"/>\n          </substitute>\n        </names>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"container-contributors\">\n    <choose>\n      <!-- book is here to catch software with container titles -->\n      <if type=\"book broadcast chapter entry entry-dictionary entry-encyclopedia graphic map personal_communication report speech\" match=\"any\">\n        <text macro=\"container-contributors-booklike\"/>\n      </if>\n      <else-if type=\"paper-conference\">\n        <choose>\n          <if variable=\"collection-editor container-author editor\" match=\"any\">\n            <text macro=\"container-contributors-booklike\"/>\n          </if>\n        </choose>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"secondary-contributors-booklike\">\n    <group delimiter=\"; \">\n      <choose>\n        <if variable=\"title\">\n          <names variable=\"interviewer\">\n            <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n            <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n          </names>\n        </if>\n      </choose>\n      <choose>\n        <if variable=\"container-title\" match=\"none\">\n          <group delimiter=\"; \">\n            <names variable=\"container-author\">\n              <label form=\"verb-short\" suffix=\" \" text-case=\"title\"/>\n              <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n            </names>\n            <names variable=\"editor translator\" delimiter=\"; \">\n              <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n              <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n            </names>\n          </group>\n        </if>\n      </choose>\n    </group>\n  </macro>\n  <macro name=\"secondary-contributors\">\n    <choose>\n      <!-- book is here to catch software with container titles -->\n      <if type=\"book broadcast chapter entry entry-dictionary entry-encyclopedia graphic map report\" match=\"any\">\n        <text macro=\"secondary-contributors-booklike\"/>\n      </if>\n      <else-if type=\"personal_communication\">\n        <group delimiter=\"; \">\n          <group delimiter=\" \">\n            <choose>\n              <if variable=\"genre\" match=\"any\">\n                <text variable=\"genre\" text-case=\"capitalize-first\"/>\n              </if>\n              <else>\n                <text term=\"letter\" text-case=\"capitalize-first\"/>\n              </else>\n            </choose>\n            <names variable=\"recipient\" delimiter=\", \">\n              <label form=\"verb\" suffix=\" \"/>\n              <name and=\"symbol\" delimiter=\", \"/>\n            </names>\n          </group>\n          <text variable=\"medium\" text-case=\"capitalize-first\"/>\n          <choose>\n            <if variable=\"container-title\" match=\"none\">\n              <names variable=\"editor translator\" delimiter=\"; \">\n                <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n                <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n              </names>\n            </if>\n          </choose>\n        </group>\n      </else-if>\n      <else-if type=\"song\">\n        <choose>\n          <if variable=\"original-author composer\" match=\"any\">\n            <group delimiter=\"; \">\n              <!-- Replace prefix with performer label as that becomes available -->\n              <names variable=\"author\" prefix=\"Recorded by \">\n                <label form=\"verb\" text-case=\"title\"/>\n                <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n              </names>\n              <names variable=\"translator\">\n                <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n                <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n              </names>\n            </group>\n          </if>\n        </choose>\n      </else-if>\n      <else-if type=\"article-journal article-magazine article-newspaper\" match=\"any\">\n        <group delimiter=\"; \">\n          <choose>\n            <if variable=\"title\">\n              <names variable=\"interviewer\" delimiter=\"; \">\n                <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n                <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n              </names>\n            </if>\n          </choose>\n          <names variable=\"translator\" delimiter=\"; \">\n            <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n            <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n          </names>\n        </group>\n      </else-if>\n      <else-if type=\"paper-conference\">\n        <choose>\n          <if variable=\"collection-editor editor\" match=\"any\">\n            <text macro=\"secondary-contributors-booklike\"/>\n          </if>\n          <else>\n            <group delimiter=\"; \">\n              <choose>\n                <if variable=\"title\">\n                  <names variable=\"interviewer\" delimiter=\"; \">\n                    <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n                    <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n                  </names>\n                </if>\n              </choose>\n              <names variable=\"translator\" delimiter=\"; \">\n                <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n                <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n              </names>\n            </group>\n          </else>\n        </choose>\n      </else-if>\n      <else>\n        <group delimiter=\"; \">\n          <choose>\n            <if variable=\"title\">\n              <names variable=\"interviewer\">\n                <name and=\"symbol\" initialize-with=\". \" delimiter=\"; \"/>\n                <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n              </names>\n            </if>\n          </choose>\n          <names variable=\"editor translator\" delimiter=\"; \">\n            <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n            <label form=\"short\" prefix=\", \" text-case=\"title\"/>\n          </names>\n        </group>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"author\">\n    <choose>\n      <if type=\"song\">\n        <names variable=\"composer\" delimiter=\", \">\n          <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n          <substitute>\n            <names variable=\"original-author\"/>\n            <names variable=\"author\"/>\n            <names variable=\"translator\">\n              <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n              <label form=\"short\" prefix=\" (\" suffix=\")\" text-case=\"title\"/>\n            </names>\n            <group delimiter=\" \">\n              <text macro=\"title\"/>\n              <text macro=\"description\"/>\n              <text macro=\"format\"/>\n            </group>\n          </substitute>\n        </names>\n      </if>\n      <else-if type=\"treaty\"/>\n      <else>\n        <names variable=\"author\" delimiter=\", \">\n          <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n          <substitute>\n            <names variable=\"illustrator\"/>\n            <names variable=\"composer\"/>\n            <names variable=\"director\">\n              <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n              <label form=\"long\" prefix=\" (\" suffix=\")\" text-case=\"title\"/>\n            </names>\n            <choose>\n              <if variable=\"container-title\">\n                <choose>\n                  <if type=\"book entry entry-dictionary entry-encyclopedia\">\n                    <text macro=\"title\"/>\n                  </if>\n                  <else>\n                    <names variable=\"translator\"/>\n                  </else>\n                </choose>\n                <names variable=\"translator\">\n                  <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n                    <label form=\"short\" prefix=\" (\" suffix=\")\" text-case=\"title\"/>\n                </names>\n              </if>\n            </choose>\n            <names variable=\"editor translator\" delimiter=\", \">\n              <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n                <label form=\"short\" prefix=\" (\" suffix=\")\" text-case=\"title\"/>\n            </names>\n            <names variable=\"editorial-director\">\n              <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n                <label form=\"short\" prefix=\" (\" suffix=\")\" text-case=\"title\"/>\n            </names>\n            <names variable=\"collection-editor\">\n              <name name-as-sort-order=\"all\" and=\"symbol\" sort-separator=\", \" initialize-with=\". \" delimiter=\", \" delimiter-precedes-last=\"always\"/>\n                <label form=\"short\" prefix=\" (\" suffix=\")\" text-case=\"title\"/>\n            </names>\n            <choose>\n              <if type=\"report\">\n                <text variable=\"publisher\"/>\n              </if>\n            </choose>\n            <group delimiter=\" \">\n              <text macro=\"title\"/>\n              <text macro=\"description\"/>\n              <text macro=\"format\"/>\n            </group>\n          </substitute>\n        </names>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"author-short\">\n    <choose>\n      <if type=\"patent\" variable=\"number\" match=\"all\">\n        <text macro=\"patent-number\"/>\n      </if>\n      <else-if type=\"treaty\">\n        <text variable=\"title\" form=\"short\"/>\n      </else-if>\n      <else-if type=\"personal_communication\">\n        <choose>\n          <if variable=\"archive DOI publisher URL\" match=\"none\">\n            <group delimiter=\", \">\n              <names variable=\"author\">\n                <name and=\"symbol\" delimiter=\", \" initialize-with=\". \"/>\n                <substitute>\n                  <text variable=\"title\" form=\"short\" quotes=\"true\"/>\n                </substitute>\n              </names>\n              <!-- This should be localized -->\n              <text value=\"personal communication\"/>\n            </group>\n          </if>\n          <else>\n            <names variable=\"author\" delimiter=\", \">\n              <name form=\"short\" and=\"symbol\" delimiter=\", \" initialize-with=\". \"/>\n              <substitute>\n                <names variable=\"editor\"/>\n                <names variable=\"translator\"/>\n                <choose>\n                  <if variable=\"container-title\">\n                    <text variable=\"title\" form=\"short\" quotes=\"true\"/>\n                  </if>\n                  <else>\n                    <text variable=\"title\" form=\"short\" font-style=\"italic\"/>\n                  </else>\n                </choose>\n                <text macro=\"format-short\" prefix=\"[\" suffix=\"]\"/>\n              </substitute>\n            </names>\n          </else>\n        </choose>\n      </else-if>\n      <else-if type=\"song\">\n        <names variable=\"composer\" delimiter=\", \">\n          <name form=\"short\" and=\"symbol\" delimiter=\", \" initialize-with=\". \"/>\n          <substitute>\n            <names variable=\"original-author\"/>\n            <names variable=\"author\"/>\n            <names variable=\"translator\"/>\n             <choose>\n              <if variable=\"container-title\">\n                <text variable=\"title\" form=\"short\" quotes=\"true\"/>\n              </if>\n              <else>\n                <text variable=\"title\" form=\"short\" font-style=\"italic\"/>\n              </else>\n            </choose>\n            <text macro=\"format-short\" prefix=\"[\" suffix=\"]\"/>\n          </substitute>\n        </names>\n      </else-if>\n      <else>\n        <names variable=\"author\" delimiter=\", \">\n          <name form=\"short\" and=\"symbol\" delimiter=\", \" initialize-with=\". \"/>\n          <substitute>\n            <names variable=\"illustrator\"/>\n            <names variable=\"composer\"/>\n            <names variable=\"director\"/>\n            <choose>\n              <if variable=\"container-title\">\n                <choose>\n                  <if type=\"book entry entry-dictionary entry-encyclopedia\">\n                    <text variable=\"title\" form=\"short\" quotes=\"true\"/>\n                  </if>\n                  <else>\n                    <names variable=\"translator\"/>\n                  </else>\n                </choose>\n              </if>\n            </choose>\n            <names variable=\"editor\"/>\n            <names variable=\"editorial-director\"/>\n            <names variable=\"translator\"/>\n            <choose>\n              <if type=\"report\" variable=\"publisher\" match=\"all\">\n                <text variable=\"publisher\"/>\n              </if>\n              <else-if type=\"legal_case\">\n                <text variable=\"title\" font-style=\"italic\"/>\n              </else-if>\n              <else-if type=\"bill legislation\" match=\"any\">\n                <text variable=\"title\" form=\"short\"/>\n              </else-if>\n              <else-if variable=\"reviewed-author\" type=\"review review-book\" match=\"any\">\n                <text macro=\"format-short\" prefix=\"[\" suffix=\"]\"/>\n              </else-if>\n              <else-if type=\"post post-weblog webpage\" variable=\"container-title\" match=\"any\">\n                <text variable=\"title\" form=\"short\" quotes=\"true\"/>\n              </else-if>\n              <else>\n                <text variable=\"title\" form=\"short\" font-style=\"italic\"/>\n              </else>\n            </choose>\n            <text macro=\"format-short\" prefix=\"[\" suffix=\"]\"/>\n          </substitute>\n        </names>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"patent-number\">\n    <!-- authority: U.S. ; genre: patent ; number: 123,445 -->\n    <group delimiter=\" \">\n      <text variable=\"authority\"/>\n      <choose>\n        <if variable=\"genre\">\n          <text variable=\"genre\" text-case=\"capitalize-first\"/>\n        </if>\n        <else>\n          <!-- This should be localized -->\n          <text value=\"patent\" text-case=\"capitalize-first\"/>\n        </else>\n      </choose>\n      <group delimiter=\" \">\n        <text term=\"issue\" form=\"short\" text-case=\"capitalize-first\"/>\n        <text variable=\"number\"/>\n      </group>\n    </group>\n  </macro>\n  <macro name=\"access\">\n    <choose>\n      <if type=\"bill legal_case legislation\" match=\"any\"/>\n      <else-if variable=\"DOI\" match=\"any\">\n        <text variable=\"DOI\" prefix=\"https://doi.org/\"/>\n      </else-if>\n      <else-if variable=\"URL\">\n        <group delimiter=\" \">\n          <text term=\"retrieved\" text-case=\"capitalize-first\"/>\n          <choose>\n            <if type=\"post post-weblog webpage\" match=\"any\">\n              <date variable=\"accessed\" form=\"text\" suffix=\",\"/>\n            </if>\n          </choose>\n          <text term=\"from\"/>\n          <choose>\n            <if type=\"report\">\n              <choose>\n                <if variable=\"author editor translator\" match=\"any\">\n                  <!-- This should be localized -->\n                  <text variable=\"publisher\" suffix=\" website:\"/>\n                </if>\n              </choose>\n            </if>\n            <else-if type=\"post post-weblog webpage\" match=\"any\">\n              <!-- This should be localized -->\n              <text variable=\"container-title\" suffix=\" website:\"/>\n            </else-if>\n          </choose>\n          <text variable=\"URL\"/>\n        </group>\n      </else-if>\n      <else-if variable=\"archive\">\n        <choose>\n          <if type=\"article article-journal article-magazine article-newspaper dataset paper-conference report speech thesis\" match=\"any\">\n            <!-- This section is for electronic database locations. Physical archives for these and other item types are called in 'publisher' macro -->\n            <choose>\n              <if variable=\"archive-place\" match=\"none\">\n                <group delimiter=\" \">\n                  <text term=\"retrieved\" text-case=\"capitalize-first\"/>\n                  <text term=\"from\"/>\n                  <text variable=\"archive\" suffix=\".\"/>\n                  <text variable=\"archive_location\" prefix=\"(\" suffix=\")\"/>\n                </group>\n              </if>\n              <else>\n                <text macro=\"publisher\" suffix=\".\"/>\n              </else>\n            </choose>\n          </if>\n          <else>\n            <text macro=\"publisher\" suffix=\".\"/>\n          </else>\n        </choose>\n      </else-if>\n      <else>\n        <text macro=\"publisher\" suffix=\".\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"title\">\n    <choose>\n      <if type=\"treaty\">\n        <group delimiter=\", \">\n          <text variable=\"title\" text-case=\"title\"/>\n          <names variable=\"author\">\n            <name initialize-with=\".\" form=\"short\" delimiter=\"-\"/>\n          </names>\n        </group>\n      </if>\n      <else-if type=\"patent\" variable=\"number\" match=\"all\">\n        <text macro=\"patent-number\" font-style=\"italic\"/>\n      </else-if>\n      <else-if variable=\"title\">\n        <choose>\n          <if variable=\"version\" type=\"book\" match=\"all\">\n            <!---This is a hack until we have a software type -->\n            <text variable=\"title\"/>\n          </if>\n          <else-if variable=\"reviewed-author reviewed-title\" type=\"review review-book\" match=\"any\">\n            <choose>\n              <if variable=\"reviewed-title\">\n                <choose>\n                  <if type=\"post post-weblog webpage\" variable=\"container-title\" match=\"any\">\n                    <text variable=\"title\"/>\n                  </if>\n                  <else>\n                    <text variable=\"title\" font-style=\"italic\"/>\n                  </else>\n                </choose>\n              </if>\n            </choose>\n          </else-if>\n          <else-if type=\"post post-weblog webpage\" variable=\"container-title\" match=\"any\">\n            <text variable=\"title\"/>\n          </else-if>\n          <else>\n            <text variable=\"title\" font-style=\"italic\"/>\n          </else>\n        </choose>\n      </else-if>\n      <else-if variable=\"interviewer\" type=\"interview\" match=\"any\">\n        <names variable=\"interviewer\">\n          <label form=\"verb-short\" suffix=\" \" text-case=\"capitalize-first\"/>\n          <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n        </names>\n      </else-if>\n    </choose>\n  </macro>\n  <!-- APA has four descriptive sections following the title: -->\n  <!-- (description), [format], container, event -->\n  <macro name=\"description\">\n    <group prefix=\"(\" suffix=\")\">\n      <choose>\n        <!-- book is here to catch software with container titles -->\n        <if type=\"book report\" match=\"any\">\n          <choose>\n            <if variable=\"container-title\">\n              <text macro=\"secondary-contributors\"/>\n            </if>\n            <else>\n              <group delimiter=\"; \">\n                <text macro=\"description-report\"/>\n                <text macro=\"secondary-contributors\"/>\n              </group>\n            </else>\n          </choose>\n        </if>\n        <else-if type=\"thesis\">\n          <group delimiter=\"; \">\n            <group delimiter=\", \">\n              <text variable=\"genre\" text-case=\"capitalize-first\"/>\n              <choose>\n                <!-- In APA journals, the university of a thesis is always cited, even if another locator is given -->\n                <if variable=\"DOI URL archive\" match=\"any\">\n                  <text variable=\"publisher\"/>\n                </if>\n              </choose>\n            </group>\n            <text macro=\"locators\"/>\n            <text macro=\"secondary-contributors\"/>\n          </group>\n        </else-if>\n        <else-if type=\"book interview manuscript motion_picture musical_score pamphlet post-weblog speech webpage\" match=\"any\">\n          <group delimiter=\"; \">\n            <text macro=\"locators\"/>\n            <text macro=\"secondary-contributors\"/>\n          </group>\n        </else-if>\n        <else-if type=\"song\">\n          <choose>\n            <if variable=\"container-title\" match=\"none\">\n              <text macro=\"locators\"/>\n            </if>\n          </choose>\n        </else-if>\n        <else-if type=\"article dataset figure\" match=\"any\">\n          <choose>\n            <if variable=\"container-title\">\n              <text macro=\"secondary-contributors\"/>\n            </if>\n            <else>\n              <group delimiter=\"; \">\n                <text macro=\"locators\"/>\n                <text macro=\"secondary-contributors\"/>\n              </group>\n            </else>\n          </choose>\n        </else-if>\n        <else-if type=\"bill legislation legal_case patent treaty personal_communication\" match=\"none\">\n          <text macro=\"secondary-contributors\"/>\n        </else-if>\n      </choose>\n    </group>\n  </macro>\n  <macro name=\"format\">\n    <group prefix=\"[\" suffix=\"]\">\n      <choose>\n        <if variable=\"reviewed-author reviewed-title\" type=\"review review-book\" match=\"any\">\n          <group delimiter=\", \">\n            <choose>\n              <if variable=\"genre\">\n                <!-- Delimiting by , rather than \"of\" to avoid incorrect grammar -->\n                <group delimiter=\", \">\n                  <text variable=\"genre\" text-case=\"capitalize-first\"/>\n                  <choose>\n                    <if variable=\"reviewed-title\">\n                      <text variable=\"reviewed-title\" font-style=\"italic\"/>\n                    </if>\n                    <else>\n                      <!-- Assume 'title' is title of reviewed work -->\n                      <text variable=\"title\" font-style=\"italic\"/>\n                    </else>\n                  </choose>\n                </group>\n              </if>\n              <else>\n                <!-- This should be localized -->\n                <group delimiter=\" \">\n                  <text value=\"Review of\"/>\n                  <choose>\n                    <if variable=\"reviewed-title\">\n                      <text variable=\"reviewed-title\" font-style=\"italic\"/>\n                    </if>\n                    <else>\n                      <!-- Assume 'title' is title of reviewed work -->\n                      <text variable=\"title\" font-style=\"italic\"/>\n                    </else>\n                  </choose>\n                </group>\n              </else>\n            </choose>\n            <names variable=\"reviewed-author\">\n              <label form=\"verb-short\" suffix=\" \"/>\n              <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n            </names>\n          </group>\n        </if>\n        <else>\n          <text macro=\"format-short\"/>\n        </else>\n      </choose>\n    </group>\n  </macro>\n  <macro name=\"format-short\">\n    <choose>\n      <if variable=\"reviewed-author reviewed-title\" type=\"review review-book\" match=\"any\">\n        <choose>\n          <if variable=\"reviewed-title\" match=\"none\">\n            <choose>\n              <if variable=\"genre\">\n                <!-- Delimiting by , rather than \"of\" to avoid incorrect grammar -->\n                <group delimiter=\", \">\n                  <text variable=\"genre\" text-case=\"capitalize-first\"/>\n                  <text variable=\"title\" form=\"short\" font-style=\"italic\"/>\n                </group>\n              </if>\n              <else>\n                <!-- This should be localized -->\n                <group delimiter=\" \">\n                  <text value=\"Review of\"/>\n                  <text variable=\"title\" form=\"short\" font-style=\"italic\"/>\n                </group>\n              </else>\n            </choose>\n          </if>\n          <else>\n            <text variable=\"title\" form=\"short\" quotes=\"true\"/>\n          </else>\n        </choose>\n      </if>\n      <else-if type=\"speech thesis\" match=\"any\">\n        <text variable=\"medium\" text-case=\"capitalize-first\"/>\n      </else-if>\n      <!-- book is here to catch software with container titles -->\n      <else-if type=\"book report\" match=\"any\">\n        <choose>\n          <if variable=\"container-title\" match=\"none\">\n            <text macro=\"format-report\"/>\n          </if>\n        </choose>\n      </else-if>\n      <else-if type=\"manuscript pamphlet\" match=\"any\">\n        <text variable=\"medium\" text-case=\"capitalize-first\"/>\n      </else-if>\n      <else-if type=\"personal_communication\">\n        <text macro=\"secondary-contributors\"/>\n      </else-if>\n      <else-if type=\"song\">\n        <group delimiter=\"; \">\n          <text macro=\"secondary-contributors\"/>\n          <choose>\n            <if variable=\"container-title\" match=\"none\">\n              <group delimiter=\", \">\n                <text variable=\"genre\" text-case=\"capitalize-first\"/>\n                <text variable=\"medium\" text-case=\"capitalize-first\"/>\n              </group>\n            </if>\n          </choose>\n        </group>\n      </else-if>\n      <else-if type=\"paper-conference\">\n        <group delimiter=\", \">\n          <choose>\n            <if variable=\"collection-editor editor issue page volume\" match=\"any\">\n              <text variable=\"genre\" text-case=\"capitalize-first\"/>\n            </if>\n          </choose>\n          <text variable=\"medium\" text-case=\"capitalize-first\"/>\n        </group>\n      </else-if>\n      <else-if type=\"bill legislation legal_case patent treaty\" match=\"none\">\n        <choose>\n          <if variable=\"genre medium\" match=\"any\">\n            <group delimiter=\", \">\n              <text variable=\"genre\" text-case=\"capitalize-first\"/>\n              <text variable=\"medium\" text-case=\"capitalize-first\"/>\n            </group>\n          </if>\n          <else-if type=\"dataset\">\n            <!-- This should be localized -->\n            <text value=\"Data set\"/>\n          </else-if>\n        </choose>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"description-report\">\n    <choose>\n      <if variable=\"number\">\n        <group delimiter=\"; \">\n          <group delimiter=\" \">\n            <text variable=\"genre\" text-case=\"title\"/>\n            <!-- Replace with term=\"number\" if that becomes available -->\n            <text term=\"issue\" form=\"short\" text-case=\"capitalize-first\"/>\n            <text variable=\"number\"/>\n          </group>\n          <text macro=\"locators\"/>\n        </group>\n      </if>\n      <else>\n        <text macro=\"locators\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"format-report\">\n    <choose>\n      <if variable=\"number\">\n        <text variable=\"medium\" text-case=\"capitalize-first\"/>\n      </if>\n      <else>\n        <group delimiter=\", \">\n          <text variable=\"genre\" text-case=\"capitalize-first\"/>\n          <text variable=\"medium\" text-case=\"capitalize-first\"/>\n        </group>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"archive\">\n    <group delimiter=\". \">\n      <group delimiter=\", \">\n        <choose>\n          <if type=\"manuscript\">\n            <text variable=\"genre\"/>\n          </if>\n        </choose>\n        <group delimiter=\" \">\n          <!-- Replace \"archive\" with \"archive_collection\" as that becomes available -->\n          <text variable=\"archive\"/>\n          <text variable=\"archive_location\" prefix=\"(\" suffix=\")\"/>\n        </group>\n      </group>\n      <group delimiter=\", \">\n        <!-- Move \"archive\" here when \"archive_collection\" becomes available -->\n        <text variable=\"archive-place\"/>\n      </group>\n    </group>\n  </macro>\n  <macro name=\"publisher\">\n    <choose>\n      <if type=\"manuscript pamphlet\" match=\"any\">\n        <choose>\n          <if variable=\"archive archive_location archive-place\" match=\"any\">\n            <group delimiter=\". \">\n              <group delimiter=\": \">\n                <text variable=\"publisher-place\"/>\n                <text variable=\"publisher\"/>\n              </group>\n              <text macro=\"archive\"/>\n            </group>\n          </if>\n          <else>\n            <group delimiter=\", \">\n              <text variable=\"genre\"/>\n              <text variable=\"publisher\"/>\n              <text variable=\"publisher-place\"/>\n            </group>\n          </else>\n        </choose>\n      </if>\n      <else-if type=\"thesis\" match=\"any\">\n        <group delimiter=\". \">\n          <group delimiter=\", \">\n            <text variable=\"publisher\"/>\n            <text variable=\"publisher-place\"/>\n          </group>\n          <text macro=\"archive\"/>\n        </group>\n      </else-if>\n      <else-if type=\"patent\">\n        <group delimiter=\". \">\n          <group delimiter=\": \">\n            <text variable=\"publisher-place\"/>\n            <text variable=\"publisher\"/>\n          </group>\n          <text macro=\"archive\"/>\n        </group>\n      </else-if>\n      <else-if type=\"article-journal article-magazine article-newspaper\" match=\"any\">\n        <text macro=\"archive\"/>\n      </else-if>\n      <else-if type=\"post post-weblog webpage\" match=\"none\">\n        <group delimiter=\". \">\n          <choose>\n            <if variable=\"event\">\n              <choose>\n                <!-- Only print publisher info if published in a proceedings -->\n                <if variable=\"collection-editor editor issue page volume\" match=\"any\">\n                  <group delimiter=\": \">\n                    <text variable=\"publisher-place\"/>\n                    <text variable=\"publisher\"/>\n                  </group>\n                </if>\n              </choose>\n            </if>\n            <else>\n              <group delimiter=\": \">\n                <text variable=\"publisher-place\"/>\n                <text variable=\"publisher\"/>\n              </group>\n            </else>\n          </choose>\n          <text macro=\"archive\"/>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"event\">\n    <choose>\n      <if variable=\"event\" type=\"speech paper-conference\" match=\"any\">\n        <choose>\n          <!-- Don't print event info if published in a proceedings -->\n          <if variable=\"collection-editor editor issue page volume\" match=\"none\">\n            <group delimiter=\" \">\n              <text variable=\"genre\" text-case=\"capitalize-first\"/>\n              <group delimiter=\" \">\n                <choose>\n                  <if variable=\"genre\">\n                    <text term=\"presented at\"/>\n                  </if>\n                  <else>\n                    <text term=\"presented at\" text-case=\"capitalize-first\"/>\n                  </else>\n                </choose>\n                <group delimiter=\", \">\n                  <text variable=\"event\"/>\n                  <text variable=\"event-place\"/>\n                </group>\n              </group>\n            </group>\n          </if>\n        </choose>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"issued\">\n    <choose>\n      <if type=\"bill legal_case legislation\" match=\"any\"/>\n      <else-if variable=\"issued\">\n        <group>\n          <date variable=\"issued\">\n            <date-part name=\"year\"/>\n          </date>\n          <text variable=\"year-suffix\"/>\n          <choose>\n            <if type=\"speech\">\n              <date variable=\"issued\" delimiter=\" \">\n                <date-part prefix=\", \" name=\"month\"/>\n              </date>\n            </if>\n            <else-if type=\"article article-magazine article-newspaper broadcast interview pamphlet personal_communication post post-weblog treaty webpage\" match=\"any\">\n              <date variable=\"issued\">\n                <date-part prefix=\", \" name=\"month\"/>\n                <date-part prefix=\" \" name=\"day\"/>\n              </date>\n            </else-if>\n            <else-if type=\"paper-conference\">\n              <choose>\n                <if variable=\"container-title\" match=\"none\">\n                  <date variable=\"issued\">\n                    <date-part prefix=\", \" name=\"month\"/>\n                    <date-part prefix=\" \" name=\"day\"/>\n                  </date>\n                </if>\n              </choose>\n            </else-if>\n            <!-- Only year: article-journal chapter entry entry-dictionary entry-encyclopedia dataset figure graphic motion_picture manuscript map musical_score paper-conference [published] patent report review review-book song thesis -->\n          </choose>\n        </group>\n      </else-if>\n      <else-if variable=\"status\">\n        <group>\n          <text variable=\"status\" text-case=\"lowercase\"/>\n          <text variable=\"year-suffix\" prefix=\"-\"/>\n        </group>\n      </else-if>\n      <else>\n        <group>\n          <text term=\"no date\" form=\"short\"/>\n          <text variable=\"year-suffix\" prefix=\"-\"/>\n        </group>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"issued-sort\">\n    <choose>\n      <if type=\"article article-magazine article-newspaper broadcast interview pamphlet personal_communication post post-weblog speech treaty webpage\" match=\"any\">\n        <date variable=\"issued\">\n          <date-part name=\"year\"/>\n          <date-part name=\"month\"/>\n          <date-part name=\"day\"/>\n        </date>\n      </if>\n      <else>\n        <date variable=\"issued\">\n          <date-part name=\"year\"/>\n        </date>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"issued-year\">\n    <group>\n      <choose>\n        <if type=\"personal_communication\">\n          <choose>\n            <if variable=\"archive DOI publisher URL\" match=\"none\">\n              <!-- These variables indicate that the letter is retrievable by the reader. If not, then use the APA in-text-only personal communication format -->\n              <date variable=\"issued\" form=\"text\"/>\n            </if>\n            <else>\n              <date variable=\"issued\">\n                <date-part name=\"year\"/>\n              </date>\n            </else>\n          </choose>\n        </if>\n        <else>\n          <date variable=\"issued\">\n            <date-part name=\"year\"/>\n          </date>\n        </else>\n      </choose>\n      <text variable=\"year-suffix\"/>\n    </group>\n  </macro>\n  <macro name=\"issued-citation\">\n    <choose>\n      <if variable=\"issued\">\n        <group delimiter=\"/\">\n          <choose>\n            <if is-uncertain-date=\"original-date\">\n              <group prefix=\"[\" suffix=\"]\" delimiter=\" \">\n                <text term=\"circa\" form=\"short\"/>\n                <date variable=\"original-date\">\n                  <date-part name=\"year\"/>\n                </date>\n              </group>\n            </if>\n            <else>\n              <date variable=\"original-date\">\n                <date-part name=\"year\"/>\n              </date>\n            </else>\n          </choose>\n          <choose>\n            <if is-uncertain-date=\"issued\">\n              <group prefix=\"[\" suffix=\"]\" delimiter=\" \">\n                <text term=\"circa\" form=\"short\"/>\n                <text macro=\"issued-year\"/>\n              </group>\n            </if>\n            <else>\n              <text macro=\"issued-year\"/>\n            </else>\n          </choose>\n        </group>\n      </if>\n      <else-if variable=\"status\">\n        <text variable=\"status\" text-case=\"lowercase\"/>\n        <text variable=\"year-suffix\" prefix=\"-\"/>\n      </else-if>\n      <else>\n        <text term=\"no date\" form=\"short\"/>\n        <text variable=\"year-suffix\" prefix=\"-\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"original-date\">\n    <choose>\n      <if type=\"bill legal_case legislation\" match=\"any\"/>\n      <else-if type=\"speech\">\n        <date variable=\"original-date\" delimiter=\" \">\n          <date-part name=\"month\"/>\n          <date-part name=\"year\"/>\n        </date>\n      </else-if>\n      <else-if type=\"article article-magazine article-newspaper broadcast interview pamphlet personal_communication post post-weblog treaty webpage\" match=\"any\">\n        <date variable=\"original-date\" form=\"text\"/>\n      </else-if>\n      <else>\n        <date variable=\"original-date\">\n          <date-part name=\"year\"/>\n        </date>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"original-published\">\n    <!--This should be localized -->\n    <choose>\n      <if type=\"bill legal_case legislation\" match=\"any\"/>\n      <else-if type=\"interview motion_picture song\" match=\"any\">\n        <text value=\"Original work recorded\"/>\n      </else-if>\n      <else-if type=\"broadcast\">\n        <text value=\"Original work broadcast\"/>\n      </else-if>\n      <else>\n        <text value=\"Original work published\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"edition\">\n    <choose>\n      <if is-numeric=\"edition\">\n        <group delimiter=\" \">\n          <number variable=\"edition\" form=\"ordinal\"/>\n          <text term=\"edition\" form=\"short\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"edition\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"locators\">\n    <choose>\n      <if type=\"article-journal article-magazine figure review review-book\" match=\"any\">\n        <group delimiter=\", \">\n          <group>\n            <text variable=\"volume\" font-style=\"italic\"/>\n            <text variable=\"issue\" prefix=\"(\" suffix=\")\"/>\n          </group>\n          <text variable=\"page\"/>\n        </group>\n      </if>\n      <else-if type=\"article-newspaper\">\n        <group delimiter=\" \">\n          <label variable=\"page\" form=\"short\"/>\n          <text variable=\"page\"/>\n        </group>\n      </else-if>\n      <else-if type=\"paper-conference\">\n        <choose>\n          <if variable=\"collection-editor editor\" match=\"any\">\n            <text macro=\"locators-booklike\"/>\n          </if>\n          <else>\n            <group delimiter=\", \">\n              <group>\n                <text variable=\"volume\" font-style=\"italic\"/>\n                <text variable=\"issue\" prefix=\"(\" suffix=\")\"/>\n              </group>\n              <text variable=\"page\"/>\n            </group>\n          </else>\n        </choose>\n      </else-if>\n      <else-if type=\"bill broadcast interview legal_case legislation patent post post-weblog speech treaty webpage\" match=\"none\">\n        <text macro=\"locators-booklike\"/>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"locators-booklike\">\n    <group delimiter=\", \">\n      <text macro=\"edition\"/>\n      <group delimiter=\" \">\n        <text term=\"version\" text-case=\"capitalize-first\"/>\n        <text variable=\"version\"/>\n      </group>\n      <choose>\n        <if variable=\"volume\" match=\"any\">\n          <choose>\n            <if is-numeric=\"volume\" match=\"none\"/>\n            <else-if variable=\"collection-title\">\n              <choose>\n                <if variable=\"editor translator\" match=\"none\">\n                  <choose>\n                    <if variable=\"collection-number\">\n                      <group>\n                        <text term=\"volume\" form=\"short\" text-case=\"capitalize-first\" suffix=\" \"/>\n                        <number variable=\"volume\" form=\"numeric\"/>\n                      </group>\n                    </if>\n                  </choose>\n                </if>\n              </choose>\n            </else-if>\n            <else>\n              <group>\n                <text term=\"volume\" form=\"short\" text-case=\"capitalize-first\" suffix=\" \"/>\n                <number variable=\"volume\" form=\"numeric\"/>\n              </group>\n            </else>\n          </choose>\n        </if>\n        <else>\n          <group>\n            <text term=\"volume\" form=\"short\" plural=\"true\" text-case=\"capitalize-first\" suffix=\" \"/>\n            <number variable=\"number-of-volumes\" form=\"numeric\" prefix=\"1&#8211;\"/>\n          </group>\n        </else>\n      </choose>\n      <group>\n        <label variable=\"page\" form=\"short\" suffix=\" \"/>\n        <text variable=\"page\"/>\n      </group>\n    </group>\n  </macro>\n  <macro name=\"citation-locator\">\n    <group>\n      <choose>\n        <if locator=\"chapter\">\n          <label variable=\"locator\" text-case=\"capitalize-first\"/>\n        </if>\n        <else>\n          <label variable=\"locator\" form=\"short\"/>\n        </else>\n      </choose>\n      <text variable=\"locator\" prefix=\" \"/>\n    </group>\n  </macro>\n  <macro name=\"container\">\n    <choose>\n      <if type=\"article article-journal article-magazine article-newspaper review review-book\" match=\"any\">\n        <group delimiter=\", \">\n          <text macro=\"container-title\"/>\n          <text macro=\"locators\"/>\n        </group>\n        <choose>\n          <!--for advance online publication-->\n          <if variable=\"issued\">\n            <choose>\n              <if variable=\"page issue\" match=\"none\">\n                <text variable=\"status\" text-case=\"capitalize-first\" prefix=\". \"/>\n              </if>\n            </choose>\n          </if>\n        </choose>\n      </if>\n      <else-if type=\"article dataset figure\" match=\"any\">\n        <choose>\n          <if variable=\"container-title\">\n            <group delimiter=\", \">\n              <text macro=\"container-title\"/>\n              <text macro=\"locators\"/>\n            </group>\n            <choose>\n              <!--for advance online publication-->\n              <if variable=\"issued\">\n                <choose>\n                  <if variable=\"page issue\" match=\"none\">\n                    <text variable=\"status\" text-case=\"capitalize-first\" prefix=\". \"/>\n                  </if>\n                </choose>\n              </if>\n            </choose>\n          </if>\n        </choose>\n      </else-if>\n      <!-- book is here to catch software with container titles -->\n      <else-if type=\"book\" variable=\"container-title\" match=\"all\">\n        <group delimiter=\" \">\n          <text term=\"in\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <group delimiter=\", \">\n            <text macro=\"container-contributors\"/>\n            <group delimiter=\" \">\n              <text macro=\"container-title\"/>\n              <text macro=\"description-report\" prefix=\"(\" suffix=\")\"/>\n              <text macro=\"format-report\" prefix=\"[\" suffix=\"]\"/>\n            </group>\n          </group>\n        </group>\n      </else-if>\n      <else-if type=\"report\" variable=\"container-title\" match=\"all\">\n        <group delimiter=\" \">\n          <text term=\"in\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <group delimiter=\", \">\n            <text macro=\"container-contributors\"/>\n            <group delimiter=\" \">\n              <text macro=\"container-title\"/>\n              <text macro=\"description-report\" prefix=\"(\" suffix=\")\"/>\n              <text macro=\"format-report\" prefix=\"[\" suffix=\"]\"/>\n            </group>\n          </group>\n        </group>\n      </else-if>\n      <else-if type=\"song\" variable=\"container-title\" match=\"all\">\n        <group delimiter=\" \">\n          <text term=\"in\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <group delimiter=\", \">\n            <text macro=\"container-contributors\"/>\n            <group delimiter=\" \">\n              <text macro=\"container-title\"/>\n              <text macro=\"locators\" prefix=\"(\" suffix=\")\"/>\n              <group delimiter=\", \" prefix=\"[\" suffix=\"]\">\n                <text variable=\"genre\" text-case=\"capitalize-first\"/>\n                <text variable=\"medium\" text-case=\"capitalize-first\"/>\n              </group>\n            </group>\n          </group>\n        </group>\n      </else-if>\n      <else-if type=\"paper-conference\">\n        <choose>\n          <if variable=\"editor collection-editor container-author\" match=\"any\">\n            <text macro=\"container-booklike\"/>\n          </if>\n          <else>\n            <group delimiter=\", \">\n              <text macro=\"container-title\"/>\n              <text macro=\"locators\"/>\n            </group>\n          </else>\n        </choose>\n      </else-if>\n      <else-if type=\"book broadcast chapter entry entry-dictionary entry-encyclopedia graphic map speech\" match=\"any\">\n        <text macro=\"container-booklike\"/>\n      </else-if>\n      <else-if type=\"bill legal_case legislation treaty\" match=\"any\">\n        <text macro=\"legal-cites\"/>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"container-booklike\">\n    <choose>\n      <if variable=\"container-title collection-title\" match=\"any\">\n        <group delimiter=\" \">\n          <text term=\"in\" text-case=\"capitalize-first\"/>\n          <group delimiter=\", \">\n            <text macro=\"container-contributors\"/>\n            <choose>\n              <if variable=\"container-author editor translator\" match=\"none\">\n                <group delimiter=\". \">\n                  <group delimiter=\": \">\n                    <text variable=\"collection-title\" font-style=\"italic\" text-case=\"title\"/>\n                    <choose>\n                      <if variable=\"collection-title\">\n                        <group delimiter=\" \">\n                          <text term=\"volume\" form=\"short\" font-style=\"italic\" text-case=\"capitalize-first\"/>\n                          <number variable=\"collection-number\" font-style=\"italic\" form=\"numeric\"/>\n                          <choose>\n                            <if variable=\"collection-number\" match=\"none\">\n                              <number variable=\"volume\" font-style=\"italic\" form=\"numeric\"/>\n                            </if>\n                          </choose>\n                        </group>\n                      </if>\n                    </choose>\n                  </group>\n                  <!-- Replace with volume-title as that becomes available -->\n                  <group delimiter=\": \">\n                    <text macro=\"container-title\"/>\n                    <choose>\n                      <if variable=\"collection-title\" is-numeric=\"volume\" match=\"none\">\n                        <group delimiter=\" \">\n                          <text term=\"volume\" form=\"short\" font-style=\"italic\" text-case=\"capitalize-first\"/>\n                          <text variable=\"volume\" font-style=\"italic\"/>\n                        </group>\n                      </if>\n                    </choose>\n                  </group>\n                </group>\n              </if>\n              <else>\n                <!-- Replace with volume-title as that becomes available -->\n                <group delimiter=\": \">\n                  <text macro=\"container-title\"/>\n                  <choose>\n                    <if is-numeric=\"volume\" match=\"none\">\n                      <group delimiter=\" \">\n                        <text term=\"volume\" form=\"short\" font-style=\"italic\" text-case=\"capitalize-first\"/>\n                        <text variable=\"volume\" font-style=\"italic\"/>\n                      </group>\n                    </if>\n                  </choose>\n                </group>\n              </else>\n            </choose>\n          </group>\n          <group delimiter=\"; \" prefix=\"(\" suffix=\")\">\n            <text macro=\"locators\"/>\n            <names variable=\"container-author\">\n              <label form=\"verb-short\" suffix=\" \" text-case=\"title\"/>\n              <name and=\"symbol\" initialize-with=\". \" delimiter=\", \"/>\n            </names>\n          </group>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"container-title\">\n    <choose>\n      <if type=\"article article-journal article-magazine article-newspaper dataset\" match=\"any\">\n        <text variable=\"container-title\" font-style=\"italic\" text-case=\"title\"/>\n      </if>\n      <else-if type=\"paper-conference speech\">\n        <choose>\n          <if variable=\"collection-editor container-author editor\" match=\"any\">\n            <text variable=\"container-title\" font-style=\"italic\"/>\n          </if>\n          <else>\n            <text variable=\"container-title\" font-style=\"italic\" text-case=\"title\"/>\n          </else>\n        </choose>\n      </else-if>\n      <else-if type=\"bill legal_case legislation post-weblog webpage\" match=\"none\">\n        <text variable=\"container-title\" font-style=\"italic\"/>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"legal-cites\">\n    <choose>\n      <if type=\"legal_case\">\n        <group prefix=\", \" delimiter=\" \">\n          <group delimiter=\" \">\n            <choose>\n              <if variable=\"container-title\">\n                <text variable=\"volume\"/>\n                <text variable=\"container-title\"/>\n                <group delimiter=\" \">\n                  <!--change to label variable=\"section\" as that becomes available -->\n                  <text term=\"section\" form=\"symbol\"/>\n                  <text variable=\"section\"/>\n                </group>\n                <text variable=\"page\"/>\n              </if>\n              <else>\n                <group delimiter=\" \">\n                  <choose>\n                    <if is-numeric=\"number\">\n                      <!-- Replace with term=\"number\" if that becomes available -->\n                      <text term=\"issue\" form=\"short\" text-case=\"capitalize-first\"/>\n                    </if>\n                  </choose>\n                  <text variable=\"number\"/>\n                </group>\n              </else>\n            </choose>\n          </group>\n          <group prefix=\"(\" suffix=\")\" delimiter=\" \">\n            <text variable=\"authority\"/>\n            <choose>\n              <if variable=\"container-title\" match=\"any\">\n                <!--Only print year for cases published in reporters-->\n                <date variable=\"issued\" form=\"numeric\" date-parts=\"year\"/>\n              </if>\n              <else>\n                <date variable=\"issued\" form=\"text\"/>\n              </else>\n            </choose>\n          </group>\n        </group>\n      </if>\n      <else-if type=\"bill legislation\" match=\"any\">\n        <group prefix=\", \" delimiter=\" \">\n          <group delimiter=\", \">\n            <choose>\n              <if variable=\"number\">\n                <!--There's a public law number-->\n                <text variable=\"number\" prefix=\"Pub. L. No. \"/>\n                <group delimiter=\" \">\n                  <!--change to label variable=\"section\" as that becomes available -->\n                  <text term=\"section\" form=\"symbol\"/>\n                  <text variable=\"section\"/>\n                </group>\n                <group delimiter=\" \">\n                  <text variable=\"volume\"/>\n                  <text variable=\"container-title\"/>\n                  <text variable=\"page-first\"/>\n                </group>\n              </if>\n              <else>\n                <group delimiter=\" \">\n                  <text variable=\"volume\"/>\n                  <text variable=\"container-title\"/>\n                  <!--change to label variable=\"section\" as that becomes available -->\n                  <text term=\"section\" form=\"symbol\"/>\n                  <text variable=\"section\"/>\n                </group>\n              </else>\n            </choose>\n          </group>\n          <date variable=\"issued\" prefix=\"(\" suffix=\")\">\n            <date-part name=\"year\"/>\n          </date>\n        </group>\n      </else-if>\n      <else-if type=\"treaty\">\n        <group delimiter=\" \">\n          <number variable=\"volume\"/>\n          <text variable=\"container-title\"/>\n          <text variable=\"page\"/>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <citation et-al-min=\"6\" et-al-use-first=\"1\" et-al-subsequent-min=\"3\" et-al-subsequent-use-first=\"1\" disambiguate-add-year-suffix=\"true\" disambiguate-add-names=\"true\" disambiguate-add-givenname=\"true\" collapse=\"year\" givenname-disambiguation-rule=\"primary-name\">\n    <sort>\n      <key macro=\"author\" names-min=\"8\" names-use-first=\"6\"/>\n      <key macro=\"issued-sort\"/>\n    </sort>\n    <layout prefix=\"(\" suffix=\")\" delimiter=\"; \">\n      <group delimiter=\", \">\n        <text macro=\"author-short\"/>\n        <text macro=\"issued-citation\"/>\n        <text macro=\"citation-locator\"/>\n      </group>\n    </layout>\n  </citation>\n  <bibliography hanging-indent=\"true\" et-al-min=\"8\" et-al-use-first=\"6\" et-al-use-last=\"true\" entry-spacing=\"0\" line-spacing=\"2\">\n    <sort>\n      <key macro=\"author\"/>\n      <key macro=\"issued-sort\" sort=\"ascending\"/>\n      <key macro=\"title\"/>\n    </sort>\n    <layout>\n      <group suffix=\".\">\n        <group delimiter=\". \">\n          <text macro=\"author\"/>\n          <choose>\n            <if is-uncertain-date=\"issued\">\n              <group prefix=\" [\" suffix=\"]\" delimiter=\" \">\n                <text term=\"circa\" form=\"short\"/>\n                <text macro=\"issued\"/>\n              </group>\n            </if>\n            <else>\n              <text macro=\"issued\" prefix=\" (\" suffix=\")\"/>\n            </else>\n          </choose>\n          <group delimiter=\" \">\n            <text macro=\"title\"/>\n            <choose>\n              <if variable=\"title interviewer\" type=\"interview\" match=\"any\">\n                <group delimiter=\" \">\n                  <text macro=\"description\"/>\n                  <text macro=\"format\"/>\n                </group>\n              </if>\n              <else>\n                <group delimiter=\" \">\n                  <text macro=\"format\"/>\n                  <text macro=\"description\"/>\n                </group>\n              </else>\n            </choose>\n          </group>\n          <text macro=\"container\"/>\n        </group>\n        <text macro=\"event\" prefix=\". \"/>\n      </group>\n      <text macro=\"access\" prefix=\" \"/>\n      <choose>\n        <if is-uncertain-date=\"original-date\">\n          <group prefix=\" [\" suffix=\"]\" delimiter=\" \">\n            <text macro=\"original-published\"/>\n            <text term=\"circa\" form=\"short\"/>\n            <text macro=\"original-date\"/>\n          </group>\n        </if>\n        <else-if variable=\"original-date\">\n          <group prefix=\" (\" suffix=\")\" delimiter=\" \">\n            <text macro=\"original-published\"/>\n            <text macro=\"original-date\"/>\n          </group>\n        </else-if>\n      </choose>\n    </layout>\n  </bibliography>\n</style>",
      "last_modified": 1649665699315
    }
  }
]
