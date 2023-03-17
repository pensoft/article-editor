
export interface figure_component {
    'componentType':string,
    'url':string,
    'description':string,
    "thumbnail":string,
    "pdfImgOrigin": string
}

export interface figure {
    "components":figure_component[],
    "description":string,
    "figureID":string,
    "figureNumber":number,
    "figurePlace":string,
    "viewed_by_citat":string,
    "canvasData":any
}
