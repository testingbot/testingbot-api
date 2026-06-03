
import TestingBot from './lib/api.js'
//const TestingBot = require('lib/api');

const tb = new TestingBot({
  api_key: "travis",
  api_secret: "rocks"
});

// const screenshots = await tb.takeScreenshot(
//   'https://example.com',  // url
//   [{ browserName: 'chrome', version: 'latest', os: 'WIN11' }],
//   '1280x1024'
// );
// console.log(screenshots)
// setTimeout(async () => {
//   const result = await tb.retrieveScreenshots(screenshots.id)
//   console.log(result)
// }, 20000)

const r =  await tb.createSession()
console.log(r)
