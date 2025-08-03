// A simple custom test environment that uses jsdom
const JSDOMEnvironment = require('jest-environment-jsdom').default;

class CustomEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);
    this.global.jsdom = this.dom;
  }

  async setup() {
    await super.setup();
    // Add any custom setup here
  }

  async teardown() {
    // Clean up any resources
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = CustomEnvironment;
