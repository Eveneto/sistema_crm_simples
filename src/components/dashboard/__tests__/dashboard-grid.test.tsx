import { render } from '@testing-library/react';
import { DashboardGrid } from '../dashboard-grid';

// Mock do fetch global
global.fetch = jest.fn();

describe('DashboardGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock básico que sempre resolve
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        totalContacts: { current: 100, trend: 10 },
        activeConversations: { current: 25, trend: 5 },
        conversionRate: { current: 15.5, trend: 2.3 },
        newContacts: { current: 30, trend: 12 },
        trends: { contacts: 10, conversations: 5, conversion: 2.3, newContacts: 12 },
      }),
    });
  });

  it('deve renderizar sem erros', () => {
    const { container } = render(<DashboardGrid period="30d" />);
    expect(container).toBeInTheDocument();
  });

  it('deve mostrar loading skeletons inicialmente', () => {
    const { container } = render(<DashboardGrid period="30d" />);

    // Skeleton tem classe animate-pulse
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('deve chamar API com período correto', () => {
    render(<DashboardGrid period="7d" />);

    expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/overview?period=7d');
  });
});
