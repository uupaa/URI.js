(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("URI", function moduleClosure(global) {
"use strict";

// Terminology
//
//  URLObject - https://github.com/uupaa/URI.js/wiki/URLObject
//  BlobURL - https://w3c.github.io/FileAPI/#DefinitionOfScheme

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
var PORT_NUMBER = { "http:": "80", "https:": "443", "ws:": "81", "wss:": "816" };
var REGEXP_URL  = /^([\w\+\-\.]+:)\/\/(?:(?:([\w:]+)@)?([^\/:]+)(?::(\d*))?)([^ :?#]*)(?:(\?[^#]*))?(?:(#.*))?$/;
                //  ~~~~~~~~~~~~~~        ~~~~~~~~~~ ~~~~~~~~~   ~~~~~~~  ~~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //  https://              user:pass@ server      :port    /dir/f.ext   ?key=value    #hash
                //  [1]                   [2]        [3]          [4]     [5]          [6]           [7]

var REGEXP_FILE = /^(file:)\/\/(localhost)?([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/i;
                //  ~~~~~~~    ~~~~~~~~~~~ ~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //              localhost  /dir/f.ext  ?key=value    #hash
                //  [1]         [2]        [3]         [4]           [5]

var REGEXP_PATH = /^([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/;
                //  ~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //  /dir/f.ext  key=value     hash
                //  [1]         [2]           [3]

var _cacheBustingFlavor = +("" + Date.now()).slice(-4);

var _basePath = (IN_BROWSER || IN_NW) ? location.href.slice(0, location.href.lastIndexOf("/"))
                                      : "";

// --- class / interfaces ----------------------------------
function URI(url) { // @ret URLString
                    // @ret URLObject - URI.parse(urlString) result
    return URI.parse(url);
}

URI["repository"] = "https://github.com/uupaa/URI.js";
URI["isValid"]    = URI_isValid;      // URI.isValid(url:URLString|URLStringArray, canonical:Boolean = false):Boolean
URI["parse"]      = URI_parse;        // URI.parse(url:URLString):URLObject
URI["build"]      = URI_build;        // URI.build(obj:URLObject):URLString
URI["match"]      = URI_match;        // URI.match(pattern:URLString|PatternURLString, target:URLString):Boolean
URI["resolve"]    = URI_resolve;      // URI.resolve(url:URLString, basePath:URLString = ""):URLString
URI["normalize"]  = URI_normalize;    // URI.normalize(url:URLString):URLString
URI["isBlob"]     = URI_isBlob;       // URI.isBlob(url:URLString|BlobURLString):Boolean
URI["isAbsolute"] = URI_isAbsolute;   // URI.isAbsolute(url:URLString):Boolean
URI["isRelative"] = URI_isRelative;   // URI.isRelative(url:URLString):Boolean
URI["buildQuery"] = URI_buildQuery;   // URI.buildQuery(url:URLQueryObject, joint:String = "&"):URLQueryString
URI["parseQuery"] = URI_parseQuery;   // URI.parseQuery(queryString:URLString/URLQueryString):URLQueryObject
URI["addCacheBustingKeyword"] = URI_addCacheBustingKeyword; // URI.addCacheBustingKeyword(url:URLString, keyword:String = "t"):URLString

// --- implements ------------------------------------------
function URI_isValid(url,         // @arg URLString|URLStringArray - absolute/relative url(s)
                     canonical) { // @arg Boolean = false - TBD
                                  // @ret Boolean
                                  // @desc validate URL
//{@dev
    if (!global["BENCHMARK"]) {
        $valid(typeof url === "string" || Array.isArray(url), URI_isValid, "url");
    }
//}@dev

    var urls = Array.isArray(url) ? url : [url];

    for (var i = 0, iz = urls.length; i < iz; ++i) {
        if ( !_parse(urls[i], true) ) {
            return false;
        }
    }
    return true;
}

function URI_parse(url) { // @arg URLString - absolute url or relative url
                          // @ret URLObject - { href, ... hash }
                          // @desc parse URL
//{@dev
    if (!global["BENCHMARK"]) {
        $valid($type(url, "String"), URI_parse, "url");
    }
//}@dev

    return _parse(url, false) || { "href": url };
}

function _parse(url,        // @arg URLString
                validate) { // @arg Boolean = false
                            // @ret URLObject|null - null is error
    var m = REGEXP_FILE.exec(url);

    if (m) {
        if ( validate && !_isValidPath(m[3]) ) {
            return null;
        }
        return _createURLObject({
            "href":     url,
            "protocol": m[1] || "",
            "hostname": m[2] || "",
            "port":     "",
            "pathname": m[3] || "",
            "search":   m[4] || "",
            "hash":     m[5] || ""
        }, ["", ""]);
    }
    m = REGEXP_URL.exec(url);
    if (m) {
        if ( validate && (!_isValidScheme(m[1]) || !_isValidPath(m[5] || "")) ) {
            return null;
        } else {
            return _createURLObject({
                "href":     url,
                "protocol": m[1],
                "hostname": m[3],
                "port":     m[4] ? m[4] : (PORT_NUMBER[m[1]] || ""),
                "pathname": m[5] || "",
                "search":   m[6] || "",
                "hash":     m[7] || ""
            }, (m[2] || ":").split(":")); // [username, password]
        }
    }
    m = REGEXP_PATH.exec(url);
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

function _isValidScheme(scheme) { // @arg String
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

function _createURLObject(obj,    // @arg URLObject - { href, protocol, hostname, port, pathname, search, hash }
                          auth) { // @arg StringArray - [username, password]
                                  // @ret URLObject
    var host = obj["port"] ? (obj["hostname"] + ":" + obj["port"]) : obj["hostname"];

    obj["origin"]   = obj["protocol"] ? (obj["protocol"] + "//" + host) : host;
    obj["host"]     = host;
    obj["username"] = auth[0];
    obj["password"] = auth[1];

    // --- extras properties ---
    var path = obj["pathname"].split("/"); // "/dir1/dir2/file.ext" -> ["", "dir1", "dir2", "file.ext"]
    var file = path.pop();
    var dir  = path.join("/");

    obj["scheme"]   = obj["protocol"];
    obj["path"]     = obj["pathname"] + obj["search"]; // + obj["hash"];
    obj["dir"]      = dir;
    obj["file"]     = file;
    obj["fragment"] = obj["hash"];

    return obj;
}

function URI_build(obj) { // @arg URLObject - { protocol, username, password, hostname, port, pathname, search, hash }
                          // @ret URLString - "http://..."
                          // @desc build URL
//{@dev
    if (!global["BENCHMARK"]) {
        $valid($type(obj, "Object"), URI_build, "obj");
    }
//}@dev

    var protocol = obj["protocol"] || obj["sceheme"] || "";
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
    if (!protocol || PORT_NUMBER[protocol] === port) {
        port = "";
    }

    return [
        protocol, slash,                            // "http://"
        auth, hostname, port ? (":" + port) : port, // "user:pass@domain.com:port"
        pathname, search, hash                      // "/dir/file.ext?search#hash"
    ].join("");
}

function URI_match(pattern,   // @arg URLString|PatternURLString - "http://example.com/**/*.png"
                   target) {  // @arg URLString                  - "http://example.com/dir1/dir2/file.png"
                              // @ret Boolean
                              // @desc path matching
//{@dev
    if (!global["BENCHMARK"]) {
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

function URI_resolve(url,        // @arg URLString - relative URL or absolute URL
                     basePath) { // @arg URLString = "" - base path.
                                 // @ret URLString - absolute URL
                                 // @desc Convert relative URL to absolute URL.
//{@dev
    if (!global["BENCHMARK"]) {
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
    if (!global["BENCHMARK"]) {
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

function URI_isBlob(url) { // @arg URLString|BlobURLString
                           // @ret Boolean - true is blob url
                           // @desc URL is blob url.
    return /^blob\:/i.test(url) && URI_isAbsolute( url.slice(5) );
}

function URI_isAbsolute(url) { // @arg URLString
                               // @ret Boolean - true is absolute url
                               // @desc URL is absolute.
//{@dev
    if (!global["BENCHMARK"]) {
        $valid($type(url, "String"), URI_isAbsolute, "url");
    }
//}@dev

    var hasProtocol = /^(https?|wss?):/;

    return hasProtocol.test(url) ? REGEXP_URL.test(url)
                                 : REGEXP_FILE.test(url);
}

function URI_isRelative(url) { // @arg URLString
                               // @ret Boolean - true is relative url
                               // @desc URL is relative.
//{@dev
    if (!global["BENCHMARK"]) {
        $valid($type(url, "String"), URI_isRelative, "url");
    }
//}@dev

    return REGEXP_URL.test("http://example.com/" + url.replace(/^\/+/, ""));
}

function URI_buildQuery(queryObject, // @arg URLQueryObject - { key1: "a", key2: "b", key3: [0, 1] }
                        joint) {     // @arg String = "&"   - joint string "&" or "&amp;" or ";"
                                     // @ret URLQueryString - "key1=a&key2=b&key3=0&key3=1"
                                     // @desc build query string
//{@dev
    if (!global["BENCHMARK"]) {
        $valid($type(queryObject, "URLQueryObject"), URI_buildQuery, "queryObject");
        $valid($type(joint, "String|omit"),          URI_buildQuery, "joint");
    }
//}@dev

    joint = joint || "&";

    var rv = [];

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
        rv.push( token.join(joint) );
    }
    return rv.join(joint); // "key1=a&key2=b&key3=0&key3=1"
}

function URI_parseQuery(queryString) { // @arg URLString|URLQueryString - "key1=a;key2=b;key3=0;key3=1"
                                       // @ret URLQueryObject           - { key1: "a", key2: "b", key3: ["0", "1"] }
                                       // @desc parse query string
//{@dev
    if (!global["BENCHMARK"]) {
        $valid($type(queryString, "URLString|URLQueryString"), URI_parseQuery, "queryString");
    }
//}@dev

    function _parseQuery(_, key, value) {
        var encodedKey   = global["encodeURIComponent"](key),
            encodedValue = global["encodeURIComponent"](value);

        if ( rv[encodedKey] ) {
            if ( Array.isArray(rv[encodedKey]) ) {
                rv[encodedKey].push(encodedValue);
            } else {
                rv[encodedKey] = [ rv[encodedKey], encodedValue ];
            }
        } else {
            rv[encodedKey] = encodedValue;
        }
        return "";
    }

    var rv = {};

    if (queryString.indexOf("?") >= 0) {
        // pickup "http://example.com/dir/file.exe?key=value#hash"
        //                                         ~~~~~~~~~
        queryString = queryString.split("?")[1].split("#")[0];
    }
    queryString.replace(/&amp;|&|;/g, ";"). // &amp; or & or ; -> ;
                replace(/(?:([^\=]+)\=([^\;]+);?)/g, _parseQuery);
    return rv;
}

function URI_addCacheBustingKeyword(url,       // @arg URLString
                                    keyword) { // @arg String = "t"
                                               // @ret URLString
//{@dev
    if (!global["BENCHMARK"]) {
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

// --- validate and assert functions -----------------------

//{@dev
// hook `$type(url, "URLString")` to `URI_isValid(url)`
// hook `$type(url, "URLStringArray")` to `URI_isValid(url)`
if (global["Valid"]) {
    global["Valid"]["register"]("URLString", function(type, value) {
        return typeof value === "string" && URI_isValid(value);
    });
    global["Valid"]["register"]("URLStringArray", function(type, value) {
        if ( !Array.isArray(value) ) {
            return false;
        }
        for (var i = 0, iz = value.length; i < iz; ++i) {
            if (value[i] === undefined) {
                // skip sparse element
            } else if (typeof value[i] !== "string" || !URI_isValid(value[i])) {
                return false;
            }
        }
        return true;
    });
}
//}@dev

return URI; // return entity

});

