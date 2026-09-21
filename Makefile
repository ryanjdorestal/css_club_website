# jjay_css — the four commands a newcomer needs. `make` prints this list.
# Node ≥ 22 (.nvmrc) and Python ≥ 3.12 (.python-version). No accounts needed.
SHELL := /bin/bash
PY    := .venv/bin/python
WEB   := apps/web

.PHONY: help install dev check test snapshot lint types shots clean hooks format a11y audit smoke api-docs links

help:
	@echo "make install   node deps + python venv (once)"
	@echo "make dev       web :5173 + api :8000 together (Tier 1 — no accounts)"
	@echo "make check     lint + types + tests + guards (what CI runs)"
	@echo "make test      pytest + vitest only"
	@echo "make snapshot  Supabase (or local tables) → data/*.json + content/"
	@echo "make shots     re-shoot the public pages into qa/shots/"
	@echo "make a11y      pa11y + axe over every route (needs make dev running)"
	@echo "make smoke     the board-member functional smoke, 9 steps (needs make dev running)"
	@echo "make audit     routes · images · tokens · repo · env · API docs (no server needed)"
	@echo "make links     lychee over the built site + data + content + docs (network)"

install:
	npm install --prefix $(WEB)
	test -d .venv || python3 -m venv .venv
	$(PY) -m pip install -q -r api/requirements.txt ruff mypy pytest

dev:
	npx --prefix $(WEB) concurrently -k -n web,api -c cyan,green \
	  "npm run dev --prefix $(WEB)" \
	  ".venv/bin/uvicorn api.index:app --port 8000 --reload"

check: lint types test audit
	$(PY) scripts/check_api_count.py
	$(PY) scripts/validate_data.py
	$(PY) scripts/validate_inheritance.py --quiet
	cd $(WEB) && npx ts-prune -p tsconfig.app.json --ignore "sigils/index|textures/index|frame/index|brand.config|api.types" --error
	cd $(WEB) && npx depcheck

lint:
	.venv/bin/ruff check api scripts
	cd $(WEB) && npm run lint && npm run format:check && npm run lint:css && npm run lint:md

format:
	cd $(WEB) && npm run format

audit:
	cd $(WEB) && npm run audit:routes && npm run audit:images && npm run audit:tokens && npm run audit:repo
	$(PY) scripts/env_validate.py
	$(PY) scripts/gen_api_docs.py && git diff --quiet -- docs/API.md || (echo "docs/API.md changed — commit it" && exit 1)

a11y:
	cd $(WEB) && npm run a11y:pa11y && npm run a11y:axe

smoke:
	cd $(WEB) && npm run gate && npm run smoke:functional

api-docs:
	$(PY) scripts/gen_api_docs.py

links:
	lychee --config lychee.toml --root-dir $(CURDIR)/$(WEB)/dist $(WEB)/dist data content docs README.md CONTRIBUTING.md DESIGN.md

types:
	.venv/bin/mypy
	cd $(WEB) && npx tsc --noEmit -p tsconfig.app.json

test:
	$(PY) -m pytest
	cd $(WEB) && npx vitest run

snapshot:
	$(PY) scripts/snapshot.py

shots:
	cd $(WEB) && node qa-scripts/shots-pages.mjs

clean:
	rm -rf $(WEB)/dist $(WEB)/node_modules/.tmp data/*.local.json .cache

hooks:
	git config core.hooksPath .githooks
	@echo "pre-commit hook installed (ruff + tsc + vitest)"
