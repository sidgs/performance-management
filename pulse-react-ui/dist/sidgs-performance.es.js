import * as me from "react";
import Pr, { useState as pe, useRef as Po, useEffect as Fr, useCallback as ko } from "react";
import { useNavigate as Dn, useLocation as Pn, Link as Gt, BrowserRouter as kn, Routes as Io, Route as or } from "react-router-dom";
import { Box as v, Fade as Ao, Badge as In, Button as We, Slide as $o, Paper as Tr, Typography as m, IconButton as _e, Avatar as $e, TextField as An, Grid as ee, Card as ve, CardContent as je, Chip as Ae, InputBase as No, LinearProgress as nt, AvatarGroup as Hr, AppBar as Mo, Toolbar as Wo, Drawer as Go, List as xr, ListItem as yr, ListItemButton as br, ListItemIcon as vr, ListItemText as jr, Divider as Lt, Collapse as Lo, Breadcrumbs as Uo, Link as Ut, InputAdornment as Bo, FormControl as Bt, InputLabel as Vt, Select as zt, MenuItem as Er, Tabs as Vo, Tab as wr, Dialog as zo, DialogTitle as Fo, DialogContent as Ho, Stack as Yo, TableContainer as Ft, Table as Ht, TableHead as Yt, TableRow as sr, TableCell as ae, TableBody as qt, Alert as qo, DialogActions as Ko, Tooltip as qe } from "@mui/material";
import { Assessment as Jo, PublishedWithChanges as ut, CheckCircle as dr, People as Xo, Chat as Qo, SmartToy as Kt, Close as Yr, Person as Zo, Send as es, ArrowForward as rs, Search as $n, Pending as Nn, Drafts as Mn, Menu as ts, Notifications as ns, Help as os, BarChart as ss, ExpandLess as ot, ExpandMore as st, Home as is, TrendingUp as as, Report as ls, Settings as cs, NavigateNext as us, ArrowDownward as ds, ArrowUpward as fs, Visibility as Jt, Delete as Xt } from "@mui/icons-material";
import { Global as ps, ThemeContext as Wn } from "@emotion/react";
import "@emotion/styled";
function hs(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Gn(e) {
  if (e.__esModule) return e;
  var t = e.default;
  if (typeof t == "function") {
    var n = function o() {
      return this instanceof o ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    n.prototype = t.prototype;
  } else n = {};
  return Object.defineProperty(n, "__esModule", { value: !0 }), Object.keys(e).forEach(function(o) {
    var s = Object.getOwnPropertyDescriptor(e, o);
    Object.defineProperty(n, o, s.get ? s : {
      enumerable: !0,
      get: function() {
        return e[o];
      }
    });
  }), n;
}
var it = { exports: {} }, ir = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Qt;
function ms() {
  if (Qt) return ir;
  Qt = 1;
  var e = Pr, t = Symbol.for("react.element"), n = Symbol.for("react.fragment"), o = Object.prototype.hasOwnProperty, s = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, a = { key: !0, ref: !0, __self: !0, __source: !0 };
  function l(d, c, f) {
    var x, j = {}, g = null, S = null;
    f !== void 0 && (g = "" + f), c.key !== void 0 && (g = "" + c.key), c.ref !== void 0 && (S = c.ref);
    for (x in c) o.call(c, x) && !a.hasOwnProperty(x) && (j[x] = c[x]);
    if (d && d.defaultProps) for (x in c = d.defaultProps, c) j[x] === void 0 && (j[x] = c[x]);
    return { $$typeof: t, type: d, key: g, ref: S, props: j, _owner: s.current };
  }
  return ir.Fragment = n, ir.jsx = l, ir.jsxs = l, ir;
}
var ar = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Zt;
function gs() {
  return Zt || (Zt = 1, process.env.NODE_ENV !== "production" && function() {
    var e = Pr, t = Symbol.for("react.element"), n = Symbol.for("react.portal"), o = Symbol.for("react.fragment"), s = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), l = Symbol.for("react.provider"), d = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), f = Symbol.for("react.suspense"), x = Symbol.for("react.suspense_list"), j = Symbol.for("react.memo"), g = Symbol.for("react.lazy"), S = Symbol.for("react.offscreen"), w = Symbol.iterator, y = "@@iterator";
    function _(i) {
      if (i === null || typeof i != "object")
        return null;
      var p = w && i[w] || i[y];
      return typeof p == "function" ? p : null;
    }
    var M = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function Y(i) {
      {
        for (var p = arguments.length, T = new Array(p > 1 ? p - 1 : 0), D = 1; D < p; D++)
          T[D - 1] = arguments[D];
        X("error", i, T);
      }
    }
    function X(i, p, T) {
      {
        var D = M.ReactDebugCurrentFrame, q = D.getStackAddendum();
        q !== "" && (p += "%s", T = T.concat([q]));
        var Q = T.map(function(F) {
          return String(F);
        });
        Q.unshift("Warning: " + p), Function.prototype.apply.call(console[i], console, Q);
      }
    }
    var $ = !1, E = !1, xe = !1, De = !1, b = !1, U;
    U = Symbol.for("react.module.reference");
    function oe(i) {
      return !!(typeof i == "string" || typeof i == "function" || i === o || i === a || b || i === s || i === f || i === x || De || i === S || $ || E || xe || typeof i == "object" && i !== null && (i.$$typeof === g || i.$$typeof === j || i.$$typeof === l || i.$$typeof === d || i.$$typeof === c || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      i.$$typeof === U || i.getModuleId !== void 0));
    }
    function Re(i, p, T) {
      var D = i.displayName;
      if (D)
        return D;
      var q = p.displayName || p.name || "";
      return q !== "" ? T + "(" + q + ")" : T;
    }
    function Pe(i) {
      return i.displayName || "Context";
    }
    function u(i) {
      if (i == null)
        return null;
      if (typeof i.tag == "number" && Y("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof i == "function")
        return i.displayName || i.name || null;
      if (typeof i == "string")
        return i;
      switch (i) {
        case o:
          return "Fragment";
        case n:
          return "Portal";
        case a:
          return "Profiler";
        case s:
          return "StrictMode";
        case f:
          return "Suspense";
        case x:
          return "SuspenseList";
      }
      if (typeof i == "object")
        switch (i.$$typeof) {
          case d:
            var p = i;
            return Pe(p) + ".Consumer";
          case l:
            var T = i;
            return Pe(T._context) + ".Provider";
          case c:
            return Re(i, i.render, "ForwardRef");
          case j:
            var D = i.displayName || null;
            return D !== null ? D : u(i.type) || "Memo";
          case g: {
            var q = i, Q = q._payload, F = q._init;
            try {
              return u(F(Q));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var I = Object.assign, se = 0, re, he, ke, ze, h, O, W;
    function N() {
    }
    N.__reactDisabledLog = !0;
    function P() {
      {
        if (se === 0) {
          re = console.log, he = console.info, ke = console.warn, ze = console.error, h = console.group, O = console.groupCollapsed, W = console.groupEnd;
          var i = {
            configurable: !0,
            enumerable: !0,
            value: N,
            writable: !0
          };
          Object.defineProperties(console, {
            info: i,
            log: i,
            warn: i,
            error: i,
            group: i,
            groupCollapsed: i,
            groupEnd: i
          });
        }
        se++;
      }
    }
    function z() {
      {
        if (se--, se === 0) {
          var i = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: I({}, i, {
              value: re
            }),
            info: I({}, i, {
              value: he
            }),
            warn: I({}, i, {
              value: ke
            }),
            error: I({}, i, {
              value: ze
            }),
            group: I({}, i, {
              value: h
            }),
            groupCollapsed: I({}, i, {
              value: O
            }),
            groupEnd: I({}, i, {
              value: W
            })
          });
        }
        se < 0 && Y("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var k = M.ReactCurrentDispatcher, A;
    function G(i, p, T) {
      {
        if (A === void 0)
          try {
            throw Error();
          } catch (q) {
            var D = q.stack.trim().match(/\n( *(at )?)/);
            A = D && D[1] || "";
          }
        return `
` + A + i;
      }
    }
    var H = !1, L;
    {
      var ge = typeof WeakMap == "function" ? WeakMap : Map;
      L = new ge();
    }
    function C(i, p) {
      if (!i || H)
        return "";
      {
        var T = L.get(i);
        if (T !== void 0)
          return T;
      }
      var D;
      H = !0;
      var q = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var Q;
      Q = k.current, k.current = null, P();
      try {
        if (p) {
          var F = function() {
            throw Error();
          };
          if (Object.defineProperty(F.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(F, []);
            } catch (be) {
              D = be;
            }
            Reflect.construct(i, [], F);
          } else {
            try {
              F.call();
            } catch (be) {
              D = be;
            }
            i.call(F.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (be) {
            D = be;
          }
          i();
        }
      } catch (be) {
        if (be && D && typeof be.stack == "string") {
          for (var B = be.stack.split(`
`), ye = D.stack.split(`
`), ie = B.length - 1, de = ye.length - 1; ie >= 1 && de >= 0 && B[ie] !== ye[de]; )
            de--;
          for (; ie >= 1 && de >= 0; ie--, de--)
            if (B[ie] !== ye[de]) {
              if (ie !== 1 || de !== 1)
                do
                  if (ie--, de--, de < 0 || B[ie] !== ye[de]) {
                    var Ce = `
` + B[ie].replace(" at new ", " at ");
                    return i.displayName && Ce.includes("<anonymous>") && (Ce = Ce.replace("<anonymous>", i.displayName)), typeof i == "function" && L.set(i, Ce), Ce;
                  }
                while (ie >= 1 && de >= 0);
              break;
            }
        }
      } finally {
        H = !1, k.current = Q, z(), Error.prepareStackTrace = q;
      }
      var Ye = i ? i.displayName || i.name : "", Ve = Ye ? G(Ye) : "";
      return typeof i == "function" && L.set(i, Ve), Ve;
    }
    function we(i, p, T) {
      return C(i, !1);
    }
    function Fe(i) {
      var p = i.prototype;
      return !!(p && p.isReactComponent);
    }
    function Be(i, p, T) {
      if (i == null)
        return "";
      if (typeof i == "function")
        return C(i, Fe(i));
      if (typeof i == "string")
        return G(i);
      switch (i) {
        case f:
          return G("Suspense");
        case x:
          return G("SuspenseList");
      }
      if (typeof i == "object")
        switch (i.$$typeof) {
          case c:
            return we(i.render);
          case j:
            return Be(i.type, p, T);
          case g: {
            var D = i, q = D._payload, Q = D._init;
            try {
              return Be(Q(q), p, T);
            } catch {
            }
          }
        }
      return "";
    }
    var nr = Object.prototype.hasOwnProperty, Tt = {}, Ot = M.ReactDebugCurrentFrame;
    function gr(i) {
      if (i) {
        var p = i._owner, T = Be(i.type, i._source, p ? p.type : null);
        Ot.setExtraStackFrame(T);
      } else
        Ot.setExtraStackFrame(null);
    }
    function lo(i, p, T, D, q) {
      {
        var Q = Function.call.bind(nr);
        for (var F in i)
          if (Q(i, F)) {
            var B = void 0;
            try {
              if (typeof i[F] != "function") {
                var ye = Error((D || "React class") + ": " + T + " type `" + F + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof i[F] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw ye.name = "Invariant Violation", ye;
              }
              B = i[F](p, F, D, T, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (ie) {
              B = ie;
            }
            B && !(B instanceof Error) && (gr(q), Y("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", D || "React class", T, F, typeof B), gr(null)), B instanceof Error && !(B.message in Tt) && (Tt[B.message] = !0, gr(q), Y("Failed %s type: %s", T, B.message), gr(null));
          }
      }
    }
    var co = Array.isArray;
    function Lr(i) {
      return co(i);
    }
    function uo(i) {
      {
        var p = typeof Symbol == "function" && Symbol.toStringTag, T = p && i[Symbol.toStringTag] || i.constructor.name || "Object";
        return T;
      }
    }
    function fo(i) {
      try {
        return St(i), !1;
      } catch {
        return !0;
      }
    }
    function St(i) {
      return "" + i;
    }
    function Rt(i) {
      if (fo(i))
        return Y("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", uo(i)), St(i);
    }
    var _t = M.ReactCurrentOwner, po = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Dt, Pt;
    function ho(i) {
      if (nr.call(i, "ref")) {
        var p = Object.getOwnPropertyDescriptor(i, "ref").get;
        if (p && p.isReactWarning)
          return !1;
      }
      return i.ref !== void 0;
    }
    function mo(i) {
      if (nr.call(i, "key")) {
        var p = Object.getOwnPropertyDescriptor(i, "key").get;
        if (p && p.isReactWarning)
          return !1;
      }
      return i.key !== void 0;
    }
    function go(i, p) {
      typeof i.ref == "string" && _t.current;
    }
    function xo(i, p) {
      {
        var T = function() {
          Dt || (Dt = !0, Y("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", p));
        };
        T.isReactWarning = !0, Object.defineProperty(i, "key", {
          get: T,
          configurable: !0
        });
      }
    }
    function yo(i, p) {
      {
        var T = function() {
          Pt || (Pt = !0, Y("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", p));
        };
        T.isReactWarning = !0, Object.defineProperty(i, "ref", {
          get: T,
          configurable: !0
        });
      }
    }
    var bo = function(i, p, T, D, q, Q, F) {
      var B = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: t,
        // Built-in properties that belong on the element
        type: i,
        key: p,
        ref: T,
        props: F,
        // Record the component responsible for creating this element.
        _owner: Q
      };
      return B._store = {}, Object.defineProperty(B._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(B, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: D
      }), Object.defineProperty(B, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: q
      }), Object.freeze && (Object.freeze(B.props), Object.freeze(B)), B;
    };
    function vo(i, p, T, D, q) {
      {
        var Q, F = {}, B = null, ye = null;
        T !== void 0 && (Rt(T), B = "" + T), mo(p) && (Rt(p.key), B = "" + p.key), ho(p) && (ye = p.ref, go(p, q));
        for (Q in p)
          nr.call(p, Q) && !po.hasOwnProperty(Q) && (F[Q] = p[Q]);
        if (i && i.defaultProps) {
          var ie = i.defaultProps;
          for (Q in ie)
            F[Q] === void 0 && (F[Q] = ie[Q]);
        }
        if (B || ye) {
          var de = typeof i == "function" ? i.displayName || i.name || "Unknown" : i;
          B && xo(F, de), ye && yo(F, de);
        }
        return bo(i, B, ye, q, D, _t.current, F);
      }
    }
    var Ur = M.ReactCurrentOwner, kt = M.ReactDebugCurrentFrame;
    function He(i) {
      if (i) {
        var p = i._owner, T = Be(i.type, i._source, p ? p.type : null);
        kt.setExtraStackFrame(T);
      } else
        kt.setExtraStackFrame(null);
    }
    var Br;
    Br = !1;
    function Vr(i) {
      return typeof i == "object" && i !== null && i.$$typeof === t;
    }
    function It() {
      {
        if (Ur.current) {
          var i = u(Ur.current.type);
          if (i)
            return `

Check the render method of \`` + i + "`.";
        }
        return "";
      }
    }
    function jo(i) {
      return "";
    }
    var At = {};
    function Eo(i) {
      {
        var p = It();
        if (!p) {
          var T = typeof i == "string" ? i : i.displayName || i.name;
          T && (p = `

Check the top-level render call using <` + T + ">.");
        }
        return p;
      }
    }
    function $t(i, p) {
      {
        if (!i._store || i._store.validated || i.key != null)
          return;
        i._store.validated = !0;
        var T = Eo(p);
        if (At[T])
          return;
        At[T] = !0;
        var D = "";
        i && i._owner && i._owner !== Ur.current && (D = " It was passed a child from " + u(i._owner.type) + "."), He(i), Y('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', T, D), He(null);
      }
    }
    function Nt(i, p) {
      {
        if (typeof i != "object")
          return;
        if (Lr(i))
          for (var T = 0; T < i.length; T++) {
            var D = i[T];
            Vr(D) && $t(D, p);
          }
        else if (Vr(i))
          i._store && (i._store.validated = !0);
        else if (i) {
          var q = _(i);
          if (typeof q == "function" && q !== i.entries)
            for (var Q = q.call(i), F; !(F = Q.next()).done; )
              Vr(F.value) && $t(F.value, p);
        }
      }
    }
    function wo(i) {
      {
        var p = i.type;
        if (p == null || typeof p == "string")
          return;
        var T;
        if (typeof p == "function")
          T = p.propTypes;
        else if (typeof p == "object" && (p.$$typeof === c || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        p.$$typeof === j))
          T = p.propTypes;
        else
          return;
        if (T) {
          var D = u(p);
          lo(T, i.props, "prop", D, i);
        } else if (p.PropTypes !== void 0 && !Br) {
          Br = !0;
          var q = u(p);
          Y("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", q || "Unknown");
        }
        typeof p.getDefaultProps == "function" && !p.getDefaultProps.isReactClassApproved && Y("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function Co(i) {
      {
        for (var p = Object.keys(i.props), T = 0; T < p.length; T++) {
          var D = p[T];
          if (D !== "children" && D !== "key") {
            He(i), Y("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", D), He(null);
            break;
          }
        }
        i.ref !== null && (He(i), Y("Invalid attribute `ref` supplied to `React.Fragment`."), He(null));
      }
    }
    var Mt = {};
    function Wt(i, p, T, D, q, Q) {
      {
        var F = oe(i);
        if (!F) {
          var B = "";
          (i === void 0 || typeof i == "object" && i !== null && Object.keys(i).length === 0) && (B += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var ye = jo();
          ye ? B += ye : B += It();
          var ie;
          i === null ? ie = "null" : Lr(i) ? ie = "array" : i !== void 0 && i.$$typeof === t ? (ie = "<" + (u(i.type) || "Unknown") + " />", B = " Did you accidentally export a JSX literal instead of a component?") : ie = typeof i, Y("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", ie, B);
        }
        var de = vo(i, p, T, q, Q);
        if (de == null)
          return de;
        if (F) {
          var Ce = p.children;
          if (Ce !== void 0)
            if (D)
              if (Lr(Ce)) {
                for (var Ye = 0; Ye < Ce.length; Ye++)
                  Nt(Ce[Ye], i);
                Object.freeze && Object.freeze(Ce);
              } else
                Y("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              Nt(Ce, i);
        }
        if (nr.call(p, "key")) {
          var Ve = u(i), be = Object.keys(p).filter(function(Do) {
            return Do !== "key";
          }), zr = be.length > 0 ? "{key: someKey, " + be.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!Mt[Ve + zr]) {
            var _o = be.length > 0 ? "{" + be.join(": ..., ") + ": ...}" : "{}";
            Y(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, zr, Ve, _o, Ve), Mt[Ve + zr] = !0;
          }
        }
        return i === o ? Co(de) : wo(de), de;
      }
    }
    function To(i, p, T) {
      return Wt(i, p, T, !0);
    }
    function Oo(i, p, T) {
      return Wt(i, p, T, !1);
    }
    var So = Oo, Ro = To;
    ar.Fragment = o, ar.jsx = So, ar.jsxs = Ro;
  }()), ar;
}
process.env.NODE_ENV === "production" ? it.exports = ms() : it.exports = gs();
var r = it.exports;
function fr(e) {
  let t = "https://mui.com/production-error/?code=" + e;
  for (let n = 1; n < arguments.length; n += 1)
    t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified MUI error #" + e + "; visit " + t + " for the full message.";
}
const xs = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: fr
}, Symbol.toStringTag, { value: "Module" })), at = "$$material";
function V() {
  return V = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = arguments[t];
      for (var o in n) ({}).hasOwnProperty.call(n, o) && (e[o] = n[o]);
    }
    return e;
  }, V.apply(null, arguments);
}
function Le(e, t) {
  if (e == null) return {};
  var n = {};
  for (var o in e) if ({}.hasOwnProperty.call(e, o)) {
    if (t.indexOf(o) !== -1) continue;
    n[o] = e[o];
  }
  return n;
}
function ys(e) {
  for (var t = 0, n, o = 0, s = e.length; s >= 4; ++o, s -= 4)
    n = e.charCodeAt(o) & 255 | (e.charCodeAt(++o) & 255) << 8 | (e.charCodeAt(++o) & 255) << 16 | (e.charCodeAt(++o) & 255) << 24, n = /* Math.imul(k, m): */
    (n & 65535) * 1540483477 + ((n >>> 16) * 59797 << 16), n ^= /* k >>> r: */
    n >>> 24, t = /* Math.imul(k, m): */
    (n & 65535) * 1540483477 + ((n >>> 16) * 59797 << 16) ^ /* Math.imul(h, m): */
    (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16);
  switch (s) {
    case 3:
      t ^= (e.charCodeAt(o + 2) & 255) << 16;
    case 2:
      t ^= (e.charCodeAt(o + 1) & 255) << 8;
    case 1:
      t ^= e.charCodeAt(o) & 255, t = /* Math.imul(h, m): */
      (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16);
  }
  return t ^= t >>> 13, t = /* Math.imul(h, m): */
  (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16), ((t ^ t >>> 15) >>> 0).toString(36);
}
var bs = {
  animationIterationCount: 1,
  aspectRatio: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  scale: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
};
function vs(e) {
  var t = /* @__PURE__ */ Object.create(null);
  return function(n) {
    return t[n] === void 0 && (t[n] = e(n)), t[n];
  };
}
var js = /[A-Z]|^ms/g, Es = /_EMO_([^_]+?)_([^]*?)_EMO_/g, Ln = function(t) {
  return t.charCodeAt(1) === 45;
}, en = function(t) {
  return t != null && typeof t != "boolean";
}, qr = /* @__PURE__ */ vs(function(e) {
  return Ln(e) ? e : e.replace(js, "-$&").toLowerCase();
}), rn = function(t, n) {
  switch (t) {
    case "animation":
    case "animationName":
      if (typeof n == "string")
        return n.replace(Es, function(o, s, a) {
          return Ge = {
            name: s,
            styles: a,
            next: Ge
          }, s;
        });
  }
  return bs[t] !== 1 && !Ln(t) && typeof n == "number" && n !== 0 ? n + "px" : n;
};
function Or(e, t, n) {
  if (n == null)
    return "";
  var o = n;
  if (o.__emotion_styles !== void 0)
    return o;
  switch (typeof n) {
    case "boolean":
      return "";
    case "object": {
      var s = n;
      if (s.anim === 1)
        return Ge = {
          name: s.name,
          styles: s.styles,
          next: Ge
        }, s.name;
      var a = n;
      if (a.styles !== void 0) {
        var l = a.next;
        if (l !== void 0)
          for (; l !== void 0; )
            Ge = {
              name: l.name,
              styles: l.styles,
              next: Ge
            }, l = l.next;
        var d = a.styles + ";";
        return d;
      }
      return ws(e, t, n);
    }
  }
  var c = n;
  return c;
}
function ws(e, t, n) {
  var o = "";
  if (Array.isArray(n))
    for (var s = 0; s < n.length; s++)
      o += Or(e, t, n[s]) + ";";
  else
    for (var a in n) {
      var l = n[a];
      if (typeof l != "object") {
        var d = l;
        en(d) && (o += qr(a) + ":" + rn(a, d) + ";");
      } else if (Array.isArray(l) && typeof l[0] == "string" && t == null)
        for (var c = 0; c < l.length; c++)
          en(l[c]) && (o += qr(a) + ":" + rn(a, l[c]) + ";");
      else {
        var f = Or(e, t, l);
        switch (a) {
          case "animation":
          case "animationName": {
            o += qr(a) + ":" + f + ";";
            break;
          }
          default:
            o += a + "{" + f + "}";
        }
      }
    }
  return o;
}
var tn = /label:\s*([^\s;{]+)\s*(;|$)/g, Ge;
function Cs(e, t, n) {
  if (e.length === 1 && typeof e[0] == "object" && e[0] !== null && e[0].styles !== void 0)
    return e[0];
  var o = !0, s = "";
  Ge = void 0;
  var a = e[0];
  if (a == null || a.raw === void 0)
    o = !1, s += Or(n, t, a);
  else {
    var l = a;
    s += l[0];
  }
  for (var d = 1; d < e.length; d++)
    if (s += Or(n, t, e[d]), o) {
      var c = a;
      s += c[d];
    }
  tn.lastIndex = 0;
  for (var f = "", x; (x = tn.exec(s)) !== null; )
    f += "-" + x[1];
  var j = ys(s) + f;
  return {
    name: j,
    styles: s,
    next: Ge
  };
}
var lt = { exports: {} }, Cr = { exports: {} }, K = {};
/** @license React v16.13.1
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var nn;
function Ts() {
  if (nn) return K;
  nn = 1;
  var e = typeof Symbol == "function" && Symbol.for, t = e ? Symbol.for("react.element") : 60103, n = e ? Symbol.for("react.portal") : 60106, o = e ? Symbol.for("react.fragment") : 60107, s = e ? Symbol.for("react.strict_mode") : 60108, a = e ? Symbol.for("react.profiler") : 60114, l = e ? Symbol.for("react.provider") : 60109, d = e ? Symbol.for("react.context") : 60110, c = e ? Symbol.for("react.async_mode") : 60111, f = e ? Symbol.for("react.concurrent_mode") : 60111, x = e ? Symbol.for("react.forward_ref") : 60112, j = e ? Symbol.for("react.suspense") : 60113, g = e ? Symbol.for("react.suspense_list") : 60120, S = e ? Symbol.for("react.memo") : 60115, w = e ? Symbol.for("react.lazy") : 60116, y = e ? Symbol.for("react.block") : 60121, _ = e ? Symbol.for("react.fundamental") : 60117, M = e ? Symbol.for("react.responder") : 60118, Y = e ? Symbol.for("react.scope") : 60119;
  function X(E) {
    if (typeof E == "object" && E !== null) {
      var xe = E.$$typeof;
      switch (xe) {
        case t:
          switch (E = E.type, E) {
            case c:
            case f:
            case o:
            case a:
            case s:
            case j:
              return E;
            default:
              switch (E = E && E.$$typeof, E) {
                case d:
                case x:
                case w:
                case S:
                case l:
                  return E;
                default:
                  return xe;
              }
          }
        case n:
          return xe;
      }
    }
  }
  function $(E) {
    return X(E) === f;
  }
  return K.AsyncMode = c, K.ConcurrentMode = f, K.ContextConsumer = d, K.ContextProvider = l, K.Element = t, K.ForwardRef = x, K.Fragment = o, K.Lazy = w, K.Memo = S, K.Portal = n, K.Profiler = a, K.StrictMode = s, K.Suspense = j, K.isAsyncMode = function(E) {
    return $(E) || X(E) === c;
  }, K.isConcurrentMode = $, K.isContextConsumer = function(E) {
    return X(E) === d;
  }, K.isContextProvider = function(E) {
    return X(E) === l;
  }, K.isElement = function(E) {
    return typeof E == "object" && E !== null && E.$$typeof === t;
  }, K.isForwardRef = function(E) {
    return X(E) === x;
  }, K.isFragment = function(E) {
    return X(E) === o;
  }, K.isLazy = function(E) {
    return X(E) === w;
  }, K.isMemo = function(E) {
    return X(E) === S;
  }, K.isPortal = function(E) {
    return X(E) === n;
  }, K.isProfiler = function(E) {
    return X(E) === a;
  }, K.isStrictMode = function(E) {
    return X(E) === s;
  }, K.isSuspense = function(E) {
    return X(E) === j;
  }, K.isValidElementType = function(E) {
    return typeof E == "string" || typeof E == "function" || E === o || E === f || E === a || E === s || E === j || E === g || typeof E == "object" && E !== null && (E.$$typeof === w || E.$$typeof === S || E.$$typeof === l || E.$$typeof === d || E.$$typeof === x || E.$$typeof === _ || E.$$typeof === M || E.$$typeof === Y || E.$$typeof === y);
  }, K.typeOf = X, K;
}
var J = {};
/** @license React v16.13.1
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var on;
function Os() {
  return on || (on = 1, process.env.NODE_ENV !== "production" && function() {
    var e = typeof Symbol == "function" && Symbol.for, t = e ? Symbol.for("react.element") : 60103, n = e ? Symbol.for("react.portal") : 60106, o = e ? Symbol.for("react.fragment") : 60107, s = e ? Symbol.for("react.strict_mode") : 60108, a = e ? Symbol.for("react.profiler") : 60114, l = e ? Symbol.for("react.provider") : 60109, d = e ? Symbol.for("react.context") : 60110, c = e ? Symbol.for("react.async_mode") : 60111, f = e ? Symbol.for("react.concurrent_mode") : 60111, x = e ? Symbol.for("react.forward_ref") : 60112, j = e ? Symbol.for("react.suspense") : 60113, g = e ? Symbol.for("react.suspense_list") : 60120, S = e ? Symbol.for("react.memo") : 60115, w = e ? Symbol.for("react.lazy") : 60116, y = e ? Symbol.for("react.block") : 60121, _ = e ? Symbol.for("react.fundamental") : 60117, M = e ? Symbol.for("react.responder") : 60118, Y = e ? Symbol.for("react.scope") : 60119;
    function X(C) {
      return typeof C == "string" || typeof C == "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
      C === o || C === f || C === a || C === s || C === j || C === g || typeof C == "object" && C !== null && (C.$$typeof === w || C.$$typeof === S || C.$$typeof === l || C.$$typeof === d || C.$$typeof === x || C.$$typeof === _ || C.$$typeof === M || C.$$typeof === Y || C.$$typeof === y);
    }
    function $(C) {
      if (typeof C == "object" && C !== null) {
        var we = C.$$typeof;
        switch (we) {
          case t:
            var Fe = C.type;
            switch (Fe) {
              case c:
              case f:
              case o:
              case a:
              case s:
              case j:
                return Fe;
              default:
                var Be = Fe && Fe.$$typeof;
                switch (Be) {
                  case d:
                  case x:
                  case w:
                  case S:
                  case l:
                    return Be;
                  default:
                    return we;
                }
            }
          case n:
            return we;
        }
      }
    }
    var E = c, xe = f, De = d, b = l, U = t, oe = x, Re = o, Pe = w, u = S, I = n, se = a, re = s, he = j, ke = !1;
    function ze(C) {
      return ke || (ke = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.")), h(C) || $(C) === c;
    }
    function h(C) {
      return $(C) === f;
    }
    function O(C) {
      return $(C) === d;
    }
    function W(C) {
      return $(C) === l;
    }
    function N(C) {
      return typeof C == "object" && C !== null && C.$$typeof === t;
    }
    function P(C) {
      return $(C) === x;
    }
    function z(C) {
      return $(C) === o;
    }
    function k(C) {
      return $(C) === w;
    }
    function A(C) {
      return $(C) === S;
    }
    function G(C) {
      return $(C) === n;
    }
    function H(C) {
      return $(C) === a;
    }
    function L(C) {
      return $(C) === s;
    }
    function ge(C) {
      return $(C) === j;
    }
    J.AsyncMode = E, J.ConcurrentMode = xe, J.ContextConsumer = De, J.ContextProvider = b, J.Element = U, J.ForwardRef = oe, J.Fragment = Re, J.Lazy = Pe, J.Memo = u, J.Portal = I, J.Profiler = se, J.StrictMode = re, J.Suspense = he, J.isAsyncMode = ze, J.isConcurrentMode = h, J.isContextConsumer = O, J.isContextProvider = W, J.isElement = N, J.isForwardRef = P, J.isFragment = z, J.isLazy = k, J.isMemo = A, J.isPortal = G, J.isProfiler = H, J.isStrictMode = L, J.isSuspense = ge, J.isValidElementType = X, J.typeOf = $;
  }()), J;
}
var sn;
function Un() {
  return sn || (sn = 1, process.env.NODE_ENV === "production" ? Cr.exports = Ts() : Cr.exports = Os()), Cr.exports;
}
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
var Kr, an;
function Ss() {
  if (an) return Kr;
  an = 1;
  var e = Object.getOwnPropertySymbols, t = Object.prototype.hasOwnProperty, n = Object.prototype.propertyIsEnumerable;
  function o(a) {
    if (a == null)
      throw new TypeError("Object.assign cannot be called with null or undefined");
    return Object(a);
  }
  function s() {
    try {
      if (!Object.assign)
        return !1;
      var a = new String("abc");
      if (a[5] = "de", Object.getOwnPropertyNames(a)[0] === "5")
        return !1;
      for (var l = {}, d = 0; d < 10; d++)
        l["_" + String.fromCharCode(d)] = d;
      var c = Object.getOwnPropertyNames(l).map(function(x) {
        return l[x];
      });
      if (c.join("") !== "0123456789")
        return !1;
      var f = {};
      return "abcdefghijklmnopqrst".split("").forEach(function(x) {
        f[x] = x;
      }), Object.keys(Object.assign({}, f)).join("") === "abcdefghijklmnopqrst";
    } catch {
      return !1;
    }
  }
  return Kr = s() ? Object.assign : function(a, l) {
    for (var d, c = o(a), f, x = 1; x < arguments.length; x++) {
      d = Object(arguments[x]);
      for (var j in d)
        t.call(d, j) && (c[j] = d[j]);
      if (e) {
        f = e(d);
        for (var g = 0; g < f.length; g++)
          n.call(d, f[g]) && (c[f[g]] = d[f[g]]);
      }
    }
    return c;
  }, Kr;
}
var Jr, ln;
function dt() {
  if (ln) return Jr;
  ln = 1;
  var e = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return Jr = e, Jr;
}
var Xr, cn;
function Bn() {
  return cn || (cn = 1, Xr = Function.call.bind(Object.prototype.hasOwnProperty)), Xr;
}
var Qr, un;
function Rs() {
  if (un) return Qr;
  un = 1;
  var e = function() {
  };
  if (process.env.NODE_ENV !== "production") {
    var t = dt(), n = {}, o = Bn();
    e = function(a) {
      var l = "Warning: " + a;
      typeof console < "u" && console.error(l);
      try {
        throw new Error(l);
      } catch {
      }
    };
  }
  function s(a, l, d, c, f) {
    if (process.env.NODE_ENV !== "production") {
      for (var x in a)
        if (o(a, x)) {
          var j;
          try {
            if (typeof a[x] != "function") {
              var g = Error(
                (c || "React class") + ": " + d + " type `" + x + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof a[x] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
              );
              throw g.name = "Invariant Violation", g;
            }
            j = a[x](l, x, c, d, null, t);
          } catch (w) {
            j = w;
          }
          if (j && !(j instanceof Error) && e(
            (c || "React class") + ": type specification of " + d + " `" + x + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof j + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
          ), j instanceof Error && !(j.message in n)) {
            n[j.message] = !0;
            var S = f ? f() : "";
            e(
              "Failed " + d + " type: " + j.message + (S ?? "")
            );
          }
        }
    }
  }
  return s.resetWarningCache = function() {
    process.env.NODE_ENV !== "production" && (n = {});
  }, Qr = s, Qr;
}
var Zr, dn;
function _s() {
  if (dn) return Zr;
  dn = 1;
  var e = Un(), t = Ss(), n = dt(), o = Bn(), s = Rs(), a = function() {
  };
  process.env.NODE_ENV !== "production" && (a = function(d) {
    var c = "Warning: " + d;
    typeof console < "u" && console.error(c);
    try {
      throw new Error(c);
    } catch {
    }
  });
  function l() {
    return null;
  }
  return Zr = function(d, c) {
    var f = typeof Symbol == "function" && Symbol.iterator, x = "@@iterator";
    function j(h) {
      var O = h && (f && h[f] || h[x]);
      if (typeof O == "function")
        return O;
    }
    var g = "<<anonymous>>", S = {
      array: M("array"),
      bigint: M("bigint"),
      bool: M("boolean"),
      func: M("function"),
      number: M("number"),
      object: M("object"),
      string: M("string"),
      symbol: M("symbol"),
      any: Y(),
      arrayOf: X,
      element: $(),
      elementType: E(),
      instanceOf: xe,
      node: oe(),
      objectOf: b,
      oneOf: De,
      oneOfType: U,
      shape: Pe,
      exact: u
    };
    function w(h, O) {
      return h === O ? h !== 0 || 1 / h === 1 / O : h !== h && O !== O;
    }
    function y(h, O) {
      this.message = h, this.data = O && typeof O == "object" ? O : {}, this.stack = "";
    }
    y.prototype = Error.prototype;
    function _(h) {
      if (process.env.NODE_ENV !== "production")
        var O = {}, W = 0;
      function N(z, k, A, G, H, L, ge) {
        if (G = G || g, L = L || A, ge !== n) {
          if (c) {
            var C = new Error(
              "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
            );
            throw C.name = "Invariant Violation", C;
          } else if (process.env.NODE_ENV !== "production" && typeof console < "u") {
            var we = G + ":" + A;
            !O[we] && // Avoid spamming the console because they are often not actionable except for lib authors
            W < 3 && (a(
              "You are manually calling a React.PropTypes validation function for the `" + L + "` prop on `" + G + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
            ), O[we] = !0, W++);
          }
        }
        return k[A] == null ? z ? k[A] === null ? new y("The " + H + " `" + L + "` is marked as required " + ("in `" + G + "`, but its value is `null`.")) : new y("The " + H + " `" + L + "` is marked as required in " + ("`" + G + "`, but its value is `undefined`.")) : null : h(k, A, G, H, L);
      }
      var P = N.bind(null, !1);
      return P.isRequired = N.bind(null, !0), P;
    }
    function M(h) {
      function O(W, N, P, z, k, A) {
        var G = W[N], H = re(G);
        if (H !== h) {
          var L = he(G);
          return new y(
            "Invalid " + z + " `" + k + "` of type " + ("`" + L + "` supplied to `" + P + "`, expected ") + ("`" + h + "`."),
            { expectedType: h }
          );
        }
        return null;
      }
      return _(O);
    }
    function Y() {
      return _(l);
    }
    function X(h) {
      function O(W, N, P, z, k) {
        if (typeof h != "function")
          return new y("Property `" + k + "` of component `" + P + "` has invalid PropType notation inside arrayOf.");
        var A = W[N];
        if (!Array.isArray(A)) {
          var G = re(A);
          return new y("Invalid " + z + " `" + k + "` of type " + ("`" + G + "` supplied to `" + P + "`, expected an array."));
        }
        for (var H = 0; H < A.length; H++) {
          var L = h(A, H, P, z, k + "[" + H + "]", n);
          if (L instanceof Error)
            return L;
        }
        return null;
      }
      return _(O);
    }
    function $() {
      function h(O, W, N, P, z) {
        var k = O[W];
        if (!d(k)) {
          var A = re(k);
          return new y("Invalid " + P + " `" + z + "` of type " + ("`" + A + "` supplied to `" + N + "`, expected a single ReactElement."));
        }
        return null;
      }
      return _(h);
    }
    function E() {
      function h(O, W, N, P, z) {
        var k = O[W];
        if (!e.isValidElementType(k)) {
          var A = re(k);
          return new y("Invalid " + P + " `" + z + "` of type " + ("`" + A + "` supplied to `" + N + "`, expected a single ReactElement type."));
        }
        return null;
      }
      return _(h);
    }
    function xe(h) {
      function O(W, N, P, z, k) {
        if (!(W[N] instanceof h)) {
          var A = h.name || g, G = ze(W[N]);
          return new y("Invalid " + z + " `" + k + "` of type " + ("`" + G + "` supplied to `" + P + "`, expected ") + ("instance of `" + A + "`."));
        }
        return null;
      }
      return _(O);
    }
    function De(h) {
      if (!Array.isArray(h))
        return process.env.NODE_ENV !== "production" && (arguments.length > 1 ? a(
          "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
        ) : a("Invalid argument supplied to oneOf, expected an array.")), l;
      function O(W, N, P, z, k) {
        for (var A = W[N], G = 0; G < h.length; G++)
          if (w(A, h[G]))
            return null;
        var H = JSON.stringify(h, function(ge, C) {
          var we = he(C);
          return we === "symbol" ? String(C) : C;
        });
        return new y("Invalid " + z + " `" + k + "` of value `" + String(A) + "` " + ("supplied to `" + P + "`, expected one of " + H + "."));
      }
      return _(O);
    }
    function b(h) {
      function O(W, N, P, z, k) {
        if (typeof h != "function")
          return new y("Property `" + k + "` of component `" + P + "` has invalid PropType notation inside objectOf.");
        var A = W[N], G = re(A);
        if (G !== "object")
          return new y("Invalid " + z + " `" + k + "` of type " + ("`" + G + "` supplied to `" + P + "`, expected an object."));
        for (var H in A)
          if (o(A, H)) {
            var L = h(A, H, P, z, k + "." + H, n);
            if (L instanceof Error)
              return L;
          }
        return null;
      }
      return _(O);
    }
    function U(h) {
      if (!Array.isArray(h))
        return process.env.NODE_ENV !== "production" && a("Invalid argument supplied to oneOfType, expected an instance of array."), l;
      for (var O = 0; O < h.length; O++) {
        var W = h[O];
        if (typeof W != "function")
          return a(
            "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + ke(W) + " at index " + O + "."
          ), l;
      }
      function N(P, z, k, A, G) {
        for (var H = [], L = 0; L < h.length; L++) {
          var ge = h[L], C = ge(P, z, k, A, G, n);
          if (C == null)
            return null;
          C.data && o(C.data, "expectedType") && H.push(C.data.expectedType);
        }
        var we = H.length > 0 ? ", expected one of type [" + H.join(", ") + "]" : "";
        return new y("Invalid " + A + " `" + G + "` supplied to " + ("`" + k + "`" + we + "."));
      }
      return _(N);
    }
    function oe() {
      function h(O, W, N, P, z) {
        return I(O[W]) ? null : new y("Invalid " + P + " `" + z + "` supplied to " + ("`" + N + "`, expected a ReactNode."));
      }
      return _(h);
    }
    function Re(h, O, W, N, P) {
      return new y(
        (h || "React class") + ": " + O + " type `" + W + "." + N + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + P + "`."
      );
    }
    function Pe(h) {
      function O(W, N, P, z, k) {
        var A = W[N], G = re(A);
        if (G !== "object")
          return new y("Invalid " + z + " `" + k + "` of type `" + G + "` " + ("supplied to `" + P + "`, expected `object`."));
        for (var H in h) {
          var L = h[H];
          if (typeof L != "function")
            return Re(P, z, k, H, he(L));
          var ge = L(A, H, P, z, k + "." + H, n);
          if (ge)
            return ge;
        }
        return null;
      }
      return _(O);
    }
    function u(h) {
      function O(W, N, P, z, k) {
        var A = W[N], G = re(A);
        if (G !== "object")
          return new y("Invalid " + z + " `" + k + "` of type `" + G + "` " + ("supplied to `" + P + "`, expected `object`."));
        var H = t({}, W[N], h);
        for (var L in H) {
          var ge = h[L];
          if (o(h, L) && typeof ge != "function")
            return Re(P, z, k, L, he(ge));
          if (!ge)
            return new y(
              "Invalid " + z + " `" + k + "` key `" + L + "` supplied to `" + P + "`.\nBad object: " + JSON.stringify(W[N], null, "  ") + `
Valid keys: ` + JSON.stringify(Object.keys(h), null, "  ")
            );
          var C = ge(A, L, P, z, k + "." + L, n);
          if (C)
            return C;
        }
        return null;
      }
      return _(O);
    }
    function I(h) {
      switch (typeof h) {
        case "number":
        case "string":
        case "undefined":
          return !0;
        case "boolean":
          return !h;
        case "object":
          if (Array.isArray(h))
            return h.every(I);
          if (h === null || d(h))
            return !0;
          var O = j(h);
          if (O) {
            var W = O.call(h), N;
            if (O !== h.entries) {
              for (; !(N = W.next()).done; )
                if (!I(N.value))
                  return !1;
            } else
              for (; !(N = W.next()).done; ) {
                var P = N.value;
                if (P && !I(P[1]))
                  return !1;
              }
          } else
            return !1;
          return !0;
        default:
          return !1;
      }
    }
    function se(h, O) {
      return h === "symbol" ? !0 : O ? O["@@toStringTag"] === "Symbol" || typeof Symbol == "function" && O instanceof Symbol : !1;
    }
    function re(h) {
      var O = typeof h;
      return Array.isArray(h) ? "array" : h instanceof RegExp ? "object" : se(O, h) ? "symbol" : O;
    }
    function he(h) {
      if (typeof h > "u" || h === null)
        return "" + h;
      var O = re(h);
      if (O === "object") {
        if (h instanceof Date)
          return "date";
        if (h instanceof RegExp)
          return "regexp";
      }
      return O;
    }
    function ke(h) {
      var O = he(h);
      switch (O) {
        case "array":
        case "object":
          return "an " + O;
        case "boolean":
        case "date":
        case "regexp":
          return "a " + O;
        default:
          return O;
      }
    }
    function ze(h) {
      return !h.constructor || !h.constructor.name ? g : h.constructor.name;
    }
    return S.checkPropTypes = s, S.resetWarningCache = s.resetWarningCache, S.PropTypes = S, S;
  }, Zr;
}
var et, fn;
function Ds() {
  if (fn) return et;
  fn = 1;
  var e = dt();
  function t() {
  }
  function n() {
  }
  return n.resetWarningCache = t, et = function() {
    function o(l, d, c, f, x, j) {
      if (j !== e) {
        var g = new Error(
          "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
        );
        throw g.name = "Invariant Violation", g;
      }
    }
    o.isRequired = o;
    function s() {
      return o;
    }
    var a = {
      array: o,
      bigint: o,
      bool: o,
      func: o,
      number: o,
      object: o,
      string: o,
      symbol: o,
      any: o,
      arrayOf: s,
      element: o,
      elementType: o,
      instanceOf: s,
      node: o,
      objectOf: s,
      oneOf: s,
      oneOfType: s,
      shape: s,
      exact: s,
      checkPropTypes: n,
      resetWarningCache: t
    };
    return a.PropTypes = a, a;
  }, et;
}
if (process.env.NODE_ENV !== "production") {
  var Ps = Un(), ks = !0;
  lt.exports = _s()(Ps.isElement, ks);
} else
  lt.exports = Ds()();
var Is = lt.exports;
const R = /* @__PURE__ */ hs(Is);
function As(e) {
  return e == null || Object.keys(e).length === 0;
}
function Vn(e) {
  const {
    styles: t,
    defaultTheme: n = {}
  } = e, o = typeof t == "function" ? (s) => t(As(s) ? n : s) : t;
  return /* @__PURE__ */ r.jsx(ps, {
    styles: o
  });
}
process.env.NODE_ENV !== "production" && (Vn.propTypes = {
  defaultTheme: R.object,
  styles: R.oneOfType([R.array, R.string, R.object, R.func])
});
/**
 * @mui/styled-engine v5.18.0
 *
 * @license MIT
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const pn = [];
function $s(e) {
  return pn[0] = e, Cs(pn);
}
function er(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function zn(e) {
  if (/* @__PURE__ */ me.isValidElement(e) || !er(e))
    return e;
  const t = {};
  return Object.keys(e).forEach((n) => {
    t[n] = zn(e[n]);
  }), t;
}
function Ne(e, t, n = {
  clone: !0
}) {
  const o = n.clone ? V({}, e) : e;
  return er(e) && er(t) && Object.keys(t).forEach((s) => {
    /* @__PURE__ */ me.isValidElement(t[s]) ? o[s] = t[s] : er(t[s]) && // Avoid prototype pollution
    Object.prototype.hasOwnProperty.call(e, s) && er(e[s]) ? o[s] = Ne(e[s], t[s], n) : n.clone ? o[s] = er(t[s]) ? zn(t[s]) : t[s] : o[s] = t[s];
  }), o;
}
const Ns = ["values", "unit", "step"], Ms = (e) => {
  const t = Object.keys(e).map((n) => ({
    key: n,
    val: e[n]
  })) || [];
  return t.sort((n, o) => n.val - o.val), t.reduce((n, o) => V({}, n, {
    [o.key]: o.val
  }), {});
};
function Ws(e) {
  const {
    // The breakpoint **start** at this value.
    // For instance with the first breakpoint xs: [xs, sm).
    values: t = {
      xs: 0,
      // phone
      sm: 600,
      // tablet
      md: 900,
      // small laptop
      lg: 1200,
      // desktop
      xl: 1536
      // large screen
    },
    unit: n = "px",
    step: o = 5
  } = e, s = Le(e, Ns), a = Ms(t), l = Object.keys(a);
  function d(g) {
    return `@media (min-width:${typeof t[g] == "number" ? t[g] : g}${n})`;
  }
  function c(g) {
    return `@media (max-width:${(typeof t[g] == "number" ? t[g] : g) - o / 100}${n})`;
  }
  function f(g, S) {
    const w = l.indexOf(S);
    return `@media (min-width:${typeof t[g] == "number" ? t[g] : g}${n}) and (max-width:${(w !== -1 && typeof t[l[w]] == "number" ? t[l[w]] : S) - o / 100}${n})`;
  }
  function x(g) {
    return l.indexOf(g) + 1 < l.length ? f(g, l[l.indexOf(g) + 1]) : d(g);
  }
  function j(g) {
    const S = l.indexOf(g);
    return S === 0 ? d(l[1]) : S === l.length - 1 ? c(l[S]) : f(g, l[l.indexOf(g) + 1]).replace("@media", "@media not all and");
  }
  return V({
    keys: l,
    values: a,
    up: d,
    down: c,
    between: f,
    only: x,
    not: j,
    unit: n
  }, s);
}
const Gs = {
  borderRadius: 4
}, Ue = process.env.NODE_ENV !== "production" ? R.oneOfType([R.number, R.string, R.object, R.array]) : {};
function ur(e, t) {
  return t ? Ne(e, t, {
    clone: !1
    // No need to clone deep, it's way faster.
  }) : e;
}
const ft = {
  xs: 0,
  // phone
  sm: 600,
  // tablet
  md: 900,
  // small laptop
  lg: 1200,
  // desktop
  xl: 1536
  // large screen
}, hn = {
  // Sorted ASC by size. That's important.
  // It can't be configured as it's used statically for propTypes.
  keys: ["xs", "sm", "md", "lg", "xl"],
  up: (e) => `@media (min-width:${ft[e]}px)`
};
function Me(e, t, n) {
  const o = e.theme || {};
  if (Array.isArray(t)) {
    const a = o.breakpoints || hn;
    return t.reduce((l, d, c) => (l[a.up(a.keys[c])] = n(t[c]), l), {});
  }
  if (typeof t == "object") {
    const a = o.breakpoints || hn;
    return Object.keys(t).reduce((l, d) => {
      if (Object.keys(a.values || ft).indexOf(d) !== -1) {
        const c = a.up(d);
        l[c] = n(t[d], d);
      } else {
        const c = d;
        l[c] = t[c];
      }
      return l;
    }, {});
  }
  return n(t);
}
function Ls(e = {}) {
  var t;
  return ((t = e.keys) == null ? void 0 : t.reduce((o, s) => {
    const a = e.up(s);
    return o[a] = {}, o;
  }, {})) || {};
}
function mn(e, t) {
  return e.reduce((n, o) => {
    const s = n[o];
    return (!s || Object.keys(s).length === 0) && delete n[o], n;
  }, t);
}
function Fn(e) {
  if (typeof e != "string")
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `capitalize(string)` expects a string argument." : fr(7));
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function kr(e, t, n = !0) {
  if (!t || typeof t != "string")
    return null;
  if (e && e.vars && n) {
    const o = `vars.${t}`.split(".").reduce((s, a) => s && s[a] ? s[a] : null, e);
    if (o != null)
      return o;
  }
  return t.split(".").reduce((o, s) => o && o[s] != null ? o[s] : null, e);
}
function Sr(e, t, n, o = n) {
  let s;
  return typeof e == "function" ? s = e(n) : Array.isArray(e) ? s = e[n] || o : s = kr(e, n) || o, t && (s = t(s, o, e)), s;
}
function ce(e) {
  const {
    prop: t,
    cssProperty: n = e.prop,
    themeKey: o,
    transform: s
  } = e, a = (l) => {
    if (l[t] == null)
      return null;
    const d = l[t], c = l.theme, f = kr(c, o) || {};
    return Me(l, d, (j) => {
      let g = Sr(f, s, j);
      return j === g && typeof j == "string" && (g = Sr(f, s, `${t}${j === "default" ? "" : Fn(j)}`, j)), n === !1 ? g : {
        [n]: g
      };
    });
  };
  return a.propTypes = process.env.NODE_ENV !== "production" ? {
    [t]: Ue
  } : {}, a.filterProps = [t], a;
}
function Us(e) {
  const t = {};
  return (n) => (t[n] === void 0 && (t[n] = e(n)), t[n]);
}
const Bs = {
  m: "margin",
  p: "padding"
}, Vs = {
  t: "Top",
  r: "Right",
  b: "Bottom",
  l: "Left",
  x: ["Left", "Right"],
  y: ["Top", "Bottom"]
}, gn = {
  marginX: "mx",
  marginY: "my",
  paddingX: "px",
  paddingY: "py"
}, zs = Us((e) => {
  if (e.length > 2)
    if (gn[e])
      e = gn[e];
    else
      return [e];
  const [t, n] = e.split(""), o = Bs[t], s = Vs[n] || "";
  return Array.isArray(s) ? s.map((a) => o + a) : [o + s];
}), Ir = ["m", "mt", "mr", "mb", "ml", "mx", "my", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "marginX", "marginY", "marginInline", "marginInlineStart", "marginInlineEnd", "marginBlock", "marginBlockStart", "marginBlockEnd"], Ar = ["p", "pt", "pr", "pb", "pl", "px", "py", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "paddingX", "paddingY", "paddingInline", "paddingInlineStart", "paddingInlineEnd", "paddingBlock", "paddingBlockStart", "paddingBlockEnd"], Fs = [...Ir, ...Ar];
function hr(e, t, n, o) {
  var s;
  const a = (s = kr(e, t, !1)) != null ? s : n;
  return typeof a == "number" ? (l) => typeof l == "string" ? l : (process.env.NODE_ENV !== "production" && typeof l != "number" && console.error(`MUI: Expected ${o} argument to be a number or a string, got ${l}.`), a * l) : Array.isArray(a) ? (l) => typeof l == "string" ? l : (process.env.NODE_ENV !== "production" && (Number.isInteger(l) ? l > a.length - 1 && console.error([`MUI: The value provided (${l}) overflows.`, `The supported values are: ${JSON.stringify(a)}.`, `${l} > ${a.length - 1}, you need to add the missing values.`].join(`
`)) : console.error([`MUI: The \`theme.${t}\` array type cannot be combined with non integer values.You should either use an integer value that can be used as index, or define the \`theme.${t}\` as a number.`].join(`
`))), a[l]) : typeof a == "function" ? a : (process.env.NODE_ENV !== "production" && console.error([`MUI: The \`theme.${t}\` value (${a}) is invalid.`, "It should be a number, an array or a function."].join(`
`)), () => {
  });
}
function Hn(e) {
  return hr(e, "spacing", 8, "spacing");
}
function mr(e, t) {
  if (typeof t == "string" || t == null)
    return t;
  const n = Math.abs(t), o = e(n);
  return t >= 0 ? o : typeof o == "number" ? -o : `-${o}`;
}
function Hs(e, t) {
  return (n) => e.reduce((o, s) => (o[s] = mr(t, n), o), {});
}
function Ys(e, t, n, o) {
  if (t.indexOf(n) === -1)
    return null;
  const s = zs(n), a = Hs(s, o), l = e[n];
  return Me(e, l, a);
}
function Yn(e, t) {
  const n = Hn(e.theme);
  return Object.keys(e).map((o) => Ys(e, t, o, n)).reduce(ur, {});
}
function te(e) {
  return Yn(e, Ir);
}
te.propTypes = process.env.NODE_ENV !== "production" ? Ir.reduce((e, t) => (e[t] = Ue, e), {}) : {};
te.filterProps = Ir;
function ne(e) {
  return Yn(e, Ar);
}
ne.propTypes = process.env.NODE_ENV !== "production" ? Ar.reduce((e, t) => (e[t] = Ue, e), {}) : {};
ne.filterProps = Ar;
process.env.NODE_ENV !== "production" && Fs.reduce((e, t) => (e[t] = Ue, e), {});
function qs(e = 8) {
  if (e.mui)
    return e;
  const t = Hn({
    spacing: e
  }), n = (...o) => (process.env.NODE_ENV !== "production" && (o.length <= 4 || console.error(`MUI: Too many arguments provided, expected between 0 and 4, got ${o.length}`)), (o.length === 0 ? [1] : o).map((a) => {
    const l = t(a);
    return typeof l == "number" ? `${l}px` : l;
  }).join(" "));
  return n.mui = !0, n;
}
function $r(...e) {
  const t = e.reduce((o, s) => (s.filterProps.forEach((a) => {
    o[a] = s;
  }), o), {}), n = (o) => Object.keys(o).reduce((s, a) => t[a] ? ur(s, t[a](o)) : s, {});
  return n.propTypes = process.env.NODE_ENV !== "production" ? e.reduce((o, s) => Object.assign(o, s.propTypes), {}) : {}, n.filterProps = e.reduce((o, s) => o.concat(s.filterProps), []), n;
}
function Te(e) {
  return typeof e != "number" ? e : `${e}px solid`;
}
function Se(e, t) {
  return ce({
    prop: e,
    themeKey: "borders",
    transform: t
  });
}
const Ks = Se("border", Te), Js = Se("borderTop", Te), Xs = Se("borderRight", Te), Qs = Se("borderBottom", Te), Zs = Se("borderLeft", Te), ei = Se("borderColor"), ri = Se("borderTopColor"), ti = Se("borderRightColor"), ni = Se("borderBottomColor"), oi = Se("borderLeftColor"), si = Se("outline", Te), ii = Se("outlineColor"), Nr = (e) => {
  if (e.borderRadius !== void 0 && e.borderRadius !== null) {
    const t = hr(e.theme, "shape.borderRadius", 4, "borderRadius"), n = (o) => ({
      borderRadius: mr(t, o)
    });
    return Me(e, e.borderRadius, n);
  }
  return null;
};
Nr.propTypes = process.env.NODE_ENV !== "production" ? {
  borderRadius: Ue
} : {};
Nr.filterProps = ["borderRadius"];
$r(Ks, Js, Xs, Qs, Zs, ei, ri, ti, ni, oi, Nr, si, ii);
const Mr = (e) => {
  if (e.gap !== void 0 && e.gap !== null) {
    const t = hr(e.theme, "spacing", 8, "gap"), n = (o) => ({
      gap: mr(t, o)
    });
    return Me(e, e.gap, n);
  }
  return null;
};
Mr.propTypes = process.env.NODE_ENV !== "production" ? {
  gap: Ue
} : {};
Mr.filterProps = ["gap"];
const Wr = (e) => {
  if (e.columnGap !== void 0 && e.columnGap !== null) {
    const t = hr(e.theme, "spacing", 8, "columnGap"), n = (o) => ({
      columnGap: mr(t, o)
    });
    return Me(e, e.columnGap, n);
  }
  return null;
};
Wr.propTypes = process.env.NODE_ENV !== "production" ? {
  columnGap: Ue
} : {};
Wr.filterProps = ["columnGap"];
const Gr = (e) => {
  if (e.rowGap !== void 0 && e.rowGap !== null) {
    const t = hr(e.theme, "spacing", 8, "rowGap"), n = (o) => ({
      rowGap: mr(t, o)
    });
    return Me(e, e.rowGap, n);
  }
  return null;
};
Gr.propTypes = process.env.NODE_ENV !== "production" ? {
  rowGap: Ue
} : {};
Gr.filterProps = ["rowGap"];
const ai = ce({
  prop: "gridColumn"
}), li = ce({
  prop: "gridRow"
}), ci = ce({
  prop: "gridAutoFlow"
}), ui = ce({
  prop: "gridAutoColumns"
}), di = ce({
  prop: "gridAutoRows"
}), fi = ce({
  prop: "gridTemplateColumns"
}), pi = ce({
  prop: "gridTemplateRows"
}), hi = ce({
  prop: "gridTemplateAreas"
}), mi = ce({
  prop: "gridArea"
});
$r(Mr, Wr, Gr, ai, li, ci, ui, di, fi, pi, hi, mi);
function rr(e, t) {
  return t === "grey" ? t : e;
}
const gi = ce({
  prop: "color",
  themeKey: "palette",
  transform: rr
}), xi = ce({
  prop: "bgcolor",
  cssProperty: "backgroundColor",
  themeKey: "palette",
  transform: rr
}), yi = ce({
  prop: "backgroundColor",
  themeKey: "palette",
  transform: rr
});
$r(gi, xi, yi);
function Ee(e) {
  return e <= 1 && e !== 0 ? `${e * 100}%` : e;
}
const bi = ce({
  prop: "width",
  transform: Ee
}), pt = (e) => {
  if (e.maxWidth !== void 0 && e.maxWidth !== null) {
    const t = (n) => {
      var o, s;
      const a = ((o = e.theme) == null || (o = o.breakpoints) == null || (o = o.values) == null ? void 0 : o[n]) || ft[n];
      return a ? ((s = e.theme) == null || (s = s.breakpoints) == null ? void 0 : s.unit) !== "px" ? {
        maxWidth: `${a}${e.theme.breakpoints.unit}`
      } : {
        maxWidth: a
      } : {
        maxWidth: Ee(n)
      };
    };
    return Me(e, e.maxWidth, t);
  }
  return null;
};
pt.filterProps = ["maxWidth"];
const vi = ce({
  prop: "minWidth",
  transform: Ee
}), ji = ce({
  prop: "height",
  transform: Ee
}), Ei = ce({
  prop: "maxHeight",
  transform: Ee
}), wi = ce({
  prop: "minHeight",
  transform: Ee
});
ce({
  prop: "size",
  cssProperty: "width",
  transform: Ee
});
ce({
  prop: "size",
  cssProperty: "height",
  transform: Ee
});
const Ci = ce({
  prop: "boxSizing"
});
$r(bi, pt, vi, ji, Ei, wi, Ci);
const ht = {
  // borders
  border: {
    themeKey: "borders",
    transform: Te
  },
  borderTop: {
    themeKey: "borders",
    transform: Te
  },
  borderRight: {
    themeKey: "borders",
    transform: Te
  },
  borderBottom: {
    themeKey: "borders",
    transform: Te
  },
  borderLeft: {
    themeKey: "borders",
    transform: Te
  },
  borderColor: {
    themeKey: "palette"
  },
  borderTopColor: {
    themeKey: "palette"
  },
  borderRightColor: {
    themeKey: "palette"
  },
  borderBottomColor: {
    themeKey: "palette"
  },
  borderLeftColor: {
    themeKey: "palette"
  },
  outline: {
    themeKey: "borders",
    transform: Te
  },
  outlineColor: {
    themeKey: "palette"
  },
  borderRadius: {
    themeKey: "shape.borderRadius",
    style: Nr
  },
  // palette
  color: {
    themeKey: "palette",
    transform: rr
  },
  bgcolor: {
    themeKey: "palette",
    cssProperty: "backgroundColor",
    transform: rr
  },
  backgroundColor: {
    themeKey: "palette",
    transform: rr
  },
  // spacing
  p: {
    style: ne
  },
  pt: {
    style: ne
  },
  pr: {
    style: ne
  },
  pb: {
    style: ne
  },
  pl: {
    style: ne
  },
  px: {
    style: ne
  },
  py: {
    style: ne
  },
  padding: {
    style: ne
  },
  paddingTop: {
    style: ne
  },
  paddingRight: {
    style: ne
  },
  paddingBottom: {
    style: ne
  },
  paddingLeft: {
    style: ne
  },
  paddingX: {
    style: ne
  },
  paddingY: {
    style: ne
  },
  paddingInline: {
    style: ne
  },
  paddingInlineStart: {
    style: ne
  },
  paddingInlineEnd: {
    style: ne
  },
  paddingBlock: {
    style: ne
  },
  paddingBlockStart: {
    style: ne
  },
  paddingBlockEnd: {
    style: ne
  },
  m: {
    style: te
  },
  mt: {
    style: te
  },
  mr: {
    style: te
  },
  mb: {
    style: te
  },
  ml: {
    style: te
  },
  mx: {
    style: te
  },
  my: {
    style: te
  },
  margin: {
    style: te
  },
  marginTop: {
    style: te
  },
  marginRight: {
    style: te
  },
  marginBottom: {
    style: te
  },
  marginLeft: {
    style: te
  },
  marginX: {
    style: te
  },
  marginY: {
    style: te
  },
  marginInline: {
    style: te
  },
  marginInlineStart: {
    style: te
  },
  marginInlineEnd: {
    style: te
  },
  marginBlock: {
    style: te
  },
  marginBlockStart: {
    style: te
  },
  marginBlockEnd: {
    style: te
  },
  // display
  displayPrint: {
    cssProperty: !1,
    transform: (e) => ({
      "@media print": {
        display: e
      }
    })
  },
  display: {},
  overflow: {},
  textOverflow: {},
  visibility: {},
  whiteSpace: {},
  // flexbox
  flexBasis: {},
  flexDirection: {},
  flexWrap: {},
  justifyContent: {},
  alignItems: {},
  alignContent: {},
  order: {},
  flex: {},
  flexGrow: {},
  flexShrink: {},
  alignSelf: {},
  justifyItems: {},
  justifySelf: {},
  // grid
  gap: {
    style: Mr
  },
  rowGap: {
    style: Gr
  },
  columnGap: {
    style: Wr
  },
  gridColumn: {},
  gridRow: {},
  gridAutoFlow: {},
  gridAutoColumns: {},
  gridAutoRows: {},
  gridTemplateColumns: {},
  gridTemplateRows: {},
  gridTemplateAreas: {},
  gridArea: {},
  // positions
  position: {},
  zIndex: {
    themeKey: "zIndex"
  },
  top: {},
  right: {},
  bottom: {},
  left: {},
  // shadows
  boxShadow: {
    themeKey: "shadows"
  },
  // sizing
  width: {
    transform: Ee
  },
  maxWidth: {
    style: pt
  },
  minWidth: {
    transform: Ee
  },
  height: {
    transform: Ee
  },
  maxHeight: {
    transform: Ee
  },
  minHeight: {
    transform: Ee
  },
  boxSizing: {},
  // typography
  fontFamily: {
    themeKey: "typography"
  },
  fontSize: {
    themeKey: "typography"
  },
  fontStyle: {
    themeKey: "typography"
  },
  fontWeight: {
    themeKey: "typography"
  },
  letterSpacing: {},
  textTransform: {},
  lineHeight: {},
  textAlign: {},
  typography: {
    cssProperty: !1,
    themeKey: "typography"
  }
};
function Ti(...e) {
  const t = e.reduce((o, s) => o.concat(Object.keys(s)), []), n = new Set(t);
  return e.every((o) => n.size === Object.keys(o).length);
}
function Oi(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Si() {
  function e(n, o, s, a) {
    const l = {
      [n]: o,
      theme: s
    }, d = a[n];
    if (!d)
      return {
        [n]: o
      };
    const {
      cssProperty: c = n,
      themeKey: f,
      transform: x,
      style: j
    } = d;
    if (o == null)
      return null;
    if (f === "typography" && o === "inherit")
      return {
        [n]: o
      };
    const g = kr(s, f) || {};
    return j ? j(l) : Me(l, o, (w) => {
      let y = Sr(g, x, w);
      return w === y && typeof w == "string" && (y = Sr(g, x, `${n}${w === "default" ? "" : Fn(w)}`, w)), c === !1 ? y : {
        [c]: y
      };
    });
  }
  function t(n) {
    var o;
    const {
      sx: s,
      theme: a = {},
      nested: l
    } = n || {};
    if (!s)
      return null;
    const d = (o = a.unstable_sxConfig) != null ? o : ht;
    function c(f) {
      let x = f;
      if (typeof f == "function")
        x = f(a);
      else if (typeof f != "object")
        return f;
      if (!x)
        return null;
      const j = Ls(a.breakpoints), g = Object.keys(j);
      let S = j;
      return Object.keys(x).forEach((w) => {
        const y = Oi(x[w], a);
        if (y != null)
          if (typeof y == "object")
            if (d[w])
              S = ur(S, e(w, y, a, d));
            else {
              const _ = Me({
                theme: a
              }, y, (M) => ({
                [w]: M
              }));
              Ti(_, y) ? S[w] = t({
                sx: y,
                theme: a,
                nested: !0
              }) : S = ur(S, _);
            }
          else
            S = ur(S, e(w, y, a, d));
      }), !l && a.modularCssLayers ? {
        "@layer sx": mn(g, S)
      } : mn(g, S);
    }
    return Array.isArray(s) ? s.map(c) : c(s);
  }
  return t;
}
const mt = Si();
mt.filterProps = ["sx"];
function Ri(e, t) {
  const n = this;
  return n.vars && typeof n.getColorSchemeSelector == "function" ? {
    [n.getColorSchemeSelector(e).replace(/(\[[^\]]+\])/, "*:where($1)")]: t
  } : n.palette.mode === e ? t : {};
}
const _i = ["breakpoints", "palette", "spacing", "shape"];
function qn(e = {}, ...t) {
  const {
    breakpoints: n = {},
    palette: o = {},
    spacing: s,
    shape: a = {}
  } = e, l = Le(e, _i), d = Ws(n), c = qs(s);
  let f = Ne({
    breakpoints: d,
    direction: "ltr",
    components: {},
    // Inject component definitions.
    palette: V({
      mode: "light"
    }, o),
    spacing: c,
    shape: V({}, Gs, a)
  }, l);
  return f.applyStyles = Ri, f = t.reduce((x, j) => Ne(x, j), f), f.unstable_sxConfig = V({}, ht, l == null ? void 0 : l.unstable_sxConfig), f.unstable_sx = function(j) {
    return mt({
      sx: j,
      theme: this
    });
  }, f;
}
function Di(e) {
  return Object.keys(e).length === 0;
}
function gt(e = null) {
  const t = me.useContext(Wn);
  return !t || Di(t) ? e : t;
}
const Pi = qn();
function ki(e = Pi) {
  return gt(e);
}
function rt(e) {
  const t = $s(e);
  return e !== t && t.styles ? (t.styles.match(/^@layer\s+[^{]*$/) || (t.styles = `@layer global{${t.styles}}`), t) : e;
}
function xt({
  styles: e,
  themeId: t,
  defaultTheme: n = {}
}) {
  const o = ki(n), s = t && o[t] || o;
  let a = typeof e == "function" ? e(s) : e;
  return s.modularCssLayers && (Array.isArray(a) ? a = a.map((l) => rt(typeof l == "function" ? l(s) : l)) : a = rt(a)), /* @__PURE__ */ r.jsx(Vn, {
    styles: a
  });
}
process.env.NODE_ENV !== "production" && (xt.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  defaultTheme: R.object,
  /**
   * @ignore
   */
  styles: R.oneOfType([R.array, R.func, R.number, R.object, R.string, R.bool]),
  /**
   * @ignore
   */
  themeId: R.string
});
const xn = (e) => e, Ii = () => {
  let e = xn;
  return {
    configure(t) {
      e = t;
    },
    generate(t) {
      return e(t);
    },
    reset() {
      e = xn;
    }
  };
}, Ai = Ii(), $i = {
  active: "active",
  checked: "checked",
  completed: "completed",
  disabled: "disabled",
  error: "error",
  expanded: "expanded",
  focused: "focused",
  focusVisible: "focusVisible",
  open: "open",
  readOnly: "readOnly",
  required: "required",
  selected: "selected"
};
function Ni(e, t, n = "Mui") {
  const o = $i[t];
  return o ? `${n}-${o}` : `${Ai.generate(e)}-${t}`;
}
function ct(e, t) {
  const n = V({}, t);
  return Object.keys(e).forEach((o) => {
    if (o.toString().match(/^(components|slots)$/))
      n[o] = V({}, e[o], n[o]);
    else if (o.toString().match(/^(componentsProps|slotProps)$/)) {
      const s = e[o] || {}, a = t[o];
      n[o] = {}, !a || !Object.keys(a) ? n[o] = s : !s || !Object.keys(s) ? n[o] = a : (n[o] = V({}, a), Object.keys(s).forEach((l) => {
        n[o][l] = ct(s[l], a[l]);
      }));
    } else n[o] === void 0 && (n[o] = e[o]);
  }), n;
}
const Mi = typeof window < "u" ? me.useLayoutEffect : me.useEffect;
function Wi(e, t = Number.MIN_SAFE_INTEGER, n = Number.MAX_SAFE_INTEGER) {
  return Math.max(t, Math.min(e, n));
}
const Gi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Wi
}, Symbol.toStringTag, { value: "Module" })), Li = "exact-prop: ​";
function Kn(e) {
  return process.env.NODE_ENV === "production" ? e : V({}, e, {
    [Li]: (t) => {
      const n = Object.keys(t).filter((o) => !e.hasOwnProperty(o));
      return n.length > 0 ? new Error(`The following props are not supported: ${n.map((o) => `\`${o}\``).join(", ")}. Please remove them.`) : null;
    }
  });
}
let yn = 0;
function Ui(e) {
  const [t, n] = me.useState(e), o = e || t;
  return me.useEffect(() => {
    t == null && (yn += 1, n(`mui-${yn}`));
  }, [t]), o;
}
const bn = me.useId;
function Bi(e) {
  return bn !== void 0 ? bn() : Ui(e);
}
const yt = /* @__PURE__ */ me.createContext(null);
process.env.NODE_ENV !== "production" && (yt.displayName = "ThemeContext");
function Jn() {
  const e = me.useContext(yt);
  return process.env.NODE_ENV !== "production" && me.useDebugValue(e), e;
}
const Vi = typeof Symbol == "function" && Symbol.for, zi = Vi ? Symbol.for("mui.nested") : "__THEME_NESTED__";
function Fi(e, t) {
  if (typeof t == "function") {
    const n = t(e);
    return process.env.NODE_ENV !== "production" && (n || console.error(["MUI: You should return an object from your theme function, i.e.", "<ThemeProvider theme={() => ({})} />"].join(`
`))), n;
  }
  return V({}, e, t);
}
function Rr(e) {
  const {
    children: t,
    theme: n
  } = e, o = Jn();
  process.env.NODE_ENV !== "production" && o === null && typeof n == "function" && console.error(["MUI: You are providing a theme function prop to the ThemeProvider component:", "<ThemeProvider theme={outerTheme => outerTheme} />", "", "However, no outer theme is present.", "Make sure a theme is already injected higher in the React tree or provide a theme object."].join(`
`));
  const s = me.useMemo(() => {
    const a = o === null ? n : Fi(o, n);
    return a != null && (a[zi] = o !== null), a;
  }, [n, o]);
  return /* @__PURE__ */ r.jsx(yt.Provider, {
    value: s,
    children: t
  });
}
process.env.NODE_ENV !== "production" && (Rr.propTypes = {
  /**
   * Your component tree.
   */
  children: R.node,
  /**
   * A theme object. You can provide a function to extend the outer theme.
   */
  theme: R.oneOfType([R.object, R.func]).isRequired
});
process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "production" && (Rr.propTypes = Kn(Rr.propTypes));
const Hi = ["value"], Yi = /* @__PURE__ */ me.createContext();
function Xn(e) {
  let {
    value: t
  } = e, n = Le(e, Hi);
  return /* @__PURE__ */ r.jsx(Yi.Provider, V({
    value: t ?? !0
  }, n));
}
process.env.NODE_ENV !== "production" && (Xn.propTypes = {
  children: R.node,
  value: R.bool
});
const Qn = /* @__PURE__ */ me.createContext(void 0);
function Zn({
  value: e,
  children: t
}) {
  return /* @__PURE__ */ r.jsx(Qn.Provider, {
    value: e,
    children: t
  });
}
process.env.NODE_ENV !== "production" && (Zn.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  children: R.node,
  /**
   * @ignore
   */
  value: R.object
});
function qi(e) {
  const {
    theme: t,
    name: n,
    props: o
  } = e;
  if (!t || !t.components || !t.components[n])
    return o;
  const s = t.components[n];
  return s.defaultProps ? ct(s.defaultProps, o) : !s.styleOverrides && !s.variants ? ct(s, o) : o;
}
function Ki({
  props: e,
  name: t
}) {
  const n = me.useContext(Qn);
  return qi({
    props: e,
    name: t,
    theme: {
      components: n
    }
  });
}
function Ji(e) {
  const t = gt(), n = Bi() || "", {
    modularCssLayers: o
  } = e;
  let s = "mui.global, mui.components, mui.theme, mui.custom, mui.sx";
  return !o || t !== null ? s = "" : typeof o == "string" ? s = o.replace(/mui(?!\.)/g, s) : s = `@layer ${s};`, Mi(() => {
    const a = document.querySelector("head");
    if (!a)
      return;
    const l = a.firstChild;
    if (s) {
      var d;
      if (l && (d = l.hasAttribute) != null && d.call(l, "data-mui-layer-order") && l.getAttribute("data-mui-layer-order") === n)
        return;
      const f = document.createElement("style");
      f.setAttribute("data-mui-layer-order", n), f.textContent = s, a.prepend(f);
    } else {
      var c;
      (c = a.querySelector(`style[data-mui-layer-order="${n}"]`)) == null || c.remove();
    }
  }, [s, n]), s ? /* @__PURE__ */ r.jsx(xt, {
    styles: s
  }) : null;
}
const vn = {};
function jn(e, t, n, o = !1) {
  return me.useMemo(() => {
    const s = e && t[e] || t;
    if (typeof n == "function") {
      const a = n(s), l = e ? V({}, t, {
        [e]: a
      }) : a;
      return o ? () => l : l;
    }
    return e ? V({}, t, {
      [e]: n
    }) : V({}, t, n);
  }, [e, t, n, o]);
}
function _r(e) {
  const {
    children: t,
    theme: n,
    themeId: o
  } = e, s = gt(vn), a = Jn() || vn;
  process.env.NODE_ENV !== "production" && (s === null && typeof n == "function" || o && s && !s[o] && typeof n == "function") && console.error(["MUI: You are providing a theme function prop to the ThemeProvider component:", "<ThemeProvider theme={outerTheme => outerTheme} />", "", "However, no outer theme is present.", "Make sure a theme is already injected higher in the React tree or provide a theme object."].join(`
`));
  const l = jn(o, s, n), d = jn(o, a, n, !0), c = l.direction === "rtl", f = Ji(l);
  return /* @__PURE__ */ r.jsx(Rr, {
    theme: d,
    children: /* @__PURE__ */ r.jsx(Wn.Provider, {
      value: l,
      children: /* @__PURE__ */ r.jsx(Xn, {
        value: c,
        children: /* @__PURE__ */ r.jsxs(Zn, {
          value: l == null ? void 0 : l.components,
          children: [f, t]
        })
      })
    })
  });
}
process.env.NODE_ENV !== "production" && (_r.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Your component tree.
   */
  children: R.node,
  /**
   * A theme object. You can provide a function to extend the outer theme.
   */
  theme: R.oneOfType([R.func, R.object]).isRequired,
  /**
   * The design system's unique id for getting the corresponded theme when there are multiple design systems.
   */
  themeId: R.string
});
process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "production" && (_r.propTypes = Kn(_r.propTypes));
function Xi(e, t) {
  return V({
    toolbar: {
      minHeight: 56,
      [e.up("xs")]: {
        "@media (orientation: landscape)": {
          minHeight: 48
        }
      },
      [e.up("sm")]: {
        minHeight: 64
      }
    }
  }, t);
}
var ue = {}, eo = { exports: {} };
(function(e) {
  function t(n) {
    return n && n.__esModule ? n : {
      default: n
    };
  }
  e.exports = t, e.exports.__esModule = !0, e.exports.default = e.exports;
})(eo);
var Qi = eo.exports;
const Zi = /* @__PURE__ */ Gn(xs), ea = /* @__PURE__ */ Gn(Gi);
var ro = Qi;
Object.defineProperty(ue, "__esModule", {
  value: !0
});
ue.alpha = so;
ue.blend = fa;
ue.colorChannel = void 0;
var ra = ue.darken = vt;
ue.decomposeColor = Oe;
ue.emphasize = io;
var En = ue.getContrastRatio = aa;
ue.getLuminance = Dr;
ue.hexToRgb = to;
ue.hslToRgb = oo;
var ta = ue.lighten = jt;
ue.private_safeAlpha = la;
ue.private_safeColorChannel = void 0;
ue.private_safeDarken = ca;
ue.private_safeEmphasize = da;
ue.private_safeLighten = ua;
ue.recomposeColor = tr;
ue.rgbToHex = ia;
var wn = ro(Zi), na = ro(ea);
function bt(e, t = 0, n = 1) {
  return process.env.NODE_ENV !== "production" && (e < t || e > n) && console.error(`MUI: The value provided ${e} is out of range [${t}, ${n}].`), (0, na.default)(e, t, n);
}
function to(e) {
  e = e.slice(1);
  const t = new RegExp(`.{1,${e.length >= 6 ? 2 : 1}}`, "g");
  let n = e.match(t);
  return n && n[0].length === 1 && (n = n.map((o) => o + o)), n ? `rgb${n.length === 4 ? "a" : ""}(${n.map((o, s) => s < 3 ? parseInt(o, 16) : Math.round(parseInt(o, 16) / 255 * 1e3) / 1e3).join(", ")})` : "";
}
function oa(e) {
  const t = e.toString(16);
  return t.length === 1 ? `0${t}` : t;
}
function Oe(e) {
  if (e.type)
    return e;
  if (e.charAt(0) === "#")
    return Oe(to(e));
  const t = e.indexOf("("), n = e.substring(0, t);
  if (["rgb", "rgba", "hsl", "hsla", "color"].indexOf(n) === -1)
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: Unsupported \`${e}\` color.
The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().` : (0, wn.default)(9, e));
  let o = e.substring(t + 1, e.length - 1), s;
  if (n === "color") {
    if (o = o.split(" "), s = o.shift(), o.length === 4 && o[3].charAt(0) === "/" && (o[3] = o[3].slice(1)), ["srgb", "display-p3", "a98-rgb", "prophoto-rgb", "rec-2020"].indexOf(s) === -1)
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: unsupported \`${s}\` color space.
The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020.` : (0, wn.default)(10, s));
  } else
    o = o.split(",");
  return o = o.map((a) => parseFloat(a)), {
    type: n,
    values: o,
    colorSpace: s
  };
}
const no = (e) => {
  const t = Oe(e);
  return t.values.slice(0, 3).map((n, o) => t.type.indexOf("hsl") !== -1 && o !== 0 ? `${n}%` : n).join(" ");
};
ue.colorChannel = no;
const sa = (e, t) => {
  try {
    return no(e);
  } catch {
    return t && process.env.NODE_ENV !== "production" && console.warn(t), e;
  }
};
ue.private_safeColorChannel = sa;
function tr(e) {
  const {
    type: t,
    colorSpace: n
  } = e;
  let {
    values: o
  } = e;
  return t.indexOf("rgb") !== -1 ? o = o.map((s, a) => a < 3 ? parseInt(s, 10) : s) : t.indexOf("hsl") !== -1 && (o[1] = `${o[1]}%`, o[2] = `${o[2]}%`), t.indexOf("color") !== -1 ? o = `${n} ${o.join(" ")}` : o = `${o.join(", ")}`, `${t}(${o})`;
}
function ia(e) {
  if (e.indexOf("#") === 0)
    return e;
  const {
    values: t
  } = Oe(e);
  return `#${t.map((n, o) => oa(o === 3 ? Math.round(255 * n) : n)).join("")}`;
}
function oo(e) {
  e = Oe(e);
  const {
    values: t
  } = e, n = t[0], o = t[1] / 100, s = t[2] / 100, a = o * Math.min(s, 1 - s), l = (f, x = (f + n / 30) % 12) => s - a * Math.max(Math.min(x - 3, 9 - x, 1), -1);
  let d = "rgb";
  const c = [Math.round(l(0) * 255), Math.round(l(8) * 255), Math.round(l(4) * 255)];
  return e.type === "hsla" && (d += "a", c.push(t[3])), tr({
    type: d,
    values: c
  });
}
function Dr(e) {
  e = Oe(e);
  let t = e.type === "hsl" || e.type === "hsla" ? Oe(oo(e)).values : e.values;
  return t = t.map((n) => (e.type !== "color" && (n /= 255), n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4)), Number((0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2]).toFixed(3));
}
function aa(e, t) {
  const n = Dr(e), o = Dr(t);
  return (Math.max(n, o) + 0.05) / (Math.min(n, o) + 0.05);
}
function so(e, t) {
  return e = Oe(e), t = bt(t), (e.type === "rgb" || e.type === "hsl") && (e.type += "a"), e.type === "color" ? e.values[3] = `/${t}` : e.values[3] = t, tr(e);
}
function la(e, t, n) {
  try {
    return so(e, t);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function vt(e, t) {
  if (e = Oe(e), t = bt(t), e.type.indexOf("hsl") !== -1)
    e.values[2] *= 1 - t;
  else if (e.type.indexOf("rgb") !== -1 || e.type.indexOf("color") !== -1)
    for (let n = 0; n < 3; n += 1)
      e.values[n] *= 1 - t;
  return tr(e);
}
function ca(e, t, n) {
  try {
    return vt(e, t);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function jt(e, t) {
  if (e = Oe(e), t = bt(t), e.type.indexOf("hsl") !== -1)
    e.values[2] += (100 - e.values[2]) * t;
  else if (e.type.indexOf("rgb") !== -1)
    for (let n = 0; n < 3; n += 1)
      e.values[n] += (255 - e.values[n]) * t;
  else if (e.type.indexOf("color") !== -1)
    for (let n = 0; n < 3; n += 1)
      e.values[n] += (1 - e.values[n]) * t;
  return tr(e);
}
function ua(e, t, n) {
  try {
    return jt(e, t);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function io(e, t = 0.15) {
  return Dr(e) > 0.5 ? vt(e, t) : jt(e, t);
}
function da(e, t, n) {
  try {
    return io(e, t);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function fa(e, t, n, o = 1) {
  const s = (c, f) => Math.round((c ** (1 / o) * (1 - n) + f ** (1 / o) * n) ** o), a = Oe(e), l = Oe(t), d = [s(a.values[0], l.values[0]), s(a.values[1], l.values[1]), s(a.values[2], l.values[2])];
  return tr({
    type: "rgb",
    values: d
  });
}
const pr = {
  black: "#000",
  white: "#fff"
}, pa = {
  50: "#fafafa",
  100: "#f5f5f5",
  200: "#eeeeee",
  300: "#e0e0e0",
  400: "#bdbdbd",
  500: "#9e9e9e",
  600: "#757575",
  700: "#616161",
  800: "#424242",
  900: "#212121",
  A100: "#f5f5f5",
  A200: "#eeeeee",
  A400: "#bdbdbd",
  A700: "#616161"
}, Ke = {
  50: "#f3e5f5",
  200: "#ce93d8",
  300: "#ba68c8",
  400: "#ab47bc",
  500: "#9c27b0",
  700: "#7b1fa2"
}, Je = {
  300: "#e57373",
  400: "#ef5350",
  500: "#f44336",
  700: "#d32f2f",
  800: "#c62828"
}, lr = {
  300: "#ffb74d",
  400: "#ffa726",
  500: "#ff9800",
  700: "#f57c00",
  900: "#e65100"
}, Xe = {
  50: "#e3f2fd",
  200: "#90caf9",
  400: "#42a5f5",
  700: "#1976d2",
  800: "#1565c0"
}, Qe = {
  300: "#4fc3f7",
  400: "#29b6f6",
  500: "#03a9f4",
  700: "#0288d1",
  900: "#01579b"
}, Ze = {
  300: "#81c784",
  400: "#66bb6a",
  500: "#4caf50",
  700: "#388e3c",
  800: "#2e7d32",
  900: "#1b5e20"
}, ha = ["mode", "contrastThreshold", "tonalOffset"], Cn = {
  // The colors used to style the text.
  text: {
    // The most important text.
    primary: "rgba(0, 0, 0, 0.87)",
    // Secondary text.
    secondary: "rgba(0, 0, 0, 0.6)",
    // Disabled text have even lower visual prominence.
    disabled: "rgba(0, 0, 0, 0.38)"
  },
  // The color used to divide different elements.
  divider: "rgba(0, 0, 0, 0.12)",
  // The background colors used to style the surfaces.
  // Consistency between these values is important.
  background: {
    paper: pr.white,
    default: pr.white
  },
  // The colors used to style the action elements.
  action: {
    // The color of an active action like an icon button.
    active: "rgba(0, 0, 0, 0.54)",
    // The color of an hovered action.
    hover: "rgba(0, 0, 0, 0.04)",
    hoverOpacity: 0.04,
    // The color of a selected action.
    selected: "rgba(0, 0, 0, 0.08)",
    selectedOpacity: 0.08,
    // The color of a disabled action.
    disabled: "rgba(0, 0, 0, 0.26)",
    // The background color of a disabled action.
    disabledBackground: "rgba(0, 0, 0, 0.12)",
    disabledOpacity: 0.38,
    focus: "rgba(0, 0, 0, 0.12)",
    focusOpacity: 0.12,
    activatedOpacity: 0.12
  }
}, tt = {
  text: {
    primary: pr.white,
    secondary: "rgba(255, 255, 255, 0.7)",
    disabled: "rgba(255, 255, 255, 0.5)",
    icon: "rgba(255, 255, 255, 0.5)"
  },
  divider: "rgba(255, 255, 255, 0.12)",
  background: {
    paper: "#121212",
    default: "#121212"
  },
  action: {
    active: pr.white,
    hover: "rgba(255, 255, 255, 0.08)",
    hoverOpacity: 0.08,
    selected: "rgba(255, 255, 255, 0.16)",
    selectedOpacity: 0.16,
    disabled: "rgba(255, 255, 255, 0.3)",
    disabledBackground: "rgba(255, 255, 255, 0.12)",
    disabledOpacity: 0.38,
    focus: "rgba(255, 255, 255, 0.12)",
    focusOpacity: 0.12,
    activatedOpacity: 0.24
  }
};
function Tn(e, t, n, o) {
  const s = o.light || o, a = o.dark || o * 1.5;
  e[t] || (e.hasOwnProperty(n) ? e[t] = e[n] : t === "light" ? e.light = ta(e.main, s) : t === "dark" && (e.dark = ra(e.main, a)));
}
function ma(e = "light") {
  return e === "dark" ? {
    main: Xe[200],
    light: Xe[50],
    dark: Xe[400]
  } : {
    main: Xe[700],
    light: Xe[400],
    dark: Xe[800]
  };
}
function ga(e = "light") {
  return e === "dark" ? {
    main: Ke[200],
    light: Ke[50],
    dark: Ke[400]
  } : {
    main: Ke[500],
    light: Ke[300],
    dark: Ke[700]
  };
}
function xa(e = "light") {
  return e === "dark" ? {
    main: Je[500],
    light: Je[300],
    dark: Je[700]
  } : {
    main: Je[700],
    light: Je[400],
    dark: Je[800]
  };
}
function ya(e = "light") {
  return e === "dark" ? {
    main: Qe[400],
    light: Qe[300],
    dark: Qe[700]
  } : {
    main: Qe[700],
    light: Qe[500],
    dark: Qe[900]
  };
}
function ba(e = "light") {
  return e === "dark" ? {
    main: Ze[400],
    light: Ze[300],
    dark: Ze[700]
  } : {
    main: Ze[800],
    light: Ze[500],
    dark: Ze[900]
  };
}
function va(e = "light") {
  return e === "dark" ? {
    main: lr[400],
    light: lr[300],
    dark: lr[700]
  } : {
    main: "#ed6c02",
    // closest to orange[800] that pass 3:1.
    light: lr[500],
    dark: lr[900]
  };
}
function ja(e) {
  const {
    mode: t = "light",
    contrastThreshold: n = 3,
    tonalOffset: o = 0.2
  } = e, s = Le(e, ha), a = e.primary || ma(t), l = e.secondary || ga(t), d = e.error || xa(t), c = e.info || ya(t), f = e.success || ba(t), x = e.warning || va(t);
  function j(y) {
    const _ = En(y, tt.text.primary) >= n ? tt.text.primary : Cn.text.primary;
    if (process.env.NODE_ENV !== "production") {
      const M = En(y, _);
      M < 3 && console.error([`MUI: The contrast ratio of ${M}:1 for ${_} on ${y}`, "falls below the WCAG recommended absolute minimum contrast ratio of 3:1.", "https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast"].join(`
`));
    }
    return _;
  }
  const g = ({
    color: y,
    name: _,
    mainShade: M = 500,
    lightShade: Y = 300,
    darkShade: X = 700
  }) => {
    if (y = V({}, y), !y.main && y[M] && (y.main = y[M]), !y.hasOwnProperty("main"))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${_ ? ` (${_})` : ""} provided to augmentColor(color) is invalid.
The color object needs to have a \`main\` property or a \`${M}\` property.` : fr(11, _ ? ` (${_})` : "", M));
    if (typeof y.main != "string")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${_ ? ` (${_})` : ""} provided to augmentColor(color) is invalid.
\`color.main\` should be a string, but \`${JSON.stringify(y.main)}\` was provided instead.

Did you intend to use one of the following approaches?

import { green } from "@mui/material/colors";

const theme1 = createTheme({ palette: {
  primary: green,
} });

const theme2 = createTheme({ palette: {
  primary: { main: green[500] },
} });` : fr(12, _ ? ` (${_})` : "", JSON.stringify(y.main)));
    return Tn(y, "light", Y, o), Tn(y, "dark", X, o), y.contrastText || (y.contrastText = j(y.main)), y;
  }, S = {
    dark: tt,
    light: Cn
  };
  return process.env.NODE_ENV !== "production" && (S[t] || console.error(`MUI: The palette mode \`${t}\` is not supported.`)), Ne(V({
    // A collection of common colors.
    common: V({}, pr),
    // prevent mutable object.
    // The palette mode, can be light or dark.
    mode: t,
    // The colors used to represent primary interface elements for a user.
    primary: g({
      color: a,
      name: "primary"
    }),
    // The colors used to represent secondary interface elements for a user.
    secondary: g({
      color: l,
      name: "secondary",
      mainShade: "A400",
      lightShade: "A200",
      darkShade: "A700"
    }),
    // The colors used to represent interface elements that the user should be made aware of.
    error: g({
      color: d,
      name: "error"
    }),
    // The colors used to represent potentially dangerous actions or important messages.
    warning: g({
      color: x,
      name: "warning"
    }),
    // The colors used to present information to the user that is neutral and not necessarily important.
    info: g({
      color: c,
      name: "info"
    }),
    // The colors used to indicate the successful completion of an action that user triggered.
    success: g({
      color: f,
      name: "success"
    }),
    // The grey colors.
    grey: pa,
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: n,
    // Takes a background color and returns the text color that maximizes the contrast.
    getContrastText: j,
    // Generate a rich color object.
    augmentColor: g,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: o
  }, S[t]), s);
}
const Ea = ["fontFamily", "fontSize", "fontWeightLight", "fontWeightRegular", "fontWeightMedium", "fontWeightBold", "htmlFontSize", "allVariants", "pxToRem"];
function wa(e) {
  return Math.round(e * 1e5) / 1e5;
}
const On = {
  textTransform: "uppercase"
}, Sn = '"Roboto", "Helvetica", "Arial", sans-serif';
function Ca(e, t) {
  const n = typeof t == "function" ? t(e) : t, {
    fontFamily: o = Sn,
    // The default font size of the Material Specification.
    fontSize: s = 14,
    // px
    fontWeightLight: a = 300,
    fontWeightRegular: l = 400,
    fontWeightMedium: d = 500,
    fontWeightBold: c = 700,
    // Tell MUI what's the font-size on the html element.
    // 16px is the default font-size used by browsers.
    htmlFontSize: f = 16,
    // Apply the CSS properties to all the variants.
    allVariants: x,
    pxToRem: j
  } = n, g = Le(n, Ea);
  process.env.NODE_ENV !== "production" && (typeof s != "number" && console.error("MUI: `fontSize` is required to be a number."), typeof f != "number" && console.error("MUI: `htmlFontSize` is required to be a number."));
  const S = s / 14, w = j || ((M) => `${M / f * S}rem`), y = (M, Y, X, $, E) => V({
    fontFamily: o,
    fontWeight: M,
    fontSize: w(Y),
    // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
    lineHeight: X
  }, o === Sn ? {
    letterSpacing: `${wa($ / Y)}em`
  } : {}, E, x), _ = {
    h1: y(a, 96, 1.167, -1.5),
    h2: y(a, 60, 1.2, -0.5),
    h3: y(l, 48, 1.167, 0),
    h4: y(l, 34, 1.235, 0.25),
    h5: y(l, 24, 1.334, 0),
    h6: y(d, 20, 1.6, 0.15),
    subtitle1: y(l, 16, 1.75, 0.15),
    subtitle2: y(d, 14, 1.57, 0.1),
    body1: y(l, 16, 1.5, 0.15),
    body2: y(l, 14, 1.43, 0.15),
    button: y(d, 14, 1.75, 0.4, On),
    caption: y(l, 12, 1.66, 0.4),
    overline: y(l, 12, 2.66, 1, On),
    // TODO v6: Remove handling of 'inherit' variant from the theme as it is already handled in Material UI's Typography component. Also, remember to remove the associated types.
    inherit: {
      fontFamily: "inherit",
      fontWeight: "inherit",
      fontSize: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit"
    }
  };
  return Ne(V({
    htmlFontSize: f,
    pxToRem: w,
    fontFamily: o,
    fontSize: s,
    fontWeightLight: a,
    fontWeightRegular: l,
    fontWeightMedium: d,
    fontWeightBold: c
  }, _), g, {
    clone: !1
    // No need to clone deep
  });
}
const Ta = 0.2, Oa = 0.14, Sa = 0.12;
function Z(...e) {
  return [`${e[0]}px ${e[1]}px ${e[2]}px ${e[3]}px rgba(0,0,0,${Ta})`, `${e[4]}px ${e[5]}px ${e[6]}px ${e[7]}px rgba(0,0,0,${Oa})`, `${e[8]}px ${e[9]}px ${e[10]}px ${e[11]}px rgba(0,0,0,${Sa})`].join(",");
}
const Ra = ["none", Z(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0), Z(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0), Z(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0), Z(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0), Z(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0), Z(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0), Z(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1), Z(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2), Z(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2), Z(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3), Z(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3), Z(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4), Z(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4), Z(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4), Z(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5), Z(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5), Z(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5), Z(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6), Z(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6), Z(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7), Z(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7), Z(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7), Z(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8), Z(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)], _a = ["duration", "easing", "delay"], Da = {
  // This is the most common easing curve.
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Objects enter the screen at full velocity from off-screen and
  // slowly decelerate to a resting point.
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  // Objects leave the screen at full velocity. They do not decelerate when off-screen.
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  // The sharp curve is used by objects that may return to the screen at any time.
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
}, Pa = {
  shortest: 150,
  shorter: 200,
  short: 250,
  // most basic recommended timing
  standard: 300,
  // this is to be used in complex animations
  complex: 375,
  // recommended when something is entering screen
  enteringScreen: 225,
  // recommended when something is leaving screen
  leavingScreen: 195
};
function Rn(e) {
  return `${Math.round(e)}ms`;
}
function ka(e) {
  if (!e)
    return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function Ia(e) {
  const t = V({}, Da, e.easing), n = V({}, Pa, e.duration);
  return V({
    getAutoHeightDuration: ka,
    create: (s = ["all"], a = {}) => {
      const {
        duration: l = n.standard,
        easing: d = t.easeInOut,
        delay: c = 0
      } = a, f = Le(a, _a);
      if (process.env.NODE_ENV !== "production") {
        const x = (g) => typeof g == "string", j = (g) => !isNaN(parseFloat(g));
        !x(s) && !Array.isArray(s) && console.error('MUI: Argument "props" must be a string or Array.'), !j(l) && !x(l) && console.error(`MUI: Argument "duration" must be a number or a string but found ${l}.`), x(d) || console.error('MUI: Argument "easing" must be a string.'), !j(c) && !x(c) && console.error('MUI: Argument "delay" must be a number or a string.'), typeof a != "object" && console.error(["MUI: Secong argument of transition.create must be an object.", "Arguments should be either `create('prop1', options)` or `create(['prop1', 'prop2'], options)`"].join(`
`)), Object.keys(f).length !== 0 && console.error(`MUI: Unrecognized argument(s) [${Object.keys(f).join(",")}].`);
      }
      return (Array.isArray(s) ? s : [s]).map((x) => `${x} ${typeof l == "string" ? l : Rn(l)} ${d} ${typeof c == "string" ? c : Rn(c)}`).join(",");
    }
  }, e, {
    easing: t,
    duration: n
  });
}
const Aa = {
  mobileStepper: 1e3,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
}, $a = ["breakpoints", "mixins", "spacing", "palette", "transitions", "typography", "shape"];
function Et(e = {}, ...t) {
  const {
    mixins: n = {},
    palette: o = {},
    transitions: s = {},
    typography: a = {}
  } = e, l = Le(e, $a);
  if (e.vars && // The error should throw only for the root theme creation because user is not allowed to use a custom node `vars`.
  // `generateCssVars` is the closest identifier for checking that the `options` is a result of `extendTheme` with CSS variables so that user can create new theme for nested ThemeProvider.
  e.generateCssVars === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `vars` is a private field used for CSS variables support.\nPlease use another name." : fr(18));
  const d = ja(o), c = qn(e);
  let f = Ne(c, {
    mixins: Xi(c.breakpoints, n),
    palette: d,
    // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol.
    shadows: Ra.slice(),
    typography: Ca(d, a),
    transitions: Ia(s),
    zIndex: V({}, Aa)
  });
  if (f = Ne(f, l), f = t.reduce((x, j) => Ne(x, j), f), process.env.NODE_ENV !== "production") {
    const x = ["active", "checked", "completed", "disabled", "error", "expanded", "focused", "focusVisible", "required", "selected"], j = (g, S) => {
      let w;
      for (w in g) {
        const y = g[w];
        if (x.indexOf(w) !== -1 && Object.keys(y).length > 0) {
          if (process.env.NODE_ENV !== "production") {
            const _ = Ni("", w);
            console.error([`MUI: The \`${S}\` component increases the CSS specificity of the \`${w}\` internal state.`, "You can not override it like this: ", JSON.stringify(g, null, 2), "", `Instead, you need to use the '&.${_}' syntax:`, JSON.stringify({
              root: {
                [`&.${_}`]: y
              }
            }, null, 2), "", "https://mui.com/r/state-classes-guide"].join(`
`));
          }
          g[w] = {};
        }
      }
    };
    Object.keys(f.components).forEach((g) => {
      const S = f.components[g].styleOverrides;
      S && g.indexOf("Mui") === 0 && j(S, g);
    });
  }
  return f.unstable_sxConfig = V({}, ht, l == null ? void 0 : l.unstable_sxConfig), f.unstable_sx = function(j) {
    return mt({
      sx: j,
      theme: this
    });
  }, f;
}
const Na = Et(), Ma = ["theme"];
function wt(e) {
  let {
    theme: t
  } = e, n = Le(e, Ma);
  const o = t[at];
  let s = o || t;
  return typeof t != "function" && (o && !o.vars ? s = V({}, o, {
    vars: null
  }) : t && !t.vars && (s = V({}, t, {
    vars: null
  }))), /* @__PURE__ */ r.jsx(_r, V({}, n, {
    themeId: o ? at : void 0,
    theme: s
  }));
}
process.env.NODE_ENV !== "production" && (wt.propTypes = {
  /**
   * Your component tree.
   */
  children: R.node,
  /**
   * A theme object. You can provide a function to extend the outer theme.
   */
  theme: R.oneOfType([R.object, R.func]).isRequired
});
process.env.NODE_ENV !== "production" && (R.node, R.object.isRequired);
function Wa(e) {
  return Ki(e);
}
function ao(e) {
  return /* @__PURE__ */ r.jsx(xt, V({}, e, {
    defaultTheme: Na,
    themeId: at
  }));
}
process.env.NODE_ENV !== "production" && (ao.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The styles you want to apply globally.
   */
  styles: R.oneOfType([R.array, R.func, R.number, R.object, R.string, R.bool])
});
const Ga = (e, t) => V({
  WebkitFontSmoothing: "antialiased",
  // Antialiasing.
  MozOsxFontSmoothing: "grayscale",
  // Antialiasing.
  // Change from `box-sizing: content-box` so that `width`
  // is not affected by `padding` or `border`.
  boxSizing: "border-box",
  // Fix font resize problem in iOS
  WebkitTextSizeAdjust: "100%"
}, t && !e.vars && {
  colorScheme: e.palette.mode
}), La = (e) => V({
  color: (e.vars || e).palette.text.primary
}, e.typography.body1, {
  backgroundColor: (e.vars || e).palette.background.default,
  "@media print": {
    // Save printer ink.
    backgroundColor: (e.vars || e).palette.common.white
  }
}), Ua = (e, t = !1) => {
  var n;
  const o = {};
  t && e.colorSchemes && Object.entries(e.colorSchemes).forEach(([l, d]) => {
    var c;
    o[e.getColorSchemeSelector(l).replace(/\s*&/, "")] = {
      colorScheme: (c = d.palette) == null ? void 0 : c.mode
    };
  });
  let s = V({
    html: Ga(e, t),
    "*, *::before, *::after": {
      boxSizing: "inherit"
    },
    "strong, b": {
      fontWeight: e.typography.fontWeightBold
    },
    body: V({
      margin: 0
    }, La(e), {
      // Add support for document.body.requestFullScreen().
      // Other elements, if background transparent, are not supported.
      "&::backdrop": {
        backgroundColor: (e.vars || e).palette.background.default
      }
    })
  }, o);
  const a = (n = e.components) == null || (n = n.MuiCssBaseline) == null ? void 0 : n.styleOverrides;
  return a && (s = [s, a]), s;
};
function Ct(e) {
  const t = Wa({
    props: e,
    name: "MuiCssBaseline"
  }), {
    children: n,
    enableColorScheme: o = !1
  } = t;
  return /* @__PURE__ */ r.jsxs(me.Fragment, {
    children: [/* @__PURE__ */ r.jsx(ao, {
      styles: (s) => Ua(s, o)
    }), n]
  });
}
process.env.NODE_ENV !== "production" && (Ct.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * You can wrap a node.
   */
  children: R.node,
  /**
   * Enable `color-scheme` CSS property to use `theme.palette.mode`.
   * For more details, check out https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme
   * For browser support, check out https://caniuse.com/?search=color-scheme
   * @default false
   */
  enableColorScheme: R.bool
});
const Ba = Et({
  palette: {
    primary: {
      main: "#1a237e",
      // SIDGS deep blue from website
      light: "#534bae",
      dark: "#000051",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#00b0ff",
      // SIDGS accent blue
      light: "#69e2ff",
      dark: "#0081cb",
      contrastText: "#000000"
    },
    background: {
      default: "#f5f7fa",
      // Light background from SIDGS
      paper: "#ffffff"
    },
    text: {
      primary: "#2d3748",
      // Dark text
      secondary: "#4a5568"
      // Medium text
    },
    success: {
      main: "#4caf50"
    },
    warning: {
      main: "#ff9800"
    },
    error: {
      main: "#f44336"
    },
    info: {
      main: "#2196f3"
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "3.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      color: "#1a237e"
    },
    h2: {
      fontSize: "2.5rem",
      fontWeight: 600,
      lineHeight: 1.3,
      color: "#1a237e"
    },
    h3: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.4
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 500
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 500
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6
    },
    button: {
      textTransform: "none",
      // SIDGS uses non-uppercase buttons
      fontWeight: 500
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px"
        },
        contained: {
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)"
        }
      }
    }
  }
}), le = [
  { id: "1", firstName: "John", lastName: "Doe", email: "john.doe@sidgs.com", title: "Senior Manager" },
  { id: "2", firstName: "Sarah", lastName: "Johnson", email: "sarah.j@sidgs.com", title: "Engineering Lead" },
  { id: "3", firstName: "Michael", lastName: "Chen", email: "michael.c@sidgs.com", title: "Product Manager" },
  { id: "4", firstName: "Emma", lastName: "Wilson", email: "emma.w@sidgs.com", title: "UX Designer" },
  { id: "5", firstName: "David", lastName: "Lee", email: "david.l@sidgs.com", title: "Software Engineer" }
], Ie = [
  {
    id: "1",
    shortDescription: "Improve code quality standards",
    longDescription: "Implement comprehensive code review processes and establish quality metrics for all engineering teams.",
    owner: le[0],
    creationDate: "2024-01-15",
    status: "PUBLISHED",
    assignedUsers: [le[1], le[4]],
    childGoals: [
      {
        id: "1-1",
        shortDescription: "Establish code review guidelines",
        longDescription: "Create and document standard code review procedures for all teams.",
        owner: le[1],
        creationDate: "2024-01-20",
        status: "ACHIEVED",
        assignedUsers: [le[4]],
        childGoals: []
      },
      {
        id: "1-2",
        shortDescription: "Implement automated testing",
        longDescription: "Set up automated testing pipeline with 90% coverage target.",
        owner: le[1],
        creationDate: "2024-01-25",
        status: "APPROVED",
        assignedUsers: [le[4]],
        childGoals: []
      }
    ]
  },
  {
    id: "2",
    shortDescription: "Launch new mobile application",
    longDescription: "Develop and launch mobile app for iOS and Android platforms",
    owner: le[2],
    creationDate: "2024-02-01",
    status: "APPROVED",
    assignedUsers: [le[1], le[3], le[4]],
    childGoals: []
  },
  {
    id: "3",
    shortDescription: "Increase customer satisfaction score",
    longDescription: "Improve overall customer satisfaction through better support and product quality enhancements.",
    owner: le[0],
    creationDate: "2024-01-10",
    completionDate: "2024-03-31",
    status: "ACHIEVED",
    assignedUsers: [le[2], le[3]],
    childGoals: [
      {
        id: "3-1",
        shortDescription: "Customer feedback system",
        longDescription: "Implement new customer feedback collection and analysis system.",
        owner: le[3],
        creationDate: "2024-01-12",
        status: "ACHIEVED",
        assignedUsers: [],
        childGoals: []
      }
    ]
  },
  {
    id: "4",
    shortDescription: "Q1 Revenue Targets",
    longDescription: "Achieve Q1 revenue targets through new customer acquisition and upselling.",
    owner: le[2],
    creationDate: "2024-01-05",
    status: "DRAFT",
    assignedUsers: [le[0]],
    childGoals: []
  },
  {
    id: "5",
    shortDescription: "Team skill development program",
    longDescription: "Develop comprehensive training program for engineering team skill enhancement.",
    owner: le[1],
    creationDate: "2024-02-10",
    status: "RETIRED",
    assignedUsers: [le[4]],
    childGoals: []
  }
], _n = (e) => {
  if (e.childGoals.length === 0)
    return e.status === "ACHIEVED" ? 100 : e.status === "RETIRED" ? 0 : e.status === "DRAFT" ? 10 : e.status === "APPROVED" ? 30 : 60;
  const t = e.childGoals.filter((n) => n.status === "ACHIEVED").length;
  return Math.round(t / e.childGoals.length * 100);
}, cr = {
  DRAFT: { label: "Draft", color: "default", icon: /* @__PURE__ */ r.jsx(Mn, {}) },
  APPROVED: { label: "Approved", color: "info", icon: /* @__PURE__ */ r.jsx(dr, {}) },
  PUBLISHED: { label: "Published", color: "primary", icon: /* @__PURE__ */ r.jsx(ut, {}) },
  ACHIEVED: { label: "Achieved", color: "success", icon: /* @__PURE__ */ r.jsx(dr, {}) },
  RETIRED: { label: "Retired", color: "warning", icon: /* @__PURE__ */ r.jsx(Nn, {}) }
}, Va = () => {
  const e = Dn(), [t, n] = pe(""), [o, s] = pe(Ie), [a, l] = pe(!0), [d, c] = pe(!1), [f, x] = pe([
    {
      id: 1,
      text: "Hello! I'm your Performance Assistant. How can I help you today?",
      sender: "bot",
      timestamp: /* @__PURE__ */ new Date()
    }
  ]), [j, g] = pe(""), [S, w] = pe(0), y = Po(null);
  Fr(() => {
    if (!t.trim())
      s(Ie), l(!0);
    else {
      const b = Ie.filter(
        (U) => U.shortDescription.toLowerCase().includes(t.toLowerCase()) || U.longDescription.toLowerCase().includes(t.toLowerCase()) || U.owner.firstName.toLowerCase().includes(t.toLowerCase()) || U.owner.lastName.toLowerCase().includes(t.toLowerCase())
      );
      s(b), l(!1);
    }
  }, [t]), Fr(() => {
    y.current && d && (y.current.scrollTop = y.current.scrollHeight);
  }, [f, d]), Fr(() => {
    d && S > 0 && w(0);
  }, [d, S]);
  const _ = () => {
    n(""), l(!0);
  }, M = async () => {
    if (!j.trim()) return;
    const b = {
      id: f.length + 1,
      text: j,
      sender: "user",
      timestamp: /* @__PURE__ */ new Date()
    };
    x((U) => [...U, b]), g(""), setTimeout(() => {
      const U = {
        id: f.length + 2,
        text: "We are processing your request.",
        sender: "bot",
        timestamp: /* @__PURE__ */ new Date()
      };
      x((oe) => [...oe, U]), d || w((oe) => oe + 1);
    }, 1e3);
  }, Y = (b) => {
    b.key === "Enter" && !b.shiftKey && (b.preventDefault(), M());
  }, X = () => {
    c(!d);
  }, $ = [
    {
      title: "Total Goals",
      value: Ie.length.toString(),
      change: "+2",
      icon: /* @__PURE__ */ r.jsx(Jo, {}),
      color: "primary.main"
    },
    {
      title: "Goals Published",
      value: Ie.filter((b) => b.status === "PUBLISHED").length.toString(),
      change: "+1",
      icon: /* @__PURE__ */ r.jsx(ut, {}),
      color: "secondary.main"
    },
    {
      title: "Goals Achieved",
      value: Ie.filter((b) => b.status === "ACHIEVED").length.toString(),
      change: "+3",
      icon: /* @__PURE__ */ r.jsx(dr, {}),
      color: "success.main"
    },
    {
      title: "Active Users",
      value: le.length.toString(),
      change: "+2",
      icon: /* @__PURE__ */ r.jsx(Xo, {}),
      color: "info.main"
    }
  ], E = [
    { user: "Sarah Johnson", action: "completed code review guidelines", time: "2 hours ago" },
    { user: "Michael Chen", action: "approved mobile app launch goal", time: "4 hours ago" },
    { user: "Emma Wilson", action: "achieved customer feedback system goal", time: "1 day ago" },
    { user: "David Lee", action: "assigned to improve code quality standards", time: "2 days ago" }
  ], xe = (b) => new Date(b).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  }), De = () => {
    e("/goals");
  };
  return /* @__PURE__ */ r.jsxs(v, { children: [
    /* @__PURE__ */ r.jsx(Ao, { in: !d, children: /* @__PURE__ */ r.jsx(
      v,
      {
        sx: {
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1e3
        },
        children: /* @__PURE__ */ r.jsx(
          In,
          {
            badgeContent: S,
            color: "error",
            invisible: S === 0,
            children: /* @__PURE__ */ r.jsx(
              We,
              {
                variant: "contained",
                onClick: X,
                startIcon: /* @__PURE__ */ r.jsx(Qo, {}),
                sx: {
                  backgroundColor: "primary.main",
                  color: "white",
                  borderRadius: "50px",
                  px: 3,
                  py: 1.5,
                  boxShadow: 3,
                  "&:hover": {
                    backgroundColor: "primary.dark",
                    transform: "scale(1.05)",
                    transition: "transform 0.2s"
                  }
                },
                children: "Performance Assistant"
              }
            )
          }
        )
      }
    ) }),
    /* @__PURE__ */ r.jsx($o, { direction: "up", in: d, mountOnEnter: !0, unmountOnExit: !0, children: /* @__PURE__ */ r.jsxs(
      Tr,
      {
        elevation: 10,
        sx: {
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 380,
          height: 500,
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "background.paper"
        },
        children: [
          /* @__PURE__ */ r.jsxs(
            v,
            {
              sx: {
                backgroundColor: "primary.main",
                color: "white",
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              },
              children: [
                /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", gap: 1.5 }, children: [
                  /* @__PURE__ */ r.jsx(Kt, {}),
                  /* @__PURE__ */ r.jsx(m, { variant: "h6", fontWeight: 600, children: "Performance Assistant" })
                ] }),
                /* @__PURE__ */ r.jsx(_e, { onClick: X, size: "small", sx: { color: "white" }, children: /* @__PURE__ */ r.jsx(Yr, {}) })
              ]
            }
          ),
          /* @__PURE__ */ r.jsx(
            v,
            {
              ref: y,
              sx: {
                flex: 1,
                p: 2,
                overflowY: "auto",
                backgroundColor: "grey.50",
                display: "flex",
                flexDirection: "column",
                gap: 2
              },
              children: f.map((b) => /* @__PURE__ */ r.jsx(
                v,
                {
                  sx: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: b.sender === "user" ? "flex-end" : "flex-start"
                  },
                  children: /* @__PURE__ */ r.jsxs(
                    v,
                    {
                      sx: {
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        maxWidth: "80%",
                        flexDirection: b.sender === "user" ? "row-reverse" : "row"
                      },
                      children: [
                        /* @__PURE__ */ r.jsx(
                          $e,
                          {
                            sx: {
                              width: 32,
                              height: 32,
                              bgcolor: b.sender === "user" ? "secondary.main" : "primary.main"
                            },
                            children: b.sender === "user" ? /* @__PURE__ */ r.jsx(Zo, {}) : /* @__PURE__ */ r.jsx(Kt, {})
                          }
                        ),
                        /* @__PURE__ */ r.jsxs(
                          Tr,
                          {
                            elevation: 1,
                            sx: {
                              p: 1.5,
                              backgroundColor: b.sender === "user" ? "primary.light" : "white",
                              color: b.sender === "user" ? "white" : "text.primary",
                              borderRadius: 2,
                              borderTopLeftRadius: b.sender === "user" ? 12 : 4,
                              borderTopRightRadius: b.sender === "user" ? 4 : 12
                            },
                            children: [
                              /* @__PURE__ */ r.jsx(m, { variant: "body2", children: b.text }),
                              /* @__PURE__ */ r.jsx(
                                m,
                                {
                                  variant: "caption",
                                  sx: {
                                    display: "block",
                                    mt: 0.5,
                                    opacity: 0.7,
                                    textAlign: b.sender === "user" ? "right" : "left"
                                  },
                                  children: b.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                }
                              )
                            ]
                          }
                        )
                      ]
                    }
                  )
                },
                b.id
              ))
            }
          ),
          /* @__PURE__ */ r.jsxs(
            v,
            {
              sx: {
                p: 2,
                borderTop: 1,
                borderColor: "divider",
                backgroundColor: "white"
              },
              children: [
                /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", gap: 1 }, children: [
                  /* @__PURE__ */ r.jsx(
                    An,
                    {
                      fullWidth: !0,
                      size: "small",
                      placeholder: "Type your message...",
                      value: j,
                      onChange: (b) => g(b.target.value),
                      onKeyPress: Y,
                      multiline: !0,
                      maxRows: 3,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2
                        }
                      }
                    }
                  ),
                  /* @__PURE__ */ r.jsx(
                    _e,
                    {
                      onClick: M,
                      disabled: !j.trim(),
                      sx: {
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "primary.dark"
                        },
                        "&.Mui-disabled": {
                          backgroundColor: "grey.300"
                        }
                      },
                      children: /* @__PURE__ */ r.jsx(es, {})
                    }
                  )
                ] }),
                /* @__PURE__ */ r.jsx(m, { variant: "caption", color: "text.secondary", sx: { mt: 1, display: "block" }, children: "Press Enter to send, Shift+Enter for new line" })
              ]
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ r.jsxs(v, { sx: { mb: 4 }, children: [
      /* @__PURE__ */ r.jsx(m, { variant: "h1", gutterBottom: !0, children: "Performance Intelligence" }),
      /* @__PURE__ */ r.jsx(m, { variant: "h5", color: "text.secondary", sx: { mb: 3 }, children: "Track, manage, and achieve organizational goals with AI-driven insights." }),
      /* @__PURE__ */ r.jsx(
        We,
        {
          variant: "contained",
          size: "large",
          endIcon: /* @__PURE__ */ r.jsx(rs, {}),
          onClick: De,
          sx: { mr: 2 },
          children: "Explore Goals"
        }
      )
    ] }),
    /* @__PURE__ */ r.jsx(ee, { container: !0, spacing: 3, sx: { mb: 4 }, children: $.map((b, U) => /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ r.jsx(ve, { children: /* @__PURE__ */ r.jsxs(je, { children: [
      /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", justifyContent: "space-between", mb: 2 }, children: [
        /* @__PURE__ */ r.jsxs(v, { children: [
          /* @__PURE__ */ r.jsx(m, { variant: "h3", fontWeight: 700, children: b.value }),
          /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", children: b.title })
        ] }),
        /* @__PURE__ */ r.jsx(
          v,
          {
            sx: {
              backgroundColor: `${b.color}15`,
              borderRadius: 2,
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            },
            children: /* @__PURE__ */ r.jsx(v, { sx: { color: b.color }, children: b.icon })
          }
        )
      ] }),
      /* @__PURE__ */ r.jsx(
        Ae,
        {
          label: b.change,
          size: "small",
          sx: {
            backgroundColor: b.change.startsWith("+") ? "success.light" : "error.light",
            color: b.change.startsWith("+") ? "success.dark" : "error.dark"
          }
        }
      )
    ] }) }) }, U)) }),
    /* @__PURE__ */ r.jsxs(ee, { container: !0, spacing: 3, children: [
      /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 12, md: 8, children: /* @__PURE__ */ r.jsx(ve, { sx: { height: "100%" }, children: /* @__PURE__ */ r.jsxs(je, { children: [
        /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
          /* @__PURE__ */ r.jsxs(v, { children: [
            /* @__PURE__ */ r.jsx(m, { variant: "h5", gutterBottom: !0, children: "Goals Overview" }),
            /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", children: "Track organizational goals and progress toward objectives" })
          ] }),
          /* @__PURE__ */ r.jsxs(
            v,
            {
              sx: {
                display: "flex",
                alignItems: "center",
                backgroundColor: "background.default",
                borderRadius: 2,
                px: 2,
                py: 0.5,
                width: 250,
                position: "relative"
              },
              children: [
                /* @__PURE__ */ r.jsx($n, { sx: { color: "text.secondary", mr: 1 } }),
                /* @__PURE__ */ r.jsx(
                  No,
                  {
                    placeholder: "Search goals...",
                    value: t,
                    onChange: (b) => n(b.target.value),
                    sx: { flex: 1 },
                    inputProps: { "aria-label": "search performance items" }
                  }
                ),
                t && /* @__PURE__ */ r.jsx(
                  _e,
                  {
                    size: "small",
                    onClick: _,
                    sx: {
                      position: "absolute",
                      right: 8,
                      color: "text.secondary",
                      "&:hover": {
                        color: "text.primary"
                      }
                    },
                    children: /* @__PURE__ */ r.jsx(Yr, { fontSize: "small" })
                  }
                )
              ]
            }
          )
        ] }),
        /* @__PURE__ */ r.jsx(v, { sx: { mt: 3 }, children: a ? (
          // Show all goals
          Ie.map((b) => {
            const U = _n(b);
            return /* @__PURE__ */ r.jsxs(v, { sx: { mb: 3 }, children: [
              /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }, children: [
                /* @__PURE__ */ r.jsxs(v, { sx: { flex: 1 }, children: [
                  /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 0.5 }, children: [
                    /* @__PURE__ */ r.jsx(m, { variant: "body1", fontWeight: 500, children: b.shortDescription }),
                    /* @__PURE__ */ r.jsx(
                      Ae,
                      {
                        label: cr[b.status].label,
                        color: cr[b.status].color,
                        size: "small",
                        variant: "outlined"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ r.jsxs(m, { variant: "caption", color: "text.secondary", children: [
                    "Owner: ",
                    b.owner.firstName,
                    " ",
                    b.owner.lastName,
                    " • Created: ",
                    xe(b.creationDate)
                  ] }),
                  /* @__PURE__ */ r.jsxs(m, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 0.5 }, children: [
                    b.longDescription.substring(0, 120),
                    "..."
                  ] })
                ] }),
                /* @__PURE__ */ r.jsxs(m, { variant: "body2", fontWeight: 500, children: [
                  U,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ r.jsx(
                nt,
                {
                  variant: "determinate",
                  value: U,
                  sx: {
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: U === 100 ? "success.main" : U >= 70 ? "primary.main" : "warning.main",
                      borderRadius: 4
                    }
                  }
                }
              ),
              b.assignedUsers.length > 0 && /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", gap: 1, mt: 1 }, children: [
                /* @__PURE__ */ r.jsx(m, { variant: "caption", color: "text.secondary", children: "Assigned to:" }),
                /* @__PURE__ */ r.jsx(Hr, { max: 3, children: b.assignedUsers.map((oe) => /* @__PURE__ */ r.jsx(
                  $e,
                  {
                    sx: { width: 24, height: 24, bgcolor: "secondary.main" },
                    children: oe.firstName[0]
                  },
                  oe.id
                )) })
              ] })
            ] }, b.id);
          })
        ) : o.length > 0 ? (
          // Show filtered goals
          o.map((b) => {
            const U = _n(b);
            return /* @__PURE__ */ r.jsxs(v, { sx: { mb: 3 }, children: [
              /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }, children: [
                /* @__PURE__ */ r.jsxs(v, { sx: { flex: 1 }, children: [
                  /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 0.5 }, children: [
                    /* @__PURE__ */ r.jsx(m, { variant: "body1", fontWeight: 500, children: b.shortDescription }),
                    /* @__PURE__ */ r.jsx(
                      Ae,
                      {
                        label: cr[b.status].label,
                        color: cr[b.status].color,
                        size: "small",
                        variant: "outlined"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ r.jsxs(m, { variant: "caption", color: "text.secondary", children: [
                    "Owner: ",
                    b.owner.firstName,
                    " ",
                    b.owner.lastName,
                    " • Created: ",
                    xe(b.creationDate)
                  ] }),
                  /* @__PURE__ */ r.jsxs(m, { variant: "caption", color: "text.secondary", sx: { display: "block", mt: 0.5 }, children: [
                    b.longDescription.substring(0, 120),
                    "..."
                  ] })
                ] }),
                /* @__PURE__ */ r.jsxs(m, { variant: "body2", fontWeight: 500, children: [
                  U,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ r.jsx(
                nt,
                {
                  variant: "determinate",
                  value: U,
                  sx: {
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: U === 100 ? "success.main" : U >= 70 ? "primary.main" : "warning.main",
                      borderRadius: 4
                    }
                  }
                }
              ),
              b.assignedUsers.length > 0 && /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", gap: 1, mt: 1 }, children: [
                /* @__PURE__ */ r.jsx(m, { variant: "caption", color: "text.secondary", children: "Assigned to:" }),
                /* @__PURE__ */ r.jsx(Hr, { max: 3, children: b.assignedUsers.map((oe) => /* @__PURE__ */ r.jsx(
                  $e,
                  {
                    sx: { width: 24, height: 24, bgcolor: "secondary.main" },
                    children: oe.firstName[0]
                  },
                  oe.id
                )) })
              ] })
            ] }, b.id);
          })
        ) : (
          // No results found
          /* @__PURE__ */ r.jsxs(v, { sx: { textAlign: "center", py: 4 }, children: [
            /* @__PURE__ */ r.jsxs(m, { variant: "h6", color: "text.secondary", gutterBottom: !0, children: [
              'No results found for "',
              t,
              '"'
            ] }),
            /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", children: "Try searching for: Improve code quality, Launch mobile app, Customer satisfaction, etc." }),
            /* @__PURE__ */ r.jsx(
              We,
              {
                onClick: _,
                sx: { mt: 2 },
                startIcon: /* @__PURE__ */ r.jsx(Yr, {}),
                children: "Clear Search"
              }
            )
          ] })
        ) })
      ] }) }) }),
      /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 12, md: 4, children: /* @__PURE__ */ r.jsx(ve, { sx: { height: "100%" }, children: /* @__PURE__ */ r.jsxs(je, { children: [
        /* @__PURE__ */ r.jsx(m, { variant: "h5", gutterBottom: !0, children: "Recent Activity" }),
        /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", gutterBottom: !0, children: "Latest goal updates and team activities" }),
        /* @__PURE__ */ r.jsx(v, { sx: { mt: 2 }, children: E.map((b, U) => /* @__PURE__ */ r.jsxs(
          v,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              py: 2,
              borderBottom: U < E.length - 1 ? "1px solid" : "none",
              borderColor: "divider"
            },
            children: [
              /* @__PURE__ */ r.jsx($e, { sx: { width: 40, height: 40, mr: 2, bgcolor: "primary.main" }, children: b.user.split(" ")[0][0] }),
              /* @__PURE__ */ r.jsxs(v, { children: [
                /* @__PURE__ */ r.jsxs(m, { variant: "body2", children: [
                  /* @__PURE__ */ r.jsx("strong", { children: b.user }),
                  " ",
                  b.action
                ] }),
                /* @__PURE__ */ r.jsx(m, { variant: "caption", color: "text.secondary", children: b.time })
              ] })
            ]
          },
          U
        )) }),
        /* @__PURE__ */ r.jsxs(v, { sx: { mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }, children: [
          /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", gutterBottom: !0, children: "Active Team Members" }),
          /* @__PURE__ */ r.jsx(Hr, { max: 6, sx: { justifyContent: "flex-start" } }),
          /* @__PURE__ */ r.jsxs(m, { variant: "caption", color: "text.secondary", sx: { mt: 1, display: "block" }, children: [
            le.length,
            " team members managing goals"
          ] })
        ] }),
        /* @__PURE__ */ r.jsxs(v, { sx: { mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }, children: [
          /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", gutterBottom: !0, children: "Goal Status Distribution" }),
          /* @__PURE__ */ r.jsx(v, { sx: { mt: 1 }, children: Object.entries(cr).map(([b, U]) => {
            const oe = Ie.filter((Pe) => Pe.status === b).length, Re = Math.round(oe / Ie.length * 100);
            return /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }, children: [
              /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ r.jsx(v, { sx: { color: U.color }, children: U.icon }),
                /* @__PURE__ */ r.jsx(m, { variant: "body2", children: U.label })
              ] }),
              /* @__PURE__ */ r.jsxs(m, { variant: "body2", fontWeight: 500, children: [
                oe,
                " (",
                Re,
                "%)"
              ] })
            ] }, b);
          }) })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ r.jsxs(v, { sx: { mt: 4, textAlign: "center" }, children: [
      /* @__PURE__ */ r.jsx(m, { variant: "h4", gutterBottom: !0, children: "Ready to achieve your organizational goals?" }),
      /* @__PURE__ */ r.jsx(m, { variant: "body1", color: "text.secondary", sx: { mb: 3 }, children: "Track progress, assign responsibilities, and drive success with our comprehensive goals management platform." }),
      /* @__PURE__ */ r.jsx(We, { variant: "contained", size: "large", children: "Explore All Goals" })
    ] })
  ] });
}, za = Pr.createContext({
  searchQuery: "",
  setSearchQuery: () => {
  }
}), Fa = ({ onSearchChange: e }) => {
  const [t, n] = pe(""), [, o] = pe(!1), s = ko(() => {
    n(""), o(!1), e && e("");
  }, [e]), a = /* @__PURE__ */ r.jsx(v, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: /* @__PURE__ */ r.jsx(
    m,
    {
      variant: "h6",
      sx: {
        fontWeight: 700,
        color: "primary.main",
        display: { xs: "none", md: "block" }
      },
      children: /* @__PURE__ */ r.jsx(
        "img",
        {
          src: "https://sidgs.com/wp-content/uploads/2023/02/SIDGS-Dark.svg",
          alt: "SIDGS Logo",
          style: { height: 40, cursor: "pointer" },
          onClick: () => {
            s();
          }
        }
      )
    }
  ) });
  return /* @__PURE__ */ r.jsx(za.Provider, { value: { searchQuery: t, setSearchQuery: n }, children: /* @__PURE__ */ r.jsx(
    Mo,
    {
      position: "fixed",
      sx: {
        zIndex: (l) => l.zIndex.drawer + 1,
        backgroundColor: "white",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider"
      },
      children: /* @__PURE__ */ r.jsxs(Wo, { sx: { justifyContent: "space-between" }, children: [
        /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", gap: 3 }, children: [
          /* @__PURE__ */ r.jsx(
            _e,
            {
              color: "inherit",
              edge: "start",
              sx: { mr: 2, display: { lg: "none" } },
              children: /* @__PURE__ */ r.jsx(ts, {})
            }
          ),
          a
        ] }),
        /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
          /* @__PURE__ */ r.jsx(_e, { size: "large", children: /* @__PURE__ */ r.jsx(In, { badgeContent: 3, color: "error", children: /* @__PURE__ */ r.jsx(ns, {}) }) }),
          /* @__PURE__ */ r.jsx(_e, { size: "large", children: /* @__PURE__ */ r.jsx(os, {}) })
        ] })
      ] })
    }
  ) });
}, Ha = () => {
  const [e, t] = pe(!1), n = Pn(), o = Dn(), s = 260, a = [
    { text: "Home", icon: /* @__PURE__ */ r.jsx(is, {}), path: "/" }
    // { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  ], l = [
    // { text: 'Performance Reviews', icon: <AssessmentIcon />, path: '/performance/reviews' },
    { text: "Goals", icon: /* @__PURE__ */ r.jsx(as, {}), path: "/goals" }
    // { text: 'Feedback', icon: <NotificationsActiveIcon />, path: '/performance/feedback' },
  ], d = [
    { text: "Reports", icon: /* @__PURE__ */ r.jsx(ls, {}), path: "/reports" },
    // { text: 'Team Management', icon: <PeopleIcon />, path: '/team' },
    { text: "Settings", icon: /* @__PURE__ */ r.jsx(cs, {}), path: "/settings" }
  ];
  return /* @__PURE__ */ r.jsx(
    Go,
    {
      variant: "permanent",
      sx: {
        width: s,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: s,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
          backgroundColor: "white",
          top: 64,
          // Height of header
          height: "calc(100vh - 64px)"
        },
        display: { xs: "none", lg: "block" }
      },
      children: /* @__PURE__ */ r.jsxs(v, { sx: { overflow: "auto", p: 2 }, children: [
        /* @__PURE__ */ r.jsx(
          m,
          {
            variant: "overline",
            sx: {
              color: "text.secondary",
              fontWeight: 600,
              letterSpacing: 1,
              mb: 1,
              display: "block"
            },
            children: "Main Menu"
          }
        ),
        /* @__PURE__ */ r.jsx(xr, { children: a.map((c) => /* @__PURE__ */ r.jsx(yr, { disablePadding: !0, children: /* @__PURE__ */ r.jsxs(
          br,
          {
            selected: n.pathname === c.path,
            onClick: () => o(c.path),
            sx: {
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "primary.dark"
                }
              }
            },
            children: [
              /* @__PURE__ */ r.jsx(
                vr,
                {
                  sx: {
                    color: n.pathname === c.path ? "white" : "inherit"
                  },
                  children: c.icon
                }
              ),
              /* @__PURE__ */ r.jsx(jr, { primary: c.text })
            ]
          }
        ) }, c.text)) }),
        /* @__PURE__ */ r.jsx(Lt, { sx: { my: 2 } }),
        /* @__PURE__ */ r.jsx(
          m,
          {
            variant: "overline",
            sx: {
              color: "text.secondary",
              fontWeight: 600,
              letterSpacing: 1,
              mb: 1,
              display: "block"
            },
            children: "Performance"
          }
        ),
        /* @__PURE__ */ r.jsxs(xr, { children: [
          /* @__PURE__ */ r.jsx(yr, { disablePadding: !0, children: /* @__PURE__ */ r.jsxs(br, { onClick: () => t(!e), children: [
            /* @__PURE__ */ r.jsx(vr, { children: /* @__PURE__ */ r.jsx(ss, {}) }),
            /* @__PURE__ */ r.jsx(jr, { primary: "Performance Management" }),
            e ? /* @__PURE__ */ r.jsx(ot, {}) : /* @__PURE__ */ r.jsx(st, {})
          ] }) }),
          /* @__PURE__ */ r.jsx(Lo, { in: e, timeout: "auto", unmountOnExit: !0, children: /* @__PURE__ */ r.jsx(xr, { component: "div", disablePadding: !0, children: l.map((c) => /* @__PURE__ */ r.jsx(yr, { disablePadding: !0, sx: { pl: 4 }, children: /* @__PURE__ */ r.jsxs(
            br,
            {
              selected: n.pathname === c.path,
              onClick: () => o(c.path),
              sx: {
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "primary.light",
                  color: "white"
                }
              },
              children: [
                /* @__PURE__ */ r.jsx(
                  vr,
                  {
                    sx: {
                      minWidth: 36,
                      color: n.pathname === c.path ? "white" : "inherit"
                    },
                    children: c.icon
                  }
                ),
                /* @__PURE__ */ r.jsx(jr, { primary: c.text })
              ]
            }
          ) }, c.text)) }) })
        ] }),
        /* @__PURE__ */ r.jsx(Lt, { sx: { my: 2 } }),
        /* @__PURE__ */ r.jsx(xr, { children: d.map((c) => /* @__PURE__ */ r.jsx(yr, { disablePadding: !0, children: /* @__PURE__ */ r.jsxs(
          br,
          {
            selected: n.pathname === c.path,
            onClick: () => o(c.path),
            sx: {
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "primary.dark"
                }
              }
            },
            children: [
              /* @__PURE__ */ r.jsx(
                vr,
                {
                  sx: {
                    color: n.pathname === c.path ? "white" : "inherit"
                  },
                  children: c.icon
                }
              ),
              /* @__PURE__ */ r.jsx(jr, { primary: c.text })
            ]
          }
        ) }, c.text)) })
      ] })
    }
  );
}, Ya = () => {
  const e = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ r.jsx(
    v,
    {
      component: "footer",
      sx: {
        backgroundColor: "transparent",
        py: 3,
        px: 2,
        mt: "auto",
        textAlign: "center",
        borderTop: "1px solid rgba(0, 0, 0, 0.1)"
      },
      children: /* @__PURE__ */ r.jsxs(
        m,
        {
          variant: "body2",
          sx: {
            color: "#666",
            fontSize: "0.875rem",
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            fontWeight: "bold"
          },
          children: [
            "© ",
            e,
            " SID Global Solutions. All Rights Reserved."
          ]
        }
      )
    }
  );
}, qa = () => {
  const t = Pn().pathname.split("/").filter((o) => o), n = (o) => ({
    "": "Home",
    dashboard: "Dashboard",
    performance: "Performance",
    reviews: "Reviews",
    goals: "Goals & OKRs",
    feedback: "Feedback",
    reports: "Reports",
    team: "Team Management",
    settings: "Settings"
  })[o] || o.charAt(0).toUpperCase() + o.slice(1);
  return /* @__PURE__ */ r.jsxs(
    Uo,
    {
      separator: /* @__PURE__ */ r.jsx(us, { fontSize: "small" }),
      "aria-label": "breadcrumb",
      sx: { mb: 2 },
      children: [
        /* @__PURE__ */ r.jsx(
          Ut,
          {
            component: Gt,
            to: "/",
            underline: "hover",
            color: "inherit",
            sx: { display: "flex", alignItems: "center" },
            children: "Home"
          }
        ),
        t.map((o, s) => {
          const a = s === t.length - 1, l = `/${t.slice(0, s + 1).join("/")}`;
          return a ? /* @__PURE__ */ r.jsx(m, { color: "text.primary", fontWeight: 500, children: n(o) }, l) : /* @__PURE__ */ r.jsx(
            Ut,
            {
              component: Gt,
              to: l,
              underline: "hover",
              color: "inherit",
              children: n(o)
            },
            l
          );
        })
      ]
    }
  );
}, Ka = ({ children: e }) => /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", minHeight: "100vh", flexDirection: "column" }, children: [
  /* @__PURE__ */ r.jsx(Fa, {}),
  /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", flex: 1 }, children: [
    /* @__PURE__ */ r.jsx(Ha, {}),
    /* @__PURE__ */ r.jsxs(
      v,
      {
        component: "main",
        sx: {
          flexGrow: 1,
          p: 3,
          backgroundColor: "background.default",
          minHeight: "calc(100vh - 120px)"
        },
        children: [
          /* @__PURE__ */ r.jsx(qa, {}),
          /* @__PURE__ */ r.jsx(v, { sx: { mt: 2 }, children: e })
        ]
      }
    )
  ] }),
  /* @__PURE__ */ r.jsx(Ya, {})
] }), fe = [
  { id: "1", firstName: "John", lastName: "Doe", email: "john.doe@sidgs.com", title: "Senior Manager" },
  { id: "2", firstName: "Sarah", lastName: "Johnson", email: "sarah.j@sidgs.com", title: "Engineering Lead" },
  { id: "3", firstName: "Michael", lastName: "Chen", email: "michael.c@sidgs.com", title: "Product Manager" },
  { id: "4", firstName: "Emma", lastName: "Wilson", email: "emma.w@sidgs.com", title: "UX Designer" },
  { id: "5", firstName: "David", lastName: "Lee", email: "david.l@sidgs.com", title: "Software Engineer" }
], Ja = [
  {
    id: "1",
    shortDescription: "Improve code quality standards",
    longDescription: "Implement comprehensive code review processes and establish quality metrics for all engineering teams.",
    owner: fe[0],
    creationDate: "2024-01-15",
    status: "PUBLISHED",
    assignedUsers: [fe[1], fe[4]],
    childGoals: [
      {
        id: "1-1",
        shortDescription: "Establish code review guidelines",
        longDescription: "Create and document standard code review procedures for all teams.",
        owner: fe[1],
        creationDate: "2024-01-20",
        status: "ACHIEVED",
        assignedUsers: [fe[4]],
        childGoals: []
      },
      {
        id: "1-2",
        shortDescription: "Implement automated testing",
        longDescription: "Set up automated testing pipeline with 90% coverage target.",
        owner: fe[1],
        creationDate: "2024-01-25",
        status: "APPROVED",
        assignedUsers: [fe[4]],
        childGoals: []
      }
    ]
  },
  {
    id: "2",
    shortDescription: "Launch new mobile application",
    longDescription: "Develop and launch mobile app for iOS and Android platforms",
    owner: fe[2],
    creationDate: "2024-02-01",
    status: "APPROVED",
    assignedUsers: [fe[1], fe[3], fe[4]],
    childGoals: []
  },
  {
    id: "3",
    shortDescription: "Increase customer satisfaction score",
    longDescription: "Improve overall customer satisfaction through better support and product quality enhancements.",
    owner: fe[0],
    creationDate: "2024-01-10",
    completionDate: "2024-03-31",
    status: "ACHIEVED",
    assignedUsers: [fe[2], fe[3]],
    childGoals: [
      {
        id: "3-1",
        shortDescription: "Customer feedback system",
        longDescription: "Implement new customer feedback collection and analysis system.",
        owner: fe[3],
        creationDate: "2024-01-12",
        status: "ACHIEVED",
        assignedUsers: [],
        childGoals: []
      }
    ]
  },
  {
    id: "4",
    shortDescription: "Q1 Revenue Targets",
    longDescription: "Achieve Q1 revenue targets through new customer acquisition and upselling.",
    owner: fe[2],
    creationDate: "2024-01-05",
    status: "DRAFT",
    assignedUsers: [fe[0]],
    childGoals: []
  },
  {
    id: "5",
    shortDescription: "Team skill development program",
    longDescription: "Develop comprehensive training program for engineering team skill enhancement.",
    owner: fe[1],
    creationDate: "2024-02-10",
    status: "RETIRED",
    assignedUsers: [fe[4]],
    childGoals: []
  }
], Xa = () => {
  const [e, t] = pe(Ja), [n, o] = pe(""), [s, a] = pe("all"), [l, d] = pe("all"), [c, f] = pe(/* @__PURE__ */ new Set()), [x, j] = pe(0), [g, S] = pe(!1), [w, y] = pe(null), [_, M] = pe("list"), Y = e.filter((u) => {
    const I = u.shortDescription.toLowerCase().includes(n.toLowerCase()) || u.longDescription.toLowerCase().includes(n.toLowerCase()), se = s === "all" || u.status === s, re = l === "all" || u.owner.id === l;
    return I && se && re;
  }), X = ["DRAFT", "APPROVED", "PUBLISHED", "ACHIEVED", "RETIRED"], $ = {
    DRAFT: { label: "Draft", color: "default", icon: /* @__PURE__ */ r.jsx(Mn, {}) },
    APPROVED: { label: "Approved", color: "info", icon: /* @__PURE__ */ r.jsx(dr, {}) },
    PUBLISHED: { label: "Published", color: "primary", icon: /* @__PURE__ */ r.jsx(ut, {}) },
    ACHIEVED: { label: "Achieved", color: "success", icon: /* @__PURE__ */ r.jsx(dr, {}) },
    RETIRED: { label: "Retired", color: "warning", icon: /* @__PURE__ */ r.jsx(Nn, {}) }
  }, E = (u) => {
    const I = new Set(c);
    I.has(u) ? I.delete(u) : I.add(u), f(I);
  }, xe = (u) => {
    y(u), S(!0);
  }, De = (u) => {
    window.confirm("Are you sure you want to delete this goal?") && t(e.filter((I) => I.id !== u));
  }, b = (u) => new Date(u).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }), U = (u) => {
    if (u.childGoals.length === 0)
      return u.status === "ACHIEVED" ? 100 : u.status === "RETIRED" ? 0 : u.status === "DRAFT" ? 10 : u.status === "APPROVED" ? 30 : 60;
    const I = u.childGoals.filter((se) => se.status === "ACHIEVED").length;
    return Math.round(I / u.childGoals.length * 100);
  }, oe = ({ users: u, max: I = 3 }) => {
    const se = u.slice(0, I), re = u.length - I;
    return /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center" }, children: [
      se.map((he, ke) => /* @__PURE__ */ r.jsx(qe, { title: `${he.firstName} ${he.lastName}`, children: /* @__PURE__ */ r.jsx(
        $e,
        {
          sx: {
            width: 32,
            height: 32,
            bgcolor: "primary.main",
            border: "2px solid white",
            marginLeft: ke > 0 ? "-8px" : 0,
            zIndex: se.length - ke
          },
          children: he.firstName[0]
        }
      ) }, he.id)),
      re > 0 && /* @__PURE__ */ r.jsx(qe, { title: `${re} more user${re !== 1 ? "s" : ""}`, children: /* @__PURE__ */ r.jsxs(
        $e,
        {
          sx: {
            width: 32,
            height: 32,
            bgcolor: "grey.400",
            marginLeft: "-8px",
            fontSize: "0.75rem"
          },
          children: [
            "+",
            re
          ]
        }
      ) })
    ] });
  }, Re = (u, I = 0) => {
    const se = U(u), re = u.childGoals.length > 0;
    return /* @__PURE__ */ r.jsxs(v, { children: [
      /* @__PURE__ */ r.jsx(ve, { sx: { mb: 1, ml: I * 4 }, children: /* @__PURE__ */ r.jsxs(je, { children: [
        /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
            re && /* @__PURE__ */ r.jsx(_e, { size: "small", onClick: () => E(u.id), children: c.has(u.id) ? /* @__PURE__ */ r.jsx(ot, {}) : /* @__PURE__ */ r.jsx(st, {}) }),
            /* @__PURE__ */ r.jsxs(v, { children: [
              /* @__PURE__ */ r.jsx(m, { variant: "h6", gutterBottom: !0, children: u.shortDescription }),
              /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 1 }, children: [
                /* @__PURE__ */ r.jsx(
                  Ae,
                  {
                    label: $[u.status].label,
                    color: $[u.status].color,
                    icon: $[u.status].icon,
                    size: "small"
                  }
                ),
                /* @__PURE__ */ r.jsxs(m, { variant: "body2", color: "text.secondary", children: [
                  "Owner: ",
                  u.owner.firstName,
                  " ",
                  u.owner.lastName
                ] }),
                /* @__PURE__ */ r.jsxs(m, { variant: "body2", color: "text.secondary", children: [
                  "Created: ",
                  b(u.creationDate)
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
            /* @__PURE__ */ r.jsx(qe, { title: "View Details", children: /* @__PURE__ */ r.jsx(_e, { size: "small", onClick: () => xe(u), children: /* @__PURE__ */ r.jsx(Jt, {}) }) }),
            /* @__PURE__ */ r.jsx(qe, { title: "Delete", children: /* @__PURE__ */ r.jsx(_e, { size: "small", onClick: () => De(u.id), color: "error", children: /* @__PURE__ */ r.jsx(Xt, {}) }) })
          ] })
        ] }),
        /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: u.longDescription }),
        /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ r.jsxs(v, { sx: { flex: 1, mr: 2 }, children: [
            /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", justifyContent: "space-between", mb: 0.5 }, children: [
              /* @__PURE__ */ r.jsx(m, { variant: "body2", children: "Progress" }),
              /* @__PURE__ */ r.jsxs(m, { variant: "body2", fontWeight: 500, children: [
                se,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ r.jsx(
              nt,
              {
                variant: "determinate",
                value: se,
                sx: {
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: se === 100 ? "success.main" : se >= 70 ? "primary.main" : "warning.main"
                  }
                }
              }
            )
          ] }),
          /* @__PURE__ */ r.jsx(v, { children: /* @__PURE__ */ r.jsx(oe, { users: u.assignedUsers, max: 3 }) })
        ] })
      ] }) }),
      re && c.has(u.id) && /* @__PURE__ */ r.jsx(v, { sx: { ml: 4 }, children: u.childGoals.map((he) => Re(he, I + 1)) })
    ] }, u.id);
  }, Pe = () => /* @__PURE__ */ r.jsx(Ft, { component: Tr, sx: { mt: 2 }, children: /* @__PURE__ */ r.jsxs(Ht, { children: [
    /* @__PURE__ */ r.jsx(Yt, { children: /* @__PURE__ */ r.jsxs(sr, { children: [
      /* @__PURE__ */ r.jsx(ae, { children: "Goal Description" }),
      /* @__PURE__ */ r.jsx(ae, { children: "Owner" }),
      /* @__PURE__ */ r.jsx(ae, { children: "Status" }),
      /* @__PURE__ */ r.jsx(ae, { children: "Created" }),
      /* @__PURE__ */ r.jsx(ae, { children: "Assigned To" }),
      /* @__PURE__ */ r.jsx(ae, { children: "Child Goals" }),
      /* @__PURE__ */ r.jsx(ae, { children: "Actions" })
    ] }) }),
    /* @__PURE__ */ r.jsx(qt, { children: Y.map((u) => /* @__PURE__ */ r.jsxs(Pr.Fragment, { children: [
      /* @__PURE__ */ r.jsxs(sr, { children: [
        /* @__PURE__ */ r.jsx(ae, { children: /* @__PURE__ */ r.jsxs(v, { children: [
          /* @__PURE__ */ r.jsx(m, { variant: "body1", fontWeight: 500, children: u.shortDescription }),
          /* @__PURE__ */ r.jsxs(m, { variant: "caption", color: "text.secondary", children: [
            u.longDescription.substring(0, 100),
            "..."
          ] })
        ] }) }),
        /* @__PURE__ */ r.jsx(ae, { children: /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ r.jsx($e, { sx: { width: 32, height: 32, bgcolor: "primary.main" }, children: u.owner.firstName[0] }),
          /* @__PURE__ */ r.jsxs(v, { children: [
            /* @__PURE__ */ r.jsxs(m, { variant: "body2", children: [
              u.owner.firstName,
              " ",
              u.owner.lastName
            ] }),
            /* @__PURE__ */ r.jsx(m, { variant: "caption", color: "text.secondary", children: u.owner.title })
          ] })
        ] }) }),
        /* @__PURE__ */ r.jsx(ae, { children: /* @__PURE__ */ r.jsx(
          Ae,
          {
            label: $[u.status].label,
            color: $[u.status].color,
            icon: $[u.status].icon,
            size: "small"
          }
        ) }),
        /* @__PURE__ */ r.jsx(ae, { children: b(u.creationDate) }),
        /* @__PURE__ */ r.jsx(ae, { children: /* @__PURE__ */ r.jsx(oe, { users: u.assignedUsers, max: 3 }) }),
        /* @__PURE__ */ r.jsx(ae, { children: /* @__PURE__ */ r.jsx(
          Ae,
          {
            label: `${u.childGoals.length} child${u.childGoals.length !== 1 ? "ren" : ""}`,
            variant: "outlined",
            size: "small",
            onClick: () => E(u.id),
            icon: c.has(u.id) ? /* @__PURE__ */ r.jsx(ot, {}) : /* @__PURE__ */ r.jsx(st, {})
          }
        ) }),
        /* @__PURE__ */ r.jsx(ae, { children: /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", gap: 1 }, children: [
          /* @__PURE__ */ r.jsx(qe, { title: "View Details", children: /* @__PURE__ */ r.jsx(_e, { size: "small", onClick: () => xe(u), children: /* @__PURE__ */ r.jsx(Jt, {}) }) }),
          /* @__PURE__ */ r.jsx(qe, { title: "Delete", children: /* @__PURE__ */ r.jsx(_e, { size: "small", onClick: () => De(u.id), color: "error", children: /* @__PURE__ */ r.jsx(Xt, {}) }) })
        ] }) })
      ] }),
      u.childGoals.length > 0 && c.has(u.id) && /* @__PURE__ */ r.jsx(sr, { children: /* @__PURE__ */ r.jsxs(ae, { colSpan: 7, sx: { backgroundColor: "grey.50", py: 2 }, children: [
        /* @__PURE__ */ r.jsx(m, { variant: "subtitle2", gutterBottom: !0, children: "Child Goals" }),
        /* @__PURE__ */ r.jsx(v, { sx: { ml: 2 }, children: u.childGoals.map((I) => /* @__PURE__ */ r.jsx(ve, { variant: "outlined", sx: { mb: 1 }, children: /* @__PURE__ */ r.jsx(je, { sx: { py: 1 }, children: /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ r.jsxs(v, { children: [
            /* @__PURE__ */ r.jsx(m, { variant: "body2", fontWeight: 500, children: I.shortDescription }),
            /* @__PURE__ */ r.jsx(
              Ae,
              {
                label: $[I.status].label,
                color: $[I.status].color,
                size: "small",
                sx: { mt: 0.5 }
              }
            )
          ] }),
          /* @__PURE__ */ r.jsxs(m, { variant: "caption", color: "text.secondary", children: [
            "Owner: ",
            I.owner.firstName,
            " ",
            I.owner.lastName
          ] })
        ] }) }) }, I.id)) })
      ] }) })
    ] }, u.id)) })
  ] }) });
  return /* @__PURE__ */ r.jsxs(v, { children: [
    /* @__PURE__ */ r.jsxs(v, { sx: { mb: 4 }, children: [
      /* @__PURE__ */ r.jsx(m, { variant: "h1", gutterBottom: !0, children: "Goals Management" }),
      /* @__PURE__ */ r.jsx(m, { variant: "h5", color: "text.secondary", sx: { mb: 3 }, children: "Define, track, and manage organizational goals with hierarchical structure." })
    ] }),
    /* @__PURE__ */ r.jsxs(ee, { container: !0, spacing: 3, sx: { mb: 4 }, children: [
      /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 12, sm: 6, md: 2.4, children: /* @__PURE__ */ r.jsx(ve, { children: /* @__PURE__ */ r.jsxs(je, { children: [
        /* @__PURE__ */ r.jsx(m, { color: "textSecondary", gutterBottom: !0, children: "Total Goals" }),
        /* @__PURE__ */ r.jsx(m, { variant: "h3", fontWeight: 700, children: e.length }),
        /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", children: "All statuses" })
      ] }) }) }),
      /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 12, sm: 6, md: 2.4, children: /* @__PURE__ */ r.jsx(ve, { children: /* @__PURE__ */ r.jsxs(je, { children: [
        /* @__PURE__ */ r.jsx(m, { color: "textSecondary", gutterBottom: !0, children: "Published" }),
        /* @__PURE__ */ r.jsx(m, { variant: "h3", fontWeight: 700, color: "primary.main", children: e.filter((u) => u.status === "PUBLISHED").length }),
        /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", children: "Active goals" })
      ] }) }) }),
      /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 12, sm: 6, md: 2.4, children: /* @__PURE__ */ r.jsx(ve, { children: /* @__PURE__ */ r.jsxs(je, { children: [
        /* @__PURE__ */ r.jsx(m, { color: "textSecondary", gutterBottom: !0, children: "Achieved" }),
        /* @__PURE__ */ r.jsx(m, { variant: "h3", fontWeight: 700, color: "success.main", children: e.filter((u) => u.status === "ACHIEVED").length }),
        /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", children: "Completed" })
      ] }) }) }),
      /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 12, sm: 6, md: 2.4, children: /* @__PURE__ */ r.jsx(ve, { children: /* @__PURE__ */ r.jsxs(je, { children: [
        /* @__PURE__ */ r.jsx(m, { color: "textSecondary", gutterBottom: !0, children: "In Draft" }),
        /* @__PURE__ */ r.jsx(m, { variant: "h3", fontWeight: 700, color: "default", children: e.filter((u) => u.status === "DRAFT").length }),
        /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", children: "Pending approval" })
      ] }) }) }),
      /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 12, sm: 6, md: 2.4, children: /* @__PURE__ */ r.jsx(ve, { children: /* @__PURE__ */ r.jsxs(je, { children: [
        /* @__PURE__ */ r.jsx(m, { color: "textSecondary", gutterBottom: !0, children: "Hierarchical" }),
        /* @__PURE__ */ r.jsx(m, { variant: "h3", fontWeight: 700, color: "info.main", children: e.filter((u) => u.childGoals.length > 0).length }),
        /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", children: "With child goals" })
      ] }) }) })
    ] }),
    /* @__PURE__ */ r.jsx(ve, { sx: { mb: 3 }, children: /* @__PURE__ */ r.jsxs(je, { children: [
      /* @__PURE__ */ r.jsxs(ee, { container: !0, spacing: 2, alignItems: "center", children: [
        /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 12, md: 4, children: /* @__PURE__ */ r.jsx(
          An,
          {
            fullWidth: !0,
            placeholder: "Search goals...",
            value: n,
            onChange: (u) => o(u.target.value),
            InputProps: {
              startAdornment: /* @__PURE__ */ r.jsx(Bo, { position: "start", children: /* @__PURE__ */ r.jsx($n, {}) })
            }
          }
        ) }),
        /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 12, sm: 6, md: 2, children: /* @__PURE__ */ r.jsxs(Bt, { fullWidth: !0, children: [
          /* @__PURE__ */ r.jsx(Vt, { children: "Status" }),
          /* @__PURE__ */ r.jsxs(
            zt,
            {
              value: s,
              label: "Status",
              onChange: (u) => a(u.target.value),
              children: [
                /* @__PURE__ */ r.jsx(Er, { value: "all", children: "All Status" }),
                X.map((u) => /* @__PURE__ */ r.jsx(Er, { value: u, children: $[u].label }, u))
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 12, sm: 6, md: 2, children: /* @__PURE__ */ r.jsxs(Bt, { fullWidth: !0, children: [
          /* @__PURE__ */ r.jsx(Vt, { children: "Owner" }),
          /* @__PURE__ */ r.jsxs(
            zt,
            {
              value: l,
              label: "Owner",
              onChange: (u) => d(u.target.value),
              children: [
                /* @__PURE__ */ r.jsx(Er, { value: "all", children: "All Owners" }),
                fe.map((u) => /* @__PURE__ */ r.jsxs(Er, { value: u.id, children: [
                  u.firstName,
                  " ",
                  u.lastName
                ] }, u.id))
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 12, sm: 6, md: 2, children: /* @__PURE__ */ r.jsx(
          We,
          {
            fullWidth: !0,
            variant: "outlined",
            onClick: () => M(_ === "list" ? "hierarchy" : "list"),
            startIcon: _ === "list" ? /* @__PURE__ */ r.jsx(ds, {}) : /* @__PURE__ */ r.jsx(fs, {}),
            children: _ === "list" ? "Hierarchy View" : "List View"
          }
        ) }),
        /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 12, sm: 6, md: 2 })
      ] }),
      /* @__PURE__ */ r.jsx(v, { sx: { mt: 3 }, children: /* @__PURE__ */ r.jsxs(Vo, { value: x, onChange: (u, I) => j(I), children: [
        /* @__PURE__ */ r.jsx(wr, { label: "All Goals" }),
        /* @__PURE__ */ r.jsx(wr, { label: "My Goals" }),
        /* @__PURE__ */ r.jsx(wr, { label: "Team Goals" }),
        /* @__PURE__ */ r.jsx(wr, { label: "Root Goals" })
      ] }) })
    ] }) }),
    Y.length === 0 ? /* @__PURE__ */ r.jsx(ve, { children: /* @__PURE__ */ r.jsxs(je, { sx: { textAlign: "center", py: 8 }, children: [
      /* @__PURE__ */ r.jsx(m, { variant: "h6", color: "text.secondary", gutterBottom: !0, children: "No goals found" }),
      /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: "Try adjusting your search or filters" }),
      /* @__PURE__ */ r.jsx(
        We,
        {
          variant: "outlined",
          onClick: () => {
            o(""), a("all"), d("all");
          },
          children: "Clear All Filters"
        }
      )
    ] }) }) : /* @__PURE__ */ r.jsx(v, { children: _ === "list" ? Pe() : /* @__PURE__ */ r.jsx(v, { children: Y.map((u) => Re(u)) }) }),
    /* @__PURE__ */ r.jsx(
      zo,
      {
        open: g,
        onClose: () => S(!1),
        maxWidth: "md",
        fullWidth: !0,
        children: w && /* @__PURE__ */ r.jsxs(r.Fragment, { children: [
          /* @__PURE__ */ r.jsxs(Fo, { children: [
            /* @__PURE__ */ r.jsx(m, { variant: "h5", component: "div", children: w.shortDescription }),
            /* @__PURE__ */ r.jsxs(m, { variant: "body2", color: "text.secondary", children: [
              "ID: ",
              w.id
            ] })
          ] }),
          /* @__PURE__ */ r.jsx(Ho, { children: /* @__PURE__ */ r.jsxs(Yo, { spacing: 3, children: [
            /* @__PURE__ */ r.jsxs(v, { children: [
              /* @__PURE__ */ r.jsx(m, { variant: "subtitle2", color: "text.secondary", gutterBottom: !0, children: "Basic Information" }),
              /* @__PURE__ */ r.jsxs(ee, { container: !0, spacing: 2, children: [
                /* @__PURE__ */ r.jsxs(ee, { item: !0, xs: 6, children: [
                  /* @__PURE__ */ r.jsx(m, { variant: "body2", children: /* @__PURE__ */ r.jsx("strong", { children: "Status:" }) }),
                  /* @__PURE__ */ r.jsx(
                    Ae,
                    {
                      label: $[w.status].label,
                      color: $[w.status].color,
                      icon: $[w.status].icon,
                      sx: { mt: 0.5 }
                    }
                  )
                ] }),
                /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 6, children: /* @__PURE__ */ r.jsxs(m, { variant: "body2", children: [
                  /* @__PURE__ */ r.jsx("strong", { children: "Created:" }),
                  " ",
                  b(w.creationDate)
                ] }) }),
                w.completionDate && /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 6, children: /* @__PURE__ */ r.jsxs(m, { variant: "body2", children: [
                  /* @__PURE__ */ r.jsx("strong", { children: "Completed:" }),
                  " ",
                  b(w.completionDate)
                ] }) }),
                /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 6, children: /* @__PURE__ */ r.jsxs(m, { variant: "body2", children: [
                  /* @__PURE__ */ r.jsx("strong", { children: "Child Goals:" }),
                  " ",
                  w.childGoals.length
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ r.jsxs(v, { children: [
              /* @__PURE__ */ r.jsx(m, { variant: "subtitle2", color: "text.secondary", gutterBottom: !0, children: "Description" }),
              /* @__PURE__ */ r.jsx(m, { variant: "body2", children: w.longDescription })
            ] }),
            /* @__PURE__ */ r.jsxs(v, { children: [
              /* @__PURE__ */ r.jsx(m, { variant: "subtitle2", color: "text.secondary", gutterBottom: !0, children: "Goal Owner" }),
              /* @__PURE__ */ r.jsx(ve, { variant: "outlined", children: /* @__PURE__ */ r.jsx(je, { children: /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                /* @__PURE__ */ r.jsxs($e, { sx: { width: 56, height: 56, bgcolor: "primary.main" }, children: [
                  w.owner.firstName[0],
                  w.owner.lastName[0]
                ] }),
                /* @__PURE__ */ r.jsxs(v, { children: [
                  /* @__PURE__ */ r.jsxs(m, { variant: "h6", children: [
                    w.owner.firstName,
                    " ",
                    w.owner.lastName
                  ] }),
                  /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", children: w.owner.title }),
                  /* @__PURE__ */ r.jsx(m, { variant: "body2", color: "text.secondary", children: w.owner.email })
                ] })
              ] }) }) })
            ] }),
            w.assignedUsers.length > 0 && /* @__PURE__ */ r.jsxs(v, { children: [
              /* @__PURE__ */ r.jsxs(m, { variant: "subtitle2", color: "text.secondary", gutterBottom: !0, children: [
                "Assigned Users (",
                w.assignedUsers.length,
                ")"
              ] }),
              /* @__PURE__ */ r.jsx(ee, { container: !0, spacing: 2, children: w.assignedUsers.map((u) => /* @__PURE__ */ r.jsx(ee, { item: !0, xs: 12, sm: 6, children: /* @__PURE__ */ r.jsx(ve, { variant: "outlined", children: /* @__PURE__ */ r.jsx(je, { sx: { py: 1 }, children: /* @__PURE__ */ r.jsxs(v, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                /* @__PURE__ */ r.jsx($e, { sx: { width: 40, height: 40, bgcolor: "secondary.main" }, children: u.firstName[0] }),
                /* @__PURE__ */ r.jsxs(v, { children: [
                  /* @__PURE__ */ r.jsxs(m, { variant: "body2", children: [
                    u.firstName,
                    " ",
                    u.lastName
                  ] }),
                  /* @__PURE__ */ r.jsx(m, { variant: "caption", color: "text.secondary", children: u.title })
                ] })
              ] }) }) }) }, u.id)) })
            ] }),
            w.childGoals.length > 0 && /* @__PURE__ */ r.jsxs(v, { children: [
              /* @__PURE__ */ r.jsxs(m, { variant: "subtitle2", color: "text.secondary", gutterBottom: !0, children: [
                "Child Goals (",
                w.childGoals.length,
                ")"
              ] }),
              /* @__PURE__ */ r.jsx(Ft, { component: Tr, variant: "outlined", children: /* @__PURE__ */ r.jsxs(Ht, { size: "small", children: [
                /* @__PURE__ */ r.jsx(Yt, { children: /* @__PURE__ */ r.jsxs(sr, { children: [
                  /* @__PURE__ */ r.jsx(ae, { children: "Description" }),
                  /* @__PURE__ */ r.jsx(ae, { children: "Status" }),
                  /* @__PURE__ */ r.jsx(ae, { children: "Owner" })
                ] }) }),
                /* @__PURE__ */ r.jsx(qt, { children: w.childGoals.map((u) => /* @__PURE__ */ r.jsxs(sr, { children: [
                  /* @__PURE__ */ r.jsx(ae, { children: u.shortDescription }),
                  /* @__PURE__ */ r.jsx(ae, { children: /* @__PURE__ */ r.jsx(
                    Ae,
                    {
                      label: $[u.status].label,
                      color: $[u.status].color,
                      size: "small"
                    }
                  ) }),
                  /* @__PURE__ */ r.jsxs(ae, { children: [
                    u.owner.firstName,
                    " ",
                    u.owner.lastName
                  ] })
                ] }, u.id)) })
              ] }) })
            ] }),
            /* @__PURE__ */ r.jsx(qo, { severity: "info", children: /* @__PURE__ */ r.jsxs(m, { variant: "body2", children: [
              /* @__PURE__ */ r.jsx("strong", { children: "API Integration Ready:" }),
              " This component is built to match your GraphQL schema. Replace mock data with API calls to `goals`, `goalsByOwner`, and `rootGoals` queries."
            ] }) })
          ] }) }),
          /* @__PURE__ */ r.jsxs(Ko, { children: [
            /* @__PURE__ */ r.jsx(We, { onClick: () => S(!1), children: "Close" }),
            /* @__PURE__ */ r.jsx(
              We,
              {
                variant: "contained",
                onClick: () => alert("Edit functionality will be implemented with API integration"),
                children: "Edit Goal"
              }
            )
          ] })
        ] })
      }
    )
  ] });
};
function Qa() {
  return /* @__PURE__ */ r.jsxs(wt, { theme: Ba, children: [
    /* @__PURE__ */ r.jsx(Ct, {}),
    /* @__PURE__ */ r.jsx(kn, { children: /* @__PURE__ */ r.jsx(Ka, { children: /* @__PURE__ */ r.jsxs(Io, { children: [
      /* @__PURE__ */ r.jsx(or, { path: "/", element: /* @__PURE__ */ r.jsx(Va, {}) }),
      /* @__PURE__ */ r.jsx(or, { path: "/dashboard", element: /* @__PURE__ */ r.jsx("div", { children: "Dashboard Page" }) }),
      /* @__PURE__ */ r.jsx(or, { path: "/performance", element: /* @__PURE__ */ r.jsx("div", { children: "Performance Page" }) }),
      /* @__PURE__ */ r.jsx(or, { path: "/reports", element: /* @__PURE__ */ r.jsx("div", { children: "Reports Page" }) }),
      /* @__PURE__ */ r.jsx(or, { path: "/goals", element: /* @__PURE__ */ r.jsx(Xa, {}) })
    ] }) }) })
  ] });
}
const Za = Et({
  palette: {
    primary: {
      main: "#1a237e",
      // SIDGS blue
      light: "#534bae",
      dark: "#000051",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#00b0ff",
      // SIDGS accent blue
      light: "#69e2ff",
      dark: "#0081cb",
      contrastText: "#000000"
    },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff"
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "3.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      color: "#1a237e"
    },
    h2: {
      fontSize: "2.5rem",
      fontWeight: 600,
      lineHeight: 1.3,
      color: "#1a237e"
    }
  },
  shape: {
    borderRadius: 8
  }
}), il = () => /* @__PURE__ */ r.jsxs(wt, { theme: Za, children: [
  /* @__PURE__ */ r.jsx(Ct, {}),
  /* @__PURE__ */ r.jsx(kn, { children: /* @__PURE__ */ r.jsx(Qa, {}) })
] });
export {
  Qa as App,
  qa as Breadcrumbs,
  Ya as Footer,
  Xa as GoalsPage,
  Fa as Header,
  Va as HomePage,
  Ka as Layout,
  il as SIDGSPerformanceApp,
  Ha as SideNavigation,
  il as default,
  Za as sidgsTheme
};
//# sourceMappingURL=sidgs-performance.es.js.map
