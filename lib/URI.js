(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("URI", function moduleClosure(global, WebModule, VERIFY/*, VERBOSE */) {
"use strict";

// --- technical terms / data structure --------------------
/*
- URLObject
    - https://github.com/uupaa/URI.js/wiki/URLObject

    ```js
        var urlObject = URI.parse("http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash");
        urlObject = {
            href:         "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash",
            prefix:       "",
            protocol:     "http:",
            origin:       "http://example.com:8080",
            host:         "example.com:8080",
            hostname:     "example.com",
            port:         "8080",
            username:     "user",
            password:     "pass",
            pathname:     "/dir1/dir2/file.ext",
            search:       "?a=b;c=d",
            hash:         "#hash",
            // --- extras properties ---
            params:       new URISearchParams("a=b;c=d"),
            scheme:       "http:",
            path:         "/dir1/dir2/file.ext?a=b;c=d",
            dir:          "/dir1/dir2/",                // [!] has last slash
            file:         "file.ext",
            fragment:     "#fragment"
        };
    ```

- BlobURL
    - https://w3c.github.io/FileAPI/#DefinitionOfScheme
 */
// --- dependency modules ----------------------------------
var URISearchParams = WebModule["URISearchParams"];
// --- import / local extract functions --------------------
// --- define / local variables ----------------------------
var PORT_NUMBER = { "http:": "80", "https:": "443", "ws:": "81", "wss:": "816" };
var REGEXP_URL  = /^([\w\+\-\.]+:)\/\/(?:(?:([\w:]+)@)?([^\/:]+)(?::(\d*))?)([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/;
                //  ~~~~~~~~~~~~~~        ~~~~~~~~~~ ~~~~~~~~~   ~~~~~~~    ~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //  https://              user:pass@ server      :port      /dir/f.ext  ?key=value    #hash
                //  [1]                   [2]        [3]          [4]       [5]         [6]           [7]

var REGEXP_FILE = /^(file:)\/\/(localhost)?([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/i;
                //  ~~~~~~~    ~~~~~~~~~~~ ~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //              localhost  /dir/f.ext  ?key=value    #hash
                //  [1]         [2]        [3]         [4]           [5]

var REGEXP_PATH = /^([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/;
                //  ~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //  /dir/f.ext  key=value     hash
                //  [1]         [2]           [3]
var REGEXP_BLOB = /^blob:/i;
var REGEXP_PROTOCOL = /^([\w\+\-\.]+:)/i;
var REGEXP_DRIVE_LETTER = /^[a-z]:/i;

var _cacheBustingFlavor = +("" + Date.now()).slice(-4);

var _basePath = (IN_BROWSER || IN_NW) ? location.href.slice(0, location.href.lastIndexOf("/"))
                                      : "";

// --- class / interfaces ----------------------------------
function URI(url) { // @ret URLString
                    // @ret URLObject - URI.parse(urlString) result
                    // @desc parse URL
    return URI.parse(url);
}

URI["repository"] = "https://github.com/uupaa/URI.js";
URI["isValid"]    = URI_isValid;        // URI.isValid(url:URLString|URLStringArray, canonical:Boolean = false):Boolean
URI["parse"]      = URI_parse;          // URI.parse(url:URLString):URLObject
URI["build"]      = URI_build;          // URI.build(obj:URLObject):URLString
URI["match"]      = URI_match;          // URI.match(pattern:URLString|PatternURLString, target:URLString):Boolean
URI["getDir"]     = URI_getDir;         // URI.getDir(url:URLString|URLObject):URLString
URI["getExt"]     = URI_getExt;         // URI.getExt(url:URLString|URLObject):ExtensionString
URI["getFileExt"] = URI_getFileExt;     // URI.getFileExt(url:URLString|URLObject):FileExtensionString
URI["resolve"]    = URI_resolve;        // URI.resolve(url:URLString, basePath:URLString = ""):URLString
URI["normalize"]  = URI_normalize;      // URI.normalize(url:URLString):URLString
URI["isBlob"]     = URI_isBlob;         // URI.isBlob(url:URLString):Boolean
URI["getBaseURL"] = URI_getBaseURL;     // URI.getBaseURL(url:URLString|URLObject):URLString
URI["isAbsolute"] = URI_isAbsolute;     // URI.isAbsolute(url:URLString):Boolean
URI["isRelative"] = URI_isRelative;     // URI.isRelative(url:URLString):Boolean
URI["buildQuery"] = URI_buildQuery;     // URI.buildQuery(url:URLQueryObject, joint:String = "&"):URLQueryString
URI["parseQuery"] = URI_parseQuery;     // URI.parseQuery(queryString:URLString/URLQueryString):URLQueryObject
URI["getProtocol"] = URI_getProtocol;   // URI.getProtocol(url:URLString):ProtocolString
URI["addCacheBustingKeyword"] = URI_addCacheBustingKeyword; // URI.addCacheBustingKeyword(url:URLString, keyword:String = "t"):URLString
URI["decode"]     = URI_decode;         // URI.decode(source:String):String
URI["encode"]     = URI_encode;         // URI.encode(source:String):String

// --- implements ------------------------------------------
function URI_isValid(url,         // @arg URLString|URLStringArray - absolute/relative url(s)
                     canonical) { // @arg Boolean = false - TBD
                                  // @ret Boolean
                                  // @desc validate URL
//{@dev
    if (VERIFY) {
        $valid(typeof url === "string" || Array.isArray(url), URI_isValid, "url");
    }
    if (canonical) {
        console.warn("canonical is not impl");
    }
//}@dev

    var urlArray = Array.isArray(url) ? url : [url];

    for (var i = 0, iz = urlArray.length; i < iz; ++i) {
        if ( !_parse(urlArray[i], true) ) {
            return false;
        }
    }
    return true;
}

function URI_parse(url) { // @arg URLString - absolute url or relative url
                          // @ret URLObject - { href, ... hash }
                          // @desc parse URL
//{@dev
    if (VERIFY) {
        $valid($type(url, "String"), URI_parse, "url");
    }
//}@dev

    return _parse(url, false) || { "href": url };
}

function _parse(url,        // @arg URLString
                validate) { // @arg Boolean = false
                            // @ret URLObject|null - null is error
    var href = url;
    var m = REGEXP_FILE.exec(url); // "file://..."

    if (m) {
        if ( validate && !_isValidPath(m[3]) ) {
            return null;
        }
        return _createURLObject({
            "href":     url,
            "protocol": (m[1] || "").toLowerCase(),
            "hostname": m[2] || "",
            "port":     "",
            "pathname": m[3] || "",
            "search":   m[4] || "",
            "hash":     m[5] || ""
        }, ["", ""]);
    }

    var blob = REGEXP_BLOB.test(url); // "blob:http://..."
    if (blob) {
        url = url.slice(5);
    }

    m = REGEXP_URL.exec(url); // "scheme://domain..."
    if (m) {
        if ( validate && (!_isValidScheme(m[1]) || !_isValidPath(m[5] || "")) ) {
            return null;
        } else {
            return _createURLObject({
                "href":     href,
                "prefix":   blob ? "blob:" : "", // protocol prefix
                "protocol": m[1].toLowerCase(),
                "hostname": m[3],
              //"port":     m[4] ? m[4] : (PORT_NUMBER[m[1].toLowerCase()] || ""),
                "port":     m[4] || "",
                "pathname": m[5] || "",
                "search":   m[6] || "",
                "hash":     m[7] || ""
            }, (m[2] || ":").split(":")); // [username, password]
        }
    }
    m = REGEXP_PATH.exec(url); // "...dir/file.ext..."
    if (m) {
        if ( validate && !_isValidPath(m[1]) ) {
            return null;
        }
        return _createURLObject({
            "href":     url,
            "protocol": "",
            "hostname": "",
            "port":     "",
            "pathname": m[1] || "",
            "search":   m[2] || "",
            "hash":     m[3] || ""
        }, ["", ""]);
    }
    return null;
}

function _isValidScheme(scheme) { // @arg String - "http", "https", "ws", "wss", "blob", "file", ...
                                  // @ret Boolean
                                  // @desc http://tools.ietf.org/html/rfc3986#section-3.1
    // scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
    if ( /[^A-Za-z0-9\+\-\.\:]/.test(scheme) ) {
        return false;
    }
    if ( /^[0-9]/.test(scheme) ) {
        return false;
    }
    if ( /[^\:]$/.test(scheme) ) {
        return false;
    }
    return true;
}

function _isValidPath(path) { // @arg String
                              // @ret Boolean
                              // @desc http://tools.ietf.org/html/rfc3986#section-3.3
    // path          = path-abempty / path-absolute
    // path-abempty  = *( "/" segment )
    // path-absolute = "/" [ segment-nz *( "/" segment ) ]
    // segment       = *pchar
    // segment-nz    = 1*pchar
    // pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
    // unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
    // pct-encoded   = "%" HEXDIG HEXDIG
    // sub-delims    = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
    if (path) {
        if ( /\/\//.test(path) ) {
            return false;
        }
        if ( /[^\/\w\-\.\~\%\!\$\&\'\(\)\*\+,;\=\:@]/.test(path) ) {
            return false;
        }
    }
    return true;
}

function _createURLObject(obj,    // @arg URLObject - { href, prefix, protocol, hostname, port, pathname, search, hash }
                          auth) { // @arg StringArray - [username, password]
                                  // @ret URLObject
    var host = obj["port"] ? (obj["hostname"] + ":" + obj["port"]) : obj["hostname"];

    obj["prefix"]   = obj["prefix"] || "";
    obj["origin"]   = obj["protocol"] ? (obj["protocol"] + "//" + host) : host;
    obj["host"]     = host;
    obj["username"] = auth[0];
    obj["password"] = auth[1];

    // --- extras properties ---
    var path = obj["pathname"].split("/"); // "/dir1/dir2/file.ext" -> ["", "dir1", "dir2", "file.ext"]
    var file = path.pop();
    var dir  = path.join("/");

    obj["params"]   = new URISearchParams(obj["search"]);
    obj["scheme"]   = obj["protocol"];
    obj["path"]     = obj["pathname"] + obj["search"]; // + obj["hash"];
    obj["dir"]      = dir;
    obj["file"]     = file;
    obj["fragment"] = obj["hash"];

    return obj;
}

function URI_build(obj) { // @arg URLObject - { prefix, protocol, username, password, hostname, port, pathname, search, hash }
                          // @ret URLString - "http://..."
                          // @desc build URL
//{@dev
    if (VERIFY) {
        $valid($type(obj, "Object"), URI_build, "obj");
    }
//}@dev

    var prefix   = obj["prefix"]   || "";
    var protocol = (obj["protocol"] || obj["sceheme"] || "").toLowerCase();
    var username = obj["username"] || "";
    var password = obj["password"] || "";
    var hostname = obj["hostname"] || "";
    var pathname = obj["pathname"] || "/";
    var port     = obj["port"]     || "";
    var search   = obj["search"]   || "";
    var hash     = obj["hash"]     || obj["fragment"] || "";
    var slash    = "";
    var auth     = "";

    // --- normalize ---
    if (protocol) {
        slash = "//";
        if (!hostname) {
            slash += "/"; // "file://localhost/file" <-> "file:///file"
        }
    }

    // require("url").parse(...) don't make "username" and "password", but it make "auth".
    if (obj["auth"]) {
        auth = obj["auth"] + "@";
    } else if (username && password) {
        auth = username + ":" + password + "@";
    }

    // port number normalize. "http://example.com:80" -> "http://example.com"
    if (!protocol || PORT_NUMBER[protocol.toLowerCase()] === port) {
        port = "";
    }

    return [
        prefix, protocol, slash,                    // "http://"
        auth, hostname, port ? (":" + port) : port, // "user:pass@domain.com:port"
        pathname, search, hash                      // "/dir/file.ext?search#hash"
    ].join("");
}

function URI_match(pattern,   // @arg URLString|PatternURLString - "http://example.com/**/*.png"
                   target) {  // @arg URLString                  - "http://example.com/dir1/dir2/file.png"
                              // @ret Boolean
                              // @desc path matching
//{@dev
    if (VERIFY) {
        $valid($type(pattern, "URLString"), URI_match, "pattern");
        $valid($type(target,  "URLString"), URI_match, "target");
    }
//}@dev

    var patternPath  = URI_parse(pattern)["path"].replace(/^\.\//, "");
    var targetPath   = URI_parse(target)["path"].replace(/^\.\//, "");
    var regExpString = patternPath.replace(/\./g, function() { // "." -> "\."
                            return "\\.";
                        }).replace(/\*\*/g, function() { // "**" -> [-\w.%()/]
                            return "[-\\w\\.%()\\/]+";
                        }).replace(/\*/g, function() {   // "*"  -> [-\w.%()]
                            return "[-\\w\\.%()]+";
                        });
    var rex = new RegExp("^" + regExpString + "$");

    return rex.test(targetPath);
}

function URI_getDir(url) { // @arg URLString|URLObject - "http://example.com/a/b/c.ext"
                           // @ret URLString           - "/a/b/"
//{@dev
    if (VERIFY) {
        $valid($type(url, "String|Object"), URI_getDir, "url");
    }
//}@dev

    var urlObject = typeof url === "string" ? URI(url)
                                            : url;

    return urlObject.pathname.split("/").slice(0, -1).join("/") + "/"; // "/a/b/c.ext" -> "/a/b/"
}

function URI_getExt(url) { // @arg URLString|URLObject - "http://example.com/a/b/c.ext"
                           // @ret ExtensionString - "ext"
//{@dev
    if (VERIFY) {
        $valid($type(url, "String|Object"), URI_getExt, "url");
    }
//}@dev

    var fileExt = URI_getFileExt(url);

    if (fileExt.indexOf(".") >= 0) {
        return fileExt.split(".").slice(-1).join(""); // "/a/b/c.ext" -> "ext"
    }
    return "";
}

function URI_getFileExt(url) { // @arg URLString|URLObject - "http://example.com/a/b/c.ext"
                               // @ret FileExtensionString - "c.ext"
//{@dev
    if (VERIFY) {
        $valid($type(url, "String|Object"), URI_getFileExt, "url");
    }
//}@dev

    var urlObject = typeof url === "string" ? URI(url)
                                            : url;

    return urlObject.pathname.split("/").slice(-1).join("");
}

function URI_resolve(url,        // @arg URLString - relative URL or absolute URL
                     basePath) { // @arg URLString = "" - base path.
                                 // @ret URLString - absolute URL
                                 // @desc Convert relative URL to absolute URL.
//{@dev
    if (VERIFY) {
        $valid($type(url,      "String"),         URI_resolve, "url");
        $valid($type(basePath, "URLString|omit"), URI_resolve, "basePath");
    }
//}@dev

    if (URI_isAbsolute(url)) {
        return url;
    }
    if (basePath) {
        //if (_runOnNode) { // http://nodejs.org/api/url.html#url_url_resolve_from_to
        //    return URI_normalize( require("url")["resolve"](basePath, url) );
        //}
        return URI_normalize(basePath + "/" + url);
    }
    if (IN_BROWSER || IN_NW) {
        //var a = global["document"]["createElement"]("a");

        //a["setAttribute"]("href", url);       // <a href="hoge.htm">
        //return a["cloneNode"](false)["href"]; // -> "http://example.com/hoge.htm"
        return URI_normalize(_basePath + "/" + url);
    }
    return url;
}

function URI_normalize(url) { // @arg URLString
                              // @ret URLString
                              // @desc Path normalize.
//{@dev
    if (VERIFY) {
        $valid($type(url, "String"), URI_normalize, "url");
    }
//}@dev

    var obj = URI_parse(url);
    var normalizedPath = obj["dir"].split("/").reduce(function(result, path) {
            if (path === "..") {
                result.pop();
                if (!result.length) {
                    result.unshift("/"); // root dir
                }
            } else if ( !/^\.+$/.test(path) ) {
                result.push(path);
            }
            return result;
        }, []).join("/");

    // tidy slash "///" -> "/"
    obj["pathname"] = (normalizedPath + "/").replace(/\/+/g, "/") + obj["file"];

    return URI_build(obj);
}

function URI_getProtocol(url) { // @arg URLString - "http://example.com"
                                // @ret ProtocolString - "http:"
//{@dev
    if (VERIFY) {
        $valid($type(url, "String"), URI_getProtocol, "url");
    }
//}@dev

    var blob = REGEXP_BLOB.test(url); // "blob:http://..." -> "http://..."
    if (blob) {
        url = url.slice(5);
    }
    var m = REGEXP_PROTOCOL.exec(url);

    if ( m && _isValidScheme(m[0]) ) {
        return m[0].toLowerCase();
    }
    return "";
}

function URI_isBlob(url) { // @arg URLString
                           // @ret Boolean - true is blob url
                           // @desc URL is blob.
//{@dev
    if (VERIFY) {
        $valid($type(url, "String"), URI_isBlob, "url");
    }
//}@dev

    return REGEXP_BLOB.test(url);
}

function URI_getBaseURL(url) { // @arg URLString|URLObject - "http://example.com:8080/a/b/c.ext"
                               // @ret URLString           - "http://example.com:8080/a/b/"
//{@dev
    if (VERIFY) {
        $valid($type(url, "String|Object"), URI_getBaseURL, "url");
    }
//}@dev

//    if (!url) {
//        return "";
//    }
    if (URI["isBlob"](url)) {
        return "blob:" + _baseURL(url.slice(5));
    }
    return _baseURL(url);

    function _baseURL(url) {
        var urlObject = typeof url === "string" ? URI(url)
                                                : url;
        return URI["resolve"]( urlObject["origin"] + urlObject["dir"] + "/" );
    }
}

function URI_isAbsolute(url) { // @arg URLString
                               // @ret Boolean - true is absolute url
                               // @desc URL is absolute.
//{@dev
    if (VERIFY) {
        $valid($type(url, "String"), URI_isAbsolute, "url");
    }
//}@dev

    var blob = REGEXP_BLOB.test(url); // "blob:http://..."
    if (blob) {
        url = url.slice(5);
    }
    if ( REGEXP_FILE.test(url) ) { // "file://" -> absolute file path
        return true;
    }
    return REGEXP_PROTOCOL.test(url) ? REGEXP_URL.test(url) : false;
}

function URI_isRelative(url) { // @arg URLString
                               // @ret Boolean - true is relative url
                               // @desc URL is relative.
//{@dev
    if (VERIFY) {
        $valid($type(url, "String"), URI_isRelative, "url");
    }
//}@dev

    if (/^\/\//.test(url)) { // "//..." -> test("http://...")
        return REGEXP_URL.test("http:" + url);
    }
    if (REGEXP_DRIVE_LETTER.test(url)) { // "c:/dir/file" -> false
        return false;
    }
    if (REGEXP_PROTOCOL.test(url)) { // has protocol -> not relative url
        return false;
    }
    return REGEXP_URL.test("http://example.com/" + url.replace(/^\/+/, ""));
}

function URI_buildQuery(queryObject, // @arg URLQueryObject - { key1: "a", key2: "b", key3: [0, 1] }
                        joint) {     // @arg String = "&"   - joint string "&" or "&amp;" or ";"
                                     // @ret URLQueryString - "key1=a&key2=b&key3=0&key3=1"
                                     // @desc build query string
//{@dev
    if (VERIFY) {
        $valid($type(queryObject, "URLQueryObject"), URI_buildQuery, "queryObject");
        $valid($type(joint, "String|omit"),          URI_buildQuery, "joint");
    }
//}@dev

    joint = joint || "&";

    var result = [];

    for (var key in queryObject) {
        var encodedKey = global["encodeURIComponent"](key);
        var value = queryObject[key];

        if (!Array.isArray(value)) {
            value = [value]; // to Array
        }
        // "key3=0&key3=1"
        for (var token = [], i = 0, iz = value.length; i < iz; ++i) {
            token.push( encodedKey + "=" + global["encodeURIComponent"](value[i]) );
        }
        result.push( token.join(joint) );
    }
    return result.join(joint); // "key1=a&key2=b&key3=0&key3=1"
}

function URI_parseQuery(queryString) { // @arg URLString|URLQueryString - "key1=a;key2=b;key3=0;key3=1"
                                       // @ret URLQueryObject           - { key1: "a", key2: "b", key3: ["0", "1"] }
                                       // @desc parse query string
//{@dev
    if (VERIFY) {
        $valid($type(queryString, "URLString|URLQueryString"), URI_parseQuery, "queryString");
    }
//}@dev

    function _parseQuery(_, key, value) {
        var decodedKey   = global["decodeURIComponent"](key),
            decodedValue = global["decodeURIComponent"](value);

        if ( result[decodedKey] ) {
            if ( Array.isArray(result[decodedKey]) ) {
                result[decodedKey].push(decodedValue);
            } else {
                result[decodedKey] = [ result[decodedKey], decodedValue ];
            }
        } else {
            result[decodedKey] = decodedValue;
        }
        return "";
    }

    var result = {};

    if (queryString.indexOf("?") >= 0) {
        // pickup "http://example.com/dir/file.exe?key=value#hash"
        //                                         ~~~~~~~~~
        queryString = queryString.split("?")[1].split("#")[0];
    }
    queryString.replace(/&amp;|&|;/g, ";"). // "&amp;" or "&" or ";" -> ";"
                replace(/(?:([^\=]+)\=([^\;]+);?)/g, _parseQuery);
    return result;
}

function URI_addCacheBustingKeyword(url,       // @arg URLString
                                    keyword) { // @arg String = "t"
                                               // @ret URLString
//{@dev
    if (VERIFY) {
        $valid($type(url,     "URLString"),   URI_addCacheBustingKeyword, "url");
        $valid($type(keyword, "String|omit"), URI_addCacheBustingKeyword, "keyword");
        if (keyword) {
            $valid(/[A-Za-z_]+/.test(keyword), URI_addCacheBustingKeyword, "keyword");
        }
    }
//}@dev

    keyword = keyword || "t";
    keyword += "=";

    if (url.indexOf("#") >= 0) { // a.png#abc -> parse url
        var urlObj = _parse(url);

        if (urlObj["search"].length) {
            urlObj["search"] += "&" + keyword + (++_cacheBustingFlavor);
        } else {
            urlObj["search"] += "?" + keyword + (++_cacheBustingFlavor);
        }
        url = URI_build(urlObj); // a.png?_=1234#abc
    } else if (url.indexOf("?") >= 0) { // a.png?k=v
        url += "&" + keyword + (++_cacheBustingFlavor); // a.png?k=v&t=1234
    } else {
        url += "?" + keyword + (++_cacheBustingFlavor); // a.png?t=1234
    }
    return url;
}

function URI_encode(source) { // @arg String
                              // @ret String - percent encoded string
                              // @desc encodeURIComponent impl
//{@dev
    if (VERIFY) {
        $valid($type(source, "String"), URI_encode, "source");
    }
//}@dev

    function _hex(num) {
        return (num < 16) ? "0" + num.toString(16)  // 0x00 ~ 0x0f
                          :       num.toString(16); // 0x10 ~ 0xff
    }

    var result = [], i = 0, iz = source.length, c = 0, safe;

    for (; i < iz; ++i) {
        c = source.charCodeAt(i);

        if (c < 0x80) { // encode ASCII(0x00 ~ 0x7f)
            safe = c === 95 ||              // _
                   (c >= 48 && c <=  57) || // 0~9
                   (c >= 65 && c <=  90) || // A~Z
                   (c >= 97 && c <= 122);   // a~z

            if (!safe) {
                safe = c === 33  || // !
                       c === 45  || // -
                       c === 46  || // .
                       c === 126 || // ~
                       (c >= 39 && c <= 42); // '()*
            }
            if (safe) {
                result.push(source.charAt(i));
            } else {
                result.push("%", _hex(c));
            }
        } else if (c < 0x0800) { // encode UTF-8
            result.push("%", _hex(((c >>>  6) & 0x1f) | 0xc0),
                        "%", _hex( (c         & 0x3f) | 0x80));
        } else if (c < 0x10000) { // encode UTF-8
            result.push("%", _hex(((c >>> 12) & 0x0f) | 0xe0),
                        "%", _hex(((c >>>  6) & 0x3f) | 0x80),
                        "%", _hex( (c         & 0x3f) | 0x80));
        }
    }
    return result.join("");
}

function URI_decode(source) { // @arg String - percent encoded string.
                              // @ret String - decode string.
                              // @throws Error("invalid URI.decode")
                              // @desc decodeURIComponent impl.
//{@dev
    if (VERIFY) {
        $valid($type(source, "String"), URI_decode, "source");
    }
//}@dev

    return source.replace(/(%[\da-f][\da-f])+/g, function(match) {
        var result = [];
        var ary = match.split("%").slice(1), i = 0, iz = ary.length;
        var a = 0, b = 0, c = 0; // UTF-8 bytes

        for (; i < iz; ++i) {
            a = parseInt(ary[i], 16);

            if (a !== a) { // isNaN(a)
                throw new Error("invalid URI.decode");
            }

            // decode UTF-8
            if (a < 0x80) { // ASCII(0x00 ~ 0x7f)
                result.push(a);
            } else if (a < 0xE0) {
                b = parseInt(ary[++i], 16);
                result.push((a & 0x1f) <<  6 | (b & 0x3f));
            } else if (a < 0xF0) {
                b = parseInt(ary[++i], 16);
                c = parseInt(ary[++i], 16);
                result.push((a & 0x0f) << 12 | (b & 0x3f) << 6
                                             | (c & 0x3f));
            }
        }
        return String.fromCharCode.apply(null, result);
    });
}

return URI; // return entity

});

