OPENAPI := ./api-spec/tsp-output/@typespec/openapi3/openapi.yaml
TSP_DIR := ./api-spec
TSP := $(TSP_DIR)/main.tsp

AXUM_CLIENT_DIR := ./api-axum
ifneq ($(wildcard $(AXUM_CLIENT_DIR)/.),)
	AXUM_CLIENT := $(shell find $(AXUM_CLIENT_DIR) -name '*.rs')
else
	AXUM_CLIENT := $(AXUM_CLIENT_DIR)
endif

TS_CLIENT_DIR := ./api-ts
ifneq ($(wildcard $(TS_CLIENT_DIR)/.),)
	TS_CLIENT := $(shell find $(TS_CLIENT_DIR) -name '*.ts')
else
	TS_CLIENT := $(TS_CLIENT_DIR)
endif

BUILD_TYPE := debug
API_SERVER := ./target/$(BUILD_TYPE)/api-server
API_SERVER_SRCS := $(shell find ./api-server -name '*.rs')

WEB_SERVER_DIR := ./web-server
WEB_SERVER_SRCS := $(shell git ls-files --directory $(WEB_SERVER_DIR))
WEB_SERVER := $(WEB_SERVER_DIR)/dist
ifneq ($(wildcard $(WEB_SERVER)/.),)
	WEB_SERVER := $(shell find $(WEB_SERVER) -name 'index-*.js')
endif

.PHONY: build
build: api-server web-server

.PHONY: openapi
openapi: api-axum api-ts

$(OPENAPI): $(TSP)
	cd $(TSP_DIR) && pnpm build

.PHONY: api-axum
api-axum: $(AXUM_CLIENT)

$(AXUM_CLIENT): $(OPENAPI)
	openapi-generator-cli generate \
		-i $(OPENAPI) \
		-g rust-axum \
		-o $(AXUM_CLIENT_DIR)

.PHONY: api-ts
api-ts: $(TS_CLIENT)

$(TS_CLIENT): $(OPENAPI)
	openapi-generator-cli generate \
		-i $(OPENAPI) \
		-g typescript-fetch \
		-o $(TS_CLIENT_DIR)

.PHONY: api-server
api-server: $(API_SERVER)

.PHONY: web-server
web-server: $(WEB_SERVER)

$(WEB_SERVER): $(WEB_SERVER_SRCS) $(TS_CLIENT)
	cd $(WEB_SERVER_DIR) && pnpm build

$(API_SERVER): $(API_SERVER_SRCS) $(AXUM_CLIENT)
	cargo build --package api-server
