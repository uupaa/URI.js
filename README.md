# URI.js [![Build Status](https://travis-ci.org/uupaa/URI.js.png)](http://travis-ci.org/uupaa/URI.js)

[![npm](https://nodei.co/npm/uupaa.uri.js.png?downloads=true&stars=true)](https://nodei.co/npm/uupaa.uri.js/)

URL parse and build.

## Document

- [URI.js wiki](https://github.com/uupaa/URI.js/wiki/URI)
- [WebModule](https://github.com/uupaa/WebModule)
    - [Slide](http://uupaa.github.io/Slide/slide/WebModule/index.html)
    - [Development](https://github.com/uupaa/WebModule/wiki/Development)

## Run on

### Browser and node-webkit

```js
<script src="lib/URI.js"></script>
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

### WebWorkers

```js
importScripts("lib/URI.js");

```

### Node.js

```js
require("lib/URI.js");

```

