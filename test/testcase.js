var ModuleTestURI = (function(global) {

var test = new Test(["URI"], { // Add the ModuleName to be tested here (if necessary).
        disable:    false, // disable all tests.
        browser:    true,  // enable browser test.
        worker:     true,  // enable worker test.
        node:       true,  // enable node test.
        nw:         true,  // enable nw.js test.
        el:         true,  // enable electron (render process) test.
        button:     true,  // show button.
        both:       true,  // test the primary and secondary modules.
        ignoreError:false, // ignore error.
        callback:   function() {
        },
        errorback:  function(error) {
            console.error(error.message);
        }
    });

if (IN_BROWSER || IN_NW || IN_EL || IN_WORKER || IN_NODE) {
    test.add([
        testURI_parse_http,
        testURI_parse_relpath_root,
        testURI_parse_relpath_noroot,
        testURI_parse_file_with_localhost,
        testURI_parse_file_without_localhost,
        testURI_parse_file_root,
        testURI_parse_blob_http,
        testURI_parse_HTTP,
        testURI_isValid,
        testURI_parseAndBuild,
        testURI_isAbsoluteURL,
        testURI_isRelativeURL,
        testURI_resolveAbsoluteURL,
        testURI_resolveWithoutBasePath,
        testURI_resolveWithBasePath,
        testURI_normalize,
        testURI_queryString,
        testURI_encodeURIComponent,
        testURI_decodeURIComponent,
        testURI_cacheBustring,
        testURI_match,
        testURI_getDir,
        testURI_getExt,
        testURI_getProtocol,
        testURI_isBlob,
    ]);
}

// --- test cases ------------------------------------------
/*
function testURIGetCurrentURI(test) {

    var url = URI(); // get current URI
    var obj = URI.parse(url);

    // location.href is "URI.js/test/"
    //               or "URI.js/test/index.html"

    if (obj.dir.split("/").pop() === "test" && (obj.file === "" ||
                                                obj.file === "index.html")) {
        test && test.pass();
    } else {
        test && test.miss();
    }
}
 */

function testURI_parse_http(test, pass, miss) {
    var href = "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash";

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "http:" &&
        obj.origin   === "http://example.com:8080" &&
        obj.host     === "example.com:8080" &&
        obj.hostname === "example.com" &&
        obj.port     === "8080" &&
        obj.username === "user" &&
        obj.password === "pass" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.hash     === "#hash") {

        // check extras properties
        if (obj.scheme   === "http:" &&
          //obj.path     === "/dir1/dir2/file.ext?a=b;c=d#hash" &&
            obj.path     === "/dir1/dir2/file.ext?a=b;c=d" &&
            obj.dir      === "/dir1/dir2" &&
            obj.file     === "file.ext" &&
            obj.fragment === "#hash") {

            test.done(pass());
            return;
        }
    }
    test.done(miss());
}

function testURI_parse_relpath_root(test, pass, miss) {
    var href = "/dir1/dir2/file.ext?a=b;c=d#hash"; // root and absolute

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "" &&
        obj.origin   === "" &&
        obj.host     === "" &&
        obj.hostname === "" &&
        obj.port     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.hash     === "#hash") {

        // check extras properties
        if (obj.scheme   === "" &&
          //obj.path     === "/dir1/dir2/file.ext?a=b;c=d#hash" &&
            obj.path     === "/dir1/dir2/file.ext?a=b;c=d" &&
            obj.dir      === "/dir1/dir2" &&
            obj.file     === "file.ext" &&
            obj.fragment === "#hash") {

            test.done(pass());
            return;
        }
    }
    test.done(miss());
}

function testURI_parse_relpath_noroot(test, pass, miss) {
    var href = "./dir1/dir2/file.ext?a=b;c=d#hash"; // retative

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "" &&
        obj.origin   === "" &&
        obj.host     === "" &&
        obj.hostname === "" &&
        obj.port     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.pathname === "./dir1/dir2/file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.hash     === "#hash") {

        // check extras properties
        if (obj.scheme   === "" &&
          //obj.path     === "./dir1/dir2/file.ext?a=b;c=d#hash" &&
            obj.path     === "./dir1/dir2/file.ext?a=b;c=d" &&
            obj.dir      === "./dir1/dir2" &&
            obj.file     === "file.ext" &&
            obj.fragment === "#hash") {

            test.done(pass());
            return;
        }
    }
    test.done(miss());
}

function testURI_parse_file_with_localhost(test, pass, miss) {
    var href = "file://localhost/dir1/dir2/file.ext?a=b;c=d#hash"; // file and localhost

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "file:" &&
        obj.origin   === "file://localhost" &&
        obj.host     === "localhost" &&
        obj.hostname === "localhost" &&
        obj.port     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.hash     === "#hash") {

        // check extras properties
        if (obj.scheme   === "file:" &&
          //obj.path     === "/dir1/dir2/file.ext?a=b;c=d#hash" &&
            obj.path     === "/dir1/dir2/file.ext?a=b;c=d" &&
            obj.dir      === "/dir1/dir2" &&
            obj.file     === "file.ext" &&
            obj.fragment === "#hash") {

            test.done(pass());
            return;
        }
    }
    test.done(miss());
}

function testURI_parse_file_without_localhost(test, pass, miss) {
    var href = "file:///dir1/dir2/file.ext?a=b;c=d#hash"; // file without localhost

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "file:" &&
        obj.origin   === "file://" &&
        obj.host     === "" &&
        obj.hostname === "" &&
        obj.port     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.hash     === "#hash") {

        // check extras properties
        if (obj.scheme   === "file:" &&
          //obj.path     === "/dir1/dir2/file.ext?a=b;c=d#hash" &&
            obj.path     === "/dir1/dir2/file.ext?a=b;c=d" &&
            obj.dir      === "/dir1/dir2" &&
            obj.file     === "file.ext" &&
            obj.fragment === "#hash") {

            test.done(pass());
            return;
        }
    }
    test.done(miss());
}

function testURI_parse_file_root(test, pass, miss) {
    var href = "file:///";

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "file:" &&
        obj.scheme   === "file:" &&
        obj.origin   === "file://" &&
        obj.host     === "" &&
        obj.hostname === "" &&
        obj.port     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.path     === "/" &&
        obj.pathname === "/" &&
        obj.dir      === "" &&
        obj.file     === "" &&
        obj.search   === "" &&
        obj.hash     === "" &&
        obj.fragment === "") {

        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURI_parse_blob_http(test, pass, miss) {
    var href = "blob:http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash";

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.prefix   === "blob:" &&
        obj.protocol === "http:" &&
        obj.origin   === "http://example.com:8080" &&
        obj.host     === "example.com:8080" &&
        obj.hostname === "example.com" &&
        obj.port     === "8080" &&
        obj.username === "user" &&
        obj.password === "pass" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.hash     === "#hash") {

        // check extras properties
        if (obj.scheme   === "http:" &&
          //obj.path     === "/dir1/dir2/file.ext?a=b;c=d#hash" &&
            obj.path     === "/dir1/dir2/file.ext?a=b;c=d" &&
            obj.dir      === "/dir1/dir2" &&
            obj.file     === "file.ext" &&
            obj.fragment === "#hash") {

            test.done(pass());
            return;
        }
    }
    test.done(miss());
}

function testURI_parse_HTTP(test, pass, miss) {
    var href = "HTTP://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash";

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "http:" &&
        obj.origin   === "http://example.com:8080" &&
        obj.host     === "example.com:8080" &&
        obj.hostname === "example.com" &&
        obj.port     === "8080" &&
        obj.username === "user" &&
        obj.password === "pass" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.hash     === "#hash") {

        // check extras properties
        if (obj.scheme   === "http:" &&
          //obj.path     === "/dir1/dir2/file.ext?a=b;c=d#hash" &&
            obj.path     === "/dir1/dir2/file.ext?a=b;c=d" &&
            obj.dir      === "/dir1/dir2" &&
            obj.file     === "file.ext" &&
            obj.fragment === "#hash") {

            test.done(pass());
            return;
        }
    }
    test.done(miss());
}

function testURI_isValid(test, pass, miss) {

    var result = {
        0: URI.isValid("http://example.com:port/dir/file.exe?key=value#hash") === true,
        1: URI.isValid("HTTP://example.com:port/dir/file.exe?key=value#hash") === true,
        2: URI.isValid("blob:http://example.com:port/dir/file.exe?key=value#hash") === true,
        3: URI.isValid("<html>") === false,
        4: URI.isValid("123://dir/file.exe?key=value#hash") === false,
        5: URI.isValid("http://example.com:port/dir/file.exe?key=value#hash") === true,
        6: URI.isValid("ht.tp://example.com:port/dir/file.exe?key=value#hash") === true,
        7: URI.isValid("./dir/file.exe?key=value#hash") === true,
        8: URI.isValid("C:/dir/file.exe?key=value#hash") === true,
        9: URI.isValid("file://C:/dir/file.exe?key=value#hash") === true,
       10: URI.isValid("http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash") === true,
       11: URI.isValid("blob:http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash") === true,
    };

    if ( /false/.test(JSON.stringify(result)) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}

function testURI_parseAndBuild(test, pass, miss) {

    var absurl = "http://example.com/dir/file.exe?key=value#hash";
    var parsed = URI.parse(absurl);
    var revert = URI.build(parsed);

    var ok = revert === absurl; // URI.build

    if (ok) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURI_isAbsoluteURL(test, pass, miss) {
    var url = {
            1: URI.isAbsolute("http://example.com")                                    === true,
            2: URI.isAbsolute("https://example.com")                                   === true,
            3: URI.isAbsolute("blob:http://example.com")                               === true,
            4: URI.isAbsolute("//example.com")                                         === false,
            5: URI.isAbsolute("http://example.com/dir/file.ext?query=value#hash")      === true,
            6: URI.isAbsolute("blob:http://example.com/dir/file.ext?query=value#hash") === true,
            7: URI.isAbsolute("./dir/file.ext?a=b#hash")                               === false,
            8: URI.isAbsolute("file:///dir/file.ext?a=b#hash")                         === true,
            9: URI.isAbsolute("file://localhost/dir/file.ext?a=b#hash")                === true,
        };

    if ( /false/.test(JSON.stringify(url)) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}

function testURI_isRelativeURL(test, pass, miss) {
    var url = {
            1: URI.isRelative("/dir/file.ext") === true,
            2: URI.isRelative("//example.com") === true,
            3: URI.isRelative("c:/example.com") === false,
        };

    if ( /false/.test(JSON.stringify(url)) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}

function testURI_resolveAbsoluteURL(test, pass, miss) {
    var src = "http://example.com/dir/file.ext";
    var abs = URI.resolve(src);
    var url = URI.build(URI.parse(abs));

    if (src === url) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURI_resolveWithoutBasePath(test, pass, miss) {
    var src = "/dir/file.ext";

    if (IN_NODE || IN_WORKER) {
        var abs = URI.resolve(src);

        if (abs === src) {
            test.done(pass());
        } else {
            test.done(miss());
        }
    } else if (IN_BROWSER || IN_NW) {
        var abs = URI.resolve(src);
        var obj = URI.parse(abs);

        if (/file|http/.test(obj.protocol) &&
            obj.path.lastIndexOf("/dir/file.ext") >= 0) {

            test.done(pass());
        } else {
            test.done(miss());
        }
    } else {
        test.done(miss());
    }
}

function testURI_resolveWithBasePath(test, pass, miss) {
    var src = "/dir/file.ext";
    var abs = URI.resolve(src, "http://localhost:8080/");
    var obj = URI.parse(abs);

    if (obj.protocol === "http:" &&
        obj.port     === "8080" &&
        obj.path     === "/dir/file.ext") {

        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURI_normalize(test, pass, miss) {
    var items = {
            // url                      result
            "dir/.../a.file":           "dir/a.file",
            "/dir/.../a.file":          "/dir/a.file",
            "../../../../a.file":       "/a.file",
            "dir/dir2///.//.../a.file": "dir/dir2/a.file",
            "dir/.../a.file":           "dir/a.file",
            "../../../../a.file":       "/a.file",
            "http://example.com/../../../../a.file":        "http://example.com/a.file",
            "http://example.com/././//./.../a.file":        "http://example.com/a.file",
            "http://example.com///..//hoge/....//huga.ext": "http://example.com/hoge/huga.ext",
            "blob:http://example.com///..//hoge/....//huga.ext": "blob:http://example.com/hoge/huga.ext",
        };

    var ok = true;

    for (var url in items) {
        var result = items[url];
        if (URI.normalize(url) !== result) {
            console.error("url = " + url, "normalize = ", URI.normalize(url), "result = ", result);
            ok = false;
            break;
        }
    }

    if (ok) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURI_queryString(test, pass, miss) {
    var result = {
        0: JSON.stringify( URI.parseQuery( "http://example.com?key1=a;key2=b;key3=0;key3=1" ) ) === '{"key1":"a","key2":"b","key3":["0","1"]}',
        1: JSON.stringify( URI.parseQuery( "file://example.com?key1=a;key2=b;key3=0;key3=1" ) ) === '{"key1":"a","key2":"b","key3":["0","1"]}',
        2: JSON.stringify( URI.parseQuery( "blob:http://example.com?key1=a;key2=b;key3=0;key3=1" ) ) === '{"key1":"a","key2":"b","key3":["0","1"]}',
    };

    if ( /false/.test(JSON.stringify(result)) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}

function testURI_encodeURIComponent(test, pass, miss) {

    var source = "123ABCあいう!%#";
    var code   = encodeURIComponent(source);
    var revert = decodeURIComponent(code);

    if (source === revert) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURI_decodeURIComponent(test, pass, miss) {

    var source = "123ABCあいう!%#";
    var code   = encodeURIComponent(source);
    var revert = decodeURIComponent(code);

    if (source === revert) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURI_cacheBustring(test, pass, miss) {
    var result = {
        0: URI.parseQuery( URI.addCacheBustingKeyword("http://example.com/",             "xyz") ).xyz !== "",
        1: URI.parseQuery( URI.addCacheBustingKeyword("http://example.com/?a=b",         "xyz") ).xyz !== "",
        2: URI.parseQuery( URI.addCacheBustingKeyword("http://example.com/?a=b&c=d",     "xyz") ).xyz !== "",
        3: URI.parseQuery( URI.addCacheBustingKeyword("http://example.com/?a=b&c=d#foo", "xyz") ).xyz !== "",
        4: URI.parseQuery( URI.addCacheBustingKeyword("blob:http://example.com/?a=b&c=d#foo", "xyz") ).xyz !== "",
    };

    if ( /false/.test(JSON.stringify(result)) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}

function testURI_match(test, pass, miss) {

    var result = [
        URI.match("http://example.com/**/*.png",
                  "http://example.com/dir1/dir2/file.png"),
        URI.match("http://example.com/dir1/a.png",
                  "http://example.com/dir1/a.png"),
        URI.match("http://example.com/dir2/*.png",
                  "http://example.com/dir2/a.png"),
        URI.match("http://example.com/dir3/**/*",
                  "http://example.com/dir3/a/b/c/d"),
        URI.match("http://example.com/dir3/**/*",
                  "http://example.com/dir3/a/b/c/d.png"),
        URI.match("http://example.com/**",
                  "http://example.com/dir3/a1/b1/c1/d1.png"),
        URI.match("http://example.com/dir*/**/b1/**/*",
                  "http://example.com/dir3/a1/b1/c1/d1.png"),

        URI.match("http://example.com/hoge/**",
                  "http://example.com/dir3/a1/b1/c1/d1.png") === false,
        URI.match("http://example.com/dir*/**/x1/**/*",
                  "http://example.com/dir3/a1/b1/c1/d1.png") === false,

        URI.match("http://example.com/dir*/**/b1/**/*",
                  "http://example.com/dir3/a1/xx/b1/zz/c1/d1.png"),

        URI.match("/**", "/dir3/a1/b1/c1/d1.png"),
        URI.match("**/*.png", "dir3/a1/b1/c1/d1.png"),
        URI.match("**/*.gif", "dir3/a1/b1/c1/d1.png") === false,

        URI.match("./assets/1.png",
                  "assets/1.png"),
        URI.match("assets/1.png",
                  "./assets/1.png"),
    ];

    if ( /false/.test(result.join(",")) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}

function testValidRegisterTypes(test, pass, miss) {

    var validUrlStringArray = [
            "http://example.com/a.png",
            "http://example.com/a.png#hoge"
        ];
    var invalidUrlStringArray = [
            "!http://example.com/a.png",
            "http:///example.com/a.png#hoge"
        ];

    if (Valid.type(validUrlStringArray[0], "URLString")) {
        if (!Valid.type(invalidUrlStringArray[0], "URLStringArray")) {
            if (Valid.type(validUrlStringArray, "URLStringArray")) {
                if (!Valid.type(invalidUrlStringArray, "URLStringArray")) {
                    test.done(pass());
                    return;
                }
            }
        }
    }
    test.done(miss());
    return;
}

function testURI_getDir(test, pass, miss) {
    var result = {
            1: URI.getDir("http://example.com/a/b/c.ext")           === "/a/b/",
            2: URI.getDir("https://example.com/a/b/c.ext?a=1#foo")  === "/a/b/",
            3: URI.getDir("https://example.com/?a=1#foo")           === "/",
            4: URI.getDir("https://example.com")                    === "/",
        };

    if ( /false/.test(JSON.stringify(result)) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}

function testURI_getExt(test, pass, miss) {
    var result = {
            1: URI.getExt("http://example.com/a/b/c.ext")           === "ext",
            2: URI.getExt("https://example.com/a/b/c.ext?a=1#foo")  === "ext",
            3: URI.getExt("https://example.com/?a=1#foo")           === "",
            4: URI.getExt("https://example.com")                    === "",
        };

    if ( /false/.test(JSON.stringify(result)) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}

function testURI_getProtocol(test, pass, miss) {
    var result = [
        URI.getProtocol("blob:https://example.org/9115d58c-bcda-ff47-86e5-083e9a215304") === "https:",
        URI.getProtocol("blob:https://example.org/9115d58c-bcda-ff47-86e5-083e9a215304#hello") === "https:",
        URI.getProtocol("blob:") === "",
        URI.getProtocol("file:///dir/file.ext") === "file:",
        URI.getProtocol("file://localhost/dir/file.ext") === "file:",
        URI.getProtocol("file:") === "file:",
        URI.getProtocol("http://example.com/dir/file.ext") === "http:",
        URI.getProtocol("HTTPS://example.com/dir/file.ext") === "https:",
        URI.getProtocol("http:") === "http:",
        URI.getProtocol("ws://example.com/dir/file.ext") === "ws:",
        URI.getProtocol("wss://example.com/dir/file.ext") === "wss:",
        URI.getProtocol("ws:") === "ws:",
        URI.getProtocol("") === "",
    ];

    if ( /false/.test(JSON.stringify(result)) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}

function testURI_isBlob(test, pass, miss) {
    var result = [
        URI.isBlob("blob:https://example.org/9115d58c-bcda-ff47-86e5-083e9a215304") === true,
        URI.isBlob("blob:https://example.org/9115d58c-bcda-ff47-86e5-083e9a215304#hello") === true,
        URI.isBlob("blob:") === true,
        URI.isBlob("file:///dir/file.ext") === false,
        URI.isBlob("file://localhost/dir/file.ext") === false,
        URI.isBlob("http://example.com/dir/file.ext") === false,
        URI.isBlob("HTTPS://example.com/dir/file.ext") === false,
        URI.isBlob("ws://example.com/dir/file.ext") === false,
        URI.isBlob("wss://example.com/dir/file.ext") === false,
        URI.isBlob("") === false,
    ];

    if ( /false/.test(JSON.stringify(result)) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}


return test.run();

})(GLOBAL);

