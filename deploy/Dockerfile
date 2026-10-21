# syntax=docker/dockerfile:1
#
# Builds the docs site and serves it with nginx (non-root, port 8080).
# In the air-gapped network, pass the internal images and registry as build args:
#   docker build \
#     --build-arg NODE_IMAGE=nexus.example.internal/library/node:22-bookworm \
#     --build-arg NGINX_IMAGE=nexus.example.internal/nginxinc/nginx-unprivileged:stable-alpine \
#     --build-arg NPM_REGISTRY=https://nexus.example.internal/repository/npm/ \
#     -f deploy/Dockerfile -t holmesgpt-docs .
#
# The build context is the repo root (it needs both docs/ and site/).

ARG NODE_IMAGE=node:22-bookworm
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:stable-alpine

# ─────────── build ───────────
# node:22-bookworm (not alpine) because it ships git, needed for "last updated by" on each page.
FROM ${NODE_IMAGE} AS build
ARG NPM_REGISTRY=""
WORKDIR /app

COPY site/package.json site/package-lock.json site/
RUN cd site \
 && if [ -n "$NPM_REGISTRY" ]; then npm config set registry "$NPM_REGISTRY"; fi \
 && npm ci --no-audit --no-fund

COPY . .
RUN cd site && npm run build

# ─────────── runtime ───────────
FROM ${NGINX_IMAGE}
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/site/build /usr/share/nginx/html
EXPOSE 8080
