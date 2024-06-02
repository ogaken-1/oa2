OPENAPI := ./api-spec/tsp-output/@typespec/openapi3/openapi.yaml
TSP_DIR := ./api-spec
TSP := $(TSP_DIR)/main.tsp
AXUM_CLIENT_DIR := ./api-axum
AXUM_CLIENT := $(shell find $(AXUM_CLIENT_DIR) -name '*.rs')
TS_CLIENT := ./api-ts

BUILD_TYPE := debug
API_SERVER := ./target/$(BUILD_TYPE)/api-server
API_SERVER_SRCS := $(shell find ./api-server -name '*.rs')

.PHONY: build
build: api-server

.PHONY: openapi
openapi: $(OPENAPI)

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
		-o $(TS_CLIENT)

.PHONY: api-server
api-server: $(API_SERVER)

$(API_SERVER): $(API_SERVER_SRCS) $(AXUM_CLIENT)
	cargo build --package api-server
