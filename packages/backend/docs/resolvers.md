# Example Resolvers
## User

### Mutations

```graphql
mutation signup {
  signup(
    email: "test@coach.com"
    password: "123456"
    name: "Naimur"
    role: COACH
  )
}

mutation signin {
  signin(email: "test@coach.com", password: "123456")
}

mutation addCoachToCustomer {
  addCoachToCustomer(
    customerId: "5e03c8feda6ad5000708ea95"
    coachId: "5e03c8dcda6ad5000708ea91"
  ) {
    id
  }
}

mutation updateCustomer {
  updateCustomer(
    customerId: "5e03c8feda6ad5000708ea95"
    name: "Naimur Rahman"
  ) {
    name
  }
}

mutation removeCustomer {
  removeCustomer(customerId: "5e03c8feda6ad5000708ea95") {
    name
  }
}
```

### Query

```graphql
query user {
  user(id: "5e03c8feda6ad5000708ea95") {
    id
  }
}

query coach {
  coach(username: "naimursourov") {
    id
  }
}

query customers {
  customers {
    count
    customers {
      id
    }
  }
}

query activities {
  activities {
    id
    content {
      type
      message
    }
  }
}
```
## Admin

### Mutations

```graphql
mutation createCoach {
  createCoach(email: "coach2@coachsnap.com", name: "CoachTwo") {
    id
    email
    name
    role
  }
}

mutation deleteCoach {
  deleteCoach(id: "5e0ff9afda6ad500070e90ce") {
    id
    email
    name
    role
  }
}

mutation updateCoach {
  updateCoach(coachId: "5e0ff9afda6ad500070e90ce", data: { name: "Naimur" }) {
    id
    email
    name
    role
  }
}

```
### Query

```graphql
query bookingsByCoach {
  bookingsByCoach(coachId: "5e0fe81bda6ad500070e90bf"){
    count
    bookings {
      customer {
        email
      }
    }
  }
}

query coachActivities {
  coachActivities(coachId: "5e101001da6ad500070e90dd") {
    id
    content {
      type
      message
    }
  }
}

```
## Session Type

### Mutations

```graphql
mutation createSessionType {
  createSessionType(data: { name: "NodeJs", cost: 120 }) {
    description
    cost
    id
  }
}

mutation updateSessionType {
  updateSessionType(
    data: { name: "JAVA", cost: 120 }
    id: "5e03b37cda6ad5000708ea79"
  ) {
    name
  }
}

mutation deleteSessionType {
  deleteSessionType(id: "5e03b37cda6ad5000708ea79") {
    name
  }
}
```

### Query

```graphql
query sessionType {
  sessionType(id: "5e03b486da6ad5000708ea7a") {
    name
  }
}

query sessionTypes {
  sessionTypes(coachId: "5e03b365da6ad5000708ea78") {
    count
    sessionTypes {
      id
    }
  }
}
```

## Session

### Mutations

```graphql
mutation createSession {
  createSession(
    sessionTypeId: "5e03c8e5da6ad5000708ea92"
    data: {
      name: "Session 1"
      location: "Dhaka"
      availability: { create: { start: "2019-01-10", end: "2019-01-11" } }
      cost: 100
    }
  ) {
    id
  }
}

mutation updateSession {
  updateSession(
    id: "5e03bc6cda6ad5000708ea85"
    data: { name: "First Session" }
  ) {
    name
  }
}
```

### Query

```graphql
query session {
  session(id: "5e03bc6cda6ad5000708ea85") {
    name
  }
}

query sessions {
  sessions(sessionTypeId: "5e03b981da6ad5000708ea7e") {
    count
    sessions {
      name
    }
  }
}

query sessions {
  getCoachSessions(
    where: {
      coach: { id: "5e15af9bda6ad50007c6519d" }
      availability: { start_lt: "2020-01-09" }
    }
  ) {
    count
    sessions {
      id
      name
    }
  }
}

```

## Booking

### Mutations

```graphql
mutation createBooking {
  createBooking(
    customerId: "5e03c8feda6ad5000708ea95"
    sessionId: "5e03c8f0da6ad5000708ea93"
  ) {
    id
  }
}
```

### Query

```graphql
query bookingsByCustomer {
  bookingsByCustomer(customerId: "5e03c8feda6ad5000708ea95") {
    count
    bookings {
      id
    }
  }
}

query bookingsBySession {
  bookingsBySession(sessionId: "5e03c8f0da6ad5000708ea93") {
    count
    bookings {
      id
    }
  }
}
```
