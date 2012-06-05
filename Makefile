SHELL = /bin/bash

./node_modules:
	npm install

./node_modules/litmus/bin/litmus: ./node_modules

test: ./node_modules/litmus/bin/litmus
	./node_modules/litmus/bin/litmus ./tests/suite.js

server: ./node_modules
	node server.js

deploy:
	@ if [ -z "$(shell git remote | grep rhc)" ]; then \
		git remote add rhc ssh://1410403a0fc3482d9a9646fe8b1e82d9@clique-richardhodgson.rhcloud.com/~/git/clique.git; \
	fi
	git push rhc master

