.PHONY: setup dev build lint validate preview deploy clean

setup:
	npm install

dev:
	@if [ ! -d node_modules ]; then npm install; fi
	npm run dev

build:
	npm run build

lint:
	npm run lint && npm run typecheck

validate:
	npm run validate

preview:
	npm run preview

deploy:
	npm run deploy

clean:
	rm -rf .next out
