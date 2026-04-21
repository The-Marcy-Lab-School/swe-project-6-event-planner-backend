// ====================================
// Auth
// ====================================

export const getMe = async () => {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return null;
  return res.json();
};

export const register = async (username, password) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed.');
  return data;
};

export const login = async (username, password) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed.');
  return data;
};

export const logout = async () => {
  await fetch('/api/auth/logout', { method: 'DELETE' });
};

// ====================================
// Users
// ====================================

export const updateUser = async (userId, password) => {
  const res = await fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update password.');
  return data;
};

export const deleteUser = async (userId) => {
  const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to delete account.');
  }
};

// ====================================
// Events
// ====================================

// Returns all events — filtering by type and capacity is done client-side in main.js
export const getEvents = async () => {
  const res = await fetch('/api/events');
  if (!res.ok) throw new Error('Failed to load events.');
  return res.json();
};

export const createEvent = async (eventData) => {
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create event.');
  return data;
};

export const updateEvent = async (eventId, eventData) => {
  const res = await fetch(`/api/events/${eventId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update event.');
  return data;
};

export const deleteEvent = async (eventId) => {
  const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to delete event.');
  }
};

export const getUserEvents = async (userId) => {
  const res = await fetch(`/api/users/${userId}/events`);
  if (!res.ok) throw new Error('Failed to load your events.');
  return res.json();
};

// ====================================
// RSVPs
// ====================================

export const rsvpToEvent = async (eventId) => {
  const res = await fetch(`/api/events/${eventId}/rsvps`, { method: 'POST' });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'RSVP failed.');
  }
};

export const unrsvpFromEvent = async (eventId) => {
  const res = await fetch(`/api/events/${eventId}/rsvps`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Un-RSVP failed.');
  }
};

export const getUserRsvps = async (userId) => {
  const res = await fetch(`/api/users/${userId}/rsvps`);
  if (!res.ok) throw new Error('Failed to load your RSVPs.');
  return res.json();
};
