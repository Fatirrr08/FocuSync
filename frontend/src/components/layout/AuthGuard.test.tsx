import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AuthGuard from './AuthGuard';

// Setup router mocks
const pushMock = vi.fn();
let currentPathname = '/dashboard';

vi.mock('next/navigation', () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({
    push: pushMock,
  }),
}));

// Setup Supabase Auth mocks
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (cb: (event: string, session: unknown) => void) => mockOnAuthStateChange(cb),
    },
  },
}));

vi.mock('@/lib/supabase/allowlist', () => ({
  checkAndSeedUserAllowlist: vi.fn(),
}));

describe('AuthGuard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPathname = '/dashboard';
    // Default subscription unsubscribe mock
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });
  });

  it('renders loading orb while checking authentication session', async () => {
    // getSession takes some time to resolve
    mockGetSession.mockReturnValue(new Promise(() => {})); // Never resolves to keep it loading

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders children if the route is public even when not logged in', async () => {
    currentPathname = '/';
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(
      <AuthGuard>
        <div data-testid="public-content">Public Content</div>
      </AuthGuard>
    );

    // Should immediately show public content since it's a public route
    await waitFor(() => {
      expect(screen.getByTestId('public-content')).toBeInTheDocument();
    });
  });

  it('redirects to /login if user is not logged in and accesses a protected route', async () => {
    currentPathname = '/dashboard';
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders children if user is logged in and accesses a protected route', async () => {
    currentPathname = '/dashboard';
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-123', email: 'test@email.com' } } }
    });

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('redirects to /dashboard if logged in user tries to access /login', async () => {
    currentPathname = '/login';
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-123', email: 'test@email.com' } } }
    });

    render(
      <AuthGuard>
        <div data-testid="login-content">Login Form</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
    expect(screen.queryByTestId('login-content')).not.toBeInTheDocument();
  });
});
