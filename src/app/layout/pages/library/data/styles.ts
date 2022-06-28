
export let harvardstyle = `<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="in-text" version="1.0" demote-non-dropping-particle="sort-only" default-locale="en-GB">
<info>

    <title>Cite Them Right 11th edition - Harvard</title>
    <id>http://www.zotero.org/styles/harvard-cite-them-right</id>
    <link href="http://www.zotero.org/styles/harvard-cite-them-right" rel="self"/>
    <link href="http://www.zotero.org/styles/harvard-cite-them-right-10th-edition" rel="template"/>
    <link href="http://www.citethemrightonline.com/" rel="documentation"/>
    <author>
      <name>Patrick O'Brien</name>
    </author>
    <category citation-format="author-date"/>
    <category field="generic-base"/>
    <summary>Harvard according to Cite Them Right, 11th edition.</summary>
    <updated>2021-09-01T07:43:59+00:00</updated>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
  </info>
  <locale xml:lang="en-GB">
    <terms>
      <term name="editor" form="short">
        <single>ed.</single>
        <multiple>eds</multiple>
      </term>
      <term name="editortranslator" form="verb">edited and translated by</term>
      <term name="edition" form="short">edn.</term>
    </terms>
  </locale>
  <macro name="editor">
    <choose>
      <if type="chapter paper-conference" match="any">
        <names variable="container-author" delimiter=", " suffix=", ">
          <name and="text" initialize-with=". " delimiter=", " sort-separator=", " name-as-sort-order="all"/>
        </names>
        <choose>
          <if variable="container-author" match="none">
            <names variable="editor translator" delimiter=", ">
              <name and="text" initialize-with="." name-as-sort-order="all"/>
              <label form="short" prefix=" (" suffix=")"/>
            </names>
          </if>
        </choose>
      </if>
    </choose>
  </macro>
  <macro name="secondary-contributors">
    <choose>
      <if type="chapter paper-conference" match="none">
        <names variable="editor translator" delimiter=". ">
          <label form="verb" text-case="capitalize-first" suffix=" "/>
          <name and="text" initialize-with="."/>
        </names>
      </if>
      <else-if variable="container-author" match="any">
        <names variable="editor translator" delimiter=". ">
          <label form="verb" text-case="capitalize-first" suffix=" "/>
          <name and="text" initialize-with=". " delimiter=", "/>
        </names>
      </else-if>
    </choose>
  </macro>
  <macro name="author">
    <names variable="author">
      <name and="text" delimiter-precedes-last="never" initialize-with="." name-as-sort-order="all"/>
      <label form="short" prefix=" (" suffix=")"/>
      <et-al font-style="italic"/>
      <substitute>
        <names variable="editor"/>
        <names variable="translator"/>
        <choose>
          <if type="article-newspaper article-magazine" match="any">
            <text variable="container-title" text-case="title" font-style="italic"/>
          </if>
          <else>
            <text macro="title"/>
          </else>
        </choose>
      </substitute>
    </names>
  </macro>
  <macro name="author-short">
    <names variable="author">
      <name form="short" and="text" delimiter=", " delimiter-precedes-last="never" initialize-with=". "/>
      <et-al font-style="italic"/>
      <substitute>
        <names variable="editor"/>
        <names variable="translator"/>
        <choose>
          <if type="article-newspaper article-magazine" match="any">
            <text variable="container-title" text-case="title" font-style="italic"/>
          </if>
          <else>
            <text macro="title"/>
          </else>
        </choose>
      </substitute>
    </names>
  </macro>
  <macro name="access">
    <choose>
      <if variable="DOI">
        <text variable="DOI" prefix="doi:"/>
      </if>
      <else-if variable="URL">
        <text term="available at" suffix=": " text-case="capitalize-first"/>
        <text variable="URL"/>
        <group prefix=" (" delimiter=": " suffix=")">
          <text term="accessed" text-case="capitalize-first"/>
          <date form="text" variable="accessed">
            <date-part name="day"/>
            <date-part name="month"/>
            <date-part name="year"/>
          </date>
        </group>
      </else-if>
    </choose>
  </macro>
  <macro name="number-volumes">
    <choose>
      <if variable="volume" match="none">
        <group delimiter=" " prefix="(" suffix=")">
          <text variable="number-of-volumes"/>
          <label variable="volume" form="short" strip-periods="true"/>
        </group>
      </if>
    </choose>
  </macro>
  <macro name="title">
    <choose>
      <if type="bill book legal_case legislation motion_picture report song thesis webpage graphic" match="any">
        <group delimiter=". ">
          <group delimiter=" ">
            <group delimiter=" ">
              <text variable="title" font-style="italic"/>
              <text variable="medium" prefix="[" suffix="]"/>
            </group>
            <text macro="number-volumes"/>
          </group>
          <text macro="edition"/>
        </group>
      </if>
      <else>
        <text variable="title" form="long" quotes="true"/>
      </else>
    </choose>
  </macro>
  <macro name="publisher">
    <choose>
      <if type="thesis">
        <group delimiter=". ">
          <text variable="genre"/>
          <text variable="publisher"/>
        </group>
      </if>
      <else-if type="report">
        <group delimiter=". ">
          <group delimiter=" ">
            <text variable="genre"/>
            <text variable="number"/>
          </group>
          <group delimiter=": ">
            <text variable="publisher-place"/>
            <text variable="publisher"/>
          </group>
        </group>
      </else-if>
      <else-if type="article-journal article-newspaper article-magazine" match="none">
        <group delimiter=" ">
          <group delimiter=", ">
            <choose>
              <if type="speech" variable="event" match="any">
                <text variable="event" font-style="italic"/>
              </if>
            </choose>
            <group delimiter=": ">
              <text variable="publisher-place"/>
              <text variable="publisher"/>
            </group>
          </group>
          <group prefix="(" suffix=")" delimiter=", ">
            <text variable="collection-title"/>
            <text variable="collection-number"/>
          </group>
        </group>
      </else-if>
    </choose>
  </macro>
  <macro name="year-date">
    <choose>
      <if variable="issued">
        <date variable="issued">
          <date-part name="year"/>
        </date>
        <text variable="year-suffix"/>
      </if>
      <else>
        <text term="no date"/>
        <text variable="year-suffix" prefix=" "/>
      </else>
    </choose>
  </macro>
  <macro name="locator">
    <choose>
      <if type="article-journal">
        <text variable="volume"/>
        <text variable="issue" prefix="(" suffix=")"/>
      </if>
    </choose>
  </macro>
  <macro name="published-date">
    <choose>
      <if type="article-newspaper article-magazine post-weblog speech" match="any">
        <date variable="issued">
          <date-part name="day" suffix=" "/>
          <date-part name="month" form="long"/>
        </date>
      </if>
    </choose>
  </macro>
  <macro name="pages">
    <choose>
      <if type="chapter paper-conference article-journal article article-magazine article-newspaper book review review-book report" match="any">
        <group delimiter=" ">
          <label variable="page" form="short"/>
          <text variable="page"/>
        </group>
      </if>
    </choose>
  </macro>
  <macro name="container-title">
    <choose>
      <if variable="container-title">
        <group delimiter=". ">
          <group delimiter=" ">
            <text variable="container-title" font-style="italic"/>
            <choose>
              <if type="article article-journal" match="any">
                <choose>
                  <if match="none" variable="page volume">
                    <text value="Preprint" prefix="[" suffix="]"/>
                  </if>
                </choose>
              </if>
            </choose>
          </group>
          <text macro="edition"/>
        </group>
      </if>
    </choose>
  </macro>
  <macro name="edition">
    <choose>
      <if is-numeric="edition">
        <group delimiter=" ">
          <number variable="edition" form="ordinal"/>
          <text term="edition" form="short" strip-periods="true"/>
        </group>
      </if>
      <else>
        <text variable="edition"/>
      </else>
    </choose>
  </macro>
  <macro name="container-prefix">
    <choose>
      <if type="chapter paper-conference" match="any">
        <text term="in"/>
      </if>
    </choose>
  </macro>
  <citation et-al-min="4" et-al-use-first="1" disambiguate-add-year-suffix="true" disambiguate-add-names="true" disambiguate-add-givenname="true" collapse="year">
    <sort>
      <key macro="year-date"/>
    </sort>
    <layout prefix="(" suffix=")" delimiter="; ">
      <group delimiter=", ">
        <group delimiter=", ">
          <text macro="author-short"/>
          <text macro="year-date"/>
        </group>
        <group>
          <label variable="locator" form="short" suffix=" "/>
          <text variable="locator"/>
        </group>
      </group>
    </layout>
  </citation>
  <bibliography and="text" et-al-min="4" et-al-use-first="1">
    <sort>
      <key macro="author"/>
      <key macro="year-date"/>
      <key variable="title"/>
    </sort>
    <layout suffix=".">
      <group delimiter=". ">
        <group delimiter=" ">
          <text macro="author"/>
          <text macro="year-date" prefix="(" suffix=")"/>
          <group delimiter=", ">
            <text macro="title"/>
            <group delimiter=" ">
              <text macro="container-prefix"/>
              <text macro="editor"/>
              <text macro="container-title"/>
            </group>
          </group>
        </group>
        <text macro="secondary-contributors"/>
        <text macro="publisher"/>
      </group>
      <group delimiter=", " prefix=", ">
        <text macro="locator"/>
        <text macro="published-date"/>
        <text macro="pages"/>
      </group>
      <text macro="access" prefix=". "/>
    </layout>
  </bibliography>
</style>`
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
export let octaAmazonica = `<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="in-text" version="1.0" demote-non-dropping-particle="sort-only" page-range-format="expanded" default-locale="en-US">
  <info>
    <title>Acta Amazonica</title>
    <title-short>AA</title-short>
    <id>http://www.zotero.org/styles/acta-amazonica</id>
    <link href="http://www.zotero.org/styles/acta-amazonica" rel="self"/>
    <link href="http://www.zotero.org/styles/palaeontology" rel="template"/>
    <link href="https://acta.inpa.gov.br/guia_ingles.php" rel="documentation"/>
    <author>
      <name>Rodrigo P. Verçosa</name>
      <email>acta@inpa.gov.br</email>
    </author>
    <category citation-format="author-date"/>
    <category field="botany"/>
    <category field="anthropology"/>
    <category field="zoology"/>
    <category field="geology"/>
    <category field="geography"/>
    <category field="chemistry"/>
    <category field="biology"/>
    <issn>0044-5967</issn>
    <eissn>1809-4392</eissn>
    <updated>2018-01-22T15:08:52+00:00</updated>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
  </info>
  <macro name="author">
    <names variable="author" font-variant="normal" suffix=".">
      <name font-variant="normal" vertical-align="baseline" delimiter="; " delimiter-precedes-last="never" initialize-with="." name-as-sort-order="all"/>
    </names>
    <choose>
      <if match="none" variable="author">
        <text macro="author-editor"/>
      </if>
    </choose>
  </macro>
  <macro name="editor">
    <names variable="editor">
      <name sort-separator=", " initialize-with="." name-as-sort-order="all" delimiter="; " delimiter-precedes-last="never"/>
      <label form="short" text-case="capitalize-first" prefix=" (" suffix=".)"/>
    </names>
  </macro>
  <macro name="author-short">
    <names variable="author">
      <name form="short" and="text" delimiter="; " delimiter-precedes-last="never" initialize-with=". "/>
      <substitute>
        <names variable="editor"/>
        <names variable="translator"/>
      </substitute>
    </names>
  </macro>
  <macro name="author-count">
    <names variable="author">
      <name form="count"/>
      <substitute>
        <names variable="editor"/>
      </substitute>
    </names>
  </macro>
  <macro name="year-date">
    <choose>
      <if variable="issued">
        <date variable="issued">
          <date-part name="year"/>
        </date>
      </if>
      <else-if type="book chapter webpage" variable="container-title volume page" match="none">
        <text term="forthcoming"/>
      </else-if>
      <else-if type="book chapter webpage" variable="volume page" match="none">
        <text term="in press"/>
      </else-if>
      <else>
        <text term="no date" form="short"/>
      </else>
    </choose>
  </macro>
  <macro name="publisher">
    <group delimiter=", ">
      <text variable="publisher"/>
      <text variable="publisher-place"/>
    </group>
  </macro>
  <macro name="author-editor">
    <names variable="editor">
      <name delimiter="; " delimiter-precedes-last="never" initialize-with="." name-as-sort-order="all"/>
    </names>
  </macro>
  <macro name="edition">
    <choose>
      <if match="any" variable="edition">
        <number variable="edition" form="ordinal"/>
        <text term="edition" form="short" prefix=" "/>
      </if>
    </choose>
  </macro>
  <citation et-al-min="3" et-al-use-first="1" disambiguate-add-year-suffix="true" collapse="year-suffix" year-suffix-delimiter=", ">
    <sort>
      <key macro="year-date"/>
      <key macro="author-short"/>
    </sort>
    <layout delimiter=", " prefix="(" suffix=")">
      <group delimiter=" ">
        <text macro="author-short"/>
        <text macro="year-date"/>
      </group>
      <text variable="locator"/>
      <text variable="year-suffix" font-style="italic"/>
    </layout>
  </citation>
  <bibliography et-al-min="7" et-al-use-first="6" entry-spacing="0" hanging-indent="true">
    <sort>
      <key macro="author" names-min="1" names-use-first="1"/>
      <key macro="author-count"/>
      <key macro="year-date"/>
    </sort>
    <layout suffix=".">
      <group>
        <text macro="author" suffix=" "/>
        <choose>
          <if variable="issued">
            <date variable="issued">
              <date-part name="year"/>
            </date>
          </if>
          <else-if type="book chapter webpage" variable="container-title volume page" match="none">
            <text term="forthcoming" text-case="capitalize-first"/>
          </else-if>
          <else-if type="book chapter webpage" variable="volume page" match="none">
            <text term="in press" text-case="capitalize-first"/>
          </else-if>
        </choose>
        <text variable="year-suffix"/>
        <text value=". "/>
        <choose>
          <if type="bill book graphic legal_case motion_picture report song" match="any">
            <group suffix=".">
              <group>
                <text variable="title" font-style="italic" text-case="capitalize-first" suffix=". "/>
                <choose>
                  <if variable="editor collection-title" match="any">
                    <text value="In" font-style="normal" suffix=": "/>
                  </if>
                </choose>
                <text macro="editor" suffix=" "/>
                <group>
                  <text variable="collection-title" font-style="italic" text-case="title" suffix=". "/>
                  <choose>
                    <if is-numeric="volume">
                      <group delimiter=" ">
                        <text value="Vol. "/>
                        <number variable="volume" suffix="."/>
                      </group>
                    </if>
                    <else>
                      <text variable="volume" suffix="."/>
                    </else>
                  </choose>
                </group>
                <text macro="edition"/>
              </group>
              <text prefix=" " suffix=", " macro="publisher"/>
              <choose>
                <if match="any" variable="number-of-pages">
                  <text variable="number-of-pages" suffix="p"/>
                </if>
              </choose>
              <choose>
                <if match="any" variable="page">
                  <text variable="page" suffix="p"/>
                </if>
              </choose>
            </group>
          </if>
          <else-if type="thesis" match="any">
            <text variable="title" font-style="italic" suffix=". "/>
            <group delimiter=", ">
              <text variable="genre"/>
              <text macro="publisher"/>
              <choose>
                <if match="any" variable="number-of-pages">
                  <text variable="number-of-pages" suffix="p"/>
                </if>
              </choose>
              <choose>
                <if match="any" variable="page">
                  <text variable="page" suffix="p"/>
                </if>
              </choose>
              <choose>
                <if match="any" variable="URL">
                  <text variable="URL" prefix=" (" suffix=")"/>
                </if>
              </choose>
            </group>
          </else-if>
          <else-if type="chapter" match="any">
            <text variable="title" suffix=". "/>
            <text variable="issue" suffix=". "/>
            <group>
              <text value="In" font-style="normal" suffix=": "/>
              <text macro="editor" suffix=", "/>
              <group>
                <text variable="container-title" text-case="title" font-style="italic" suffix=", "/>
                <choose>
                  <if is-numeric="volume">
                    <group delimiter=" ">
                      <text value="Vol. "/>
                      <number variable="volume" suffix=", "/>
                    </group>
                  </if>
                  <else>
                    <text variable="volume" suffix=". "/>
                  </else>
                </choose>
              </group>
              <text macro="edition"/>
              <group delimiter=" ">
                <text macro="publisher" suffix=","/>
                <text variable="page" prefix="p."/>
              </group>
            </group>
          </else-if>
          <else-if type="webpage" match="any">
            <group>
              <text variable="title" font-style="italic" suffix=". "/>
              <text variable="container-title" form="long" suffix=". "/>
              <text variable="URL" prefix="(" suffix="). "/>
              <date variable="accessed" prefix="Accessed on ">
                <date-part name="day" form="numeric-leading-zeros" suffix=" "/>
                <date-part name="month" form="short" suffix=" "/>
                <date-part name="year" suffix="."/>
              </date>
            </group>
          </else-if>
          <else>
            <text variable="title" suffix=". "/>
            <group delimiter=", ">
              <group>
                <text variable="container-title" form="long" font-style="italic" text-case="capitalize-first"/>
                <text variable="volume" prefix=" "/>
                <text variable="page" prefix=": "/>
              </group>
            </group>
          </else>
        </choose>
      </group>
    </layout>
  </bibliography>
</style>`
export let iosPressBooks = `<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="in-text" version="1.0" demote-non-dropping-particle="sort-only" default-locale="en-US">
  <info>
    <title>IOS Press (books)</title>
    <id>http://www.zotero.org/styles/ios-press-books</id>
    <link href="http://www.zotero.org/styles/ios-press-books" rel="self"/>
    <link href="http://www.zotero.org/styles/elsevier-with-titles" rel="template"/>
    <link href="http://www.iospress.nl/service/authors/" rel="documentation"/>
    <contributor>
      <name>Michel Oleynik</name>
      <uri>http://www.mendeley.com/profiles/michel-oleynik/</uri>
    </contributor>
    <category citation-format="numeric"/>
    <category field="generic-base"/>
    <summary>Book style for IOS Press, based on "Elsevier (numeric, with titles)"</summary>
    <updated>2017-01-17T15:55:33+00:00</updated>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
  </info>
  <macro name="author">
    <names variable="author">
      <name initialize-with="." delimiter=", " delimiter-precedes-last="always"/>
      <label form="short" prefix=", "/>
      <substitute>
        <names variable="editor"/>
        <names variable="translator"/>
      </substitute>
    </names>
  </macro>
  <macro name="editor">
    <names variable="editor">
      <name initialize-with="." delimiter=", " delimiter-precedes-last="always"/>
      <label form="short" prefix=" (" text-case="capitalize-first" suffix=")"/>
    </names>
  </macro>
  <macro name="year-date">
    <choose>
      <if variable="issued">
        <date variable="issued">
          <date-part name="year"/>
        </date>
      </if>
      <else>
        <text term="no date" form="short"/>
      </else>
    </choose>
  </macro>
  <macro name="publisher">
    <text variable="publisher" suffix=", "/>
    <text variable="publisher-place" suffix=", "/>
    <text macro="year-date"/>
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
  <macro name="access">
    <choose>
      <if variable="URL">
        <text variable="URL"/>
        <group prefix=" (" suffix=")" delimiter=" ">
          <text term="accessed"/>
          <date variable="accessed" form="text"/>
        </group>
      </if>
    </choose>
  </macro>
  <citation collapse="citation-number">
    <sort>
      <key variable="citation-number"/>
    </sort>
    <layout prefix="[" suffix="]" delimiter=",">
      <text variable="citation-number"/>
    </layout>
  </citation>
  <bibliography and="text" second-field-align="flush" entry-spacing="0">
    <layout suffix=".">
      <text variable="citation-number" prefix="[" suffix="]"/>
      <text macro="author" suffix=", "/>
      <choose>
        <if type="bill book graphic legal_case legislation motion_picture report song" match="any">
          <group delimiter=", ">
            <text variable="title"/>
            <text macro="edition"/>
            <text macro="publisher"/>
          </group>
        </if>
        <else-if type="chapter paper-conference" match="any">
          <text variable="title" suffix=", "/>
          <text term="in" suffix=": "/>
          <text macro="editor" suffix=", "/>
          <text variable="container-title" form="short" text-case="title" suffix=", "/>
          <text macro="edition" suffix=", "/>
          <text macro="publisher"/>
          <group delimiter=" ">
            <label variable="page" form="short" prefix=": "/>
            <text variable="page"/>
          </group>
        </else-if>
        <else-if type="patent">
          <group delimiter=", ">
            <text variable="title"/>
            <text variable="number"/>
            <text macro="year-date"/>
          </group>
        </else-if>
        <else-if type="thesis">
          <group delimiter=", ">
            <text variable="title"/>
            <text variable="genre"/>
            <text variable="publisher"/>
            <text macro="year-date"/>
          </group>
        </else-if>
        <else>
          <group delimiter=" ">
            <text variable="title" suffix=","/>
            <text variable="container-title" form="short" text-case="title" font-style="italic" suffix="."/>
            <text variable="volume" font-weight="bold"/>
            <text macro="year-date" prefix="(" suffix=")"/>
            <text variable="page" form="short"/>
          </group>
        </else>
      </choose>
      <choose>
        <if variable="DOI">
          <text variable="DOI" prefix=". doi:"/>
        </if>
        <else>
          <text macro="access" prefix=". "/>
        </else>
      </choose>
    </layout>
  </bibliography>
</style>`
export let universityOfZabol = `<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="in-text" version="1.0" and="text" delimiter-precedes-et-al="never" delimiter-precedes-last="never" page-range-format="expanded" demote-non-dropping-particle="sort-only" default-locale="en-US">
  <info>
    <title>University of Zabol (English)</title>
    <title-short>UOZ</title-short>
    <id>http://www.zotero.org/styles/university-of-zabol</id>
    <link href="http://www.zotero.org/styles/university-of-zabol" rel="self"/>
    <link href="http://uoz.ac.ir/_DouranPortal/Documents/%D8%AA%D9%86%D8%B8%DB%8C%D9%85%20%D9%85%D8%B7%D8%A7%D9%84%D8%A8%20%D9%BE%D8%A7%DB%8C%D8%A7%D9%86%20%D9%86%D8%A7%D9%85%D9%87_20101003_204948.doc" rel="documentation"/>
    <author>
      <name>Hamed Heydari</name>
      <email>hamedheydari@live.com</email>
      <uri>http://www.mendeley.com/profiles/hamed-heydari5/</uri>
    </author>
    <category citation-format="author-date"/>
    <category field="medicine"/>
    <category field="biology"/>
    <summary>University of Zabol</summary>
    <updated>2017-06-21T09:39:28+00:00</updated>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
  </info>
  <macro name="translator-author-editor">
    <names variable="translator" font-weight="bold">
      <name and="text" delimiter-precedes-et-al="never" delimiter-precedes-last="never" et-al-min="6" et-al-subsequent-min="3" et-al-subsequent-use-first="1" initialize-with="." name-as-sort-order="all"/>
      <substitute>
        <names variable="author" font-weight="bold">
          <name and="text" delimiter-precedes-et-al="never" delimiter-precedes-last="never" et-al-min="6" et-al-subsequent-min="3" et-al-subsequent-use-first="1" initialize-with="." name-as-sort-order="all"/>
          <substitute>
            <text macro="editor"/>
          </substitute>
        </names>
      </substitute>
    </names>
  </macro>
  <macro name="translator-author-editor-short">
    <names variable="translator" font-weight="normal">
      <name form="short" and="text" delimiter-precedes-et-al="never" delimiter-precedes-last="never" et-al-min="3"/>
      <substitute>
        <names variable="author">
          <name form="short" and="text" delimiter-precedes-et-al="never" delimiter-precedes-last="never" et-al-min="3"/>
          <substitute>
            <names variable="editor">
              <name form="short" and="text" delimiter-precedes-et-al="never" delimiter-precedes-last="never" et-al-min="3"/>
            </names>
          </substitute>
        </names>
      </substitute>
    </names>
  </macro>
  <macro name="translator-short">
    <names variable="translator">
      <name form="short" and="text" delimiter-precedes-et-al="never" delimiter-precedes-last="never" et-al-min="3"/>
    </names>
  </macro>
  <macro name="author-short">
    <names variable="author">
      <name form="short" and="text" delimiter-precedes-et-al="never" delimiter-precedes-last="never" et-al-min="3"/>
    </names>
  </macro>
  <macro name="editor-short">
    <names variable="editor">
      <name form="short" and="text" delimiter-precedes-et-al="never" delimiter-precedes-last="never" et-al-min="3"/>
    </names>
  </macro>
  <macro name="editor">
    <names variable="editor" font-weight="bold">
      <name and="text" delimiter-precedes-et-al="always" delimiter-precedes-last="never" et-al-min="6" et-al-subsequent-min="3" et-al-subsequent-use-first="1" initialize-with="." name-as-sort-order="all"/>
      <label form="short" prefix=" (" suffix=")"/>
    </names>
  </macro>
  <macro name="issued">
    <group delimiter="&#8211;">
      <date variable="issued">
        <date-part name="year"/>
      </date>
      <text variable="year-suffix" form="short"/>
    </group>
    <choose>
      <if match="none" variable="issued">
        <text term="no date" text-case="capitalize-all"/>
      </if>
    </choose>
  </macro>
  <macro name="title">
    <group delimiter=" ">
      <text variable="title" text-case="capitalize-first" font-style="normal" font-variant="normal"/>
      <choose>
        <if match="all" variable="translator">
          <text value="translate" text-case="capitalize-first" prefix="(" suffix=")"/>
        </if>
      </choose>
    </group>
  </macro>
  <macro name="title-book">
    <group delimiter=" ">
      <text variable="title" text-case="title" font-style="italic" font-variant="normal" font-weight="normal" text-decoration="none"/>
      <choose>
        <if match="all" variable="translator">
          <text value="translate" text-case="capitalize-first" prefix="(" suffix=")"/>
        </if>
      </choose>
    </group>
  </macro>
  <macro name="volume">
    <label text-case="capitalize-first" suffix=" " variable="volume"/>
    <number variable="volume"/>
  </macro>
  <macro name="edition">
    <number variable="edition" form="ordinal"/>
    <label text-case="capitalize-first" prefix=" " variable="edition"/>
  </macro>
  <macro name="publication">
    <group delimiter=" ">
      <text variable="container-title" text-case="title" font-style="italic"/>
      <choose>
        <if match="none" variable="volume issue page">
          <text term="in press" prefix="(" suffix=")"/>
        </if>
      </choose>
    </group>
  </macro>
  <macro name="volume-issue-page">
    <group>
      <text variable="volume" font-style="normal"/>
      <number prefix="(" suffix=")" variable="issue"/>
      <text variable="page" prefix=": "/>
    </group>
  </macro>
  <macro name="publisher">
    <group delimiter=": ">
      <text variable="publisher-place"/>
      <text variable="publisher" font-style="normal"/>
    </group>
  </macro>
  <macro name="pages">
    <choose>
      <if match="all" is-numeric="number-of-pages">
        <group>
          <text variable="number-of-pages"/>
          <label plural="never" variable="number-of-pages" form="short"/>
        </group>
      </if>
      <else>
        <group delimiter=": ">
          <text value="pp" text-case="uppercase"/>
          <text variable="page"/>
        </group>
      </else>
    </choose>
  </macro>
  <citation name-form="short" and="text" delimiter-precedes-et-al="never" delimiter-precedes-last="never" et-al-min="3" et-al-use-first="1" disambiguate-add-year-suffix="true" collapse="year">
    <sort>
      <key macro="translator-author-editor-short"/>
      <key macro="issued"/>
      <key variable="title"/>
    </sort>
    <layout delimiter="; " prefix="(" suffix=")">
      <group delimiter=", ">
        <choose>
          <if match="all" variable="translator">
            <text macro="translator-short"/>
          </if>
          <else-if match="none" variable="author translator">
            <text macro="editor-short"/>
          </else-if>
          <else>
            <text macro="author-short"/>
          </else>
        </choose>
        <text macro="issued"/>
      </group>
    </layout>
  </citation>
  <bibliography and="text" delimiter-precedes-et-al="never" delimiter-precedes-last="never" et-al-min="6" et-al-use-first="1" et-al-subsequent-min="3" et-al-subsequent-use-first="1" initialize-with="." name-as-sort-order="all" hanging-indent="true">
    <sort>
      <key macro="translator-author-editor-short"/>
      <key macro="issued"/>
      <key variable="title"/>
    </sort>
    <layout suffix=".">
      <group delimiter=". ">
        <choose>
          <if match="none" variable="author editor translator">
            <text value="no author" text-case="capitalize-all"/>
          </if>
        </choose>
        <text macro="translator-author-editor" font-weight="bold"/>
        <choose>
          <if type="article-journal article-magazine review" match="any">
            <group delimiter=". ">
              <text macro="issued"/>
              <text macro="title"/>
              <group delimiter=", ">
                <text macro="publication" text-case="title" font-style="normal"/>
                <text macro="volume-issue-page" font-style="normal"/>
              </group>
            </group>
          </if>
          <else-if type="book entry-encyclopedia entry-dictionary map graphic report manuscript legislation interview review-book" match="any">
            <group delimiter=". ">
              <text macro="issued"/>
              <text macro="title-book"/>
              <group delimiter=", ">
                <text macro="volume"/>
                <text macro="edition"/>
                <text macro="publisher"/>
                <text macro="pages"/>
              </group>
            </group>
          </else-if>
          <else-if type="chapter" match="all">
            <group delimiter=". ">
              <text macro="issued"/>
              <text variable="title"/>
              <group delimiter=": ">
                <text term="in" text-case="capitalize-first"/>
                <text macro="editor" font-weight="normal"/>
              </group>
              <text variable="container-title" text-case="title" font-style="italic"/>
              <group delimiter=", ">
                <text macro="volume"/>
                <text macro="edition"/>
                <text macro="publisher"/>
                <text macro="pages"/>
              </group>
            </group>
          </else-if>
          <else-if type="thesis">
            <group delimiter=". ">
              <text macro="issued"/>
              <text macro="title"/>
              <text variable="genre"/>
              <group delimiter=", ">
                <text variable="publisher-place"/>
                <text variable="publisher"/>
              </group>
            </group>
          </else-if>
          <else-if type="paper-conference" match="all">
            <group delimiter=". ">
              <text macro="issued"/>
              <text variable="title"/>
              <group delimiter=" ">
                <text variable="genre" prefix="Proceedings of the "/>
                <text variable="container-title" font-style="italic" prefix="on &quot;" suffix="&quot;"/>
              </group>
              <group delimiter=", ">
                <text variable="issue"/>
                <text variable="publisher-place"/>
              </group>
              <text macro="pages"/>
            </group>
          </else-if>
          <else-if type="webpage" match="all">
            <group delimiter=". ">
              <text variable="title" prefix="&quot;" suffix="&quot;"/>
              <group delimiter=", ">
                <text macro="volume"/>
                <text macro="edition"/>
                <text macro="publisher"/>
                <text macro="pages"/>
              </group>
              <text macro="issued"/>
              <text variable="number"/>
              <group delimiter=" ">
                <text term="online" text-case="capitalize-first" prefix="[" suffix="]"/>
                <text variable="URL" prefix="&lt;" suffix="&gt;"/>
                <date form="text" variable="accessed" prefix="[" suffix="]">
                  <date-part name="month" form="short"/>
                </date>
              </group>
            </group>
          </else-if>
          <else-if type="article-newspaper" match="all">
            <group delimiter=". ">
              <text macro="issued"/>
              <text macro="title"/>
              <group delimiter=", ">
                <text variable="container-title" font-style="italic"/>
                <group delimiter=" ">
                  <text value="no." text-case="capitalize-first"/>
                  <number variable="issue"/>
                </group>
                <text macro="pages"/>
              </group>
            </group>
          </else-if>
          <else>
            <group delimiter=". ">
              <text macro="issued"/>
              <choose>
                <if match="any" variable="edition publisher-place">
                  <text macro="title-book" font-style="normal"/>
                  <group delimiter=", ">
                    <text macro="volume"/>
                    <text macro="edition"/>
                    <group delimiter=": ">
                      <text variable="publisher-place"/>
                      <group delimiter=" / ">
                        <text variable="publisher"/>
                        <text variable="container-title"/>
                      </group>
                    </group>
                    <text macro="pages"/>
                  </group>
                </if>
                <else-if match="none" variable="DOI" is-numeric="issue">
                  <text macro="title-book"/>
                  <group delimiter=", ">
                    <text macro="volume"/>
                    <text macro="edition"/>
                    <group delimiter=": ">
                      <text variable="publisher-place"/>
                      <group delimiter=" / ">
                        <text variable="publisher"/>
                        <text variable="container-title"/>
                      </group>
                    </group>
                    <text macro="pages"/>
                  </group>
                </else-if>
                <else>
                  <text macro="title"/>
                  <group delimiter=", ">
                    <group delimiter=" / ">
                      <text variable="publisher" text-case="title" font-style="italic"/>
                      <text macro="publication" text-case="title" font-style="italic"/>
                    </group>
                    <text macro="volume-issue-page"/>
                  </group>
                </else>
              </choose>
            </group>
          </else>
        </choose>
      </group>
    </layout>
  </bibliography>
</style>`
export let universityOfYorkApa = `<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="in-text" version="1.0" demote-non-dropping-particle="never" default-locale="en-GB">
  <!-- This style was edited with the Visual CSL Editor (http://editor.citationstyles.org/visualEditor/) -->
  <info>
    <title>University of York - APA 6th edition</title>
    <title-short>UoY APA</title-short>
    <id>http://www.zotero.org/styles/university-of-york-apa</id>
    <link href="http://www.zotero.org/styles/university-of-york-apa" rel="self"/>
    <link href="http://www.zotero.org/styles/apa" rel="template"/>
    <link href="https://www.york.ac.uk/students/studying/develop-your-skills/study-skills/study/integrity/referencing-styles/" rel="documentation"/>
    <category citation-format="author-date"/>
    <category field="generic-base"/>
    <updated>2017-10-21T12:00:00+00:00</updated>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
  </info>
  <locale xml:lang="en">
    <terms>
      <term name="editortranslator" form="short">
        <single>ed. &amp; trans.</single>
        <multiple>eds. &amp; trans.</multiple>
      </term>
      <term name="translator" form="short">trans.</term>
    </terms>
  </locale>
  <macro name="container-contributors">
    <choose>
      <if type="chapter paper-conference entry-dictionary entry-encyclopedia" match="any">
        <group delimiter=", ">
          <names variable="container-author" delimiter=", ">
            <name and="symbol" initialize-with=". " delimiter=", "/>
            <label form="short" prefix=" (" text-case="title" suffix=")"/>
          </names>
          <names variable="editor translator" delimiter=", ">
            <name and="symbol" initialize-with=". " delimiter=", "/>
            <label form="short" prefix=" (" text-case="title" suffix=")"/>
          </names>
        </group>
      </if>
    </choose>
  </macro>
  <macro name="secondary-contributors">
    <choose>
      <if type="musical_score" match="any">
        <group delimiter=", ">
          <names variable="editor translator" delimiter=", ">
            <label form="verb" text-case="title" suffix=" "/>
            <name and="symbol"/>
          </names>
        </group>
      </if>
      <else-if type="interview" match="any">
        <group>
          <names variable="editor">
            <name prefix="Interview with " initialize-with=""/>
          </names>
        </group>
      </else-if>
      <else-if type="article-journal chapter paper-conference entry-dictionary entry-encyclopedia" match="none">
        <group delimiter="," prefix=" (" suffix=")">
          <names variable="editor">
            <name and="symbol" initialize-with="."/>
            <label form="short" text-case="title" prefix=","/>
          </names>
          <names variable="container-author" delimiter=", ">
            <name and="symbol" initialize-with=". " delimiter=", "/>
            <label form="short" prefix=", " text-case="title"/>
          </names>
        </group>
      </else-if>
    </choose>
  </macro>
  <macro name="author">
    <names variable="author">
      <name name-as-sort-order="all" and="symbol" sort-separator=", " initialize-with=". " delimiter=", " delimiter-precedes-last="always"/>
      <label form="short" prefix=" (" suffix=")" text-case="capitalize-first"/>
      <substitute>
        <names variable="editor"/>
        <names variable="translator"/>
        <choose>
          <if type="report">
            <text variable="publisher"/>
            <text macro="title"/>
          </if>
          <else>
            <text macro="title"/>
          </else>
        </choose>
      </substitute>
    </names>
  </macro>
  <macro name="author-short">
    <names variable="author">
      <name form="short" and="symbol" delimiter=", " initialize-with=". "/>
      <substitute>
        <names variable="editor"/>
        <names variable="translator"/>
        <choose>
          <if type="report">
            <text variable="publisher"/>
            <text variable="title" form="short" font-style="italic"/>
          </if>
          <else-if type="legal_case">
            <text variable="title" font-style="italic"/>
          </else-if>
          <else-if type="book graphic  motion_picture song" match="any">
            <text variable="title" form="short" font-style="italic"/>
          </else-if>
          <else-if type="bill legislation" match="any">
            <text variable="title" form="short"/>
          </else-if>
          <else-if variable="reviewed-author">
            <choose>
              <if variable="reviewed-title" match="none">
                <text variable="title" form="short" font-style="italic" prefix="Review of "/>
              </if>
              <else>
                <text variable="title" form="short" quotes="true"/>
              </else>
            </choose>
          </else-if>
          <else>
            <text variable="title" form="short" quotes="true"/>
          </else>
        </choose>
      </substitute>
    </names>
  </macro>
  <macro name="access">
    <choose>
      <if type="thesis" match="any">
        <choose>
          <if variable="DOI" match="any">
            <text term="retrieved" text-case="capitalize-first" prefix=" " suffix=" "/>
            <group>
              <date form="text" variable="accessed"/>
            </group>
            <text term="from" prefix=" " suffix=" "/>
            <text variable="DOI" prefix="https://doi.org/"/>
          </if>
          <else-if variable="archive" match="any">
            <group>
              <text term="retrieved" text-case="capitalize-first" suffix=" "/>
              <text term="from" suffix=" "/>
              <text variable="archive" suffix="."/>
              <text variable="archive_location" prefix=" (" suffix=")"/>
            </group>
          </else-if>
          <else>
            <group>
              <text term="retrieved" text-case="capitalize-first" suffix=" "/>
              <group>
                <date form="text" variable="accessed"/>
              </group>
              <text term="from" prefix=" " suffix=" "/>
              <text variable="URL"/>
            </group>
          </else>
        </choose>
      </if>
      <else-if type="report" match="any">
        <choose>
          <if match="any" variable="DOI">
            <text term="retrieved" text-case="capitalize-first" suffix=" "/>
            <group>
              <date form="text" variable="accessed"/>
            </group>
            <text term="from" prefix=" " suffix=" "/>
            <text macro="publisher" suffix=": "/>
            <text variable="DOI"/>
          </if>
          <else-if match="any" variable="archive">
            <group>
              <text term="retrieved" text-case="capitalize-first" suffix=" "/>
              <text term="from" prefix=" " suffix=" "/>
              <text variable="archive" suffix="."/>
              <text variable="archive_location" prefix=" (" suffix=")"/>
            </group>
          </else-if>
          <else>
            <group>
              <text term="retrieved" text-case="capitalize-first" suffix=" "/>
              <group>
                <date form="text" variable="accessed"/>
              </group>
              <text term="from" prefix=" " suffix=" "/>
              <text macro="publisher" suffix=": "/>
              <text variable="URL"/>
            </group>
          </else>
        </choose>
      </else-if>
      <else>
        <choose>
          <if variable="DOI">
            <text term="retrieved" text-case="capitalize-first" suffix=" "/>
            <group>
              <date form="text" variable="accessed"/>
            </group>
            <text term="from" prefix=" " suffix=" "/>
            <text variable="DOI" prefix="https://doi.org/"/>
          </if>
          <else>
            <choose>
              <if type="webpage">
                <group delimiter=" ">
                  <text term="retrieved" text-case="capitalize-first" suffix=" "/>
                  <group>
                    <date variable="accessed" form="text" suffix=", "/>
                  </group>
                  <text term="from"/>
                  <text variable="URL"/>
                </group>
              </if>
              <else>
                <group>
                  <text term="retrieved" text-case="capitalize-first" suffix=" "/>
                  <group>
                    <date form="text" variable="accessed"/>
                  </group>
                  <text term="from" prefix=" " suffix=" "/>
                  <text variable="URL"/>
                </group>
              </else>
            </choose>
          </else>
        </choose>
      </else>
    </choose>
  </macro>
  <macro name="title">
    <choose>
      <if type="book manuscript motion_picture report song speech thesis" match="any">
        <choose>
          <if variable="version" type="book" match="all">
            <text variable="title"/>
          </if>
          <else>
            <text variable="title" font-style="italic"/>
          </else>
        </choose>
      </if>
      <else-if variable="reviewed-author">
        <choose>
          <if variable="reviewed-title">
            <group delimiter=" ">
              <text variable="title"/>
              <group delimiter=", " prefix="[" suffix="]">
                <text variable="reviewed-title" font-style="italic" prefix="Review of "/>
                <names variable="reviewed-author" delimiter=", ">
                  <label form="verb-short" suffix=" "/>
                  <name and="symbol" initialize-with=". " delimiter=", "/>
                </names>
              </group>
            </group>
          </if>
          <else>
            <group delimiter=", " prefix="[" suffix="]">
              <text variable="title" font-style="italic" prefix="Review of "/>
              <names variable="reviewed-author" delimiter=", ">
                <label form="verb-short" suffix=" "/>
                <name and="symbol" initialize-with=". " delimiter=", "/>
              </names>
            </group>
          </else>
        </choose>
      </else-if>
      <else-if type="figure graphic musical_score" match="any">
        <text variable="title" font-style="italic"/>
      </else-if>
      <else>
        <text variable="title"/>
      </else>
    </choose>
  </macro>
  <macro name="title-plus-extra">
    <text macro="title"/>
    <choose>
      <if type="report thesis" match="any">
        <group prefix=" (" suffix=")" delimiter=", ">
          <group delimiter=" ">
            <choose>
              <if variable="genre" match="any">
                <text variable="genre"/>
              </if>
              <else>
                <text variable="collection-title"/>
              </else>
            </choose>
            <text variable="number" prefix="No. "/>
          </group>
          <group delimiter=" ">
            <text term="version" text-case="capitalize-first"/>
            <text variable="version"/>
          </group>
          <text macro="edition"/>
        </group>
      </if>
      <else-if type="post-weblog webpage" match="any">
        <text variable="genre" prefix=" [" suffix="]"/>
      </else-if>
      <else-if variable="version">
        <group delimiter=" " prefix=" (" suffix=")">
          <text term="version" text-case="capitalize-first"/>
          <text variable="version"/>
        </group>
      </else-if>
    </choose>
    <text macro="format" prefix=" [" suffix="]"/>
  </macro>
  <macro name="format">
    <choose>
      <if match="any" variable="medium">
        <choose>
          <if type="figure graphic" match="none">
            <text variable="medium" text-case="capitalize-first"/>
          </if>
        </choose>
      </if>
      <else-if type="dataset" match="any">
        <text value="Data set"/>
      </else-if>
    </choose>
  </macro>
  <macro name="publisher">
    <choose>
      <if type="report" match="any">
        <group delimiter=": ">
          <text variable="publisher-place"/>
          <text variable="publisher"/>
        </group>
      </if>
      <else-if type="thesis" match="any">
        <group delimiter=", ">
          <text variable="publisher"/>
          <text variable="publisher-place"/>
        </group>
      </else-if>
      <else-if type="interview" match="any">
        <text variable="publisher" font-style="italic" suffix="."/>
      </else-if>
      <else-if type="post-weblog webpage" match="none">
        <group delimiter=", ">
          <choose>
            <if variable="event version" type="speech motion_picture" match="none">
              <text variable="genre"/>
            </if>
          </choose>
          <choose>
            <if type="article-journal article-magazine" match="none">
              <group delimiter=": ">
                <choose>
                  <if variable="publisher-place">
                    <text variable="publisher-place"/>
                  </if>
                  <else>
                    <text variable="event-place"/>
                  </else>
                </choose>
                <text variable="publisher"/>
              </group>
            </if>
          </choose>
        </group>
      </else-if>
    </choose>
  </macro>
  <macro name="event">
    <choose>
      <if variable="container-title" match="none">
        <choose>
          <if variable="event">
            <choose>
              <if variable="genre" match="none">
                <text term="presented at" text-case="capitalize-first" suffix=" "/>
                <text variable="event"/>
              </if>
              <else>
                <group delimiter=" ">
                  <text variable="genre" text-case="capitalize-first"/>
                  <text term="presented at"/>
                  <text variable="event"/>
                </group>
              </else>
            </choose>
          </if>
          <else-if type="speech">
            <text variable="genre" text-case="capitalize-first"/>
          </else-if>
        </choose>
      </if>
    </choose>
  </macro>
  <macro name="issued">
    <choose>
      <if type="bill legal_case legislation" match="none">
        <choose>
          <if variable="issued">
            <group prefix=" (" suffix=")">
              <date variable="issued">
                <date-part name="year"/>
              </date>
              <text variable="year-suffix"/>
              <choose>
                <if type="speech" match="any">
                  <date variable="issued">
                    <date-part prefix=", " name="month"/>
                  </date>
                </if>
                <else-if type="article-journal bill book chapter graphic legal_case legislation motion_picture paper-conference report song dataset webpage entry-encyclopedia thesis interview" match="none">
                  <date variable="issued">
                    <date-part prefix=", " name="month"/>
                    <date-part prefix=" " name="day"/>
                  </date>
                </else-if>
              </choose>
            </group>
          </if>
          <else-if variable="status">
            <group prefix=" (" suffix=")">
              <text variable="status"/>
              <text variable="year-suffix" prefix="-"/>
            </group>
          </else-if>
          <else>
            <group prefix=" (" suffix=")">
              <text term="no date" form="short"/>
              <text variable="year-suffix" prefix="-"/>
            </group>
          </else>
        </choose>
      </if>
    </choose>
  </macro>
  <macro name="issued-sort">
    <choose>
      <if type="article-journal bill book chapter graphic legal_case legislation motion_picture paper-conference report song dataset" match="none">
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
    <choose>
      <if variable="issued">
        <group delimiter="/">
          <date variable="original-date" form="text"/>
          <group>
            <date variable="issued">
              <date-part name="year"/>
            </date>
            <text variable="year-suffix"/>
          </group>
        </group>
      </if>
      <else-if variable="status">
        <text variable="status"/>
        <text variable="year-suffix" prefix="-"/>
      </else-if>
      <else>
        <text term="no date" form="short"/>
        <text variable="year-suffix" prefix="-"/>
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
      <if type="article-journal article-magazine" match="any">
        <group prefix=", " delimiter=", ">
          <group>
            <text variable="volume" font-style="normal"/>
            <text variable="issue" prefix="(" suffix=")"/>
          </group>
          <text variable="page"/>
        </group>
        <choose>
          <if variable="issued">
            <choose>
              <if variable="page issue" match="none">
                <text variable="status" prefix=". "/>
              </if>
            </choose>
          </if>
        </choose>
      </if>
      <else-if type="article-newspaper">
        <group delimiter=" " prefix=", ">
          <label variable="page" form="short"/>
          <text variable="page"/>
        </group>
      </else-if>
      <else-if type="book graphic motion_picture report song chapter paper-conference entry-encyclopedia entry-dictionary" match="any">
        <group prefix=" (" suffix=")" delimiter=", ">
          <choose>
            <if type="report" match="none">
              <text macro="edition"/>
            </if>
          </choose>
          <choose>
            <if variable="volume" match="any">
              <group>
                <text term="volume" form="short" text-case="capitalize-first" suffix=" "/>
                <number variable="volume" form="numeric"/>
              </group>
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
      </else-if>
      <else-if type="legal_case">
        <group prefix=" (" suffix=")" delimiter=" ">
          <text variable="authority"/>
          <choose>
            <if variable="container-title" match="any">
              <date variable="issued" form="numeric" date-parts="year"/>
            </if>
            <else>
              <date variable="issued" form="text"/>
            </else>
          </choose>
        </group>
      </else-if>
      <else-if type="bill legislation" match="any">
        <date variable="issued" prefix=" (" suffix=")">
          <date-part name="year"/>
        </date>
      </else-if>
    </choose>
  </macro>
  <macro name="citation-locator">
    <group>
      <choose>
        <if locator="chapter">
          <label variable="locator" form="long" text-case="capitalize-first"/>
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
      <if type="post-weblog webpage" match="none">
        <group>
          <choose>
            <if type="chapter paper-conference entry-encyclopedia" match="any">
              <text term="in" text-case="capitalize-first" suffix=" "/>
            </if>
          </choose>
          <group delimiter=", ">
            <text macro="container-contributors"/>
            <text macro="secondary-contributors"/>
            <text macro="container-title"/>
          </group>
        </group>
      </if>
    </choose>
  </macro>
  <macro name="container-title">
    <choose>
      <if type="article article-journal article-magazine article-newspaper" match="any">
        <text variable="container-title" font-style="italic" text-case="title"/>
      </if>
      <else-if type="bill legal_case legislation" match="none">
        <text variable="container-title" font-style="italic"/>
      </else-if>
    </choose>
  </macro>
  <macro name="legal-cites">
    <choose>
      <if type="legal_case" match="any">
        <group prefix=", " delimiter=" ">
          <choose>
            <if variable="container-title">
              <text variable="volume"/>
              <text variable="container-title"/>
              <group delimiter=" ">
                <text term="section" form="symbol"/>
                <text variable="section"/>
              </group>
              <text variable="page"/>
            </if>
            <else>
              <text variable="number" prefix="No. "/>
            </else>
          </choose>
        </group>
      </if>
      <else-if type="bill legislation" match="any">
        <group delimiter=", " prefix=", ">
          <choose>
            <if variable="number">
              <text variable="number" prefix="Pub. L. No. "/>
              <group delimiter=" ">
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
                <text term="section" form="symbol"/>
                <text variable="section"/>
              </group>
            </else>
          </choose>
        </group>
      </else-if>
    </choose>
  </macro>
  <macro name="original-date">
    <choose>
      <if variable="original-date">
        <group prefix="(" suffix=")" delimiter=" ">
          <text value="Original work published"/>
          <date variable="original-date" form="text"/>
        </group>
      </if>
    </choose>
  </macro>
  <citation et-al-min="6" et-al-use-first="1" et-al-subsequent-min="3" et-al-subsequent-use-first="1" disambiguate-add-year-suffix="true" disambiguate-add-names="true" disambiguate-add-givenname="true" collapse="year" givenname-disambiguation-rule="primary-name">
    <sort>
      <key macro="author"/>
      <key macro="issued-sort"/>
    </sort>
    <layout prefix="(" suffix=")" delimiter="; ">
      <group delimiter=", ">
        <text macro="author-short"/>
        <text macro="issued-year"/>
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
          <text macro="issued"/>
          <text macro="title-plus-extra"/>
          <text macro="container"/>
        </group>
        <text macro="legal-cites"/>
        <text macro="locators"/>
        <group delimiter=", " prefix=". ">
          <text macro="event"/>
          <choose>
            <if type="report" match="none">
              <text macro="publisher"/>
            </if>
          </choose>
        </group>
        <group>
          <choose>
            <if type="interview" match="any">
              <text variable="volume"/>
              <label text-case="lowercase" prefix=", " variable="page" form="short"/>
              <text variable="page"/>
            </if>
          </choose>
        </group>
      </group>
      <text macro="access" prefix=" "/>
      <text macro="original-date" prefix=" "/>
    </layout>
  </bibliography>
</style>`
export let universityOfLincolnHarvard = `<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="in-text" version="1.0" demote-non-dropping-particle="sort-only" default-locale="en-GB">
  <info>
    <title>University of Lincoln - Harvard</title>
    <id>http://www.zotero.org/styles/university-of-lincoln-harvard</id>
    <link href="http://www.zotero.org/styles/university-of-lincoln-harvard" rel="self"/>
    <link href="http://www.zotero.org/styles/harvard-newcastle-university" rel="template"/>
    <link href="http://guides.library.lincoln.ac.uk/learn/referencing" rel="documentation"/>
    <link href="http://guides.library.lincoln.ac.uk/ld.php?content_id=26426164" rel="documentation"/>
    <author>
      <name>Patrick O'Brien</name>
      <email>obrienpat86@gmail.com</email>
    </author>
    <category citation-format="author-date"/>
    <category field="generic-base"/>
    <summary>The Harvard author-date style, 2nd edition, as outlined by the library of the University of Lincoln.</summary>
    <updated>2019-11-13T14:03:41+00:00</updated>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
  </info>
  <locale xml:lang="en">
    <terms>
      <term name="available at">available from</term>
    </terms>
  </locale>
  <macro name="editor">
    <names variable="editor" delimiter=", ">
      <name and="text" initialize-with="."/>
      <label form="short" prefix=" (" suffix=")"/>
    </names>
  </macro>
  <macro name="anon">
    <text term="anonymous" form="short" text-case="capitalize-first" strip-periods="true"/>
  </macro>
  <macro name="author">
    <names variable="author">
      <name and="text" delimiter-precedes-last="never" initialize-with="." name-as-sort-order="all"/>
      <label form="short" prefix=" (" suffix=".)"/>
      <substitute>
        <names variable="editor"/>
        <text variable="title"/>
        <text macro="anon"/>
      </substitute>
    </names>
  </macro>
  <macro name="author-short">
    <names variable="author">
      <name form="short" and="text" initialize-with=". " sort-separator=","/>
      <substitute>
        <names variable="editor"/>
        <names variable="translator"/>
        <choose>
          <if type="bill book graphic legal_case legislation motion_picture report song" match="any">
            <text variable="title" form="short" font-style="italic"/>
          </if>
          <else>
            <text variable="title" form="short" quotes="false"/>
          </else>
        </choose>
      </substitute>
    </names>
  </macro>
  <macro name="access">
    <choose>
      <if type="bill webpage article-journal article-newspaper" match="any">
        <group delimiter=" ">
          <text term="available at" text-case="capitalize-first"/>
          <text variable="URL"/>
          <group delimiter=" " prefix="[" suffix="]">
            <text term="accessed"/>
            <date variable="accessed">
              <date-part name="day" suffix=" "/>
              <date-part name="month" suffix=" "/>
              <date-part name="year"/>
            </date>
          </group>
        </group>
      </if>
    </choose>
  </macro>
  <macro name="title">
    <choose>
      <if type="book webpage graphic" match="any">
        <text variable="title" font-style="italic"/>
      </if>
      <else-if variable="container-title" match="none">
        <text variable="title" font-style="italic"/>
      </else-if>
      <else>
        <text variable="title" quotes="false"/>
      </else>
    </choose>
  </macro>
  <macro name="publisher">
    <text variable="publisher-place" suffix=": "/>
    <text variable="publisher"/>
  </macro>
  <macro name="year-date">
    <choose>
      <if variable="issued">
        <date variable="issued">
          <date-part name="year"/>
        </date>
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
          <number vertical-align="baseline" variable="edition" form="ordinal"/>
          <text term="edition" form="long" strip-periods="true"/>
        </group>
      </if>
      <else>
        <text variable="edition"/>
      </else>
    </choose>
  </macro>
  <macro name="pages">
    <group>
      <text variable="page"/>
    </group>
  </macro>
  <macro name="issued">
    <choose>
      <if type="article-newspaper paper-conference broadcast" match="any">
        <date variable="issued">
          <date-part name="day" suffix=" "/>
          <date-part name="month"/>
        </date>
      </if>
    </choose>
    <choose>
      <if type="paper-conference" match="any">
        <date variable="issued">
          <date-part name="year" prefix=" "/>
        </date>
      </if>
    </choose>
  </macro>
  <macro name="volume">
    <group>
      <text term="volume" form="short" text-case="capitalize-first" suffix=". "/>
      <number variable="volume" form="numeric"/>
    </group>
    <group>
      <number variable="number-of-volumes" form="numeric" prefix=", "/>
      <text term="volume" form="short" prefix=" " suffix="." plural="true"/>
    </group>
  </macro>
  <citation et-al-min="3" et-al-use-first="1" disambiguate-add-year-suffix="true" disambiguate-add-names="true" disambiguate-add-givenname="true" collapse="year">
    <layout prefix="(" suffix=")" delimiter="; ">
      <group delimiter=", ">
        <text macro="author-short" text-case="capitalize-first"/>
        <text macro="year-date"/>
        <group>
          <text variable="locator"/>
        </group>
      </group>
    </layout>
  </citation>
  <bibliography hanging-indent="true">
    <sort>
      <key macro="author"/>
      <key variable="title"/>
    </sort>
    <layout suffix=".">
      <choose>
        <if type="bill" match="none">
          <group delimiter=" ">
            <text macro="author"/>
            <text macro="year-date" prefix="(" suffix=")"/>
          </group>
        </if>
      </choose>
      <choose>
        <if type="thesis">
          <group prefix=" " delimiter=". " suffix=".">
            <text macro="title" font-style="italic"/>
            <text macro="edition"/>
            <text variable="genre" suffix=" thesis"/>
            <text macro="publisher"/>
          </group>
        </if>
        <else-if type="bill">
          <text variable="title" font-style="italic"/>
          <text variable="authority" prefix=" [" suffix="]"/>
          <text variable="number" prefix=" Bill " suffix=", "/>
          <text variable="chapter-number" suffix=". "/>
        </else-if>
        <else-if type="webpage">
          <group prefix=" " delimiter=". ">
            <text macro="title"/>
            <text macro="edition"/>
          </group>
        </else-if>
        <else-if type="article-journal broadcast personal_communication thesis webpage" match="any">
          <group suffix=".">
            <text macro="title" prefix=" "/>
            <text macro="editor" prefix=" "/>
          </group>
          <choose>
            <if variable="author" match="any">
              <text variable="container-title" font-style="italic" prefix=" " suffix=","/>
            </if>
          </choose>
          <group prefix=" " suffix=".">
            <group>
              <text variable="volume"/>
              <text variable="issue" prefix="(" suffix=")"/>
              <text macro="issued"/>
            </group>
            <group prefix=" ">
              <text macro="pages"/>
            </group>
          </group>
        </else-if>
        <else-if type="article-newspaper">
          <group suffix=".">
            <text macro="title" prefix=" "/>
            <text macro="editor" prefix=" "/>
          </group>
          <choose>
            <if variable="author" match="any">
              <text variable="container-title" font-style="italic" prefix=" " suffix=","/>
            </if>
          </choose>
          <group delimiter=", " prefix=" ">
            <text macro="issued"/>
            <text macro="pages"/>
          </group>
        </else-if>
        <else-if type="book graphic report" match="any">
          <group prefix=" " delimiter=". ">
            <text macro="title"/>
            <group delimiter=" ">
              <text variable="collection-title"/>
              <text variable="collection-number"/>
            </group>
            <text macro="edition"/>
            <text macro="editor"/>
            <text macro="volume"/>
            <text macro="publisher"/>
          </group>
        </else-if>
        <else-if type="chapter paper-conference" match="any">
          <text macro="title" prefix=" " suffix="."/>
          <group prefix=" " delimiter=" ">
            <text term="in" text-case="capitalize-first" suffix=":"/>
            <text macro="editor"/>
            <text variable="container-title" font-style="italic" suffix="."/>
            <text variable="collection-title" suffix="."/>
            <text macro="edition"/>
            <text macro="issued"/>
            <text macro="publisher" suffix=","/>
            <text macro="pages"/>
          </group>
        </else-if>
        <else>
          <group suffix=".">
            <text macro="title" prefix=" "/>
            <text macro="editor" prefix=" "/>
          </group>
          <text variable="container-title" prefix=" "/>
          <text macro="access" prefix=" " suffix=". "/>
          <group prefix=" " suffix=".">
            <group prefix=" ">
              <text variable="volume"/>
              <text variable="issue" prefix=" (" suffix=")"/>
              <text macro="issued"/>
            </group>
            <group prefix=" ">
              <label variable="locator" suffix="." form="short" strip-periods="true"/>
              <text macro="pages"/>
            </group>
          </group>
        </else>
      </choose>
      <text macro="access" prefix=" "/>
    </layout>
  </bibliography>
</style>`
export let universityOfYorkHarvardEnvironment = `<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="in-text" version="1.0" and="text" delimiter-precedes-last="never" page-range-format="expanded" demote-non-dropping-particle="sort-only" default-locale="en-GB">
  <!-- This style was edited with the Visual CSL Editor (http://editor.citationstyles.org/visualEditor/) -->
  <info>
    <title>University of York - Harvard - Environment</title>
    <title-short>UoY Harvard Environment</title-short>
    <id>http://www.zotero.org/styles/university-of-york-harvard-environment</id>
    <link href="http://www.zotero.org/styles/university-of-york-harvard-environment" rel="self"/>
    <link href="http://www.zotero.org/styles/harvard-imperial-college-london" rel="template"/>
    <link href="https://www.york.ac.uk/students/studying/develop-your-skills/study-skills/study/integrity/referencing-styles/" rel="documentation"/>
    <author>
      <name>Peter L Jones</name>
      <email>10101833@ex.uwl.ac.uk</email>
    </author>
    <category citation-format="author-date"/>
    <category field="generic-base"/>
    <summary>University of York Author-Date Harvard, based on UoWL version.</summary>
    <updated>2017-10-26T12:00:00+00:00</updated>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
  </info>
  <macro name="author">
    <names variable="author">
      <name font-style="normal" initialize-with=". " name-as-sort-order="all"/>
      <et-al font-style="normal" font-variant="normal" font-weight="normal" text-decoration="none"/>
      <label form="short" font-style="normal" prefix=" " suffix=" "/>
      <substitute>
        <names variable="translator" font-style="normal"/>
        <text macro="editor"/>
        <text variable="publisher"/>
      </substitute>
    </names>
  </macro>
  <macro name="editor">
    <names variable="editor">
      <name initialize-with=". " name-as-sort-order="all"/>
      <label form="short" text-case="capitalize-first" strip-periods="true" prefix=" (" suffix=")"/>
    </names>
  </macro>
  <macro name="author-short">
    <names variable="author">
      <name form="short" font-style="normal"/>
      <et-al font-style="normal"/>
      <substitute>
        <names variable="translator"/>
        <text macro="editor-short"/>
        <text variable="publisher" form="short"/>
        <text macro="anon"/>
      </substitute>
    </names>
  </macro>
  <macro name="editor-short">
    <names variable="editor">
      <name form="short"/>
      <et-al font-style="italic"/>
      <label form="short" text-case="capitalize-first" strip-periods="true" prefix=" (" suffix=")"/>
    </names>
  </macro>
  <macro name="anon">
    <text term="anonymous" form="short" text-case="capitalize-first" strip-periods="true"/>
  </macro>
  <macro name="title">
    <choose>
      <if type="book graphic" match="any">
        <text variable="title" font-style="italic" font-weight="normal" text-decoration="none"/>
      </if>
      <else-if type="article-newspaper interview" match="any">
        <text variable="title"/>
      </else-if>
      <else-if type="webpage" match="any">
        <text variable="title" font-style="italic"/>
      </else-if>
      <else-if variable="container-title" match="none">
        <text variable="title" font-style="italic" text-decoration="none"/>
      </else-if>
      <else>
        <text variable="title" text-decoration="none"/>
      </else>
    </choose>
  </macro>
  <macro name="edition">
    <choose>
      <if is-numeric="edition">
        <group delimiter=" ">
          <number variable="edition" form="ordinal"/>
          <text term="edition" form="short" strip-periods="true"/>
        </group>
      </if>
      <else>
        <text variable="edition"/>
      </else>
    </choose>
  </macro>
  <macro name="vol_iss">
    <group delimiter=" ">
      <text variable="volume"/>
      <text variable="issue" prefix="(" suffix=")"/>
    </group>
  </macro>
  <macro name="publisher">
    <group delimiter=": ">
      <text variable="publisher-place" suffix=" "/>
      <choose>
        <if type="article-newspaper interview" match="any">
          <text variable="publisher" font-style="italic"/>
        </if>
        <else>
          <text variable="publisher" suffix="."/>
        </else>
      </choose>
    </group>
  </macro>
  <macro name="access">
    <group delimiter=" ">
      <text variable="archive" font-style="italic"/>
      <text macro="location"/>
      <group prefix="[" suffix="]">
        <text term="accessed" text-case="capitalize-first" suffix=" "/>
        <date variable="accessed">
          <date-part name="day" suffix=" "/>
          <date-part name="month" suffix=" "/>
          <date-part name="year"/>
        </date>
      </group>
    </group>
  </macro>
  <macro name="location">
    <choose>
      <if match="any" variable="DOI URL">
        <choose>
          <if type="article-newspaper" match="any">
            <text term="online" text-case="capitalize-first" prefix="[" suffix="]. "/>
            <text macro="issued" suffix="."/>
            <group>
              <text term="available at" text-case="capitalize-first" strip-periods="true" prefix=" " suffix=": "/>
            </group>
          </if>
          <else-if type="webpage figure graphic" match="any">
            <text term="online" text-case="capitalize-first" prefix="[" suffix="]. "/>
            <text macro="publisher"/>
            <text term="available at" text-case="capitalize-first" prefix=" " suffix=": "/>
          </else-if>
          <else>
            <text term="online" text-case="capitalize-first" prefix="[" suffix="]. "/>
            <text term="available at" text-case="capitalize-first" suffix=": "/>
          </else>
        </choose>
        <choose>
          <if variable="DOI">
            <text variable="DOI" prefix="doi:"/>
          </if>
          <else-if variable="URL">
            <text variable="URL"/>
          </else-if>
        </choose>
      </if>
    </choose>
  </macro>
  <macro name="issued">
    <group delimiter=" ">
      <choose>
        <if type="paper-conference broadcast article-newspaper" match="any">
          <date variable="issued" delimiter=" ">
            <date-part name="day"/>
            <date-part name="month"/>
          </date>
        </if>
        <else-if type="interview" match="any">
          <date form="text" date-parts="year-month-day" variable="issued"/>
        </else-if>
      </choose>
      <choose>
        <if type="paper-conference" match="any">
          <date variable="issued">
            <date-part name="year"/>
          </date>
        </if>
      </choose>
    </group>
  </macro>
  <macro name="pages">
    <group>
      <label variable="page" form="short"/>
      <text variable="page" form="short"/>
    </group>
  </macro>
  <macro name="collection">
    <group delimiter=" ">
      <text variable="collection-title"/>
      <text variable="collection-number"/>
    </group>
  </macro>
  <macro name="year-date">
    <choose>
      <if match="none" is-uncertain-date="issued">
        <date date-parts="year" form="text" variable="issued"/>
      </if>
      <else>
        <text term="no date" form="short"/>
      </else>
    </choose>
  </macro>
  <citation et-al-min="4" et-al-use-first="1" disambiguate-add-year-suffix="true" collapse="year">
    <layout delimiter="; " prefix="(" suffix=")">
      <group delimiter=", ">
        <text macro="author-short"/>
        <text macro="year-date"/>
        <group>
          <label variable="locator" form="short"/>
          <text variable="locator"/>
        </group>
      </group>
    </layout>
  </citation>
  <bibliography et-al-min="11" et-al-use-first="10">
    <sort>
      <key macro="author"/>
      <key macro="year-date"/>
      <key variable="title"/>
    </sort>
    <layout>
      <group delimiter=". " suffix=".">
        <text macro="author"/>
        <text macro="year-date" prefix=" (" suffix=")"/>
        <choose>
          <if type="book" match="any">
            <group delimiter=", ">
              <text macro="title"/>
              <text macro="collection"/>
            </group>
            <text macro="edition"/>
            <text macro="editor"/>
            <group delimiter=", ">
              <text macro="issued"/>
              <text macro="publisher"/>
              <text macro="pages"/>
            </group>
          </if>
          <else-if type="chapter paper-conference" match="any">
            <text macro="title"/>
            <group delimiter=": ">
              <text term="in" text-case="capitalize-first"/>
              <group delimiter=". ">
                <text macro="editor"/>
                <text variable="container-title" font-style="italic" text-decoration="none"/>
                <text macro="collection"/>
                <text macro="edition"/>
                <text macro="vol_iss"/>
                <text macro="issued"/>
                <text macro="publisher"/>
                <text macro="pages"/>
              </group>
            </group>
          </else-if>
          <else-if type="article-newspaper" match="any">
            <group>
              <text macro="title"/>
              <text macro="collection"/>
              <text macro="editor"/>
            </group>
            <text macro="edition"/>
            <group>
              <choose>
                <if match="none" variable="DOI URL">
                  <text macro="issued"/>
                </if>
              </choose>
              <text macro="publisher"/>
              <text macro="pages"/>
            </group>
          </else-if>
          <else-if type="webpage" match="any">
            <group>
              <text macro="title"/>
              <text macro="collection"/>
            </group>
            <text macro="edition"/>
            <text macro="editor"/>
          </else-if>
          <else-if type="figure graphic" match="any">
            <group>
              <text macro="title"/>
              <text macro="collection"/>
            </group>
            <text macro="edition"/>
            <text macro="editor"/>
            <group>
              <text macro="issued"/>
              <choose>
                <if match="none" variable="DOI URL">
                  <text macro="publisher"/>
                </if>
              </choose>
              <text macro="pages"/>
            </group>
          </else-if>
          <else-if type="interview" match="any">
            <group>
              <text macro="title"/>
              <text macro="collection"/>
            </group>
            <text macro="edition"/>
            <group>
              <names variable="editor" prefix="Interview with ">
                <name initialize-with="."/>
              </names>
            </group>
            <text macro="publisher"/>
            <text macro="issued"/>
            <text macro="pages"/>
          </else-if>
          <else-if type="musical_score" match="any">
            <group>
              <text macro="title"/>
              <text macro="collection"/>
            </group>
            <text macro="edition"/>
            <group>
              <names variable="editor">
                <label form="verb" text-case="capitalize-first" suffix=" "/>
                <name initialize-with="."/>
              </names>
            </group>
            <group>
              <text macro="issued"/>
              <text macro="publisher"/>
              <group prefix="(" suffix=")">
                <text variable="volume" prefix="Original work published "/>
              </group>
            </group>
          </else-if>
          <else>
            <text macro="title"/>
            <text macro="edition"/>
            <text macro="editor"/>
            <group delimiter=", ">
              <choose>
                <if variable="author" match="any">
                  <text variable="container-title" font-style="italic"/>
                </if>
              </choose>
              <text macro="vol_iss"/>
              <text variable="genre"/>
              <text macro="issued"/>
              <text macro="publisher"/>
              <text macro="pages"/>
            </group>
          </else>
        </choose>
      </group>
      <text prefix=" " macro="access" suffix="."/>
    </layout>
  </bibliography>
</style>`
export let pisaUniversityPress = `<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="note" version="1.0" demote-non-dropping-particle="sort-only" default-locale="en-GB">
  <info>
    <title>Pisa University Press</title>
    <id>http://www.zotero.org/styles/pisa-university-press</id>
    <link href="http://www.zotero.org/styles/pisa-university-press" rel="self"/>
    <link href="http://forums.zotero.org/discussion/27504/style-request-pisa-university-press/#Item_3" rel="documentation"/>
    <link href="http://www.pisauniversitypress.it/" rel="documentation"/>
    <author>
      <name>Anton Hughes</name>
      <email>antonh@lawtec.net</email>
    </author>
    <author>
      <name>Bruce D'Arcus</name>
      <email>bdarcus@gmail.com</email>
    </author>
    <author>
      <name>Nancy Sims</name>
      <email>nsims@umich.edu</email>
    </author>
    <author>
      <name>Nic Suzor</name>
      <email>nic@suzor.com</email>
    </author>
    <contributor>
      <name>Sebastian Karcher</name>
    </contributor>
    <category citation-format="note"/>
    <summary>Style for Pisa University Press Book Series. Based on Australian Legal, which explains a bit of the messiness.</summary>
    <updated>2012-10-26T01:15:26+00:00</updated>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
  </info>
  <locale>
    <terms>
      <term name="editor" form="verb-short">eds.</term>
      <term name="translator" form="verb-short">trans.</term>
    </terms>
  </locale>
  <!-- sets up basics of dealing with authors -->
  <macro name="name-macro">
    <choose>
      <if type="legal_case">
        <names variable="author">
          <name and="text" delimiter=", " delimiter-precedes-last="never"/>
          <label form="short"/>
          <substitute>
            <text variable="title"/>
          </substitute>
        </names>
      </if>
      <else>
        <names variable="author">
          <name and="text" delimiter=", " delimiter-precedes-last="never" initialize-with="."/>
          <label form="short" prefix=" (" suffix=")" strip-periods="true"/>
          <substitute>
            <names variable="editor"/>
            <text variable="title"/>
          </substitute>
        </names>
      </else>
    </choose>
  </macro>
  <macro name="author-short">
    <names variable="author">
      <name form="short" and="text" delimiter=", "/>
      <substitute>
        <names variable="editor"/>
        <text variable="title"/>
      </substitute>
    </names>
  </macro>
  <macro name="author">
    <choose>
      <if type="legal_case">
        <text macro="name-macro" font-style="italic"/>
      </if>
      <else-if type="interview">
        <names variable="author">
          <name and="symbol" delimiter=", "/>
          <label form="short" prefix=" Interview with " strip-periods="true"/>
          <substitute>
            <text variable="title"/>
          </substitute>
        </names>
      </else-if>
      <else>
        <text macro="name-macro"/>
      </else>
    </choose>
  </macro>
  <macro name="editor">
    <names variable="editor" delimiter=",">
      <name and="symbol" delimiter=", "/>
      <label form="short" prefix=" (" suffix=")" strip-periods="true"/>
    </names>
  </macro>
  <macro name="interviewer">
    <names variable="interviewer">
      <name and="symbol" delimiter=", " delimiter-precedes-last="never"/>
      <label form="short" prefix=" "/>
    </names>
  </macro>
  <!-- sets up basics of handling volume formatting -->
  <macro name="volume-macro">
    <choose>
      <if type="article-journal article-magazine article-newspaper broadcast interview manuscript map patent personal_communication song speech thesis webpage legal_case" match="any">
        <choose>
          <if variable="volume" match="none">
            <date variable="issued">
              <date-part name="year" prefix=" [" suffix="]"/>
            </date>
            <text variable="volume" prefix=" "/>
          </if>
          <else>
            <date variable="issued">
              <date-part name="year" prefix=" (" suffix="),"/>
            </date>
            <text variable="volume" prefix=" "/>
            <text variable="issue" prefix="(" suffix=")"/>
          </else>
        </choose>
      </if>
      <else>
        <group prefix=" (" suffix=")" delimiter=" ">
          <text variable="edition" suffix=", "/>
          <text variable="publisher"/>
          <date variable="issued">
            <date-part name="year"/>
          </date>
        </group>
      </else>
    </choose>
  </macro>
  <!-- sets up font variations for titles in books, articles, etc. -->
  <macro name="title">
    <choose>
      <if type="bill legislation" match="any">
        <!-- Statutes should be italicised, bill legislations should not. This test, however, doesn't work. For the moment, italicise everything. -->
        <!--  <choose>
	     <if type="statute"> -->
        <text variable="title" font-style="italic"/>
        <date variable="issued" font-style="italic">
          <date-part name="year" prefix=" "/>
        </date>
        <!--	  </if>
	    <else>
	    <text variable="title"/>
   	    <date variable="issued">
            <date-part name="year" prefix=" "/>
            </date>
	    </else>
	    </choose>-->
        <text variable="note" prefix=" (" suffix=")"/>
      </if>
      <else-if type="bill book graphic legal_case legislation motion_picture report song" match="any">
        <text variable="title" font-style="italic"/>
      </else-if>
      <else-if type="article-journal article-magazine article-newspaper broadcast interview manuscript map patent personal_communication song speech thesis webpage" match="any">
        <text variable="title" quotes="true"/>
      </else-if>
      <else-if type="legal_case">
        <text variable="title" font-style="italic"/>
      </else-if>
      <else>
        <text variable="title"/>
      </else>
    </choose>
  </macro>
  <macro name="event">
    <!-- this handles a bunch of events in form "(<name of even>, <location>, <full date>)" -->
    <group prefix="(" suffix=")">
      <!-- technically, this should have "Paper presented at the " or "Speech delivered at the", but that becomes too messy. -->
      <text variable="event" suffix=", "/>
      <text variable="event-place" suffix=", "/>
      <date variable="issued">
        <date-part name="day" suffix=" "/>
        <date-part name="month" suffix=" "/>
        <date-part name="year"/>
      </date>
    </group>
  </macro>
  <!-- link to online content, called in YYYYY -->
  <macro name="access">
    <choose>
      <if variable="URL">
        <text variable="URL" prefix=" &lt;" suffix="&gt;"/>
        <group prefix=" at ">
          <date variable="accessed">
            <date-part name="day" suffix=" "/>
            <date-part name="month" suffix=" "/>
            <date-part name="year"/>
          </date>
        </group>
      </if>
    </choose>
  </macro>
  <macro name="source">
    <!-- This macro seems really problematic, with a ton of redundancy. I'd move some of
	 the conditional logic into the appropriate macros (like 'title') and try to remove this
	 macro entirely. -->
    <choose>
      <if type="article-journal" match="any">
        <text variable="title" suffix=" " quotes="true"/>
        <text macro="volume-macro"/>
        <text macro="container"/>
        <text variable="page" prefix=" "/>
      </if>
      <else-if type="legal_case">
        <!-- I am using this to distinguish US cases from Australian ones; we don't list the court for Australian cases in AGLC -->
        <choose>
          <if variable="authority" match="none">
            <text variable="title" font-style="italic"/>
            <text macro="volume-macro"/>
            <text macro="container"/>
            <text variable="page" prefix=" "/>
            <text variable="locator" prefix=", "/>
          </if>
          <else>
            <text variable="title" suffix=","/>
            <text variable="volume" prefix=" "/>
            <text macro="container"/>
            <text variable="page" prefix=" "/>
            <text variable="locator" prefix=", "/>
            <group prefix=" (" suffix=")">
              <text variable="authority" suffix=", "/>
              <date variable="issued">
                <date-part name="year"/>
              </date>
            </group>
          </else>
        </choose>
      </else-if>
      <else-if type="interview">
        <group prefix=" (" suffix=")">
          <text variable="medium" suffix=", "/>
          <date variable="issued">
            <date-part name="day" suffix=" "/>
            <date-part name="month" suffix=" "/>
            <!--- DD mon YYYY -->
            <date-part name="year"/>
          </date>
        </group>
      </else-if>
      <else-if type="thesis">
        <text variable="title" font-style="italic"/>
        <group prefix=" (" suffix=")">
          <text variable="genre" suffix=", "/>
          <text variable="publisher" suffix=", "/>
          <date variable="issued">
            <date-part name="year"/>
          </date>
        </group>
      </else-if>
      <else-if type="speech">
        <text variable="title" quotes="true"/>
        <text macro="event" prefix=" "/>
      </else-if>
      <else-if type="article-newspaper article-magazine" match="any">
        <text variable="title" suffix=", " quotes="true"/>
        <text variable="volume" suffix=" "/>
        <text macro="container" suffix=", " font-style="italic"/>
        <text macro="issuance"/>
        <group>
          <text value="at" prefix=", "/>
          <text variable="page" prefix=" "/>
        </group>
      </else-if>
      <else-if type="chapter paper-conference" match="any">
        <text variable="title" suffix=", " quotes="true"/>
        <text macro="container" suffix=" "/>
        <text variable="publisher-place" prefix="(" suffix=": "/>
        <group delimiter=", " suffix=")">
          <text variable="publisher"/>
          <text macro="issuance"/>
        </group>
        <text variable="volume" prefix=" vol. "/>
        <text variable="page" prefix=" "/>
      </else-if>
      <else-if type="bill book graphic legal_case legislation motion_picture report song" match="any">
        <text variable="title" font-style="italic"/>
        <text macro="container" prefix=" "/>
        <text variable="publisher-place" prefix=" (" suffix=": "/>
        <group delimiter=", " suffix=")">
          <text variable="publisher"/>
          <text macro="issuance"/>
        </group>
        <text variable="volume" prefix=" vol. " suffix=" "/>
      </else-if>
      <else-if type="webpage">
        <text variable="title" font-style="italic"/>
        <text macro="issuance" prefix=" (" suffix=")"/>
        <text macro="container" prefix=" "/>
      </else-if>
      <else>
        <text variable="volume" suffix=" "/>
        <text variable="title" quotes="true"/>
        <text macro="container" prefix=" "/>
        <text macro="issuance" prefix=" (" suffix=")"/>
      </else>
    </choose>
  </macro>
  <macro name="issuance">
    <choose>
      <if type="article-journal article-magazine article-newspaper broadcast interview manuscript map patent personal_communication song speech thesis webpage" match="any">
        <group>
          <choose>
            <if type="article-newspaper thesis" match="any">
              <date variable="issued">
                <date-part name="day" suffix=" "/>
                <date-part name="month" suffix=" "/>
                <!--- DD mon YYYY -->
              </date>
            </if>
          </choose>
          <date variable="issued">
            <date-part name="year"/>
          </date>
        </group>
      </if>
      <else>
        <text variable="edition" suffix=" eds. "/>
        <date variable="issued">
          <date-part name="year"/>
        </date>
      </else>
    </choose>
  </macro>
  <!-- sets up citing to specific page numbers -->
  <macro name="at_page">
    <group>
      <text variable="locator"/>
    </group>
  </macro>
  <!-- sets up the "in" in front of book sections, etc. -->
  <macro name="container">
    <choose>
      <if type="chapter paper-conference" match="any">
        <group>
          <text term="in"/>
          <text macro="editor" prefix=" "/>
          <text variable="container-title" font-style="italic" prefix=" "/>
        </group>
      </if>
      <else-if type="legal_case">
        <text variable="container-title" form="short" prefix=" "/>
      </else-if>
      <else-if type="article-journal">
        <text variable="container-title" font-style="italic" prefix=" "/>
      </else-if>
      <else>
        <text variable="container-title"/>
      </else>
    </choose>
  </macro>
  <citation et-al-min="4" et-al-use-first="1">
    <layout suffix="." delimiter="; ">
      <choose>
        <!-- always cite legislation in full -->
        <if type="bill legislation" match="any">
          <text macro="title"/>
          <text macro="at_page"/>
        </if>
        <else-if position="ibid">
          <group delimiter=", ">
            <text value="ibidem" text-case="capitalize-first"/>
            <text macro="at_page"/>
          </group>
        </else-if>
        <else-if position="subsequent">
          <choose>
            <if type="legal_case">
              <text macro="author"/>
              <text macro="source"/>
              <text macro="access"/>
            </if>
            <else>
              <group delimiter=", ">
                <text macro="author-short"/>
                <choose>
                  <if disambiguate="true">
                    <text variable="title" form="short" prefix=" " quotes="true"/>
                  </if>
                </choose>
                <text variable="first-reference-note-number" prefix=" above n "/>
                <text macro="at_page"/>
              </group>
            </else>
          </choose>
        </else-if>
        <else>
          <!-- new citation -->
          <choose>
            <if type="legal_case">
              <text macro="author"/>
              <text macro="source"/>
              <text macro="access"/>
            </if>
            <else-if type="interview">
              <text macro="interviewer" suffix=" "/>
              <text value="Interview with "/>
              <text macro="author" suffix=" "/>
              <text macro="source"/>
              <text macro="at_page" prefix=", "/>
              <text macro="access"/>
            </else-if>
            <else>
              <text macro="author" suffix=", "/>
              <text macro="source"/>
              <text macro="at_page" prefix=", "/>
              <text macro="access"/>
            </else>
          </choose>
        </else>
      </choose>
    </layout>
  </citation>
</style>`

export const styles:{[key:string]:string} = {
  /*'harvard-cite-them-right':harvardstyle,
  'demo-style':basicStyle,
  'pensoft-style':pensoftStyle,
  'acta-amazonica':octaAmazonica,
  'ios-press-books':iosPressBooks,
  'university-of-zabol':universityOfZabol,
  'university-of-york-apa':universityOfYorkApa,
  'university-of-lincoln-harvard':universityOfLincolnHarvard,
  'university-of-york-harvard-environment':universityOfYorkHarvardEnvironment,
  'pisa-university-press':pisaUniversityPress,*/
}

export const styles1:{[key:string]:string} = {
  /*'harvard-cite-them-right':harvardstyle,
  'demo-style':basicStyle,
  'pensoft-style':pensoftStyle,
  'acta-amazonica':octaAmazonica,
  'ios-press-books':iosPressBooks,
  'university-of-zabol':universityOfZabol,
  'university-of-york-apa':universityOfYorkApa,
  'university-of-lincoln-harvard':universityOfLincolnHarvard,
  'university-of-york-harvard-environment':universityOfYorkHarvardEnvironment,
  'pisa-university-press':pisaUniversityPress,*/
}
