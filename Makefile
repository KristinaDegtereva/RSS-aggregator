develop:
	npx webpack serve
install:
		npm ci
publish:
		npm publish --dry-run
lint:
		npx eslint .
build:
	NODE_ENV=production npx webpack
