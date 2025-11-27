export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tags: string[] | null;
  custom_fields: {
    company?: string;
    position?: string;
    status?: string;
    notes?: string;
    [key: string]: any;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface ContactListResponse {
  data: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ContactFilters {
  search?: string;
  tags?: string[];
  orderBy?: 'name' | 'created_at' | 'updated_at';
  orderDirection?: 'asc' | 'desc';
}
