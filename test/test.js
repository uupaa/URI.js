var test = new Test().add([
        testURIParse,
        testURIParseAndBuild,
        testURIIsAbsolute,
        testURIIsRelative,
        testURINormalize,
        testURIQueryString,
        testEncodeURIComponent,
        testDecodeURIComponent,
    ]);

if (this.document) {
    test.add([
        testURIGetCurrentURI,
        testURIResolve
    ]);
}

test.run().worker(function(err, test) {
        if (!err) {
            var undo = Test.swap(URI, URI_);

            new Test(test).run(function(err, test) {
                undo = Test.undo(undo);
            });
        }
    });

function testURIGetCurrentURI(next) {

    var url = URI(); // get current URI
    var uriObject = URI.parse(url);

    if (uriObject.dir.split("/").pop() === "test" && uriObject.file === "index.html") {
        console.log("testURI ok");
        next && next.pass();
    } else {
        console.log("testURI ng");
        next && next.miss();
    }
}

function testURIParse(next) {
    var href = "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#fragment";

    var uriObject = URI.parse(href);

    if (uriObject.href     === href &&
        uriObject.protocol === "http:" &&
        uriObject.scheme   === "http:" &&
        uriObject.secure   === false &&
        uriObject.host     === "user:pass@example.com:8080" &&
        uriObject.auth     === "user:pass" &&
        uriObject.hostname === "example.com" &&
        uriObject.port     === 8080 &&
        uriObject.pathname === "/dir1/dir2/file.ext" &&
        uriObject.dir      === "/dir1/dir2" &&
        uriObject.file     === "file.ext" &&
        uriObject.search   === "?a=b;c=d" &&
        uriObject.query.a  === "b" &&
        uriObject.query.c  === "d" &&
        uriObject.fragment === "#fragment" &&
        uriObject.error    === false) {

        console.log("testURIParse ok");
        next && next.pass();
    } else {
        console.log("testURIParse ng");
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
        console.log("testURIParseAndBuild ng");
        next && next.miss();
    }
}

function testURIIsAbsolute(next) {
    var url = "http://example.com";

    if ( URI.isAbsolute(url) === true) {
        console.log("testURIIsAbsolute ok");
        next && next.pass();
    } else {
        console.log("testURIIsAbsolute ng");
        next && next.miss();
    }
}

function testURIIsRelative(next) {
    var url = "/dir/file.ext";

    if ( URI.isRelative(url) === true) {
        console.log("testURIIsRelative ok");
        next && next.pass();
    } else {
        console.log("testURIIsRelative ng");
        next && next.miss();
    }
}

function testURIResolve(next) {
    var rel = "/dir/file.ext";
    var abs = URI.resolve(rel);
    var uriObject = URI.parse(abs);

    if (/file|http/.test(uriObject.protocol) &&
        uriObject.dir      === "/dir" &&
        uriObject.file     === "file.ext") {

        console.log("testURIResolve ok");
        next && next.pass();
    } else {
        console.log("testURIResolve ng");
        next && next.miss();
    }
}

function testURINormalize(next) {
    var url = "http://example.com///..//hoge/....//huga.ext";
    var answer = "http://example.com/hoge/huga.ext";
    var result = URI.normalize(url);

    if (result === answer) {
        console.log("testURINormalize ok");
        next && next.pass();
    } else {
        console.log("testURINormalize ng");
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
        console.log("testURIQueryString ng");
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
        console.log("testEncodeURIComponent ok");
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
        console.log("testDecodeURIComponent ok");
        next && next.miss();
    }
}

