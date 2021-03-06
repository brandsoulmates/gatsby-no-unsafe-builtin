"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _reporter = _interopRequireDefault(require("gatsby-cli/lib/reporter"));

var _apiRunnerNode = _interopRequireDefault(require("./api-runner-node"));

var _redux = require("../redux");

var _datastore = require("../datastore");

var _actions = require("../redux/actions");

const {
  deleteNode
} = _actions.actions;

/**
 * Finds the name of all plugins which implement Gatsby APIs that
 * may create nodes, but which have not actually created any nodes.
 */
function discoverPluginsWithoutNodes(storeState, nodes) {
  // Find out which plugins own already created nodes
  const nodeOwnerSet = new Set([`default-site-plugin`]);
  nodes.forEach(node => nodeOwnerSet.add(node.internal.owner));
  return storeState.flattenedPlugins.filter(plugin => // "Can generate nodes"
  plugin.nodeAPIs.includes(`sourceNodes`) && // "Has not generated nodes"
  !nodeOwnerSet.has(plugin.name)).map(plugin => plugin.name);
}
/**
 * Warn about plugins that should have created nodes but didn't.
 */


function warnForPluginsWithoutNodes(state, nodes) {
  const pluginsWithNoNodes = discoverPluginsWithoutNodes(state, nodes);
  pluginsWithNoNodes.map(name => _reporter.default.warn(`The ${name} plugin has generated no Gatsby nodes. Do you need it?`));
}
/**
 * Return the set of nodes for which its root node has not been touched
 */


function getStaleNodes(state, nodes) {
  return nodes.filter(node => {
    let rootNode = node;
    let next = undefined;
    let whileCount = 0;

    do {
      next = rootNode.parent ? (0, _datastore.getNode)(rootNode.parent) : undefined;

      if (next) {
        rootNode = next;
      }
    } while (next && ++whileCount < 101);

    if (whileCount > 100) {
      console.log(`It looks like you have a node that's set its parent as itself`, rootNode);
    }

    return !state.nodesTouched.has(rootNode.id);
  });
}
/**
 * Find all stale nodes and delete them
 */


function deleteStaleNodes(state, nodes) {
  const staleNodes = getStaleNodes(state, nodes);

  if (staleNodes.length > 0) {
    staleNodes.forEach(node => _redux.store.dispatch(deleteNode(node)));
  }
}

var _default = async ({
  webhookBody,
  pluginName,
  parentSpan,
  deferNodeMutation = false
}) => {
  await (0, _apiRunnerNode.default)(`sourceNodes`, {
    traceId: `initial-sourceNodes`,
    waitForCascadingActions: true,
    deferNodeMutation,
    parentSpan,
    webhookBody: webhookBody || {},
    pluginName
  });
  await (0, _datastore.getDataStore)().ready();

  const state = _redux.store.getState();

  const nodes = (0, _datastore.getNodes)();
  warnForPluginsWithoutNodes(state, nodes);
  deleteStaleNodes(state, nodes);
};

exports.default = _default;
//# sourceMappingURL=source-nodes.js.map