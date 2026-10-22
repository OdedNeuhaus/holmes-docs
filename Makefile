# Same commands for humans and Claude. Uses local Node (20+) if present, otherwise Docker.
#   make check   fast content checks (seconds)
#   make build   full build, same as the pipeline
#   make dev     dev server on http://localhost:3000 (live reload)
#   make stop    stop the dev server (Docker mode)
#   make base       build the engine image for the on-prem content repo (onprem/)
#   make base-save  build it and save it as holmesgpt-docs-base.tar.gz

NODE_IMAGE    ?= node:22-bookworm
DEV_CONTAINER ?= holmesgpt-docs-dev
PORT          ?= 3000
BASE_IMAGE    ?= holmesgpt-docs-base:latest
BASE_TAR      ?= holmesgpt-docs-base.tar.gz

HAS_NPM := $(shell command -v npm 2>/dev/null)
DOCKER_RUN = docker run --rm -v "$(CURDIR)":/app -w /app/site -u "$$(id -u):$$(id -g)" \
	-e HOME=/tmp -e npm_config_cache=/tmp/.npm $(if $(NPM_REGISTRY),-e npm_config_registry=$(NPM_REGISTRY))

ifdef HAS_NPM
  RUN := cd site &&
else
  RUN := $(DOCKER_RUN) $(NODE_IMAGE)
endif

.PHONY: install check build dev stop base base-save

# The Docusaurus engine lives in site/, the content in docs/
site/node_modules: site/package-lock.json
	$(RUN) npm ci --no-audit --no-fund
	@touch site/node_modules

install: site/node_modules

check:
	$(RUN) node scripts/check-docs.mjs

build: site/node_modules check
	$(RUN) npm run build

ifdef HAS_NPM
dev: site/node_modules
	cd site && npm start
else
dev: site/node_modules
	@docker rm -f $(DEV_CONTAINER) >/dev/null 2>&1 || true
	@$(subst --rm,-d --name $(DEV_CONTAINER) -p $(PORT):3000,$(DOCKER_RUN)) $(NODE_IMAGE) npm start -- --no-open >/dev/null
	@printf "Starting dev server"; for i in $$(seq 1 90); do \
	  curl -sf -o /dev/null http://localhost:$(PORT)/ && { echo; echo "Ready: http://localhost:$(PORT)"; exit 0; }; \
	  printf "."; sleep 2; done; echo; docker logs --tail 30 $(DEV_CONTAINER); exit 1
endif

stop:
	@docker rm -f $(DEV_CONTAINER) >/dev/null 2>&1 && echo "stopped" || echo "not running"

# Engine image: Node + Docusaurus + node_modules + site/, no content. See deploy/Dockerfile.base.
base:
	docker build -f deploy/Dockerfile.base --build-arg NODE_IMAGE=$(NODE_IMAGE) \
	  $(if $(NPM_REGISTRY),--build-arg NPM_REGISTRY=$(NPM_REGISTRY)) -t $(BASE_IMAGE) .

base-save: base
	docker save $(BASE_IMAGE) | gzip > $(BASE_TAR)
	@echo "Saved $(BASE_IMAGE) to $(BASE_TAR)"
