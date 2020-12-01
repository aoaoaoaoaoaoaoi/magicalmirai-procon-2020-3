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

let wordsArray = [];
let wordDivArray = [];
let currentPosition = 0;

let c;
let lyricId = 1;

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
    player.createFromSongUrl(songUrl);
  },

  onVideoReady: (v) => {
    $("#song-name").html(player.data.song.name);
    $("#song-artist").html(player.data.song.artist.name);
  },

  onTimerReady: () => {
    $('#text').empty();
    $("#run-button").prop("disabled", false);
  },

  onPlay: () => {
    isStop = false;
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
      if(wordDivArray[i] == null) break;
      wordDivArray[i].classList.remove("animation-pause");
      wordDivArray[i].classList.add("animation-running");
    }
  },

  onPause: () => {
    if(isStop){
      return;
    }
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
  },

  onTimeUpdate: (position) => {
    if (!player.video.firstChar || isStop) {
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
        const phraseDiv = document.createElement("div");
        let currentPhraseId = "phrase_" + phraseId;
        phraseDiv.id = currentPhraseId;
        phraseDiv.style.position = "relative";
        phraseDiv.style.top = "0px";
        phraseDivArray.push(phraseDiv);

        let phrase = new Phrase(current, currentPhraseId, phraseDiv);
        phraseArray.push(phrase);
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

const setParticle = (wordDiv, animNum) =>{
  const span = document.createElement("span");
  span.innerHTML = "★";
  span.classList.add('text_particle');
  let className = 'text_particle_anim_' + animNum;
  span.classList.add(className);
  wordDiv.appendChild(span);
}

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
          setParticle(wordDiv, 0);
          setParticle(wordDiv, 45);
          setParticle(wordDiv, 225);
        }

      phraseDivArray[0].appendChild(wordDiv);
      if(word.parent.lastWord == word){
        phraseDivArray.shift();
      }
    }
});
};

const setDeletePhrase = () => {
  let move = 8;
  let deleteArray = [];
  phraseArray.forEach((item, index) => {
    if(item.phrase.endTime < currentPosition + 100){
      let phraseDiv = item.phraseDiv;

      if(item.moveCount == 0){
        let selecter = "#" + item.id;
        let currentHeight = parseInt($(selecter).height());
        phraseDiv.classList.add('fadeLyric');
        item.setHeightChangeSize =  (currentHeight / 10);
        //item.setDistanceToMove = ((currentHeight / 2) / 10);
      }

      let currentPos = parseInt(phraseDiv.style.top);
      if(item.moveCount < 10){
        currentPos -= item.getHeightChangeSize;
        let selecter = "#" + item.id;
        let currentHeight = parseInt($(selecter).height());
        let newHeight = currentHeight - item.getHeightChangeSize;
        if(newHeight < 0){
          newHeight = 0;
        }
        phraseDiv.style.height = newHeight + "px";
      }
      let newPos = (currentPos - move);
      phraseDiv.style.top = newPos + "px";
 
      item.incrementMoveCount();
      if(parseInt(phraseDiv.style.top) < -1000){
        //削除
        deleteArray.push(index);
        phraseDiv.remove();
      }
    }
  });
  deleteArray.forEach((index) => {
    phraseArray.splice(index, 1);
  });
};

const reset = () =>{

  $('#text').empty();
  clearInterval(timer);
  timer = null;

 for(var i = 1; i <= effectCount; ++i){
  let target = "effect-" + i;
  let targetObj = "#" + target;
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
 //phraseDivArrayForDelete = [];
 //PhraseDivMoveTimesArray = [];
 //phraseMoveForHeight = [];
 //phraseHeightDecrease = [];
 //phraseIds = [];

 wordsArray = [];
 wordDivArray = [];
 currentPosition = 0;

 c = null;
 lyricId = 1;
}

class Phrase{
  constructor (phrase, id, phraseDiv)
  {
    this.phrase = phrase;
    this.id = id;
    this.phraseDiv = phraseDiv;
    this.moveCount = 0;
    this.heightChangeSize = 0;
  }

  incrementMoveCount (){
    ++this.moveCount; 
  }

  get getHeightChangeSize() {
    return this.heightChangeSize;
  }
  set setHeightChangeSize(size) {
    this.heightChangeSize = size;
  }
}

window.run = run
window.pause = pause
window.stop = stop