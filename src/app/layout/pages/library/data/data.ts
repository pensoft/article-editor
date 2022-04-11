export interface reference {
  name: string,
  displayName: string,
  type: string,
  formFields: formField[],
}

export interface formField {
  label: string,
  cslKey: string,
  validations?:{
    required?: true,
    pattern?:string,
    min?:number,
    max?:number,
  },
  formIOComponentType?:string
}
export let referencesFormFieldsOnly: { [key: string]: formField[] } = {
  'JOURNAL ARTICLE': [
    { cslKey: 'authors', label: 'Authors' },
    { cslKey: 'issued',validations:{pattern:'[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])'}, label: 'Year of publication' },
    { cslKey: 'title', validations:{required: true}, label: 'Article title' },
    { cslKey: 'container-title', validations:{required: true}, label: 'Journal name' },
    { cslKey: 'volume', label: 'Volume' },
    { cslKey: 'issue', label: 'Issue' },
    { cslKey: 'page', label: 'Start page - EndPage' },
    { cslKey: 'language', label: 'Publication Language' },
    { cslKey: 'URL', label: 'URL' },
    { cslKey: 'DOI', label: 'DOI' },
  ],
  'BOOK': [
    { cslKey: 'authors', label: 'Authors' },
    { cslKey: 'issued', validations:{pattern:'[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])',required: true}, label: 'Year of publication' },
    { cslKey: 'title', validations:{required: true}, label: 'Book title' },
    { cslKey: 'translated-title', label: 'Translated title' },
    { cslKey: 'edition', label: 'Edition' },
    { cslKey: 'volume', label: 'Volume' },
    { cslKey: 'number-of-pages', label: 'Number of pages' },
    { cslKey: 'publisher', validations:{required: true}, label: 'Publisher' },
    { cslKey: 'city', label: 'City' },
    { cslKey: 'language', label: 'ublication language' },
    { cslKey: 'URL', label: 'URL' },
    { cslKey: 'ISBN', label: 'ISBN' },
    { cslKey: 'DOI', label: 'DOI' },
  ],
  'BOOK CHAPTER': [
    { cslKey: 'authors',  label: 'Authors' },
    { cslKey: 'issued',  validations:{pattern:'[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])',required: true}, label: 'Year of publication' },
    { cslKey: 'title',  validations:{required: true}, label: 'Chapter title' },
    { cslKey: 'container-title',  validations:{required: true}, label: 'Book title' },
    { cslKey: 'editor',  label: 'Editors' },
    { cslKey: 'volume',  label: 'Volume' },
    { cslKey: 'publisher',  label: 'Publisher' },
    { cslKey: 'city',  label: 'City' },
    { cslKey: 'number-of-pages',  label: 'Number of pages' },
    { cslKey: 'language',  label: 'Publication language' },
    { cslKey: 'URL',  label: 'URL' },
    { cslKey: 'ISBN',  label: 'ISBN' },
    { cslKey: 'DOI',  label: 'DOI' },
  ],
  'CONFERENCE PAPER': [
    { cslKey: 'authors', label: 'Authors' },
    { cslKey: 'issued', validations:{pattern:'[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])',required: true}, label: 'Year of publication' },
    { cslKey: 'title', validations:{required: true}, label: 'Title' },
    { cslKey: 'editor', label: 'Editors' },
    { cslKey: 'volume', label: 'Volume' },
    { cslKey: 'container-title', validations:{required: true}, label: 'Book title' },
    { cslKey: 'event-title', label: 'Conference name' },
    { cslKey: 'event-place', label: 'Conference location' },
    { cslKey: 'event-date', label: 'Conference date' },
    { cslKey: 'number-of-pages', label: 'Number of pages' },
    { cslKey: 'publisher', label: 'Publisher' },
    { cslKey: 'city', label: 'City' },
    { cslKey: 'collection-title', label: 'Journal name' },
    { cslKey: 'journal-volume', label: 'Journal volume' },
    { cslKey: 'language', label: 'Publication language' },
    { cslKey: 'URL', label: 'URL' },
    { cslKey: 'ISBN', label: 'ISBN' },
    { cslKey: 'DOI', label: 'DOI' }],

  'CONFERENCE PROCEEDINGS': [
    { cslKey: 'authors', label: 'Authors' },
    { cslKey: 'issued', validations:{pattern:'[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])',required: true}, label: 'Year of publication' },
    { cslKey: 'title', validations:{required: true}, label: 'Title' },
    { cslKey: 'volume', label: 'Volume' },
    { cslKey: 'event-title', label: 'Conference name' },
    { cslKey: 'event-place', label: 'Conference location' },
    { cslKey: 'event-date', label: 'Conference date' },
    { cslKey: 'number-of-pages', label: 'Number of pages' },
    { cslKey: 'publisher', label: 'Publisher' },
    { cslKey: 'city', label: 'City' },
    { cslKey: 'collection-title', label: 'Journal name' },
    { cslKey: 'journal-volume', label: 'Journal volume' },
    { cslKey: 'language', label: 'Publication language' },
    { cslKey: 'URL', label: 'URL' },
    { cslKey: 'ISBN', label: 'ISBN' },
    { cslKey: 'DOI', label: 'DOI' },
  ],
  'THESIS': [
    { cslKey: 'authors', label: 'Authors' },
    { cslKey: 'institution', label: 'Institution' },
    //{cslKey:'',key:'addAuthor',label:'Add Author'},
    { cslKey: 'issued', validations:{pattern:'[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])',required: true}, label: 'Year of publication' },
    { cslKey: 'title', validations:{required: true}, label: 'Book title' },
    { cslKey: 'translated-title', label: 'Translated title' },
    { cslKey: 'publisher', validations:{required: true}, label: 'Publisher' },
    { cslKey: 'city', label: 'City' },
    { cslKey: 'number-of-pages', label: 'Number of pages' },
    { cslKey: 'language', label: 'Publication language' },
    { cslKey: 'URL', label: 'URL' },
    { cslKey: 'ISBN', label: 'ISBN' },
    { cslKey: 'DOI', label: 'DOI' },
  ],
  'SOFTWARE/DATA': [
    { cslKey: 'authors', label: 'Authors' },
    { cslKey: 'issued', validations:{pattern:'[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])',required: true}, label: 'Year of publication' },
    { cslKey: 'title', validations:{required: true}, label: 'Title' },
    { cslKey: 'version', label: 'Version' },
    { cslKey: 'publisher', label: 'Publisher' },
    { cslKey: 'release-date', label: 'Release date' },
    { cslKey: 'URL', label: 'URL' },
  ],
  'WEBSITE': [
    { cslKey: 'authors', label: 'Authors' },
    { cslKey: 'issued', validations:{pattern:'[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])',required: true}, label: 'Year' },
    { cslKey: 'URL', validations:{required: true}, label: 'URL' },
    { cslKey: 'title', label: 'Title' },
    { cslKey: 'access-date', label: 'Date of access' },
  ],
  'OTHER': [
    { cslKey: 'authors', label: 'Authors' },
    { cslKey: 'issued', validations:{pattern:'[0-9]{4}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])',required: true}, label: 'Year of publication' },
    { cslKey: 'title', validations:{required: true}, label: 'Title' },
    { cslKey: 'notes', label: 'Notes' },
    { cslKey: 'publisher', label: 'Publisher' },
    { cslKey: 'URL', label: 'URL' },
    { cslKey: 'DOI', label: 'DOI' },
  ],
}
export let possibleReferenceTypes: reference[] = [
  { name: 'JOURNAL ARTICLE', type: "article-journal", displayName: 'Journal Article', formFields: referencesFormFieldsOnly['JOURNAL ARTICLE'] },
  { name: 'BOOK', displayName: 'Book', type: "book", formFields: referencesFormFieldsOnly['BOOK'] },
  { name: 'BOOK CHAPTER', type: "chapter", displayName: 'Book Chapter', formFields: referencesFormFieldsOnly['BOOK CHAPTER'] },
  { name: 'CONFERENCE PAPER', type: "paper-conference", displayName: 'Conference Paper', formFields: referencesFormFieldsOnly['CONFERENCE PAPER'] },
  { name: 'CONFERENCE PROCEEDINGS', type: "paper-conference", displayName: 'Conference Proceedings', formFields: referencesFormFieldsOnly['CONFERENCE PROCEEDINGS'] },
  { name: 'THESIS', type: "thesis", displayName: 'Thesis', formFields: referencesFormFieldsOnly['THESIS'] },
  { name: 'SOFTWARE/DATA', type: "software", displayName: 'Software / Data', formFields: referencesFormFieldsOnly['SOFTWARE/DATA'] },
  { name: 'WEBSITE', type: "webpage", displayName: 'Website', formFields: referencesFormFieldsOnly['WEBSITE'] },
  { name: 'OTHER', type: "article", displayName: 'Other', formFields: referencesFormFieldsOnly['OTHER'] },
]

export let formIOTextFieldTemplate = {
  "label": "",
  "tableView": true,
  "key": "",
  "type": "textfield",
  "input": true,
  "clearOnHide": false,
}

export let formioAuthorsDataGrid = {
  "label": "Data Grid",
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
  "key": "dataGrid",
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
          /*{
            "label": "Series Editor",
            "value": "series-creator"
          },
          {
            "label": "Translator",
            "value": "translator"
          } ,*/
          {
            "label": "Contributor",
            "value": "contributor"
          },
          /*{
            "label": "Reviewed Author",
            "value": "reviewed-author"
          },
          {
            "label": "Book Author",
            "value": "container-author"
          } ,*/
          {
            "label": "Editor",
            "value": "editor"
          }/* ,
          {
            "label": "Programmer",
            "value": "programmer"
          } */
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
}

export let allPossibleFields: string[] = [
  'authors',
  'yearOfPublication',
  'articleTitle',
  'bookTitle',
  'translatedTitle',
  'edition',
  'numberOfPages',
  'journalName',
  'journalVolume',
  'institution',
  'addAuthor',
  'version',
  'releaseDate',
  'year',
  'dateOfAccess',
  'notes',
  'volume',
  'issue',
  'city',
  'ISBN',
  'startPage',
  'endPage',
  'publicationLanguage',
  'url',
  'DOI',
  'publisher',
  'chapterTitle',
  'editors',
  'title',
  'conferenceName',
  'conferenceLocation',
  'conferenceDate',
]

let dataOnly = [
  {
    "data": {
      "key": "UAZETU4Z",
      "version": 76,
      "itemType": "book",
      "title": "Book",
      "creators": [
        {
          "creatorType": "author",
          "firstName": "Mincho",
          "lastName": "Minkov"
        },
        {
          "creatorType": "seriesEditor",
          "firstName": "qwdqwd",
          "lastName": "qwdqwd"
        },
        {
          "creatorType": "translator",
          "firstName": "qweqwe",
          "lastName": "qwe"
        },
        {
          "creatorType": "contributor",
          "firstName": "Miroslav",
          "lastName": "Ivanov"
        },
        {
          "creatorType": "editor",
          "firstName": "qwd",
          "lastName": "qwd"
        }
      ],
      "abstractNote": "abstract",
      "series": "",
      "seriesNumber": "sad",
      "volume": "",
      "numberOfVolumes": "",
      "edition": "",
      "place": "",
      "publisher": "",
      "date": "02/03/2222",
      "numPages": "",
      "language": "",
      "ISBN": "",
      "shortTitle": "",
      "url": "",
      "accessDate": "",
      "archive": "",
      "archiveLocation": "",
      "libraryCatalog": "",
      "callNumber": "dasasd",
      "rights": "",
      "extra": "",
      "tags": [],
      "collections": [],
      "relations": {},
      "dateAdded": "2022-04-04T09:03:49Z",
      "dateModified": "2022-04-04T10:24:48Z"
    }
  },
  {
    "data": {
      "key": "2BRQTBI4",
      "version": 103,
      "itemType": "bookSection",
      "title": "Book section",
      "creators": [
        {
          "creatorType": "author",
          "firstName": "First",
          "lastName": "Last"
        }
      ],
      "abstractNote": "",
      "bookTitle": "Book title",
      "series": "asd",
      "seriesNumber": "asd",
      "volume": "asd",
      "numberOfVolumes": "jiijij",
      "edition": "jiij",
      "place": "ijij",
      "publisher": "ji",
      "date": "ijij",
      "pages": "ij",
      "language": "ij",
      "ISBN": "ij",
      "shortTitle": "ij",
      "url": "ij",
      "accessDate": "1999-03-03",
      "archive": "asd",
      "archiveLocation": "po",
      "libraryCatalog": "po",
      "callNumber": "op",
      "rights": "po",
      "extra": "po",
      "tags": [],
      "collections": [],
      "relations": {},
      "dateAdded": "2022-04-04T10:25:18Z",
      "dateModified": "2022-04-04T10:26:06Z"
    }
  },
  {
    "data": {
      "key": "92GK7W64",
      "version": 130,
      "itemType": "conferencePaper",
      "title": "Conference paper",
      "creators": [
        {
          "creatorType": "author",
          "firstName": "First",
          "lastName": "Last"
        }
      ],
      "abstractNote": "qweqwe",
      "date": "data",
      "proceedingsTitle": "qwd",
      "conferenceName": "qwd",
      "place": "qwd",
      "publisher": "op",
      "volume": "po",
      "pages": "op",
      "series": "op",
      "language": "op",
      "DOI": "op",
      "ISBN": "po",
      "shortTitle": "op",
      "url": "op",
      "accessDate": "1999-02-02",
      "archive": "qwe",
      "archiveLocation": "eqw",
      "libraryCatalog": "eeqwe",
      "callNumber": "eqwe",
      "rights": "qwe",
      "extra": "qwe",
      "tags": [],
      "collections": [],
      "relations": {},
      "dateAdded": "2022-04-04T10:26:22Z",
      "dateModified": "2022-04-04T10:27:30Z"
    }
  },
  {
    "data": {
      "key": "SGFZ8DPF",
      "version": 75,
      "itemType": "journalArticle",
      "title": "Journal article",
      "creators": [
        {
          "creatorType": "author",
          "firstName": "Last",
          "lastName": "First"
        }
      ],
      "abstractNote": "",
      "publicationTitle": "asdasd",
      "volume": "asdasd",
      "issue": "asd",
      "pages": "asd",
      "date": "яве",
      "series": "asd",
      "seriesTitle": "asd",
      "seriesText": "asd",
      "journalAbbreviation": "asd",
      "language": "вея",
      "DOI": "asd",
      "ISSN": "asd",
      "shortTitle": "яве",
      "url": "вяе",
      "accessDate": "1999-02-02",
      "archive": "as",
      "archiveLocation": "asd",
      "libraryCatalog": "asd",
      "callNumber": "asd",
      "rights": "яев",
      "extra": "яев",
      "tags": [],
      "collections": [],
      "relations": {},
      "dateAdded": "2022-04-04T10:20:28Z",
      "dateModified": "2022-04-04T10:23:42Z"
    }
  },
  {
    "data": {
      "key": "27RX3NWX",
      "version": 173,
      "itemType": "computerProgram",
      "title": "Software",
      "creators": [
        {
          "creatorType": "programmer",
          "firstName": "Programmer",
          "lastName": "Programmer"
        }
      ],
      "abstractNote": "",
      "seriesTitle": "qwe",
      "versionNumber": "qwe",
      "date": "eqwe",
      "system": "oop",
      "place": "po",
      "company": "po",
      "programmingLanguage": "po",
      "ISBN": "po",
      "shortTitle": "po",
      "url": "po",
      "rights": "op",
      "archive": "po",
      "archiveLocation": "po",
      "libraryCatalog": "po",
      "callNumber": "po",
      "accessDate": "1233-02-02",
      "extra": "asd",
      "tags": [],
      "collections": [],
      "relations": {},
      "dateAdded": "2022-04-04T10:29:50Z",
      "dateModified": "2022-04-04T10:30:50Z"
    }
  },
  {
    "data": {
      "key": "ASRS62AQ",
      "version": 151,
      "itemType": "thesis",
      "title": "Thesis",
      "creators": [
        {
          "creatorType": "author",
          "firstName": "asd",
          "lastName": "Last"
        }
      ],
      "abstractNote": "",
      "thesisType": "qw",
      "university": "po",
      "place": "po",
      "date": "po",
      "numPages": "po",
      "language": "po",
      "shortTitle": "po",
      "url": "po",
      "accessDate": "1999-09-09",
      "archive": "po",
      "archiveLocation": "po",
      "libraryCatalog": "po",
      "callNumber": "po",
      "rights": "po",
      "extra": "po",
      "tags": [],
      "collections": [],
      "relations": {},
      "dateAdded": "2022-04-04T10:28:03Z",
      "dateModified": "2022-04-04T10:29:39Z"
    }
  }
]
let data = [
  {
    "key": "UAZETU4Z",
    "version": 76,
    "library": {
      "type": "user",
      "id": 9321004,
      "name": "scalewest",
      "links": {
        "alternate": {
          "href": "https://www.zotero.org/scalewest",
          "type": "text/html"
        }
      }
    },
    "links": {
      "self": {
        "href": "https://api.zotero.org/users/9321004/items/UAZETU4Z",
        "type": "application/json"
      },
      "alternate": {
        "href": "https://www.zotero.org/scalewest/items/UAZETU4Z",
        "type": "text/html"
      }
    },
    "meta": {
      "creatorSummary": "Minkov",
      "parsedDate": "2222-02-03",
      "numChildren": 0
    },
    "data": {
      "key": "UAZETU4Z",
      "version": 76,
      "itemType": "book",
      "title": "Book",
      "creators": [
        {
          "creatorType": "author",
          "firstName": "Mincho",
          "lastName": "Minkov"
        },
        {
          "creatorType": "seriesEditor",
          "firstName": "qwdqwd",
          "lastName": "qwdqwd"
        },
        {
          "creatorType": "translator",
          "firstName": "qweqwe",
          "lastName": "qwe"
        },
        {
          "creatorType": "contributor",
          "firstName": "Miroslav",
          "lastName": "Ivanov"
        },
        {
          "creatorType": "editor",
          "firstName": "qwd",
          "lastName": "qwd"
        }
      ],
      "abstractNote": "abstract",
      "series": "",
      "seriesNumber": "sad",
      "volume": "",
      "numberOfVolumes": "",
      "edition": "",
      "place": "",
      "publisher": "",
      "date": "02/03/2222",
      "numPages": "",
      "language": "",
      "ISBN": "",
      "shortTitle": "",
      "url": "",
      "accessDate": "",
      "archive": "",
      "archiveLocation": "",
      "libraryCatalog": "",
      "callNumber": "dasasd",
      "rights": "",
      "extra": "",
      "tags": [],
      "collections": [],
      "relations": {},
      "dateAdded": "2022-04-04T09:03:49Z",
      "dateModified": "2022-04-04T10:24:48Z"
    }
  },
  {
    "key": "2BRQTBI4",
    "version": 103,
    "library": {
      "type": "user",
      "id": 9321004,
      "name": "scalewest",
      "links": {
        "alternate": {
          "href": "https://www.zotero.org/scalewest",
          "type": "text/html"
        }
      }
    },
    "links": {
      "self": {
        "href": "https://api.zotero.org/users/9321004/items/2BRQTBI4",
        "type": "application/json"
      },
      "alternate": {
        "href": "https://www.zotero.org/scalewest/items/2BRQTBI4",
        "type": "text/html"
      }
    },
    "meta": {
      "creatorSummary": "Last",
      "numChildren": 0
    },
    "data": {
      "key": "2BRQTBI4",
      "version": 103,
      "itemType": "bookSection",
      "title": "Book section",
      "creators": [
        {
          "creatorType": "author",
          "firstName": "First",
          "lastName": "Last"
        }
      ],
      "abstractNote": "",
      "bookTitle": "Book title",
      "series": "asd",
      "seriesNumber": "asd",
      "volume": "asd",
      "numberOfVolumes": "jiijij",
      "edition": "jiij",
      "place": "ijij",
      "publisher": "ji",
      "date": "ijij",
      "pages": "ij",
      "language": "ij",
      "ISBN": "ij",
      "shortTitle": "ij",
      "url": "ij",
      "accessDate": "1999-03-03",
      "archive": "asd",
      "archiveLocation": "po",
      "libraryCatalog": "po",
      "callNumber": "op",
      "rights": "po",
      "extra": "po",
      "tags": [],
      "collections": [],
      "relations": {},
      "dateAdded": "2022-04-04T10:25:18Z",
      "dateModified": "2022-04-04T10:26:06Z"
    }
  },
  {
    "key": "92GK7W64",
    "version": 130,
    "library": {
      "type": "user",
      "id": 9321004,
      "name": "scalewest",
      "links": {
        "alternate": {
          "href": "https://www.zotero.org/scalewest",
          "type": "text/html"
        }
      }
    },
    "links": {
      "self": {
        "href": "https://api.zotero.org/users/9321004/items/92GK7W64",
        "type": "application/json"
      },
      "alternate": {
        "href": "https://www.zotero.org/scalewest/items/92GK7W64",
        "type": "text/html"
      }
    },
    "meta": {
      "creatorSummary": "Last",
      "numChildren": 0
    },
    "data": {
      "key": "92GK7W64",
      "version": 130,
      "itemType": "conferencePaper",
      "title": "Conference paper",
      "creators": [
        {
          "creatorType": "author",
          "firstName": "First",
          "lastName": "Last"
        }
      ],
      "abstractNote": "qweqwe",
      "date": "data",
      "proceedingsTitle": "qwd",
      "conferenceName": "qwd",
      "place": "qwd",
      "publisher": "op",
      "volume": "po",
      "pages": "op",
      "series": "op",
      "language": "op",
      "DOI": "op",
      "ISBN": "po",
      "shortTitle": "op",
      "url": "op",
      "accessDate": "1999-02-02",
      "archive": "qwe",
      "archiveLocation": "eqw",
      "libraryCatalog": "eeqwe",
      "callNumber": "eqwe",
      "rights": "qwe",
      "extra": "qwe",
      "tags": [],
      "collections": [],
      "relations": {},
      "dateAdded": "2022-04-04T10:26:22Z",
      "dateModified": "2022-04-04T10:27:30Z"
    }
  },
  {
    "key": "SGFZ8DPF",
    "version": 75,
    "library": {
      "type": "user",
      "id": 9321004,
      "name": "scalewest",
      "links": {
        "alternate": {
          "href": "https://www.zotero.org/scalewest",
          "type": "text/html"
        }
      }
    },
    "links": {
      "self": {
        "href": "https://api.zotero.org/users/9321004/items/SGFZ8DPF",
        "type": "application/json"
      },
      "alternate": {
        "href": "https://www.zotero.org/scalewest/items/SGFZ8DPF",
        "type": "text/html"
      }
    },
    "meta": {
      "creatorSummary": "First",
      "numChildren": 0
    },
    "data": {
      "key": "SGFZ8DPF",
      "version": 75,
      "itemType": "journalArticle",
      "title": "Journal article",
      "creators": [
        {
          "creatorType": "author",
          "firstName": "Last",
          "lastName": "First"
        }
      ],
      "abstractNote": "",
      "publicationTitle": "asdasd",
      "volume": "asdasd",
      "issue": "asd",
      "pages": "asd",
      "date": "яве",
      "series": "asd",
      "seriesTitle": "asd",
      "seriesText": "asd",
      "journalAbbreviation": "asd",
      "language": "вея",
      "DOI": "asd",
      "ISSN": "asd",
      "shortTitle": "яве",
      "url": "вяе",
      "accessDate": "1999-02-02",
      "archive": "as",
      "archiveLocation": "asd",
      "libraryCatalog": "asd",
      "callNumber": "asd",
      "rights": "яев",
      "extra": "яев",
      "tags": [],
      "collections": [],
      "relations": {},
      "dateAdded": "2022-04-04T10:20:28Z",
      "dateModified": "2022-04-04T10:23:42Z"
    }
  },
  {
    "key": "27RX3NWX",
    "version": 173,
    "library": {
      "type": "user",
      "id": 9321004,
      "name": "scalewest",
      "links": {
        "alternate": {
          "href": "https://www.zotero.org/scalewest",
          "type": "text/html"
        }
      }
    },
    "links": {
      "self": {
        "href": "https://api.zotero.org/users/9321004/items/27RX3NWX",
        "type": "application/json"
      },
      "alternate": {
        "href": "https://www.zotero.org/scalewest/items/27RX3NWX",
        "type": "text/html"
      }
    },
    "meta": {
      "creatorSummary": "Programmer",
      "numChildren": 1
    },
    "data": {
      "key": "27RX3NWX",
      "version": 173,
      "itemType": "computerProgram",
      "title": "Software",
      "creators": [
        {
          "creatorType": "programmer",
          "firstName": "Programmer",
          "lastName": "Programmer"
        }
      ],
      "abstractNote": "",
      "seriesTitle": "qwe",
      "versionNumber": "qwe",
      "date": "eqwe",
      "system": "oop",
      "place": "po",
      "company": "po",
      "programmingLanguage": "po",
      "ISBN": "po",
      "shortTitle": "po",
      "url": "po",
      "rights": "op",
      "archive": "po",
      "archiveLocation": "po",
      "libraryCatalog": "po",
      "callNumber": "po",
      "accessDate": "1233-02-02",
      "extra": "asd",
      "tags": [],
      "collections": [],
      "relations": {},
      "dateAdded": "2022-04-04T10:29:50Z",
      "dateModified": "2022-04-04T10:30:50Z"
    }
  },
  {
    "key": "IIGT5BDF",
    "version": 34,
    "library": {
      "type": "user",
      "id": 9321004,
      "name": "scalewest",
      "links": {
        "alternate": {
          "href": "https://www.zotero.org/scalewest",
          "type": "text/html"
        }
      }
    },
    "links": {
      "self": {
        "href": "https://api.zotero.org/users/9321004/items/IIGT5BDF",
        "type": "application/json"
      },
      "alternate": {
        "href": "https://www.zotero.org/scalewest/items/IIGT5BDF",
        "type": "text/html"
      }
    },
    "meta": {
      "numChildren": 0
    },
    "data": {
      "key": "IIGT5BDF",
      "version": 34,
      "itemType": "note",
      "note": "<p>Test</p>",
      "tags": [],
      "collections": [],
      "relations": {},
      "dateAdded": "2022-04-04T10:13:08Z",
      "dateModified": "2022-04-04T10:13:18Z"
    }
  },
  {
    "key": "ASRS62AQ",
    "version": 151,
    "library": {
      "type": "user",
      "id": 9321004,
      "name": "scalewest",
      "links": {
        "alternate": {
          "href": "https://www.zotero.org/scalewest",
          "type": "text/html"
        }
      }
    },
    "links": {
      "self": {
        "href": "https://api.zotero.org/users/9321004/items/ASRS62AQ",
        "type": "application/json"
      },
      "alternate": {
        "href": "https://www.zotero.org/scalewest/items/ASRS62AQ",
        "type": "text/html"
      }
    },
    "meta": {
      "creatorSummary": "Last",
      "numChildren": 0
    },
    "data": {
      "key": "ASRS62AQ",
      "version": 151,
      "itemType": "thesis",
      "title": "Thesis",
      "creators": [
        {
          "creatorType": "author",
          "firstName": "asd",
          "lastName": "Last"
        }
      ],
      "abstractNote": "",
      "thesisType": "qw",
      "university": "po",
      "place": "po",
      "date": "po",
      "numPages": "po",
      "language": "po",
      "shortTitle": "po",
      "url": "po",
      "accessDate": "1999-09-09",
      "archive": "po",
      "archiveLocation": "po",
      "libraryCatalog": "po",
      "callNumber": "po",
      "rights": "po",
      "extra": "po",
      "tags": [],
      "collections": [],
      "relations": {},
      "dateAdded": "2022-04-04T10:28:03Z",
      "dateModified": "2022-04-04T10:29:39Z"
    }
  }
]

export let exampleCitation = [
  { "citationID": "SXDNEKR5AD", "citationItems": [{ "id": "2kntpabvm2" }], "properties": { "noteIndex": 1 } },
  [],
  []
]

export let basicJournalArticleData = {
  "type": "article-journal",
  "title": "Journal Title",
  "container-title": "Journal Name",
  "page": "427-454",
  "volume": "24",
  "issue": "3",
  "URL": "http://www.jstor.org/stable/173640",
  "DOI": "doi",
  "language": 'Publication language',
  "ISSN": "0022-0027",
  "author": [{ "family": "Mandel", "given": "Robert", "multi": { "_key": {} } }],
  "id": "2kntpabvm2"
}

export let sclProps = [
  "type",
  "id",
  "citation-key",
  "categories",
  "language",
  "journalAbbreviation",
  "shortTitle",
  "author",               // all types authors
  "chair",
  "collection-editor",
  "compiler",
  "composer",
  "container-author",
  "contributor",
  "curator",
  "director",
  "editor",
  "editorial-director",
  "executive-producer",
  "guest",
  "host",
  "interviewer",
  "illustrator",
  "narrator",
  "organizer",
  "original-author",
  "performer",
  "producer",
  "recipient",
  "reviewed-author",
  "script-writer",
  "series-creator",
  "translator",           // all types authors
  "accessed",             //  date
  "available-date",
  "event-date",
  "issued",
  "original-date",
  "submitted",            //  date
  "abstract",
  "annote",
  "archive",
  "archive_collection",
  "archive_location",
  "archive-place",
  "authority",
  "call-number",
  "chapter-number",
  "citation-number",
  "citation-label",
  "collection-number",
  "collection-title",
  "container-title",
  "container-title-short",
  "dimensions",
  "division",
  "DOI",
  "edition",
  "event",
  "event-title",
  "event-place",
  "first-reference-note-number",
  "genre",
  "ISBN",
  "ISSN",
  "issue",
  "jurisdiction",
  "keyword",
  "locator",
  "medium",
  "note",
  "number",
  "number-of-pages",
  "number-of-volumes",
  "original-publisher",
  "original-publisher-place",
  "original-title",
  "page",
  "page-first",
  "part",
  "part-title",
  "PMCID",
  "PMID",
  "printing",
  "publisher",
  "publisher-place",
  "references",
  "reviewed-genre",
  "reviewed-title",
  "scale",
  "section",
  "source",
  "status",
  "supplement",
  "title",
  "title-short",
  "URL",
  "version",
  "volume",
  "volume-title",
  "volume-title-short",
  "year-suffix",
  "custom"
]

export let jsonSchemaForCSL = {
  "description": "JSON schema for CSL input data",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://resource.citationstyles.org/schema/v1.0/input/json/csl-data.json",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "type": {
        "type": "string",
        "enum": [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "hearing",
          "interview",
          "legal_case",
          "legislation",
          "manuscript",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "report",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      },
      "id": {
        "type": ["string", "number"]
      },
      "citation-key": {
        "type": "string"
      },
      "categories": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "language": {
        "type": "string"
      },
      "journalAbbreviation": {
        "type": "string"
      },
      "shortTitle": {
        "type": "string"
      },
      "author": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "chair": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "collection-editor": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "compiler": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "composer": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "container-author": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "contributor": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "curator": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "director": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "editor": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "editorial-director": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "executive-producer": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "guest": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "host": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "interviewer": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "illustrator": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "narrator": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "organizer": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "original-author": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "performer": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "producer": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "recipient": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "reviewed-author": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "script-writer": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "series-creator": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "translator": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/name-variable"
        }
      },
      "accessed": {
        "$ref": "#/definitions/date-variable"
      },
      "available-date": {
        "$ref": "#/definitions/date-variable"
      },
      "event-date": {
        "$ref": "#/definitions/date-variable"
      },
      "issued": {
        "$ref": "#/definitions/date-variable"
      },
      "original-date": {
        "$ref": "#/definitions/date-variable"
      },
      "submitted": {
        "$ref": "#/definitions/date-variable"
      },
      "abstract": {
        "type": "string"
      },
      "annote": {
        "type": "string"
      },
      "archive": {
        "type": "string"
      },
      "archive_collection": {
        "type": "string"
      },
      "archive_location": {
        "type": "string"
      },
      "archive-place": {
        "type": "string"
      },
      "authority": {
        "type": "string"
      },
      "call-number": {
        "type": "string"
      },
      "chapter-number": {
        "type": ["string", "number"]
      },
      "citation-number": {
        "type": ["string", "number"]
      },
      "citation-label": {
        "type": "string"
      },
      "collection-number": {
        "type": ["string", "number"]
      },
      "collection-title": {
        "type": "string"
      },
      "container-title": {
        "type": "string"
      },
      "container-title-short": {
        "type": "string"
      },
      "dimensions": {
        "type": "string"
      },
      "division": {
        "type": "string"
      },
      "DOI": {
        "type": "string"
      },
      "edition": {
        "type": ["string", "number"]
      },
      "event": {
        "description": "[Deprecated - use 'event-title' instead. Will be removed in 1.1]",
        "type": "string"
      },
      "event-title": {
        "type": "string"
      },
      "event-place": {
        "type": "string"
      },
      "first-reference-note-number": {
        "type": ["string", "number"]
      },
      "genre": {
        "type": "string"
      },
      "ISBN": {
        "type": "string"
      },
      "ISSN": {
        "type": "string"
      },
      "issue": {
        "type": ["string", "number"]
      },
      "jurisdiction": {
        "type": "string"
      },
      "keyword": {
        "type": "string"
      },
      "locator": {
        "type": ["string", "number"]
      },
      "medium": {
        "type": "string"
      },
      "note": {
        "type": "string"
      },
      "number": {
        "type": ["string", "number"]
      },
      "number-of-pages": {
        "type": ["string", "number"]
      },
      "number-of-volumes": {
        "type": ["string", "number"]
      },
      "original-publisher": {
        "type": "string"
      },
      "original-publisher-place": {
        "type": "string"
      },
      "original-title": {
        "type": "string"
      },
      "page": {
        "type": ["string", "number"]
      },
      "page-first": {
        "type": ["string", "number"]
      },
      "part": {
        "type": ["string", "number"]
      },
      "part-title": {
        "type": "string"
      },
      "PMCID": {
        "type": "string"
      },
      "PMID": {
        "type": "string"
      },
      "printing": {
        "type": ["string", "number"]
      },
      "publisher": {
        "type": "string"
      },
      "publisher-place": {
        "type": "string"
      },
      "references": {
        "type": "string"
      },
      "reviewed-genre": {
        "type": "string"
      },
      "reviewed-title": {
        "type": "string"
      },
      "scale": {
        "type": "string"
      },
      "section": {
        "type": "string"
      },
      "source": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "supplement": {
        "type": ["string", "number"]
      },
      "title": {
        "type": "string"
      },
      "title-short": {
        "type": "string"
      },
      "URL": {
        "type": "string"
      },
      "version": {
        "type": "string"
      },
      "volume": {
        "type": ["string", "number"]
      },
      "volume-title": {
        "type": "string"
      },
      "volume-title-short": {
        "type": "string"
      },
      "year-suffix": {
        "type": "string"
      },
      "custom": {
        "title": "Custom key-value pairs.",
        "type": "object",
        "description": "Used to store additional information that does not have a designated CSL JSON field. The custom field is preferred over the note field for storing custom data, particularly for storing key-value pairs, as the note field is used for user annotations in annotated bibliography styles.",
        "examples": [
          {
            "short_id": "xyz",
            "other-ids": ["alternative-id"]
          },
          {
            "metadata-double-checked": true
          }
        ]
      }
    },
    "required": ["type", "id"],
    "additionalProperties": false
  },
  "definitions": {
    "name-variable": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "family": {
              "type": "string"
            },
            "given": {
              "type": "string"
            },
            "dropping-particle": {
              "type": "string"
            },
            "non-dropping-particle": {
              "type": "string"
            },
            "suffix": {
              "type": "string"
            },
            "comma-suffix": {
              "type": ["string", "number", "boolean"]
            },
            "static-ordering": {
              "type": ["string", "number", "boolean"]
            },
            "literal": {
              "type": "string"
            },
            "parse-names": {
              "type": ["string", "number", "boolean"]
            }
          },
          "additionalProperties": false
        }
      ]
    },
    "date-variable": {
      "title": "Date content model.",
      "description": "The CSL input model supports two different date representations: an EDTF string (preferred), and a more structured alternative.",
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "date-parts": {
              "type": "array",
              "items": {
                "type": "array",
                "items": {
                  "type": ["string", "number"]
                },
                "minItems": 1,
                "maxItems": 3
              },
              "minItems": 1,
              "maxItems": 2
            },
            "season": {
              "type": ["string", "number"]
            },
            "circa": {
              "type": ["string", "number", "boolean"]
            },
            "literal": {
              "type": "string"
            },
            "raw": {
              "type": "string"
            }
          },
          "additionalProperties": false
        }
      ]
    }
  }
}

export let lang = `<?xml version="1.0" encoding="utf-8"?>
<locale xmlns="http://purl.org/net/xbiblio/csl" version="1.0" xml:lang="en-US">
  <info>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
    <updated>2012-07-04T23:31:02+00:00</updated>
  </info>
  <style-options punctuation-in-quote="true"
                 leading-noise-words="a,an,the"
                 name-as-sort-order="ja zh kr my hu vi"
                 name-never-short="ja zh kr my hu vi"/>
  <date form="text">
    <date-part name="month" suffix=" "/>
    <date-part name="day" suffix=", "/>
    <date-part name="year"/>
  </date>
  <date form="numeric">
    <date-part name="month" form="numeric-leading-zeros" suffix="/"/>
    <date-part name="day" form="numeric-leading-zeros" suffix="/"/>
    <date-part name="year"/>
  </date>
  <terms>
    <term name="radio-broadcast">radio broadcast</term>
    <term name="television-broadcast">television broadcast</term>
    <term name="podcast">podcast</term>
    <term name="instant-message">instant message</term>
    <term name="email">email</term>
    <term name="number-of-volumes">
      <single>volume</single>
      <multiple>volumes</multiple>
    </term>
    <term name="accessed">accessed</term>
    <term name="and">and</term>
    <term name="and" form="symbol">&amp;</term>
    <term name="and others">and others</term>
    <term name="anonymous">anonymous</term>
    <term name="anonymous" form="short">anon.</term>
    <term name="at">at</term>
    <term name="available at">available at</term>
    <term name="by">by</term>
    <term name="circa">circa</term>
    <term name="circa" form="short">c.</term>
    <term name="cited">cited</term>
    <term name="edition">
      <single>edition</single>
      <multiple>editions</multiple>
    </term>
    <term name="edition" form="short">ed.</term>
    <term name="et-al">et al.</term>
    <term name="forthcoming">forthcoming</term>
    <term name="from">from</term>
    <term name="ibid">ibid.</term>
    <term name="in">in</term>
    <term name="in press">in press</term>
    <term name="internet">internet</term>
    <term name="interview">interview</term>
    <term name="letter">letter</term>
    <term name="no date">no date</term>
    <term name="no date" form="short">n.d.</term>
    <term name="online">online</term>
    <term name="presented at">presented at the</term>
    <term name="reference">
      <single>reference</single>
      <multiple>references</multiple>
    </term>
    <term name="reference" form="short">
      <single>ref.</single>
      <multiple>refs.</multiple>
    </term>
    <term name="retrieved">retrieved</term>
    <term name="scale">scale</term>
    <term name="version">version</term>

    <!-- ANNO DOMINI; BEFORE CHRIST -->
    <term name="ad">AD</term>
    <term name="bc">BC</term>

    <!-- PUNCTUATION -->
    <term name="open-quote">“</term>
    <term name="close-quote">”</term>
    <term name="open-inner-quote">‘</term>
    <term name="close-inner-quote">’</term>
    <term name="page-range-delimiter">–</term>

    <!-- ORDINALS -->
    <term name="ordinal">th</term>
    <term name="ordinal-01">st</term>
    <term name="ordinal-02">nd</term>
    <term name="ordinal-03">rd</term>
    <term name="ordinal-11">th</term>
    <term name="ordinal-12">th</term>
    <term name="ordinal-13">th</term>

    <!-- LONG ORDINALS -->
    <term name="long-ordinal-01">first</term>
    <term name="long-ordinal-02">second</term>
    <term name="long-ordinal-03">third</term>
    <term name="long-ordinal-04">fourth</term>
    <term name="long-ordinal-05">fifth</term>
    <term name="long-ordinal-06">sixth</term>
    <term name="long-ordinal-07">seventh</term>
    <term name="long-ordinal-08">eighth</term>
    <term name="long-ordinal-09">ninth</term>
    <term name="long-ordinal-10">tenth</term>

    <!-- LONG LOCATOR FORMS -->
    <term name="book">
      <single>book</single>
      <multiple>books</multiple>
    </term>
    <term name="chapter">
      <single>chapter</single>
      <multiple>chapters</multiple>
    </term>
    <term name="column">
      <single>column</single>
      <multiple>columns</multiple>
    </term>
    <term name="figure">
      <single>figure</single>
      <multiple>figures</multiple>
    </term>
    <term name="folio">
      <single>folio</single>
      <multiple>folios</multiple>
    </term>
    <term name="issue">
      <single>number</single>
      <multiple>numbers</multiple>
    </term>
    <term name="line">
      <single>line</single>
      <multiple>lines</multiple>
    </term>
    <term name="note">
      <single>note</single>
      <multiple>notes</multiple>
    </term>
    <term name="opus">
      <single>opus</single>
      <multiple>opera</multiple>
    </term>
    <term name="page">
      <single>page</single>
      <multiple>pages</multiple>
    </term>
    <term name="paragraph">
      <single>paragraph</single>
      <multiple>paragraph</multiple>
    </term>
    <term name="part">
      <single>part</single>
      <multiple>parts</multiple>
    </term>
    <term name="section">
      <single>section</single>
      <multiple>sections</multiple>
    </term>
    <term name="sub verbo">
      <single>sub verbo</single>
      <multiple>sub verbis</multiple>
    </term>
    <term name="verse">
      <single>verse</single>
      <multiple>verses</multiple>
    </term>
    <term name="volume">
      <single>volume</single>
      <multiple>volumes</multiple>
    </term>

    <!-- SHORT LOCATOR FORMS -->
    <term name="book" form="short">bk.</term>
    <term name="chapter" form="short">chap.</term>
    <term name="column" form="short">col.</term>
    <term name="figure" form="short">fig.</term>
    <term name="folio" form="short">f.</term>
    <term name="issue" form="short">no.</term>
    <term name="line" form="short">l.</term>
    <term name="note" form="short">n.</term>
    <term name="opus" form="short">op.</term>
    <term name="page" form="short">
      <single>p.</single>
      <multiple>pp.</multiple>
    </term>
    <term name="paragraph" form="short">para.</term>
    <term name="part" form="short">pt.</term>
    <term name="section" form="short">sec.</term>
    <term name="sub verbo" form="short">
      <single>s.v.</single>
      <multiple>s.vv.</multiple>
    </term>
    <term name="verse" form="short">
      <single>v.</single>
      <multiple>vv.</multiple>
    </term>
    <term name="volume" form="short">
      <single>vol.</single>
      <multiple>vols.</multiple>
    </term>

    <!-- SYMBOL LOCATOR FORMS -->
    <term name="paragraph" form="symbol">
      <single>¶</single>
      <multiple>¶¶</multiple>
    </term>
    <term name="section" form="symbol">
      <single>§</single>
      <multiple>§§</multiple>
    </term>

    <!-- LONG ROLE FORMS -->
    <term name="director">
      <single>director</single>
      <multiple>directors</multiple>
    </term>
    <term name="editor">
      <single>editor</single>
      <multiple>editors</multiple>
    </term>
    <term name="editorial-director">
      <single>editor</single>
      <multiple>editors</multiple>
    </term>
    <term name="illustrator">
      <single>illustrator</single>
      <multiple>illustrators</multiple>
    </term>
    <term name="translator">
      <single>translator</single>
      <multiple>translators</multiple>
    </term>
    <term name="editortranslator">
      <single>editor &amp; translator</single>
      <multiple>editors &amp; translators</multiple>
    </term>

    <!-- SHORT ROLE FORMS -->
    <term name="director" form="short">
      <single>dir.</single>
      <multiple>dirs.</multiple>
    </term>
    <term name="editor" form="short">
      <single>ed.</single>
      <multiple>eds.</multiple>
    </term>
    <term name="editorial-director" form="short">
      <single>ed.</single>
      <multiple>eds.</multiple>
    </term>
    <term name="illustrator" form="short">
      <single>ill.</single>
      <multiple>ills.</multiple>
    </term>
    <term name="translator" form="short">
      <single>tran.</single>
      <multiple>trans.</multiple>
    </term>
    <term name="editortranslator" form="short">
      <single>ed. &amp; tran.</single>
      <multiple>eds. &amp; trans.</multiple>
    </term>

    <!-- VERB ROLE FORMS -->
    <term name="director" form="verb">directed by</term>
    <term name="editor" form="verb">edited by</term>
    <term name="editorial-director" form="verb">edited by</term>
    <term name="illustrator" form="verb">illustrated by</term>
    <term name="interviewer" form="verb">interview by</term>
    <term name="recipient" form="verb">to</term>
    <term name="reviewed-author" form="verb">by</term>
    <term name="translator" form="verb">translated by</term>
    <term name="editortranslator" form="verb">edited &amp; translated by</term>

    <!-- SHORT VERB ROLE FORMS -->
    <term name="container-author" form="verb-short">by</term>
    <term name="director" form="verb-short">dir.</term>
    <term name="editor" form="verb-short">ed.</term>
    <term name="editorial-director" form="verb-short">ed.</term>
    <term name="illustrator" form="verb-short">illus.</term>
    <term name="translator" form="verb-short">trans.</term>
    <term name="editortranslator" form="verb-short">ed. &amp; trans.</term>

    <!-- LONG MONTH FORMS -->
    <term name="month-01">January</term>
    <term name="month-02">February</term>
    <term name="month-03">March</term>
    <term name="month-04">April</term>
    <term name="month-05">May</term>
    <term name="month-06">June</term>
    <term name="month-07">July</term>
    <term name="month-08">August</term>
    <term name="month-09">September</term>
    <term name="month-10">October</term>
    <term name="month-11">November</term>
    <term name="month-12">December</term>

    <!-- SHORT MONTH FORMS -->
    <term name="month-01" form="short">Jan.</term>
    <term name="month-02" form="short">Feb.</term>
    <term name="month-03" form="short">Mar.</term>
    <term name="month-04" form="short">Apr.</term>
    <term name="month-05" form="short">May</term>
    <term name="month-06" form="short">Jun.</term>
    <term name="month-07" form="short">Jul.</term>
    <term name="month-08" form="short">Aug.</term>
    <term name="month-09" form="short">Sep.</term>
    <term name="month-10" form="short">Oct.</term>
    <term name="month-11" form="short">Nov.</term>
    <term name="month-12" form="short">Dec.</term>

    <!-- SEASONS -->
    <term name="season-01">Spring</term>
    <term name="season-02">Summer</term>
    <term name="season-03">Autumn</term>
    <term name="season-04">Winter</term>
  </terms>
</locale>
`
