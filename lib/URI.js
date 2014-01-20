// @name: URI.js

/*
var uriObject = URI.parse("http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#fragment");

uriObject = {
    href:        - String:  "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#fragment"
    protocol:    - String:  "http:"
    scheme:      - String:  "http:"
    secure:      - Boolean: false
    host:        - String:  "user:pass@example.com:8080". has auth
    auth:        - String:  "user:pass"
    hostname:    - String:  "example.com"
    port:        - Number:  8080
    pathname:    - String:  "/dir1/dir2/file.ext"
    dir:         - String:  "/dir1/dir2"
    file:        - String:  "file.ext"
    search:      - String:  "?a=b;c=d"
    query:       - URIQueryObject: { a: "b", c: "d" }
    fragment:    - String:  "#fragment"
    error:       - Boolean: true is error(invalid uriString)
};
 */
(function(global) {

// --- define ----------------------------------------------
var PORT_NUMBER = { "http:": 80, "https": 443, "ws:": 81, "wss:": 816 };
var REGEXP_URI  = /^(\w+:)\/\/((?:([\w:]+)@)?([^\/:]+)(?::(\d*))?)([^ :?#]*)(?:(\?[^#]*))?(?:(#.*))?$/;
                //            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                //  ~~~~~~~~~ [2] ~~~~~~~~~~ ~~~~~~~~~   ~~~~~~~  ~~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //  https://      user:pass@ server      :port    /dir/f.ext   ?key=value    #hash
                //  [1]           [3]        [4]          [5]     [6]          [7]           [8]

var REGEXP_FILE = /^(file:)\/{2,3}(?:localhost)?([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/i;
                //  ~~~~~~~~~~~~~~   ~~~~~~~~~  ~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //                   localhost  /dir/f.ext  ?key=value    #hash
                //  [1]                         [2]         [3]           [4]

var REGEXP_PATH = /^([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/;
                //  ~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //  /dir/f.ext  key=value     hash
                //  [1]         [2]           [3]

// --- variable --------------------------------------------
// --- interface -------------------------------------------
function URI() { // @ret String: current URI.
                 // @help: URI
    if (global["location"]) {
        return global["location"]["href"];
    }
    return "";
}

URI["name"]         = "URI";
URI["repository"]   = "https://github.com/uupaa/URI.js";
URI["parse"]        = URI_parse;        // URI.parse(uriString:URIString):URIObject
URI["build"]        = URI_build;        // URI.build(uriObject:URIObject):URIString
URI["resolve"]      = URI_resolve;      // URI.resolve(uriString:URIString = ""):URIString
URI["normalize"]    = URI_normalize;    // URI.normalize(uriString:URIString):URIString
URI["isAbsolute"]   = URI_isAbsolute;   // URI.isAbsolute(uriString:String):Boolean
URI["isRelative"]   = URI_isRelative;   // URI.isRelative(uriString:String):Boolean
URI["buildQuery"]   = URI_buildQuery;   // URI.buildQuery(uriQueryObject:URIQueryObject, joint:String = "&"):URIQueryString
URI["parseQuery"]   = URI_parseQuery;   // URI.parseQuery(queryString:URIString/URIQueryString):URIQueryObject

// --- implement -------------------------------------------
function URI_parse(uriString) { // @arg URIString: absolute uri or relative uri
                                // @ret URIObject: { href, ... fragment, error }
                                // @help: URI.parse
                                // @desc: parse URI
    var m = REGEXP_FILE.exec(uriString);

    if (m) {
        return _createURIObject({
            "href":     uriString,
            "protocol": m[1],
            "pathname": m[2],
            "search":   m[3],
            "fragment": m[4]
        });
    }
    m = REGEXP_URI.exec(uriString);
    if (m) {
        return _createURIObject({
            "href":     uriString,
            "protocol": m[1],
            "secure":   m[1] === "https:" || m[1] === "wss:",
            "host":     m[2],
            "auth":     m[3],
            "hostname": m[4],
            "port":     m[5] ? +m[5] : (PORT_NUMBER[m[1]] || 0),
            "pathname": m[6],
            "search":   m[7],
            "fragment": m[8]
        });
    }
    m = REGEXP_PATH.exec(uriString);
    if (m) {
        return _createURIObject({
            "href":     uriString,
            "pathname": m[1],
            "search":   m[2],
            "fragment": m[3]
        });
    }
    return _createURIObject({ "href": uriString, "pathname": uriString, "error": true });
}

function _createURIObject(uriObject) { // @arg URIuriObjectect:
                                       // @ret URIuriObjectect:
    var path = uriObject["pathname"].split("/");

    uriObject["href"]     = uriObject["href"]     || "";
    uriObject["protocol"] = uriObject["protocol"] || "";
    uriObject["scheme"]   = uriObject["protocol"];        // [alias]
    uriObject["secure"]   = uriObject["secure"]   || false;
    uriObject["host"]     = uriObject["host"]     || "";
    uriObject["auth"]     = uriObject["auth"]     || "";
    uriObject["hostname"] = uriObject["hostname"] || "";
    uriObject["port"]     = uriObject["port"]     || 0;
    uriObject["pathname"] = uriObject["pathname"] || "";
    uriObject["file"]     = path.pop();
    uriObject["dir"]      = path.join("/"); // + "/";
    uriObject["search"]   = uriObject["search"]   || "";
    uriObject["query"]    = URI_parseQuery(uriObject["search"]);
    uriObject["fragment"] = uriObject["fragment"] || "";
    uriObject["error"]    = uriObject["error"]    || false;
    return uriObject;
}

function URI_build(uriObject) { // @arg URIObject: { protocol, host, pathname, search, fragment }
                                // @ret URIString: "{protocol}//{host}{pathname}?{search}#{fragment}"
                                // @help: URI.build
                                // @desc: build URI
    var slash = uriObject["protocol"] === "file:" ? "///"
                                                  : "//";
    return [
        uriObject["protocol"],
        uriObject["protocol"] ? slash : "",
        uriObject["host"]     || "",
        uriObject["pathname"] || "/",
        uriObject["search"]   || "",
        uriObject["fragment"] || ""
    ].join("");
}

function URI_resolve(uriString) { // @arg URIString(= ""): relative URI or absolute URI
                                  // @ret URIString: absolute URI
                                  // @help: URI.resolve
                                  // @desc: Convert relative URI to absolute URI.
    uriString = uriString || global["location"]["href"];

    if ( /^(https?|file|wss?):/.test(uriString) ) { // is absolute uriString -> return uriString
        return uriString;
    }
    if (global["document"]) {
        var a = global["document"]["createElement"]("a");

        a["setAttribute"]("href", uriString);    // <a href="hoge.htm">
        return a["cloneNode"](false).href; // -> "http://example.com/hoge.htm"
    }
    throw new Error("URI.resolve will not work");
}

function URI_normalize(uriString) { // @arg URIString:
                                    // @ret URIString:
                                    // @help: URI.normalize
                                    // @desc: Path normalize.
    var rv = [];
    var obj  = URI_parse(uriString);
    var dots = /^\.+$/;
    var dirs = obj["dir"].split("/");

    // normalize("dir/.../a.file") -> "/dir/a.file"
    // normalize("../../../../a.file") -> "/a.file"

    for (var i = 0, iz = dirs.length; i < iz; ++i) {
        var path = dirs[i];

        if (path === "..") {
            rv.pop();
        } else if ( !dots.test(path) ) {
            rv.push(path);
        }
    }
    // tidy slash "///" -> "/"
    obj["pathname"] = ("/" + rv.join("/") + "/").replace(/\/+/g, "/") + obj["file"];
    return URI_build(obj); // rebuild
}

function URI_isAbsolute(uriString) { // @arg URIString:
                                     // @ret Boolean: true is absolute uriString
                                     // @help: URI/isAbsolute
                                     // @desc: URI is absolute.
    return /^(https?|wss?):/.test(uriString) ? REGEXP_URI.test(uriString)
                                             : REGEXP_FILE.test(uriString);
}

function URI_isRelative(uriString) { // @arg URIString:
                                     // @ret Boolean: true is relative uriString
                                     // @help: URI.isRelative
                                     // @desc: URI is relative.
    return REGEXP_URI.test("http://a.a/" + uriString.replace(/^\/+/, ""));
}

function URI_buildQuery(uriQueryObject, // @arg URIQueryObject: { key1: "a", key2: "b", key3: [0, 1] }
                        joint) {        // @arg String(= "&"): joint string "&" or "&amp;" or ";"
                                        // @ret URIQueryString: "key1=a&key2=b&key3=0&key3=1"
                                        // @help: URI.buileQuery
                                        // @desc: build query string
    joint = joint || "&";

    var rv = [];

    for (var key in uriQueryObject) {
        var encodedKey = global["encodeURIComponent"](key);
        var value = uriQueryObject[key];

        if (!Array.isArray(value)) {
            value = [value];
        }
        // "key3=0&key3=1"
        for (var token = [], i = 0, iz = value.length; i < iz; ++i) {
            token.push( encodedKey + "=" + global["encodeURIComponent"](value[i]) );
        }
        rv.push( token.join(joint) );
    }
    return rv.join(joint); // "key1=a&key2=b&key3=0&key3=1"
}

function URI_parseQuery(queryString) { // @arg URIString/URIQueryString: "key1=a;key2=b;key3=0;key3=1"
                                       // @ret URIQueryObject: { key1: "a", key2: "b", key3: ["0", "1"] }
                                       // @help: URI.parseQuery
                                       // @desc: parse query string
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
        queryString = queryString.split("?")[1].split("#")[0];
    }
    queryString.replace(/&amp;|&|;/g, ";"). // "&amp;" or "&" or ";" -> ";"
                replace(/(?:([^\=]+)\=([^\;]+);?)/g, _parseQuery);
    return rv;
}

// --- export ----------------------------------------------
if (global.process) { // node.js
    module.exports = URI;
}
global.URI = URI;

})(this.self || global);

