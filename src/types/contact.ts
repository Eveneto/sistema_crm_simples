// Status possíveis de um contato
export type ContactStatus = 'lead' | 'client' | 'inactive' | 'prospect';

// Custom fields com tipagem forte
export interface CustomFields {
  company?: string;
  position?: string;
  status?: ContactStatus;
  notes?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Permite campos adicionais
}

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tags: string[] | null;
  custom_fields: CustomFields | null;
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
