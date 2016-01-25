# URI.js [![Build Status](https://travis-ci.org/uupaa/URI.js.svg)](https://travis-ci.org/uupaa/URI.js)

[![npm](https://nodei.co/npm/uupaa.uri.js.svg?downloads=true&stars=true)](https://nodei.co/npm/uupaa.uri.js/)

URL parse and build.


This module made of [WebModule](https://github.com/uupaa/WebModule).

## Documentation
- [Spec](https://github.com/uupaa/URI.js/wiki/)
- [API Spec](https://github.com/uupaa/URI.js/wiki/URI)

## Browser, NW.js and Electron

```js
<script src="<module-dir>/lib/WebModule.js"></script>
<script src="<module-dir>/lib/URI.js"></script>
<script>
var urlObject = URI("http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash");

// urlObject = {
//     href:       "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash",
//     protocol:   "http:",
//     origin:     "http://example.com:8080",
//     host:       "example.com:8080",
//     hostname:   "example.com",
//     port:       "8080",
//     username:   "user",
//     password:   "pass",
//     pathname:   "/dir1/dir2/file.ext",
//     search:     "?a=b;c=d",
//     hash:       "#hash",
//     // --- extras properties ---
//     scheme:     "http:",
//     path:       "/dir1/dir2/file.ext?a=b;c=d",
//     dir:        "/dir1/dir2/",                // [!] has last slash
//     file:       "file.ext",
//     fragment:   "#fragment"
// };

</script>
```

## WebWorkers

```js
importScripts("<module-dir>lib/WebModule.js");
importScripts("<module-dir>lib/URI.js");

```

## Node.js

```js
require("<module-dir>lib/WebModule.js");
require("<module-dir>lib/URI.js");

```

