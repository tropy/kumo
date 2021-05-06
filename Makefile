.PHONY: build-ReleasesFunction
.PHONY: npm

npm:
	rm -f node_modules/.bin/* # Remove copied symlinks
	npm install

lib: src npm
	npm run build

build-ReleasesFunction: lib
	mkdir -p "${ARTIFACTS_DIR}/lib/releases"
	cp lib/releases/index.js "${ARTIFACTS_DIR}/lib/releases/index.js"
