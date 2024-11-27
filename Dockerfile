FROM node:21 as build

WORKDIR /app/website

# COPY ./docs /app/docs
COPY ./yivi-docs /app/website
RUN npm install
RUN npm run build

FROM joseluisq/static-web-server:latest
COPY --from=build /app/website/build /public
