const { Player } = TextAliveApp;

let songUrl = 'https://www.youtube.com/watch?v=a-Nf3QUFkOU';
let isAnimation = false;
let isFirstPlay = true;
let isStop = false;
let effectCount = 3;
let timer;

//phrase
let phraseId = 1;
let phraseDivArray = [];
let phraseArray = [];
let phraseDivArrayForDelete = [];
let PhraseDivMoveTimesArray = [];
let phraseMoveForHeight = []; //cssでheightを0にする時間に依存
let phraseHeightDecrease = [];
let phraseIds = [];

let wordsArray = [];
let wordDivArray = [];
let currentPosition = 0;

let c;
let lyricId = 1;//TODO：初めから再生した時に数をリセットする必要がある

const player = new Player({ app: true , mediaElement: document.querySelector('#media')});

const run = () =>{
  player.requestPlay();
}

const changeCtrlStateByPlay = () =>{
  $('#run-button').addClass("display-none");
  $('#pause-button').removeClass("display-none");
  $('#stop-button').removeClass("display-none");
}

const changeCtrlStateByPause = () =>{
  $('#pause-button').addClass("display-none");
  $('#run-button').removeClass("display-none");
  $('#stop-button').removeClass("display-none");
}

const pause = () =>{
  player.requestPause();
}

const stop = () =>{
  isStop = true;
  player.requestStop();
  reset();
  $('#run-button').removeClass("display-none");
  $('#stop-button').addClass("display-none");
  $('#pause-button').addClass("display-none");
}

player.addListener({
  onAppReady: (app) => {
    console.log('AppReady');
    player.createFromSongUrl(songUrl);
  },

  // 楽曲情報読み込み完了後、呼ばれる
  // この時点ではrequestPlay()等が実行不能
  onVideoReady: (v) => {
    console.log('VideoReady');
    $("#song-name").html(player.data.song.name);
    $("#song-artist").html(player.data.song.artist.name);
  },

  // 再生準備完了後、呼ばれる
  // これ以降、requestPlay()等が実行可能
  onTimerReady: () => {
    console.log('TimerReady');
    $('#text').empty();
    $("#run-button").prop("disabled", false);
  },

  onPlay: () => {
    changeCtrlStateByPlay();
    if(isFirstPlay){
      $("#background-object-effect").removeClass("display-none");
      isFirstPlay = false;
      return;
    }
    for(var i = 1; i <= effectCount; ++i){
      let target = "effect-" + i;
      let targetObj = "#" + target;
      $(targetObj).removeClass("animation-pause");
      $(targetObj).addClass("animation-running");
    }
    for(var i = wordDivArray.length - 1; 0 <= i; --i){
      if(wordDivArray[i] == null) break; //div自体が消えても残ってるっぽい
      wordDivArray[i].classList.remove("animation-pause");
      wordDivArray[i].classList.add("animation-running");
    }
    console.log("再生開始");
  },

  onPause: () => {
    if(isStop){
      isStop = false;
      return;
    }
    console.log("pause");
    changeCtrlStateByPause();
    for(var i = 1; i <= effectCount; ++i){
      let target = "effect-" + i;
      let targetObj = "#" + target;
      $(targetObj).removeClass("animation-running");
      $(targetObj).addClass("animation-pause");
    }
    for(var i = wordDivArray.length - 1; 0 <= i; --i){
      if(wordDivArray[i] == null) break;
      wordDivArray[i].classList.remove("animation-running");
      wordDivArray[i].classList.add("animation-pause");
    }
    console.log("再生停止");
  },

  onTimeUpdate: (position) => {

    // 歌詞情報がなければこれで処理を終わる
    if (!player.video.firstChar) {
      return;
    }
    currentPosition = position;
    if(!isAnimation){
      isAnimation = true;
      update();
    }
    // 500ms先から始まる文字～フレーズの最後まで取得
    let current = c || player.video.firstPhrase;
    while (current && current.startTime < position + 500) {
      if (c !== current) {
        phraseArray.push(current);
        const phraseDiv = document.createElement("div");
        let currentPhraseId = "phrase_" + phraseId;
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
        let words = current.children;
        Array.prototype.push.apply(wordsArray, words);
        ++phraseId;
        c = current;
      }
      current = current.next;
    }
  },

});

const update = () =>{
  let delay = 1000 / 50; // 1 秒で 50 フレーム
  timer = setInterval(function() {
  setMakeWords();
  setDeletePhrase();
}, delay)
};

const setMakeWords = () => {
  let copy = wordsArray;
  copy.forEach((item, index) => {
    if(item.startTime < currentPosition + 500){
      const wordDiv = document.createElement("div");
      wordDivArray.push(wordDiv);
      let word = wordsArray.shift();
      let isNoun = word.pos === "N";//名詞
      let charas = word.children;
      for(var i = 0; i < charas.length; ++i){
        const span = document.createElement("span");
        span.innerHTML = charas[i].text;
        wordDiv.appendChild(span);
      }
        //演出
        if(isNoun){
          wordDiv.classList.add("noun_text");

          const pSpan = document.createElement("span");
          pSpan.innerHTML = "★";
          pSpan.classList.add('text_particle');
          pSpan.classList.add('text_particle_anim_0');
          wordDiv.appendChild(pSpan);

          const pSpan45 = document.createElement("span");
          pSpan45.innerHTML = "★";
          pSpan45.classList.add('text_particle');
          pSpan45.classList.add('text_particle_anim_45');
          wordDiv.appendChild(pSpan45);

          const pSpan225 = document.createElement("span");
          pSpan45.innerHTML = "★";
          pSpan45.classList.add('text_particle');
          pSpan45.classList.add('text_particle_anim_225');
          wordDiv.appendChild(pSpan225);
        }

      phraseDivArray[0].appendChild(wordDiv);
      if(word.parent.lastWord == word){
        phraseDivArray.shift();
      }
    }
});
};

const setDeletePhrase = () => {
  //500ms
  let move = 8;
  let copy = phraseArray;
  copy.forEach((item, index) => {
    if(item.endTime < currentPosition + 100){
      let phraseDiv = phraseDivArrayForDelete[index];

      if(PhraseDivMoveTimesArray[index] == 0){
        let selecter = "#" + phraseIds[index];
        let currentHeight = parseInt($(selecter).height());
        phraseDiv.classList.add('fadeLyric');
        phraseHeightDecrease[index] = currentHeight / 10;
        phraseMoveForHeight[index] = (currentHeight / 2) / 10;//cssで200ms,updateが20msに一度処理
      }

      let currentPos = parseInt(phraseDiv.style.top);
      if(PhraseDivMoveTimesArray[index] < 10){
        currentPos -= phraseMoveForHeight[index];
        let selecter = "#" + phraseIds[index];
        let currentHeight = parseInt($(selecter).height());
        let newHeight = currentHeight - phraseHeightDecrease[index];
        if(newHeight < 0){
          newHeight = 0;
        }
        phraseDiv.style.height = newHeight + "px";
      }
      let newPos = (currentPos - move);
      phraseDiv.style.top = newPos + "px";
      
 
      ++PhraseDivMoveTimesArray[index];
      if(parseInt(phraseDiv.style.top) < -1000){
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

const getRandomIntegerNum = (min, max) =>{
  return Math.floor(Math.random() * (max - min) + min);
}

const getRandomDecimalNum = (min, max) =>{
  return Math.random() * (max - min) + min;
}

/*$('#background-effect').on('click',function(e){
  let pageX = e.clientX; 
  let pageY = e.clientY;
  const div = document.createElement("div");
  let id = "effect-" + ( ++effectCount );
  div.id = id;
  div.position = "fixed";
  div.left = pageX;
  div.top = pageY;
  div.opacity = 0.7
  div.innerHTML = "●";
  let size = getRandomIntegerNum(50, 351) + "px";
  div.style.fontSize = size + "px";
  let time = getRandomIntegerNum(500, 3500);
  let selecter = "#" + id;
  console.log(selecter);
  $(selecter).animate({
    'opacity': 0,
    'left': '50%',
    'top': '50%',
    'font-size': '0px',
  }, time);
  $('#background-object-effect').append(div);
});*/ 

/*const makeEffect = (e) =>{
  console.log("click");
  console.log(e);
  let pageX = e.clientX; 
  let pageY = e.y;
  const div = document.createElement("div");
  let id = "effect-" + ( ++effectCount );
  div.id = id;
  div.position = "fixed";
  div.left = pageX;
  div.top = pageY;
  div.opacity = 0.7
  div.innerHTML = "●";
  let size = getRandomIntegerNum(50, 351);
  div.style.fontSize = "size" + "px";
  let time = getRandomIntegerNum(500, 3500);
  let selecter = "#" + id;
  $(selecter).animate({
    'opacity': 0,
    'left': '50%',
    'top': '50%',
    'font-size': '0px',
  }, time);
  $('#background-object-effect').append(div);
}*/

const reset = () =>{
  clearInterval(timer);
  timer = null;
  timer = setInterval(function() {
    clearInterval(timer);
    timer = null;
    $('#text').empty();
  }, 100)

 for(var i = 1; i <= effectCount; ++i){
  let target = "effect-" + i;
  let targetObj = "#" + target;
  if(3 < i){
   $(targetObj).remove();
   continue;
  }
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
}

window.run = run
window.pause = pause
window.stop = stop
//window.makeEffect = makeEffect

//サビはフィーバータイムなので丸の数が増えます
//リスナーがクリックした位置に丸を増やす、最大で10くらい
//文字をクリックすると蝶が出るとか発行するとか、斜めに横切るとか