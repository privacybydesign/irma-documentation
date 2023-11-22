FROM node:21 as build

WORKDIR /app/website

COPY ./docs /app/docs
COPY ./website /app/website
RUN yarn install --immutable --immutable-cache --check-cache
RUN yarn build

FROM joseluisq/static-web-server:latest
COPY --from=build /app/website/build/irma-documentation /public
