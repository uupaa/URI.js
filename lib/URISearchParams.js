(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("URISearchParams", function moduleClosure(global, WebModule, VERIFY/*, VERBOSE */) {
"use strict";

// --- technical terms / data structure --------------------
/*
- URISearchParams
    - https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams

    ```js
        var urlSearchParams = URISearchParams("a=b&c=d#hash");
        urlSearchParams.append(name, value):void
        urlSearchParams.delete(name):void
        urlSearchParams.entries():Iterator
        urlSearchParams.get(name):String
        urlSearchParams.getAll(name):StringArray
        urlSearchParams.has(name):Boolean;
        urlSearchParams.keys():StringArray
        urlSearchParams.values():StringArray
        urlSearchParams.getAll(name):StringArray
        urlSearchParams.set(name, value):void
        urlSearchParams.toString():String
    ```

 */
// --- dependency modules ----------------------------------
// --- import / local extract functions --------------------
// --- define / local variables ----------------------------
// --- class / interfaces ----------------------------------
function URISearchParams(searchParams) { // @arg SearchParamsString - "key=value&key=value..."
    this._map = [];  // key-value pairs array. [ <key, value>, <key, value>, ... ]
    this._keys = [];

//{@dev
    if (VERIFY) {
        $valid($type(searchParams, "SearchParamsString"), URISearchParams, "searchParams");
    }
//}@dev

    if (searchParams.indexOf("?") >= 0) {
        // pickup "http://example.com/dir/file.exe?key=value#hash"
        //                                         ~~~~~~~~~
        searchParams = searchParams.split("?")[1].split("#")[0];
    }
    searchParams.replace(/&amp;|&|;/g, ";"). // "&amp;" or "&" or ";" -> ";"
                 replace(/;+$/, "").split(";").forEach(function(pair) {
        var array = pair.split("="); // key=value pair
        var key   = array[0];
        var value = array[1] || "";
        var decodedKey   = global["decodeURIComponent"](key);
        var decodedValue = "";
        if (value) {
            decodedValue = global["decodeURIComponent"](value);
        }
        this._map.push(decodedKey, decodedValue);
        this._keys.push(decodedKey);
    }, this);
}

URISearchParams["prototype"] = Object.create(URISearchParams, {
    "constructor":  { "value": URISearchParams          }, // new Task(taskName:String = "", taskCount:UINT16 = 1, callback:Function|Task = null, tick:Function = null):Task
    "append":       { "value": URISearchParams_append   }, // URISearchParams#append(name:String, value:String|Number):void
    "delete":       { "value": URISearchParams_delete   }, // URISearchParams#delete(name:String):void
    "entries":      { "value": URISearchParams_entries  }, // URISearchParams#entries():iterator
    "get":          { "value": URISearchParams_get      }, // URISearchParams#get(name:String):String
    "getAll":       { "value": URISearchParams_getAll   }, // URISearchParams#getAll(name:String):StringArray
    "has":          { "value": URISearchParams_has      }, // URISearchParams#has(name:String):Boolean
    "keys":         { "value": URISearchParams_keys     }, // URISearchParams#keys():Iterator
    "values":       { "value": URISearchParams_values   }, // URISearchParams#values():Iterator
    "set":          { "value": URISearchParams_set      }, // URISearchParams#set(name:String, value:String|Number):StringArray
    "toString":     { "value": URISearchParams_toString }, // URISearchParams#toString():String
});

// --- implements ------------------------------------------
function URISearchParams_append(name,    // @arg String
                                value) { // @arg String|Number
    this._map.push(name, value);
    this._keys.push(name);
}

function URISearchParams_delete(name) { // @arg String
    var newMap = [];
    var newKeys = [];

    for (var i = 0, iz = this._map.length; i < iz; i += 2) {
        var key   = this._map[i];
        var value = this._map[i + 1];
        if (key !== name) {
            newMap.push(key, value);
            newKeys.push(key);
        }
    }
    this._map = newMap;
    this._keys = newKeys;
}

function URISearchParams_entries() { // @ret KeyValueIterator
    var keyAndValues = _getKeyAndValues(this._map);

    return new CollectionIterator(keyAndValues.keys,
                                  keyAndValues.values,
                                  CollectionIterator_keyAndValues);
}

function URISearchParams_get(name) { // @arg String - value
                                     // @ret String
    var pos = this._keys.indexOf(name);

    if (pos >= 0) {
        return this._map[pos * 2 + 1];
    }
    return "";
}

function URISearchParams_getAll(name) { // @arg String
                                        // @arg StringArray - [value, ...]
    var result = [];
    var pos = this._keys.indexOf(name);

    if (pos >= 0) {
        for (var i = 0, iz = this._map.length; i < iz; i += 2) {
            if (this._map[i] === name) {
                result.push(this._map[i + 1]);
            }
        }
    }
    return result;
}

function URISearchParams_has(name) { // @arg String
                                     // @arg Boolean
    return this._keys.indexOf(name) >= 0;
}

function URISearchParams_keys() { // @arg Iterator - [keys, ...]
    return new CollectionIterator(this._keys, [], CollectionIterator_keys);
}

function URISearchParams_values() { // @arg Iterator - [values, ...]
    var keyAndValues = _getKeyAndValues(this._map);

    return new CollectionIterator(keyAndValues.keys,
                                  keyAndValues.values,
                                  CollectionIterator_values);
}

function URISearchParams_set(name,    // @arg String
                             value) { // @arg String|Number
    this["delete"](name);
    this["append"](name, value);
}

function URISearchParams_toString() { // @ret String
    var result = [];

    for (var i = 0, iz = this._map.length; i < iz; i += 2) {
        var encodedKey   = global["encodeURIComponent"](this._map[i]);
        var encodedValue = global["encodeURIComponent"](this._map[i + 1]);

        result.push(encodedKey + "=" + encodedValue);
    }
    return result.join("&"); // "key1=a&key2=b&key3=0&key3=1"
}

function _getKeyAndValues(map) {
    var keys = [];
    var values = [];

    for (var i = 0, iz = map.length; i < iz; i += 2) {
        keys.push(map[i]);
        values.push(map[i + 1]);
    }
    return { keys: keys, values: values };
}

// =========================================================
function CollectionIterator(keys, values, nextFn) {
    var that = this;

    this._keys   = keys;
    this._values = values;
    this["next"] = nextFn;
    this._cursor = -1;

    if (global["Symbol"]) { // ES2015 Spec
        this[global["Symbol"]["iterator"]] = function() {
            return that;
        };
    }
}

function CollectionIterator_keys() {
    var cursor = ++this._cursor;
    var done   = cursor >= this._keys.length;

    return done ? { "value": undefined,          "done": true  }
                : { "value": this._keys[cursor], "done": false };
}

function CollectionIterator_values() {
    var cursor = ++this._cursor;
    var done   = cursor >= this._keys.length;

    return done ? { "value": undefined,            "done": true  }
                : { "value": this._values[cursor], "done": false };
}

function CollectionIterator_keyAndValues() {
    var cursor = ++this._cursor;
    var done   = cursor >= this._keys.length;

    return done ? { "value": undefined,              "done": true  }
                : { "value": [this._keys[cursor],
                              this._values[cursor]], "done": false };
}

return URISearchParams; // return entity

});

