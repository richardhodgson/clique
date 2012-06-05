
./node_modules/litmus/bin/litmus:
	npm install

test: ./node_modules/litmus/bin/litmus
	./node_modules/litmus/bin/litmus ./tests/suite.js
