// @name: URI.js
// @require: Valid.js
// @cutoff: @assert @node

/*
var urlObject = URI.parse("http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#fragment");

urlObject = {
    href:        - String:  "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#fragment"
    protocol:    - String:  "http:"
    scheme:      - String:  "http:"
    secure:      - Boolean: false
    host:        - String:  "user:pass@example.com:8080". [!] has auth information
    auth:        - String:  "user:pass"
    hostname:    - String:  "example.com"
    port:        - Number:  8080
    path:        - String:  "/dir1/dir2/file.ext?a=b;c=d#fragment"
    pathname:    - String:  "/dir1/dir2/file.ext"
    dir:         - String:  "/dir1/dir2/"                 [!] has last slash
    file:        - String:  "file.ext"
    search:      - String:  "?a=b;c=d"
    query:       - URLQueryObject: { a: "b", c: "d" }
    fragment:    - String:  "#fragment"
    error:       - Boolean: true is error(invalid URL)
};

console.log( URI.build(urlObject) );
    // -> http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#fragment

 */
(function(global) {

// --- variable --------------------------------------------
//{@assert
var Valid = global["Valid"] || require("uupaa.valid.js");
//}@assert

var _inNode = "process" in global;

// --- define ----------------------------------------------
var PORT_NUMBER = { "http:": 80, "https": 443, "ws:": 81, "wss:": 816 };
var REGEXP_URL  = /^(\w+:)\/\/((?:([\w:]+)@)?([^\/:]+)(?::(\d*))?)([^ :?#]*)(?:(\?[^#]*))?(?:(#.*))?$/;
                //            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                //  ~~~~~~~~~ [2] ~~~~~~~~~~ ~~~~~~~~~   ~~~~~~~  ~~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //  https://      user:pass@ server      :port    /dir/f.ext   ?key=value    #hash
                //  [1]           [3]        [4]          [5]     [6]          [7]           [8]

var REGEXP_FILE = /^(file:)\/\/(?:localhost)?([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/i;
                //  ~~~~~~~~~~~   ~~~~~~~~~  ~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //                localhost  /dir/f.ext  ?key=value    #hash
                //  [1]                      [2]         [3]           [4]

var REGEXP_PATH = /^([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/;
                //  ~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //  /dir/f.ext  key=value     hash
                //  [1]         [2]           [3]


// --- interface -------------------------------------------
function URI() { // @ret String: current URL.
                 // @help: URI
                 // @desc: get current URL.
    if (global["location"]) {
        return global["location"]["href"] || "";
    }
    return "";
}

URI["repository"]   = "https://github.com/uupaa/URI.js";
URI["parse"]        = URI_parse;        // URI.parse(url:URLString):URLObject
URI["build"]        = URI_build;        // URI.build(obj:URLObject):URLString
URI["resolve"]      = URI_resolve;      // URI.resolve(url:URLString):URLString
URI["normalize"]    = URI_normalize;    // URI.normalize(url:URLString):URLString
URI["isAbsolute"]   = URI_isAbsolute;   // URI.isAbsolute(url:URLString):Boolean
URI["isRelative"]   = URI_isRelative;   // URI.isRelative(url:URLString):Boolean
URI["buildQuery"]   = URI_buildQuery;   // URI.buildQuery(url:URLQueryObject, joint:String = "&"):URLQueryString
URI["parseQuery"]   = URI_parseQuery;   // URI.parseQuery(queryString:URLString/URLQueryString):URLQueryObject
URI["encode"]       = global["encodeURIComponent"] || URI_encode; // URI.encode(source:String):String
URI["decode"]       = global["decodeURIComponent"] || URI_decode; // URI.decode(source:String):String

// --- implement -------------------------------------------
function URI_parse(url) { // @arg URLString: absolute url or relative url
                          // @ret URLObject: { href, ... fragment, error }
                          // @help: URI.parse
                          // @desc: parse URL
//{@assert
    _if(!Valid.type(url, "String"), "URI.parse(url)");
//}@assert

    var m = REGEXP_FILE.exec(url);

    if (m) {
        return _createURLObject({
            "href":     url,
            "protocol": m[1],
            "path":    (m[2] || "") + (m[3] || "") + (m[4] || ""),
            "pathname": m[2],
            "search":   m[3],
            "fragment": m[4]
        });
    }
    m = REGEXP_URL.exec(url);
    if (m) {
        return _createURLObject({
            "href":     url,
            "protocol": m[1],
            "secure":   m[1] === "https:" || m[1] === "wss:",
            "host":     m[2],
            "auth":     m[3],
            "hostname": m[4],
            "port":     m[5] ? +m[5] : (PORT_NUMBER[m[1]] || 0),
            "path":    (m[6] || "") + (m[7] || "") + (m[8] || ""),
            "pathname": m[6],
            "search":   m[7],
            "fragment": m[8]
        });
    }
    m = REGEXP_PATH.exec(url);
    if (m) {
        return _createURLObject({
            "href":     url,
            "path":    (m[1] || "") + (m[2] || "") + (m[3] || ""),
            "pathname": m[1],
            "search":   m[2],
            "fragment": m[3]
        });
    }
    return _createURLObject({ "href": url, "pathname": url, "error": true });
}

function _createURLObject(obj) { // @arg URLObject:
                                 // @ret URLObject:
    var path = obj["pathname"].split("/");

    obj["href"]     = obj["href"]     || "";
    obj["protocol"] = obj["protocol"] || "";
    obj["scheme"]   = obj["protocol"] || ""; // [alias]
    obj["secure"]   = obj["secure"]   || false;
    obj["host"]     = obj["host"]     || "";
    obj["auth"]     = obj["auth"]     || "";
    obj["hostname"] = obj["hostname"] || "";
    obj["port"]     = obj["port"]     || 0;
    obj["path"]     = obj["path"]     || "";
    obj["pathname"] = obj["pathname"] || "";
    obj["file"]     = path.pop();
    obj["dir"]      = path.join("/");
    obj["search"]   = obj["search"]   || "";
    obj["query"]    = URI_parseQuery(obj["search"]);
    obj["fragment"] = obj["fragment"] || "";
    obj["error"]    = obj["error"]    || false;
    return obj;
}

function URI_build(obj) { // @arg URLObject: { protocol, host, pathname, search, fragment }
                          // @ret URLString: "{protocol}//{host}{pathname}?{search}#{fragment}"
                          // @help: URI.build
                          // @desc: build URL
//{@assert
    _if(!Valid.type(obj, "Object"), "URI.build(obj)");
//}@assert

    var slash = obj["protocol"] === "file:" ? "///"
                                            : "//";
    return [
        obj["protocol"],
        obj["protocol"] ? slash : "",
        obj["host"]     || "",
        obj["pathname"] || "/",
        obj["search"]   || "",
        obj["fragment"] || ""
    ].join("");
}

function URI_resolve(url) { // @arg URLString: relative URL or absolute URL
                            // @ret URLString: absolute URL
                            // @help: URI.resolve
                            // @desc: Convert relative URL to absolute URL.
//{@assert
    _if(!Valid.type(url, "String"), "URI.resolve(url)");
//}@assert

    if (URI_isAbsolute(url)) {
        return url;
    }
    if ("document" in global) { // in Browser
        var a = global["document"]["createElement"]("a");

        a["setAttribute"]("href", url);       // <a href="hoge.htm">
        return a["cloneNode"](false)["href"]; // -> "http://example.com/hoge.htm"
    }
    throw new Error("URI.resolve will not work");
}

function URI_normalize(url) { // @arg URLString:
                              // @ret URLString:
                              // @help: URI.normalize
                              // @desc: Path normalize.
//{@assert
    _if(!Valid.type(url, "String"), "URI.normalize(url)");
//}@assert

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

function URI_isAbsolute(url) { // @arg URLString:
                               // @ret Boolean: true is absolute url
                               // @help: URI.isAbsolute
                               // @desc: URL is absolute.
//{@assert
    _if(!Valid.type(url, "String"), "URI.isAbsolute(url)");
//}@assert

    return /^(https?|wss?):/.test(url) ? REGEXP_URL.test(url)
                                       : REGEXP_FILE.test(url);
}

function URI_isRelative(url) { // @arg URLString:
                               // @ret Boolean: true is relative url
                               // @help: URI.isRelative
                               // @desc: URL is relative.
//{@assert
    _if(!Valid.type(url, "String"), "URI.isRelative(url)");
//}@assert

    return REGEXP_URL.test("http://a.a/" + url.replace(/^\/+/, ""));
}

function URI_buildQuery(queryObject, // @arg URLQueryObject: { key1: "a", key2: "b", key3: [0, 1] }
                        joint) {     // @arg String(= "&"): joint string "&" or "&amp;" or ";"
                                     // @ret URLQueryString: "key1=a&key2=b&key3=0&key3=1"
                                     // @help: URI.buileQuery
                                     // @desc: build query string
//{@assert
    _if(!Valid.type(queryObject, "Object"), "URI.buileQuery(queryObject)");
    _if(!Valid.type(joint, "String/omit"),  "URI.buileQuery(,joint)");
//}@assert

    joint = joint || "&";

    var rv = [];

    for (var key in queryObject) {
        var encodedKey = URI["encode"](key);
        var value = queryObject[key];

        if (!Array.isArray(value)) {
            value = [value]; // to Array
        }
        // "key3=0&key3=1"
        for (var token = [], i = 0, iz = value.length; i < iz; ++i) {
            token.push( encodedKey + "=" + URI["encode"](value[i]) );
        }
        rv.push( token.join(joint) );
    }
    return rv.join(joint); // "key1=a&key2=b&key3=0&key3=1"
}

function URI_parseQuery(queryString) { // @arg URLString/URLQueryString: "key1=a;key2=b;key3=0;key3=1"
                                       // @ret URLQueryObject: { key1: "a", key2: "b", key3: ["0", "1"] }
                                       // @help: URI.parseQuery
                                       // @desc: parse query string
//{@assert
    _if(!Valid.type(queryString, "String/Object"), "URI.parseQuery(queryString)");
//}@assert

    function _parseQuery(_, key, value) {
        var encodedKey   = URI["encode"](key),
            encodedValue = URI["encode"](value);

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
//{@assert
    _if(!Valid.type(source, "String"), "URI.encode(source)");
//}@assert

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
//{@assert
    _if(!Valid.type(source, "String"), "URI.decode(source)");
//}@assert

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

//{@assert
function _if(value, msg) {
    if (value) {
        console.error(Valid.stack(msg));
        throw new Error(msg);
    }
}
//}@assert

// --- export ----------------------------------------------
//{@node
if (_inNode) {
    module["exports"] = URI;
}
//}@node
if (global["URI"]) {
    global["URI_"] = URI; // already exsists
} else {
    global["URI"]  = URI;
}

})((this || 0).self || global);

