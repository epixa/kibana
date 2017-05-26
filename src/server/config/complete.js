import { difference, keys } from 'lodash';
import { transformDeprecations } from './transform_deprecations';

const getUnusedSettings = (settings, configValues) => {
  return difference(keys(transformDeprecations(settings)), keys(configValues));
};

export default function (kbnServer, server, config) {

  server.decorate('server', 'config', function () {
    return kbnServer.config;
  });

  const unusedSettings = getUnusedSettings(kbnServer.settings, config.get());

  for (const key of unusedSettings) {
    server.log(['error', 'config'], `"${key}" is not a recongized configuration option, so it must be removed from kibana.yml and cannot be used as a CLI argument`); // eslint-disable-line max-len
  }

  if (unusedSettings.length) {
    if (config.get('env.dev')) {
      server.log(['info', 'config'], 'Server continuing to run due to dev mode, but Kibana will fail to start with unrecognized configurations in production'); // eslint-disable-line max-len
    } else {
      process.exit(64); // eslint-disable-line no-process-exit
    }
  }
}
