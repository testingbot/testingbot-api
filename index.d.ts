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

  export interface Test {
    session_id: string;
    status: string;
    browser: string;
    version: string;
    platform: string;
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
    'user[first_name]'?: string;
    'user[last_name]'?: string;
    'user[email]'?: string;
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
    getBrowsers(type: 'web' | 'mobile'): Promise<Browser[]>;
    getBrowsers(callback: Callback<Browser[]>): void;
    getBrowsers(type: 'web' | 'mobile', callback: Callback<Browser[]>): void;

    getDevices(): Promise<Device[]>;
    getDevices(callback: Callback<Device[]>): void;

    getAvailableDevices(): Promise<Device[]>;
    getAvailableDevices(callback: Callback<Device[]>): void;

    getDevice(deviceId: string): Promise<Device>;
    getDevice(deviceId: string, callback: Callback<Device>): void;

    // Session Management
    createSession(options: SessionOptions): Promise<SessionResponse>;
    createSession(options: SessionOptions, callback: Callback<SessionResponse>): void;

    // User Management
    getUserInfo(): Promise<UserInfo>;
    getUserInfo(callback: Callback<UserInfo>): void;

    updateUserInfo(userData: UserUpdate): Promise<UserInfo>;
    updateUserInfo(userData: UserUpdate, callback: Callback<UserInfo>): void;

    // Test Management
    getTests(): Promise<Test[]>;
    getTests(offset: number, limit: number): Promise<Test[]>;
    getTests(callback: Callback<Test[]>): void;
    getTests(offset: number, limit: number, callback: Callback<Test[]>): void;

    getTestDetails(sessionId: string): Promise<Test>;
    getTestDetails(sessionId: string, callback: Callback<Test>): void;

    updateTest(testData: TestUpdate, sessionId: string): Promise<Test>;
    updateTest(testData: TestUpdate, sessionId: string, callback: Callback<Test>): void;

    deleteTest(sessionId: string): Promise<boolean>;
    deleteTest(sessionId: string, callback: Callback<boolean>): void;

    stopTest(sessionId: string): Promise<boolean>;
    stopTest(sessionId: string, callback: Callback<boolean>): void;

    // Tunnel Management
    getTunnelList(): Promise<Tunnel[]>;
    getTunnelList(callback: Callback<Tunnel[]>): void;

    deleteTunnel(tunnelId: string): Promise<boolean>;
    deleteTunnel(tunnelId: string, callback: Callback<boolean>): void;

    // Build Management
    getBuilds(): Promise<Build[]>;
    getBuilds(offset: number, limit: number): Promise<Build[]>;
    getBuilds(callback: Callback<Build[]>): void;
    getBuilds(offset: number, limit: number, callback: Callback<Build[]>): void;

    getTestsForBuild(buildId: string | number): Promise<Test[]>;
    getTestsForBuild(buildId: string | number, callback: Callback<Test[]>): void;

    deleteBuild(buildId: string | number): Promise<boolean>;
    deleteBuild(buildId: string | number, callback: Callback<boolean>): void;

    // Storage Management
    uploadFile(filePath: string): Promise<string>;
    uploadFile(filePath: string, callback: Callback<string>): void;

    uploadRemoteFile(fileUrl: string): Promise<string>;
    uploadRemoteFile(fileUrl: string, callback: Callback<string>): void;

    getStorageFile(appUrl: string): Promise<any>;
    getStorageFile(appUrl: string, callback: Callback<any>): void;

    getStorageFiles(): Promise<any[]>;
    getStorageFiles(offset: number, limit: number): Promise<any[]>;
    getStorageFiles(callback: Callback<any[]>): void;
    getStorageFiles(offset: number, limit: number, callback: Callback<any[]>): void;

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
    retrieveScreenshots(screenshotId: string, callback: Callback<Screenshot>): void;

    getScreenshotList(): Promise<Screenshot[]>;
    getScreenshotList(offset: number, limit: number): Promise<Screenshot[]>;
    getScreenshotList(callback: Callback<Screenshot[]>): void;
    getScreenshotList(offset: number, limit: number, callback: Callback<Screenshot[]>): void;

    // Team Management
    getTeam(): Promise<any>;
    getTeam(callback: Callback<any>): void;

    getUsersInTeam(): Promise<TeamUser[]>;
    getUsersInTeam(callback: Callback<TeamUser[]>): void;

    getUserFromTeam(userId: string | number): Promise<TeamUser>;
    getUserFromTeam(userId: string | number, callback: Callback<TeamUser>): void;

    createUserInTeam(userData: UserUpdate): Promise<TeamUser>;
    createUserInTeam(userData: UserUpdate, callback: Callback<TeamUser>): void;

    updateUserInTeam(userId: string | number, userData: UserUpdate): Promise<TeamUser>;
    updateUserInTeam(userId: string | number, userData: UserUpdate, callback: Callback<TeamUser>): void;

    resetCredentials(userId: string | number): Promise<any>;
    resetCredentials(userId: string | number, callback: Callback<any>): void;

    // Utility
    getAuthenticationHashForSharing(sessionId: string): string;
  }

  export default TestingBot;
}