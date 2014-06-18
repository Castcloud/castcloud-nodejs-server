#!/usr/bin/env node

var castcloud = require('../lib/castcloud');

castcloud(process.argv[2] || 3000);