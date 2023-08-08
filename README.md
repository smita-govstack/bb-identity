# ID Building Block

This building block is a reference implementation of the [OpenAPI specification](https://github.com/GovStackWorkingGroup/BuildingBlockAPI/tree/main/IDV) for the [ID Building block](https://docs.google.com/document/d/1Fvt6Y6h2yd4JeoSNAZnemnQQqdOTlje3bA1bGnGXLcU/edit).

## Building and running the server

1. Pull down a copy of this git repo and install node via npm and install packages, e.g. `$ nvm install; yarn`.

2. Start the server in dev mode with `$ yarn start:dev`. Use `yarn test` to run tests. See package.json for other commands.

3. To build a docker image, use `$ docker-compose build`.

4. To release a new version, increment it in `package.json` and `docker-compose.yml`, then push the new version, e.g. `$ docker push govstack/idbuildingblock:release-0.0.1`.

## Deploying the server

We are using [Digital Ocean Apps](https://cloud.digitalocean.com/apps/8dbc01d0-8425-4fde-a1d4-7e7f9b404ae4/overview) to deploy docker images built locally and automatically via [Docker Hub](https://hub.docker.com/repository/docker/govstack/idbuildingblock). To deploy a new version:

1. Visit [the DO app](https://cloud.digitalocean.com/apps/8dbc01d0-8425-4fde-a1d4-7e7f9b404ae4/settings/govstack-idbuildingblock?i=a99fae)

2. Select the Source tab

3. Change the tag and click the 'Save' button. Use the `latest` tag to deploy the latest version automatically built off of the main branch by docker hub.

### Operations

+ Alerting is configured in the [app settings](https://cloud.digitalocean.com/apps/8dbc01d0-8425-4fde-a1d4-7e7f9b404ae4/settings?i=a99fae).

+ Docker hub is configured for [automated builds](https://hub.docker.com/repository/docker/govstack/idbuildingblock/builds) and [vulnerability scanning](https://hub.docker.com/repository/docker/govstack/idbuildingblock/tags?page=1&ordering=last_updated)


## Dev notes

Time is of the essence, so I'll just use a generator and add a basic route manually for now...


```
$ npx express-generator-typescript --with-auth --socket-io --use-yarn "IDBuildingBlock"
```

I added the example API from [swaggerhub](https://app.swaggerhub.com/apis/GovStack/verification/1.0-oas3-oas3#/default/post-authenticate) to the generated server.


### Generating from an openapi spec

Ideally, we can generate the server completely from OpenAPI. I'd like to use express and typescript, lots of folks know it.

[This post](https://blog.simonireilly.com/posts/typescript-openapi) gives a good overview of the current situation with typescript server generation. The author is working on a [library-called compeller](https://github.com/simonireilly/compeller) that looks promising. Unfortunately, it can't import OpenAPI just yet.

### Trying openapi-generator (js only)

Use openapi-generator, based on Java. There isn't any support for typescript server generation.

I changed the version in verification.json to 3.0.0 then was able to generate this:

```
$ openapi-generator generate --skip-validate-spec  -g typescript-node -i ~/fabrik/BuildingBlockAPI/IDV/verification.json
```

## Run Cucumber tests

Cucumber-js is used to execute test harness to check compability of application
api with BB test definitions.

### Mock server

Launch the mock server from examples/mock folder. The instruction is located in
'examples/mock' folder in file README.md

### Cucumber tests

To install project's dependencies, navigate to folder 'test' and execute the
following command:

```
yarn install
```

Then to execute all tests scenarios use the following command:

```
yarn test
```

or

```
npx cucumber-js
```

To execute specific test scenario use the following command:

```
npx cucumber-js features/<file_name>
```

example:

```
npx cucumber-js features/data_update_or_create.feature
```
