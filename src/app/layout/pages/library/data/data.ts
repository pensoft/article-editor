export interface reference {
  name: string,
  displayName: string,
  type: string,
  formFields: formField[],
}

export interface formField {
  key: string,
  label: string,
  cslKey: string,
  required?: true
}
export let referencesFormFieldsOnly: { [key: string]: formField[] } = {
  'JOURNAL ARTICLE': [
    { cslKey: 'authors', key: 'authors', label: 'Authors' },
    { cslKey: 'year-of-publication', key: 'yearOfPublication', label: 'Year of publication' },
    { cslKey: 'title', key: 'articleTitle', required: true, label: 'Article title' },
    { cslKey: 'container-title', key: 'journalName', required: true, label: 'Journal name' },
    { cslKey: 'volume', key: 'volume', label: 'Volume' },
    { cslKey: 'issued', key: 'issue', label: 'Issue' },
    { cslKey: 'page', key: 'page', label: 'Start page - EndPage' },
    { cslKey: 'language', key: 'publicationLanguage', label: 'Publication Language' },
    { cslKey: 'URL', key: 'url', label: 'URL' },
    { cslKey: 'DOI', key: 'DOI', label: 'DOI' },
  ],
  'BOOK': [
    { cslKey: 'authors', key: 'authors', label: 'Authors' },
    { cslKey: 'year-of-publication', key: 'yearOfPublication', required: true, label: 'Year of publication' },
    { cslKey: 'title', key: 'bookTitle', required: true, label: 'Book title' },
    { cslKey: 'translated-title', key: 'translatedTitle', label: 'Translated title' },
    { cslKey: 'edition', key: 'edition', label: 'Edition' },
    { cslKey: 'volume', key: 'volume', label: 'Volume' },
    { cslKey: 'number-of-pages', key: 'numberOfPages', label: 'Number of pages' },
    { cslKey: 'publisher', key: 'publisher', required: true, label: 'Publisher' },
    { cslKey: 'city', key: 'city', label: 'City' },
    { cslKey: 'language', key: 'publicationLanguage', label: 'ublication language' },
    { cslKey: 'URL', key: 'url', label: 'URL' },
    { cslKey: 'ISBN', key: 'ISBN', label: 'ISBN' },
    { cslKey: 'DOI', key: 'DOI', label: 'DOI' },
  ],
  'BOOK CHAPTER': [
    { cslKey: 'authors', key: 'authors', label: 'Authors' },
    { cslKey: 'year-of-publication', key: 'yearOfPublication', required: true, label: 'Year of publication' },
    { cslKey: 'title', key: 'chapterTitle', required: true, label: 'Chapter title' },
    { cslKey: 'container-title', key: 'bookTitle', required: true, label: 'Book title' },
    { cslKey: 'editor', key: 'editors', label: 'Editors' },
    { cslKey: 'volume', key: 'volume', label: 'Volume' },
    { cslKey: 'publisher', key: 'publisher', label: 'Publisher' },
    { cslKey: 'city', key: 'city', label: 'City' },
    { cslKey: 'number-of-pages', key: 'numberOfPages', label: 'Number of pages' },
    { cslKey: 'language', key: 'publicationLanguage', label: 'Publication language' },
    { cslKey: 'URL', key: 'url', label: 'URL' },
    { cslKey: 'ISBN', key: 'ISBN', label: 'ISBN' },
    { cslKey: 'DOI', key: 'DOI', label: 'DOI' },
  ],
  'CONFERENCE PAPER': [
    { cslKey: 'authors', key: 'authors', label: 'Authors' },
    { cslKey: 'year-of-publication', key: 'yearOfPublication', required: true, label: 'Year of publication' },
    { cslKey: 'title', key: 'title', required: true, label: 'Title' },
    { cslKey: 'editor', key: 'editors', label: 'Editors' },
    { cslKey: 'volume', key: 'volume', label: 'Volume' },
    { cslKey: 'container-title', key: 'bookTitle', required: true, label: 'Book title' },
    { cslKey: 'event-title', key: 'conferenceName', label: 'Conference name' },
    { cslKey: 'event-place', key: 'conferenceLocation', label: 'Conference location' },
    { cslKey: 'event-date', key: 'conferenceDate', label: 'Conference date' },
    { cslKey: 'number-of-pages', key: 'numberOfPages', label: 'Number of pages' },
    { cslKey: 'publisher', key: 'publisher', label: 'Publisher' },
    { cslKey: 'city', key: 'city', label: 'City' },
    { cslKey: 'collection-title', key: 'journalName', label: 'Journal name' },
    { cslKey: 'journal-volume', key: 'journalVolume', label: 'Journal volume' },
    { cslKey: 'language', key: 'publicationLanguage', label: 'Publication language' },
    { cslKey: 'URL', key: 'url', label: 'URL' },
    { cslKey: 'ISBN', key: 'ISBN', label: 'ISBN' },
    { cslKey: 'DOI', key: 'DOI', label: 'DOI' },
  ],
  'CONFERENCE PROCEEDINGS': [
    { cslKey: 'authors', key: 'authors', label: 'Authors' },
    { cslKey: 'year-of-publication', key: 'yearOfPublication', required: true, label: 'Year of publication' },
    { cslKey: 'title', key: 'bookTitle', required: true, label: 'Title' },
    { cslKey: 'volume', key: 'volume', label: 'Volume' },
    { cslKey: 'event-title', key: 'conferenceName', label: 'Conference name' },
    { cslKey: 'event-place', key: 'conferenceLocation', label: 'Conference location' },
    { cslKey: 'event-date', key: 'conferenceDate', label: 'Conference date' },
    { cslKey: 'number-of-pages', key: 'numberOfPages', label: 'Number of pages' },
    { cslKey: 'publisher', key: 'publisher', label: 'Publisher' },
    { cslKey: 'city', key: 'city', label: 'City' },
    { cslKey: 'collection-title', key: 'journalName', label: 'Journal name' },
    { cslKey: 'journal-volume', key: 'journalVolume', label: 'Journal volume' },
    { cslKey: 'language', key: 'publicationLanguage', label: 'Publication language' },
    { cslKey: 'URL', key: 'url', label: 'URL' },
    { cslKey: 'ISBN', key: 'ISBN', label: 'ISBN' },
    { cslKey: 'DOI', key: 'DOI', label: 'DOI' },
  ],
  'THESIS': [
    { cslKey: 'authors', key: 'authors', label: 'Authors' },
    { cslKey: 'institution', key: 'institution', label: 'Institution' },
    //{cslKey:'',key:'addAuthor',label:'Add Author'},
    { cslKey: 'year-of-publication', key: 'yearOfPublication', required: true, label: 'Year of publication' },
    { cslKey: 'title', key: 'bookTitle', required: true, label: 'Book title' },
    { cslKey: 'translated-title', key: 'translatedTitle', label: 'Translated title' },
    { cslKey: 'publisher', key: 'publisher', required: true, label: 'Publisher' },
    { cslKey: 'city', key: 'city', label: 'City' },
    { cslKey: 'number-of-pages', key: 'numberOfPages', label: 'Number of pages' },
    { cslKey: 'language', key: 'publicationLanguage', label: 'Publication language' },
    { cslKey: 'URL', key: 'url', label: 'URL' },
    { cslKey: 'ISBN', key: 'ISBN', label: 'ISBN' },
    { cslKey: 'DOI', key: 'DOI', label: 'DOI' },
  ],
  'SOFTWARE/DATA': [
    { cslKey: 'authors', key: 'authors', label: 'Authors' },
    { cslKey: 'year-of-publication', key: 'yearOfPublication', required: true, label: 'Year of publication' },
    { cslKey: 'title', key: 'title', required: true, label: 'Title' },
    { cslKey: 'version', key: 'version', label: 'Version' },
    { cslKey: 'publisher', key: 'publisher', label: 'Publisher' },
    { cslKey: 'release-date', key: 'releaseDate', label: 'Release date' },
    { cslKey: 'URL', key: 'url', label: 'URL' },
  ],
  'WEBSITE': [
    { cslKey: 'authors', key: 'authors', label: 'Authors' },
    { cslKey: 'year', key: 'year', required: true, label: 'Year' },
    { cslKey: 'URL', key: 'url', required: true, label: 'URL' },
    { cslKey: 'title', key: 'title', label: 'Title' },
    { cslKey: 'access-date', key: 'dateOfAccess', label: 'Date of access' },
  ],
  'OTHER': [
    { cslKey: 'authors', key: 'authors', label: 'Authors' },
    { cslKey: 'year-of-publication', key: 'yearOfPublication', required: true, label: 'Year of publication' },
    { cslKey: 'title', key: 'title', required: true, label: 'Title' },
    { cslKey: 'notes', key: 'notes', label: 'Notes' },
    { cslKey: 'publisher', key: 'publisher', label: 'Publisher' },
    { cslKey: 'URL', key: 'url', label: 'URL' },
    { cslKey: 'DOI', key: 'DOI', label: 'DOI' },
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
          } ,
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
          } ,
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

export let basicStyle = `
<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="in-text" version="1.0" demote-non-dropping-particle="never" page-range-format="expanded">
  <info>
    <title>American Psychological Association 6th edition</title>
    <title-short>APA</title-short>
    <id>http://www.zotero.org/styles/apa</id>
    <link href="http://www.zotero.org/styles/apa" rel="self"/>
    <link href="http://owl.english.purdue.edu/owl/resource/560/01/" rel="documentation"/>
    <author>
      <name>Simon Kornblith</name>
      <email>simon@simonster.com</email>
    </author>
    <author>
      <name> Brenton M. Wiernik</name>
      <email>zotero@wiernik.org</email>
    </author>
    <contributor>
      <name>Bruce D'Arcus</name>
    </contributor>
    <contributor>
      <name>Curtis M. Humphrey</name>
    </contributor>
    <contributor>
      <name>Richard Karnesky</name>
      <email>karnesky+zotero@gmail.com</email>
      <uri>http://arc.nucapt.northwestern.edu/Richard_Karnesky</uri>
    </contributor>
    <contributor>
      <name>Sebastian Karcher</name>
    </contributor>
    <category citation-format="author-date"/>
    <category field="psychology"/>
    <category field="generic-base"/>
    <updated>2016-09-28T13:09:49+00:00</updated>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
  </info>
  <locale xml:lang="en">
    <terms>
      <term name="editortranslator" form="short">
        <single>ed. &amp; trans.</single>
        <multiple>eds. &amp; trans.</multiple>
      </term>
      <term name="translator" form="short">trans.</term>
      <term name="interviewer" form="short">interviewer</term>
      <term name="circa" form="short">ca.</term>
      <term name="collection-editor" form="short">series ed.</term>
    </terms>
  </locale>
  <locale xml:lang="es">
    <terms>
      <term name="from">de</term>
    </terms>
  </locale>
  <macro name="container-contributors-booklike">
    <choose>
      <if variable="container-title">
        <names variable="editor translator" delimiter=", &amp; ">
          <name and="symbol" initialize-with=". " delimiter=", "/>
          <label form="short" prefix=" (" text-case="title" suffix=")"/>
          <substitute>
            <names variable="editorial-director"/>
            <names variable="collection-editor"/>
            <names variable="container-author"/>
          </substitute>
        </names>
      </if>
    </choose>
  </macro>
  <macro name="container-contributors">
    <choose>
      <!-- book is here to catch software with container titles -->
      <if type="book broadcast chapter entry entry-dictionary entry-encyclopedia graphic map personal_communication report speech" match="any">
        <text macro="container-contributors-booklike"/>
      </if>
      <else-if type="paper-conference">
        <choose>
          <if variable="collection-editor container-author editor" match="any">
            <text macro="container-contributors-booklike"/>
          </if>
        </choose>
      </else-if>
    </choose>
  </macro>
  <macro name="secondary-contributors-booklike">
    <group delimiter="; ">
      <choose>
        <if variable="title">
          <names variable="interviewer">
            <name and="symbol" initialize-with=". " delimiter=", "/>
            <label form="short" prefix=", " text-case="title"/>
          </names>
        </if>
      </choose>
      <choose>
        <if variable="container-title" match="none">
          <group delimiter="; ">
            <names variable="container-author">
              <label form="verb-short" suffix=" " text-case="title"/>
              <name and="symbol" initialize-with=". " delimiter=", "/>
            </names>
            <names variable="editor translator" delimiter="; ">
              <name and="symbol" initialize-with=". " delimiter=", "/>
              <label form="short" prefix=", " text-case="title"/>
            </names>
          </group>
        </if>
      </choose>
    </group>
  </macro>
  <macro name="secondary-contributors">
    <choose>
      <!-- book is here to catch software with container titles -->
      <if type="book broadcast chapter entry entry-dictionary entry-encyclopedia graphic map report" match="any">
        <text macro="secondary-contributors-booklike"/>
      </if>
      <else-if type="personal_communication">
        <group delimiter="; ">
          <group delimiter=" ">
            <choose>
              <if variable="genre" match="any">
                <text variable="genre" text-case="capitalize-first"/>
              </if>
              <else>
                <text term="letter" text-case="capitalize-first"/>
              </else>
            </choose>
            <names variable="recipient" delimiter=", ">
              <label form="verb" suffix=" "/>
              <name and="symbol" delimiter=", "/>
            </names>
          </group>
          <text variable="medium" text-case="capitalize-first"/>
          <choose>
            <if variable="container-title" match="none">
              <names variable="editor translator" delimiter="; ">
                <name and="symbol" initialize-with=". " delimiter=", "/>
                <label form="short" prefix=", " text-case="title"/>
              </names>
            </if>
          </choose>
        </group>
      </else-if>
      <else-if type="song">
        <choose>
          <if variable="original-author composer" match="any">
            <group delimiter="; ">
              <!-- Replace prefix with performer label as that becomes available -->
              <names variable="author" prefix="Recorded by ">
                <label form="verb" text-case="title"/>
                <name and="symbol" initialize-with=". " delimiter=", "/>
              </names>
              <names variable="translator">
                <name and="symbol" initialize-with=". " delimiter=", "/>
                <label form="short" prefix=", " text-case="title"/>
              </names>
            </group>
          </if>
        </choose>
      </else-if>
      <else-if type="article-journal article-magazine article-newspaper" match="any">
        <group delimiter="; ">
          <choose>
            <if variable="title">
              <names variable="interviewer" delimiter="; ">
                <name and="symbol" initialize-with=". " delimiter=", "/>
                <label form="short" prefix=", " text-case="title"/>
              </names>
            </if>
          </choose>
          <names variable="translator" delimiter="; ">
            <name and="symbol" initialize-with=". " delimiter=", "/>
            <label form="short" prefix=", " text-case="title"/>
          </names>
        </group>
      </else-if>
      <else-if type="paper-conference">
        <choose>
          <if variable="collection-editor editor" match="any">
            <text macro="secondary-contributors-booklike"/>
          </if>
          <else>
            <group delimiter="; ">
              <choose>
                <if variable="title">
                  <names variable="interviewer" delimiter="; ">
                    <name and="symbol" initialize-with=". " delimiter=", "/>
                    <label form="short" prefix=", " text-case="title"/>
                  </names>
                </if>
              </choose>
              <names variable="translator" delimiter="; ">
                <name and="symbol" initialize-with=". " delimiter=", "/>
                <label form="short" prefix=", " text-case="title"/>
              </names>
            </group>
          </else>
        </choose>
      </else-if>
      <else>
        <group delimiter="; ">
          <choose>
            <if variable="title">
              <names variable="interviewer">
                <name and="symbol" initialize-with=". " delimiter="; "/>
                <label form="short" prefix=", " text-case="title"/>
              </names>
            </if>
          </choose>
          <names variable="editor translator" delimiter="; ">
            <name and="symbol" initialize-with=". " delimiter=", "/>
            <label form="short" prefix=", " text-case="title"/>
          </names>
        </group>
      </else>
    </choose>
  </macro>
  <macro name="author">
    <choose>
      <if type="song">
        <names variable="composer" delimiter=", ">
          <name name-as-sort-order="all" and="symbol" sort-separator=", " initialize-with=". " delimiter=", " delimiter-precedes-last="always"/>
          <substitute>
            <names variable="original-author"/>
            <names variable="author"/>
            <names variable="translator">
              <name name-as-sort-order="all" and="symbol" sort-separator=", " initialize-with=". " delimiter=", " delimiter-precedes-last="always"/>
              <label form="short" prefix=" (" suffix=")" text-case="title"/>
            </names>
            <group delimiter=" ">
              <text macro="title"/>
              <text macro="description"/>
              <text macro="format"/>
            </group>
          </substitute>
        </names>
      </if>
      <else-if type="treaty"/>
      <else>
        <names variable="author" delimiter=", ">
          <name name-as-sort-order="all" and="symbol" sort-separator=", " initialize-with=". " delimiter=", " delimiter-precedes-last="always"/>
          <substitute>
            <names variable="illustrator"/>
            <names variable="composer"/>
            <names variable="director">
              <name name-as-sort-order="all" and="symbol" sort-separator=", " initialize-with=". " delimiter=", " delimiter-precedes-last="always"/>
              <label form="long" prefix=" (" suffix=")" text-case="title"/>
            </names>
            <choose>
              <if variable="container-title">
                <choose>
                  <if type="book entry entry-dictionary entry-encyclopedia">
                    <text macro="title"/>
                  </if>
                  <else>
                    <names variable="translator"/>
                  </else>
                </choose>
                <names variable="translator">
                  <name name-as-sort-order="all" and="symbol" sort-separator=", " initialize-with=". " delimiter=", " delimiter-precedes-last="always"/>
                    <label form="short" prefix=" (" suffix=")" text-case="title"/>
                </names>
              </if>
            </choose>
            <names variable="editor translator" delimiter=", ">
              <name name-as-sort-order="all" and="symbol" sort-separator=", " initialize-with=". " delimiter=", " delimiter-precedes-last="always"/>
                <label form="short" prefix=" (" suffix=")" text-case="title"/>
            </names>
            <names variable="editorial-director">
              <name name-as-sort-order="all" and="symbol" sort-separator=", " initialize-with=". " delimiter=", " delimiter-precedes-last="always"/>
                <label form="short" prefix=" (" suffix=")" text-case="title"/>
            </names>
            <names variable="collection-editor">
              <name name-as-sort-order="all" and="symbol" sort-separator=", " initialize-with=". " delimiter=", " delimiter-precedes-last="always"/>
                <label form="short" prefix=" (" suffix=")" text-case="title"/>
            </names>
            <choose>
              <if type="report">
                <text variable="publisher"/>
              </if>
            </choose>
            <group delimiter=" ">
              <text macro="title"/>
              <text macro="description"/>
              <text macro="format"/>
            </group>
          </substitute>
        </names>
      </else>
    </choose>
  </macro>
  <macro name="author-short">
    <choose>
      <if type="patent" variable="number" match="all">
        <text macro="patent-number"/>
      </if>
      <else-if type="treaty">
        <text variable="title" form="short"/>
      </else-if>
      <else-if type="personal_communication">
        <choose>
          <if variable="archive DOI publisher URL" match="none">
            <group delimiter=", ">
              <names variable="author">
                <name and="symbol" delimiter=", " initialize-with=". "/>
                <substitute>
                  <text variable="title" form="short" quotes="true"/>
                </substitute>
              </names>
              <!-- This should be localized -->
              <text value="personal communication"/>
            </group>
          </if>
          <else>
            <names variable="author" delimiter=", ">
              <name form="short" and="symbol" delimiter=", " initialize-with=". "/>
              <substitute>
                <names variable="editor"/>
                <names variable="translator"/>
                <choose>
                  <if variable="container-title">
                    <text variable="title" form="short" quotes="true"/>
                  </if>
                  <else>
                    <text variable="title" form="short" font-style="italic"/>
                  </else>
                </choose>
                <text macro="format-short" prefix="[" suffix="]"/>
              </substitute>
            </names>
          </else>
        </choose>
      </else-if>
      <else-if type="song">
        <names variable="composer" delimiter=", ">
          <name form="short" and="symbol" delimiter=", " initialize-with=". "/>
          <substitute>
            <names variable="original-author"/>
            <names variable="author"/>
            <names variable="translator"/>
             <choose>
              <if variable="container-title">
                <text variable="title" form="short" quotes="true"/>
              </if>
              <else>
                <text variable="title" form="short" font-style="italic"/>
              </else>
            </choose>
            <text macro="format-short" prefix="[" suffix="]"/>
          </substitute>
        </names>
      </else-if>
      <else>
        <names variable="author" delimiter=", ">
          <name form="short" and="symbol" delimiter=", " initialize-with=". "/>
          <substitute>
            <names variable="illustrator"/>
            <names variable="composer"/>
            <names variable="director"/>
            <choose>
              <if variable="container-title">
                <choose>
                  <if type="book entry entry-dictionary entry-encyclopedia">
                    <text variable="title" form="short" quotes="true"/>
                  </if>
                  <else>
                    <names variable="translator"/>
                  </else>
                </choose>
              </if>
            </choose>
            <names variable="editor"/>
            <names variable="editorial-director"/>
            <names variable="translator"/>
            <choose>
              <if type="report" variable="publisher" match="all">
                <text variable="publisher"/>
              </if>
              <else-if type="legal_case">
                <text variable="title" font-style="italic"/>
              </else-if>
              <else-if type="bill legislation" match="any">
                <text variable="title" form="short"/>
              </else-if>
              <else-if variable="reviewed-author" type="review review-book" match="any">
                <text macro="format-short" prefix="[" suffix="]"/>
              </else-if>
              <else-if type="post post-weblog webpage" variable="container-title" match="any">
                <text variable="title" form="short" quotes="true"/>
              </else-if>
              <else>
                <text variable="title" form="short" font-style="italic"/>
              </else>
            </choose>
            <text macro="format-short" prefix="[" suffix="]"/>
          </substitute>
        </names>
      </else>
    </choose>
  </macro>
  <macro name="patent-number">
    <!-- authority: U.S. ; genre: patent ; number: 123,445 -->
    <group delimiter=" ">
      <text variable="authority"/>
      <choose>
        <if variable="genre">
          <text variable="genre" text-case="capitalize-first"/>
        </if>
        <else>
          <!-- This should be localized -->
          <text value="patent" text-case="capitalize-first"/>
        </else>
      </choose>
      <group delimiter=" ">
        <text term="issue" form="short" text-case="capitalize-first"/>
        <text variable="number"/>
      </group>
    </group>
  </macro>
  <macro name="access">
    <choose>
      <if type="bill legal_case legislation" match="any"/>
      <else-if variable="DOI" match="any">
        <text variable="DOI" prefix="https://doi.org/"/>
      </else-if>
      <else-if variable="URL">
        <group delimiter=" ">
          <text term="retrieved" text-case="capitalize-first"/>
          <choose>
            <if type="post post-weblog webpage" match="any">
              <date variable="accessed" form="text" suffix=","/>
            </if>
          </choose>
          <text term="from"/>
          <choose>
            <if type="report">
              <choose>
                <if variable="author editor translator" match="any">
                  <!-- This should be localized -->
                  <text variable="publisher" suffix=" website:"/>
                </if>
              </choose>
            </if>
            <else-if type="post post-weblog webpage" match="any">
              <!-- This should be localized -->
              <text variable="container-title" suffix=" website:"/>
            </else-if>
          </choose>
          <text variable="URL"/>
        </group>
      </else-if>
      <else-if variable="archive">
        <choose>
          <if type="article article-journal article-magazine article-newspaper dataset paper-conference report speech thesis" match="any">
            <!-- This section is for electronic database locations. Physical archives for these and other item types are called in 'publisher' macro -->
            <choose>
              <if variable="archive-place" match="none">
                <group delimiter=" ">
                  <text term="retrieved" text-case="capitalize-first"/>
                  <text term="from"/>
                  <text variable="archive" suffix="."/>
                  <text variable="archive_location" prefix="(" suffix=")"/>
                </group>
              </if>
              <else>
                <text macro="publisher" suffix="."/>
              </else>
            </choose>
          </if>
          <else>
            <text macro="publisher" suffix="."/>
          </else>
        </choose>
      </else-if>
      <else>
        <text macro="publisher" suffix="."/>
      </else>
    </choose>
  </macro>
  <macro name="title">
    <choose>
      <if type="treaty">
        <group delimiter=", ">
          <text variable="title" text-case="title"/>
          <names variable="author">
            <name initialize-with="." form="short" delimiter="-"/>
          </names>
        </group>
      </if>
      <else-if type="patent" variable="number" match="all">
        <text macro="patent-number" font-style="italic"/>
      </else-if>
      <else-if variable="title">
        <choose>
          <if variable="version" type="book" match="all">
            <!---This is a hack until we have a software type -->
            <text variable="title"/>
          </if>
          <else-if variable="reviewed-author reviewed-title" type="review review-book" match="any">
            <choose>
              <if variable="reviewed-title">
                <choose>
                  <if type="post post-weblog webpage" variable="container-title" match="any">
                    <text variable="title"/>
                  </if>
                  <else>
                    <text variable="title" font-style="italic"/>
                  </else>
                </choose>
              </if>
            </choose>
          </else-if>
          <else-if type="post post-weblog webpage" variable="container-title" match="any">
            <text variable="title"/>
          </else-if>
          <else>
            <text variable="title" font-style="italic"/>
          </else>
        </choose>
      </else-if>
      <else-if variable="interviewer" type="interview" match="any">
        <names variable="interviewer">
          <label form="verb-short" suffix=" " text-case="capitalize-first"/>
          <name and="symbol" initialize-with=". " delimiter=", "/>
        </names>
      </else-if>
    </choose>
  </macro>
  <!-- APA has four descriptive sections following the title: -->
  <!-- (description), [format], container, event -->
  <macro name="description">
    <group prefix="(" suffix=")">
      <choose>
        <!-- book is here to catch software with container titles -->
        <if type="book report" match="any">
          <choose>
            <if variable="container-title">
              <text macro="secondary-contributors"/>
            </if>
            <else>
              <group delimiter="; ">
                <text macro="description-report"/>
                <text macro="secondary-contributors"/>
              </group>
            </else>
          </choose>
        </if>
        <else-if type="thesis">
          <group delimiter="; ">
            <group delimiter=", ">
              <text variable="genre" text-case="capitalize-first"/>
              <choose>
                <!-- In APA journals, the university of a thesis is always cited, even if another locator is given -->
                <if variable="DOI URL archive" match="any">
                  <text variable="publisher"/>
                </if>
              </choose>
            </group>
            <text macro="locators"/>
            <text macro="secondary-contributors"/>
          </group>
        </else-if>
        <else-if type="book interview manuscript motion_picture musical_score pamphlet post-weblog speech webpage" match="any">
          <group delimiter="; ">
            <text macro="locators"/>
            <text macro="secondary-contributors"/>
          </group>
        </else-if>
        <else-if type="song">
          <choose>
            <if variable="container-title" match="none">
              <text macro="locators"/>
            </if>
          </choose>
        </else-if>
        <else-if type="article dataset figure" match="any">
          <choose>
            <if variable="container-title">
              <text macro="secondary-contributors"/>
            </if>
            <else>
              <group delimiter="; ">
                <text macro="locators"/>
                <text macro="secondary-contributors"/>
              </group>
            </else>
          </choose>
        </else-if>
        <else-if type="bill legislation legal_case patent treaty personal_communication" match="none">
          <text macro="secondary-contributors"/>
        </else-if>
      </choose>
    </group>
  </macro>
  <macro name="format">
    <group prefix="[" suffix="]">
      <choose>
        <if variable="reviewed-author reviewed-title" type="review review-book" match="any">
          <group delimiter=", ">
            <choose>
              <if variable="genre">
                <!-- Delimiting by , rather than "of" to avoid incorrect grammar -->
                <group delimiter=", ">
                  <text variable="genre" text-case="capitalize-first"/>
                  <choose>
                    <if variable="reviewed-title">
                      <text variable="reviewed-title" font-style="italic"/>
                    </if>
                    <else>
                      <!-- Assume 'title' is title of reviewed work -->
                      <text variable="title" font-style="italic"/>
                    </else>
                  </choose>
                </group>
              </if>
              <else>
                <!-- This should be localized -->
                <group delimiter=" ">
                  <text value="Review of"/>
                  <choose>
                    <if variable="reviewed-title">
                      <text variable="reviewed-title" font-style="italic"/>
                    </if>
                    <else>
                      <!-- Assume 'title' is title of reviewed work -->
                      <text variable="title" font-style="italic"/>
                    </else>
                  </choose>
                </group>
              </else>
            </choose>
            <names variable="reviewed-author">
              <label form="verb-short" suffix=" "/>
              <name and="symbol" initialize-with=". " delimiter=", "/>
            </names>
          </group>
        </if>
        <else>
          <text macro="format-short"/>
        </else>
      </choose>
    </group>
  </macro>
  <macro name="format-short">
    <choose>
      <if variable="reviewed-author reviewed-title" type="review review-book" match="any">
        <choose>
          <if variable="reviewed-title" match="none">
            <choose>
              <if variable="genre">
                <!-- Delimiting by , rather than "of" to avoid incorrect grammar -->
                <group delimiter=", ">
                  <text variable="genre" text-case="capitalize-first"/>
                  <text variable="title" form="short" font-style="italic"/>
                </group>
              </if>
              <else>
                <!-- This should be localized -->
                <group delimiter=" ">
                  <text value="Review of"/>
                  <text variable="title" form="short" font-style="italic"/>
                </group>
              </else>
            </choose>
          </if>
          <else>
            <text variable="title" form="short" quotes="true"/>
          </else>
        </choose>
      </if>
      <else-if type="speech thesis" match="any">
        <text variable="medium" text-case="capitalize-first"/>
      </else-if>
      <!-- book is here to catch software with container titles -->
      <else-if type="book report" match="any">
        <choose>
          <if variable="container-title" match="none">
            <text macro="format-report"/>
          </if>
        </choose>
      </else-if>
      <else-if type="manuscript pamphlet" match="any">
        <text variable="medium" text-case="capitalize-first"/>
      </else-if>
      <else-if type="personal_communication">
        <text macro="secondary-contributors"/>
      </else-if>
      <else-if type="song">
        <group delimiter="; ">
          <text macro="secondary-contributors"/>
          <choose>
            <if variable="container-title" match="none">
              <group delimiter=", ">
                <text variable="genre" text-case="capitalize-first"/>
                <text variable="medium" text-case="capitalize-first"/>
              </group>
            </if>
          </choose>
        </group>
      </else-if>
      <else-if type="paper-conference">
        <group delimiter=", ">
          <choose>
            <if variable="collection-editor editor issue page volume" match="any">
              <text variable="genre" text-case="capitalize-first"/>
            </if>
          </choose>
          <text variable="medium" text-case="capitalize-first"/>
        </group>
      </else-if>
      <else-if type="bill legislation legal_case patent treaty" match="none">
        <choose>
          <if variable="genre medium" match="any">
            <group delimiter=", ">
              <text variable="genre" text-case="capitalize-first"/>
              <text variable="medium" text-case="capitalize-first"/>
            </group>
          </if>
          <else-if type="dataset">
            <!-- This should be localized -->
            <text value="Data set"/>
          </else-if>
        </choose>
      </else-if>
    </choose>
  </macro>
  <macro name="description-report">
    <choose>
      <if variable="number">
        <group delimiter="; ">
          <group delimiter=" ">
            <text variable="genre" text-case="title"/>
            <!-- Replace with term="number" if that becomes available -->
            <text term="issue" form="short" text-case="capitalize-first"/>
            <text variable="number"/>
          </group>
          <text macro="locators"/>
        </group>
      </if>
      <else>
        <text macro="locators"/>
      </else>
    </choose>
  </macro>
  <macro name="format-report">
    <choose>
      <if variable="number">
        <text variable="medium" text-case="capitalize-first"/>
      </if>
      <else>
        <group delimiter=", ">
          <text variable="genre" text-case="capitalize-first"/>
          <text variable="medium" text-case="capitalize-first"/>
        </group>
      </else>
    </choose>
  </macro>
  <macro name="archive">
    <group delimiter=". ">
      <group delimiter=", ">
        <choose>
          <if type="manuscript">
            <text variable="genre"/>
          </if>
        </choose>
        <group delimiter=" ">
          <!-- Replace "archive" with "archive_collection" as that becomes available -->
          <text variable="archive"/>
          <text variable="archive_location" prefix="(" suffix=")"/>
        </group>
      </group>
      <group delimiter=", ">
        <!-- Move "archive" here when "archive_collection" becomes available -->
        <text variable="archive-place"/>
      </group>
    </group>
  </macro>
  <macro name="publisher">
    <choose>
      <if type="manuscript pamphlet" match="any">
        <choose>
          <if variable="archive archive_location archive-place" match="any">
            <group delimiter=". ">
              <group delimiter=": ">
                <text variable="publisher-place"/>
                <text variable="publisher"/>
              </group>
              <text macro="archive"/>
            </group>
          </if>
          <else>
            <group delimiter=", ">
              <text variable="genre"/>
              <text variable="publisher"/>
              <text variable="publisher-place"/>
            </group>
          </else>
        </choose>
      </if>
      <else-if type="thesis" match="any">
        <group delimiter=". ">
          <group delimiter=", ">
            <text variable="publisher"/>
            <text variable="publisher-place"/>
          </group>
          <text macro="archive"/>
        </group>
      </else-if>
      <else-if type="patent">
        <group delimiter=". ">
          <group delimiter=": ">
            <text variable="publisher-place"/>
            <text variable="publisher"/>
          </group>
          <text macro="archive"/>
        </group>
      </else-if>
      <else-if type="article-journal article-magazine article-newspaper" match="any">
        <text macro="archive"/>
      </else-if>
      <else-if type="post post-weblog webpage" match="none">
        <group delimiter=". ">
          <choose>
            <if variable="event">
              <choose>
                <!-- Only print publisher info if published in a proceedings -->
                <if variable="collection-editor editor issue page volume" match="any">
                  <group delimiter=": ">
                    <text variable="publisher-place"/>
                    <text variable="publisher"/>
                  </group>
                </if>
              </choose>
            </if>
            <else>
              <group delimiter=": ">
                <text variable="publisher-place"/>
                <text variable="publisher"/>
              </group>
            </else>
          </choose>
          <text macro="archive"/>
        </group>
      </else-if>
    </choose>
  </macro>
  <macro name="event">
    <choose>
      <if variable="event" type="speech paper-conference" match="any">
        <choose>
          <!-- Don't print event info if published in a proceedings -->
          <if variable="collection-editor editor issue page volume" match="none">
            <group delimiter=" ">
              <text variable="genre" text-case="capitalize-first"/>
              <group delimiter=" ">
                <choose>
                  <if variable="genre">
                    <text term="presented at"/>
                  </if>
                  <else>
                    <text term="presented at" text-case="capitalize-first"/>
                  </else>
                </choose>
                <group delimiter=", ">
                  <text variable="event"/>
                  <text variable="event-place"/>
                </group>
              </group>
            </group>
          </if>
        </choose>
      </if>
    </choose>
  </macro>
  <macro name="issued">
    <choose>
      <if type="bill legal_case legislation" match="any"/>
      <else-if variable="issued">
        <group>
          <date variable="issued">
            <date-part name="year"/>
          </date>
          <text variable="year-suffix"/>
          <choose>
            <if type="speech">
              <date variable="issued" delimiter=" ">
                <date-part prefix=", " name="month"/>
              </date>
            </if>
            <else-if type="article article-magazine article-newspaper broadcast interview pamphlet personal_communication post post-weblog treaty webpage" match="any">
              <date variable="issued">
                <date-part prefix=", " name="month"/>
                <date-part prefix=" " name="day"/>
              </date>
            </else-if>
            <else-if type="paper-conference">
              <choose>
                <if variable="container-title" match="none">
                  <date variable="issued">
                    <date-part prefix=", " name="month"/>
                    <date-part prefix=" " name="day"/>
                  </date>
                </if>
              </choose>
            </else-if>
            <!-- Only year: article-journal chapter entry entry-dictionary entry-encyclopedia dataset figure graphic motion_picture manuscript map musical_score paper-conference [published] patent report review review-book song thesis -->
          </choose>
        </group>
      </else-if>
      <else-if variable="status">
        <group>
          <text variable="status" text-case="lowercase"/>
          <text variable="year-suffix" prefix="-"/>
        </group>
      </else-if>
      <else>
        <group>
          <text term="no date" form="short"/>
          <text variable="year-suffix" prefix="-"/>
        </group>
      </else>
    </choose>
  </macro>
  <macro name="issued-sort">
    <choose>
      <if type="article article-magazine article-newspaper broadcast interview pamphlet personal_communication post post-weblog speech treaty webpage" match="any">
        <date variable="issued">
          <date-part name="year"/>
          <date-part name="month"/>
          <date-part name="day"/>
        </date>
      </if>
      <else>
        <date variable="issued">
          <date-part name="year"/>
        </date>
      </else>
    </choose>
  </macro>
  <macro name="issued-year">
    <group>
      <choose>
        <if type="personal_communication">
          <choose>
            <if variable="archive DOI publisher URL" match="none">
              <!-- These variables indicate that the letter is retrievable by the reader. If not, then use the APA in-text-only personal communication format -->
              <date variable="issued" form="text"/>
            </if>
            <else>
              <date variable="issued">
                <date-part name="year"/>
              </date>
            </else>
          </choose>
        </if>
        <else>
          <date variable="issued">
            <date-part name="year"/>
          </date>
        </else>
      </choose>
      <text variable="year-suffix"/>
    </group>
  </macro>
  <macro name="issued-citation">
    <choose>
      <if variable="issued">
        <group delimiter="/">
          <choose>
            <if is-uncertain-date="original-date">
              <group prefix="[" suffix="]" delimiter=" ">
                <text term="circa" form="short"/>
                <date variable="original-date">
                  <date-part name="year"/>
                </date>
              </group>
            </if>
            <else>
              <date variable="original-date">
                <date-part name="year"/>
              </date>
            </else>
          </choose>
          <choose>
            <if is-uncertain-date="issued">
              <group prefix="[" suffix="]" delimiter=" ">
                <text term="circa" form="short"/>
                <text macro="issued-year"/>
              </group>
            </if>
            <else>
              <text macro="issued-year"/>
            </else>
          </choose>
        </group>
      </if>
      <else-if variable="status">
        <text variable="status" text-case="lowercase"/>
        <text variable="year-suffix" prefix="-"/>
      </else-if>
      <else>
        <text term="no date" form="short"/>
        <text variable="year-suffix" prefix="-"/>
      </else>
    </choose>
  </macro>
  <macro name="original-date">
    <choose>
      <if type="bill legal_case legislation" match="any"/>
      <else-if type="speech">
        <date variable="original-date" delimiter=" ">
          <date-part name="month"/>
          <date-part name="year"/>
        </date>
      </else-if>
      <else-if type="article article-magazine article-newspaper broadcast interview pamphlet personal_communication post post-weblog treaty webpage" match="any">
        <date variable="original-date" form="text"/>
      </else-if>
      <else>
        <date variable="original-date">
          <date-part name="year"/>
        </date>
      </else>
    </choose>
  </macro>
  <macro name="original-published">
    <!--This should be localized -->
    <choose>
      <if type="bill legal_case legislation" match="any"/>
      <else-if type="interview motion_picture song" match="any">
        <text value="Original work recorded"/>
      </else-if>
      <else-if type="broadcast">
        <text value="Original work broadcast"/>
      </else-if>
      <else>
        <text value="Original work published"/>
      </else>
    </choose>
  </macro>
  <macro name="edition">
    <choose>
      <if is-numeric="edition">
        <group delimiter=" ">
          <number variable="edition" form="ordinal"/>
          <text term="edition" form="short"/>
        </group>
      </if>
      <else>
        <text variable="edition"/>
      </else>
    </choose>
  </macro>
  <macro name="locators">
    <choose>
      <if type="article-journal article-magazine figure review review-book" match="any">
        <group delimiter=", ">
          <group>
            <text variable="volume" font-style="italic"/>
            <text variable="issue" prefix="(" suffix=")"/>
          </group>
          <text variable="page"/>
        </group>
      </if>
      <else-if type="article-newspaper">
        <group delimiter=" ">
          <label variable="page" form="short"/>
          <text variable="page"/>
        </group>
      </else-if>
      <else-if type="paper-conference">
        <choose>
          <if variable="collection-editor editor" match="any">
            <text macro="locators-booklike"/>
          </if>
          <else>
            <group delimiter=", ">
              <group>
                <text variable="volume" font-style="italic"/>
                <text variable="issue" prefix="(" suffix=")"/>
              </group>
              <text variable="page"/>
            </group>
          </else>
        </choose>
      </else-if>
      <else-if type="bill broadcast interview legal_case legislation patent post post-weblog speech treaty webpage" match="none">
        <text macro="locators-booklike"/>
      </else-if>
    </choose>
  </macro>
  <macro name="locators-booklike">
    <group delimiter=", ">
      <text macro="edition"/>
      <group delimiter=" ">
        <text term="version" text-case="capitalize-first"/>
        <text variable="version"/>
      </group>
      <choose>
        <if variable="volume" match="any">
          <choose>
            <if is-numeric="volume" match="none"/>
            <else-if variable="collection-title">
              <choose>
                <if variable="editor translator" match="none">
                  <choose>
                    <if variable="collection-number">
                      <group>
                        <text term="volume" form="short" text-case="capitalize-first" suffix=" "/>
                        <number variable="volume" form="numeric"/>
                      </group>
                    </if>
                  </choose>
                </if>
              </choose>
            </else-if>
            <else>
              <group>
                <text term="volume" form="short" text-case="capitalize-first" suffix=" "/>
                <number variable="volume" form="numeric"/>
              </group>
            </else>
          </choose>
        </if>
        <else>
          <group>
            <text term="volume" form="short" plural="true" text-case="capitalize-first" suffix=" "/>
            <number variable="number-of-volumes" form="numeric" prefix="1&#8211;"/>
          </group>
        </else>
      </choose>
      <group>
        <label variable="page" form="short" suffix=" "/>
        <text variable="page"/>
      </group>
    </group>
  </macro>
  <macro name="citation-locator">
    <group>
      <choose>
        <if locator="chapter">
          <label variable="locator" text-case="capitalize-first"/>
        </if>
        <else>
          <label variable="locator" form="short"/>
        </else>
      </choose>
      <text variable="locator" prefix=" "/>
    </group>
  </macro>
  <macro name="container">
    <choose>
      <if type="article article-journal article-magazine article-newspaper review review-book" match="any">
        <group delimiter=", ">
          <text macro="container-title"/>
          <text macro="locators"/>
        </group>
        <choose>
          <!--for advance online publication-->
          <if variable="issued">
            <choose>
              <if variable="page issue" match="none">
                <text variable="status" text-case="capitalize-first" prefix=". "/>
              </if>
            </choose>
          </if>
        </choose>
      </if>
      <else-if type="article dataset figure" match="any">
        <choose>
          <if variable="container-title">
            <group delimiter=", ">
              <text macro="container-title"/>
              <text macro="locators"/>
            </group>
            <choose>
              <!--for advance online publication-->
              <if variable="issued">
                <choose>
                  <if variable="page issue" match="none">
                    <text variable="status" text-case="capitalize-first" prefix=". "/>
                  </if>
                </choose>
              </if>
            </choose>
          </if>
        </choose>
      </else-if>
      <!-- book is here to catch software with container titles -->
      <else-if type="book" variable="container-title" match="all">
        <group delimiter=" ">
          <text term="in" text-case="capitalize-first" suffix=" "/>
          <group delimiter=", ">
            <text macro="container-contributors"/>
            <group delimiter=" ">
              <text macro="container-title"/>
              <text macro="description-report" prefix="(" suffix=")"/>
              <text macro="format-report" prefix="[" suffix="]"/>
            </group>
          </group>
        </group>
      </else-if>
      <else-if type="report" variable="container-title" match="all">
        <group delimiter=" ">
          <text term="in" text-case="capitalize-first" suffix=" "/>
          <group delimiter=", ">
            <text macro="container-contributors"/>
            <group delimiter=" ">
              <text macro="container-title"/>
              <text macro="description-report" prefix="(" suffix=")"/>
              <text macro="format-report" prefix="[" suffix="]"/>
            </group>
          </group>
        </group>
      </else-if>
      <else-if type="song" variable="container-title" match="all">
        <group delimiter=" ">
          <text term="in" text-case="capitalize-first" suffix=" "/>
          <group delimiter=", ">
            <text macro="container-contributors"/>
            <group delimiter=" ">
              <text macro="container-title"/>
              <text macro="locators" prefix="(" suffix=")"/>
              <group delimiter=", " prefix="[" suffix="]">
                <text variable="genre" text-case="capitalize-first"/>
                <text variable="medium" text-case="capitalize-first"/>
              </group>
            </group>
          </group>
        </group>
      </else-if>
      <else-if type="paper-conference">
        <choose>
          <if variable="editor collection-editor container-author" match="any">
            <text macro="container-booklike"/>
          </if>
          <else>
            <group delimiter=", ">
              <text macro="container-title"/>
              <text macro="locators"/>
            </group>
          </else>
        </choose>
      </else-if>
      <else-if type="book broadcast chapter entry entry-dictionary entry-encyclopedia graphic map speech" match="any">
        <text macro="container-booklike"/>
      </else-if>
      <else-if type="bill legal_case legislation treaty" match="any">
        <text macro="legal-cites"/>
      </else-if>
    </choose>
  </macro>
  <macro name="container-booklike">
    <choose>
      <if variable="container-title collection-title" match="any">
        <group delimiter=" ">
          <text term="in" text-case="capitalize-first"/>
          <group delimiter=", ">
            <text macro="container-contributors"/>
            <choose>
              <if variable="container-author editor translator" match="none">
                <group delimiter=". ">
                  <group delimiter=": ">
                    <text variable="collection-title" font-style="italic" text-case="title"/>
                    <choose>
                      <if variable="collection-title">
                        <group delimiter=" ">
                          <text term="volume" form="short" font-style="italic" text-case="capitalize-first"/>
                          <number variable="collection-number" font-style="italic" form="numeric"/>
                          <choose>
                            <if variable="collection-number" match="none">
                              <number variable="volume" font-style="italic" form="numeric"/>
                            </if>
                          </choose>
                        </group>
                      </if>
                    </choose>
                  </group>
                  <!-- Replace with volume-title as that becomes available -->
                  <group delimiter=": ">
                    <text macro="container-title"/>
                    <choose>
                      <if variable="collection-title" is-numeric="volume" match="none">
                        <group delimiter=" ">
                          <text term="volume" form="short" font-style="italic" text-case="capitalize-first"/>
                          <text variable="volume" font-style="italic"/>
                        </group>
                      </if>
                    </choose>
                  </group>
                </group>
              </if>
              <else>
                <!-- Replace with volume-title as that becomes available -->
                <group delimiter=": ">
                  <text macro="container-title"/>
                  <choose>
                    <if is-numeric="volume" match="none">
                      <group delimiter=" ">
                        <text term="volume" form="short" font-style="italic" text-case="capitalize-first"/>
                        <text variable="volume" font-style="italic"/>
                      </group>
                    </if>
                  </choose>
                </group>
              </else>
            </choose>
          </group>
          <group delimiter="; " prefix="(" suffix=")">
            <text macro="locators"/>
            <names variable="container-author">
              <label form="verb-short" suffix=" " text-case="title"/>
              <name and="symbol" initialize-with=". " delimiter=", "/>
            </names>
          </group>
        </group>
      </if>
    </choose>
  </macro>
  <macro name="container-title">
    <choose>
      <if type="article article-journal article-magazine article-newspaper dataset" match="any">
        <text variable="container-title" font-style="italic" text-case="title"/>
      </if>
      <else-if type="paper-conference speech">
        <choose>
          <if variable="collection-editor container-author editor" match="any">
            <text variable="container-title" font-style="italic"/>
          </if>
          <else>
            <text variable="container-title" font-style="italic" text-case="title"/>
          </else>
        </choose>
      </else-if>
      <else-if type="bill legal_case legislation post-weblog webpage" match="none">
        <text variable="container-title" font-style="italic"/>
      </else-if>
    </choose>
  </macro>
  <macro name="legal-cites">
    <choose>
      <if type="legal_case">
        <group prefix=", " delimiter=" ">
          <group delimiter=" ">
            <choose>
              <if variable="container-title">
                <text variable="volume"/>
                <text variable="container-title"/>
                <group delimiter=" ">
                  <!--change to label variable="section" as that becomes available -->
                  <text term="section" form="symbol"/>
                  <text variable="section"/>
                </group>
                <text variable="page"/>
              </if>
              <else>
                <group delimiter=" ">
                  <choose>
                    <if is-numeric="number">
                      <!-- Replace with term="number" if that becomes available -->
                      <text term="issue" form="short" text-case="capitalize-first"/>
                    </if>
                  </choose>
                  <text variable="number"/>
                </group>
              </else>
            </choose>
          </group>
          <group prefix="(" suffix=")" delimiter=" ">
            <text variable="authority"/>
            <choose>
              <if variable="container-title" match="any">
                <!--Only print year for cases published in reporters-->
                <date variable="issued" form="numeric" date-parts="year"/>
              </if>
              <else>
                <date variable="issued" form="text"/>
              </else>
            </choose>
          </group>
        </group>
      </if>
      <else-if type="bill legislation" match="any">
        <group prefix=", " delimiter=" ">
          <group delimiter=", ">
            <choose>
              <if variable="number">
                <!--There's a public law number-->
                <text variable="number" prefix="Pub. L. No. "/>
                <group delimiter=" ">
                  <!--change to label variable="section" as that becomes available -->
                  <text term="section" form="symbol"/>
                  <text variable="section"/>
                </group>
                <group delimiter=" ">
                  <text variable="volume"/>
                  <text variable="container-title"/>
                  <text variable="page-first"/>
                </group>
              </if>
              <else>
                <group delimiter=" ">
                  <text variable="volume"/>
                  <text variable="container-title"/>
                  <!--change to label variable="section" as that becomes available -->
                  <text term="section" form="symbol"/>
                  <text variable="section"/>
                </group>
              </else>
            </choose>
          </group>
          <date variable="issued" prefix="(" suffix=")">
            <date-part name="year"/>
          </date>
        </group>
      </else-if>
      <else-if type="treaty">
        <group delimiter=" ">
          <number variable="volume"/>
          <text variable="container-title"/>
          <text variable="page"/>
        </group>
      </else-if>
    </choose>
  </macro>
  <citation et-al-min="6" et-al-use-first="1" et-al-subsequent-min="3" et-al-subsequent-use-first="1" disambiguate-add-year-suffix="true" disambiguate-add-names="true" disambiguate-add-givenname="true" collapse="year" givenname-disambiguation-rule="primary-name">
    <sort>
      <key macro="author" names-min="8" names-use-first="6"/>
      <key macro="issued-sort"/>
    </sort>
    <layout prefix="(" suffix=")" delimiter="; ">
      <group delimiter=", ">
        <text macro="author-short"/>
        <text macro="issued-citation"/>
        <text macro="citation-locator"/>
      </group>
    </layout>
  </citation>
  <bibliography hanging-indent="true" et-al-min="8" et-al-use-first="6" et-al-use-last="true" entry-spacing="0" line-spacing="2">
    <sort>
      <key macro="author"/>
      <key macro="issued-sort" sort="ascending"/>
      <key macro="title"/>
    </sort>
    <layout>
      <group suffix=".">
        <group delimiter=". ">
          <text macro="author"/>
          <choose>
            <if is-uncertain-date="issued">
              <group prefix=" [" suffix="]" delimiter=" ">
                <text term="circa" form="short"/>
                <text macro="issued"/>
              </group>
            </if>
            <else>
              <text macro="issued" prefix=" (" suffix=")"/>
            </else>
          </choose>
          <group delimiter=" ">
            <text macro="title"/>
            <choose>
              <if variable="title interviewer" type="interview" match="any">
                <group delimiter=" ">
                  <text macro="description"/>
                  <text macro="format"/>
                </group>
              </if>
              <else>
                <group delimiter=" ">
                  <text macro="format"/>
                  <text macro="description"/>
                </group>
              </else>
            </choose>
          </group>
          <text macro="container"/>
        </group>
        <text macro="event" prefix=". "/>
      </group>
      <text macro="access" prefix=" "/>
      <choose>
        <if is-uncertain-date="original-date">
          <group prefix=" [" suffix="]" delimiter=" ">
            <text macro="original-published"/>
            <text term="circa" form="short"/>
            <text macro="original-date"/>
          </group>
        </if>
        <else-if variable="original-date">
          <group prefix=" (" suffix=")" delimiter=" ">
            <text macro="original-published"/>
            <text macro="original-date"/>
          </group>
        </else-if>
      </choose>
    </layout>
  </bibliography>
</style>`


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
export let pensoftStyle = `<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="in-text" version="1.0" demote-non-dropping-particle="sort-only" default-locale="en-US">
  <info>
    <title>Pensoft Journals</title>
    <id>http://www.zotero.org/styles/pensoft-journals</id>
    <link href="http://www.zotero.org/styles/pensoft-journals" rel="self"/>
    <link href="http://www.zotero.org/styles/zootaxa" rel="template"/>
    <link href="https://zookeys.pensoft.net/about#CitationsandReferences" rel="documentation"/>
    <author>
      <name>Brian Stucky</name>
      <email>stuckyb@colorado.edu</email>
    </author>
    <author>
      <name>Teodor Georgiev</name>
      <email>t.georgiev@pensoft.net</email>
    </author>
    <category citation-format="author-date"/>
    <summary>The Pensoft Journals style</summary>
    <updated>2020-08-21T12:00:00+00:00</updated>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
  </info>
  <locale xml:lang="en-US">
    <date form="text">
      <date-part name="month" suffix=" "/>
      <date-part name="day" suffix=", "/>
      <date-part name="year"/>
    </date>
    <terms>
      <term name="editor" form="short">
        <single>ed.</single>
        <multiple>eds</multiple>
      </term>
    </terms>
  </locale>
  <macro name="editor">
    <names variable="editor" delimiter=", ">
      <name initialize-with="" name-as-sort-order="all" sort-separator=" "/>
      <label form="short" prefix=" (" text-case="capitalize-first" suffix=")"/>
    </names>
  </macro>
  <macro name="anon">
    <text term="anonymous" form="short" text-case="capitalize-first" strip-periods="true"/>
  </macro>
  <macro name="author">
    <names variable="author">
      <name delimiter-precedes-last="never" initialize-with="" name-as-sort-order="all" sort-separator=" "/>
      <et-al font-style="italic"/>
      <label form="short" prefix=" (" text-case="capitalize-first" suffix=")"/>
      <substitute>
        <names variable="editor"/>
        <text macro="anon"/>
      </substitute>
    </names>
  </macro>
  <macro name="author-short">
    <names variable="author">
      <name form="short" delimiter=" " and="text" delimiter-precedes-last="never" initialize-with=". "/>
      <substitute>
        <names variable="editor"/>
        <names variable="translator"/>
        <text macro="anon"/>
      </substitute>
    </names>
  </macro>
  <macro name="authorcount">
    <names variable="author">
      <name form="count"/>
    </names>
  </macro>
  <macro name="access">
    <choose>
      <if type="legal_case" match="none">
        <choose>
          <if variable="DOI">
            <group delimiter=" ">
              <text variable="DOI" prefix="https://doi.org/"/>
            </group>
          </if>
          <else-if variable="URL">
            <group delimiter=" " suffix=".">
              <text variable="URL" prefix="Available from: "/>
              <group prefix="(" suffix=")">
                <date variable="accessed" form="text"/>
              </group>
            </group>
          </else-if>
        </choose>
      </if>
    </choose>
  </macro>
  <macro name="title">
    <text variable="title"/>
  </macro>
  <macro name="legal_case">
    <group prefix=" " delimiter=" ">
      <text variable="volume"/>
      <text variable="container-title"/>
    </group>
    <text variable="authority" prefix=" (" suffix=")"/>
  </macro>
  <macro name="publisher">
    <choose>
      <if type="thesis" match="none">
        <group delimiter=", ">
          <text variable="publisher"/>
          <text variable="publisher-place"/>
        </group>
        <text variable="genre" prefix=". "/>
      </if>
      <else>
        <group delimiter=". ">
          <text variable="genre"/>
          <text variable="publisher"/>
        </group>
      </else>
    </choose>
  </macro>
  <macro name="year-date">
    <choose>
      <if variable="issued">
        <group>
          <date variable="issued">
            <date-part name="year"/>
          </date>
        </group>
      </if>
      <else>
        <text term="no date" form="short"/>
      </else>
    </choose>
  </macro>
  <macro name="edition">
    <choose>
      <if is-numeric="edition">
        <group delimiter=" ">
          <number variable="edition" form="ordinal"/>
          <text term="edition" form="short"/>
        </group>
      </if>
      <else>
        <text variable="edition" suffix="."/>
      </else>
    </choose>
  </macro>
  <macro name="locator">
    <choose>
      <if locator="page">
        <text variable="locator"/>
      </if>
      <else>
        <group delimiter=" ">
          <label variable="locator" form="short"/>
          <text variable="locator"/>
        </group>
      </else>
    </choose>
  </macro>
  <citation name-form="short" et-al-min="3" et-al-use-first="1" disambiguate-add-year-suffix="true" collapse="year">
    <sort>
      <key macro="year-date"/>
      <key macro="author-short"/>
    </sort>
    <layout delimiter=", " prefix="(" suffix=")">
      <group delimiter=", ">
        <group delimiter=" ">
          <text macro="author-short"/>
          <text macro="year-date"/>
        </group>
        <text macro="locator"/>
      </group>
    </layout>
  </citation>
  <bibliography hanging-indent="true">
    <sort>
      <key macro="author" names-min="1" names-use-first="1"/>
      <key macro="authorcount"/>
      <key macro="year-date"/>
      <key variable="title"/>
    </sort>
    <layout suffix=" ">
      <text macro="author" suffix=" "/>
      <date variable="issued" prefix="(" suffix=")">
        <date-part name="year"/>
      </date>
      <choose>
        <if type="book" match="any">
          <text macro="legal_case"/>
          <group prefix=" " delimiter=" ">
            <text macro="title" font-style="normal" suffix="."/>
            <text macro="edition"/>
            <text macro="editor" suffix="."/>
          </group>
          <group prefix=" " suffix="." delimiter=", ">
            <text macro="publisher"/>
            <text variable="number-of-pages" prefix=" " suffix=" pp"/>
          </group>
        </if>
        <else-if type="chapter paper-conference" match="any">
          <text macro="title" prefix=" " suffix="."/>
          <group prefix=" In: " delimiter=" ">
            <text macro="editor" suffix=","/>
            <text variable="container-title" suffix="."/>
            <text variable="collection-title" suffix="."/>
            <group suffix=".">
              <text macro="publisher"/>
              <group delimiter=" " prefix=", " suffix=".">
                <text variable="page"/>
              </group>
            </group>
          </group>
        </else-if>
        <else-if type="bill graphic legal_case legislation manuscript motion_picture report song thesis" match="any">
          <text macro="legal_case"/>
          <group prefix=" " delimiter=" ">
            <text macro="title" suffix="."/>
            <text macro="edition"/>
            <text macro="editor" suffix="."/>
          </group>
          <group prefix=" " delimiter=", ">
            <text macro="publisher"/>
            <text variable="page" prefix=" " suffix="pp."/>
          </group>
        </else-if>
        <else>
          <group prefix=" " delimiter=". " suffix=".">
            <text macro="title"/>
            <text macro="editor"/>
          </group>
          <group prefix=" " suffix=".">
            <text variable="container-title"/>
            <group prefix=" ">
              <text variable="volume"/>
            </group>
            <text variable="page" prefix=": " suffix="."/>
          </group>
        </else>
      </choose>
      <text macro="access" prefix=" "/>
    </layout>
  </bibliography>
</style>
`
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
