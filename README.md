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
var TestingBot = require('testingbot-api');

var tb = new TestingBot({
  api_key: "your-tb-key",
  api_secret: "your-tb-secret"
});
```

### getBrowsers
Gets a list of browsers you can test on

```javascript
api.getBrowsers(function(error, browsers) {});
```

### getDevices
Gets a list of physical mobile devices you can test on

```javascript
api.getDevices(function(error, devices) {});
```

### getAvailableDevices
Gets a list of available physical mobile devices for your account

```javascript
api.getAvailableDevices(function(error, availableDevices) {});
```

### getDevice
Gets details for a specific physical device

```javascript
api.getDevice(deviceId, function(error, deviceDetails) {});
```


### getUserInfo
Gets your user information

```javascript
api.getUserInfo(function(error, userInfo) {});
```

### getTests
Gets list of your latest tests

```javascript
api.getTests(function(error, tests) {}, offset, limit);
```

### getTestDetails
Gets details for a single test, pass the WebDriver's SessionID

```javascript
api.getTestDetails(sessionId, function(error, testDetails) {});
```

### updateTest
Updates a single test. For example, update the `passed` state of a test (whether it was successful or not).

```javascript
var testData = { "test[success]" : "1", "test[status_message]" : "test" };
api.updateTest(testData, sessionId, function(error, testDetails) {});
```

### deleteTest
Deletes a single test, pass the WebDriver's SessionID

```javascript
api.deleteTest(sessionId, function(error, success) {});
```

### stopTest
Stops a single test, pass the WebDriver's SessionID

```javascript
api.stopTest(sessionId, function(error, success) {});
```

### getTunnelList
Gets list of active tunnels

```javascript
api.getTunnelList(function(error, tunnelList) {});
```

### deleteTunnel
Deletes a single Tunnel

```javascript
api.deleteTunnel(tunnelId, function(error, success) {});
```

### getBuilds
Retrieves the latest builds

```javascript
api.getBuilds(function(error, builds) {}, offset, limit);
```

### getTestsForBuild
Retrieves the tests for a single build

```javascript
api.getTestsForBuild(buildId, function(error, tests) {});
```

### deleteBuild
Deletes a single build

```javascript
api.deleteBuild(buildId, function(error, success) {});
```

### uploadFile
Uploads a local file to TestingBot Storage

```javascript
api.uploadFile(localFilePath, function(error, appUrl) {});
```

### uploadRemoteFile
Uploads a remote file to TestingBot Storage

```javascript
api.uploadFile(remoteFileUrl, function(error, appUrl) {});
```

### getStorageFile
Retrieve data from a previously uploaded file

```javascript
api.getStorageFile(remoteFileUrl, function(error, fileDetails) {});
```

### getStorageFiles
Retrieve list of previously uploaded files

```javascript
api.getStorageFiles(function(error, fileDetails) {}, offset, limit);
```

### deleteStorageFile
Delete a previously uploaded file

```javascript
api.deleteStorageFile(appId, function(error, success) {});
```

### getAuthenticationHashForSharing
Calculates the authentication hash for sharing, pass the WebDriver's SessionID.
This is used to [share a test's detail page on TestingBot](https://testingbot.com/support/other/sharing)

```javascript
api.getAuthenticationHashForSharing(sessionId);
```

### takeScreenshot
Takes screenshots for the specific browsers

```javascript
api.getUserInfo(function(error, screenshots) {}, url, browsers, waitTime, resolution, fullPage, callbackURL);
```

### retrieveScreenshots
Retrieves screenshots for a specific `takeScreenshot` call

```javascript
api.getUserInfo(screenshotId, function(error, screenshots) {});
```

### getScreenshotList
Retrieves all screenshots previously generate with your account

```javascript
api.getScreenshotList(function(error, screenshots) {}, offset, limit);
```

### getTeam
Retrieves team information

```javascript
api.getTeam(function(error, data) {});
```

### getUsersInTeam
Get all users in your team

```javascript
api.getUsersInTeam(function(error, users) {});
```

### getUserFromTeam
Retrieves information about a specific user in your team

```javascript
api.getUserFromTeam(userId, function(error, user) {});
```

### createUserInTeam
Add a user to your team. You need ADMIN rights for this.

```javascript
api.createUserInTeam(user, function(error, result) {});
```

### updateUserInTeam
Update a user in your team. You need ADMIN rights for this.

```javascript
api.updateUserInTeam(userId, userData, function(error, result) {});
```

### resetCredentials
Resets credentials for a specific user in your team. You need ADMIN rights for this.

```javascript
api.resetCredentials(userId, function(error, result) {});
```

## Tests

``npm test``

## More documentation

Check out the [TestingBot REST API](https://testingbot.com/support/api) for more information.
