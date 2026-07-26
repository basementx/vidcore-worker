// Vidcore stream URL extractor worker
// This worker runs vidcore.net's obfuscated code to decrypt the en token
// and extract server/stream data. Fetch requests are proxied to the page
// via postMessage (the page uses superFetch to make the actual API call).

var fetchCallback = null;

self.onmessage = async function(e) {
  if (e.data.type === 'chunks') {
    var webpackCode = e.data.webpack;
    var code281 = e.data.code281;
    var chunkCodes = e.data.chunkCodes;
    var en = e.data.en;

    self.window = self;
    self.parent = self;
    self.top = self;

    var origPostMessage = self.postMessage.bind(self);
    self.postMessage = function(data, origin) {
      origPostMessage({type: 'postMessage', data: data});
    };

    Object.defineProperty(self, 'document', { value: {
      createElement: () => ({ style: {}, appendChild: () => {}, setAttribute: () => {}, addEventListener: () => {}, removeChild: () => {} }),
      querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
      body: { appendChild: () => {} }, head: { appendChild: () => {} },
      addEventListener: () => {}, removeEventListener: () => {}, cookie: '',
      hidden: false, visibilityState: 'visible',
    }, writable: true, configurable: true });
    Object.defineProperty(self, 'screen', { value: { width: 1920, height: 1080 }, writable: true, configurable: true });
    Object.defineProperty(self, 'localStorage', { value: { getItem: () => null, setItem: () => {}, removeItem: () => {} }, writable: true, configurable: true });
    Object.defineProperty(self, 'location', { value: { href: 'https://vidcore.net/movie/1198994', hostname: 'vidcore.net', pathname: '/movie/1198994', origin: 'https://vidcore.net' }, writable: true, configurable: true });

    self.VTTCue = class VTTCue { constructor() {} };
    self.VTTRegion = class VTTRegion {};
    self.EventTarget = class EventTarget { addEventListener() {} removeEventListener() {} dispatchEvent() { return true; } };

    // Intercept fetch: send to page and wait for response
    self.fetch = async function(url, opts) {
      var urlStr = typeof url === 'string' ? url : (url && url.url ? url.url : String(url));
      if (urlStr.startsWith('/') && !urlStr.includes('fetch-plugin')) {
        var fetchId = Math.random().toString(36);
        origPostMessage({type: 'fetch', fetchId: fetchId, url: urlStr, method: (opts && opts.method) || 'GET', headers: opts && opts.headers, body: opts && opts.body});
        return new Promise(function(resolve, reject) {
          var handler = function(ev) {
            if (ev.data.type === 'fetchResponse' && ev.data.fetchId === fetchId) {
              self.removeEventListener('message', handler);
              resolve({
                ok: ev.data.status >= 200 && ev.data.status < 300,
                status: ev.data.status,
                text: async () => ev.data.body,
                json: async () => JSON.parse(ev.data.body),
                arrayBuffer: async () => new ArrayBuffer(0),
                headers: { get: () => null },
              });
            }
          };
          self.addEventListener('message', handler);
        });
      }
      return fetch(url, opts);
    };

    var patchedWebpack = webpackCode.replace('"use strict";var e={},t={};', '"use strict";var e={},t={};self.__wp_require=r;self.__wp_modules=e;self.__wp_cache=t;');
    eval(patchedWebpack);

    self.webpackChunk_N_E = self.webpackChunk_N_E || [];
    for (var name in chunkCodes) { try { eval(chunkCodes[name]); } catch(ex) { origPostMessage({type: 'error', msg: 'chunk ' + name + ': ' + ex.message}); } }
    var chunksCopy = self.webpackChunk_N_E.splice(0);
    for (var chunk of chunksCopy) self.webpackChunk_N_E.push(chunk);

    var patched281 = code281;
    patched281 = patched281.replace('new.target,this)}i4[i2(1327,', 'new.target,this)}self.__vc_ag=ag;i4[i2(1327,');
    patched281 = patched281.replace('.join("")}iq.from(', '.join("")}self.__vc_iI=iI;iq.from(');
    patched281 = patched281.replace('function l(t){if(t in W)return W[t];if(t in af)return af[t];throw Error(t)}', 'function l(t){if(t in W)return W[t];try{if(typeof af!=="undefined"&&t in af)return af[t]}catch(ex){}if(typeof self!=="undefined"&&t in self)return self[t];throw Error(t)}');
    patched281 = patched281.replace('setServers:W6,', 'setServers:function(servers){self.__vc_servers=servers;origPostMessage({type: "servers", servers: servers});},');
    patched281 = patched281.replace('Buffer:typeof ij!==iE(419)?ij:void 0}', 'Buffer:typeof ij!==iE(419)?ij:void 0,AbortController:AbortController,AbortSignal:AbortSignal,TextEncoder:TextEncoder,TextDecoder:TextDecoder,URL:URL,URLSearchParams:URLSearchParams,Blob:Blob,File:File,FormData:FormData,Headers:Headers,Request:Request,Response:Response,fetch:fetch,atob:atob,btoa:btoa,crypto:crypto,performance:performance,VTTCue:VTTCue,VTTRegion:VTTRegion,EventTarget:EventTarget}');

    eval(patched281);

    var chunksAfter = self.webpackChunk_N_E.slice();
    for (var chunk of chunksAfter) { if (chunk[1]) { for (var modId in chunk[1]) { if (!self.__wp_modules[modId]) self.__wp_modules[modId] = chunk[1][modId]; } } }

    var req = self.__wp_require;
    var bufferMod = req(5376);
    self.Buffer = bufferMod.Buffer;

    var reactStub = {
      createElement: () => null, Fragment: 'Fragment',
      useState: () => [null, () => {}], useEffect: () => {}, useRef: () => ({ current: null }),
      useCallback: (fn) => fn, useMemo: (fn) => fn(), useContext: () => ({}),
      useLayoutEffect: () => {}, useReducer: () => [null, () => {}],
      createContext: () => ({ Provider: () => null, Consumer: () => null, _currentValue: null }),
      Component: function() {}, PureComponent: function() {},
      memo: (fn) => fn, forwardRef: (fn) => fn, lazy: (fn) => fn,
      Suspense: () => null, Children: { map: () => [], forEach: () => {}, count: () => 0, only: () => null, toArray: () => [] },
      version: '18.3.1', cloneElement: () => null, isValidElement: () => false,
      createRef: () => ({ current: null }), useId: () => 'id',
      useDebugValue: () => {}, useDeferredValue: (v) => v, useTransition: () => [false, () => {}],
      useSyncExternalStore: () => null, useImperativeHandle: () => {},
      startTransition: (fn) => fn(), StrictMode: () => null,
    };

    self.__wp_modules[2115] = function(module) { module.exports = reactStub; };
    self.__wp_modules[5155] = function(module) { module.exports = { jsx: () => null, jsxs: () => null, Fragment: 'Fragment' }; };
    self.__wp_modules[63] = function(module) {
      module.exports = {
        useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }),
        usePathname: () => '/movie/1198994',
        useSearchParams: () => new URLSearchParams(''),
        useParams: () => ({ id: '1198994' }),
      };
    };
    for (var id of [2115, 5155, 63, 9987]) delete self.__wp_cache[id];

    req(9987);
    origPostMessage({type: 'ready', agExposed: typeof self.__vc_ag === 'function'});

    self.__vc_servers = null;
    var cryptoMod = req(3018);

    try {
      var promise = self.__vc_ag({
        crypto: cryptoMod, encode: self.__vc_iI, server: function(t) { return t; },
        setServers: function(servers) {
          self.__vc_servers = servers;
          origPostMessage({type: 'servers', servers: servers});
        },
        setState: function() {}, setFavServer: function() {},
        window: self, document: self.document, navigator: self.navigator,
        localStorage: self.localStorage, console: console,
        JSON: JSON, Math: Math, Date: Date, RegExp: RegExp, Map: Map, Set: Set,
        WeakMap: WeakMap, WeakSet: WeakSet, Array: Array, Object: Object,
        Number: Number, String: String, Boolean: Boolean, Symbol: Symbol,
        Function: Function, screen: self.screen, Error: Error, TypeError: TypeError,
        RangeError: RangeError, SyntaxError: SyntaxError, parseInt: parseInt,
        parseFloat: parseFloat, en: en, isNaN: isNaN, isFinite: isFinite,
        encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
        NaN: NaN, Infinity: 1/0, undefined: void 0, Promise: Promise, Proxy: Proxy,
        Reflect: Reflect, Uint8Array: Uint8Array, Int8Array: Int8Array,
        Uint16Array: Uint16Array, Int16Array: Int16Array, Uint32Array: Uint32Array,
        Int32Array: Int32Array, Float32Array: Float32Array, Float64Array: Float64Array,
        BigInt: BigInt, fetch: fetch, TextEncoder: TextEncoder, TextDecoder: TextDecoder,
        URL: URL, URLSearchParams: URLSearchParams, AbortSignal: AbortSignal,
        AbortController: AbortController, Buffer: self.Buffer, atob: atob, btoa: btoa,
      });

      if (promise && typeof promise.then === 'function') {
        await promise.catch(function(ex) { origPostMessage({type: 'error', msg: 'ag promise: ' + ex.message}); });
      }
      origPostMessage({type: 'agCompleted'});
    } catch(ex) {
      origPostMessage({type: 'error', msg: 'ag call: ' + ex.message});
    }
  }
};
