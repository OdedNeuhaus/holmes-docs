# Same commands for humans and Claude. Everything runs inside the prebuilt engine image
# (Node + Docusaurus + node_modules), so there is no npm install here. Needs Docker.
#   make check   fast content checks (seconds)
#   make build   full build, same as the pipeline
#   make dev     dev server on http://localhost:3000 (live reload for docs/)
#   make stop    stop the dev server
#   make pull    fetch the latest engine image
#   make eject FILE=src/css/custom.css   copy an engine file into site/ to override it

BASE_IMAGE    ?= registry.example.internal/holmesgpt/holmesgpt-docs-base:latest
DEV_CONTAINER ?= holmesgpt-docs-dev
PORT          ?= 3000

# docs/ is mounted at /app/docs, and each file under site/ over the engine's copy at /app/site/...
OVERLAY := $(shell find site -type f 2>/dev/null)
MOUNTS  := -v "$(CURDIR)/docs":/app/docs:ro $(foreach f,$(OVERLAY),-v "$(CURDIR)/$(f)":/app/$(f):ro)
RUN     := docker run --rm $(MOUNTS) $(BASE_IMAGE)

.PHONY: check build dev stop pull eject

check:
	@$(RUN) npm run --silent check

build: check
	$(RUN) npm run build

dev:
	@docker rm -f $(DEV_CONTAINER) >/dev/null 2>&1 || true
	@docker run -d --rm --name $(DEV_CONTAINER) -p $(PORT):3000 $(MOUNTS) $(BASE_IMAGE) npm start -- --no-open >/dev/null
	@printf "Starting dev server"; for i in $$(seq 1 90); do \
	  curl -sf -o /dev/null http://localhost:$(PORT)/ && { echo; echo "Ready: http://localhost:$(PORT)"; exit 0; }; \
	  printf "."; sleep 2; done; echo; docker logs --tail 30 $(DEV_CONTAINER); exit 1

stop:
	@docker rm -f $(DEV_CONTAINER) >/dev/null 2>&1 && echo "stopped" || echo "not running"

pull:
	docker pull $(BASE_IMAGE)

eject:
	@test -n "$(FILE)" || { echo "usage: make eject FILE=src/css/custom.css"; exit 1; }
	@test ! -e "site/$(FILE)" || { echo "site/$(FILE) already exists"; exit 1; }
	@mkdir -p "$(dir site/$(FILE))"
	@docker run --rm $(BASE_IMAGE) cat "/app/site/$(FILE)" > "site/$(FILE).tmp" \
	  && mv "site/$(FILE).tmp" "site/$(FILE)" && echo "site/$(FILE) now overrides the engine's copy" \
	  || { rm -f "site/$(FILE).tmp"; echo "no such file in the engine: /app/site/$(FILE)"; exit 1; }
