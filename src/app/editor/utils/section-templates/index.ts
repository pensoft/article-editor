import { taxonomicCoverage,taxonomicCoverageDefaultValues } from "./form-io-json/taxonomicCoverage"
import { taxonomicCoverageTemplate } from "./html-nodes/taxonomicCoverage"
import { collectionData,collectionDataDefaultValues } from "./form-io-json/collectionData"
import { collectionDataTemplate } from "./html-nodes/collectionData"
export const formIOTemplates = {
    'taxonomicCoverage':taxonomicCoverage,
    'collectionData':collectionData,
}

export const formIODefaultValues = {
    'taxonomicCoverage':taxonomicCoverageDefaultValues,
    'collectionData':collectionDataDefaultValues,
}

export const htmlNodeTemplates = {
    'taxonomicCoverage':taxonomicCoverageTemplate,
    'collectionData':collectionDataTemplate,
}