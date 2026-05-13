import apiClient, { setAccessToken, clearAccessToken } from './client';

export const register = ({ full_name, email, password }) =>
  apiClient.post('/auth/register', { full_name, email, password }).then(res => {
    if (res.data.ok) {
      setAccessToken(res.data.token);
      return res.data.user;
    }
    throw new Error(res.data.error);
  });

export const login = async (email, password) => {
  const { data } = await apiClient.post('/auth/login', { email, password });
  if (data.ok) {
    setAccessToken(data.token);
    return data.user;
  }
  throw new Error(data.error);
};

// ✅ CHANGED: clear token first, then call logout (no Bearer header will be sent)
export const logout = () => {
  clearAccessToken();                     // <-- remove token from memory
  return apiClient.post('/auth/logout')   // only cookie, no Authorization
    .finally(() => {
      window.location.replace('/login?logout=1');
    });
};

export const refreshToken = () =>
  apiClient.post('/auth/refresh').then(res => {
    if (res.data.ok) {
      setAccessToken(res.data.token);
      return res.data.token;
    }
    throw new Error(res.data.error);
  });

export const getMe = () =>
  apiClient.get('/auth/me').then(res => res.data);