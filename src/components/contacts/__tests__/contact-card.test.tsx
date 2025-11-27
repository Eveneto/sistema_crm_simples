import { render, screen } from '@testing-library/react';
import { ContactCard } from '../contact-card';
import { Contact } from '@/types/contact';

// Mock do Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('ContactCard', () => {
  const mockContact: Contact = {
    id: '1',
    name: 'João Silva',
    email: 'joao@test.com',
    phone: '(11) 99999-9999',
    tags: ['cliente', 'enterprise', 'prioritário'],
    custom_fields: {
      company: 'TechCorp Brasil',
      position: 'Diretor de TI',
      status: 'active',
    },
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  it('deve renderizar nome do contato', () => {
    render(<ContactCard contact={mockContact} />);
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  it('deve renderizar cargo se disponível', () => {
    render(<ContactCard contact={mockContact} />);
    expect(screen.getByText('Diretor de TI')).toBeInTheDocument();
  });

  it('deve renderizar email quando presente', () => {
    render(<ContactCard contact={mockContact} />);
    expect(screen.getByText('joao@test.com')).toBeInTheDocument();
  });

  it('deve renderizar telefone quando presente', () => {
    render(<ContactCard contact={mockContact} />);
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
  });

  it('deve renderizar empresa quando presente', () => {
    render(<ContactCard contact={mockContact} />);
    expect(screen.getByText('TechCorp Brasil')).toBeInTheDocument();
  });

  it('deve renderizar até 3 tags', () => {
    render(<ContactCard contact={mockContact} />);
    expect(screen.getByText('cliente')).toBeInTheDocument();
    expect(screen.getByText('enterprise')).toBeInTheDocument();
    expect(screen.getByText('prioritário')).toBeInTheDocument();
  });

  it('deve mostrar indicador de mais tags quando houver mais de 3', () => {
    const contactWithManyTags: Contact = {
      ...mockContact,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };
    render(<ContactCard contact={contactWithManyTags} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('deve ter links para visualizar e editar', () => {
    render(<ContactCard contact={mockContact} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/dashboard/contacts/1');
    expect(links[1]).toHaveAttribute('href', '/dashboard/contacts/1/edit');
  });

  it('deve lidar com campos opcionais ausentes', () => {
    const minimalContact: Contact = {
      id: '2',
      name: 'Maria Santos',
      email: null,
      phone: null,
      tags: null,
      custom_fields: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };

    render(<ContactCard contact={minimalContact} />);
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.queryByText(/test.com/)).not.toBeInTheDocument();
  });
});
