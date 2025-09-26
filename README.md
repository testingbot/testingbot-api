[![npm version](https://img.shields.io/npm/v/testingbot-api.svg?style=flat-square)](https://www.npmjs.com/package/testingbot-api) 
[![npm downloads](https://img.shields.io/npm/dm/testingbot-api.svg?style=flat-square)](https://www.npmjs.com/package/testingbot-api)
[![Tests](https://github.com/testingbot/testingbot-api/actions/workflows/test.yml/badge.svg)](https://github.com/testingbot/testingbot-api/actions/workflows/test.yml)

# testingbot-api

Wrapper around the TestingBot REST API for [Node.js](https://nodejs.org/).

## Install

```shell
npm install testingbot-api
```

## Credentials
You can use environment variables `TESTINGBOT_KEY` and `TESTINGBOT_SECRET` to pass your TestingBot key and secret to the API client.
The key and secret can be obtained from [TestingBot](https://testingbot.com/members/user/edit)

## Using the wrapper

```javascript
const TestingBot = require('testingbot-api');

const tb = new TestingBot({
  api_key: process.env.TESTINGBOT_KEY,
  api_secret: process.env.TESTINGBOT_SECRET
});
```

All methods support both callback style and async/await patterns. When using async/await, omit the callback parameter.

### getBrowsers
Gets a list of browsers you can test on

```javascript
// Callback style
tb.getBrowsers(type, function(error, browsers) {});

// Async/await style
const browsers = await tb.getBrowsers();

// With optional type parameter (e.g., 'web' or 'mobile')
const webBrowsers = await tb.getBrowsers('web');
```

### getDevices
Gets a list of physical mobile devices you can test on

```javascript
// Callback style
tb.getDevices(function(error, devices) {});

// Async/await style
const devices = await tb.getDevices();
```

### getAvailableDevices
Gets a list of available physical mobile devices for your account

```javascript
// Callback style
tb.getAvailableDevices(function(error, availableDevices) {});

// Async/await style
const availableDevices = await tb.getAvailableDevices();
```

### getDevice
Gets details for a specific physical device

```javascript
// Callback style
tb.getDevice(deviceId, function(error, deviceDetails) {});

// Async/await style
const deviceDetails = await tb.getDevice(deviceId);
```

### createSession
Creates a remote browser on TestingBot and returns its CDP URL, which can be used to interface with the remote browser.

```javascript
const options = {
  capabilities: {
    browserName: 'chrome',
    browserVersion: 'latest',
    platform: 'WIN11'
  }
};

// Callback style
tb.createSession(options, function(error, data) {});

// Async/await style
const session = await tb.createSession(options);
```

This will return a response with this structure:
```json
{
  "session_id": "cb8aaba38ddb-88fd98fca537-a0070d8f1815-175888519321-14646637",
  "cdp_url": "wss://cloud.testingbot.com/session/cb8aaba38ddb-88fd98fca537-a0070d8f1815-175888519321-14646637"
}
```

You can now connect to the `cdp_url` with a CDP client to instruct the remote browser.

### getUserInfo
Gets your user information

```javascript
// Callback style
tb.getUserInfo(function(error, userInfo) {});

// Async/await style
const userInfo = await tb.getUserInfo();
```

### updateUserInfo
Updates your user information

```javascript
// Callback style
tb.updateUserInfo(newUserdata, function(error, userInfo) {});

// Async/await style
const userInfo = await tb.updateUserInfo(newUserdata);
```

### getTests
Gets list of your latest tests

```javascript
// Callback style
tb.getTests(offset, limit, function(error, tests) {});

// Async/await style
const tests = await tb.getTests();

// With pagination
const tests = await tb.getTests(10, 20); // offset: 10, limit: 20
```

### getTestDetails
Gets details for a single test, pass the WebDriver's SessionID

```javascript
// Callback style
tb.getTestDetails(sessionId, function(error, testDetails) {});

// Async/await style
const testDetails = await tb.getTestDetails(sessionId);
```

### updateTest
Updates a single test. For example, update the `passed` state of a test (whether it was successful or not).

```javascript
const testData = { "test[success]" : "1", "test[status_message]" : "test" };

// Callback style
tb.updateTest(testData, sessionId, function(error, testDetails) {});

// Async/await style
const testDetails = await tb.updateTest(testData, sessionId);
```

### deleteTest
Deletes a single test, pass the WebDriver's SessionID

```javascript
// Callback style
tb.deleteTest(sessionId, function(error, success) {});

// Async/await style
const success = await tb.deleteTest(sessionId);
```

### stopTest
Stops a single test, pass the WebDriver's SessionID

```javascript
// Callback style
tb.stopTest(sessionId, function(error, success) {});

// Async/await style
const success = await tb.stopTest(sessionId);
```

### getTunnelList
Gets list of active tunnels

```javascript
// Callback style
tb.getTunnelList(function(error, tunnelList) {});

// Async/await style
const tunnelList = await tb.getTunnelList();
```

### deleteTunnel
Deletes a single Tunnel

```javascript
// Callback style
tb.deleteTunnel(tunnelId, function(error, success) {});

// Async/await style
const success = await tb.deleteTunnel(tunnelId);
```

### getBuilds
Retrieves the latest builds

```javascript
// Callback style
tb.getBuilds(offset, limit, function(error, builds) {});

// Async/await style
const builds = await tb.getBuilds();

// With pagination
const builds = await tb.getBuilds(10, 20); // offset: 10, limit: 20
```

### getTestsForBuild
Retrieves the tests for a single build

```javascript
// Callback style
tb.getTestsForBuild(buildId, function(error, tests) {});

// Async/await style
const tests = await tb.getTestsForBuild(buildId);
```

### deleteBuild
Deletes a single build

```javascript
// Callback style
tb.deleteBuild(buildId, function(error, success) {});

// Async/await style
const success = await tb.deleteBuild(buildId);
```

### uploadFile
Uploads a local file to TestingBot Storage

```javascript
// Callback style
tb.uploadFile(localFilePath, function(error, appUrl) {});

// Async/await style
const appUrl = await tb.uploadFile(localFilePath);
```

### uploadRemoteFile
Uploads a remote file to TestingBot Storage

```javascript
// Callback style
tb.uploadRemoteFile(remoteFileUrl, function(error, appUrl) {});

// Async/await style
const appUrl = await tb.uploadRemoteFile(remoteFileUrl);
```

### getStorageFile
Retrieve data from a previously uploaded file

```javascript
// Callback style
tb.getStorageFile(appUrl, function(error, fileDetails) {});

// Async/await style
const fileDetails = await tb.getStorageFile(appUrl);
```

### getStorageFiles
Retrieve list of previously uploaded files

```javascript
// Callback style
tb.getStorageFiles(offset, limit, function(error, fileDetails) {});

// Async/await style
const fileDetails = await tb.getStorageFiles();

// With pagination
const fileDetails = await tb.getStorageFiles(10, 20); // offset: 10, limit: 20
```

### deleteStorageFile
Delete a previously uploaded file

```javascript
// Callback style
tb.deleteStorageFile(appUrl, function(error, success) {});

// Async/await style
const success = await tb.deleteStorageFile(appUrl);
```

### getAuthenticationHashForSharing
Calculates the authentication hash for sharing, pass the WebDriver's SessionID.
This is used to [share a test's detail page on TestingBot](https://testingbot.com/support/other/sharing)

```javascript
// This method is synchronous and returns the hash directly
const hash = tb.getAuthenticationHashForSharing(sessionId);
```

### takeScreenshot
Takes screenshots for the specific browsers

```javascript
// Callback style
tb.takeScreenshot(url, browsers, waitTime, resolution, fullPage, callbackURL, function(error, screenshots) {});

// Async/await style
const screenshots = await tb.takeScreenshot(
  'https://example.com',  // url - required
  [{ browserName: 'chrome', version: 'latest', os: 'WIN11' }],  // browsers - required
  '1920x1080',           // resolution - required
  5000,                   // waitTime (ms) - optional
  true,                   // fullPage - optional
  'https://your-callback.com' // callbackURL - optional
);
```
Once a screenshot job is running, you can use `retrieveScreenshots` to poll for the results.

### retrieveScreenshots
Retrieves screenshots for a specific `takeScreenshot` call

```javascript
// Callback style
tb.retrieveScreenshots(screenshotId, function(error, screenshots) {});

// Async/await style
const screenshots = await tb.retrieveScreenshots(screenshotId);
```

### getScreenshotList
Retrieves all screenshots previously generated with your account

```javascript
// Callback style
tb.getScreenshotList(offset, limit, function(error, screenshots) {});

// Async/await style
const screenshots = await tb.getScreenshotList();

// With pagination
const screenshots = await tb.getScreenshotList(10, 20); // offset: 10, limit: 20
```

### getTeam
Retrieves team settings

```javascript
// Callback style
tb.getTeam(function(error, data) {});

// Async/await style
const teamInfo = await tb.getTeam();
```

### getUsersInTeam
Get all users in your team

```javascript
// Callback style
tb.getUsersInTeam(function(error, users) {});

// Async/await style
const users = await tb.getUsersInTeam();
```

### getUserFromTeam
Retrieves information about a specific user in your team

```javascript
// Callback style
tb.getUserFromTeam(userId, function(error, user) {});

// Async/await style
const user = await tb.getUserFromTeam(userId);
```

### createUserInTeam
Add a user to your team. You need ADMIN rights for this.

```javascript
const userData = {
  'user[first_name]': 'John',
  'user[last_name]': 'Doe',
  'user[email]': 'john@example.com'
};

// Callback style
tb.createUserInTeam(userData, function(error, result) {});

// Async/await style
const result = await tb.createUserInTeam(userData);
```

### updateUserInTeam
Update a user in your team. You need ADMIN rights for this.

```javascript
const userData = {
  'user[first_name]': 'Jane',
  'user[last_name]': 'Smith'
};

// Callback style
tb.updateUserInTeam(userId, userData, function(error, result) {});

// Async/await style
const result = await tb.updateUserInTeam(userId, userData);
```

### resetCredentials
Resets credentials for a specific user in your team. You need ADMIN rights for this.

```javascript
// Callback style
tb.resetCredentials(userId, function(error, result) {});

// Async/await style
const result = await tb.resetCredentials(userId);
```

## Complete Example with Async/Await

```javascript
const TestingBot = require('testingbot-api');

const tb = new TestingBot({
  api_key: "your-tb-key",
  api_secret: "your-tb-secret"
});

async function runTests() {
  try {
    // Get user information
    const userInfo = await tb.getUserInfo();
    console.log('User:', userInfo);

    // Get available browsers
    const browsers = await tb.getBrowsers();
    console.log('Available browsers:', browsers.length);

    // Get recent tests
    const tests = await tb.getTests(0, 10);
    console.log('Recent tests:', tests.length);

    // Get test details for the first test
    if (tests.length > 0) {
      const testDetails = await tb.getTestDetails(tests[0].session_id);
      console.log('Test details:', testDetails);
    }

    // Upload a file
    const appUrl = await tb.uploadFile('/path/to/your/app.apk');
    console.log('Uploaded file:', appUrl);

    // Take screenshots
    const screenshots = await tb.takeScreenshot(
      'https://testingbot.com',
      ['chrome', 'firefox'],
      5000
    );
    console.log('Screenshots:', screenshots);

  } catch (error) {
    console.error('Error:', error);
  }
}

runTests();
```

## Error Handling

When using async/await, wrap your calls in try-catch blocks to handle errors:

```javascript
try {
  const userInfo = await tb.getUserInfo();
} catch (error) {
  console.error('Failed to get user info:', error.message);
}
```

For callback style, errors are passed as the first argument:

```javascript
tb.getUserInfo((error, userInfo) => {
  if (error) {
    console.error('Failed to get user info:', error.message);
    return;
  }
  console.log('User info:', userInfo);
});
```

## Tests

``npm test``

## More documentation

Check out the [TestingBot REST API](https://testingbot.com/support/api) for more information.
