"use strict";

exports.__esModule = true;
exports.builtInTypeDefinitions = exports.overridableBuiltInTypeNames = void 0;

var _graphql = require("graphql");

const fileType = `
  type File implements Node @infer {
    sourceInstanceName: String!
    absolutePath: String!
    relativePath: String!
    extension: String!
    size: Int!
    prettySize: String!
    modifiedTime: Date! @dateformat
    accessTime: Date! @dateformat
    changeTime: Date! @dateformat
    birthTime: Date! @dateformat
    root: String!
    dir: String!
    base: String!
    ext: String!
    name: String!
    relativeDirectory: String!
    dev: Int!
    mode: Int!
    nlink: Int!
    uid: Int!
    gid: Int!
    rdev: Int!
    ino: Float!
    atimeMs: Float!
    mtimeMs: Float!
    ctimeMs: Float!
    atime: Date! @dateformat
    mtime: Date! @dateformat
    ctime: Date! @dateformat
    birthtime: Date @deprecated(reason: "Use \`birthTime\` instead")
    birthtimeMs: Float @deprecated(reason: "Use \`birthTime\` instead")
  }
`;
const siteFunctionType = `
  type SiteFunction implements Node @infer {
    functionRoute: String!
    pluginName: String!
    originalAbsoluteFilePath: String!
    originalRelativeFilePath: String!
    relativeCompiledFilePath: String!
    absoluteCompiledFilePath: String!
    matchPath: String
  }
`;
const directoryType = `
  type Directory implements Node @infer {
    sourceInstanceName: String!
    absolutePath: String!
    relativePath: String!
    extension: String!
    size: Int!
    prettySize: String!
    modifiedTime: Date! @dateformat
    accessTime: Date! @dateformat
    changeTime: Date! @dateformat
    birthTime: Date! @dateformat
    root: String!
    dir: String!
    base: String!
    ext: String!
    name: String!
    relativeDirectory: String!
    dev: Int!
    mode: Int!
    nlink: Int!
    uid: Int!
    gid: Int!
    rdev: Int!
    ino: Float!
    atimeMs: Float!
    mtimeMs: Float!
    ctimeMs: Float!
    atime: Date! @dateformat
    mtime: Date! @dateformat
    ctime: Date! @dateformat
    birthtime: Date @deprecated(reason: "Use \`birthTime\` instead")
    birthtimeMs: Float @deprecated(reason: "Use \`birthTime\` instead")
  }
`;
const site = `
  type Site implements Node @infer {
    buildTime: Date @dateformat
    siteMetadata: SiteSiteMetadata
  }
`;
const siteSiteMetadata = `
  type SiteSiteMetadata {
    title: String
    description: String
  }
`;
const sitePageType = `
  type SitePage implements Node @infer {
    path: String!
    component: String!
    internalComponentName: String!
    componentChunkName: String!
    matchPath: String
  }
`;
const allSdlTypes = [fileType, directoryType, site, siteSiteMetadata, siteFunctionType, sitePageType];
const overridableBuiltInTypeNames = new Set([`SiteSiteMetadata`]);
exports.overridableBuiltInTypeNames = overridableBuiltInTypeNames;

const builtInTypeDefinitions = () => allSdlTypes.map(type => (0, _graphql.parse)(type));

exports.builtInTypeDefinitions = builtInTypeDefinitions;
//# sourceMappingURL=built-in-types.js.map