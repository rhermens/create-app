.PHONY: all deps build package clean

all: deps build package

deps:
	npm install

build: deps
	npm run build

package: build
	npm run package
	rm -rf $PKG_CACHE_PATH

install: 
	install dist/create-app-linux /usr/local/bin/create-app

uninstall:
	rm /usr/local/bin/create-app

clean:
	rm -rf dist/*

