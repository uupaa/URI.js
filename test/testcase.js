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
        testURI_parse,
        testURI_parse2,
        testURI_parse3,
        testURI_parse4,
        testURI_parse5,
        testURI_parse6,
        testURI_valid,
        testURI_validArray,
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
        testURI_isBlob,
        testURI_getDir,
    ]);
}
if (IN_BROWSER || IN_NW || IN_EL) {
    test.add([
    ]);
}
if (IN_WORKER) {
    test.add([
    ]);
}
if (IN_NODE) {
    test.add([
    ]);
}

// --- test cases ------------------------------------------
/*
function testURIGetCurrentURI(test) {

    var url = WebModule.URI(); // get current URI
    var obj = WebModule.URI.parse(url);

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

function testURI_parse(test, pass, miss) {
    var href = "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash";

    var obj = WebModule.URI.parse(href);

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

function testURI_parse2(test, pass, miss) {
    var href = "/dir1/dir2/file.ext?a=b;c=d#hash"; // root and absolute

    var obj = WebModule.URI.parse(href);

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

function testURI_parse3(test, pass, miss) {
    var href = "./dir1/dir2/file.ext?a=b;c=d#hash"; // retative

    var obj = WebModule.URI.parse(href);

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

function testURI_parse4(test, pass, miss) {
    var href = "file://localhost/dir1/dir2/file.ext?a=b;c=d#hash"; // file and localhost

    var obj = WebModule.URI.parse(href);

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

function testURI_parse5(test, pass, miss) {
    var href = "file:///dir1/dir2/file.ext?a=b;c=d#hash"; // file without localhost

    var obj = WebModule.URI.parse(href);

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

function testURI_parse6(test, pass, miss) {
    var href = "file:///";

    var obj = WebModule.URI.parse(href);

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

function testURI_valid(test, pass, miss) {

    var invalidURL = "http://example.com:port/dir/file.exe?key=value#hash";

    if ( WebModule.URI.isValid(invalidURL) ) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}
function testURI_validArray(test, pass, miss) {

    var invalidSource = [
            "<html>",
            "123://dir/file.exe?key=value#hash",
        ];
    var validSource = [
            "http://example.com:port/dir/file.exe?key=value#hash",
            "ht.tp://example.com:port/dir/file.exe?key=value#hash",
            "./dir/file.exe?key=value#hash",
            "C:/dir/file.exe?key=value#hash",
            "file://C:/dir/file.exe?key=value#hash",
        ];

    if ( !WebModule.URI.isValid(invalidSource) ) {
        if ( WebModule.URI.isValid(validSource) ) {
            test.done(pass());
            return;
        }
    }
    test.done(miss());
}
function testURI_parseAndBuild(test, pass, miss) {

    var absurl = "http://example.com/dir/file.exe?key=value#hash";
    var parsed = WebModule.URI.parse(absurl);
    var revert = WebModule.URI.build(parsed);

    var ok = revert === absurl; // URI.build

    if (ok) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURI_isAbsoluteURL(test, pass, miss) {
    var url = {
            1: URI.isAbsolute("http://example.com"),
            2: URI.isAbsolute("https://example.com"),
            3: !URI.isAbsolute("//example.com"),
        };

    if ( /false/.test(JSON.stringify(url)) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}

function testURI_isRelativeURL(test, pass, miss) {
    var url = {
            1: URI.isRelative("/dir/file.ext"),
            2: URI.isRelative("//example.com"),
        };

    if ( /false/.test(JSON.stringify(url)) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}

function testURI_resolveAbsoluteURL(test, pass, miss) {
    var src = "http://example.com/dir/file.ext";
    var abs = WebModule.URI.resolve(src);
    var url = WebModule.URI.build(WebModule.URI.parse(abs));

    if (src === url) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURI_resolveWithoutBasePath(test, pass, miss) {
    var src = "/dir/file.ext";

    if (IN_NODE || IN_WORKER) {
        var abs = WebModule.URI.resolve(src);

        if (abs === src) {
            test.done(pass());
        } else {
            test.done(miss());
        }
    } else if (IN_BROWSER || IN_NW) {
        var abs = WebModule.URI.resolve(src);
        var obj = WebModule.URI.parse(abs);

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
    var abs = WebModule.URI.resolve(src, "http://localhost:8080/");
    var obj = WebModule.URI.parse(abs);

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
            "http://example.com///..//hoge/....//huga.ext": "http://example.com/hoge/huga.ext"
        };

    var ok = true;

    for (var url in items) {
        var result = items[url];
        if (WebModule.URI.normalize(url) !== result) {
            console.error("url = " + url, "normalize = ", WebModule.URI.normalize(url), "result = ", result);
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
    var url = "http://example.com?key1=a;key2=b;key3=0;key3=1";

    var urlQueryObject = WebModule.URI.parseQuery(url);

    var result = JSON.stringify( urlQueryObject );

    if (result === '{"key1":"a","key2":"b","key3":["0","1"]}') {
        test.done(pass());
    } else {
        test.done(miss());
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

    var testCase = [
            "http://example.com/",
            "http://example.com/?a=b",
            "http://example.com/?a=b&c=d",
            "http://example.com/?a=b&c=d#foo",
        ];

    var ok = testCase.every(function(src) {
                var url = WebModule.URI.addCacheBustingKeyword(src, "xyz");

                if (!WebModule.URI.isValid(url)) {
                    return false;
                }

                var queryObject = WebModule.URI.parseQuery(url);

                if (queryObject.xyz) {
                    return true;
                }
                return false;
            });

    WebModule.URI.addCacheBustingKeyword(testCase[0]); // omit keyword

    if (ok) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURI_match(test, pass, miss) {

    var result = [
        WebModule.URI.match("http://example.com/**/*.png",
                            "http://example.com/dir1/dir2/file.png"),
        WebModule.URI.match("http://example.com/dir1/a.png",
                            "http://example.com/dir1/a.png"),
        WebModule.URI.match("http://example.com/dir2/*.png",
                            "http://example.com/dir2/a.png"),
        WebModule.URI.match("http://example.com/dir3/**/*",
                            "http://example.com/dir3/a/b/c/d"),
        WebModule.URI.match("http://example.com/dir3/**/*",
                            "http://example.com/dir3/a/b/c/d.png"),
        WebModule.URI.match("http://example.com/**",
                            "http://example.com/dir3/a1/b1/c1/d1.png"),
        WebModule.URI.match("http://example.com/dir*/**/b1/**/*",
                            "http://example.com/dir3/a1/b1/c1/d1.png"),

        !WebModule.URI.match("http://example.com/hoge/**",
                             "http://example.com/dir3/a1/b1/c1/d1.png"),
        !WebModule.URI.match("http://example.com/dir*/**/x1/**/*",
                             "http://example.com/dir3/a1/b1/c1/d1.png"),

        WebModule.URI.match("http://example.com/dir*/**/b1/**/*",
                            "http://example.com/dir3/a1/xx/b1/zz/c1/d1.png"),

        WebModule.URI.match("/**", "/dir3/a1/b1/c1/d1.png"),
        WebModule.URI.match("**/*.png", "dir3/a1/b1/c1/d1.png"),
        !WebModule.URI.match("**/*.gif", "dir3/a1/b1/c1/d1.png"),

        WebModule.URI.match("./assets/1.png",
                            "assets/1.png"),
        WebModule.URI.match("assets/1.png",
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

function testURI_isBlob(test, pass, miss) {
    var blobURL1 = "blob:https://example.org/9115d58c-bcda-ff47-86e5-083e9a215304";
    var blobURL2 = "blob:https://example.org/9115d58c-bcda-ff47-86e5-083e9a215304#hello";
    var notBlobURL1 = "";
    var notBlobURL2 = "blob:";

    if ( WebModule.URI.isBlob(blobURL1) &&
         WebModule.URI.isBlob(blobURL2) &&
         !WebModule.URI.isBlob(notBlobURL1) &&
         !WebModule.URI.isBlob(notBlobURL2) ) {
        test.done(pass());
    } else {
        test.done(miss());
    }
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

return test.run();

})(GLOBAL);

