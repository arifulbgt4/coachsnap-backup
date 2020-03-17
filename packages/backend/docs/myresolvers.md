```
mutation signup {
  signup(
    email: "test@coach.com"
    password: "123456"
    name: "Naimur"
    username: "naim"
  )
}
```
```
mutation verifyEmail {
  verifyEmail(
    email: "test@coach.com"
    emailToken: "e8c15ea97d0907236dbfcdf68fde6310dfb5132c"
  ) {
    token
    user {
      id
      role
    }
  }
}
```

```
mutation signin {
  signin(
    email: "test@coach.com",
    password: "123456"
  ) {
    token
    user {
      id
    }
  }
}
```

```
mutation CreateSessionType {
  createSessionType(data: {
    coach: {
      connect: {id: "ck79xu1y8006p0724vazvqbkp"}
    },
    name:"Session Type of ashik",
    description: "Desc of session type",
    cost: 40,
    duration: 500
  }) {
    id
    name
    description
    cost
  }
}
```
```
mutation CreateSession {
  createSession(data: {
    coach: {
      connect: {id: "ck79xu1y8006p0724vazvqbkp"}
    },
    name: "Ashik's another session",
    location: "Dhaka",
    availability:{
      create: {
      	start: "2022-01-10",
        end: "2022-06-11"
      }
    },
    duration: 90
  }, sessionTypeId: "ck79y2pva007k0724xicqpvpx") {
    id
    name
    sessionType {
      id
    }


  }
}
```