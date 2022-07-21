export interface treeNode {
  name: string,
  id: string,
  children: treeNode[],
  active: boolean,
  add: {active:boolean,main:boolean},
  edit: {active:boolean,main:boolean},
  delete: {active:boolean,main:boolean},
}
/* let TREE_DATA1 = [
        {
          name: 'Article metadata',
          id: uuidv4(),
          edit: true, active: false,

          children: [
            { name: 'Title', id: uuidv4(), edit: true, children: [], active: true },
            { name: 'Abstract', id: uuidv4(), edit: true, children: [], active: false },
            {
              name: 'Grant title',
              edit: true, active: false, id: uuidv4(),
              children: [
                { name: 'Taxonomy', id: uuidv4(), edit: true, children: [], active: true },
                {
                  name: 'Species characteristics', active: false,
                  edit: true,
                  add: true,
                  id: uuidv4(),
                  children: [
                    { name: 'Taxonomy', id: uuidv4(), edit: true, children: [], active: false },
                    { name: 'Species characteristics', id: uuidv4(), children: [], edit: true, add: true, active: false },
                  ]
                },
              ]
            },
            { name: 'Hosting institution', id: uuidv4(), children: [], edit: true, active: false },
            { name: 'Ethics and security', id: uuidv4(), children: [], edit: true, active: true },
          ]
        },
        { name: 'Introduction', edit: true, id: uuidv4(), children: [], add: true, active: false },
        {
          name: 'General information', edit: true, id: uuidv4(), active: false
          , children: [
            { name: 'Taxonomy', id: uuidv4(), edit: true, children: [], active: false },
            { name: 'Species characteristics', id: uuidv4(), children: [], edit: true, add: true, active: false },
          ]
        },
        { name: 'Habitat', id: uuidv4(), children: [], edit: true, active: false },
        { name: 'Distribution', id: uuidv4(), edit: true, children: [], add: true, active: false },
      ];
      TREE_DATA = [
        {
          name: 'Article metadata',
          id: uuidv4(),
          edit: {active: true, main: true }, active: false, add: {active: true, main: false }, delete: {active: true, main: false },
          children: [
            { name: 'Title', id: uuidv4(), edit: {active: true, main: true }, add: {active: true, main: false }, delete: {active: true, main: false }, children: [], active: true },
            { name: 'Abstract', id: uuidv4(), edit: {active: true, main: true }, add: {active: true, main: false }, delete: {active: true, main: false }, children: [], active: false },
            {
              name: 'Grant title',
              edit: {active: true, main: true }, active: false, id: uuidv4(), add: {active: true, main: false }, delete: {active: true, main: false },
              children: []
            },
            { name: 'Hosting institution', id: uuidv4(), children: [], edit: {active: true, main: true }, add: {active: true, main: false }, delete: {active: true, main: false }, active: false },
            { name: 'Ethics and security', id: uuidv4(), children: [], edit: {active: true, main: true }, add: {active: true, main: false }, delete: {active: true, main: false }, active: true },
          ]
        },
        { name: 'Taxonomy', edit: {active: true, main: false }, id: uuidv4(), children: [], add: {active: true, main: false }, delete: {active: true, main: true }, active: false },
        { name: 'Introduction', edit: {active: false, main: false }, id: uuidv4(), children: [], add: {active: false, main: false }, delete: {active: true, main: true }, active: false },
        { name: 'Introduction', edit: {active: false, main: false }, id: uuidv4(), children: [], add: {active: true, main: false }, delete: {active: true, main: true }, active: false },
        {
          name: 'General information', edit: {active: true, main: true }, add: {active: true, main: false }, id: uuidv4(), active: false, delete: {active: true, main: false }, children: [
            { name: 'Taxonomy', id: uuidv4(), edit: {active: true, main: true }, children: [], delete: {active: true, main: false }, add: {active: true, main: false }, active: false },
            { name: 'Species characteristics', id: uuidv4(), children: [], edit: {active: true, main: true }, delete: {active: true, main: false }, add: {active: true, main: false }, active: false },
          ]
        },
        { name: 'Habitat', id: uuidv4(), children: [], edit: {active: true, main: true }, delete: {active: true, main: false }, add: {active: true, main: false }, active: false },
        { name: 'Distribution', id: uuidv4(), edit: {active: true, main: false }, children: [], delete: {active: true, main: true }, add: {active: true, main: false }, active: false },
      ]; */
