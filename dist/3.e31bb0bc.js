// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"index.js":[function(require,module,exports) {
var _TextAliveApp = TextAliveApp,
    Player = _TextAliveApp.Player;
var songUrl = 'https://www.youtube.com/watch?v=a-Nf3QUFkOU';
var isAnimation = false;
var isFirstPlay = true;
var isStop = false;
var effectCount = 3;
var timer; //phrase

var phraseId = 1;
var phraseDivArray = [];
var phraseArray = [];
var phraseDivArrayForDelete = [];
var PhraseDivMoveTimesArray = [];
var phraseMoveForHeight = [];
var phraseHeightDecrease = [];
var phraseIds = [];
var wordsArray = [];
var wordDivArray = [];
var currentPosition = 0;
var c;
var lyricId = 1;
var player = new Player({
  app: true,
  mediaElement: document.querySelector('#media')
});

var run = function run() {
  player.requestPlay();
};

var changeCtrlStateByPlay = function changeCtrlStateByPlay() {
  $('#run-button').addClass("display-none");
  $('#pause-button').removeClass("display-none");
  $('#stop-button').removeClass("display-none");
};

var changeCtrlStateByPause = function changeCtrlStateByPause() {
  $('#pause-button').addClass("display-none");
  $('#run-button').removeClass("display-none");
  $('#stop-button').removeClass("display-none");
};

var pause = function pause() {
  player.requestPause();
};

var stop = function stop() {
  isStop = true;
  player.requestStop();
  reset();
  $('#run-button').removeClass("display-none");
  $('#stop-button').addClass("display-none");
  $('#pause-button').addClass("display-none");
};

player.addListener({
  onAppReady: function onAppReady(app) {
    player.createFromSongUrl(songUrl);
  },
  onVideoReady: function onVideoReady(v) {
    $("#song-name").html(player.data.song.name);
    $("#song-artist").html(player.data.song.artist.name);
  },
  onTimerReady: function onTimerReady() {
    $('#text').empty();
    $("#run-button").prop("disabled", false);
  },
  onPlay: function onPlay() {
    isStop = false;
    changeCtrlStateByPlay();

    if (isFirstPlay) {
      $("#background-object-effect").removeClass("display-none");
      isFirstPlay = false;
      return;
    }

    for (var i = 1; i <= effectCount; ++i) {
      var target = "effect-" + i;
      var targetObj = "#" + target;
      $(targetObj).removeClass("animation-pause");
      $(targetObj).addClass("animation-running");
    }

    for (var i = wordDivArray.length - 1; 0 <= i; --i) {
      if (wordDivArray[i] == null) break;
      wordDivArray[i].classList.remove("animation-pause");
      wordDivArray[i].classList.add("animation-running");
    }
  },
  onPause: function onPause() {
    if (isStop) {
      return;
    }

    changeCtrlStateByPause();

    for (var i = 1; i <= effectCount; ++i) {
      var target = "effect-" + i;
      var targetObj = "#" + target;
      $(targetObj).removeClass("animation-running");
      $(targetObj).addClass("animation-pause");
    }

    for (var i = wordDivArray.length - 1; 0 <= i; --i) {
      if (wordDivArray[i] == null) break;
      wordDivArray[i].classList.remove("animation-running");
      wordDivArray[i].classList.add("animation-pause");
    }
  },
  onTimeUpdate: function onTimeUpdate(position) {
    if (!player.video.firstChar || isStop) {
      return;
    }

    currentPosition = position;

    if (!isAnimation) {
      isAnimation = true;
      update();
    } // 500ms先から始まる文字～フレーズの最後まで取得


    var current = c || player.video.firstPhrase;

    while (current && current.startTime < position + 500) {
      if (c !== current) {
        phraseArray.push(current);
        var phraseDiv = document.createElement("div");
        var currentPhraseId = "phrase_" + phraseId;
        phraseDiv.id = currentPhraseId;
        phraseIds.push(currentPhraseId);
        phraseDiv.style.position = "relative";
        phraseDiv.style.top = "0px";
        phraseDivArray.push(phraseDiv);
        phraseDivArrayForDelete.push(phraseDiv);
        PhraseDivMoveTimesArray.push(0);
        phraseMoveForHeight.push(0);
        phraseHeightDecrease.push(0);
        $('#text').append(phraseDiv);
        var words = current.children;
        Array.prototype.push.apply(wordsArray, words);
        ++phraseId;
        c = current;
      }

      current = current.next;
    }
  }
});

var update = function update() {
  var delay = 1000 / 50; // 1 秒で 50 フレーム

  timer = setInterval(function () {
    setMakeWords();
    setDeletePhrase();
  }, delay);
};

var setParticle = function setParticle(wordDiv, animNum) {
  var span = document.createElement("span");
  span.innerHTML = "★";
  span.classList.add('text_particle');
  var className = 'text_particle_anim_' + animNum;
  span.classList.add(className);
  wordDiv.appendChild(span);
};

var setMakeWords = function setMakeWords() {
  var copy = wordsArray;
  copy.forEach(function (item, index) {
    if (item.startTime < currentPosition + 500) {
      var wordDiv = document.createElement("div");
      wordDivArray.push(wordDiv);
      var word = wordsArray.shift();
      var isNoun = word.pos === "N"; //名詞

      var charas = word.children;

      for (var i = 0; i < charas.length; ++i) {
        var span = document.createElement("span");
        span.innerHTML = charas[i].text;
        wordDiv.appendChild(span);
      } //演出


      if (isNoun) {
        wordDiv.classList.add("noun_text");
        setParticle(wordDiv, 0);
        setParticle(wordDiv, 45);
        setParticle(wordDiv, 225);
      }

      phraseDivArray[0].appendChild(wordDiv);

      if (word.parent.lastWord == word) {
        phraseDivArray.shift();
      }
    }
  });
};

var setDeletePhrase = function setDeletePhrase() {
  var move = 8;
  var copy = phraseArray;
  copy.forEach(function (item, index) {
    if (item.endTime < currentPosition + 100) {
      var phraseDiv = phraseDivArrayForDelete[index];

      if (PhraseDivMoveTimesArray[index] == 0) {
        var selecter = "#" + phraseIds[index];
        var currentHeight = parseInt($(selecter).height());
        phraseDiv.classList.add('fadeLyric');
        phraseHeightDecrease[index] = currentHeight / 10;
        phraseMoveForHeight[index] = currentHeight / 2 / 10;
      }

      var currentPos = parseInt(phraseDiv.style.top);

      if (PhraseDivMoveTimesArray[index] < 10) {
        currentPos -= phraseMoveForHeight[index];

        var _selecter = "#" + phraseIds[index];

        var _currentHeight = parseInt($(_selecter).height());

        var newHeight = _currentHeight - phraseHeightDecrease[index];

        if (newHeight < 0) {
          newHeight = 0;
        }

        phraseDiv.style.height = newHeight + "px";
      }

      var newPos = currentPos - move;
      phraseDiv.style.top = newPos + "px";
      ++PhraseDivMoveTimesArray[index];

      if (parseInt(phraseDiv.style.top) < -1000) {
        //削除
        phraseArray.splice(index, 1);
        phraseDivArrayForDelete.splice(index, 1);
        PhraseDivMoveTimesArray.splice(index, 1);
        phraseMoveForHeight.splice(index, 1);
        phraseIds.splice(index, 1);
        phraseHeightDecrease.splice(index, 1);
        phraseDiv.remove();
      }
    }
  });
};

var reset = function reset() {
  $('#text').empty();
  clearInterval(timer);
  timer = null;

  for (var i = 1; i <= effectCount; ++i) {
    var target = "effect-" + i;
    var targetObj = "#" + target;
    $(targetObj).removeClass("animation-pause");
    $(targetObj).addClass("animation-running");
  }

  $("#background-object-effect").addClass("display-none");
  isAnimation = false;
  isFirstPlay = true;
  effectCount = 3;
  phraseId = 1;
  phraseDivArray = [];
  phraseArray = [];
  phraseDivArrayForDelete = [];
  PhraseDivMoveTimesArray = [];
  phraseMoveForHeight = [];
  phraseHeightDecrease = [];
  phraseIds = [];
  wordsArray = [];
  wordDivArray = [];
  currentPosition = 0;
  c = null;
  lyricId = 1;
};

window.run = run;
window.pause = pause;
window.stop = stop;
},{}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "62153" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/3.e31bb0bc.js.map