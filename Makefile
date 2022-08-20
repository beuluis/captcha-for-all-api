up:
	@docker-compose up --build

connect-db:
	@docker exec -it captchaForAllPostgresDev psql postgresql://captchaForAllDev:d92GMFUnoF3whCik2KcIOl@postgres/captchaForAllDev

run-test:
	@docker-compose -f docker-compose.test.yml up --build -d
	@npm run test:cov
	@docker-compose -f docker-compose.test.yml down -v

generate-swagger:
	@docker-compose -f docker-compose.test.yml up --build -d
	@npm run swagger:generate
	@docker-compose -f docker-compose.test.yml down -v

# run test and coverage and log everything
run-test-verbose:
	@docker-compose -f docker-compose.test.yml up --build -d
	@DISABLE_NEST_LOGGER=false npm run test:cov -- --verbose
	@docker-compose -f docker-compose.test.yml down -v
