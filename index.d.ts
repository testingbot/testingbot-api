declare module 'testingbot-api' {
  export interface TestingBotOptions {
    api_key?: string;
    api_secret?: string;
    debug?: boolean;
    retries?: number;
    retryDelay?: number;
  }

  export interface Browser {
    browserName: string;
    version?: string;
    platform?: string;
    os?: string;
  }

  export interface Device {
    id: string;
    name: string;
    platform: string;
    version: string;
    available: boolean;
  }

  export interface SessionOptions {
    capabilities: {
      browserName: string;
      browserVersion?: string;
      platform?: string;
      [key: string]: any;
    };
  }

  export interface SessionResponse {
    session_id: string;
    cdp_url: string;
  }

  export interface Meta {
    offset: number;
    count: number;
    total: number;
  }

  /** List endpoints return a { data, meta } envelope, not a bare array. */
  export interface Paginated<T> {
    data: T[];
    meta: Meta;
  }

  export interface TestListOptions {
    offset?: number;
    count?: number;
    /** Alias for count. */
    limit?: number;
    /** UNIX timestamp; only tests updated at/after this time. */
    since?: number;
    group?: string;
    build?: string;
    browser_id?: number;
    /** Comma-separated fields to omit (logs, thumbs). */
    skip_fields?: string;
  }

  export interface Test {
    /** Test session identifier. */
    id: string | number;
    session_id?: string;
    /** Lifecycle state, e.g. RUNNING, COMPLETE, TIMEOUT. */
    state: string;
    success?: boolean;
    status_id?: number;
    status_message?: string;
    browser: string;
    version: string;
    /** Desktop OS. Mobile tests expose platform_name instead. */
    os?: string;
    platform_name?: string;
    duration: number;
    created_at: string;
    [key: string]: any;
  }

  export interface TestUpdate {
    'test[success]'?: '0' | '1';
    'test[status_message]'?: string;
    'test[name]'?: string;
    'test[extra]'?: string;
    [key: string]: any;
  }

  export interface Build {
    id: number;
    name: string;
    tests: number;
    created_at: string;
    [key: string]: any;
  }

  export interface UserInfo {
    first_name: string;
    last_name: string;
    email: string;
    [key: string]: any;
  }

  export interface UserUpdate {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    [key: string]: any;
  }

  export interface ScreenshotOptions {
    url: string;
    browsers: Array<{
      browserName: string;
      version?: string;
      os?: string;
    }>;
    resolution: string;
    waitTime?: number;
    fullPage?: boolean;
    callbackURL?: string;
  }

  export interface Screenshot {
    id: string;
    url: string;
    screenshots: Array<{
      browser: string;
      version: string;
      os: string;
      image_url: string;
      thumb_url: string;
    }>;
    [key: string]: any;
  }

  export interface Tunnel {
    id: string;
    state: string;
    metadata?: any;
    [key: string]: any;
  }

  export interface TeamUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    [key: string]: any;
  }

  export type Callback<T = any> = (error: Error | null, data?: T) => void;

  export class TestingBot {
    constructor(options?: TestingBotOptions);

    // Browser & Device Management
    getBrowsers(): Promise<Browser[]>;
    getBrowsers(type: 'webdriver' | 'rc'): Promise<Browser[]>;
    getBrowsers(callback: Callback<Browser[]>): void;
    getBrowsers(type: 'webdriver' | 'rc', callback: Callback<Browser[]>): void;

    getDevices(): Promise<Device[]>;
    getDevices(options: { platform?: string }): Promise<Device[]>;
    getDevices(callback: Callback<Device[]>): void;
    getDevices(options: { platform?: string }, callback: Callback<Device[]>): void;

    getAvailableDevices(): Promise<Device[]>;
    getAvailableDevices(callback: Callback<Device[]>): void;

    getDevice(deviceId: string): Promise<Device>;
    getDevice(deviceId: string, callback: Callback<Device>): void;

    // Configuration
    getIpRanges(): Promise<string[]>;
    getIpRanges(callback: Callback<string[]>): void;

    // Session Management
    createSession(options: SessionOptions): Promise<SessionResponse>;
    createSession(options: SessionOptions, callback: Callback<SessionResponse>): void;

    // User Management
    getUserInfo(): Promise<UserInfo>;
    getUserInfo(callback: Callback<UserInfo>): void;

    getUserKeys(): Promise<{ key: string; secret: string }>;
    getUserKeys(callback: Callback<{ key: string; secret: string }>): void;

    updateUserInfo(userData: UserUpdate): Promise<UserInfo>;
    updateUserInfo(userData: UserUpdate, callback: Callback<UserInfo>): void;

    // Test Management
    getTests(): Promise<Paginated<Test>>;
    getTests(offset: number, limit: number): Promise<Paginated<Test>>;
    getTests(options: TestListOptions): Promise<Paginated<Test>>;
    getTests(callback: Callback<Paginated<Test>>): void;
    getTests(offset: number, limit: number, callback: Callback<Paginated<Test>>): void;
    getTests(options: TestListOptions, callback: Callback<Paginated<Test>>): void;

    getTestDetails(sessionId: string): Promise<Test>;
    getTestDetails(sessionId: string, options: { skip_fields?: string }): Promise<Test>;
    getTestDetails(sessionId: string, callback: Callback<Test>): void;
    getTestDetails(sessionId: string, options: { skip_fields?: string }, callback: Callback<Test>): void;

    updateTest(testData: TestUpdate, sessionId: string): Promise<Test>;
    updateTest(testData: TestUpdate, sessionId: string, callback: Callback<Test>): void;

    deleteTest(sessionId: string): Promise<boolean>;
    deleteTest(sessionId: string, callback: Callback<boolean>): void;

    stopTest(sessionId: string): Promise<boolean>;
    stopTest(sessionId: string, callback: Callback<boolean>): void;

    // Tunnel Management
    getTunnelList(): Promise<Tunnel[]>;
    getTunnelList(callback: Callback<Tunnel[]>): void;

    getTunnelById(tunnelId: string | number): Promise<Tunnel>;
    getTunnelById(tunnelId: string | number, callback: Callback<Tunnel>): void;

    deleteTunnel(tunnelId: string): Promise<boolean>;
    deleteTunnel(tunnelId: string, callback: Callback<boolean>): void;

    deleteActiveTunnel(): Promise<boolean>;
    deleteActiveTunnel(callback: Callback<boolean>): void;

    // Build Management
    getBuilds(): Promise<Paginated<Build>>;
    getBuilds(offset: number, limit: number): Promise<Paginated<Build>>;
    getBuilds(callback: Callback<Paginated<Build>>): void;
    getBuilds(offset: number, limit: number, callback: Callback<Paginated<Build>>): void;

    getTestsForBuild(buildId: string | number): Promise<Paginated<Test>>;
    getTestsForBuild(buildId: string | number, callback: Callback<Paginated<Test>>): void;

    deleteBuild(buildId: string | number): Promise<boolean>;
    deleteBuild(buildId: string | number, callback: Callback<boolean>): void;

    // Storage Management
    uploadFile(filePath: string): Promise<string>;
    uploadFile(filePath: string, callback: Callback<string>): void;

    uploadRemoteFile(fileUrl: string): Promise<string>;
    uploadRemoteFile(fileUrl: string, callback: Callback<string>): void;

    getStorageFile(appUrl: string): Promise<any>;
    getStorageFile(appUrl: string, callback: Callback<any>): void;

    getStorageFiles(): Promise<Paginated<any>>;
    getStorageFiles(offset: number, limit: number): Promise<Paginated<any>>;
    getStorageFiles(callback: Callback<Paginated<any>>): void;
    getStorageFiles(offset: number, limit: number, callback: Callback<Paginated<any>>): void;

    deleteStorageFile(appUrl: string): Promise<boolean>;
    deleteStorageFile(appUrl: string, callback: Callback<boolean>): void;

    // Screenshots
    takeScreenshot(
      url: string,
      browsers: ScreenshotOptions['browsers'],
      resolution: string,
      waitTime?: number,
      fullPage?: boolean,
      callbackURL?: string
    ): Promise<Screenshot>;
    takeScreenshot(
      url: string,
      browsers: ScreenshotOptions['browsers'],
      resolution: string,
      waitTime: number,
      fullPage: boolean,
      callbackURL: string,
      callback: Callback<Screenshot>
    ): void;

    retrieveScreenshots(screenshotId: string): Promise<Screenshot>;
    retrieveScreenshots(screenshotId: string, options: { excludeIds?: string }): Promise<Screenshot>;
    retrieveScreenshots(screenshotId: string, callback: Callback<Screenshot>): void;
    retrieveScreenshots(screenshotId: string, options: { excludeIds?: string }, callback: Callback<Screenshot>): void;

    getScreenshotList(): Promise<Paginated<Screenshot>>;
    getScreenshotList(offset: number, limit: number): Promise<Paginated<Screenshot>>;
    getScreenshotList(callback: Callback<Paginated<Screenshot>>): void;
    getScreenshotList(offset: number, limit: number, callback: Callback<Paginated<Screenshot>>): void;

    // Codeless tests (lab)
    getCodelessTests(): Promise<Paginated<any>>;
    getCodelessTests(offset: number, limit: number): Promise<Paginated<any>>;
    getCodelessTests(callback: Callback<Paginated<any>>): void;
    getCodelessTests(offset: number, limit: number, callback: Callback<Paginated<any>>): void;

    getCodelessTest(testID: string | number): Promise<any>;
    getCodelessTest(testID: string | number, callback: Callback<any>): void;

    createCodelessTest(testData: Record<string, any>): Promise<any>;
    createCodelessTest(testData: Record<string, any>, callback: Callback<any>): void;

    updateCodelessTest(data: Record<string, any>, testID: string | number): Promise<any>;
    updateCodelessTest(data: Record<string, any>, testID: string | number, callback: Callback<any>): void;

    deleteCodelessTest(testID: string | number): Promise<boolean>;
    deleteCodelessTest(testID: string | number, callback: Callback<boolean>): void;

    triggerCodelessTest(testID: string | number): Promise<any>;
    triggerCodelessTest(testID: string | number, callback: Callback<any>): void;

    triggerAllCodelessTests(): Promise<any>;
    triggerAllCodelessTests(callback: Callback<any>): void;

    stopCodelessTest(testID: string | number): Promise<any>;
    stopCodelessTest(testID: string | number, callback: Callback<any>): void;

    scheduleCodelessTest(testID: string | number, data: Record<string, any>): Promise<any>;
    scheduleCodelessTest(testID: string | number, data: Record<string, any>, callback: Callback<any>): void;

    getCodelessSteps(testID: string | number): Promise<any>;
    getCodelessSteps(testID: string | number, callback: Callback<any>): void;

    addCodelessStep(testID: string | number, data: Record<string, any>): Promise<any>;
    addCodelessStep(testID: string | number, data: Record<string, any>, callback: Callback<any>): void;

    getCodelessBrowsers(testID: string | number): Promise<any>;
    getCodelessBrowsers(testID: string | number, callback: Callback<any>): void;

    setCodelessBrowsers(testID: string | number, data: Record<string, any>): Promise<any>;
    setCodelessBrowsers(testID: string | number, data: Record<string, any>, callback: Callback<any>): void;

    createCodelessAlert(testID: string | number, data: Record<string, any>): Promise<any>;
    createCodelessAlert(testID: string | number, data: Record<string, any>, callback: Callback<any>): void;

    updateCodelessAlert(testID: string | number, data: Record<string, any>): Promise<any>;
    updateCodelessAlert(testID: string | number, data: Record<string, any>, callback: Callback<any>): void;

    createCodelessReport(testID: string | number, data: Record<string, any>): Promise<any>;
    createCodelessReport(testID: string | number, data: Record<string, any>, callback: Callback<any>): void;

    updateCodelessReport(testID: string | number, data: Record<string, any>): Promise<any>;
    updateCodelessReport(testID: string | number, data: Record<string, any>, callback: Callback<any>): void;

    // Team Management
    getTeam(): Promise<any>;
    getTeam(callback: Callback<any>): void;

    getUsersInTeam(): Promise<Paginated<TeamUser>>;
    getUsersInTeam(callback: Callback<Paginated<TeamUser>>): void;

    getUserFromTeam(userId: string | number): Promise<TeamUser>;
    getUserFromTeam(userId: string | number, callback: Callback<TeamUser>): void;

    createUserInTeam(userData: UserUpdate): Promise<TeamUser>;
    createUserInTeam(userData: UserUpdate, callback: Callback<TeamUser>): void;

    updateUserInTeam(userId: string | number, userData: UserUpdate): Promise<TeamUser>;
    updateUserInTeam(userId: string | number, userData: UserUpdate, callback: Callback<TeamUser>): void;

    resetCredentials(userId: string | number): Promise<any>;
    resetCredentials(userId: string | number, callback: Callback<any>): void;

    getUserClientKey(userId: string | number): Promise<{ client_key: string }>;
    getUserClientKey(userId: string | number, callback: Callback<{ client_key: string }>): void;

    // Utility
    getAuthenticationHashForSharing(sessionId: string): string;

    // Workflow helpers (promise-based conveniences)
    getAllTests(batchSize?: number): Promise<Test[]>;
    waitForTestCompletion(sessionId: string | number, timeout?: number, pollInterval?: number): Promise<Test>;
    runTestAndWait(options: SessionOptions, timeout?: number): Promise<Test>;
    batchGetTestDetails(sessionIds: Array<string | number>): Promise<{
      results: Array<{ sessionId: string | number; details: Test; success: true }>;
      errors: Array<{ sessionId: string | number; error: string; success: false }>;
    }>;
    getTestStatistics(days?: number): Promise<TestStatistics>;
    cleanupOldTests(daysOld?: number): Promise<{ deleted: Array<string | number>; errors: any[]; total: number }>;
    smartCleanup(options?: { keepDays?: number; keepFailed?: boolean; keepMax?: number }): Promise<{
      analyzed: number;
      kept: number;
      deleted: number;
      errors: number;
      details: any;
    }>;
    uploadFiles(filePaths: string[]): Promise<{ results: any[]; errors: any[] }>;
    takeMultipleScreenshots(
      urls: string[],
      browsers: ScreenshotOptions['browsers'],
      resolution: string,
      options?: { waitTime?: number; fullPage?: boolean; callbackURL?: string }
    ): Promise<any[]>;
  }

  export interface TestStatistics {
    total: number;
    passed: number;
    failed: number;
    error: number;
    running: number;
    byBrowser: Record<string, number>;
    byPlatform: Record<string, number>;
    averageDuration: number;
  }

  export {
    TestingBotError,
    AuthenticationError,
    RateLimitError,
    ValidationError,
    NotFoundError,
    NetworkError
  } from 'testingbot-api/lib/errors';

  export default TestingBot;
}

declare module 'testingbot-api/lib/errors' {
  export class TestingBotError extends Error {
    statusCode?: number;
    response?: any;
    constructor(message: string, statusCode?: number, response?: any);
  }
  export class AuthenticationError extends TestingBotError {}
  export class RateLimitError extends TestingBotError {
    retryAfter?: number | string;
  }
  export class ValidationError extends TestingBotError {
    fields: string[];
  }
  export class NotFoundError extends TestingBotError {
    resource: string;
    id?: string | number;
  }
  export class NetworkError extends TestingBotError {
    originalError?: any;
  }
}