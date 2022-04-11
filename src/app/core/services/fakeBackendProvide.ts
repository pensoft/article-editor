import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';

import { Inject, Injectable } from '@angular/core';
import { IAuthToken } from '@core/interfaces/auth.interface';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { BroadcasterService } from './broadcaster.service';
import { CONSTANTS } from './constants';
import { environment } from '@env';
@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  private tokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private _authservice: AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


    const token = this._authservice.getToken();

    if (token && req.url.endsWith('/references/types') && req.method === 'GET') {
      // check for fake auth token in header and return users if valid, this security is implemented server side in a real application
      return of(new HttpResponse({
        status: 200, body: {
          data: ReferenceTypesData
        }
      }));
    }


    return next.handle(req);
  }
}

let ReferenceTypesData = [
  {
    name: 'JOURNAL ARTICLE',
    label: 'Journal Article',
    type: "article-journal",
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
            "pattern": "[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])"
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
            "pattern": "[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])"
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
            "pattern": "[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])"
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
            "pattern": "[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])"
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
            "pattern": "[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])"
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
            "pattern": "[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])"
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
            "pattern": "[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])"
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
            "pattern": "[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])"
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
            "pattern": "[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])"
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

