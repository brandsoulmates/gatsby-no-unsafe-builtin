"use strict";

exports.__esModule = true;
exports.deleteUntouchedPages = deleteUntouchedPages;
exports.findChangedPages = findChangedPages;

var _actions = require("../redux/actions");

var _redux = require("../redux");

var _lodash = require("lodash");

const { deletePage } = _actions.actions;

function deleteUntouchedPages(
  currentPages,
  timeBeforeApisRan,
  shouldRunCreatePagesStatefully
) {
  const deletedPages = []; // Delete pages that weren't updated when running createPages.

  currentPages.forEach((page) => {
    if (
      (shouldRunCreatePagesStatefully ||
        !page.isCreatedByStatefulCreatePages) &&
      page.updatedAt < timeBeforeApisRan &&
      page.path !== `/404.html`
    ) {
      _redux.store.dispatch(deletePage(page));

      deletedPages.push(page.path, `/page-data${page.path}`);
    }
  });
  return deletedPages;
}

function findChangedPages(oldPages, currentPages) {
  const changedPages = [];

  const compareWithoutUpdated = (_left, _right, key) => {
    // console.log({ _left, _right, key });
    return key === `updatedAt` || undefined;
  };

  // console.log("==========OLD PAGES===============");
  // console.log(oldPages);

  // console.log("==========CURRENT PAGES===============");
  // console.log(currentPages);

  // console.log("==========DIFF===============");

  currentPages.forEach((newPage, path) => {
    const oldPage = oldPages.get(path);

    // console.log(`currentPath: ${path}`);
    // console.log(`oldPage: ${oldPage}`);
    // console.log(
    //   `compareWithoutUpdated: ${(0, _lodash.isEqualWith)(
    //     newPage,
    //     oldPage,
    //     compareWithoutUpdated
    //   )}`
    // );

    if (
      !oldPage ||
      !(0, _lodash.isEqualWith)(newPage, oldPage, compareWithoutUpdated)
    ) {
      changedPages.push(path);
    }
  });
  const deletedPages = [];
  oldPages.forEach((_page, key) => {
    if (!currentPages.has(key)) {
      deletedPages.push(key);
    }
  });
  return {
    changedPages,
    deletedPages,
  };
}
//# sourceMappingURL=changed-pages.js.map
