const assert = require('assert');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const execAsync = promisify(exec);
const binaryPath = path.join(__dirname, '..', 'bin', 'testingbot');

// Helper function to safely execute CLI commands with environment variables
const execWithEnv = async (command, env = {}) => {
  return execAsync(command, {
    env: {
      ...process.env,
      ...env
    }
  });
};

describe('TestingBot CLI Tests', function () {
  this.timeout(5000);

  describe('Help and Version Commands', function () {
    it('should display help with --help flag', async function () {
      const { stdout } = await execAsync(`${binaryPath} --help`);
      assert(stdout.includes('TestingBot API CLI'));
      assert(stdout.includes('Usage: testingbot <command> [subcommand] [options]'));
      assert(stdout.includes('Commands:'));
      assert(stdout.includes('user'));
      assert(stdout.includes('tests'));
      assert(stdout.includes('devices'));
    });

    it('should display help with -h flag', async function () {
      const { stdout } = await execAsync(`${binaryPath} -h`);
      assert(stdout.includes('TestingBot API CLI'));
      assert(stdout.includes('Commands:'));
    });

    it('should display help with help command', async function () {
      const { stdout } = await execAsync(`${binaryPath} help`);
      assert(stdout.includes('TestingBot API CLI'));
      assert(stdout.includes('Commands:'));
    });

    it('should display help when no command provided', async function () {
      const { stdout } = await execAsync(`${binaryPath}`);
      assert(stdout.includes('TestingBot API CLI'));
    });

    it('should display version with --version flag', async function () {
      const { stdout } = await execAsync(`${binaryPath} --version`);
      const packageJson = require('../package.json');
      assert.strictEqual(stdout.trim(), packageJson.version);
    });

    it('should display version with -v flag', async function () {
      const { stdout } = await execAsync(`${binaryPath} -v`);
      const packageJson = require('../package.json');
      assert.strictEqual(stdout.trim(), packageJson.version);
    });

    it('should display version with version command', async function () {
      const { stdout } = await execAsync(`${binaryPath} version`);
      const packageJson = require('../package.json');
      assert.strictEqual(stdout.trim(), packageJson.version);
    });
  });

  describe('Command Validation', function () {
    it('should error on unknown command', async function () {
      try {
        await execAsync(`${binaryPath} unknowncommand`);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Unknown command'));
        assert(error.stderr.includes('Run \'testingbot help\''));
      }
    });

    it('should error on missing subcommand', async function () {
      try {
        await execAsync(`${binaryPath} user`);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Subcommand required'));
      }
    });

    it('should error on unknown subcommand', async function () {
      try {
        await execAsync(`${binaryPath} user unknownsubcommand`);
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Unknown subcommand'));
      }
    });

    it('should error when credentials are not configured', async function () {
      const os = require('os');
      const configPath = path.join(os.homedir(), '.testingbot');
      const backupPath = configPath + '.backup';
      let hasConfig = false;

      // Temporarily rename config file if it exists
      if (fs.existsSync(configPath)) {
        hasConfig = true;
        fs.renameSync(configPath, backupPath);
      }

      try {
        // Run without credentials
        await execAsync(`${binaryPath} user info`, {
          env: {
            ...process.env,
            TB_KEY: '',
            TB_SECRET: '',
            TESTINGBOT_KEY: '',
            TESTINGBOT_SECRET: ''
          }
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        const output = (error.stderr || '') + (error.stdout || '');
        assert(output.includes('TestingBot API credentials not found') || output.includes('Error'));
        assert(output.includes('TB_KEY') || output.includes('credentials'));
      } finally {
        // Restore config file if it existed
        if (hasConfig && fs.existsSync(backupPath)) {
          fs.renameSync(backupPath, configPath);
        }
      }
    });
  });

  describe('User Commands', function () {
    it('should get user info with valid credentials', async function () {
      if (!process.env.TB_KEY || !process.env.TB_SECRET) {
        this.skip();
      }

      const { stdout } = await execWithEnv(`${binaryPath} user info`, {
        TB_KEY: process.env.TB_KEY,
        TB_SECRET: process.env.TB_SECRET
      });
      const data = JSON.parse(stdout);
      assert(data.id);
      assert(data.first_name);
    });

    it('should error when update data is missing', async function () {
      try {
        await execWithEnv(`${binaryPath} user update`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Update data required'));
      }
    });

    it('should error on invalid JSON for user update', async function () {
      try {
        await execWithEnv(`${binaryPath} user update "invalid json"`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Invalid JSON'));
      }
    });
  });

  describe('Tests Commands', function () {
    it('should list tests with default pagination', async function () {
      if (!process.env.TB_KEY || !process.env.TB_SECRET) {
        this.skip();
      }

      const { stdout } = await execWithEnv(`${binaryPath} tests list`, {
        TB_KEY: process.env.TB_KEY,
        TB_SECRET: process.env.TB_SECRET
      });
      const data = JSON.parse(stdout);
      assert(data.data);
      assert(Array.isArray(data.data));
    });

    it('should list tests with custom pagination', async function () {
      if (!process.env.TB_KEY || !process.env.TB_SECRET) {
        this.skip();
      }

      const { stdout } = await execWithEnv(`${binaryPath} tests list 0 5`, {
        TB_KEY: process.env.TB_KEY,
        TB_SECRET: process.env.TB_SECRET
      });
      const data = JSON.parse(stdout);
      assert(data.data);
      assert(data.meta);
    });

    it('should error when test ID is missing for get', async function () {
      try {
        await execWithEnv(`${binaryPath} tests get`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Test ID required'));
      }
    });

    it('should error when test ID is missing for delete', async function () {
      try {
        await execWithEnv(`${binaryPath} tests delete`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Test ID required'));
      }
    });

    it('should error when test ID is missing for stop', async function () {
      try {
        await execWithEnv(`${binaryPath} tests stop`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Test ID required'));
      }
    });

    it('should error when test ID or data is missing for update', async function () {
      try {
        await execWithEnv(`${binaryPath} tests update 123`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Test ID and update data required'));
      }
    });
  });

  describe('Devices Commands', function () {
    it('should list all devices', async function () {
      if (!process.env.TB_KEY || !process.env.TB_SECRET) {
        this.skip();
      }

      const { stdout } = await execWithEnv(`${binaryPath} devices list`, {
        TB_KEY: process.env.TB_KEY,
        TB_SECRET: process.env.TB_SECRET
      });
      const data = JSON.parse(stdout);
      assert(Array.isArray(data));
    });

    it('should list available devices', async function () {
      if (!process.env.TB_KEY || !process.env.TB_SECRET) {
        this.skip();
      }

      const { stdout } = await execWithEnv(`${binaryPath} devices available`, {
        TB_KEY: process.env.TB_KEY,
        TB_SECRET: process.env.TB_SECRET
      });
      const data = JSON.parse(stdout);
      assert(Array.isArray(data));
    });

    it('should error when device ID is missing for get', async function () {
      try {
        await execWithEnv(`${binaryPath} devices get`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Device ID required'));
      }
    });
  });

  describe('Browsers Commands', function () {
    it('should list all browsers by default', async function () {
      if (!process.env.TB_KEY || !process.env.TB_SECRET) {
        this.skip();
      }

      const { stdout } = await execWithEnv(`${binaryPath} browsers list`, {
        TB_KEY: process.env.TB_KEY,
        TB_SECRET: process.env.TB_SECRET
      });
      const data = JSON.parse(stdout);
      assert(Array.isArray(data));
    });

    it('should list web browsers', async function () {
      if (!process.env.TB_KEY || !process.env.TB_SECRET) {
        this.skip();
      }

      const { stdout } = await execWithEnv(`${binaryPath} browsers list web`, {
        TB_KEY: process.env.TB_KEY,
        TB_SECRET: process.env.TB_SECRET
      });
      const data = JSON.parse(stdout);
      assert(Array.isArray(data));
    });

    it('should error on invalid browser type', async function () {
      try {
        await execWithEnv(`${binaryPath} browsers list invalidtype`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Invalid browser type'));
      }
    });
  });

  describe('Storage Commands', function () {
    it('should error when file path is missing for upload', async function () {
      try {
        await execWithEnv(`${binaryPath} storage upload`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('File path required'));
      }
    });

    it('should error when file does not exist', async function () {
      try {
        await execWithEnv(`${binaryPath} storage upload /nonexistent/file.txt`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('File not found'));
      }
    });

    it('should list storage files', async function () {
      if (!process.env.TB_KEY || !process.env.TB_SECRET) {
        this.skip();
      }

      const { stdout } = await execWithEnv(`${binaryPath} storage list`, {
        TB_KEY: process.env.TB_KEY,
        TB_SECRET: process.env.TB_SECRET
      });
      const data = JSON.parse(stdout);
      assert(data.meta);
      assert(data.data);
    });

    it('should error when storage ID is missing for get', async function () {
      try {
        await execWithEnv(`${binaryPath} storage get`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Storage file ID required'));
      }
    });

    it('should error when storage ID is missing for delete', async function () {
      try {
        await execWithEnv(`${binaryPath} storage delete`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Storage file ID required'));
      }
    });
  });

  describe('Screenshot Commands', function () {
    it('should error when URL is missing for take', async function () {
      try {
        await execWithEnv(`${binaryPath} screenshot take`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('URL and config required'));
      }
    });

    it('should error when config is missing for take', async function () {
      try {
        await execWithEnv(`${binaryPath} screenshot take "https://example.com"`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('URL and config required'));
      }
    });

    it('should error on invalid JSON config for take', async function () {
      try {
        await execWithEnv(`${binaryPath} screenshot take "https://example.com" "invalid json"`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Invalid JSON config'));
      }
    });

    it('should error when screenshot ID is missing for get', async function () {
      try {
        await execWithEnv(`${binaryPath} screenshot get`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Screenshot ID required'));
      }
    });

    it('should list screenshots', async function () {
      if (!process.env.TB_KEY || !process.env.TB_SECRET) {
        this.skip();
      }

      const { stdout } = await execWithEnv(`${binaryPath} screenshot list`, {
        TB_KEY: process.env.TB_KEY,
        TB_SECRET: process.env.TB_SECRET
      });
      const data = JSON.parse(stdout);
      assert(data);
    });
  });

  describe('Tunnel Commands', function () {
    it('should get tunnel info', async function () {
      if (!process.env.TB_KEY || !process.env.TB_SECRET) {
        this.skip();
      }

      const { stdout } = await execWithEnv(`${binaryPath} tunnel info`, {
        TB_KEY: process.env.TB_KEY,
        TB_SECRET: process.env.TB_SECRET
      });
      const data = JSON.parse(stdout);
      assert(data);
    });

    it('should list tunnels', async function () {
      if (!process.env.TB_KEY || !process.env.TB_SECRET) {
        this.skip();
      }

      const { stdout } = await execWithEnv(`${binaryPath} tunnel list`, {
        TB_KEY: process.env.TB_KEY,
        TB_SECRET: process.env.TB_SECRET
      });
      const data = JSON.parse(stdout);
      assert(Array.isArray(data));
    });

    it('should error when tunnel ID is missing for delete', async function () {
      try {
        await execWithEnv(`${binaryPath} tunnel delete`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Tunnel ID required'));
      }
    });
  });

  describe('Builds Commands', function () {
    it('should list builds', async function () {
      if (!process.env.TB_KEY || !process.env.TB_SECRET) {
        this.skip();
      }

      const { stdout } = await execWithEnv(`${binaryPath} builds list`, {
        TB_KEY: process.env.TB_KEY,
        TB_SECRET: process.env.TB_SECRET
      });
      const data = JSON.parse(stdout);
      assert(data);
    });

    it('should error when build ID is missing for get', async function () {
      try {
        await execWithEnv(`${binaryPath} builds get`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Build ID required'));
      }
    });

    it('should error when build ID is missing for delete', async function () {
      try {
        await execWithEnv(`${binaryPath} builds delete`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Build ID required'));
      }
    });
  });

  describe('Team Commands', function () {
    it('should get team info', async function () {
      if (!process.env.TB_KEY || !process.env.TB_SECRET) {
        this.skip();
      }

      const { stdout } = await execWithEnv(`${binaryPath} team info`, {
        TB_KEY: process.env.TB_KEY,
        TB_SECRET: process.env.TB_SECRET
      });
      const data = JSON.parse(stdout);
      assert(data);
    });

    it('should error when user ID is missing for get-user', async function () {
      try {
        await execWithEnv(`${binaryPath} team get-user`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('User ID required'));
      }
    });

    it('should error when user data is missing for create-user', async function () {
      try {
        await execWithEnv(`${binaryPath} team create-user`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('User data required'));
      }
    });

    it('should error on invalid JSON for create-user', async function () {
      try {
        await execWithEnv(`${binaryPath} team create-user "invalid json"`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Invalid JSON'));
      }
    });
  });

  describe('Session Commands', function () {
    it('should error when capabilities are missing for create', async function () {
      try {
        await execWithEnv(`${binaryPath} session create`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Capabilities required'));
      }
    });

    it('should error on invalid JSON capabilities', async function () {
      try {
        await execWithEnv(`${binaryPath} session create "invalid json"`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Invalid JSON capabilities'));
      }
    });
  });

  describe('Lab (Codeless Tests) Commands', function () {
    it('should list codeless tests', async function () {
      if (!process.env.TB_KEY || !process.env.TB_SECRET) {
        this.skip();
      }

      const { stdout } = await execWithEnv(`${binaryPath} lab list`, {
        TB_KEY: process.env.TB_KEY,
        TB_SECRET: process.env.TB_SECRET
      });
      const data = JSON.parse(stdout);
      assert(data);
    });

    it('should error when test ID is missing for update', async function () {
      try {
        await execWithEnv(`${binaryPath} lab update`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Test ID and update data required'));
      }
    });

    it('should error when update data is missing for update', async function () {
      try {
        await execWithEnv(`${binaryPath} lab update 123`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Test ID and update data required'));
      }
    });

    it('should error on invalid JSON for update', async function () {
      try {
        await execWithEnv(`${binaryPath} lab update 123 "invalid json"`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Invalid JSON'));
      }
    });

    it('should error when test ID is missing for delete', async function () {
      try {
        await execWithEnv(`${binaryPath} lab delete`, {
          TB_KEY: process.env.TB_KEY,
          TB_SECRET: process.env.TB_SECRET
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.stderr.includes('Test ID required'));
      }
    });
  });
});
