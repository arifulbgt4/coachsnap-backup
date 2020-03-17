FROM node:10

# where our app will live in container
WORKDIR /app

# This looks really ugly
# We should figure out a wait to reduce this
# unfortunately the following
# cp --parents /packages/*/package.json /app && ls -la /app/packages 
# doesn' work yet
COPY  ./packages/backend/package.json ./packages/backend/package.json
COPY  ./packages/dashboard/package.json ./packages/dashboard/package.json
COPY  ./packages/custom-moment/package.json ./packages/custom-moment/package.json

COPY package.json package.json
COPY lerna.json lerna.json
RUN yarn
RUN yarn run bootstrap

# copy whatever is here into container
# copy everything except packages
COPY . .