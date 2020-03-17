## Backend-research #1

MongoDB is the database used for this project. A local database is required to be created, you can follow this [tutorial](https://www.prisma.io/docs/get-started/01-setting-up-prisma-new-database-JAVASCRIPT-a002/).

## How to run

`.env` file keys

```
PRISMA_API=XXXX
API_PORT=XXXX
APP_SECRET=XXXX # used for JWT
```

`yarn deploy`

`yarn start`

## Data model

Two main database entities are User and Event.

### 1. User

User can be any of the three possibilities

1. Coach
   - Has access to all of their Clients
   - Able to CRUD events
   - Pays monthly to use the app through Stripe and takes a commission on payments from Clients.
2. Client
   - Book events
   - Pays through Stripe-connect
3. Admin
   - Passive: cannot CRUD events
   - Can see all their Coaches and the Coaches' Clients
   - CRUD coaches? (TODO: Discuss with Taher)

### Structure

Check `prisma/user/model.prisma` for latest model.

```
{
  // DB info
  id,
  createdAt,
  updatedAt,
  state, // 'active', 'unverified', 'deleted', etc.
  // Login
  email,
  password (encrypted),
  type, // 'coach', 'client' or 'admin'
  businessHours [
    // array of 7-days (follows same structre as Date() where 0 is Sunday)
    {
      state,   //'active','inactive'
      start,
      end
    }
  ],
  // more user info to be added later once the UI is more concrete
  //Stripe connect (structure depends on Stripe Connect design)
  billing {
    customerId, // This will be useful to handle most of Stripe operations (e.g. getting customer's invoices)
    // Anything else? Will talk with Parvez about it
  }
  // marketing emails
  lastLogin {
    date,
    action // could be "create_event", "add_credit_card", etc.
  },
  pendingEmails  // Array of newsletter emails
  events
}
```

### 2. Event

Event are 2 types; Single or Time block. These 2 types differ in structure.

Check `prisma/event/model.prisma` for latest model.

```
{
  // DB info
  id,
  created_at,
  updated_at,
  state, // 'active', 'deleted'
  coach,
  // event info
  name,
  description,
  location, //do we need this?
  link,
  // only for time-block events
  duration,
  // time slots array based on the event duration
  recurring_event,  // true/false
  availability: {
    start,
    end
  },
  booked_slots: {
    max_spots,  // max spots for the event, not necessary
    slots: [
      {
        start,
        end,
        client,
        payment {
          id, // Stripe's payment id
          status, //'paid','pending','captured', 'refunded'
          // anything else?
        }
      }
    ]
  }
}
```
