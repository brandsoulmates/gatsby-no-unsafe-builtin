"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.startListener = exports.writeAll = exports.getComponents = exports.resetLastHash = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _crypto = _interopRequireDefault(require("crypto"));

var _gatsbyCoreUtils = require("gatsby-core-utils");

var _reporter = _interopRequireDefault(require("gatsby-cli/lib/reporter"));

var _utils = require("@gatsbyjs/reach-router/lib/utils");

var _redux = require("../redux/");

var _gatsbyWebpackVirtualModules = require("../utils/gatsby-webpack-virtual-modules");

// path ranking algorithm copied (with small adjustments) from `@reach/router` (internal util, not exported from the package)
// https://github.com/reach/router/blob/28a79e7fc3a3487cb3304210dc3501efb8a50eba/src/lib/utils.js#L216-L254
const paramRe = /^:(.+)/;
const SEGMENT_POINTS = 4;
const STATIC_POINTS = 3;
const DYNAMIC_POINTS = 2;
const SPLAT_PENALTY = 1;
const ROOT_POINTS = 1;

const isRootSegment = segment => segment === ``;

const isDynamic = segment => paramRe.test(segment);

const isSplat = segment => segment === `*`;

const segmentize = uri => uri // strip starting/ending slashes
.replace(/(^\/+|\/+$)/g, ``).split(`/`);

const rankRoute = path => segmentize(path).reduce((score, segment) => {
  score += SEGMENT_POINTS;
  if (isRootSegment(segment)) score += ROOT_POINTS;else if (isDynamic(segment)) score += DYNAMIC_POINTS;else if (isSplat(segment)) score -= SEGMENT_POINTS + SPLAT_PENALTY;else score += STATIC_POINTS;
  return score;
}, 0); // end of copied `@reach/router` internals


let lastHash = null;

const resetLastHash = () => {
  lastHash = null;
};

exports.resetLastHash = resetLastHash;

const pickComponentFields = page => _lodash.default.pick(page, [`component`, `componentChunkName`]);

const getComponents = pages => (0, _lodash.default)(pages).map(pickComponentFields).uniqBy(c => c.componentChunkName).orderBy(c => c.componentChunkName).value();
/**
 * Get all dynamic routes and sort them by most specific at the top
 * code is based on @reach/router match utility (https://github.com/reach/router/blob/152aff2352bc62cefc932e1b536de9efde6b64a5/src/lib/utils.js#L224-L254)
 */


exports.getComponents = getComponents;

const getMatchPaths = pages => {
  const createMatchPathEntry = (page, index) => {
    const {
      matchPath
    } = page;

    if (matchPath === undefined) {
      return _reporter.default.panic(`Error: matchPath property is undefined for page ${page.path}, should be a string`);
    }

    return { ...page,
      matchPath,
      index,
      score: rankRoute(matchPath)
    };
  };

  const matchPathPages = [];
  pages.forEach((page, index) => {
    if (page.matchPath) {
      matchPathPages.push(createMatchPathEntry(page, index));
    }
  }); // Pages can live in matchPaths, to keep them working without doing another network request
  // we save them in matchPath. We use `@reach/router` path ranking to score paths/matchPaths
  // and sort them so more specific paths are before less specific paths.
  // More info in https://github.com/gatsbyjs/gatsby/issues/16097
  // small speedup: don't bother traversing when no matchPaths found.

  if (matchPathPages.length) {
    const newMatches = [];
    pages.forEach((page, index) => {
      const isInsideMatchPath = !!matchPathPages.find(pageWithMatchPath => !page.matchPath && (0, _utils.match)(pageWithMatchPath.matchPath, page.path));

      if (isInsideMatchPath) {
        newMatches.push(createMatchPathEntry({ ...page,
          matchPath: page.path
        }, index));
      }
    }); // Add afterwards because the new matches are not relevant for the existing search

    matchPathPages.push(...newMatches);
  }

  return matchPathPages.sort((a, b) => {
    // The higher the score, the higher the specificity of our matchPath
    const order = b.score - a.score;

    if (order !== 0) {
      return order;
    } // if specificity is the same we do lexigraphic comparison of path to ensure
    // deterministic order regardless of order pages where created


    return a.matchPath.localeCompare(b.matchPath);
  }).map(({
    path,
    matchPath
  }) => {
    return {
      path,
      matchPath
    };
  });
};

const createHash = (matchPaths, components, cleanedSSRVisitedPageComponents) => _crypto.default.createHash(`md5`).update(JSON.stringify({
  matchPaths,
  components,
  cleanedSSRVisitedPageComponents
})).digest(`hex`); // Write out pages information.


const writeAll = async state => {
  const {
    program
  } = state;
  const pages = [...state.pages.values()];
  const matchPaths = getMatchPaths(pages);
  const components = getComponents(pages);
  let cleanedSSRVisitedPageComponents = [];

  if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
    var _state$visitedPages$g;

    const ssrVisitedPageComponents = [...(((_state$visitedPages$g = state.visitedPages.get(`server`)) === null || _state$visitedPages$g === void 0 ? void 0 : _state$visitedPages$g.values()) || [])]; // Remove any page components that no longer exist.

    cleanedSSRVisitedPageComponents = components.filter(c => ssrVisitedPageComponents.some(s => s === c.componentChunkName));
  }

  const newHash = createHash(matchPaths, components, cleanedSSRVisitedPageComponents);

  if (newHash === lastHash) {
    // Nothing changed. No need to rewrite files
    return false;
  }

  lastHash = newHash;

  if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
    // Create file with sync requires of visited page components files.
    let lazySyncRequires = `
  // prefer default export if available
  const preferDefault = m => (m && m.default) || m
  \n\n`;
    lazySyncRequires += `exports.ssrComponents = {\n${cleanedSSRVisitedPageComponents.map(c => `  "${c.componentChunkName}": preferDefault(require("${(0, _gatsbyCoreUtils.joinPath)(c.component)}"))`).join(`,\n`)}
  }\n\n`;
    (0, _gatsbyWebpackVirtualModules.writeModule)(`$virtual/ssr-sync-requires`, lazySyncRequires);
  } // Create file with sync requires of components/json files.


  let syncRequires = `
// prefer default export if available
const preferDefault = m => (m && m.default) || m
\n\n`;
  syncRequires += `exports.components = {\n${components.map(c => `  "${c.componentChunkName}": preferDefault(require("${(0, _gatsbyCoreUtils.joinPath)(c.component)}"))`).join(`,\n`)}
}\n\n`; // Create file with async requires of components/json files.

  let asyncRequires = `// prefer default export if available
const preferDefault = m => (m && m.default) || m
\n`;
  asyncRequires += `exports.components = {\n${components.map(c => {
    // we need a relative import path to keep contenthash the same if directory changes
    const relativeComponentPath = _path.default.relative((0, _gatsbyWebpackVirtualModules.getAbsolutePathForVirtualModule)(`$virtual`), c.component);

    return `  "${c.componentChunkName}": () => import("${(0, _gatsbyCoreUtils.slash)(`./${relativeComponentPath}`)}" /* webpackChunkName: "${c.componentChunkName}" */)`;
  }).join(`,\n`)}
}\n\n`;

  const writeAndMove = (virtualFilePath, file, data) => {
    (0, _gatsbyWebpackVirtualModules.writeModule)(virtualFilePath, data); // files in .cache are not used anymore as part of webpack builds, but
    // still can be used by other tools (for example `gatsby serve` reads
    // `match-paths.json` to setup routing)

    const destination = (0, _gatsbyCoreUtils.joinPath)(program.directory, `.cache`, file);
    const tmp = `${destination}.${Date.now()}`;
    return _fsExtra.default.writeFile(tmp, data).then(() => _fsExtra.default.move(tmp, destination, {
      overwrite: true
    }));
  };

  await Promise.all([writeAndMove(`$virtual/sync-requires.js`, `sync-requires.js`, syncRequires), writeAndMove(`$virtual/async-requires.js`, `async-requires.js`, asyncRequires), writeAndMove(`$virtual/match-paths.json`, `match-paths.json`, JSON.stringify(matchPaths, null, 4))]);
  return true;
};

exports.writeAll = writeAll;

const debouncedWriteAll = _lodash.default.debounce(async () => {
  const activity = _reporter.default.activityTimer(`write out requires`, {
    id: `requires-writer`
  });

  activity.start();
  await writeAll(_redux.store.getState());
  activity.end();
}, 500, {
  // using "leading" can cause double `writeAll` call - particularly
  // when refreshing data using `/__refresh` hook.
  leading: false
});
/**
 * Start listening to CREATE/DELETE_PAGE events so we can rewrite
 * files as required
 */


let listenerStarted = false;

const startListener = () => {
  // Only start the listener once.
  if (listenerStarted) {
    return;
  }

  listenerStarted = true;

  if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
    /**
     * Start listening to CREATE_SERVER_VISITED_PAGE events so we can rewrite
     * files as required
     */
    _redux.emitter.on(`CREATE_SERVER_VISITED_PAGE`, () => {
      _reporter.default.pendingActivity({
        id: `requires-writer`
      });

      debouncedWriteAll();
    });
  }

  _redux.emitter.on(`CREATE_PAGE`, () => {
    _reporter.default.pendingActivity({
      id: `requires-writer`
    });

    debouncedWriteAll();
  });

  _redux.emitter.on(`CREATE_PAGE_END`, () => {
    _reporter.default.pendingActivity({
      id: `requires-writer`
    });

    debouncedWriteAll();
  });

  _redux.emitter.on(`DELETE_PAGE`, () => {
    _reporter.default.pendingActivity({
      id: `requires-writer`
    });

    debouncedWriteAll();
  });

  _redux.emitter.on(`DELETE_PAGE_BY_PATH`, () => {
    _reporter.default.pendingActivity({
      id: `requires-writer`
    });

    debouncedWriteAll();
  });
};

exports.startListener = startListener;
//# sourceMappingURL=requires-writer.js.map