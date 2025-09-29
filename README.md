[![npm version](https://img.shields.io/npm/v/testingbot-api.svg?style=flat-square)](https://www.npmjs.com/package/testingbot-api) 
[![npm downloads](https://img.shields.io/npm/dm/testingbot-api.svg?style=flat-square)](https://www.npmjs.com/package/testingbot-api)
[![Tests](https://github.com/testingbot/testingbot-api/actions/workflows/test.yml/badge.svg)](https://github.com/testingbot/testingbot-api/actions/workflows/test.yml)

# testingbot-api

Official NodeJS client for the [TestingBot](https://testingbot.com) REST API.

TestingBot provides a cloud-based test infrastructure for automated cross-browser testing. This client library allows you to interact with the TestingBot API to manage tests, retrieve browser information, handle test artifacts, and more.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [Browser & Device Management](#browser--device-management)
  - [Session Management](#session-management)
  - [User Management](#user-management)
  - [Test Management](#test-management)
  - [Tunnel Management](#tunnel-management)
  - [Build Management](#build-management)
  - [Storage Management](#storage-management)
  - [Screenshots](#screenshots)
  - [Team Management](#team-management)
- [Complete Examples](#complete-examples)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
- [More Documentation](#more-documentation)

## Features

### Core Features
- Full support for all TestingBot REST API endpoints
- Both callback and async/await patterns supported
- Manage browser sessions and tests
- Upload and manage test artifacts
- Team management capabilities
- Screenshot generation across multiple browsers
- Tunnel management for local testing

## Requirements

- NodeJS >= 10.0.0
- A TestingBot account with API credentials

## Installation

```shell
npm install testingbot-api
```

## Quick Start

### 1. Get your credentials

Sign up for a [TestingBot account](https://testingbot.com) and obtain your API key and secret from the [account settings](https://testingbot.com/members/user/edit).

### 2. Set up authentication

You can authenticate in three ways:

#### Environment variables (recommended)
```bash
export TESTINGBOT_KEY="your-api-key"
export TESTINGBOT_SECRET="your-api-secret"
```

#### Constructor options
```javascript
const tb = new TestingBot({
  api_key: 'your-api-key',
  api_secret: 'your-api-secret'
});
```

#### Configuration file
Create a `~/.testingbot` file with your credentials

### 3. Initialize the client

```javascript
const TestingBot = require('testingbot-api');

const tb = new TestingBot({
  api_key: process.env.TESTINGBOT_KEY,
  api_secret: process.env.TESTINGBOT_SECRET
});
```

## Usage

All methods support both **callback style** and **async/await patterns**. When using async/await, simply omit the callback parameter.

## API Reference

### Browser & Device Management

#### getBrowsers
Gets a list of browsers you can test on

```javascript
// Callback style
tb.getBrowsers(type, function(error, browsers) {});

// Async/await style
const browsers = await tb.getBrowsers();

// With optional type parameter (e.g., 'web' or 'mobile')
const webBrowsers = await tb.getBrowsers('web');
```

#### getDevices
Gets a list of physical mobile devices you can test on

```javascript
// Callback style
tb.getDevices(function(error, devices) {});

// Async/await style
const devices = await tb.getDevices();
```

#### getAvailableDevices
Gets a list of available physical mobile devices for your account

```javascript
// Callback style
tb.getAvailableDevices(function(error, availableDevices) {});

// Async/await style
const availableDevices = await tb.getAvailableDevices();
```

#### getDevice
Gets details for a specific physical device

```javascript
// Callback style
tb.getDevice(deviceId, function(error, deviceDetails) {});

// Async/await style
const deviceDetails = await tb.getDevice(deviceId);
```

### Session Management

#### createSession
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

### User Management

#### getUserInfo
Gets your user information

```javascript
// Callback style
tb.getUserInfo(function(error, userInfo) {});

// Async/await style
const userInfo = await tb.getUserInfo();
```

#### updateUserInfo
Updates your user information

```javascript
// Callback style
tb.updateUserInfo(newUserdata, function(error, userInfo) {});

// Async/await style
const userInfo = await tb.updateUserInfo(newUserdata);
```

### Test Management

#### getTests
Gets list of your latest tests

```javascript
// Callback style
tb.getTests(offset, limit, function(error, tests) {});

// Async/await style
const tests = await tb.getTests();

// With pagination
const tests = await tb.getTests(10, 20); // offset: 10, limit: 20
```

#### getTestDetails
Gets details for a single test, pass the WebDriver's SessionID

```javascript
// Callback style
tb.getTestDetails(sessionId, function(error, testDetails) {});

// Async/await style
const testDetails = await tb.getTestDetails(sessionId);
```

#### updateTest
Updates a single test. For example, update the `passed` state of a test (whether it was successful or not).

```javascript
const testData = { "test[success]" : "1", "test[status_message]" : "test" };

// Callback style
tb.updateTest(testData, sessionId, function(error, testDetails) {});

// Async/await style
const testDetails = await tb.updateTest(testData, sessionId);
```

#### deleteTest
Deletes a single test, pass the WebDriver's SessionID

```javascript
// Callback style
tb.deleteTest(sessionId, function(error, success) {});

// Async/await style
const success = await tb.deleteTest(sessionId);
```

#### stopTest
Stops a single test, pass the WebDriver's SessionID

```javascript
// Callback style
tb.stopTest(sessionId, function(error, success) {});

// Async/await style
const success = await tb.stopTest(sessionId);
```

### Tunnel Management

#### getTunnelList
Gets list of active tunnels

```javascript
// Callback style
tb.getTunnelList(function(error, tunnelList) {});

// Async/await style
const tunnelList = await tb.getTunnelList();
```

#### deleteTunnel
Deletes a single Tunnel

```javascript
// Callback style
tb.deleteTunnel(tunnelId, function(error, success) {});

// Async/await style
const success = await tb.deleteTunnel(tunnelId);
```

### Build Management

#### getBuilds
Retrieves the latest builds

```javascript
// Callback style
tb.getBuilds(offset, limit, function(error, builds) {});

// Async/await style
const builds = await tb.getBuilds();

// With pagination
const builds = await tb.getBuilds(10, 20); // offset: 10, limit: 20
```

#### getTestsForBuild
Retrieves the tests for a single build

```javascript
// Callback style
tb.getTestsForBuild(buildId, function(error, tests) {});

// Async/await style
const tests = await tb.getTestsForBuild(buildId);
```

#### deleteBuild
Deletes a single build

```javascript
// Callback style
tb.deleteBuild(buildId, function(error, success) {});

// Async/await style
const success = await tb.deleteBuild(buildId);
```

### Storage Management

#### uploadFile
Uploads a local file to TestingBot Storage

```javascript
// Callback style
tb.uploadFile(localFilePath, function(error, appUrl) {});

// Async/await style
const appUrl = await tb.uploadFile(localFilePath);
```

#### uploadRemoteFile
Uploads a remote file to TestingBot Storage

```javascript
// Callback style
tb.uploadRemoteFile(remoteFileUrl, function(error, appUrl) {});

// Async/await style
const appUrl = await tb.uploadRemoteFile(remoteFileUrl);
```

#### getStorageFile
Retrieve data from a previously uploaded file

```javascript
// Callback style
tb.getStorageFile(appUrl, function(error, fileDetails) {});

// Async/await style
const fileDetails = await tb.getStorageFile(appUrl);
```

#### getStorageFiles
Retrieve list of previously uploaded files

```javascript
// Callback style
tb.getStorageFiles(offset, limit, function(error, fileDetails) {});

// Async/await style
const fileDetails = await tb.getStorageFiles();

// With pagination
const fileDetails = await tb.getStorageFiles(10, 20); // offset: 10, limit: 20
```

#### deleteStorageFile
Delete a previously uploaded file

```javascript
// Callback style
tb.deleteStorageFile(appUrl, function(error, success) {});

// Async/await style
const success = await tb.deleteStorageFile(appUrl);
```

#### getAuthenticationHashForSharing
Calculates the authentication hash for sharing, pass the WebDriver's SessionID.
This is used to [share a test's detail page on TestingBot](https://testingbot.com/support/other/sharing)

```javascript
// This method is synchronous and returns the hash directly
const hash = tb.getAuthenticationHashForSharing(sessionId);
```

### Screenshots

#### takeScreenshot
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

#### retrieveScreenshots
Retrieves screenshots for a specific `takeScreenshot` call

```javascript
// Callback style
tb.retrieveScreenshots(screenshotId, function(error, screenshots) {});

// Async/await style
const screenshots = await tb.retrieveScreenshots(screenshotId);
```

#### getScreenshotList
Retrieves all screenshots previously generated with your account

```javascript
// Callback style
tb.getScreenshotList(offset, limit, function(error, screenshots) {});

// Async/await style
const screenshots = await tb.getScreenshotList();

// With pagination
const screenshots = await tb.getScreenshotList(10, 20); // offset: 10, limit: 20
```

### Team Management

#### getTeam
Retrieves team settings

```javascript
// Callback style
tb.getTeam(function(error, data) {});

// Async/await style
const teamInfo = await tb.getTeam();
```

#### getUsersInTeam
Get all users in your team

```javascript
// Callback style
tb.getUsersInTeam(function(error, users) {});

// Async/await style
const users = await tb.getUsersInTeam();
```

#### getUserFromTeam
Retrieves information about a specific user in your team

```javascript
// Callback style
tb.getUserFromTeam(userId, function(error, user) {});

// Async/await style
const user = await tb.getUserFromTeam(userId);
```

#### createUserInTeam
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

#### updateUserInTeam
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

#### resetCredentials
Resets credentials for a specific user in your team. You need ADMIN rights for this.

```javascript
// Callback style
tb.resetCredentials(userId, function(error, result) {});

// Async/await style
const result = await tb.resetCredentials(userId);
```

## Complete Examples

### Basic Usage

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
      [{ browserName: 'chrome', version: 'latest', os: 'WIN11' }],
      '1280x1024'
    );
    console.log('Screenshots:', screenshots);

  } catch (error) {
    console.error('Error:', error);
  }
}

runTests();
```


## Testing

Run the test suite:

```bash
npm test
```

**Note:** Tests require valid TestingBot credentials set as environment variables (`TB_KEY` and `TB_SECRET`).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

See the [LICENSE](LICENSE) file for details.

## Support

- Documentation: [TestingBot REST API](https://testingbot.com/support/api)
- Issues: [GitHub Issues](https://github.com/testingbot/testingbot-api/issues)

## More documentation

Check out the [TestingBot REST API](https://testingbot.com/support/api) for more information.
