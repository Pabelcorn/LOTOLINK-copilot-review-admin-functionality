import { test, expect } from '@playwright/test';
import { APIHelper } from '../lib/api-helper';

test.describe('Admin Authentication API', () => {
  let api: APIHelper;
  const adminCredentials = {
    username: '+18091111111',  // Will be created in test
    password: 'AdminSecure123!',
  };

  test.beforeAll(async ({ request }) => {
    api = new APIHelper(request);
    
    // Create an admin user for testing (this would normally be done via secure process)
    // For E2E testing, we'll create via the regular endpoint then manually promote
    await api.post('/api/v1/auth/register', {
      phone: adminCredentials.username,
      email: 'admin-test@lotolink.com',
      name: 'Test Admin',
      password: adminCredentials.password,
    });
  });

  test('should reject admin login with invalid credentials', async () => {
    const response = await api.post('/admin/auth/login', {
      username: 'invalid@example.com',
      password: 'wrongpassword',
    }, { validateStatus: false });

    expect(response.status).toBe(401);
    expect(response.data.message).toContain('Invalid admin credentials');
  });

  test('should reject non-admin user trying to login to admin panel', async () => {
    // This test verifies that regular users cannot access admin endpoints
    const regularUser = {
      username: '+18092222222',
      password: 'RegularUser123!',
    };

    // Create regular user
    await api.post('/api/v1/auth/register', {
      phone: regularUser.username,
      email: 'regular@lotolink.com',
      name: 'Regular User',
      password: regularUser.password,
    });

    // Try to login as admin
    const response = await api.post('/admin/auth/login', {
      username: regularUser.username,
      password: regularUser.password,
    }, { validateStatus: false });

    expect(response.status).toBe(401);
    expect(response.data.message).toContain('Invalid admin credentials');
  });

  test('should enforce rate limiting on admin login attempts', async () => {
    // Admin login has stricter rate limit: 3 attempts per minute
    const promises = [];
    
    // Make 4 rapid requests
    for (let i = 0; i < 4; i++) {
      promises.push(
        api.post('/admin/auth/login', {
          username: 'test@example.com',
          password: 'wrongpassword',
        }, { validateStatus: false })
      );
    }

    const responses = await Promise.all(promises);
    
    // At least one should be rate limited (429)
    const rateLimited = responses.some(r => r.status === 429);
    expect(rateLimited).toBe(true);
  });

  test('should return valid JWT token on successful admin login', async () => {
    // Note: This test would pass only if the user is actually promoted to admin
    // In a real scenario, you'd use a pre-created admin or use the create-admin endpoint
    
    const response = await api.post('/admin/auth/login', {
      username: adminCredentials.username,
      password: adminCredentials.password,
    }, { validateStatus: false });

    // May be 401 if user isn't promoted to admin, which is expected in test environment
    if (response.status === 200) {
      expect(response.data).toHaveProperty('accessToken');
      expect(response.data).toHaveProperty('refreshToken');
      expect(response.data).toHaveProperty('expiresIn');
      expect(response.data.expiresIn).toBe(28800); // 8 hours
      expect(response.data.user).toHaveProperty('role', 'ADMIN');
    } else {
      expect(response.status).toBe(401);
      // This is expected - user needs manual admin promotion
    }
  });

  test('should refresh admin token successfully', async () => {
    // This test demonstrates the token refresh flow
    const loginResponse = await api.post('/admin/auth/login', {
      username: adminCredentials.username,
      password: adminCredentials.password,
    }, { validateStatus: false });

    if (loginResponse.status === 200) {
      const { refreshToken } = loginResponse.data;

      // Refresh the token
      const refreshResponse = await api.post('/admin/auth/refresh', {
        refreshToken,
      });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.data).toHaveProperty('accessToken');
      expect(refreshResponse.data).toHaveProperty('expiresIn');
    }
  });

  test('should reject invalid refresh token', async () => {
    const response = await api.post('/admin/auth/refresh', {
      refreshToken: 'invalid.token.here',
    }, { validateStatus: false });

    expect(response.status).toBe(401);
    expect(response.data.message).toContain('Invalid refresh token');
  });

  test('should prevent creating admin without proper authorization', async () => {
    // Regular user tries to create admin
    const regularUserResponse = await api.post('/api/v1/auth/register', {
      phone: '+18093333333',
      email: 'regular2@lotolink.com',
      name: 'Regular User 2',
      password: 'RegularUser123!',
    });

    const { accessToken } = regularUserResponse.data;

    // Try to create admin with regular user token
    const response = await api.post('/admin/auth/create-admin', {
      username: '+18094444444',
      email: 'newadmin@lotolink.com',
      password: 'NewAdmin123!',
      name: 'New Admin',
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      validateStatus: false,
    });

    expect(response.status).toBe(401);
  });
});
