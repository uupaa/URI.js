(function(global) {

var _inNode = "process" in global;
var _inWorker = "WorkerLocation" in global;
var _inBrowser = "self" in global;

var test = new Test().add([
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
        testURIGetCurrentURI,
        testURIResolve
    ]);
}

test.run(function(err, test) {
        if (1) {
            err || test.worker(function(err, test) {
                if (!err && typeof URI_ !== "undefined") {
                    var name = Test.swap(URI, URI_);

                    new Test(test).run(function(err, test) {
                        Test.undo(name);
                    });
                }
            });
        }
    });

function testURIGetCurrentURI(next) {

    var url = URI(); // get current URI
    var obj = URI.parse(url);

    // location.href is "URI.js/test/"
    //               or "URI.js/test/index.html"

    if (obj.dir.split("/").pop() === "test" && (obj.file === "" ||
                                                obj.file === "index.html")) {
        console.log("testURI ok");
        next && next.pass();
    } else {
        console.error("testURI ng");
        next && next.miss();
    }
}

function testURIParse(next) {
    var href = "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#fragment";

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "http:" &&
        obj.scheme   === "http:" &&
        obj.secure   === false &&
        obj.host     === "user:pass@example.com:8080" &&
        obj.auth     === "user:pass" &&
        obj.hostname === "example.com" &&
        obj.port     === 8080 &&
        obj.path     === "/dir1/dir2/file.ext?a=b;c=d#fragment" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.dir      === "/dir1/dir2" &&
        obj.file     === "file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.query.a  === "b" &&
        obj.query.c  === "d" &&
        obj.fragment === "#fragment" &&
        obj.error    === false) {

        console.log("testURIParse ok");
        next && next.pass();
    } else {
        console.error("testURIParse ng");
        next && next.miss();
    }
}

function testURIParse2(next) {
    var href = "/dir1/dir2/file.ext?a=b;c=d#fragment"; // root and absolute

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "" &&
        obj.scheme   === "" &&
        obj.secure   === false &&
        obj.host     === "" &&
        obj.auth     === "" &&
        obj.hostname === "" &&
        obj.port     === 0 &&
        obj.path     === "/dir1/dir2/file.ext?a=b;c=d#fragment" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.dir      === "/dir1/dir2" &&
        obj.file     === "file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.query.a  === "b" &&
        obj.query.c  === "d" &&
        obj.fragment === "#fragment" &&
        obj.error    === false) {

        console.log("testURIParse2 ok");
        next && next.pass();
    } else {
        console.error("testURIParse2 ng");
        next && next.miss();
    }
}

function testURIParse3(next) {
    var href = "./dir1/dir2/file.ext?a=b;c=d#fragment"; // retative

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "" &&
        obj.scheme   === "" &&
        obj.secure   === false &&
        obj.host     === "" &&
        obj.auth     === "" &&
        obj.hostname === "" &&
        obj.port     === 0 &&
        obj.path     === "./dir1/dir2/file.ext?a=b;c=d#fragment" &&
        obj.pathname === "./dir1/dir2/file.ext" &&
        obj.dir      === "./dir1/dir2" &&
        obj.file     === "file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.query.a  === "b" &&
        obj.query.c  === "d" &&
        obj.fragment === "#fragment" &&
        obj.error    === false) {

        console.log("testURIParse3 ok");
        next && next.pass();
    } else {
        console.error("testURIParse3 ng");
        next && next.miss();
    }
}

function testURIParse4(next) {
    var href = "file://localhost/dir1/dir2/file.ext?a=b;c=d#fragment"; // file and localhost

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "file:" &&
        obj.scheme   === "file:" &&
        obj.secure   === false &&
        obj.host     === "" &&
        obj.auth     === "" &&
        obj.hostname === "" &&
        obj.port     === 0 &&
        obj.path     === "/dir1/dir2/file.ext?a=b;c=d#fragment" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.dir      === "/dir1/dir2" &&
        obj.file     === "file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.query.a  === "b" &&
        obj.query.c  === "d" &&
        obj.fragment === "#fragment" &&
        obj.error    === false) {

        console.log("testURIParse4 ok");
        next && next.pass();
    } else {
        console.error("testURIParse4 ng");
        next && next.miss();
    }
}

function testURIParse5(next) {
    var href = "file:///dir1/dir2/file.ext?a=b;c=d#fragment"; // file without localhost

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "file:" &&
        obj.scheme   === "file:" &&
        obj.secure   === false &&
        obj.host     === "" &&
        obj.auth     === "" &&
        obj.hostname === "" &&
        obj.port     === 0 &&
        obj.path     === "/dir1/dir2/file.ext?a=b;c=d#fragment" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.dir      === "/dir1/dir2" &&
        obj.file     === "file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.query.a  === "b" &&
        obj.query.c  === "d" &&
        obj.fragment === "#fragment" &&
        obj.error    === false) {

        console.log("testURIParse5 ok");
        next && next.pass();
    } else {
        console.error("testURIParse5 ng");
        next && next.miss();
    }
}

function testURIParse6(next) {
    var href = "file:///";

    var obj = URI.parse(href);

    if (obj.href     === href &&
        obj.protocol === "file:" &&
        obj.scheme   === "file:" &&
        obj.secure   === false &&
        obj.host     === "" &&
        obj.auth     === "" &&
        obj.hostname === "" &&
        obj.port     === 0 &&
        obj.path     === "/" &&
        obj.pathname === "/" &&
        obj.dir      === "" &&
        obj.file     === "" &&
        obj.search   === "" &&
        obj.fragment === "" &&
        obj.error    === false) {

        console.log("testURIParse6 ok");
        next && next.pass();
    } else {
        console.error("testURIParse6 ng");
        next && next.miss();
    }
}

function testURIParseAndBuild(next) {

    var absurl = "http://example.com/dir/file.exe?key=value#hash";
    var urlObject1 = URI.parse(absurl); // URI.parse

    var result1 = URI.build(urlObject1) === absurl; // URI.build

    if (result1) {
        console.log("testURIParseAndBuild ok");
        next && next.pass();
    } else {
        console.error("testURIParseAndBuild ng");
        next && next.miss();
    }
}

function testURIIsAbsolute(next) {
    var url = "http://example.com";

    if ( URI.isAbsolute(url) === true) {
        console.log("testURIIsAbsolute ok");
        next && next.pass();
    } else {
        console.error("testURIIsAbsolute ng");
        next && next.miss();
    }
}

function testURIIsRelative(next) {
    var url = "/dir/file.ext";

    if ( URI.isRelative(url) === true) {
        console.log("testURIIsRelative ok");
        next && next.pass();
    } else {
        console.error("testURIIsRelative ng");
        next && next.miss();
    }
}

function testURIResolve(next) {
    var rel = "/dir/file.ext";
    var abs = URI.resolve(rel);
    var obj = URI.parse(abs);

    if (/file|http/.test(obj.protocol) &&
        obj.dir      === "/dir" &&
        obj.file     === "file.ext") {

        console.log("testURIResolve ok");
        next && next.pass();
    } else {
        console.error("testURIResolve ng");
        next && next.miss();
    }
}

function testURINormalize(next) {
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
        console.log("testURINormalize ok");
        next && next.pass();
    } else {
        console.error("testURINormalize ng");
        next && next.miss();
    }
}

function testURIQueryString(next) {
    var url = "http://example.com?key1=a;key2=b;key3=0;key3=1";

    var urlQueryObject = URI.parseQuery(url);

    var result = JSON.stringify( urlQueryObject );

    if (result === '{"key1":"a","key2":"b","key3":["0","1"]}') {
        console.log("testURIQueryString ok");
        next && next.pass();
    } else {
        console.error("testURIQueryString ng");
        next && next.miss();
    }
}

function testEncodeURIComponent(next) {

    var source = "123ABCあいう!%#";
    var code   = encodeURIComponent(source);
    var revert = decodeURIComponent(code);

    if (source === revert) {
        console.log("testEncodeURIComponent ok");
        next && next.pass();
    } else {
        console.error("testEncodeURIComponent ok");
        next && next.miss();
    }
}

function testDecodeURIComponent(next) {

    var source = "123ABCあいう!%#";
    var code   = encodeURIComponent(source);
    var revert = decodeURIComponent(code);

    if (source === revert) {
        console.log("testDecodeURIComponent ok");
        next && next.pass();
    } else {
        console.error("testDecodeURIComponent ok");
        next && next.miss();
    }
}

})((this || 0).self || global);

