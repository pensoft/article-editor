export const materialStructure = {
  "categories": {
    "Occurrence": {
      "name": "Occurrence",
      "entries": [
        {
          "localName": "occurrenceID",
          "label": "Occurrence ID",
          "description": "An identifier for the Occurrence (as opposed to a particular digital record of the occurrence). In the absence of a persistent global unique identifier, construct one from a combination of identifiers in the record that will most closely make the occurrenceID globally unique.",
          "examples": "`http://arctos.database.museum/guid/MSB:Mamm:233627`, `000866d2-c177-4648-a200-ead4007051b9`, `urn:catalog:UWBM:Bird:89776`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/occurrenceID"
        },
        {
          "localName": "catalogNumber",
          "label": "Catalog Number",
          "description": "An identifier (preferably unique) for the record within the data set or collection.",
          "examples": "`145732`, `145732a`, `2008.1334`, `R-4313`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/catalogNumber"
        },
        {
          "localName": "recordNumber",
          "label": "Record Number",
          "description": "An identifier given to the Occurrence at the time it was recorded. Often serves as a link between field notes and an Occurrence record, such as a specimen collector's number.",
          "examples": "`OPP 7101`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/recordNumber"
        },
        {
          "localName": "recordedBy",
          "label": "Recorded By",
          "description": "A list (concatenated and separated) of names of people, groups, or organizations responsible for recording the original Occurrence. The primary collector or observer, especially one who applies a personal identifier (recordNumber), should be listed first.",
          "examples": "`José E. Crespo`. `Oliver P. Pearson | Anita K. Pearson` (where the value in recordNumber `OPP 7101` corresponds to the collector number for the specimen in the field catalog of Oliver P. Pearson).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/recordedBy"
        },
        {
          "localName": "recordedByID",
          "label": "Recorded By ID",
          "description": "A list (concatenated and separated) of the globally unique identifier for the person, people, groups, or organizations responsible for recording the original Occurrence.",
          "examples": "`https://orcid.org/0000-0002-1825-0097` (for an individual); `https://orcid.org/0000-0002-1825-0097 | https://orcid.org/0000-0002-1825-0098` (for a list of people).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/recordedByID"
        },
        {
          "localName": "individualCount",
          "label": "Individual Count",
          "description": "The number of individuals present at the time of the Occurrence.",
          "examples": "`0`, `1`, `25`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/individualCount"
        },
        {
          "localName": "organismQuantity",
          "label": "Organism Quantity",
          "description": "A number or enumeration value for the quantity of organisms.",
          "examples": "`27` (organismQuantity) with `individuals` (organismQuantityType). `12.5` (organismQuantity) with `% biomass` (organismQuantityType). `r` (organismQuantity) with `Braun Blanquet Scale` (organismQuantityType). `many` (organismQuantity) with `individuals` (organismQuantityType).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/organismQuantity"
        },
        {
          "localName": "organismQuantityType",
          "label": "Organism Quantity Type",
          "description": "The type of quantification system used for the quantity of organisms.",
          "examples": "`27` (organismQuantity) with `individuals` (organismQuantityType). `12.5` (organismQuantity) with `%biomass` (organismQuantityType). `r` (organismQuantity) with `BraunBlanquetScale` (organismQuantityType).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/organismQuantityType"
        },
        {
          "localName": "sex",
          "label": "Sex",
          "description": "The sex of the biological individual(s) represented in the Occurrence.",
          "examples": "`female`, `male`, `hermaphrodite`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/sex"
        },
        {
          "localName": "lifeStage",
          "label": "Life Stage",
          "description": "The age class or life stage of the Organism(s) at the time the Occurrence was recorded.",
          "examples": "`zygote`, `larva`, `juvenile`, `adult`, `seedling`, `flowering`, `fruiting`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/lifeStage"
        },
        {
          "localName": "reproductiveCondition",
          "label": "Reproductive Condition",
          "description": "The reproductive condition of the biological individual(s) represented in the Occurrence.",
          "examples": "`non-reproductive`, `pregnant`, `in bloom`, `fruit-bearing`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/reproductiveCondition"
        },
        {
          "localName": "behavior",
          "label": "Behavior",
          "description": "The behavior shown by the subject at the time the Occurrence was recorded.",
          "examples": "`roosting`, `foraging`, `running`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/behavior"
        },
        {
          "localName": "establishmentMeans",
          "label": "Establishment Means",
          "description": "Statement about whether an organism or organisms have been introduced to a given place and time through the direct or indirect activity of modern humans.",
          "examples": "`native`, `nativeReintroduced`, `introduced`, `introducedAssistedColonisation`, `vagrant`, `uncertain`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/establishmentMeans"
        },
        {
          "localName": "degreeOfEstablishment",
          "label": "Degree of Establishment",
          "description": "The degree to which an Organism survives, reproduces, and expands its range at the given place and time.",
          "examples": "`native`, `captive`, `cultivated`, `released`, `failing`, `casual`, `reproducing`, `established`, `colonising`, `invasive`, `widespreadInvasive`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/degreeOfEstablishment"
        },
        {
          "localName": "pathway",
          "label": "Pathway",
          "description": "The process by which an Organism came to be in a given place at a given time.",
          "examples": "`releasedForUse`, `otherEscape`, `transportContaminant`, `transportStowaway`, `corridor`, `unaided`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/pathway"
        },
        {
          "localName": "georeferenceVerificationStatus",
          "label": "Georeference Verification Status",
          "description": "A categorical description of the extent to which the georeference has been verified to represent the best possible spatial description for the Location of the Occurrence.",
          "examples": "`unable to georeference`, `requires georeference`, `requires verification`, `verified by data custodian`, `verified by contributor`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/georeferenceVerificationStatus"
        },
        {
          "localName": "occurrenceStatus",
          "label": "Occurrence Status",
          "description": "A statement about the presence or absence of a Taxon at a Location.",
          "examples": "`present`, `absent`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/occurrenceStatus"
        },
        {
          "localName": "preparations",
          "label": "Preparations",
          "description": "A list (concatenated and separated) of preparations and preservation methods for a specimen.",
          "examples": "`fossil`, `cast`, `photograph`, `DNA extract`, `skin | skull | skeleton`, `whole animal (ETOH) | tissue (EDTA)`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/preparations"
        },
        {
          "localName": "disposition",
          "label": "Disposition",
          "description": "The current state of a specimen with respect to the collection identified in collectionCode or collectionID.",
          "examples": "`in collection`, `missing`, `voucher elsewhere`, `duplicates elsewhere`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/disposition"
        },
        {
          "localName": "associatedMedia",
          "label": "Associated Media",
          "description": "A list (concatenated and separated) of identifiers (publication, global unique identifier, URI) of media associated with the Occurrence.",
          "examples": "`https://arctos.database.museum/media/10520962 | https://arctos.database.museum/media/10520964`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/associatedMedia"
        },
        {
          "localName": "associatedOccurrences",
          "label": "Associated Occurrences",
          "description": "A list (concatenated and separated) of identifiers of other Occurrence records and their associations to this Occurrence.",
          "examples": "`\"parasite collected from\":\"https://arctos.database.museum/guid/MSB:Mamm:215895?seid=950760\"`, `\"encounter previous to\":\"http://arctos.database.museum/guid/MSB:Mamm:292063?seid=3175067\" | \"encounter previous to\":\"http://arctos.database.museum/guid/MSB:Mamm:292063?seid=3177393\" | \"encounter previous to\":\"http://arctos.database.museum/guid/MSB:Mamm:292063?seid=3177394\" | \"encounter previous to\":\"http://arctos.database.museum/guid/MSB:Mamm:292063?seid=3177392\" | \"encounter previous to\":\"http://arctos.database.museum/guid/MSB:Mamm:292063?seid=3609139\"`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/associatedOccurrences"
        },
        {
          "localName": "associatedReferences",
          "label": "Associated References",
          "description": "A list (concatenated and separated) of identifiers (publication, bibliographic reference, global unique identifier, URI) of literature associated with the Occurrence.",
          "examples": "`http://www.sciencemag.org/cgi/content/abstract/322/5899/261`, `Christopher J. Conroy, Jennifer L. Neuwald. 2008. Phylogeographic study of the California vole, Microtus californicus Journal of Mammalogy, 89(3):755-767.`, `Steven R. Hoofer and Ronald A. Van Den Bussche. 2001. Phylogenetic Relationships of Plecotine Bats and Allies Based on Mitochondrial Ribosomal Sequences. Journal of Mammalogy 82(1):131-137. | Walker, Faith M., Jeffrey T. Foster, Kevin P. Drees, Carol L. Chambers. 2014. Spotted bat (Euderma maculatum) microsatellite discovery using illumina sequencing. Conservation Genetics Resources.`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/associatedReferences"
        },
        {
          "localName": "associatedSequences",
          "label": "Associated Sequences",
          "description": "A list (concatenated and separated) of identifiers (publication, global unique identifier, URI) of genetic sequence information associated with the Occurrence.",
          "examples": "`http://www.ncbi.nlm.nih.gov/nuccore/U34853.1`, `http://www.ncbi.nlm.nih.gov/nuccore/GU328060 | http://www.ncbi.nlm.nih.gov/nuccore/AF326093`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/associatedSequences"
        },
        {
          "localName": "associatedTaxa",
          "label": "Associated Taxa",
          "description": "A list (concatenated and separated) of identifiers or names of taxa and the associations of this Occurrence to each of them.",
          "examples": "`\"host\":\"Quercus alba\"`, `\"host\":\"gbif.org/species/2879737\"`,`\"parasitoid of\":\"Cyclocephala signaticollis\" | \"predator of\":\"Apis mellifera\"`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/associatedTaxa"
        },
        {
          "localName": "otherCatalogNumbers",
          "label": "Other Catalog Numbers",
          "description": "A list (concatenated and separated) of previous or alternate fully qualified catalog numbers or other human-used identifiers for the same Occurrence, whether in the current or any other data set or collection.",
          "examples": "`FMNH:Mammal:1234`, `NPS YELLO6778 | MBG 33424`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/otherCatalogNumbers"
        },
        {
          "localName": "occurrenceRemarks",
          "label": "Occurrence Remarks",
          "description": "Comments or notes about the Occurrence.",
          "examples": "`found dead on road`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Occurrence",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/occurrenceRemarks"
        }
      ],
      "label": "Occurrence",
      "iri": "http://rs.tdwg.org/dwc/terms/Occurrence"
    },
    "Organism": {
      "name": "Organism",
      "entries": [
        {
          "localName": "organismID",
          "label": "Organism ID",
          "description": "An identifier for the Organism instance (as opposed to a particular digital record of the Organism). May be a globally unique identifier or an identifier specific to the data set.",
          "examples": "`http://arctos.database.museum/guid/WNMU:Mamm:1249`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Organism",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/organismID"
        },
        {
          "localName": "organismName",
          "label": "Organism Name",
          "description": "A textual name or label assigned to an Organism instance.",
          "examples": "`Huberta`, `Boab Prison Tree`, `J pod`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Organism",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/organismName"
        },
        {
          "localName": "organismScope",
          "label": "Organism Scope",
          "description": "A description of the kind of Organism instance. Can be used to indicate whether the Organism instance represents a discrete organism or if it represents a particular type of aggregation.",
          "examples": "`multicellular organism`, `virus`, `clone`, `pack`, `colony`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Organism",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/organismScope"
        },
        {
          "localName": "associatedOrganisms",
          "label": "Associated Organisms",
          "description": "A list (concatenated and separated) of identifiers of other Organisms and the associations of this Organism to each of them.",
          "examples": "`\"sibling of\":\"http://arctos.database.museum/guid/DMNS:Mamm:14171\"`, `\"parent of\":\"http://arctos.database.museum/guid/MSB:Mamm:196208\" | \"parent of\":\"http://arctos.database.museum/guid/MSB:Mamm:196523\" | \"sibling of\":\"http://arctos.database.museum/guid/MSB:Mamm:142638\"`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Organism",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/associatedOrganisms"
        },
        {
          "localName": "previousIdentifications",
          "label": "Previous Identifications",
          "description": "A list (concatenated and separated) of previous assignments of names to the Organism.",
          "examples": "`Chalepidae`, `Pinus abies`, `Anthus sp., field ID by G. Iglesias | Anthus correndera, expert ID by C. Cicero 2009-02-12 based on morphology`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Organism",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/previousIdentifications"
        },
        {
          "localName": "organismRemarks",
          "label": "Organism Remarks",
          "description": "Comments or notes about the Organism instance.",
          "examples": "`One of a litter of six`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Organism",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/organismRemarks"
        }
      ],
      "label": "Organism",
      "iri": "http://rs.tdwg.org/dwc/terms/Organism"
    },
    "MaterialSample": {
      "name": "MaterialSample",
      "entries": [
        {
          "localName": "materialSampleID",
          "label": "Material Sample ID",
          "description": "An identifier for the MaterialSample (as opposed to a particular digital record of the material sample). In the absence of a persistent global unique identifier, construct one from a combination of identifiers in the record that will most closely make the materialSampleID globally unique.",
          "examples": "`06809dc5-f143-459a-be1a-6f03e63fc083`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/MaterialSample",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/materialSampleID"
        }
      ],
      "label": "Material Sample",
      "iri": "http://rs.tdwg.org/dwc/terms/MaterialSample"
    },
    "Event": {
      "name": "Event",
      "entries": [
        {
          "localName": "eventID",
          "label": "Event ID",
          "description": "An identifier for the set of information associated with an Event (something that occurs at a place and time). May be a global unique identifier or an identifier specific to the data set.",
          "examples": "`INBO:VIS:Ev:00009375`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/eventID"
        },
        {
          "localName": "parentEventID",
          "label": "Parent Event ID",
          "description": "An identifier for the broader Event that groups this and potentially other Events.",
          "examples": "`A1` (parentEventID to identify the main Whittaker Plot in nested samples, each with its own eventID - `A1:1`, `A1:2`).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/parentEventID"
        },
        {
          "localName": "fieldNumber",
          "label": "Field Number",
          "description": "An identifier given to the event in the field. Often serves as a link between field notes and the Event.",
          "examples": "`RV Sol 87-03-08`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/fieldNumber"
        },
        {
          "localName": "eventDate",
          "label": "Event Date",
          "description": "The date-time or interval during which an Event occurred. For occurrences, this is the date-time when the event was recorded. Not suitable for a time in a geological context.",
          "examples": "`1963-03-08T14:07-0600` (8 Mar 1963 at 2:07pm in the time zone six hours earlier than UTC). `2009-02-20T08:40Z` (20 February 2009 8:40am UTC). `2018-08-29T15:19` (3:19pm local time on 29 August 2018). `1809-02-12` (some time during 12 February 1809). `1906-06` (some time in June 1906). `1971` (some time in the year 1971). `2007-03-01T13:00:00Z/2008-05-11T15:30:00Z` (some time during the interval between 1 March 2007 1pm UTC and 11 May 2008 3:30pm UTC). `1900/1909` (some time during the interval between the beginning of the year 1900 and the end of the year 1909). `2007-11-13/15` (some time in the interval between 13 November 2007 and 15 November 2007).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/eventDate"
        },
        {
          "localName": "eventTime",
          "label": "Event Time",
          "description": "The time or interval during which an Event occurred.",
          "examples": "`14:07-0600` (2:07pm in the time zone six hours earlier than UTC). `08:40:21Z` (8:40:21am UTC). `13:00:00Z/15:30:00Z` (the interval between 1pm UTC and 3:30pm UTC).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/eventTime"
        },
        {
          "localName": "startDayOfYear",
          "label": "Start Day Of Year",
          "description": "The earliest integer day of the year on which the Event occurred (1 for January 1, 365 for December 31, except in a leap year, in which case it is 366).",
          "examples": "`1` (1 January). `366` (31 December), `365` (30 December in a leap year, 31 December in a non-leap year).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/startDayOfYear"
        },
        {
          "localName": "endDayOfYear",
          "label": "End Day Of Year",
          "description": "The latest integer day of the year on which the Event occurred (1 for January 1, 365 for December 31, except in a leap year, in which case it is 366).",
          "examples": "`1` (1 January). `32` (1 February). `366` (31 December). `365` (30 December in a leap year, 31 December in a non-leap year).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/endDayOfYear"
        },
        {
          "localName": "year",
          "label": "Year",
          "description": "The four-digit year in which the Event occurred, according to the Common Era Calendar.",
          "examples": "`1160`, `2008`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/year"
        },
        {
          "localName": "month",
          "label": "Month",
          "description": "The integer month in which the Event occurred.",
          "examples": "`1` (January). `10` (October).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/month"
        },
        {
          "localName": "day",
          "label": "Day",
          "description": "The integer day of the month on which the Event occurred.",
          "examples": "`9`, `28`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/day"
        },
        {
          "localName": "verbatimEventDate",
          "label": "Verbatim EventDate",
          "description": "The verbatim original representation of the date and time information for an Event.",
          "examples": "`spring 1910`, `Marzo 2002`, `1999-03-XX`, `17IV1934`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/verbatimEventDate"
        },
        {
          "localName": "habitat",
          "label": "Habitat",
          "description": "A category or description of the habitat in which the Event occurred.",
          "examples": "`oak savanna`, `pre-cordilleran steppe`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/habitat"
        },
        {
          "localName": "samplingProtocol",
          "label": "Sampling Protocol",
          "description": "The names of, references to, or descriptions of the methods or protocols used during an Event.",
          "examples": "`UV light trap`, `mist net`, `bottom trawl`, `ad hoc observation | point count`, `Penguins from space: faecal stains reveal the location of emperor penguin colonies, https://doi.org/10.1111/j.1466-8238.2009.00467.x`, `Takats et al. 2001. Guidelines for Nocturnal Owl Monitoring in North America. Beaverhill Bird Observatory and Bird Studies Canada, Edmonton, Alberta. 32 pp., http://www.bsc-eoc.org/download/Owl.pdf`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/samplingProtocol"
        },
        {
          "localName": "sampleSizeValue",
          "label": "Sample Size Value",
          "description": "A numeric value for a measurement of the size (time duration, length, area, or volume) of a sample in a sampling event.",
          "examples": "`5` for sampleSizeValue with `metre` for sampleSizeUnit.",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/sampleSizeValue"
        },
        {
          "localName": "sampleSizeUnit",
          "label": "Sample Size Unit",
          "description": "The unit of measurement of the size (time duration, length, area, or volume) of a sample in a sampling event.",
          "examples": "`minute`, `hour`, `day`, `metre`, `square metre`, `cubic metre`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/sampleSizeUnit"
        },
        {
          "localName": "samplingEffort",
          "label": "Sampling Effort",
          "description": "The amount of effort expended during an Event.",
          "examples": "`40 trap-nights`, `10 observer-hours`, `10 km by foot`, `30 km by car`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/samplingEffort"
        },
        {
          "localName": "fieldNotes",
          "label": "Field Notes",
          "description": "One of a) an indicator of the existence of, b) a reference to (publication, URI), or c) the text of notes taken in the field about the Event.",
          "examples": "`Notes available in the Grinnell-Miller Library.`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/fieldNotes"
        },
        {
          "localName": "eventRemarks",
          "label": "Event Remarks",
          "description": "Comments or notes about the Event.",
          "examples": "`After the recent rains the river is nearly at flood stage.`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Event",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/eventRemarks"
        }
      ],
      "label": "Event",
      "iri": "http://rs.tdwg.org/dwc/terms/Event"
    },
    "GeologicalContext": {
      "name": "GeologicalContext",
      "entries": [
        {
          "localName": "geologicalContextID",
          "label": "Geological Context ID",
          "description": "An identifier for the set of information associated with a GeologicalContext (the location within a geological context, such as stratigraphy). May be a global unique identifier or an identifier specific to the data set.",
          "examples": "`https://opencontext.org/subjects/e54377f7-4452-4315-b676-40679b10c4d9`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/geologicalContextID"
        },
        {
          "localName": "earliestEonOrLowestEonothem",
          "label": "Earliest Eon Or Lowest Eonothem",
          "description": "The full name of the earliest possible geochronologic eon or lowest chrono-stratigraphic eonothem or the informal name (\"Precambrian\") attributable to the stratigraphic horizon from which the cataloged item was collected.",
          "examples": "`Phanerozoic`, `Proterozoic`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/earliestEonOrLowestEonothem"
        },
        {
          "localName": "latestEonOrHighestEonothem",
          "label": "Latest Eon Or Highest Eonothem",
          "description": "The full name of the latest possible geochronologic eon or highest chrono-stratigraphic eonothem or the informal name (\"Precambrian\") attributable to the stratigraphic horizon from which the cataloged item was collected.",
          "examples": "`Phanerozoic`, `Proterozoic`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/latestEonOrHighestEonothem"
        },
        {
          "localName": "earliestEraOrLowestErathem",
          "label": "Earliest Era Or Lowest Erathem",
          "description": "The full name of the earliest possible geochronologic era or lowest chronostratigraphic erathem attributable to the stratigraphic horizon from which the cataloged item was collected.",
          "examples": "`Cenozoic`, `Mesozoic`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/earliestEraOrLowestErathem"
        },
        {
          "localName": "latestEraOrHighestErathem",
          "label": "Latest Era Or Highest Erathem",
          "description": "The full name of the latest possible geochronologic era or highest chronostratigraphic erathem attributable to the stratigraphic horizon from which the cataloged item was collected.",
          "examples": "`Cenozoic`, `Mesozoic`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/latestEraOrHighestErathem"
        },
        {
          "localName": "earliestPeriodOrLowestSystem",
          "label": "Earliest Period Or Lowest System",
          "description": "The full name of the earliest possible geochronologic period or lowest chronostratigraphic system attributable to the stratigraphic horizon from which the cataloged item was collected.",
          "examples": "`Neogene`, `Tertiary`, `Quaternary`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/earliestPeriodOrLowestSystem"
        },
        {
          "localName": "latestPeriodOrHighestSystem",
          "label": "Latest Period Or Highest System",
          "description": "The full name of the latest possible geochronologic period or highest chronostratigraphic system attributable to the stratigraphic horizon from which the cataloged item was collected.",
          "examples": "`Neogene`, `Tertiary`, `Quaternary`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/latestPeriodOrHighestSystem"
        },
        {
          "localName": "earliestEpochOrLowestSeries",
          "label": "Earliest Epoch Or Lowest Series",
          "description": "The full name of the earliest possible geochronologic epoch or lowest chronostratigraphic series attributable to the stratigraphic horizon from which the cataloged item was collected.",
          "examples": "`Holocene`, `Pleistocene`, `Ibexian Series`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/earliestEpochOrLowestSeries"
        },
        {
          "localName": "latestEpochOrHighestSeries",
          "label": "Latest Epoch Or Highest Series",
          "description": "The full name of the latest possible geochronologic epoch or highest chronostratigraphic series attributable to the stratigraphic horizon from which the cataloged item was collected.",
          "examples": "`Holocene`, `Pleistocene`, `Ibexian Series`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/latestEpochOrHighestSeries"
        },
        {
          "localName": "earliestAgeOrLowestStage",
          "label": "Earliest Age Or Lowest Stage",
          "description": "The full name of the earliest possible geochronologic age or lowest chronostratigraphic stage attributable to the stratigraphic horizon from which the cataloged item was collected.",
          "examples": "`Atlantic`, `Boreal`, `Skullrockian`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/earliestAgeOrLowestStage"
        },
        {
          "localName": "latestAgeOrHighestStage",
          "label": "Latest AgeOr Highest Stage",
          "description": "The full name of the latest possible geochronologic age or highest chronostratigraphic stage attributable to the stratigraphic horizon from which the cataloged item was collected.",
          "examples": "`Atlantic`, `Boreal`, `Skullrockian`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/latestAgeOrHighestStage"
        },
        {
          "localName": "lowestBiostratigraphicZone",
          "label": "Lowest Biostratigraphic Zone",
          "description": "The full name of the lowest possible geological biostratigraphic zone of the stratigraphic horizon from which the cataloged item was collected.",
          "examples": "`Maastrichtian`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/lowestBiostratigraphicZone"
        },
        {
          "localName": "highestBiostratigraphicZone",
          "label": "Highest Biostratigraphic Zone",
          "description": "The full name of the highest possible geological biostratigraphic zone of the stratigraphic horizon from which the cataloged item was collected.",
          "examples": "`Blancan`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/highestBiostratigraphicZone"
        },
        {
          "localName": "lithostratigraphicTerms",
          "label": "Lithostratigraphic Terms",
          "description": "The combination of all litho-stratigraphic names for the rock from which the cataloged item was collected.",
          "examples": "`Pleistocene-Weichselien`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/lithostratigraphicTerms"
        },
        {
          "localName": "group",
          "label": "Group",
          "description": "The full name of the lithostratigraphic group from which the cataloged item was collected.",
          "examples": "`Bathurst`, `Lower Wealden`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/group"
        },
        {
          "localName": "formation",
          "label": "Formation",
          "description": "The full name of the lithostratigraphic formation from which the cataloged item was collected.",
          "examples": "`Notch Peak Formation`, `House Limestone`, `Fillmore Formation`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/formation"
        },
        {
          "localName": "member",
          "label": "Member",
          "description": "The full name of the lithostratigraphic member from which the cataloged item was collected.",
          "examples": "`Lava Dam Member`, `Hellnmaria Member`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/member"
        },
        {
          "localName": "bed",
          "label": "Bed",
          "description": "The full name of the lithostratigraphic bed from which the cataloged item was collected.",
          "examples": "`Harlem coal`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/GeologicalContext",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/bed"
        }
      ],
      "label": "Geological Context",
      "iri": "http://rs.tdwg.org/dwc/terms/GeologicalContext"
    },
    "Identification": {
      "name": "Identification",
      "entries": [
        {
          "localName": "identificationID",
          "label": "Identification ID",
          "description": "An identifier for the Identification (the body of information associated with the assignment of a scientific name). May be a global unique identifier or an identifier specific to the data set.",
          "examples": "`9992`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Identification",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/identificationID"
        },
        {
          "localName": "verbatimIdentification",
          "label": "Verbatim Identification",
          "description": "A string representing the taxonomic identification as it appeared in the original record.",
          "examples": "`Peromyscus sp.`, `Ministrymon sp. nov. 1`, `Anser anser X Branta canadensis`, `Pachyporidae?`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Identification",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/verbatimIdentification"
        },
        {
          "localName": "identificationQualifier",
          "label": "Identification Qualifier",
          "description": "A brief phrase or a standard term (\"cf.\", \"aff.\") to express the determiner's doubts about the Identification.",
          "examples": "`aff. agrifolia var. oxyadenia` (for `Quercus aff. agrifolia var. oxyadenia` with accompanying values `Quercus` in genus, `agrifolia`  in specificEpithet, `oxyadenia`  in infraspecificEpithet, and `var.` in taxonRank. `cf. var. oxyadenia` for `Quercus agrifolia cf. var. oxyadenia` with accompanying values `Quercus` in genus, `agrifolia` in specificEpithet, `oxyadenia` in infraspecificEpithet, and `var.` in taxonRank.",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Identification",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/identificationQualifier"
        },
        {
          "localName": "typeStatus",
          "label": "Type Status",
          "description": "A list (concatenated and separated) of nomenclatural types (type status, typified scientific name, publication) applied to the subject.",
          "examples": "`holotype of Ctenomys sociabilis. Pearson O. P., and M. I. Christie. 1985. Historia Natural, 5(37):388`, `holotype of Pinus abies | holotype of Picea abies`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Identification",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/typeStatus"
        },
        {
          "localName": "identifiedBy",
          "label": "Identified By",
          "description": "A list (concatenated and separated) of names of people, groups, or organizations who assigned the Taxon to the subject.",
          "examples": "`James L. Patton`, `Theodore Pappenfuss | Robert Macey`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Identification",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/identifiedBy"
        },
        {
          "localName": "identifiedByID",
          "label": "Identified By ID",
          "description": "A list (concatenated and separated) of the globally unique identifier for the person, people, groups, or organizations responsible for assigning the Taxon to the subject.",
          "examples": "`https://orcid.org/0000-0002-1825-0097` (for an individual), `https://orcid.org/0000-0002-1825-0097 | https://orcid.org/0000-0002-1825-0098` (for a list of people).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Identification",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/identifiedByID"
        },
        {
          "localName": "dateIdentified",
          "label": "Date Identified",
          "description": "The date on which the subject was determined as representing the Taxon.",
          "examples": "`1963-03-08T14:07-0600` (8 Mar 1963 at 2:07pm in the time zone six hours earlier than UTC). `2009-02-20T08:40Z` (20 February 2009 8:40am UTC). `2018-08-29T15:19` (3:19pm local time on 29 August 2018). `1809-02-12` (some time during 12 February 1809). `1906-06` (some time in June 1906). `1971` (some time in the year 1971). `2007-03-01T13:00:00Z/2008-05-11T15:30:00Z` (some time during the interval between 1 March 2007 1pm UTC and 11 May 2008 3:30pm UTC). `1900/1909` (some time during the interval between the beginning of the year 1900 and the end of the year 1909). `2007-11-13/15` (some time in the interval between 13 November 2007 and 15 November 2007).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Identification",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/dateIdentified"
        },
        {
          "localName": "identificationReferences",
          "label": "Identification References",
          "description": "A list (concatenated and separated) of references (publication, global unique identifier, URI) used in the Identification.",
          "examples": "`Aves del Noroeste Patagonico. Christie et al. 2004.`, `Stebbins, R. Field Guide to Western Reptiles and Amphibians. 3rd Edition. 2003. | Irschick, D.J. and Shaffer, H.B. (1997). The polytypic species revisited: Morphological differentiation among tiger salamanders (Ambystoma tigrinum) (Amphibia: Caudata). Herpetologica, 53(1), 30-49.`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Identification",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/identificationReferences"
        },
        {
          "localName": "identificationVerificationStatus",
          "label": "Identification Verification Status",
          "description": "A categorical indicator of the extent to which the taxonomic identification has been verified to be correct.",
          "examples": "`0` (\"unverified\" in HISPID/ABCD).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Identification",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/identificationVerificationStatus"
        },
        {
          "localName": "identificationRemarks",
          "label": "Identification Remarks",
          "description": "Comments or notes about the Identification.",
          "examples": "`Distinguished between Anthus correndera and Anthus hellmayri based on the comparative lengths of the uñas.`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Identification",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/identificationRemarks"
        }
      ],
      "label": "Identification",
      "iri": "http://rs.tdwg.org/dwc/terms/Identification"
    },
    "Taxon": {
      "name": "Taxon",
      "entries": [
        {
          "localName": "taxonID",
          "label": "Taxon ID",
          "description": "An identifier for the set of taxon information (data associated with the Taxon class). May be a global unique identifier or an identifier specific to the data set.",
          "examples": "`8fa58e08-08de-4ac1-b69c-1235340b7001`, `32567`, `https://www.gbif.org/species/212`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/taxonID"
        },
        {
          "localName": "scientificNameID",
          "label": "Scientific Name ID",
          "description": "An identifier for the nomenclatural (not taxonomic) details of a scientific name.",
          "examples": "`urn:lsid:ipni.org:names:37829-1:1.3`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/scientificNameID"
        },
        {
          "localName": "acceptedNameUsageID",
          "label": "Accepted Name Usage ID",
          "description": "An identifier for the name usage (documented meaning of the name according to a source) of the currently valid (zoological) or accepted (botanical) taxon.",
          "examples": "`tsn:41107` (ITIS), `urn:lsid:ipni.org:names:320035-2` (IPNI), `2704179` (GBIF), `6W3C4` (COL)",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/acceptedNameUsageID"
        },
        {
          "localName": "parentNameUsageID",
          "label": "Parent Name Usage ID",
          "description": "An identifier for the name usage (documented meaning of the name according to a source) of the direct, most proximate higher-rank parent taxon (in a classification) of the most specific element of the scientificName.",
          "examples": "`tsn:41074` (ITIS), `urn:lsid:ipni.org:names:30001404-2` (IPNI), `2704173` (GBIF), `6T8N` (COL)",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/parentNameUsageID"
        },
        {
          "localName": "originalNameUsageID",
          "label": "Original Name Usage ID",
          "description": "An identifier for the name usage (documented meaning of the name according to a source) in which the terminal element of the scientificName was originally established under the rules of the associated nomenclaturalCode.",
          "examples": "`tsn:41107` (ITIS), `urn:lsid:ipni.org:names:320035-2` (IPNI), `2704179` (GBIF), `6W3C4` (COL)",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/originalNameUsageID"
        },
        {
          "localName": "nameAccordingToID",
          "label": "Name According To ID",
          "description": "An identifier for the source in which the specific taxon concept circumscription is defined or implied. See nameAccordingTo.",
          "examples": "`https://doi.org/10.1016/S0269-915X(97)80026-2`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/nameAccordingToID"
        },
        {
          "localName": "namePublishedInID",
          "label": "Name Published In ID",
          "description": "An identifier for the publication in which the scientificName was originally established under the rules of the associated nomenclaturalCode.",
          "examples": "",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/namePublishedInID"
        },
        {
          "localName": "taxonConceptID",
          "label": "Taxon Concept ID",
          "description": "An identifier for the taxonomic concept to which the record refers - not for the nomenclatural details of a taxon.",
          "examples": "`8fa58e08-08de-4ac1-b69c-1235340b7001`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/taxonConceptID"
        },
        {
          "localName": "scientificName",
          "label": "Scientific Name",
          "description": "The full scientific name, with authorship and date information if known. When forming part of an Identification, this should be the name in lowest level taxonomic rank that can be determined. This term should not contain identification qualifications, which should instead be supplied in the IdentificationQualifier term.",
          "examples": "`Coleoptera` (order). `Vespertilionidae` (family). `Manis` (genus). `Ctenomys sociabilis` (genus + specificEpithet). `Ambystoma tigrinum diaboli` (genus + specificEpithet + infraspecificEpithet). `Roptrocerus typographi (Györfi, 1952)` (genus + specificEpithet + scientificNameAuthorship), `Quercus agrifolia var. oxyadenia (Torr.) J.T. Howell` (genus + specificEpithet + taxonRank + infraspecificEpithet + scientificNameAuthorship).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/scientificName"
        },
        {
          "localName": "acceptedNameUsage",
          "label": "Accepted Name Usage",
          "description": "The full name, with authorship and date information if known, of the currently valid (zoological) or accepted (botanical) taxon.",
          "examples": "`Tamias minimus` (valid name for Eutamias minimus).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/acceptedNameUsage"
        },
        {
          "localName": "parentNameUsage",
          "label": "Parent Name Usage",
          "description": "The full name, with authorship and date information if known, of the direct, most proximate higher-rank parent taxon (in a classification) of the most specific element of the scientificName.",
          "examples": "`Rubiaceae`, `Gruiformes`, `Testudinae`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/parentNameUsage"
        },
        {
          "localName": "originalNameUsage",
          "label": "Original Name Usage",
          "description": "The taxon name, with authorship and date information if known, as it originally appeared when first established under the rules of the associated nomenclaturalCode. The basionym (botany) or basonym (bacteriology) of the scientificName or the senior/earlier homonym for replaced names.",
          "examples": "`Pinus abies`, `Gasterosteus saltatrix Linnaeus 1768`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/originalNameUsage"
        },
        {
          "localName": "nameAccordingTo",
          "label": "Name According To",
          "description": "The reference to the source in which the specific taxon concept circumscription is defined or implied - traditionally signified by the Latin \"sensu\" or \"sec.\" (from secundum, meaning \"according to\"). For taxa that result from identifications, a reference to the keys, monographs, experts and other sources should be given.",
          "examples": "`Franz NM, Cardona-Duque J (2013) Description of two new species and phylogenetic reassessment of Perelleschus Wibmer & O’Brien, 1986 (Coleoptera: Curculionidae), with a complete taxonomic concept history of Perelleschus sec. Franz & Cardona-Duque, 2013. Syst Biodivers. 11: 209–236.` (as the full citation of the Franz & Cardona-Duque (2013) in Perelleschus splendida sec. Franz & Cardona-Duque (2013))",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/nameAccordingTo"
        },
        {
          "localName": "namePublishedIn",
          "label": "Name Published In",
          "description": "A reference for the publication in which the scientificName was originally established under the rules of the associated nomenclaturalCode.",
          "examples": "`Pearson O. P., and M. I. Christie. 1985. Historia Natural, 5(37):388`, `Forel, Auguste, Diagnosies provisoires de quelques espèces nouvelles de fourmis de Madagascar, récoltées par M. Grandidier., Annales de la Societe Entomologique de Belgique, Comptes-rendus des Seances 30, 1886`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/namePublishedIn"
        },
        {
          "localName": "namePublishedInYear",
          "label": "Name Published In Year",
          "description": "The four-digit year in which the scientificName was published.",
          "examples": "`1915`, `2008`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/namePublishedInYear"
        },
        {
          "localName": "higherClassification",
          "label": "Higher Classification",
          "description": "A list (concatenated and separated) of taxa names terminating at the rank immediately superior to the taxon referenced in the taxon record.",
          "examples": "`Plantae | Tracheophyta | Magnoliopsida | Ranunculales | Ranunculaceae | Ranunculus`, `Animalia`, `Animalia | Chordata | Vertebrata | Mammalia | Theria | Eutheria | Rodentia | Hystricognatha | Hystricognathi | Ctenomyidae | Ctenomyini | Ctenomys`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/higherClassification"
        },
        {
          "localName": "kingdom",
          "label": "Kingdom",
          "description": "The full scientific name of the kingdom in which the taxon is classified.",
          "examples": "`Animalia`, `Archaea`, `Bacteria`, `Chromista`, `Fungi`, `Plantae`, `Protozoa`, `Viruses`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/kingdom"
        },
        {
          "localName": "phylum",
          "label": "Phylum",
          "description": "The full scientific name of the phylum or division in which the taxon is classified.",
          "examples": "`Chordata` (phylum). `Bryophyta` (division).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/phylum"
        },
        {
          "localName": "class",
          "label": "Class",
          "description": "The full scientific name of the class in which the taxon is classified.",
          "examples": "`Mammalia`, `Hepaticopsida`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/class"
        },
        {
          "localName": "order",
          "label": "Order",
          "description": "The full scientific name of the order in which the taxon is classified.",
          "examples": "`Carnivora`, `Monocleales`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/order"
        },
        {
          "localName": "family",
          "label": "Family",
          "description": "The full scientific name of the family in which the taxon is classified.",
          "examples": "`Felidae`, `Monocleaceae`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/family"
        },
        {
          "localName": "subfamily",
          "label": "Subfamily",
          "description": "The full scientific name of the subfamily in which the taxon is classified.",
          "examples": "`Periptyctinae`, `Orchidoideae`, `Sphindociinae`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/subfamily"
        },
        {
          "localName": "genus",
          "label": "Genus",
          "description": "The full scientific name of the genus in which the taxon is classified.",
          "examples": "`Puma`, `Monoclea`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/genus"
        },
        {
          "localName": "genericName",
          "label": "Generic Name",
          "description": "The genus part of the scientificName without authorship.",
          "examples": "`Felis` (for scientificName \"Felis concolor\", with accompanying values of \"Puma concolor\" in acceptedNameUsage and \"Puma\" in genus).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/genericName"
        },
        {
          "localName": "subgenus",
          "label": "Subgenus",
          "description": "The full scientific name of the subgenus in which the taxon is classified. Values should include the genus to avoid homonym confusion.",
          "examples": "`Strobus`, `Amerigo`, `Pilosella`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/subgenus"
        },
        {
          "localName": "infragenericEpithet",
          "label": "Infrageneric Epithet",
          "description": "The infrageneric part of a binomial name at ranks above species but below genus.",
          "examples": "`Abacetillus` (for scientificName \"Abacetus (Abacetillus) ambiguus\", `Cracca` (for scientificName \"Vicia sect. Cracca\")",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/infragenericEpithet"
        },
        {
          "localName": "specificEpithet",
          "label": "Specific Epithet",
          "description": "The name of the first or species epithet of the scientificName.",
          "examples": "`concolor`, `gottschei`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/specificEpithet"
        },
        {
          "localName": "infraspecificEpithet",
          "label": "Infraspecific Epithet",
          "description": "The name of the lowest or terminal infraspecific epithet of the scientificName, excluding any rank designation.",
          "examples": "`concolor` (for scientificName \"Puma concolor concolor\"), `oxyadenia` (for scientificName \"Quercus agrifolia var. oxyadenia\"), `laxa` (for scientificName \"Cheilanthes hirta f. laxa\"), `scaberrima` (for scientificName \"Indigofera charlieriana var. scaberrima\").",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/infraspecificEpithet"
        },
        {
          "localName": "cultivarEpithet",
          "label": "Cultivar Epithet",
          "description": "Part of the name of a cultivar, cultivar group or grex that follows the scientific name.",
          "examples": "`King Edward` (for scientificName \"Solanum tuberosum 'King Edward'\" and taxonRank \"cultivar\"); `Mishmiense` (for scientificName \"Rhododendron boothii Mishmiense Group\" and taxonRank \"cultivar group\"); `Atlantis` (for scientificName \"Paphiopedilum Atlantis grex\" and taxonRank \"grex\").",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/cultivarEpithet"
        },
        {
          "localName": "taxonRank",
          "label": "Taxon Rank",
          "description": "The taxonomic rank of the most specific name in the scientificName.",
          "examples": "`subspecies`, `varietas`, `forma`, `species`, `genus`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/taxonRank"
        },
        {
          "localName": "verbatimTaxonRank",
          "label": "Verbatim Taxon Rank",
          "description": "The taxonomic rank of the most specific name in the scientificName as it appears in the original record.",
          "examples": "`Agamospecies`, `sub-lesus`, `prole`, `apomict`, `nothogrex`, `sp.`, `subsp.`, `var.`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/verbatimTaxonRank"
        },
        {
          "localName": "scientificNameAuthorship",
          "label": "Scientific Name Authorship",
          "description": "The authorship information for the scientificName formatted according to the conventions of the applicable nomenclaturalCode.",
          "examples": "`(Torr.) J.T. Howell`, `(Martinovský) Tzvelev`, `(Györfi, 1952)`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/scientificNameAuthorship"
        },
        {
          "localName": "vernacularName",
          "label": "Vernacular Name",
          "description": "A common or vernacular name.",
          "examples": "`Andean Condor`, `Condor Andino`, `American Eagle`, `Gänsegeier`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/vernacularName"
        },
        {
          "localName": "nomenclaturalCode",
          "label": "Nomenclatural Code",
          "description": "The nomenclatural code (or codes in the case of an ambiregnal name) under which the scientificName is constructed.",
          "examples": "`ICN`, `ICZN`, `BC`, `ICNCP`, `BioCode`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/nomenclaturalCode"
        },
        {
          "localName": "taxonomicStatus",
          "label": "Taxonomic Status",
          "description": "The status of the use of the scientificName as a label for a taxon. Requires taxonomic opinion to define the scope of a taxon. Rules of priority then are used to define the taxonomic status of the nomenclature contained in that scope, combined with the experts opinion. It must be linked to a specific taxonomic reference that defines the concept.",
          "examples": "`invalid`, `misapplied`, `homotypic synonym`, `accepted`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/taxonomicStatus"
        },
        {
          "localName": "nomenclaturalStatus",
          "label": "Nomenclatural Status",
          "description": "The status related to the original publication of the name and its conformance to the relevant rules of nomenclature. It is based essentially on an algorithm according to the business rules of the code. It requires no taxonomic opinion.",
          "examples": "`nom. ambig.`, `nom. illeg.`, `nom. subnud.`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/nomenclaturalStatus"
        },
        {
          "localName": "taxonRemarks",
          "label": "Taxon Remarks",
          "description": "Comments or notes about the taxon or name.",
          "examples": "`this name is a misspelling in common use`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/Taxon",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/taxonRemarks"
        }
      ],
      "label": "Taxon",
      "iri": "http://rs.tdwg.org/dwc/terms/Taxon"
    },
    "MeasurementOrFact": {
      "name": "MeasurementOrFact",
      "entries": [
        {
          "localName": "measurementID",
          "label": "Measurement ID",
          "description": "An identifier for the MeasurementOrFact (information pertaining to measurements, facts, characteristics, or assertions). May be a global unique identifier or an identifier specific to the data set.",
          "examples": "`9c752d22-b09a-11e8-96f8-529269fb1459`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/MeasurementOrFact",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/measurementID"
        },
        {
          "localName": "measurementType",
          "label": "Measurement Type",
          "description": "The nature of the measurement, fact, characteristic, or assertion.",
          "examples": "`tail length`, `temperature`, `trap line length`, `survey area`, `trap type`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/MeasurementOrFact",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/measurementType"
        },
        {
          "localName": "measurementValue",
          "label": "Measurement Value",
          "description": "The value of the measurement, fact, characteristic, or assertion.",
          "examples": "`45`, `20`, `1`, `14.5`, `UV-light`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/MeasurementOrFact",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/measurementValue"
        },
        {
          "localName": "measurementAccuracy",
          "label": "Measurement Accuracy",
          "description": "The description of the potential error associated with the measurementValue.",
          "examples": "`0.01`, `normal distribution with variation of 2 m`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/MeasurementOrFact",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/measurementAccuracy"
        },
        {
          "localName": "measurementUnit",
          "label": "Measurement Unit",
          "description": "The units associated with the measurementValue.",
          "examples": "`mm`, `C`, `km`, `ha`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/MeasurementOrFact",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/measurementUnit"
        },
        {
          "localName": "measurementDeterminedBy",
          "label": "Measurement Determined By",
          "description": "A list (concatenated and separated) of names of people, groups, or organizations who determined the value of the MeasurementOrFact.",
          "examples": "`Rob Guralnick`, `Peter Desmet | Stijn Van Hoey`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/MeasurementOrFact",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/measurementDeterminedBy"
        },
        {
          "localName": "measurementDeterminedDate",
          "label": "Measurement Determined Date",
          "description": "The date on which the MeasurementOrFact was made.",
          "examples": "`1963-03-08T14:07-0600` (8 Mar 1963 at 2:07pm in the time zone six hours earlier than UTC). `2009-02-20T08:40Z` (20 February 2009 8:40am UTC). `2018-08-29T15:19` (3:19pm local time on 29 August 2018). `1809-02-12` (some time during 12 February 1809). `1906-06` (some time in June 1906). `1971` (some time in the year 1971). `2007-03-01T13:00:00Z/2008-05-11T15:30:00Z` (some time during the interval between 1 March 2007 1pm UTC and 11 May 2008 3:30pm UTC). `1900/1909` (some time during the interval between the beginning of the year 1900 and the end of the year 1909). `2007-11-13/15` (some time in the interval between 13 November 2007 and 15 November 2007).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/MeasurementOrFact",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/measurementDeterminedDate"
        },
        {
          "localName": "measurementMethod",
          "label": "Measurement Method",
          "description": "A description of or reference to (publication, URI) the method or protocol used to determine the measurement, fact, characteristic, or assertion.",
          "examples": "`minimum convex polygon around burrow entrances` (for a home range area). `barometric altimeter` (for an elevation).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/MeasurementOrFact",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/measurementMethod"
        },
        {
          "localName": "measurementRemarks",
          "label": "Measurement Remarks",
          "description": "Comments or notes accompanying the MeasurementOrFact.",
          "examples": "`tip of tail missing`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/MeasurementOrFact",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/measurementRemarks"
        }
      ],
      "label": "Measurement or Fact",
      "iri": "http://rs.tdwg.org/dwc/terms/MeasurementOrFact"
    },
    "ResourceRelationship": {
      "name": "ResourceRelationship",
      "entries": [
        {
          "localName": "resourceRelationshipID",
          "label": "Resource Relationship ID",
          "description": "An identifier for an instance of relationship between one resource (the subject) and another (relatedResource, the object).",
          "examples": "`04b16710-b09c-11e8-96f8-529269fb1459`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/ResourceRelationship",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/resourceRelationshipID"
        },
        {
          "localName": "resourceID",
          "label": "Resource ID",
          "description": "An identifier for the resource that is the subject of the relationship.",
          "examples": "`f809b9e0-b09b-11e8-96f8-529269fb1459`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/ResourceRelationship",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/resourceID"
        },
        {
          "localName": "relationshipOfResourceID",
          "label": "Relationship Of Resource ID",
          "description": "An identifier for the relationship type (predicate) that connects the subject identified by resourceID to its object identified by relatedResourceID.",
          "examples": "`http://purl.obolibrary.org/obo/RO_0002456` (for the relation \"pollinated by\"), `http://purl.obolibrary.org/obo/RO_0002455` (for the relation \"pollinates\"), `https://www.inaturalist.org/observation_fields/879` (for the relation \"eaten by\")",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/ResourceRelationship",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/relationshipOfResourceID"
        },
        {
          "localName": "relatedResourceID",
          "label": "Related Resource ID",
          "description": "An identifier for a related resource (the object, rather than the subject of the relationship).",
          "examples": "`dc609808-b09b-11e8-96f8-529269fb1459`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/ResourceRelationship",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/relatedResourceID"
        },
        {
          "localName": "relationshipOfResource",
          "label": "Relationship Of Resource",
          "description": "The relationship of the subject (identified by resourceID) to the object (identified by relatedResourceID).",
          "examples": "`sameAs`, `duplicate of`, `mother of`, `offspring of`, `sibling of`, `parasite of`, `host of`, `valid synonym of`, `located within`, `pollinator of members of taxon`, `pollinated specific plant`, `pollinated by members of taxon`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/ResourceRelationship",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/relationshipOfResource"
        },
        {
          "localName": "relationshipAccordingTo",
          "label": "Relationship According To",
          "description": "The source (person, organization, publication, reference) establishing the relationship between the two resources.",
          "examples": "`Julie Woodruff`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/ResourceRelationship",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/relationshipAccordingTo"
        },
        {
          "localName": "relationshipEstablishedDate",
          "label": "Relationship Established Date",
          "description": "The date-time on which the relationship between the two resources was established.",
          "examples": "`1963-03-08T14:07-0600` (8 Mar 1963 at 2:07pm in the time zone six hours earlier than UTC). `2009-02-20T08:40Z` (20 February 2009 8:40am UTC). `2018-08-29T15:19` (3:19pm local time on 29 August 2018). `1809-02-12` (some time during 12 February 1809). `1906-06` (some time in June 1906). `1971` (some time in the year 1971). `2007-03-01T13:00:00Z/2008-05-11T15:30:00Z` (some time during the interval between 1 March 2007 1pm UTC and 11 May 2008 3:30pm UTC). `1900/1909` (some time during the interval between the beginning of the year 1900 and the end of the year 1909). `2007-11-13/15` (some time in the interval between 13 November 2007 and 15 November 2007).",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/ResourceRelationship",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/relationshipEstablishedDate"
        },
        {
          "localName": "relationshipRemarks",
          "label": "Relationship Remarks",
          "description": "Comments or notes about the relationship between the two resources.",
          "examples": "`mother and offspring collected from the same nest`, `pollinator captured in the act`",
          "organizedIn": "http://rs.tdwg.org/dwc/terms/ResourceRelationship",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/relationshipRemarks"
        }
      ],
      "label": "Resource Relationship",
      "iri": "http://rs.tdwg.org/dwc/terms/ResourceRelationship"
    },
    "RecordLevel": {
      "name": "RecordLevel",
      "entries": [
        {
          "localName": "type",
          "label": "Type",
          "description": "The nature or genre of the resource.",
          "examples": "`StillImage`, `MovingImage`, `Sound`, `PhysicalObject`, `Event`, `Text`",
          "organizedIn": "http://purl.org/dc/elements/1.1/",
          "status": "recommended",
          "iri": "http://purl.org/dc/elements/1.1/type"
        },
        {
          "localName": "language",
          "label": "Language",
          "description": "A language of the resource.",
          "examples": "`en` (for English), `es` (for Spanish)",
          "organizedIn": "http://purl.org/dc/elements/1.1/",
          "status": "recommended",
          "iri": "http://purl.org/dc/elements/1.1/language"
        },
        {
          "localName": "modified",
          "label": "Date Modified",
          "description": "The most recent date-time on which the resource was changed.",
          "examples": "`1963-03-08T14:07-0600` (8 Mar 1963 at 2:07pm in the time zone six hours earlier than UTC). `2009-02-20T08:40Z` (20 February 2009 8:40am UTC). `2018-08-29T15:19` (3:19pm local time on 29 August 2018). `1809-02-12` (some time during 12 February 1809). `1906-06` (some time in June 1906). `1971` (some time in the year 1971). `2007-03-01T13:00:00Z/2008-05-11T15:30:00Z` (some time during the interval between 1 March 2007 1pm UTC and 11 May 2008 3:30pm UTC). `1900/1909` (some time during the interval between the beginning of the year 1900 and the end of the year 1909). `2007-11-13/15` (some time in the interval between 13 November 2007 and 15 November 2007).",
          "organizedIn": "http://purl.org/dc/terms/",
          "status": "recommended",
          "iri": "http://purl.org/dc/terms/modified"
        },
        {
          "localName": "license",
          "label": "License",
          "description": "A legal document giving official permission to do something with the resource.",
          "examples": "`http://creativecommons.org/publicdomain/zero/1.0/legalcode`, `http://creativecommons.org/licenses/by/4.0/legalcode`",
          "organizedIn": "http://purl.org/dc/terms/",
          "status": "recommended",
          "iri": "http://purl.org/dc/terms/license"
        },
        {
          "localName": "rightsHolder",
          "label": "Rights Holder",
          "description": "A person or organization owning or managing rights over the resource.",
          "examples": "`The Regents of the University of California`",
          "organizedIn": "http://purl.org/dc/terms/",
          "status": "recommended",
          "iri": "http://purl.org/dc/terms/rightsHolder"
        },
        {
          "localName": "accessRights",
          "label": "Access Rights",
          "description": "Information about who can access the resource or an indication of its security status.",
          "examples": "`not-for-profit use only`, `https://www.fieldmuseum.org/field-museum-natural-history-conditions-and-suggested-norms-use-collections-data-and-images`",
          "organizedIn": "http://purl.org/dc/terms/",
          "status": "recommended",
          "iri": "http://purl.org/dc/terms/accessRights"
        },
        {
          "localName": "bibliographicCitation",
          "label": "Bibliographic Citation",
          "description": "A bibliographic reference for the resource as a statement indicating how this record should be cited (attributed) when used.",
          "examples": "Occurrence example: `Museum of Vertebrate Zoology, UC Berkeley. MVZ Mammal Collection (Arctos). Record ID: http://arctos.database.museum/guid/MVZ:Mamm:165861?seid=101356. Source: http://ipt.vertnet.org:8080/ipt/resource.do?r=mvz_mammal.` Taxon example: `https://www.gbif.org/species/2439608 Source: GBIF Taxonomic Backbone`, Event example: `Rand, K.M., Logerwell, E.A. The first demersal trawl survey of benthic fish and invertebrates in the Beaufort Sea since the late 1970s. Polar Biol 34, 475–488 (2011). https://doi.org/10.1007/s00300-010-0900-2`",
          "organizedIn": "http://purl.org/dc/terms/",
          "status": "recommended",
          "iri": "http://purl.org/dc/terms/bibliographicCitation"
        },
        {
          "localName": "references",
          "label": "References",
          "description": "A related resource that is referenced, cited, or otherwise pointed to by the described resource.",
          "examples": "MaterialSample example: `http://arctos.database.museum/guid/MVZ:Mamm:165861`, Taxon example: `https://www.catalogueoflife.org/data/taxon/32664`",
          "organizedIn": "http://purl.org/dc/terms/",
          "status": "recommended",
          "iri": "http://purl.org/dc/terms/references"
        },
        {
          "localName": "Location",
          "label": "Location",
          "description": "A spatial region or named place.",
          "examples": "The municipality of San Carlos de Bariloche, Río Negro, Argentina. The place defined by a georeference.",
          "organizedIn": "http://purl.org/dc/terms/",
          "status": "recommended",
          "iri": "http://purl.org/dc/terms/Location"
        },
        {
          "localName": "language",
          "label": "Language",
          "description": "A language of the resource.",
          "examples": "",
          "organizedIn": "http://purl.org/dc/terms/",
          "status": "recommended",
          "iri": "http://purl.org/dc/terms/language"
        }
      ],
      "label": "Record Level",
      "iri": [
        "http://purl.org/dc/elements/1.1/",
        "http://purl.org/dc/terms/"
      ]
    },
    "Location": {
      "name": "Location",
      "entries": [
        {
          "localName": "locationID",
          "label": "Location ID",
          "description": "An identifier for the set of location information (data associated with dcterms:Location). May be a global unique identifier or an identifier specific to the data set.",
          "examples": "`https://opencontext.org/subjects/768A875F-E205-4D0B-DE55-BAB7598D0FD1`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/locationID"
        },
        {
          "localName": "higherGeographyID",
          "label": "Higher Geography ID",
          "description": "An identifier for the geographic region within which the Location occurred.",
          "examples": "`http://vocab.getty.edu/tgn/1002002` (Antártida e Islas del Atlántico Sur, Territorio Nacional de la Tierra del Fuego, Argentina).",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/higherGeographyID"
        },
        {
          "localName": "higherGeography",
          "label": "Higher Geography",
          "description": "A list (concatenated and separated) of geographic names less specific than the information captured in the locality term.",
          "examples": "`North Atlantic Ocean`. `South America | Argentina | Patagonia | Parque Nacional Nahuel Huapi | Neuquén | Los Lagos` (with accompanying values `South America` in continent, `Argentina` in country, `Neuquén` in stateProvince, and `Los Lagos` in county.",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/higherGeography"
        },
        {
          "localName": "continent",
          "label": "Continent",
          "description": "The name of the continent in which the Location occurs.",
          "examples": "`Africa`, `Antarctica`, `Asia`, `Europe`, `North America`, `Oceania`, `South America`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/continent"
        },
        {
          "localName": "waterBody",
          "label": "Water Body",
          "description": "The name of the water body in which the Location occurs.",
          "examples": "`Indian Ocean`, `Baltic Sea`, `Hudson River`, `Lago Nahuel Huapi`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/waterBody"
        },
        {
          "localName": "islandGroup",
          "label": "Island Group",
          "description": "The name of the island group in which the Location occurs.",
          "examples": "`Alexander Archipelago`, `Archipiélago Diego Ramírez`, `Seychelles`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/islandGroup"
        },
        {
          "localName": "island",
          "label": "Island",
          "description": "The name of the island on or near which the Location occurs.",
          "examples": "`Nosy Be`, `Bikini Atoll`, `Vancouver`, `Viti Levu`, `Zanzibar`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/island"
        },
        {
          "localName": "country",
          "label": "Country",
          "description": "The name of the country or major administrative unit in which the Location occurs.",
          "examples": "`Denmark`, `Colombia`, `España`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/country"
        },
        {
          "localName": "countryCode",
          "label": "Country Code",
          "description": "The standard code for the country in which the Location occurs.",
          "examples": "`AR`, `SV`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/countryCode"
        },
        {
          "localName": "stateProvince",
          "label": "State Province",
          "description": "The name of the next smaller administrative region than country (state, province, canton, department, region, etc.) in which the Location occurs.",
          "examples": "`Montana`, `Minas Gerais`, `Córdoba`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/stateProvince"
        },
        {
          "localName": "county",
          "label": "County",
          "description": "The full, unabbreviated name of the next smaller administrative region than stateProvince (county, shire, department, etc.) in which the Location occurs.",
          "examples": "`Missoula`, `Los Lagos`, `Mataró`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/county"
        },
        {
          "localName": "municipality",
          "label": "Municipality",
          "description": "The full, unabbreviated name of the next smaller administrative region than county (city, municipality, etc.) in which the Location occurs. Do not use this term for a nearby named place that does not contain the actual location.",
          "examples": "`Holzminden`, `Araçatuba`, `Ga-Segonyana`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/municipality"
        },
        {
          "localName": "locality",
          "label": "Locality",
          "description": "The specific description of the place.",
          "examples": "`Bariloche, 25 km NNE via Ruta Nacional 40 (=Ruta 237)`, `Queets Rainforest, Olympic National Park`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/locality"
        },
        {
          "localName": "verbatimLocality",
          "label": "Verbatim Locality",
          "description": "The original textual description of the place.",
          "examples": "`25 km NNE Bariloche por R. Nac. 237`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/verbatimLocality"
        },
        {
          "localName": "minimumElevationInMeters",
          "label": "Minimum Elevation In Meters",
          "description": "The lower limit of the range of elevation (altitude, usually above sea level), in meters.",
          "examples": "`-100`, `802`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/minimumElevationInMeters"
        },
        {
          "localName": "maximumElevationInMeters",
          "label": "Maximum Elevation In Meters",
          "description": "The upper limit of the range of elevation (altitude, usually above sea level), in meters.",
          "examples": "`-205`, `1236`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/maximumElevationInMeters"
        },
        {
          "localName": "verbatimElevation",
          "label": "Verbatim Elevation",
          "description": "The original description of the elevation (altitude, usually above sea level) of the Location.",
          "examples": "`100-200 m`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/verbatimElevation"
        },
        {
          "localName": "verticalDatum",
          "label": "Vertical Datum",
          "description": "The vertical datum used as the reference upon which the values in the elevation terms are based.",
          "examples": "`EGM84`, `EGM96`, `EGM2008`, `PGM2000A`, `PGM2004`, `PGM2006`, `PGM2007`, `epsg:7030`, `unknown`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/verticalDatum"
        },
        {
          "localName": "minimumDepthInMeters",
          "label": "Minimum Depth In Meters",
          "description": "The lesser depth of a range of depth below the local surface, in meters.",
          "examples": "`0`, `100`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/minimumDepthInMeters"
        },
        {
          "localName": "maximumDepthInMeters",
          "label": "Maximum Depth In Meters",
          "description": "The greater depth of a range of depth below the local surface, in meters.",
          "examples": "`0`, `200`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/maximumDepthInMeters"
        },
        {
          "localName": "verbatimDepth",
          "label": "Verbatim Depth",
          "description": "The original description of the depth below the local surface.",
          "examples": "`100-200 m`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/verbatimDepth"
        },
        {
          "localName": "minimumDistanceAboveSurfaceInMeters",
          "label": "Minimum Distance Above Surface In Meters",
          "description": "The lesser distance in a range of distance from a reference surface in the vertical direction, in meters. Use positive values for locations above the surface, negative values for locations below. If depth measures are given, the reference surface is the location given by the depth, otherwise the reference surface is the location given by the elevation.",
          "examples": "`-1.5` (below the surface). `4.2` (above the surface). For a 1.5 meter sediment core from the bottom of a lake (at depth 20m) at 300m elevation: verbatimElevation: `300m` minimumElevationInMeters: `300`, maximumElevationInMeters: `300`, verbatimDepth: `20m`, minimumDepthInMeters: `20`, maximumDepthInMeters: `20`, minimumDistanceAboveSurfaceInMeters: `0`, maximumDistanceAboveSurfaceInMeters: `-1.5`.",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/minimumDistanceAboveSurfaceInMeters"
        },
        {
          "localName": "maximumDistanceAboveSurfaceInMeters",
          "label": "Maximum Distance Above Surface In Meters",
          "description": "The greater distance in a range of distance from a reference surface in the vertical direction, in meters. Use positive values for locations above the surface, negative values for locations below. If depth measures are given, the reference surface is the location given by the depth, otherwise the reference surface is the location given by the elevation.",
          "examples": "`-1.5` (below the surface). `4.2` (above the surface). For a 1.5 meter sediment core from the bottom of a lake (at depth 20m) at 300m elevation: verbatimElevation: `300m` minimumElevationInMeters: `300`, maximumElevationInMeters: `300`, verbatimDepth: `20m`, minimumDepthInMeters: `20`, maximumDepthInMeters: `20`, minimumDistanceAboveSurfaceInMeters: `0`, maximumDistanceAboveSurfaceInMeters: `-1.5`.",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/maximumDistanceAboveSurfaceInMeters"
        },
        {
          "localName": "locationAccordingTo",
          "label": "Location According To",
          "description": "Information about the source of this Location information. Could be a publication (gazetteer), institution, or team of individuals.",
          "examples": "`Getty Thesaurus of Geographic Names`, `GADM`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/locationAccordingTo"
        },
        {
          "localName": "locationRemarks",
          "label": "Location Remarks",
          "description": "Comments or notes about the Location.",
          "examples": "`under water since 2005`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/locationRemarks"
        },
        {
          "localName": "decimalLatitude",
          "label": "Decimal Latitude",
          "description": "The geographic latitude (in decimal degrees, using the spatial reference system given in geodeticDatum) of the geographic center of a Location. Positive values are north of the Equator, negative values are south of it. Legal values lie between -90 and 90, inclusive.",
          "examples": "`-41.0983423`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/decimalLatitude"
        },
        {
          "localName": "decimalLongitude",
          "label": "Decimal Longitude",
          "description": "The geographic longitude (in decimal degrees, using the spatial reference system given in geodeticDatum) of the geographic center of a Location. Positive values are east of the Greenwich Meridian, negative values are west of it. Legal values lie between -180 and 180, inclusive.",
          "examples": "`-121.1761111`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/decimalLongitude"
        },
        {
          "localName": "geodeticDatum",
          "label": "Geodetic Datum",
          "description": "The ellipsoid, geodetic datum, or spatial reference system (SRS) upon which the geographic coordinates given in decimalLatitude and decimalLongitude as based.",
          "examples": "`EPSG:4326`, `WGS84`, `NAD27`, `Campo Inchauspe`, `European 1950`, `Clarke 1866`, `unknown`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/geodeticDatum"
        },
        {
          "localName": "coordinateUncertaintyInMeters",
          "label": "Coordinate Uncertainty In Meters",
          "description": "The horizontal distance (in meters) from the given decimalLatitude and decimalLongitude describing the smallest circle containing the whole of the Location. Leave the value empty if the uncertainty is unknown, cannot be estimated, or is not applicable (because there are no coordinates). Zero is not a valid value for this term.",
          "examples": "`30` (reasonable lower limit on or after 2020-05-01 of a GPS reading under good conditions if the actual precision was not recorded at the time). `100` (reasonable lower limit before 2020-05-01 of a GPS reading under good conditions if the actual precision was not recorded at the time). `71` (uncertainty for a UTM coordinate having 100 meter precision and a known spatial reference system).",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/coordinateUncertaintyInMeters"
        },
        {
          "localName": "coordinatePrecision",
          "label": "Coordinate Precision",
          "description": "A decimal representation of the precision of the coordinates given in the decimalLatitude and decimalLongitude.",
          "examples": "`0.00001` (normal GPS limit for decimal degrees). `0.000278` (nearest second). `0.01667` (nearest minute). `1.0` (nearest degree).",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/coordinatePrecision"
        },
        {
          "localName": "pointRadiusSpatialFit",
          "label": "Point Radius Spatial Fit",
          "description": "The ratio of the area of the point-radius (decimalLatitude, decimalLongitude, coordinateUncertaintyInMeters) to the area of the true (original, or most specific) spatial representation of the Location. Legal values are 0, greater than or equal to 1, or undefined. A value of 1 is an exact match or 100% overlap. A value of 0 should be used if the given point-radius does not completely contain the original representation. The pointRadiusSpatialFit is undefined (and should be left empty) if the original representation is a point without uncertainty and the given georeference is not that same point (without uncertainty). If both the original and the given georeference are the same point, the pointRadiusSpatialFit is 1.",
          "examples": "`0`, `1`, `1.5708`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/pointRadiusSpatialFit"
        },
        {
          "localName": "verbatimCoordinates",
          "label": "Verbatim Coordinates",
          "description": "The verbatim original spatial coordinates of the Location. The coordinate ellipsoid, geodeticDatum, or full Spatial Reference System (SRS) for these coordinates should be stored in verbatimSRS and the coordinate system should be stored in verbatimCoordinateSystem.",
          "examples": "`41 05 54S 121 05 34W`, `17T 630000 4833400`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/verbatimCoordinates"
        },
        {
          "localName": "verbatimLatitude",
          "label": "Verbatim Latitude",
          "description": "The verbatim original latitude of the Location. The coordinate ellipsoid, geodeticDatum, or full Spatial Reference System (SRS) for these coordinates should be stored in verbatimSRS and the coordinate system should be stored in verbatimCoordinateSystem.",
          "examples": "`41 05 54.03S`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/verbatimLatitude"
        },
        {
          "localName": "verbatimLongitude",
          "label": "Verbatim Longitude",
          "description": "The verbatim original longitude of the Location. The coordinate ellipsoid, geodeticDatum, or full Spatial Reference System (SRS) for these coordinates should be stored in verbatimSRS and the coordinate system should be stored in verbatimCoordinateSystem.",
          "examples": "`121d 10' 34\" W`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/verbatimLongitude"
        },
        {
          "localName": "verbatimCoordinateSystem",
          "label": "Verbatim Coordinate System",
          "description": "The coordinate format for the verbatimLatitude and verbatimLongitude or the verbatimCoordinates of the Location.",
          "examples": "`decimal degrees`, `degrees decimal minutes`, `degrees minutes seconds`, `UTM`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/verbatimCoordinateSystem"
        },
        {
          "localName": "verbatimSRS",
          "label": "Verbatim SRS",
          "description": "The ellipsoid, geodetic datum, or spatial reference system (SRS) upon which coordinates given in verbatimLatitude and verbatimLongitude, or verbatimCoordinates are based.",
          "examples": "`unknown`, `EPSG:4326`, `WGS84`, `NAD27`, `Campo Inchauspe`, `European 1950`, `Clarke 1866`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/verbatimSRS"
        },
        {
          "localName": "footprintWKT",
          "label": "Footprint WKT",
          "description": "A Well-Known Text (WKT) representation of the shape (footprint, geometry) that defines the Location. A Location may have both a point-radius representation (see decimalLatitude) and a footprint representation, and they may differ from each other.",
          "examples": "`POLYGON ((10 20, 11 20, 11 21, 10 21, 10 20))` (the one-degree bounding box with opposite corners at longitude=10, latitude=20 and longitude=11, latitude=21)",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/footprintWKT"
        },
        {
          "localName": "footprintSRS",
          "label": "Footprint SRS",
          "description": "The ellipsoid, geodetic datum, or spatial reference system (SRS) upon which the geometry given in footprintWKT is based.",
          "examples": "`epsg:4326`, `GEOGCS[\"GCS_WGS_1984\", DATUM[\"D_WGS_1984\", SPHEROID[\"WGS_1984\",6378137,298.257223563]], PRIMEM[\"Greenwich\",0], UNIT[\"Degree\",0.0174532925199433]]` (WKT for the standard WGS84 Spatial Reference System EPSG:4326)",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/footprintSRS"
        },
        {
          "localName": "footprintSpatialFit",
          "label": "Footprint Spatial Fit",
          "description": "The ratio of the area of the footprint (footprintWKT) to the area of the true (original, or most specific) spatial representation of the Location. Legal values are 0, greater than or equal to 1, or undefined. A value of 1 is an exact match or 100% overlap. A value of 0 should be used if the given footprint does not completely contain the original representation. The footprintSpatialFit is undefined (and should be left empty) if the original representation is a point without uncertainty and the given georeference is not that same point (without uncertainty). If both the original and the given georeference are the same point, the footprintSpatialFit is 1.",
          "examples": "`0`, `1`, `1.5708`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/footprintSpatialFit"
        },
        {
          "localName": "georeferencedBy",
          "label": "Georeferenced By",
          "description": "A list (concatenated and separated) of names of people, groups, or organizations who determined the georeference (spatial representation) for the Location.",
          "examples": "`Brad Millen (ROM)`, `Kristina Yamamoto | Janet Fang`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/georeferencedBy"
        },
        {
          "localName": "georeferencedDate",
          "label": "Georeferenced Date",
          "description": "The date on which the Location was georeferenced.",
          "examples": "`1963-03-08T14:07-0600` (8 Mar 1963 at 2:07pm in the time zone six hours earlier than UTC). `2009-02-20T08:40Z` (20 February 2009 8:40am UTC). `2018-08-29T15:19` (3:19pm local time on 29 August 2018). `1809-02-12` (some time during 12 February 1809). `1906-06` (some time in June 1906). `1971` (some time in the year 1971). `2007-03-01T13:00:00Z/2008-05-11T15:30:00Z` (some time during the interval between 1 March 2007 1pm UTC and 11 May 2008 3:30pm UTC). `1900/1909` (some time during the interval between the beginning of the year 1900 and the end of the year 1909). `2007-11-13/15` (some time in the interval between 13 November 2007 and 15 November 2007).",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/georeferencedDate"
        },
        {
          "localName": "georeferenceProtocol",
          "label": "Georeference Protocol",
          "description": "A description or reference to the methods used to determine the spatial footprint, coordinates, and uncertainties.",
          "examples": "`Georeferencing Quick Reference Guide (Zermoglio et al. 2020, https://doi.org/10.35035/e09p-h128)`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/georeferenceProtocol"
        },
        {
          "localName": "georeferenceSources",
          "label": "Georeference Sources",
          "description": "A list (concatenated and separated) of maps, gazetteers, or other resources used to georeference the Location, described specifically enough to allow anyone in the future to use the same resources.",
          "examples": "`https://www.geonames.org/`, `USGS 1:24000 Florence Montana Quad 1967 | Terrametrics 2008 on Google Earth`, `GeoLocate`",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/georeferenceSources"
        },
        {
          "localName": "georeferenceRemarks",
          "label": "Georeference Remarks",
          "description": "Notes or comments about the spatial description determination, explaining assumptions made in addition or opposition to the those formalized in the method referred to in georeferenceProtocol.",
          "examples": "`Assumed distance by road (Hwy. 101)`.",
          "organizedIn": "http://purl.org/dc/terms/Location",
          "status": "recommended",
          "iri": "http://rs.tdwg.org/dwc/terms/georeferenceRemarks"
        }
      ],
      "label": "Location",
      "iri": "http://purl.org/dc/terms/Location"
    }
  },
  "typeStatuses": [
    "Holotype",
    "Paratype",
    "Syntype",
    "Hapantotype",
    "Neotype",
    "Lectotype",
    "Paralectotype",
    "Allotype",
    "Alloneotype",
    "Allolectotype",
    "Other material"
  ]
}
