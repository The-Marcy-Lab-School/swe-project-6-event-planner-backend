// ====================================
// DOM References
// ====================================

// Views
const allEventsView   = document.querySelector('#all-events-view');
const createEventView = document.querySelector('#create-event-view');
const editEventView   = document.querySelector('#edit-event-view');
const myEventsView    = document.querySelector('#my-events-view');
const myRsvpsView     = document.querySelector('#my-rsvps-view');
const accountView     = document.querySelector('#account-view');
const allViews = [allEventsView, createEventView, editEventView, myEventsView, myRsvpsView, accountView];

// Grids
const eventsGrid   = document.querySelector('#events-grid');
const myEventsGrid = document.querySelector('#my-events-grid');
const myRsvpsGrid  = document.querySelector('#my-rsvps-grid');

// Nav auth elements
const navUsername    = document.querySelector('#nav-username');
const navLoginBtn    = document.querySelector('#nav-login-btn');
const navRegisterBtn = document.querySelector('#nav-register-btn');
const navLogoutBtn   = document.querySelector('#nav-logout-btn');

// Nav link buttons (authenticated only)
const navCreateEventBtn = document.querySelector('#nav-create-event-btn');
const navMyEventsBtn    = document.querySelector('#nav-my-events-btn');
const navMyRsvpsBtn     = document.querySelector('#nav-my-rsvps-btn');
const navAccountBtn     = document.querySelector('#nav-account-btn');

// Auth modal
const authOverlay      = document.querySelector('#auth-overlay');
const loginPanel       = document.querySelector('#login-panel');
const registerPanel    = document.querySelector('#register-panel');

// Edit form fields (pre-filled when opening the edit view)
const editEventIdInput    = document.querySelector('#edit-event-id');
const editTitleInput      = document.querySelector('#edit-title');
const editDescriptionInput = document.querySelector('#edit-description');
const editDateInput       = document.querySelector('#edit-date');
const editLocationInput   = document.querySelector('#edit-location');
const editEventTypeInput  = document.querySelector('#edit-event-type');
const editMaxCapacityInput = document.querySelector('#edit-max-capacity');

// Account view
const accountUsernameDisplay = document.querySelector('#account-username-display');

// Error / success elements
const eventsError          = document.querySelector('#events-error');
const myEventsError        = document.querySelector('#my-events-error');
const myRsvpsError         = document.querySelector('#my-rsvps-error');
const loginError           = document.querySelector('#login-error');
const registerError        = document.querySelector('#register-error');
const createEventError     = document.querySelector('#create-event-error');
const editEventError       = document.querySelector('#edit-event-error');
const updatePasswordError  = document.querySelector('#update-password-error');
const updatePasswordSuccess = document.querySelector('#update-password-success');
const deleteAccountError   = document.querySelector('#delete-account-error');

// ====================================
// Helpers
// ====================================

// Adds 'T00:00:00' to prevent the date string from being parsed in UTC,
// which can shift the displayed date back by one day.
const formatDate = (dateStr) => new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
});

const showEl = (el) => el.classList.remove('hidden');
const hideEl = (el) => el.classList.add('hidden');

// ====================================
// View Management
// ====================================

export const showAllEventsView = () => {
  allViews.forEach(hideEl);
  showEl(allEventsView);
};

export const showCreateEventView = () => {
  allViews.forEach(hideEl);
  showEl(createEventView);
};

export const showMyEventsView = () => {
  allViews.forEach(hideEl);
  showEl(myEventsView);
};

export const showMyRsvpsView = () => {
  allViews.forEach(hideEl);
  showEl(myRsvpsView);
};

export const showAccountView = () => {
  allViews.forEach(hideEl);
  showEl(accountView);
};

// Pre-fills the edit form with the existing event data before showing the view.
export const showEditEventView = (event) => {
  editEventIdInput.value      = event.event_id;
  editTitleInput.value        = event.title;
  editDescriptionInput.value  = event.description || '';
  editDateInput.value         = event.date;
  editLocationInput.value     = event.location;
  editEventTypeInput.value    = event.event_type;
  editMaxCapacityInput.value  = event.max_capacity;
  allViews.forEach(hideEl);
  showEl(editEventView);
};

// ====================================
// Auth State
// ====================================

export const renderLoggedIn = (user) => {
  navUsername.textContent = `Hi, ${user.username}!`;
  showEl(navUsername);
  hideEl(navLoginBtn);
  hideEl(navRegisterBtn);
  showEl(navLogoutBtn);
  showEl(navCreateEventBtn);
  showEl(navMyEventsBtn);
  showEl(navMyRsvpsBtn);
  showEl(navAccountBtn);
};

export const renderLoggedOut = () => {
  navUsername.textContent = '';
  hideEl(navUsername);
  showEl(navLoginBtn);
  showEl(navRegisterBtn);
  hideEl(navLogoutBtn);
  hideEl(navCreateEventBtn);
  hideEl(navMyEventsBtn);
  hideEl(navMyRsvpsBtn);
  hideEl(navAccountBtn);
};

// ====================================
// Auth Modal
// ====================================

export const showAuthModal = () => showEl(authOverlay);
export const hideAuthModal = () => hideEl(authOverlay);

export const showLoginPanel = () => {
  showEl(loginPanel);
  hideEl(registerPanel);
  clearLoginError();
};

export const showRegisterPanel = () => {
  showEl(registerPanel);
  hideEl(loginPanel);
  clearRegisterError();
};

// ====================================
// Error / Success Feedback
// ====================================

const showFeedback  = (el, msg) => { el.textContent = msg; showEl(el); };
const clearFeedback = (el)      => { el.textContent = '';  hideEl(el); };

export const showLoginError    = (msg) => showFeedback(loginError, msg);
export const clearLoginError   = ()    => clearFeedback(loginError);

export const showRegisterError  = (msg) => showFeedback(registerError, msg);
export const clearRegisterError = ()    => clearFeedback(registerError);

export const showCreateEventError  = (msg) => showFeedback(createEventError, msg);
export const clearCreateEventError = ()    => clearFeedback(createEventError);

export const showEditEventError  = (msg) => showFeedback(editEventError, msg);
export const clearEditEventError = ()    => clearFeedback(editEventError);

export const showEventsError  = (msg) => showFeedback(eventsError, msg);
export const clearEventsError = ()    => clearFeedback(eventsError);

export const showMyEventsError  = (msg) => showFeedback(myEventsError, msg);
export const clearMyEventsError = ()    => clearFeedback(myEventsError);

export const showMyRsvpsError  = (msg) => showFeedback(myRsvpsError, msg);
export const clearMyRsvpsError = ()    => clearFeedback(myRsvpsError);

export const showUpdatePasswordError   = (msg) => showFeedback(updatePasswordError, msg);
export const clearUpdatePasswordError  = ()    => clearFeedback(updatePasswordError);
export const showUpdatePasswordSuccess = (msg) => {
  showFeedback(updatePasswordSuccess, msg);
  setTimeout(() => clearFeedback(updatePasswordSuccess), 3000);
};

export const showDeleteAccountError = (msg) => showFeedback(deleteAccountError, msg);

// ====================================
// Account View
// ====================================

export const renderAccountView = (user) => {
  accountUsernameDisplay.textContent = `Logged in as ${user.username}`;
};

// ====================================
// Event Card Rendering
// ====================================

// Builds a single event card element.
// options.currentUserId  — ID of the logged-in user (null if logged out)
// options.rsvpSet        — Set of event_ids the current user has RSVPed to
// options.showRsvp       — whether to show RSVP/Un-RSVP button
// options.showEditDelete — whether to show Edit / Delete buttons
const buildEventCard = (event, options = {}) => {
  const { currentUserId, rsvpSet = new Set(), showRsvp = false, showEditDelete = false } = options;
  const isRsvped  = rsvpSet.has(Number(event.event_id));
  const rsvpCount = Number(event.rsvp_count) || 0;

  const card = document.createElement('div');
  card.className = 'event-card';
  card.dataset.eventId = event.event_id;

  const footerButtons = [];
  if (showRsvp) {
    footerButtons.push(
      isRsvped
        ? `<button class="btn-secondary rsvp-btn un-rsvp" data-event-id="${event.event_id}">Un-RSVP</button>`
        : `<button class="btn-primary rsvp-btn do-rsvp" data-event-id="${event.event_id}">RSVP</button>`
    );
  }
  if (showEditDelete) {
    footerButtons.push(`<button class="btn-secondary edit-event-btn" data-event-id="${event.event_id}">Edit</button>`);
    footerButtons.push(`<button class="btn-danger delete-event-btn" data-event-id="${event.event_id}">Delete</button>`);
  }

  card.innerHTML = `
    <div class="event-card-header">
      <span class="event-type-badge badge-${event.event_type}">${event.event_type}</span>
    </div>
    <div class="event-card-body">
      <h3 class="event-title">${event.title}</h3>
      ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
      <div class="event-meta">
        <span class="event-meta-item">📅 ${formatDate(event.date)}</span>
        <span class="event-meta-item">📍 ${event.location}</span>
        ${event.username ? `<span class="event-meta-item">👤 ${event.username}</span>` : ''}
        <span class="event-meta-item">🎟️ ${rsvpCount} / ${event.max_capacity} attending</span>
      </div>
    </div>
    ${footerButtons.length ? `<div class="event-card-footer">${footerButtons.join('')}</div>` : ''}
  `;

  return card;
};

// Renders the public event feed.
// When logged in, shows an RSVP button on events the user didn't create.
export const renderEvents = (events, currentUserId, rsvpedEvents = []) => {
  eventsGrid.innerHTML = '';
  if (!events.length) {
    eventsGrid.innerHTML = '<p class="empty-state">No events found.</p>';
    return;
  }
  const rsvpSet = new Set(rsvpedEvents.map((e) => Number(e.event_id)));
  events.forEach((event) => {
    const isOwnEvent = Number(event.user_id) === Number(currentUserId);
    const card = buildEventCard(event, {
      currentUserId,
      rsvpSet,
      showRsvp: !!currentUserId && !isOwnEvent,
      showEditDelete: false,
    });
    eventsGrid.appendChild(card);
  });
};

// Renders the user's created events with Edit / Delete buttons.
export const renderMyEvents = (events) => {
  myEventsGrid.innerHTML = '';
  if (!events.length) {
    myEventsGrid.innerHTML = '<p class="empty-state">You haven\'t created any events yet.</p>';
    return;
  }
  events.forEach((event) => {
    const card = buildEventCard(event, { showEditDelete: true });
    myEventsGrid.appendChild(card);
  });
};

// Renders events the user has RSVPed to in a grid.
export const renderMyRsvps = (events) => {
  myRsvpsGrid.innerHTML = '';
  if (!events.length) {
    myRsvpsGrid.innerHTML = '<p class="empty-state">You haven\'t RSVPed to any events yet.</p>';
    return;
  }
  events.forEach((event) => {
    myRsvpsGrid.appendChild(buildEventCard(event));
  });
};

// ====================================
// Exported refs needed by main.js
// ====================================
export { eventsGrid, myEventsGrid };
