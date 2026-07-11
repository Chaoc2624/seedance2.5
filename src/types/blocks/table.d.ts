import { Pagination } from './common';

export interface TableColumn {
  name?: string;
  title?: string;
  type?:
    | 'copy'
    | 'image'
    | 'time'
    | 'label'
    | 'dropdown'
    | 'actions'
    | 'user'
    | 'json_preview';
  placeholder?: string;
  metadata?: any;
  className?: string;
  sortable?: boolean;
  resizable?: boolean;
  callback?: (item: any) => any;
}

export interface Table {
  title?: string;
  columns: TableColumn[];
  data: any[];
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: Pagination;
  actions?: Button[];
}
