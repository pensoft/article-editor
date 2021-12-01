
export interface figure_component {
    'componentType':string,
    'url':string,
    'description':string
}

export interface figure {
    "components":figure_component[],
    "description":string
    "path":string                   //id of the section where this figure is cited
}