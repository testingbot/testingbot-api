[![npm version](https://img.shields.io/npm/v/testingbot-api.svg?style=flat-square)](https://www.npmjs.com/package/testingbot-api) 
[![npm downloads](https://img.shields.io/npm/dm/testingbot-api.svg?style=flat-square)](https://www.npmjs.com/package/testingbot-api)
[![CircleCI](https://circleci.com/gh/testingbot/testingbot-api.svg?style=svg)](https://circleci.com/gh/testingbot/testingbot-api)
[![Dependency Status](https://img.shields.io/david/testingbot/testingbot-api.svg?style=flat-square)](https://david-dm.org/karma-runner/testingbot-api)
[![devDependency Status](https://img.shields.io/david/dev/testingbot/testingbot-api.svg?style=flat-square)](https://david-dm.org/karma-runner/testingbot-api#info=devDependencies)

# testingbot-api

Wrapper around the TestingBot REST API for [Node.js](http://nodejs.org/).

## Install

```shell
npm install testingbot-api
```

## Using the wrapper

```javascript
var TestingBot = require('testingbot-api');

var tb = new TestingBot({
  api_key: "your-tb-key",
  api_secret: "your-tb-secret"
});

tb.getUserInfo(function(err, data) {
	console.log(data);
});
```

## Tests

``npm test``

## More documentation

Check out the [TestingBot REST API](https://testingbot.com/support/api) for more information.

## License

The MIT License (MIT)

Copyright (c) 2017 TestingBot.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
