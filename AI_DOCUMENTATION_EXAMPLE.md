**1. What did you ask the AI to help you with, and why did you choose to use AI for that specific task?**
For the requirement "Duplicate RSVPs do not cause a server error (ON CONFLICT DO NOTHING)" I didn't know what the `ON CONFLICT DO NOTHING` part meant. I knew that RSVPs were similar to liking a bookmark in the case study so I looked at the `bookmarkModel` and saw that `ON CONFLICT DO NOTHING` was used in the query for liking a bookmark but I still was confused. I tried looking at the documentation but the language was confusing so I asked AI:

> *"I'm building an event-planning API for a school project. I have users, events, and RSVPs. One of the requirements says "Duplicate RSVPs do not cause a server error (ON CONFLICT DO NOTHING)". Can you explain what this means and why it is important?"*

I felt like this was a good opportunity to use AI because I wanted to learn more about this concept before trying to implement it and AI does a good job of explaining not just what and how but also why.

**2. How did you evaluate whether the AI's output was correct or useful before using it?**

The AI output explained that the reason for doing this is to make the API **idempotent**. This was a new term I didn't know and means that if a user clicks the RSVP button 5 times, it only records the RSVP once. It explained that I likely have a UNIQUE constraint on the RSVP table which I did and if I try to insert an RSVP that already exists, it will throw an error without this `ON CONFLICT DO NOTHING` clause. This made it much clearer why I need that clause.

The AI output also included this example

```sql
INSERT INTO rsvps (user_id, event_id) VALUES (42, 101) ON CONFLICT (user_id, event_id) DO NOTHING;
```

I tested this out by running the SQL query using `psql` and got an error because the user_id `42` and event_id (`101`) didn't exist but once I swapped those numbers out with users and events that were in my database, it ran without an error. 

The first time it responded with `INSERT 0 1` and every time after it responded with `INSERT 0 0`. I didn't know what this meant either so I asked AI again to explain this. It told me that the `1` in the first response means that one row was created and the `0` in the later responses means that zero rows were created which is exactly what I wanted. And no errors were thrown!

**3. How did what the AI produced differ from what you ultimately used?**

The AI output used hardcoded values for the `user_id` and `event_id` so I needed to modify the query to use parameters to make the query work in my `createRSVP` model method. 

The sample output also had `ON CONFLICT (user_id, event_id) DO NOTHING` whereas the bookmark like example in the case study just had `ON CONFLICT DO NOTHING`. I tested out both and it seems like I can leave out the `(user_id, event_id)` part. When I asked AI about this, it told me that for Postgres databases I can just leave it out!

I also added `RETURNING *` because, well, I saw it in the bookmark like feature, but also because I wanted to know whether or not the insert created a new row in which case I would get back the row data. If it didn't create the row, I would get back nothing. This lets me tell the controller whether to send the user a `201` (new RSVP created) or a `200` (RSVP exists already).
In the end my query looked like this:

```js
pool.query('INSERT INTO rsvps (user_id, event_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *;', [user_id, event_id])
```

**4. What did you learn from using AI in this way?**

This whole process really clarified for me the purpose of this `ON CONFLICT DO NOTHING` clause and how it is important to use to ensure that tables with unique constraints don't throw errors. I also learned the term **idempotent** and that Postgres can make certain clauses simpler compared to using other DBMSs. Lastly, I think I discovered a cool way to use AI to go back and forth to learn something new!