# EventPlanner — Final Project

## Overview

In a professional setting, a backend engineer receives a **spec** — a database schema, an API contract, and access to existing code that uses the same patterns — and is expected to build a server that satisfies it. They don't get step-by-step instructions. They read the spec, study the codebase, and figure out how to connect the pieces.

This project puts you in that position. You'll build the **entire backend** for a working event planning application. The frontend is already complete — it makes fetch requests to specific endpoints and expects specific response shapes. Your job is to implement a server that fulfills the API contract so the frontend works end-to-end.

**What the app does:**
- Users can create accounts, log in, and manage their account (update password, delete)
- Authenticated users can create, edit, and delete their own events
- All visitors can browse the public event feed with filters by type and minimum capacity
- Authenticated users can RSVP and un-RSVP to events
- Each user can view their created events and their RSVPed events

**What you're given:**
- A complete frontend (you won't modify this)
- The database schema (exact tables, columns, and constraints)
- The API contract (every endpoint, its request format, and its response shape)
- Two reference applications that use the same patterns you'll need

**What you'll build:**
- A PostgreSQL database with three tables
- An Express server with models, controllers, and middleware following the MVC pattern

---

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Initial Setup](#initial-setup)
- [Reference Applications](#reference-applications)
- [Phase 1: The Database](#phase-1-the-database)
  - [Schema](#schema)
  - [Seed Data](#seed-data)
  - [Phase 1 Success Checks](#phase-1-success-checks)
- [Phase 2: Models](#phase-2-models)
  - [Phase 2 Success Checks](#phase-2-success-checks)
- [Phase 3: Controllers \& the Server](#phase-3-controllers--the-server)
  - [Phase 3 Success Checks](#phase-3-success-checks)
- [API Contract](#api-contract)
  - [Testing with curl](#testing-with-curl)
  - [Auth](#auth)
  - [Users](#users)
  - [Events](#events)
  - [RSVPs](#rsvps)
- [AI Usage Documentation](#ai-usage-documentation)
  - [Example Documentation](#example-documentation)
- [Grading Checklist (36 points)](#grading-checklist-36-points)
  - [Database (6 points)](#database-6-points)
  - [Authentication (6 points)](#authentication-6-points)
  - [User Account Management (3 points)](#user-account-management-3-points)
  - [Events — Read (2 points)](#events--read-2-points)
  - [Events — Write (4 points)](#events--write-4-points)
  - [RSVPs (4 points)](#rsvps-4-points)
  - [Error Handling (6 points)](#error-handling-6-points)
  - [Code Quality (4 points)](#code-quality-4-points)
  - [AI Usage Documentation (1 points)](#ai-usage-documentation-1-points)

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally)

### Initial Setup

**1. Fork and clone this repo.**

**2. Create the `server/` directory** with this file structure:

```
server/
├── index.js
├── package.json
├── .env
├── db/
│   ├── pool.js
│   └── seed.js
├── middleware/
│   ├── checkAuthentication.js
│   └── logRoutes.js
├── models/
│   ├── userModel.js
│   ├── eventModel.js
│   └── rsvpModel.js
└── controllers/
    ├── authControllers.js
    ├── userControllers.js
    ├── eventControllers.js
    └── rsvpControllers.js
```

**3. Install server dependencies:**
```sh
cd server
npm init -y
npm install express pg bcrypt cookie-session dotenv
npm install --save-dev nodemon
```

**4. Create the database:**
```sh
# Mac
createdb event_planner_db

# Windows
sudo -u postgres createdb event_planner_db
```

**5. Create your `.env` file**. Then fill in your local PostgreSQL credentials and a session secret string of your choice.

---

## Reference Applications

These are the two applications you built during lecture. They use the same architecture, patterns, and libraries that your server will use. **Study them.** Most of your boilerplate (`pool.js`, middleware, `index.js` structure) can be adapted directly from these apps. The real work is in `seed.js`, the models, and the controllers — where you'll need to apply the patterns to this project's specific schema and endpoints.

[https://github.com/The-Marcy-Lab-School/6-13-production-deployment](https://github.com/The-Marcy-Lab-School/6-13-production-deployment) — Your primary reference. A complete MVC server with users and bookmarks. Look at:
- `server/db/` — `pool.js` and `seed.js` (two-table schema with a foreign key)
- `server/models/` — `userModel.js` (bcrypt, CRUD) and `bookmarkModel.js` (CRUD with a JOIN for usernames)
- `server/controllers/` — auth flow, ownership checks (comparing URL params to the session), error responses
- `server/middleware/` — `checkAuthentication.js` and `logRoutes.js`
- `server/index.js` — how everything is wired together

[https://github.com/The-Marcy-Lab-School/swe-casestudy-6-social-bookmark-manager](https://github.com/The-Marcy-Lab-School/swe-casestudy-6-social-bookmark-manager) — Your reference for the RSVP feature. This app adds a `bookmark_likes` junction table on top of the same bookmark structure. Look at:
- `server/db/seed.js` — three-table schema, the junction table with `UNIQUE` constraint
- `server/models/bookmarkModel.js` — `LEFT JOIN` + `COUNT` + `GROUP BY` for like counts, `ON CONFLICT DO NOTHING` for idempotent likes

---

## Phase 1: The Database

Build `db/pool.js` and `db/seed.js`. You can't do anything else until you have a working database with seeded data.

Implement your seed file to create the schema and insert test data. See `6-13`'s `db/` directory for the pattern.

### Schema

Your seed file must create these three tables:

**`users`**
| Column          | Type     | Constraints        |
| --------------- | -------- | ------------------ |
| `user_id`       | `SERIAL` | `PRIMARY KEY`      |
| `username`      | `TEXT`   | `UNIQUE, NOT NULL` |
| `password_hash` | `TEXT`   | `NOT NULL`         |

**`events`**

| Column         | Type      | Constraints                                   |
| -------------- | --------- | --------------------------------------------- |
| `event_id`     | `SERIAL`  | `PRIMARY KEY`                                 |
| `title`        | `TEXT`    | `NOT NULL`                                    |
| `description`  | `TEXT`    |                                               |
| `date`         | `TEXT`    | `NOT NULL`                                    |
| `location`     | `TEXT`    | `NOT NULL`                                    |
| `event_type`   | `TEXT`    | `NOT NULL`                                    |
| `max_capacity` | `INTEGER` | `NOT NULL`                                    |
| `user_id`      | `INTEGER` | `REFERENCES users(user_id) ON DELETE CASCADE` |

Valid values for `event_type`: `conference`, `workshop`, `social`, `networking`, `concert`, `sports`, `fundraiser`, `other`

**`rsvps`**

| Column     | Type      | Constraints                                     |
| ---------- | --------- | ----------------------------------------------- |
| `rsvp_id`  | `SERIAL`  | `PRIMARY KEY`                                   |
| `user_id`  | `INTEGER` | `REFERENCES users(user_id) ON DELETE CASCADE`   |
| `event_id` | `INTEGER` | `REFERENCES events(event_id) ON DELETE CASCADE` |
|            |           | `UNIQUE (user_id, event_id)`                    |

### Seed Data

Insert at least 3 users and a handful of events spread across multiple `event_type` values. Seed some RSVPs too so the frontend has data to display on first load. See the case study's `seed.js` for how to handle a three-table schema with foreign keys.

### Phase 1 Success Checks

You will know that you've successfully set up your database if you can run the seed file and then select data from your tables:

```sh
node db/seed.js
```

Then verify in `psql`:

```sql
\dt                                         -- all three tables should appear
SELECT user_id, username FROM users;        -- seeded users (no password_hash!)
SELECT event_id, title, event_type FROM events;
SELECT * FROM rsvps;
```

Don't move on until all three tables exist and contain data.

---

## Phase 2: Models

Build `userModel.js`, `eventModel.js`, and `rsvpModel.js`. Each model exports functions that run SQL queries and return results — controllers will call these functions but never write SQL themselves.

Read the [API Contract](#api-contract) below to understand what data each endpoint needs to return. Your models are the functions that provide that data. Work backwards: look at an endpoint's response shape, then write the SQL query that produces it.

- `userModel.js` and the basic CRUD in `eventModel.js` follow the same patterns as the models in `6-13`.
- The `rsvps` table mirrors `bookmark_likes` in the case study. The patterns for creating, deleting, and querying likes translate directly to managing RSVPs.
- The `GET /api/events` response includes `username` and `rsvp_count` — look at how the case study's `bookmarkModel.list()` achieves the same thing with `bookmark_likes`.

### Phase 2 Success Checks

Verify your models can query the database by creating a temporary `server/test.js` that imports and invokes your model methods:

```js
// server/test.js — delete after testing
require('dotenv').config();
const eventModel = require('./models/eventModel');

const test = async () => {
  console.log(await eventModel.list()); // list all events with username and rsvp_count

  // more model methods...

  // Kill the process (the open pool connections) after running queries
  process.exit();
}
test();
```

---

## Phase 3: Controllers & the Server

Build the middleware, controllers, and `index.js`. Most of this is structural boilerplate — `index.js`, `logRoutes.js`, and `checkAuthentication.js` can be adapted directly from `6-13` with minimal changes (different imports, different route paths).

The controllers are where you connect routes to models. The [API Contract](#api-contract) below defines exactly what each endpoint receives and returns — including which error status codes to use and when. Study how `6-13`'s controllers handle auth, ownership checks, and error responses, then apply those patterns to the endpoints listed in the contract.

> **Session note:** You'll store the logged-in user's ID in the session cookie (e.g. `req.session.userId`). The specific key name is up to you — just be consistent across your controllers and `checkAuthentication` middleware.

### Phase 3 Success Checks

Start the server:
```sh
node index.js
```

Then test with curl. Start with these three to confirm the basics work:

```sh
# Register a user and save the session cookie
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  -c cookies.txt | jq

# Confirm the session persists
curl -s http://localhost:8080/api/auth/me -b cookies.txt | jq

# Confirm the public event feed works
curl -s http://localhost:8080/api/events | jq
```

Then work through the full curl suite in the [API Contract](#api-contract) to verify every endpoint. When they all pass, open the frontend at `http://localhost:8080` — if your server satisfies the contract, the full frontend UI should work.

---

## API Contract

The frontend is already written. It expects your backend to implement these exact endpoints. Method, path, and response shape must match — or the frontend will break.

### Testing with curl

Each endpoint below includes a curl command so you can test your API directly from the terminal without needing the frontend. A few things to know:

- **`| jq`** — pretty-prints JSON responses. Install with `brew install jq`. It's optional; remove it if you don't have it.
- **`-c cookies.txt`** — saves the session cookie to a file after login or register.
- **`-b cookies.txt`** — sends the saved cookie on subsequent requests. Required for any auth-protected endpoint.

---

### Auth

**`POST /api/auth/register`**

Register a new user and automatically log them in.

**Request body:**
```json
{ "username": "alice", "password": "password123" }
```

**Success `201`:**
```json
{ "user_id": 1, "username": "alice" }
```

**Error `400`** — missing fields  
**Error `409`** — username already taken

```sh
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}' \
  -c cookies.txt | jq
```

---

**`POST /api/auth/login`**


**Request body:**
```json
{ "username": "alice", "password": "password123" }
```

**Success `200`:**
```json
{ "user_id": 1, "username": "alice" }
```

**Error `401`** — invalid credentials

```sh
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}' \
  -c cookies.txt | jq
```

---

**`GET /api/auth/me`**

Returns the currently logged-in user, or `null` if no session exists.

**Success `200` (logged in):**
```json
{ "user_id": 1, "username": "alice" }
```

**`401` (not logged in):**
```json
null
```

```sh
curl -s http://localhost:8080/api/auth/me \
  -b cookies.txt | jq
```

---

**`DELETE /api/auth/logout`**


**Success `200`:**
```json
{ "message": "Logged out." }
```

```sh
curl -s -X DELETE http://localhost:8080/api/auth/logout \
  -b cookies.txt | jq
```

---

### Users

**`PATCH /api/users/:user_id`**

Update the logged-in user's password. **Auth required.** Users may only update their own account.

**Request body:**
```json
{ "password": "newpassword456" }
```

**Success `200`:**
```json
{ "user_id": 1, "username": "alice" }
```

**Error `400`** — missing password  
**Error `401`** — not logged in  
**Error `403`** — trying to update a different user  
**Error `404`** — user not found

```sh
curl -s -X PATCH http://localhost:8080/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"password":"newpassword456"}' \
  -b cookies.txt | jq
```

---

**`DELETE /api/users/:user_id`**

Delete the logged-in user's account. **Auth required.** Users may only delete their own account.

**Success `200`:**
```json
{ "user_id": 1, "username": "alice" }
```

**Error `401`** — not logged in  
**Error `403`** — trying to delete a different user  
**Error `404`** — user not found

```sh
curl -s -X DELETE http://localhost:8080/api/users/1 \
  -b cookies.txt | jq
```

---

### Events

**`GET /api/events`**

Returns all events sorted by date ascending. Public — no auth required.

Filtering by event type and minimum capacity is handled in the frontend. Your server should return the full list on every request.

**Success `200`:**
```json
[
  {
    "event_id": 1,
    "title": "React & Node Workshop",
    "description": "A hands-on workshop...",
    "date": "2025-06-01",
    "location": "New York, NY",
    "event_type": "workshop",
    "max_capacity": 30,
    "user_id": 1,
    "username": "alice",
    "rsvp_count": "3"
  }
]
```

> `rsvp_count` is returned as a string by PostgreSQL's `COUNT`. The frontend handles this with `Number(event.rsvp_count)`.

```sh
curl -s http://localhost:8080/api/events | jq
```

---

**`POST /api/events`**

Create a new event owned by the logged-in user. **Auth required.**

**Request body:**
```json
{
  "title": "Morning Yoga",
  "description": "Optional description",
  "date": "2025-09-15",
  "location": "Central Park, NY",
  "event_type": "social",
  "max_capacity": 40
}
```

**Success `201`:** The newly created event row.

**Error `400`** — missing required fields or invalid `event_type`  
**Error `401`** — not logged in

```sh
curl -s -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Morning Yoga","description":"Relaxing group session","date":"2025-09-15","location":"Central Park, NY","event_type":"social","max_capacity":40}' \
  -b cookies.txt | jq
```

---

**`PATCH /api/events/:event_id`**

Update an event. **Auth required.** Owner only.

**Request body:** Any subset of the event fields (same shape as POST).

**Success `200`:** The updated event row.

**Error `401`** — not logged in  
**Error `403`** — not the owner  
**Error `404`** — event not found

```sh
curl -s -X PATCH http://localhost:8080/api/events/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","max_capacity":60}' \
  -b cookies.txt | jq
```

---

**`DELETE /api/events/:event_id`**

Delete an event. **Auth required.** Owner only.

**Success `200`:** The deleted event row.

**Error `401`** — not logged in  
**Error `403`** — not the owner  
**Error `404`** — event not found

```sh
curl -s -X DELETE http://localhost:8080/api/events/1 \
  -b cookies.txt | jq
```

---

**`GET /api/users/:user_id/events`**

Returns all events created by a specific user (with RSVP counts). Public.

**Success `200`:** Array of event objects (same shape as `GET /api/events`, without `username`).

```sh
curl -s http://localhost:8080/api/users/1/events | jq
```

---

### RSVPs

**`POST /api/events/:event_id/rsvps`**

RSVP the logged-in user to an event. **Auth required.**  
If the user has already RSVPed, this should succeed silently (no error).

**Success `201`:** The new RSVP row, or `null` if already RSVPed.

**Error `401`** — not logged in

```sh
curl -s -X POST http://localhost:8080/api/events/1/rsvps \
  -b cookies.txt | jq
```

---

**`DELETE /api/events/:event_id/rsvps`**

Remove the logged-in user's RSVP from an event. **Auth required.**

**Success `200`:** The deleted RSVP row, or `null` if no RSVP existed.

**Error `401`** — not logged in

```sh
curl -s -X DELETE http://localhost:8080/api/events/1/rsvps \
  -b cookies.txt | jq
```

---

**`GET /api/users/:user_id/rsvps`**

Returns **full event objects** (not just RSVP rows) for every event the user has RSVPed to. Public.

**Success `200`:** Array of event objects in the same shape as `GET /api/events`.

```sh
curl -s http://localhost:8080/api/users/1/rsvps | jq
```

---

## AI Usage Documentation

You are **encouraged and expected** to use AI tools (Claude, ChatGPT, Copilot, etc.) as you work through this project. 

Inside of the [AI_DOCUMENTATION.md](./AI_DOCUMENTATION.md) file, document **1 specific example** of how you used AI. 

Be specific and answer the following questions:

**1. What did you ask the AI to help you with (include the prompt), and why did you choose to use AI for that specific task?**

Be specific — don't just say "I was stuck." Describe the exact problem you were facing, the prompt you used, and walk through your thinking: Why was this a good moment to turn to AI? What made it different from something you'd Google, ask a classmate, or work through yourself?

**2. How did you evaluate whether the AI's output was correct or useful before using it?**

AI can be wrong — and confidently wrong. Before you used what it gave you, how did you check it? Did you run it and test edge cases? Did you read through it line by line and make sure you could explain it? If you discovered the output wasn't quite right, describe that too — those are actually your strongest examples.

**3. How did what the AI produced differ from what you ultimately used, and what does that tell you about your own understanding of the problem?**

Your final solution probably didn't look exactly like what the AI gave you. What did you change, and why? If you used the output as-is, that's worth reflecting on too — can you explain exactly why it worked? Your answer here is the clearest window into what you actually understand.

**4. What did you learn from using AI in this way?**

Perhaps you learned a new concept or a new strategy for using AI. Share your learnings and what you will be taking away from this process!

### Example Documentation

Check out [AI_DOCUMENTATION_EXAMPLE.md](./AI_DOCUMENTATION_EXAMPLE.md) to see the kind of detail that we're looking for.

---

## Grading Checklist (36 points)

### Database (6 points)
- [ ] `users` table matches the required schema
- [ ] `events` table matches the required schema, with FK to `users`
- [ ] `rsvps` junction table matches the required schema, with FKs to both `users` and `events`
- [ ] `ON DELETE CASCADE` is set on `events.user_id` and both FKs in `rsvps`
- [ ] `UNIQUE (user_id, event_id)` constraint exists on `rsvps`
- [ ] Database is seeded with at least 3 users and several events across multiple types

### Authentication (6 points)
- [ ] Passwords are hashed with `bcrypt` — plain-text passwords are never stored
- [ ] `POST /api/auth/register` creates a user, starts a session, returns `{ user_id, username }`
- [ ] `POST /api/auth/login` validates credentials, starts a session, returns `{ user_id, username }`
- [ ] `GET /api/auth/me` returns the logged-in user from the session (or 401)
- [ ] `DELETE /api/auth/logout` clears the session
- [ ] The logged-in user's ID is stored in the session cookie

### User Account Management (3 points)
- [ ] `PATCH /api/users/:user_id` updates the user's password (auth required)
- [ ] `DELETE /api/users/:user_id` deletes the user's account (auth required)
- [ ] Both routes return `403` if the requesting user does not own the account

### Events — Read (2 points)
- [ ] `GET /api/events` returns all events with `username` (via JOIN) and `rsvp_count` (via LEFT JOIN + COUNT)
- [ ] `GET /api/users/:user_id/events` returns that user's created events

### Events — Write (4 points)
- [ ] `POST /api/events` creates an event owned by the session user (auth required)
- [ ] `PATCH /api/events/:event_id` updates the event (auth required, owner only)
- [ ] `DELETE /api/events/:event_id` deletes the event (auth required, owner only)
- [ ] Both mutation routes fetch the event first and return `403` if the session user doesn't own it

### RSVPs (4 points)
- [ ] `POST /api/events/:event_id/rsvps` RSVPs the session user to the event (auth required)
- [ ] Duplicate RSVPs do not cause a server error (`ON CONFLICT DO NOTHING`)
- [ ] `DELETE /api/events/:event_id/rsvps` removes the session user's RSVP (auth required)
- [ ] `GET /api/users/:user_id/rsvps` returns full event objects for all of that user's RSVPs

### Error Handling (6 points)
- [ ] `400` is returned for missing or invalid required fields
- [ ] `401` is returned when a protected route is accessed without a valid session
- [ ] `403` is returned when a user attempts to modify a resource they do not own
- [ ] `404` is returned when a requested resource cannot be found
- [ ] A global error handler (`app.use((err, req, res, next) => {...})`) catches unexpected errors and returns `500`
- [ ] No unhandled promise rejections crash the server — all async controllers use `try/catch`

### Code Quality (4 points)
- [ ] Server follows the MVC structure: `controllers/`, `models/`, `middleware/`
- [ ] All SQL lives in model functions — controllers contain no direct database queries
- [ ] `checkAuthentication` middleware is used on protected routes (not repeated inline)
- [ ] Sensitive config (session secret, DB credentials) lives in `.env`, not hardcoded in source

### AI Usage Documentation (1 points)
- [ ] Provided 1 example of AI usage and addressed all reflection questions.
