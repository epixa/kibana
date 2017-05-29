import complete from '../complete';
import expect from 'expect.js';
import { noop } from 'lodash';
import sinon from 'sinon';

function stubExitAndInvoke(fn) {
  const origExit = process.exit;
  const stubExit = sinon.stub();

  process.exit = stubExit;
  fn();
  process.exit = origExit;

  return stubExit;
}

describe('server config complete', function () {
  it(`exits with status 64 and logs when not in dev and there's an unused setting`, function () {
    const kbnServer = {
      settings: {
        unused: true
      }
    };

    const server = {
      decorate: noop,
      log: sinon.spy()
    };

    const config = {
      get: arg => {
        if (arg === 'env.dev') {
          return false;
        }
        if (!arg) {
          return {
            used: true
          };
        }
        throw new Error('test: unexpected argument to mock config.get()');
      }
    };

    const exit = stubExitAndInvoke(() => complete(kbnServer, server, config));

    expect(exit.calledWith(64)).to.be(true);
    expect(server.log.calledOnce).to.be(true);
  });

  it(`just logs when in dev and there's an unused setting`, function () {
    const kbnServer = {
      settings: {
        unused: true
      }
    };

    const server = {
      decorate: noop,
      log: sinon.spy()
    };

    const config = {
      get: arg => {
        if (arg === 'env.dev') {
          return true;
        }
        if (!arg) {
          return {
            used: true
          };
        }
        throw new Error('test: unexpected argument to mock config.get()');
      }
    };

    const exit = stubExitAndInvoke(() => complete(kbnServer, server, config));

    expect(exit.called).to.be(false);
    expect(server.log.called).to.be(true);
  });

  it(`does not log or exit when there isn't an unused setting`, function () {
    const kbnServer = {
      settings: {
        used: true
      }
    };

    const server = {
      decorate: noop,
      log: sinon.spy()
    };

    const config = {
      get: sinon.stub().returns({
        used: true
      })
    };

    const exit = stubExitAndInvoke(() => complete(kbnServer, server, config));

    expect(exit.called).to.be(false);
    expect(server.log.called).to.be(false);
  });

  it(`shouldn't call server.log when there are more config values than settings`, function () {
    const kbnServer = {
      settings: {
        used: true
      }
    };

    const server = {
      decorate: noop,
      log: sinon.spy()
    };

    const config = {
      get: sinon.stub().returns({
        used: true,
        foo: 'bar'
      })
    };

    stubExitAndInvoke(() => complete(kbnServer, server, config));

    complete(kbnServer, server, config);
    expect(server.log.called).to.be(false);
  });

  it('should transform server.ssl.cert to server.ssl.certificate', function () {
    const kbnServer = {
      settings: {
        server: {
          ssl: {
            cert: 'path/to/cert'
          }
        }
      }
    };

    const server = {
      decorate: noop,
      log: sinon.spy()
    };

    const config = {
      get: sinon.stub().returns({
        server: {
          ssl: {
            certificate: 'path/to/cert'
          }
        }
      })
    };

    stubExitAndInvoke(() => complete(kbnServer, server, config));

    expect(server.log.called).to.be(false);
  });
});
