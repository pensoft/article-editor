export interface IPagination {
  page: number;
  pageSize: number;
  filter: any;
  sort: string;
}

export class PaginationAdapter {
  filter: any;
  page: number = 1;
  pageSize: number = 10;
  sort: string;

  constructor(props: Partial<IPagination>) {
    Object.assign(this, props);
  }

}

export interface PaginationInputData<T> {
  data: T[];
  meta: PaginationMetaInput
}

export interface PaginationMetaInput {
  page?: number;
  pageSize?: number;
  filter?: any;
  sort?: string;
  pagination: PaginationInput
}

export interface PaginationInput {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  links: object
}
