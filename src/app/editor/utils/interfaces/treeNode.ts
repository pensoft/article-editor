export interface treeNode {
  name: string,
  id: string,
  children: treeNode[],
  active: boolean,
  add: {bool:boolean,main:boolean},
  edit: {bool:boolean,main:boolean},
  delete: {bool:boolean,main:boolean},
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
          edit: { bool: true, main: true }, active: false, add: { bool: true, main: false }, delete: { bool: true, main: false },
          children: [
            { name: 'Title', id: uuidv4(), edit: { bool: true, main: true }, add: { bool: true, main: false }, delete: { bool: true, main: false }, children: [], active: true },
            { name: 'Abstract', id: uuidv4(), edit: { bool: true, main: true }, add: { bool: true, main: false }, delete: { bool: true, main: false }, children: [], active: false },
            {
              name: 'Grant title',
              edit: { bool: true, main: true }, active: false, id: uuidv4(), add: { bool: true, main: false }, delete: { bool: true, main: false },
              children: []
            },
            { name: 'Hosting institution', id: uuidv4(), children: [], edit: { bool: true, main: true }, add: { bool: true, main: false }, delete: { bool: true, main: false }, active: false },
            { name: 'Ethics and security', id: uuidv4(), children: [], edit: { bool: true, main: true }, add: { bool: true, main: false }, delete: { bool: true, main: false }, active: true },
          ]
        },
        { name: 'Taxonomy', edit: { bool: true, main: false }, id: uuidv4(), children: [], add: { bool: true, main: false }, delete: { bool: true, main: true }, active: false },
        { name: 'Introduction', edit: { bool: false, main: false }, id: uuidv4(), children: [], add: { bool: false, main: false }, delete: { bool: true, main: true }, active: false },
        { name: 'Introduction', edit: { bool: false, main: false }, id: uuidv4(), children: [], add: { bool: true, main: false }, delete: { bool: true, main: true }, active: false },
        {
          name: 'General information', edit: { bool: true, main: true }, add: { bool: true, main: false }, id: uuidv4(), active: false, delete: { bool: true, main: false }, children: [
            { name: 'Taxonomy', id: uuidv4(), edit: { bool: true, main: true }, children: [], delete: { bool: true, main: false }, add: { bool: true, main: false }, active: false },
            { name: 'Species characteristics', id: uuidv4(), children: [], edit: { bool: true, main: true }, delete: { bool: true, main: false }, add: { bool: true, main: false }, active: false },
          ]
        },
        { name: 'Habitat', id: uuidv4(), children: [], edit: { bool: true, main: true }, delete: { bool: true, main: false }, add: { bool: true, main: false }, active: false },
        { name: 'Distribution', id: uuidv4(), edit: { bool: true, main: false }, children: [], delete: { bool: true, main: true }, add: { bool: true, main: false }, active: false },
      ]; */