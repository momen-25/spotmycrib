(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"react-meteor-data":{"index.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/react-meteor-data/index.js                                                                      //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
let React;
module.link("react", {
  default(v) {
    React = v;
  }

}, 0);
module.link("./useTracker", {
  default: "useTracker"
}, 1);
module.link("./withTracker.tsx", {
  default: "withTracker"
}, 2);

if (Meteor.isDevelopment) {
  const v = React.version.split('.');

  if (v[0] < 16 || v[0] == 16 && v[1] < 8) {
    console.warn('react-meteor-data 2.x requires React version >= 16.8.');
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"useTracker.ts":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/react-meteor-data/useTracker.ts                                                                 //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Tracker;
module.link("meteor/tracker", {
  Tracker(v) {
    Tracker = v;
  }

}, 1);
let useReducer, useEffect, useRef, useMemo;
module.link("react", {
  useReducer(v) {
    useReducer = v;
  },

  useEffect(v) {
    useEffect = v;
  },

  useRef(v) {
    useRef = v;
  },

  useMemo(v) {
    useMemo = v;
  }

}, 2);

// Warns if data is a Mongo.Cursor or a POJO containing a Mongo.Cursor.
function checkCursor(data) {
  let shouldWarn = false;

  if (Package.mongo && Package.mongo.Mongo && data && typeof data === 'object') {
    if (data instanceof Package.mongo.Mongo.Cursor) {
      shouldWarn = true;
    } else if (Object.getPrototypeOf(data) === Object.prototype) {
      Object.keys(data).forEach(key => {
        if (data[key] instanceof Package.mongo.Mongo.Cursor) {
          shouldWarn = true;
        }
      });
    }
  }

  if (shouldWarn) {
    console.warn('Warning: your reactive function is returning a Mongo cursor. ' + 'This value will not be reactive. You probably want to call ' + '`.fetch()` on the cursor before returning it.');
  }
} // Used to create a forceUpdate from useReducer. Forces update by
// incrementing a number whenever the dispatch method is invoked.


const fur = x => x + 1;

const useForceUpdate = () => useReducer(fur, 0)[1];

const useTrackerNoDeps = function (reactiveFn) {
  let skipUpdate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  const {
    current: refs
  } = useRef({
    isMounted: false,
    trackerData: null
  });
  const forceUpdate = useForceUpdate(); // Without deps, always dispose and recreate the computation with every render.

  if (refs.computation) {
    refs.computation.stop(); // @ts-ignore This makes TS think ref.computation is "never" set

    delete refs.computation;
  } // Use Tracker.nonreactive in case we are inside a Tracker Computation.
  // This can happen if someone calls `ReactDOM.render` inside a Computation.
  // In that case, we want to opt out of the normal behavior of nested
  // Computations, where if the outer one is invalidated or stopped,
  // it stops the inner one.


  Tracker.nonreactive(() => Tracker.autorun(c => {
    refs.computation = c;

    if (c.firstRun) {
      // Always run the reactiveFn on firstRun
      refs.trackerData = reactiveFn(c);
    } else if (!skipUpdate || !skipUpdate(refs.trackerData, reactiveFn(c))) {
      // For any reactive change, forceUpdate and let the next render rebuild the computation.
      forceUpdate();
    }
  })); // To avoid creating side effects in render with Tracker when not using deps
  // create the computation, run the user's reactive function in a computation synchronously,
  // then immediately dispose of it. It'll be recreated again after the render is committed.

  if (!refs.isMounted) {
    // We want to forceUpdate in useEffect to support StrictMode.
    // See: https://github.com/meteor/react-packages/issues/278
    if (refs.computation) {
      refs.computation.stop();
      delete refs.computation;
    }
  }

  useEffect(() => {
    // Let subsequent renders know we are mounted (render is committed).
    refs.isMounted = true; // Render is committed. Since useTracker without deps always runs synchronously,
    // forceUpdate and let the next render recreate the computation.

    if (!skipUpdate) {
      forceUpdate();
    } else {
      Tracker.nonreactive(() => Tracker.autorun(c => {
        refs.computation = c;

        if (!skipUpdate(refs.trackerData, reactiveFn(c))) {
          // For any reactive change, forceUpdate and let the next render rebuild the computation.
          forceUpdate();
        }
      }));
    } // stop the computation on unmount


    return () => {
      var _refs$computation;

      (_refs$computation = refs.computation) === null || _refs$computation === void 0 ? void 0 : _refs$computation.stop();
    };
  }, []);
  return refs.trackerData;
};

const useTrackerWithDeps = function (reactiveFn, deps) {
  let skipUpdate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  const forceUpdate = useForceUpdate();
  const {
    current: refs
  } = useRef({
    reactiveFn
  }); // keep reactiveFn ref fresh

  refs.reactiveFn = reactiveFn;
  useMemo(() => {
    // To jive with the lifecycle interplay between Tracker/Subscribe, run the
    // reactive function in a computation, then stop it, to force flush cycle.
    const comp = Tracker.nonreactive(() => Tracker.autorun(c => {
      refs.data = refs.reactiveFn();
    })); // To avoid creating side effects in render, stop the computation immediately

    Meteor.defer(() => {
      comp.stop();
    });
  }, deps);
  useEffect(() => {
    const computation = Tracker.nonreactive(() => Tracker.autorun(c => {
      const data = refs.reactiveFn(c);

      if (!skipUpdate || !skipUpdate(refs.data, data)) {
        refs.data = data;
        forceUpdate();
      }
    }));
    return () => {
      computation.stop();
    };
  }, deps);
  return refs.data;
};

function useTrackerClient(reactiveFn) {
  let deps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  let skipUpdate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (deps === null || deps === undefined || !Array.isArray(deps)) {
    if (typeof deps === "function") {
      skipUpdate = deps;
    }

    return useTrackerNoDeps(reactiveFn, skipUpdate);
  } else {
    return useTrackerWithDeps(reactiveFn, deps, skipUpdate);
  }
}

const useTrackerServer = reactiveFn => {
  return Tracker.nonreactive(reactiveFn);
}; // When rendering on the server, we don't want to use the Tracker.
// We only do the first rendering on the server so we can get the data right away


const useTracker = Meteor.isServer ? useTrackerServer : useTrackerClient;

function useTrackerDev(reactiveFn) {
  let deps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  let skipUpdate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  function warn(expects, pos, arg, type) {
    console.warn("Warning: useTracker expected a ".concat(expects, " in it's ").concat(pos, " argument ") + "(".concat(arg, "), but got type of `").concat(type, "`."));
  }

  if (typeof reactiveFn !== 'function') {
    warn("function", "1st", "reactiveFn", reactiveFn);
  }

  if (deps && skipUpdate && !Array.isArray(deps) && typeof skipUpdate === "function") {
    warn("array & function", "2nd and 3rd", "deps, skipUpdate", "".concat(typeof deps, " & ").concat(typeof skipUpdate));
  } else {
    if (deps && !Array.isArray(deps) && typeof deps !== "function") {
      warn("array or function", "2nd", "deps or skipUpdate", typeof deps);
    }

    if (skipUpdate && typeof skipUpdate !== "function") {
      warn("function", "3rd", "skipUpdate", typeof skipUpdate);
    }
  }

  const data = useTracker(reactiveFn, deps, skipUpdate);
  checkCursor(data);
  return data;
}

module.exportDefault(Meteor.isDevelopment ? useTrackerDev : useTracker);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"withTracker.tsx":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/react-meteor-data/withTracker.tsx                                                               //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
let _extends;

module.link("@babel/runtime/helpers/extends", {
  default(v) {
    _extends = v;
  }

}, 0);
module.export({
  default: () => withTracker
});
let React, forwardRef, memo;
module.link("react", {
  default(v) {
    React = v;
  },

  forwardRef(v) {
    forwardRef = v;
  },

  memo(v) {
    memo = v;
  }

}, 0);
let useTracker;
module.link("./useTracker", {
  default(v) {
    useTracker = v;
  }

}, 1);

function withTracker(options) {
  return Component => {
    const getMeteorData = typeof options === 'function' ? options : options.getMeteorData;
    const WithTracker = /*#__PURE__*/forwardRef((props, ref) => {
      const data = useTracker(() => getMeteorData(props) || {}, options.skipUpdate);
      return /*#__PURE__*/React.createElement(Component, _extends({
        ref: ref
      }, props, data));
    });
    const {
      pure = true
    } = options;
    return pure ? /*#__PURE__*/memo(WithTracker) : WithTracker;
  };
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json",
    ".ts",
    ".tsx"
  ]
});


/* Exports */
Package._define("react-meteor-data");

})();

//# sourceURL=meteor://💻app/packages/react-meteor-data.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcmVhY3QtbWV0ZW9yLWRhdGEvaW5kZXguanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3JlYWN0LW1ldGVvci1kYXRhL3VzZVRyYWNrZXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3JlYWN0LW1ldGVvci1kYXRhL3dpdGhUcmFja2VyLnRzeCJdLCJuYW1lcyI6WyJSZWFjdCIsIm1vZHVsZSIsImxpbmsiLCJkZWZhdWx0IiwidiIsIk1ldGVvciIsImlzRGV2ZWxvcG1lbnQiLCJ2ZXJzaW9uIiwic3BsaXQiLCJjb25zb2xlIiwid2FybiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJQSxLQUFKO0FBQVVDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLE9BQVosRUFBb0I7QUFBQ0MsU0FBTyxDQUFDQyxDQUFELEVBQUc7QUFBQ0osU0FBSyxHQUFDSSxDQUFOO0FBQVE7O0FBQXBCLENBQXBCLEVBQTBDLENBQTFDO0FBQTZDSCxNQUFNLENBQUNDLElBQVAsQ0FBWSxjQUFaLEVBQTJCO0FBQUNDLFNBQU8sRUFBQztBQUFULENBQTNCLEVBQWtELENBQWxEO0FBQXFERixNQUFNLENBQUNDLElBQVAsQ0FBWSxtQkFBWixFQUFnQztBQUFDQyxTQUFPLEVBQUM7QUFBVCxDQUFoQyxFQUF3RCxDQUF4RDs7QUFHNUcsSUFBSUUsTUFBTSxDQUFDQyxhQUFYLEVBQTBCO0FBQ3hCLFFBQU1GLENBQUMsR0FBR0osS0FBSyxDQUFDTyxPQUFOLENBQWNDLEtBQWQsQ0FBb0IsR0FBcEIsQ0FBVjs7QUFDQSxNQUFJSixDQUFDLENBQUMsQ0FBRCxDQUFELEdBQU8sRUFBUCxJQUFjQSxDQUFDLENBQUMsQ0FBRCxDQUFELElBQVEsRUFBUixJQUFjQSxDQUFDLENBQUMsQ0FBRCxDQUFELEdBQU8sQ0FBdkMsRUFBMkM7QUFDekNLLFdBQU8sQ0FBQ0MsSUFBUixDQUFhLHVEQUFiO0FBQ0Q7QUFDRixD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LElBQUksQ0FBQyxXQUFELENBQVAsR0FBdUIsV0FBbEM7QUFDRCxHQWpCRDtBQWtCRCxDIiwiZmlsZSI6Ii9wYWNrYWdlcy9yZWFjdC1tZXRlb3ItZGF0YS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCBNZXRlb3IqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaWYgKE1ldGVvci5pc0RldmVsb3BtZW50KSB7XG4gIGNvbnN0IHYgPSBSZWFjdC52ZXJzaW9uLnNwbGl0KCcuJyk7XG4gIGlmICh2WzBdIDwgMTYgfHwgKHZbMF0gPT0gMTYgJiYgdlsxXSA8IDgpKSB7XG4gICAgY29uc29sZS53YXJuKCdyZWFjdC1tZXRlb3ItZGF0YSAyLnggcmVxdWlyZXMgUmVhY3QgdmVyc2lvbiA+PSAxNi44LicpO1xuICB9XG59XG5cbmV4cG9ydCB7IGRlZmF1bHQgYXMgdXNlVHJhY2tlciB9IGZyb20gJy4vdXNlVHJhY2tlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIHdpdGhUcmFja2VyIH0gZnJvbSAnLi93aXRoVHJhY2tlci50c3gnO1xuIiwiZGVjbGFyZSB2YXIgUGFja2FnZTogYW55XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFRyYWNrZXIgfSBmcm9tICdtZXRlb3IvdHJhY2tlcic7XG5pbXBvcnQgeyB1c2VSZWR1Y2VyLCB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlTWVtbywgRGVwZW5kZW5jeUxpc3QgfSBmcm9tICdyZWFjdCc7XG5cbi8vIFdhcm5zIGlmIGRhdGEgaXMgYSBNb25nby5DdXJzb3Igb3IgYSBQT0pPIGNvbnRhaW5pbmcgYSBNb25nby5DdXJzb3IuXG5mdW5jdGlvbiBjaGVja0N1cnNvciAoZGF0YTogYW55KTogdm9pZCB7XG4gIGxldCBzaG91bGRXYXJuID0gZmFsc2U7XG4gIGlmIChQYWNrYWdlLm1vbmdvICYmIFBhY2thZ2UubW9uZ28uTW9uZ28gJiYgZGF0YSAmJiB0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcpIHtcbiAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIFBhY2thZ2UubW9uZ28uTW9uZ28uQ3Vyc29yKSB7XG4gICAgICBzaG91bGRXYXJuID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZihkYXRhKSA9PT0gT2JqZWN0LnByb3RvdHlwZSkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGlmIChkYXRhW2tleV0gaW5zdGFuY2VvZiBQYWNrYWdlLm1vbmdvLk1vbmdvLkN1cnNvcikge1xuICAgICAgICAgIHNob3VsZFdhcm4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgaWYgKHNob3VsZFdhcm4pIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnV2FybmluZzogeW91ciByZWFjdGl2ZSBmdW5jdGlvbiBpcyByZXR1cm5pbmcgYSBNb25nbyBjdXJzb3IuICdcbiAgICAgICsgJ1RoaXMgdmFsdWUgd2lsbCBub3QgYmUgcmVhY3RpdmUuIFlvdSBwcm9iYWJseSB3YW50IHRvIGNhbGwgJ1xuICAgICAgKyAnYC5mZXRjaCgpYCBvbiB0aGUgY3Vyc29yIGJlZm9yZSByZXR1cm5pbmcgaXQuJ1xuICAgICk7XG4gIH1cbn1cblxuLy8gVXNlZCB0byBjcmVhdGUgYSBmb3JjZVVwZGF0ZSBmcm9tIHVzZVJlZHVjZXIuIEZvcmNlcyB1cGRhdGUgYnlcbi8vIGluY3JlbWVudGluZyBhIG51bWJlciB3aGVuZXZlciB0aGUgZGlzcGF0Y2ggbWV0aG9kIGlzIGludm9rZWQuXG5jb25zdCBmdXIgPSAoeDogbnVtYmVyKTogbnVtYmVyID0+IHggKyAxO1xuY29uc3QgdXNlRm9yY2VVcGRhdGUgPSAoKSA9PiB1c2VSZWR1Y2VyKGZ1ciwgMClbMV07XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVJlYWN0aXZlRm48VD4ge1xuICA8VD4oYz86IFRyYWNrZXIuQ29tcHV0YXRpb24pOiBUXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVNraXBVcGRhdGU8VD4ge1xuICA8VD4ocHJldjogVCwgbmV4dDogVCk6IGJvb2xlYW5cbn1cblxudHlwZSBUcmFja2VyUmVmcyA9IHtcbiAgY29tcHV0YXRpb24/OiBUcmFja2VyLkNvbXB1dGF0aW9uO1xuICBpc01vdW50ZWQ6IGJvb2xlYW47XG4gIHRyYWNrZXJEYXRhOiBhbnk7XG59XG5cbmNvbnN0IHVzZVRyYWNrZXJOb0RlcHMgPSA8VCA9IGFueT4ocmVhY3RpdmVGbjogSVJlYWN0aXZlRm48VD4sIHNraXBVcGRhdGU6IElTa2lwVXBkYXRlPFQ+ID0gbnVsbCkgPT4ge1xuICBjb25zdCB7IGN1cnJlbnQ6IHJlZnMgfSA9IHVzZVJlZjxUcmFja2VyUmVmcz4oe1xuICAgIGlzTW91bnRlZDogZmFsc2UsXG4gICAgdHJhY2tlckRhdGE6IG51bGxcbiAgfSk7XG4gIGNvbnN0IGZvcmNlVXBkYXRlID0gdXNlRm9yY2VVcGRhdGUoKTtcblxuICAvLyBXaXRob3V0IGRlcHMsIGFsd2F5cyBkaXNwb3NlIGFuZCByZWNyZWF0ZSB0aGUgY29tcHV0YXRpb24gd2l0aCBldmVyeSByZW5kZXIuXG4gIGlmIChyZWZzLmNvbXB1dGF0aW9uKSB7XG4gICAgcmVmcy5jb21wdXRhdGlvbi5zdG9wKCk7XG4gICAgLy8gQHRzLWlnbm9yZSBUaGlzIG1ha2VzIFRTIHRoaW5rIHJlZi5jb21wdXRhdGlvbiBpcyBcIm5ldmVyXCIgc2V0XG4gICAgZGVsZXRlIHJlZnMuY29tcHV0YXRpb247XG4gIH1cblxuICAvLyBVc2UgVHJhY2tlci5ub25yZWFjdGl2ZSBpbiBjYXNlIHdlIGFyZSBpbnNpZGUgYSBUcmFja2VyIENvbXB1dGF0aW9uLlxuICAvLyBUaGlzIGNhbiBoYXBwZW4gaWYgc29tZW9uZSBjYWxscyBgUmVhY3RET00ucmVuZGVyYCBpbnNpZGUgYSBDb21wdXRhdGlvbi5cbiAgLy8gSW4gdGhhdCBjYXNlLCB3ZSB3YW50IHRvIG9wdCBvdXQgb2YgdGhlIG5vcm1hbCBiZWhhdmlvciBvZiBuZXN0ZWRcbiAgLy8gQ29tcHV0YXRpb25zLCB3aGVyZSBpZiB0aGUgb3V0ZXIgb25lIGlzIGludmFsaWRhdGVkIG9yIHN0b3BwZWQsXG4gIC8vIGl0IHN0b3BzIHRoZSBpbm5lciBvbmUuXG4gIFRyYWNrZXIubm9ucmVhY3RpdmUoKCkgPT4gVHJhY2tlci5hdXRvcnVuKChjOiBUcmFja2VyLkNvbXB1dGF0aW9uKSA9PiB7XG4gICAgcmVmcy5jb21wdXRhdGlvbiA9IGM7XG4gICAgaWYgKGMuZmlyc3RSdW4pIHtcbiAgICAgIC8vIEFsd2F5cyBydW4gdGhlIHJlYWN0aXZlRm4gb24gZmlyc3RSdW5cbiAgICAgIHJlZnMudHJhY2tlckRhdGEgPSByZWFjdGl2ZUZuKGMpO1xuICAgIH0gZWxzZSBpZiAoIXNraXBVcGRhdGUgfHwgIXNraXBVcGRhdGUocmVmcy50cmFja2VyRGF0YSwgcmVhY3RpdmVGbihjKSkpIHtcbiAgICAgIC8vIEZvciBhbnkgcmVhY3RpdmUgY2hhbmdlLCBmb3JjZVVwZGF0ZSBhbmQgbGV0IHRoZSBuZXh0IHJlbmRlciByZWJ1aWxkIHRoZSBjb21wdXRhdGlvbi5cbiAgICAgIGZvcmNlVXBkYXRlKCk7XG4gICAgfVxuICB9KSk7XG5cbiAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgc2lkZSBlZmZlY3RzIGluIHJlbmRlciB3aXRoIFRyYWNrZXIgd2hlbiBub3QgdXNpbmcgZGVwc1xuICAvLyBjcmVhdGUgdGhlIGNvbXB1dGF0aW9uLCBydW4gdGhlIHVzZXIncyByZWFjdGl2ZSBmdW5jdGlvbiBpbiBhIGNvbXB1dGF0aW9uIHN5bmNocm9ub3VzbHksXG4gIC8vIHRoZW4gaW1tZWRpYXRlbHkgZGlzcG9zZSBvZiBpdC4gSXQnbGwgYmUgcmVjcmVhdGVkIGFnYWluIGFmdGVyIHRoZSByZW5kZXIgaXMgY29tbWl0dGVkLlxuICBpZiAoIXJlZnMuaXNNb3VudGVkKSB7XG4gICAgLy8gV2Ugd2FudCB0byBmb3JjZVVwZGF0ZSBpbiB1c2VFZmZlY3QgdG8gc3VwcG9ydCBTdHJpY3RNb2RlLlxuICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9yZWFjdC1wYWNrYWdlcy9pc3N1ZXMvMjc4XG4gICAgaWYgKHJlZnMuY29tcHV0YXRpb24pIHtcbiAgICAgIHJlZnMuY29tcHV0YXRpb24uc3RvcCgpO1xuICAgICAgZGVsZXRlIHJlZnMuY29tcHV0YXRpb247XG4gICAgfVxuICB9XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAvLyBMZXQgc3Vic2VxdWVudCByZW5kZXJzIGtub3cgd2UgYXJlIG1vdW50ZWQgKHJlbmRlciBpcyBjb21taXR0ZWQpLlxuICAgIHJlZnMuaXNNb3VudGVkID0gdHJ1ZTtcblxuICAgIC8vIFJlbmRlciBpcyBjb21taXR0ZWQuIFNpbmNlIHVzZVRyYWNrZXIgd2l0aG91dCBkZXBzIGFsd2F5cyBydW5zIHN5bmNocm9ub3VzbHksXG4gICAgLy8gZm9yY2VVcGRhdGUgYW5kIGxldCB0aGUgbmV4dCByZW5kZXIgcmVjcmVhdGUgdGhlIGNvbXB1dGF0aW9uLlxuICAgIGlmICghc2tpcFVwZGF0ZSkge1xuICAgICAgZm9yY2VVcGRhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgVHJhY2tlci5ub25yZWFjdGl2ZSgoKSA9PiBUcmFja2VyLmF1dG9ydW4oKGM6IFRyYWNrZXIuQ29tcHV0YXRpb24pID0+IHtcbiAgICAgICAgcmVmcy5jb21wdXRhdGlvbiA9IGM7XG4gICAgICAgIGlmICghc2tpcFVwZGF0ZShyZWZzLnRyYWNrZXJEYXRhLCByZWFjdGl2ZUZuKGMpKSkge1xuICAgICAgICAgIC8vIEZvciBhbnkgcmVhY3RpdmUgY2hhbmdlLCBmb3JjZVVwZGF0ZSBhbmQgbGV0IHRoZSBuZXh0IHJlbmRlciByZWJ1aWxkIHRoZSBjb21wdXRhdGlvbi5cbiAgICAgICAgICBmb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgLy8gc3RvcCB0aGUgY29tcHV0YXRpb24gb24gdW5tb3VudFxuICAgIHJldHVybiAoKSA9PntcbiAgICAgIHJlZnMuY29tcHV0YXRpb24/LnN0b3AoKTtcbiAgICB9XG4gIH0sIFtdKTtcblxuICByZXR1cm4gcmVmcy50cmFja2VyRGF0YTtcbn1cblxuY29uc3QgdXNlVHJhY2tlcldpdGhEZXBzID0gPFQgPSBhbnk+KHJlYWN0aXZlRm46IElSZWFjdGl2ZUZuPFQ+LCBkZXBzOiBEZXBlbmRlbmN5TGlzdCwgc2tpcFVwZGF0ZTogSVNraXBVcGRhdGU8VD4gPSBudWxsKTogVCA9PiB7XG4gIGNvbnN0IGZvcmNlVXBkYXRlID0gdXNlRm9yY2VVcGRhdGUoKTtcblxuICBjb25zdCB7IGN1cnJlbnQ6IHJlZnMgfSA9IHVzZVJlZjx7XG4gICAgcmVhY3RpdmVGbjogSVJlYWN0aXZlRm48VD47XG4gICAgZGF0YT86IFQ7XG4gIH0+KHsgcmVhY3RpdmVGbiB9KTtcblxuICAvLyBrZWVwIHJlYWN0aXZlRm4gcmVmIGZyZXNoXG4gIHJlZnMucmVhY3RpdmVGbiA9IHJlYWN0aXZlRm47XG5cbiAgdXNlTWVtbygoKSA9PiB7XG4gICAgLy8gVG8gaml2ZSB3aXRoIHRoZSBsaWZlY3ljbGUgaW50ZXJwbGF5IGJldHdlZW4gVHJhY2tlci9TdWJzY3JpYmUsIHJ1biB0aGVcbiAgICAvLyByZWFjdGl2ZSBmdW5jdGlvbiBpbiBhIGNvbXB1dGF0aW9uLCB0aGVuIHN0b3AgaXQsIHRvIGZvcmNlIGZsdXNoIGN5Y2xlLlxuICAgIGNvbnN0IGNvbXAgPSBUcmFja2VyLm5vbnJlYWN0aXZlKFxuICAgICAgKCkgPT4gVHJhY2tlci5hdXRvcnVuKChjOiBUcmFja2VyLkNvbXB1dGF0aW9uKSA9PiB7XG4gICAgICAgIHJlZnMuZGF0YSA9IHJlZnMucmVhY3RpdmVGbigpO1xuICAgICAgfSlcbiAgICApO1xuICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIHNpZGUgZWZmZWN0cyBpbiByZW5kZXIsIHN0b3AgdGhlIGNvbXB1dGF0aW9uIGltbWVkaWF0ZWx5XG4gICAgTWV0ZW9yLmRlZmVyKCgpID0+IHsgY29tcC5zdG9wKCkgfSk7XG4gIH0sIGRlcHMpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgY29tcHV0YXRpb24gPSBUcmFja2VyLm5vbnJlYWN0aXZlKFxuICAgICAgKCkgPT4gVHJhY2tlci5hdXRvcnVuKChjKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGE6IFQgPSByZWZzLnJlYWN0aXZlRm4oYyk7XG4gICAgICAgIGlmICghc2tpcFVwZGF0ZSB8fCAhc2tpcFVwZGF0ZShyZWZzLmRhdGEsIGRhdGEpKSB7XG4gICAgICAgICAgcmVmcy5kYXRhID0gZGF0YTtcbiAgICAgICAgICBmb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNvbXB1dGF0aW9uLnN0b3AoKTtcbiAgICB9O1xuICB9LCBkZXBzKTtcblxuICByZXR1cm4gcmVmcy5kYXRhIGFzIFQ7XG59O1xuXG5mdW5jdGlvbiB1c2VUcmFja2VyQ2xpZW50IDxUID0gYW55PihyZWFjdGl2ZUZuOiBJUmVhY3RpdmVGbjxUPiwgc2tpcFVwZGF0ZT86IElTa2lwVXBkYXRlPFQ+KTogVDtcbmZ1bmN0aW9uIHVzZVRyYWNrZXJDbGllbnQgPFQgPSBhbnk+KHJlYWN0aXZlRm46IElSZWFjdGl2ZUZuPFQ+LCBkZXBzPzogRGVwZW5kZW5jeUxpc3QsIHNraXBVcGRhdGU/OiBJU2tpcFVwZGF0ZTxUPik6IFQ7XG5mdW5jdGlvbiB1c2VUcmFja2VyQ2xpZW50IDxUID0gYW55PihyZWFjdGl2ZUZuOiBJUmVhY3RpdmVGbjxUPiwgZGVwczogRGVwZW5kZW5jeUxpc3QgfCBJU2tpcFVwZGF0ZTxUPiA9IG51bGwsIHNraXBVcGRhdGU6IElTa2lwVXBkYXRlPFQ+ID0gbnVsbCk6IFQge1xuICBpZiAoZGVwcyA9PT0gbnVsbCB8fCBkZXBzID09PSB1bmRlZmluZWQgfHwgIUFycmF5LmlzQXJyYXkoZGVwcykpIHtcbiAgICBpZiAodHlwZW9mIGRlcHMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgc2tpcFVwZGF0ZSA9IGRlcHM7XG4gICAgfVxuICAgIHJldHVybiB1c2VUcmFja2VyTm9EZXBzKHJlYWN0aXZlRm4sIHNraXBVcGRhdGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB1c2VUcmFja2VyV2l0aERlcHMocmVhY3RpdmVGbiwgZGVwcywgc2tpcFVwZGF0ZSk7XG4gIH1cbn1cblxuY29uc3QgdXNlVHJhY2tlclNlcnZlcjogdHlwZW9mIHVzZVRyYWNrZXJDbGllbnQgPSAocmVhY3RpdmVGbikgPT4ge1xuICByZXR1cm4gVHJhY2tlci5ub25yZWFjdGl2ZShyZWFjdGl2ZUZuKTtcbn1cblxuLy8gV2hlbiByZW5kZXJpbmcgb24gdGhlIHNlcnZlciwgd2UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIFRyYWNrZXIuXG4vLyBXZSBvbmx5IGRvIHRoZSBmaXJzdCByZW5kZXJpbmcgb24gdGhlIHNlcnZlciBzbyB3ZSBjYW4gZ2V0IHRoZSBkYXRhIHJpZ2h0IGF3YXlcbmNvbnN0IHVzZVRyYWNrZXIgPSBNZXRlb3IuaXNTZXJ2ZXJcbiAgPyB1c2VUcmFja2VyU2VydmVyXG4gIDogdXNlVHJhY2tlckNsaWVudDtcblxuZnVuY3Rpb24gdXNlVHJhY2tlckRldiAocmVhY3RpdmVGbiwgZGVwcyA9IG51bGwsIHNraXBVcGRhdGUgPSBudWxsKSB7XG4gIGZ1bmN0aW9uIHdhcm4gKGV4cGVjdHM6IHN0cmluZywgcG9zOiBzdHJpbmcsIGFyZzogc3RyaW5nLCB0eXBlOiBzdHJpbmcpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICBgV2FybmluZzogdXNlVHJhY2tlciBleHBlY3RlZCBhICR7ZXhwZWN0c30gaW4gaXRcXCdzICR7cG9zfSBhcmd1bWVudCBgXG4gICAgICAgICsgYCgke2FyZ30pLCBidXQgZ290IHR5cGUgb2YgXFxgJHt0eXBlfVxcYC5gXG4gICAgKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcmVhY3RpdmVGbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHdhcm4oXCJmdW5jdGlvblwiLCBcIjFzdFwiLCBcInJlYWN0aXZlRm5cIiwgcmVhY3RpdmVGbik7XG4gIH1cblxuICBpZiAoZGVwcyAmJiBza2lwVXBkYXRlICYmICFBcnJheS5pc0FycmF5KGRlcHMpICYmIHR5cGVvZiBza2lwVXBkYXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB3YXJuKFwiYXJyYXkgJiBmdW5jdGlvblwiLCBcIjJuZCBhbmQgM3JkXCIsIFwiZGVwcywgc2tpcFVwZGF0ZVwiLFxuICAgICAgYCR7dHlwZW9mIGRlcHN9ICYgJHt0eXBlb2Ygc2tpcFVwZGF0ZX1gKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVwcyAmJiAhQXJyYXkuaXNBcnJheShkZXBzKSAmJiB0eXBlb2YgZGVwcyAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB3YXJuKFwiYXJyYXkgb3IgZnVuY3Rpb25cIiwgXCIybmRcIiwgXCJkZXBzIG9yIHNraXBVcGRhdGVcIiwgdHlwZW9mIGRlcHMpO1xuICAgIH1cbiAgICBpZiAoc2tpcFVwZGF0ZSAmJiB0eXBlb2Ygc2tpcFVwZGF0ZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB3YXJuKFwiZnVuY3Rpb25cIiwgXCIzcmRcIiwgXCJza2lwVXBkYXRlXCIsIHR5cGVvZiBza2lwVXBkYXRlKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBkYXRhID0gdXNlVHJhY2tlcihyZWFjdGl2ZUZuLCBkZXBzLCBza2lwVXBkYXRlKTtcbiAgY2hlY2tDdXJzb3IoZGF0YSk7XG4gIHJldHVybiBkYXRhO1xufVxuXG5leHBvcnQgZGVmYXVsdCBNZXRlb3IuaXNEZXZlbG9wbWVudFxuICA/IHVzZVRyYWNrZXJEZXYgYXMgdHlwZW9mIHVzZVRyYWNrZXJDbGllbnRcbiAgOiB1c2VUcmFja2VyO1xuIiwiaW1wb3J0IFJlYWN0LCB7IGZvcndhcmRSZWYsIG1lbW8gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgdXNlVHJhY2tlciBmcm9tICcuL3VzZVRyYWNrZXInO1xuXG50eXBlIFJlYWN0aXZlRm4gPSAocHJvcHM6IG9iamVjdCkgPT4gYW55O1xudHlwZSBSZWFjdGl2ZU9wdGlvbnMgPSB7XG4gIGdldE1ldGVvckRhdGE6IFJlYWN0aXZlRm47XG4gIHB1cmU/OiBib29sZWFuO1xuICBza2lwVXBkYXRlPzogKHByZXY6IGFueSwgbmV4dDogYW55KSA9PiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB3aXRoVHJhY2tlcihvcHRpb25zOiBSZWFjdGl2ZUZuIHwgUmVhY3RpdmVPcHRpb25zKSB7XG4gIHJldHVybiAoQ29tcG9uZW50OiBSZWFjdC5Db21wb25lbnRUeXBlKSA9PiB7XG4gICAgY29uc3QgZ2V0TWV0ZW9yRGF0YSA9IHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nXG4gICAgICA/IG9wdGlvbnNcbiAgICAgIDogb3B0aW9ucy5nZXRNZXRlb3JEYXRhO1xuXG4gICAgY29uc3QgV2l0aFRyYWNrZXIgPSBmb3J3YXJkUmVmKChwcm9wcywgcmVmKSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gdXNlVHJhY2tlcihcbiAgICAgICAgKCkgPT4gZ2V0TWV0ZW9yRGF0YShwcm9wcykgfHwge30sXG4gICAgICAgIChvcHRpb25zIGFzIFJlYWN0aXZlT3B0aW9ucykuc2tpcFVwZGF0ZVxuICAgICAgKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxDb21wb25lbnQgcmVmPXtyZWZ9IHsuLi5wcm9wc30gey4uLmRhdGF9IC8+XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgY29uc3QgeyBwdXJlID0gdHJ1ZSB9ID0gb3B0aW9ucyBhcyBSZWFjdGl2ZU9wdGlvbnM7XG4gICAgcmV0dXJuIHB1cmUgPyBtZW1vKFdpdGhUcmFja2VyKSA6IFdpdGhUcmFja2VyO1xuICB9O1xufVxuIl19
