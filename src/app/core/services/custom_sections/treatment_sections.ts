import {
  treatmentSectionsBiology,
  treatmentSectionsConservation,
  treatmentSectionsDescription,
  treatmentSectionsDiagnosis,
  treatmentSectionsDistribution,
  treatmentSectionsEcology,
  treatmentSectionsNotes,
  treatmentSectionsTaxonDiscussion
} from "@core/services/custom_sections/treatment_sections_description";

export const treatmentSections = {
  "id": 9902,
  "name": "[MM] Treatment sections",
  "label": "Treatment sections",
  edit: {active: false, main: false},
  add: {active: false, main: false},
  delete: {active: false, main: false},
  select: {active: true, main: true},
  "schema": {
    "components": []
  },
  "sections": [
    treatmentSectionsDescription,
    treatmentSectionsDiagnosis,
    treatmentSectionsDistribution,
    treatmentSectionsEcology,
    treatmentSectionsConservation,
    treatmentSectionsBiology,
    treatmentSectionsTaxonDiscussion,
    treatmentSectionsNotes
  ],
  "template": `\t<h3 style="padding-left: 20px;font-weight: bold;">
\t\t<p style="font-weight: bold;">Treatment sections</p>
\t</h3>`,
  "type": 1,
  "version_id": 309,
  "version": 1,
  "version_pre_defined": false,
  "version_date": "2022-03-30T16:01:37.000000Z",
  "complex_section_settings": [],
  "settings": null,
  "compatibility": {
    "allow": {
      "all": true,
      "values": [
        80
      ]
    },
    "deny": {
      "all": false,
      "values": []
    }
  },
  "created_at": "2021-12-08T21:01:21.000000Z"
}
