# Yivi technical documentation

This is the source of the Yivi technical documentation website.

## Local development
To start a local docusaurus server simply run the following commands.
```bash
cd yivi-docs
```
```bash
npm i
```
```bash
npm run start
```

To start a local docker container with the right settings simply run:

```bash
docker compose up
```

## Release
To release a new version run the Github action located [here](https://github.com/privacybydesign/irma-documentation/actions/workflows/delivery.yml). This will push a new Docker build to Github packages:
https://github.com/privacybydesign/irma-documentation/pkgs/container/irma-documentation

### Note on delivery.yml pipeline behavior
When the `delivery.yml` pipeline is run from the master branch, it will use the latest tag. If the pipeline is not run from the master branch, it will use the staging tag.
