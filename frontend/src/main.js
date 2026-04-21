import * as api from './fetch-helpers.js';
import * as dom from './dom-helpers.js';

// ====================================
// DOM refs for event listeners
// ====================================

const navAllEventsBtn    = document.querySelector('#nav-all-events-btn');
const navCreateEventBtn  = document.querySelector('#nav-create-event-btn');
const navMyEventsBtn     = document.querySelector('#nav-my-events-btn');
const navMyRsvpsBtn      = document.querySelector('#nav-my-rsvps-btn');
const navAccountBtn      = document.querySelector('#nav-account-btn');
const navLoginBtn        = document.querySelector('#nav-login-btn');
const navRegisterBtn     = document.querySelector('#nav-register-btn');
const navLogoutBtn       = document.querySelector('#nav-logout-btn');

const authOverlay         = document.querySelector('#auth-overlay');
const closeAuthBtn        = document.querySelector('#close-auth-btn');
const switchToRegisterBtn = document.querySelector('#switch-to-register-btn');
const switchToLoginBtn    = document.querySelector('#switch-to-login-btn');

const loginForm           = document.querySelector('#login-form');
const loginUsernameInput  = document.querySelector('#login-username');
const loginPasswordInput  = document.querySelector('#login-password');

const registerForm           = document.querySelector('#register-form');
const registerUsernameInput  = document.querySelector('#register-username');
const registerPasswordInput  = document.querySelector('#register-password');

const eventTypeFilter    = document.querySelector('#event-type-filter');
const minCapacityFilter  = document.querySelector('#min-capacity-filter');
const applyFiltersBtn    = document.querySelector('#apply-filters-btn');
const clearFiltersBtn    = document.querySelector('#clear-filters-btn');

const createEventForm    = document.querySelector('#create-event-form');
const editEventForm      = document.querySelector('#edit-event-form');
const cancelEditBtn      = document.querySelector('#cancel-edit-btn');

const updatePasswordForm = document.querySelector('#update-password-form');
const newPasswordInput   = document.querySelector('#new-password');
const deleteAccountBtn   = document.querySelector('#delete-account-btn');

// ====================================
// App State
// ====================================

let currentUser = null;
let allEvents = [];         // full unfiltered list from the server
let currentRsvpedEvents = []; // the logged-in user's RSVPed events

// ====================================
// Helpers
// ====================================

// Applies the current filter inputs to allEvents and re-renders — no network request.
const renderFilteredEvents = () => {
  const eventType  = eventTypeFilter.value;
  const minCap     = Number(minCapacityFilter.value);

  const filtered = allEvents.filter((event) => {
    if (eventType && event.event_type !== eventType) return false;
    if (minCap && Number(event.max_capacity) < minCap) return false;
    return true;
  });

  dom.renderEvents(filtered, currentUser?.user_id, currentRsvpedEvents);
};

// Fetches fresh data from the server (all events + current user's RSVPs),
// stores them in module state, then re-renders with the active filters applied.
// Called on init, after login/logout, and after any RSVP change.
const loadAllEvents = async () => {
  dom.clearEventsError();
  try {
    [allEvents, currentRsvpedEvents] = await Promise.all([
      api.getEvents(),
      currentUser ? api.getUserRsvps(currentUser.user_id) : Promise.resolve([]),
    ]);
    renderFilteredEvents();
  } catch (err) {
    dom.showEventsError(err.message);
  }
};

// ====================================
// Init
// ====================================

const init = async () => {
  currentUser = await api.getMe();
  if (currentUser) {
    dom.renderLoggedIn(currentUser);
  } else {
    dom.renderLoggedOut();
  }
  await loadAllEvents();
};

// ====================================
// Navigation
// ====================================

navAllEventsBtn.addEventListener('click', async () => {
  dom.showAllEventsView();
  await loadAllEvents();
});

navCreateEventBtn.addEventListener('click', () => {
  dom.clearCreateEventError();
  dom.showCreateEventView();
});

navMyEventsBtn.addEventListener('click', async () => {
  dom.showMyEventsView();
  dom.clearMyEventsError();
  try {
    const events = await api.getUserEvents(currentUser.user_id);
    dom.renderMyEvents(events);
  } catch (err) {
    dom.showMyEventsError(err.message);
  }
});

navMyRsvpsBtn.addEventListener('click', async () => {
  dom.showMyRsvpsView();
  dom.clearMyRsvpsError();
  try {
    const events = await api.getUserRsvps(currentUser.user_id);
    dom.renderMyRsvps(events);
  } catch (err) {
    dom.showMyRsvpsError(err.message);
  }
});

navAccountBtn.addEventListener('click', () => {
  dom.showAccountView();
  dom.renderAccountView(currentUser);
});

// ====================================
// Auth Modal
// ====================================

navLoginBtn.addEventListener('click', () => {
  dom.showAuthModal();
  dom.showLoginPanel();
});

navRegisterBtn.addEventListener('click', () => {
  dom.showAuthModal();
  dom.showRegisterPanel();
});

navLogoutBtn.addEventListener('click', async () => {
  await api.logout();
  currentUser = null;
  dom.renderLoggedOut();
  dom.showAllEventsView();
  await loadAllEvents();
});

closeAuthBtn.addEventListener('click', () => dom.hideAuthModal());

// Close modal when clicking the backdrop
authOverlay.addEventListener('click', (e) => {
  if (e.target === authOverlay) dom.hideAuthModal();
});

switchToRegisterBtn.addEventListener('click', () => dom.showRegisterPanel());
switchToLoginBtn.addEventListener('click', () => dom.showLoginPanel());

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    currentUser = await api.login(loginUsernameInput.value, loginPasswordInput.value);
    dom.renderLoggedIn(currentUser);
    dom.hideAuthModal();
    loginForm.reset();
    await loadAllEvents();
  } catch (err) {
    dom.showLoginError(err.message);
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    currentUser = await api.register(registerUsernameInput.value, registerPasswordInput.value);
    dom.renderLoggedIn(currentUser);
    dom.hideAuthModal();
    registerForm.reset();
    await loadAllEvents();
  } catch (err) {
    dom.showRegisterError(err.message);
  }
});

// ====================================
// Filters
// ====================================

// Filtering is purely client-side — no network request needed, just re-render.
applyFiltersBtn.addEventListener('click', () => {
  renderFilteredEvents();
});

clearFiltersBtn.addEventListener('click', () => {
  eventTypeFilter.value = '';
  minCapacityFilter.value = '';
  renderFilteredEvents();
});

// ====================================
// Create Event
// ====================================

createEventForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  dom.clearCreateEventError();
  try {
    await api.createEvent({
      title:        document.querySelector('#create-title').value,
      description:  document.querySelector('#create-description').value,
      date:         document.querySelector('#create-date').value,
      location:     document.querySelector('#create-location').value,
      event_type:   document.querySelector('#create-event-type').value,
      max_capacity: Number(document.querySelector('#create-max-capacity').value),
    });
    createEventForm.reset();
    dom.showMyEventsView();
    const events = await api.getUserEvents(currentUser.user_id);
    dom.renderMyEvents(events);
  } catch (err) {
    dom.showCreateEventError(err.message);
  }
});

// ====================================
// Edit Event
// ====================================

editEventForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  dom.clearEditEventError();
  const eventId = document.querySelector('#edit-event-id').value;
  try {
    await api.updateEvent(eventId, {
      title:        document.querySelector('#edit-title').value,
      description:  document.querySelector('#edit-description').value,
      date:         document.querySelector('#edit-date').value,
      location:     document.querySelector('#edit-location').value,
      event_type:   document.querySelector('#edit-event-type').value,
      max_capacity: Number(document.querySelector('#edit-max-capacity').value),
    });
    dom.showMyEventsView();
    const events = await api.getUserEvents(currentUser.user_id);
    dom.renderMyEvents(events);
  } catch (err) {
    dom.showEditEventError(err.message);
  }
});

cancelEditBtn.addEventListener('click', async () => {
  dom.showMyEventsView();
  const events = await api.getUserEvents(currentUser.user_id);
  dom.renderMyEvents(events);
});

// ====================================
// Event Delegation — All Events grid (RSVP / Un-RSVP)
// ====================================

dom.eventsGrid.addEventListener('click', async (e) => {
  const doRsvpBtn  = e.target.closest('.do-rsvp');
  const unRsvpBtn  = e.target.closest('.un-rsvp');

  if (doRsvpBtn) {
    try {
      await api.rsvpToEvent(doRsvpBtn.dataset.eventId);
      await loadAllEvents();
    } catch (err) {
      dom.showEventsError(err.message);
    }
  }

  if (unRsvpBtn) {
    try {
      await api.unrsvpFromEvent(unRsvpBtn.dataset.eventId);
      await loadAllEvents();
    } catch (err) {
      dom.showEventsError(err.message);
    }
  }
});

// ====================================
// Event Delegation — My Events grid (Edit / Delete)
// ====================================

dom.myEventsGrid.addEventListener('click', async (e) => {
  const editBtn   = e.target.closest('.edit-event-btn');
  const deleteBtn = e.target.closest('.delete-event-btn');

  if (editBtn) {
    try {
      const events = await api.getUserEvents(currentUser.user_id);
      const event  = events.find((ev) => Number(ev.event_id) === Number(editBtn.dataset.eventId));
      if (event) dom.showEditEventView(event);
    } catch (err) {
      dom.showMyEventsError(err.message);
    }
  }

  if (deleteBtn) {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    try {
      await api.deleteEvent(deleteBtn.dataset.eventId);
      const events = await api.getUserEvents(currentUser.user_id);
      dom.renderMyEvents(events);
    } catch (err) {
      dom.showMyEventsError(err.message);
    }
  }
});

// ====================================
// Account
// ====================================

updatePasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  dom.clearUpdatePasswordError();
  try {
    await api.updateUser(currentUser.user_id, newPasswordInput.value);
    updatePasswordForm.reset();
    dom.showUpdatePasswordSuccess('Password updated successfully!');
  } catch (err) {
    dom.showUpdatePasswordError(err.message);
  }
});

deleteAccountBtn.addEventListener('click', async () => {
  if (!confirm('Permanently delete your account? This cannot be undone.')) return;
  try {
    await api.deleteUser(currentUser.user_id);
    currentUser = null;
    dom.renderLoggedOut();
    dom.showAllEventsView();
    await loadAllEvents();
  } catch (err) {
    dom.showDeleteAccountError(err.message);
  }
});

// ====================================
// Start
// ====================================

init();
