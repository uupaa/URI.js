var ModuleTestURI = (function(global) {

var _inNode    = "process"        in global;
var _inWorker  = "WorkerLocation" in global;
var _inBrowser = "document"       in global;

var test = new Test("URI", {
        disable:    false,
        browser:    true,
        worker:     true,
        node:       true,
        button:     true,
        both:       true,
    }).add([
        testURIParse,
        testURIParse2,
        testURIParse3,
        testURIParse4,
        testURIParse5,
        testURIParse6,
        testURIParseAndBuild,
        testURIIsAbsolute,
        testURIIsRelative,
        testURINormalize,
        testURIQueryString,
        testEncodeURIComponent,
        testDecodeURIComponent,
    ]);

if (!_inWorker && _inBrowser) {
    test.add([
        //testURIGetCurrentURI,
        testURIResolve
    ]);
}

test.run().clone();


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

function testURIParse(test, pass, miss) {
    var href = "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#fragment";

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "http:" &&
        obj.scheme   === "http:" &&
        obj.origin   === "http://example.com:8080" &&
        obj.host     === "example.com:8080" &&
        obj.hostname === "example.com" &&
        obj.port     === "8080" &&
        obj.secure   === false &&
        obj.auth     === "user:pass" &&
        obj.username === "user" &&
        obj.password === "pass" &&
        obj.path     === "/dir1/dir2/file.ext?a=b;c=d#fragment" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.dir      === "/dir1/dir2" &&
        obj.file     === "file.ext" &&
        obj.search   === "?a=b;c=d" &&
      //obj.query.a  === "b" &&
      //obj.query.c  === "d" &&
        obj.fragment === "#fragment" &&
        obj.hash     === "#fragment" &&
        obj.error    === false) {

        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURIParse2(test, pass, miss) {
    var href = "/dir1/dir2/file.ext?a=b;c=d#fragment"; // root and absolute

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "" &&
        obj.scheme   === "" &&
        obj.origin   === "" &&
        obj.host     === "" &&
        obj.hostname === "" &&
        obj.port     === "" &&
        obj.secure   === false &&
        obj.auth     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.path     === "/dir1/dir2/file.ext?a=b;c=d#fragment" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.dir      === "/dir1/dir2" &&
        obj.file     === "file.ext" &&
        obj.search   === "?a=b;c=d" &&
      //obj.query.a  === "b" &&
      //obj.query.c  === "d" &&
        obj.fragment === "#fragment" &&
        obj.hash     === "#fragment" &&
        obj.error    === false) {

        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURIParse3(test, pass, miss) {
    var href = "./dir1/dir2/file.ext?a=b;c=d#fragment"; // retative

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "" &&
        obj.scheme   === "" &&
        obj.origin   === "" &&
        obj.host     === "" &&
        obj.hostname === "" &&
        obj.port     === "" &&
        obj.secure   === false &&
        obj.auth     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.path     === "./dir1/dir2/file.ext?a=b;c=d#fragment" &&
        obj.pathname === "./dir1/dir2/file.ext" &&
        obj.dir      === "./dir1/dir2" &&
        obj.file     === "file.ext" &&
        obj.search   === "?a=b;c=d" &&
      //obj.query.a  === "b" &&
      //obj.query.c  === "d" &&
        obj.fragment === "#fragment" &&
        obj.hash     === "#fragment" &&
        obj.error    === false) {

        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURIParse4(test, pass, miss) {
    var href = "file://localhost/dir1/dir2/file.ext?a=b;c=d#fragment"; // file and localhost

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "file:" &&
        obj.scheme   === "file:" &&
        obj.origin   === "file://" &&
        obj.host     === "" &&
        obj.hostname === "" &&
        obj.port     === "" &&
        obj.secure   === false &&
        obj.auth     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.path     === "/dir1/dir2/file.ext?a=b;c=d#fragment" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.dir      === "/dir1/dir2" &&
        obj.file     === "file.ext" &&
        obj.search   === "?a=b;c=d" &&
      //obj.query.a  === "b" &&
      //obj.query.c  === "d" &&
        obj.fragment === "#fragment" &&
        obj.hash     === "#fragment" &&
        obj.error    === false) {

        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURIParse5(test, pass, miss) {
    var href = "file:///dir1/dir2/file.ext?a=b;c=d#fragment"; // file without localhost

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "file:" &&
        obj.scheme   === "file:" &&
        obj.origin   === "file://" &&
        obj.host     === "" &&
        obj.hostname === "" &&
        obj.port     === "" &&
        obj.secure   === false &&
        obj.auth     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.path     === "/dir1/dir2/file.ext?a=b;c=d#fragment" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.dir      === "/dir1/dir2" &&
        obj.file     === "file.ext" &&
        obj.search   === "?a=b;c=d" &&
      //obj.query.a  === "b" &&
      //obj.query.c  === "d" &&
        obj.fragment === "#fragment" &&
        obj.hash     === "#fragment" &&
        obj.error    === false) {

        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURIParse6(test, pass, miss) {
    var href = "file:///";

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "file:" &&
        obj.scheme   === "file:" &&
        obj.origin   === "file://" &&
        obj.host     === "" &&
        obj.hostname === "" &&
        obj.port     === "" &&
        obj.secure   === false &&
        obj.auth     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.path     === "/" &&
        obj.pathname === "/" &&
        obj.dir      === "" &&
        obj.file     === "" &&
        obj.search   === "" &&
        obj.fragment === "" &&
        obj.hash     === "" &&
        obj.error    === false) {

        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURIParseAndBuild(test, pass, miss) {

    var absurl = "http://example.com/dir/file.exe?key=value#hash";
    var parsed = URI.parse(absurl); // URI.parse
    var revert = URI.build(parsed);

    var ok = revert === absurl; // URI.build

    if (ok) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURIIsAbsolute(test, pass, miss) {
    var url = "http://example.com";

    if ( URI.isAbsolute(url) === true) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURIIsRelative(test, pass, miss) {
    var url = "/dir/file.ext";

    if ( URI.isRelative(url) === true) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURIResolve(test, pass, miss) {
    var rel = "/dir/file.ext";
    var abs = URI.resolve(rel);
    var obj = URI.parse(abs);

    if (/file|http/.test(obj.protocol) &&
        obj.dir      === "/dir" &&
        obj.file     === "file.ext") {

        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testURINormalize(test, pass, miss) {
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

function testURIQueryString(test, pass, miss) {
    var url = "http://example.com?key1=a;key2=b;key3=0;key3=1";

    var urlQueryObject = URI.parseQuery(url);

    var result = JSON.stringify( urlQueryObject );

    if (result === '{"key1":"a","key2":"b","key3":["0","1"]}') {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testEncodeURIComponent(test, pass, miss) {

    var source = "123ABCあいう!%#";
    var code   = encodeURIComponent(source);
    var revert = decodeURIComponent(code);

    if (source === revert) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testDecodeURIComponent(test, pass, miss) {

    var source = "123ABCあいう!%#";
    var code   = encodeURIComponent(source);
    var revert = decodeURIComponent(code);

    if (source === revert) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

})((this || 0).self || global);

