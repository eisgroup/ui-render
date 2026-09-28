/* global globalThis */
// Entry for scripts/test-env-flags.js. It imports the SOURCE, not dist/, so each real webpack config compiles
// it with its own DefinePlugin / ProvidePlugin / Dotenv, and it publishes what the COMPILED code computed.
//
// Plain ESM on purpose: babel.config.js has `include: ['src']` outside jest, so this file is not transformed;
// webpack parses the imports itself. The `src/` modules it reaches go through the real babel-loader rule.
import '../../src/core/common/variables' // the side-effect import both real entries make before anything else
import { ENV, HOMEPAGE, NODE_ENV, __DEV__, __PROD__, __TEST__ } from '../../src/core/utils/_envs'
import { FILE } from '../../src/core/components/files' // the object Image.js reads, NOT the copy in modules/variables
import { ROUTE_BASE } from '../../src/core/common/variables'

globalThis.__probe = {
    NODE_ENV,
    __PROD__,
    __DEV__,
    __TEST__,
    HOMEPAGE,
    PATH_IMAGES: FILE.PATH_IMAGES,
    ROUTE_BASE,
    ENV: JSON.stringify(ENV),
    // What the BUNDLE sees, which a ProvidePlugin can make differ from the realm (the harness checks the realm).
    bundleTypeofProcess: typeof process,
}
