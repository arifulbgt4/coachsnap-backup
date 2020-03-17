## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
You will need latest [NodeJS](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/en/).

### Env setup:
Create a .env file on the project root and copy the variables from `.env.example`

### Installing:
To get the app installing locally:

- Clone this repo
- `yarn bootstrap` from the root to install all required dependencies.

### Development Instructions:

Install global packages if need,
```
npm i -g yarn dotenv-cli lerna prisma
```

For development purpose you can use [MailDev](https://github.com/maildev/maildev)

To start the mail server runeee

```sh
maildev --incoming-user=test --incoming-pass=test
```

Then update the .env with following,

```
# Mail
ADMIN_MAIL=test@test.com
MAIL_HOST=0.0.0.0
MAIL_PORT=1025
MAIL_USER=test
MAIL_PASS=test
```

```sh
docker-compose -f docker-compose.dev.prisma.yml up --build
dotenv -e .env yarn run deploy:backend
dotenv -e .env yarn run start:backend
dotenv -e .env yarn run dev:dashboard
dotenv -e .env yarn run dev # To run both backend and dashboard
dotenv -e .env yarn run test:dashboard # To test frontend
dotenv -e .env yarn run test:backend
```

#### Database Management:
```sh
dotenv -e .env yarn run deploy:backend # To deploy database
dotenv -e .env yarn run seed:backend  # To reset db and seed
dotenv -e .env yarn run reset:backend  # To reset database
```

### Frontend Testing Instructions:
To test the frontend please reset your database. Run docker, backend server, frontend server and maildev server.
Then run test command:
```sh
dotenv -e .env yarn run test:dashboard
```
After starting a cypress app click and test each files.

### Production Instructions:
Stop existing docker containers on port allocation error,
```sh
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
```

**Enable The aliases**

Either source it,
```sh
source docker-alias.sh
```

Or copy paste them into the terminal,
```sh
alias coachsnap="ENV_FILE=.env docker-compose -f docker-compose.dev.yml"
alias coachsnap-up="coachsnap up --build -d"
alias coachsnap-logs="coachsnap logs -f"
alias coachsnap-frc="coachsnap-up --force-recreate"
alias coachsnap-frc-nd="coachsnap-frc --no-deps"
```

To activate all,
```sh
# Build and Up
coachsnap-up

# or only Up
coachsnap up

# Making everything down
coachsnap down
```

Individual Services
```sh
coachsnap-up baseImage

coachsnap-up mysql
coachsnap-logs mysql

coachsnap-up prisma
coachsnap-logs prisma

coachsnap-up backend
coachsnap-logs backend

coachsnap-up dashboard
coachsnap-logs dashboard

coachsnap-up nginx
coachsnap-logs nginx
```

If you updated something only on dashboard,
```sh
coachsnap-frc-nd baseImage
coachsnap-frc-nd dashboard
```