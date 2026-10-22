# syntax=docker/dockerfile:1
#
# Builds the docs site on top of the prebuilt engine image (holmesgpt-docs-base) and
# serves it with nginx (non-root, port 8080). No npm install happens here: Docusaurus
# and node_modules are already in the base image.
#
#   docker build \
#     --build-arg BASE_IMAGE=registry.example.internal/holmesgpt/holmesgpt-docs-base:latest \
#     --build-arg NGINX_IMAGE=registry.example.internal/nginxinc/nginx-unprivileged:stable-alpine \
#     -f deploy/Dockerfile -t holmesgpt-docs .
#
# The build context is the repo root. docs/ lands in /app/docs, and every file under
# site/ replaces the engine's copy at /app/site/<same path> (e.g. site/src/data/sections.tsx).
# .git is copied too, for "last updated by" on each page.

ARG BASE_IMAGE=registry.example.internal/holmesgpt/holmesgpt-docs-base:latest
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:stable-alpine

# ─────────── build ───────────
FROM ${BASE_IMAGE} AS build
# Site URL and repo URL (for "edit this page" links); empty = the engine's defaults
ARG DOCS_SITE_URL=""
ARG DOCS_REPO_URL=""
ARG DOCS_DEFAULT_BRANCH=""

COPY --chown=node:node . /app/
RUN npm run check && npm run build

# ─────────── runtime ───────────
FROM ${NGINX_IMAGE}
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/site/build /usr/share/nginx/html
EXPOSE 8080
