import { contactSchema, createContactSchema } from '../contact';

describe('Contact Validation Schema', () => {
  describe('contactSchema', () => {
    it('deve validar contato com todos os campos', () => {
      const validContact = {
        name: 'João Silva',
        email: 'joao@test.com',
        phone: '(11) 99999-9999',
        company: 'TechCorp',
        position: 'Diretor',
        tags: ['cliente', 'enterprise'],
        notes: 'Contato importante',
      };

      const result = contactSchema.safeParse(validContact);
      expect(result.success).toBe(true);
    });

    it('deve validar nome mínimo de 2 caracteres', () => {
      const result = contactSchema.safeParse({ name: 'A' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('mínimo 2 caracteres');
      }
    });

    it('deve validar email inválido', () => {
      const result = contactSchema.safeParse({
        name: 'João Silva',
        email: 'email-invalido',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Email inválido');
      }
    });

    it('deve validar telefone brasileiro', () => {
      const validPhones = [
        '(11) 99999-9999',
        '(21) 9999-9999',
        '11999999999',
        '+55 11 99999-9999',
      ];

      validPhones.forEach((phone) => {
        const result = contactSchema.safeParse({
          name: 'João Silva',
          phone,
        });
        expect(result.success).toBe(true);
      });
    });

    it('deve rejeitar telefone inválido', () => {
      const result = contactSchema.safeParse({
        name: 'João Silva',
        phone: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Telefone inválido');
      }
    });

    it('deve converter email para lowercase', () => {
      const result = contactSchema.safeParse({
        name: 'João Silva',
        email: 'JOAO@TEST.COM',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('joao@test.com');
      }
    });

    it('deve aceitar campos opcionais vazios', () => {
      const result = contactSchema.safeParse({
        name: 'João Silva',
        email: '',
        phone: '',
        company: '',
        position: '',
        notes: '',
        tags: [],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createContactSchema', () => {
    it('deve exigir email OU telefone', () => {
      const result = createContactSchema.safeParse({
        name: 'João Silva',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email ou telefone');
      }
    });

    it('deve aceitar apenas email', () => {
      const result = createContactSchema.safeParse({
        name: 'João Silva',
        email: 'joao@test.com',
      });
      expect(result.success).toBe(true);
    });

    it('deve aceitar apenas telefone', () => {
      const result = createContactSchema.safeParse({
        name: 'João Silva',
        phone: '(11) 99999-9999',
      });
      expect(result.success).toBe(true);
    });

    it('deve aceitar email E telefone', () => {
      const result = createContactSchema.safeParse({
        name: 'João Silva',
        email: 'joao@test.com',
        phone: '(11) 99999-9999',
      });
      expect(result.success).toBe(true);
    });
  });
});
