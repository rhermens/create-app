.PHONY: all deps build package clean

all: deps build package

deps:
	npm install

build: deps
	npm run build

package: build
	npm run package

clean:
	rm -rf dist/*

