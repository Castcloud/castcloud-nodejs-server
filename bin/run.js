#!/usr/bin/env node
require('../lib/castcloud')({
	port: process.argv[2],
	db: process.argv[3]
});