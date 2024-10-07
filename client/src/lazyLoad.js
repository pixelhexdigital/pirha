import { lazy } from "react";

const lazyLoad = (importCallback, namedExport) => {
  return lazy(() => {
    return importCallback().then((module) => {
      if (namedExport == null) {
        return { default: module.default };
      } else {
        return { default: module[namedExport] };
      }
    });
  });
};

export default lazyLoad;
