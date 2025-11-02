DEV_COMPOSE_FILE=docker-compose.dev.yml
DEBUG_COMPOSE_FILE=docker-compose.debug.yml
TEST_COMPOSE_FILE=docker-compose.test.yml
CONTAINER_ID=$(shell docker ps | grep api | awk '{print $$1}')

## Docker Compose commands

.PHONY: up-no-build
up-no-build:
	docker compose -f $(DEV_COMPOSE_FILE) up -d

.PHONY: up-build
up-build:
	docker compose -f $(DEV_COMPOSE_FILE) up --build -d

.PHONY: down
down:
	docker compose -f ${DEV_COMPOSE_FILE} down

.PHONY: restart
restart:
	$(MAKE) down
	$(MAKE) up-build


.PHONY: logs
logs: 
	docker logs -f ${CONTAINER_ID}

.PHONY: exec
exec:
	docker exec -it ${CONTAINER_ID} sh