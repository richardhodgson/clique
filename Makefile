
./node_modules:
	npm install

./node_modules/litmus/bin/litmus: ./node_modules

test: ./node_modules/litmus/bin/litmus
	./node_modules/litmus/bin/litmus ./tests/suite.js

server: ./node_modules
	node server.js
