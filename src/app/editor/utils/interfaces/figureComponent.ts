
export interface figure_component {
    type:string,
    url:string,
    description:string
}

export interface figure {
    components:figure_component[],
    description:string
}