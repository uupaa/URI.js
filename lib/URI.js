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
    dir:         - String:  "/dir1/dir2/"               [!] has last slash [!]
    file:        - String:  "file.ext"
    search:      - String:  "?a=b;c=d"
    query:       - URIQueryObject: { a: "b", c: "d" }
    fragment:    - String:  "#fragment"
    error:       - Boolean: true is error(invalid uriString)
};

console.log( URI.build(uriObject) );
// http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#fragment

 */
(function(global) {

// --- variable --------------------------------------------
var inNode = "process" in global;

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


// --- interface -------------------------------------------
function URI() { // @ret String: current URI.
                 // @help: URI
                 // @desc: get current URI.
    if (global["location"]) {
        return global["location"]["href"] || "";
    }
    return "";
}

URI["name"]         = "URI";
URI["repository"]   = "https://github.com/uupaa/URI.js";
URI["parse"]        = URI_parse;        // URI.parse(uriString:URIString):URIObject
URI["build"]        = URI_build;        // URI.build(uriObject:URIObject):URIString
URI["resolve"]      = URI_resolve;      // URI.resolve(uriString:URIString):URIString
URI["normalize"]    = URI_normalize;    // URI.normalize(uriString:URIString):URIString
URI["isAbsolute"]   = URI_isAbsolute;   // URI.isAbsolute(uriString:URIString):Boolean
URI["isRelative"]   = URI_isRelative;   // URI.isRelative(uriString:URIString):Boolean
URI["buildQuery"]   = URI_buildQuery;   // URI.buildQuery(uriQueryObject:URIQueryObject, joint:String = "&"):URIQueryString
URI["parseQuery"]   = URI_parseQuery;   // URI.parseQuery(queryString:URIString/URIQueryString):URIQueryObject
URI["encode"]       = global["encodeURIComponent"] || URI_encode; // URI.encode(source:String):String
URI["decode"]       = global["decodeURIComponent"] || URI_decode; // URI.decode(source:String):String

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

function URI_resolve(uriString) { // @arg URIString: relative URI or absolute URI
                                  // @ret URIString: absolute URI
                                  // @help: URI.resolve
                                  // @desc: Convert relative URI to absolute URI.
    if (URI_isAbsolute(uriString)) {
        return uriString;
    }
    if ("document" in global) { // in Browser
        var a = global["document"]["createElement"]("a");

        a["setAttribute"]("href", uriString); // <a href="hoge.htm">
        return a["cloneNode"](false).href;    // -> "http://example.com/hoge.htm"
    }
    throw new Error("URI.resolve will not work");
}

function URI_normalize(uriString) { // @arg URIString:
                                    // @ret URIString:
                                    // @help: URI.normalize
                                    // @desc: Path normalize.
    // URI.normalize("dir/.../a.file") -> "/dir/a.file"
    // URI.normalize("../../../../a.file") -> "/a.file"

    var uriObject = URI_parse(uriString);
    var normalizedPath = uriObject["dir"].split("/").reduce(function(result, path) {
            if (path === "..") {
                result.pop();
            } else if ( !/^\.+$/.test(path) ) {
                result.push(path);
            }
            return result;
        }, []).join("/");

    // tidy slash "///" -> "/"
    uriObject["pathname"] = ("/" + normalizedPath + "/").replace(/\/+/g, "/") +
                            uriObject["file"];
    return URI_build(uriObject);
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
        // pickup "http://example.com/dir/file.exe?key=value#hash"
        //                                         ~~~~~~~~~
        queryString = queryString.split("?")[1].split("#")[0];
    }
    queryString.replace(/&amp;|&|;/g, ";"). // &amp; or & or ; -> ;
                replace(/(?:([^\=]+)\=([^\;]+);?)/g, _parseQuery);
    return rv;
}

function URI_encode(source) { // @arg String:
                              // @ret String: percent encoded string
                              // @help: URI.encode
                              // @desc: encodeURIComponent impl
    function _hex(num) {
        return (num < 16) ? "0" + num.toString(16)  // 0x00 ~ 0x0f
                          :       num.toString(16); // 0x10 ~ 0xff
    }

    var rv = [], i = 0, iz = source.length, c = 0, safe;

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
                rv.push(source.charAt(i));
            } else {
                rv.push("%", _hex(c));
            }
        } else if (c < 0x0800) { // encode UTF-8
            rv.push("%", _hex(((c >>>  6) & 0x1f) | 0xc0),
                    "%", _hex( (c         & 0x3f) | 0x80));
        } else if (c < 0x10000) { // encode UTF-8
            rv.push("%", _hex(((c >>> 12) & 0x0f) | 0xe0),
                    "%", _hex(((c >>>  6) & 0x3f) | 0x80),
                    "%", _hex( (c         & 0x3f) | 0x80));
        }
    }
    return rv.join("");
}

function URI_decode(source) { // @arg String: percent encoded string.
                              // @ret String: decode string.
                              // @throws: Error("invalid URI.decode")
                              // @help: URI.decode
                              // @desc: decodeURIComponent impl.
    return source.replace(/(%[\da-f][\da-f])+/g, function(match) {
        var rv = [];
        var ary = match.split("%").slice(1), i = 0, iz = ary.length;
        var a = 0, b = 0, c = 0; // UTF-8 bytes

        for (; i < iz; ++i) {
            a = parseInt(ary[i], 16);

            if (a !== a) { // isNaN(a)
                throw new Error("invalid URI.decode");
            }

            // decode UTF-8
            if (a < 0x80) { // ASCII(0x00 ~ 0x7f)
                rv.push(a);
            } else if (a < 0xE0) {
                b = parseInt(ary[++i], 16);
                rv.push((a & 0x1f) <<  6 | (b & 0x3f));
            } else if (a < 0xF0) {
                b = parseInt(ary[++i], 16);
                c = parseInt(ary[++i], 16);
                rv.push((a & 0x0f) << 12 | (b & 0x3f) << 6
                                         | (c & 0x3f));
            }
        }
        return String.fromCharCode.apply(null, rv);
    });
}

// --- export ----------------------------------------------
//{@node
if (inNode) {
    module["exports"] = URI;
}
//}@node
global["URI"] ? (global["URI_"] = URI) // already exsists
              : (global["URI"]  = URI);

})(this.self || global);

