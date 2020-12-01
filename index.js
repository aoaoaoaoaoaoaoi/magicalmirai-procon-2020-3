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
let phraseMoveForHeight = [];
let phraseHeightDecrease = [];
let phraseIds = [];

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
  let copy = phraseArray;
  copy.forEach((item, index) => {
    if(item.endTime < currentPosition + 100){
      let phraseDiv = phraseDivArrayForDelete[index];

      if(PhraseDivMoveTimesArray[index] == 0){
        let selecter = "#" + phraseIds[index];
        let currentHeight = parseInt($(selecter).height());
        phraseDiv.classList.add('fadeLyric');
        phraseHeightDecrease[index] = currentHeight / 10;
        phraseMoveForHeight[index] = (currentHeight / 2) / 10;
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

class Phrase{
  constructor (phrase)
  {
    this.phrase = phrase;
  }
  
  setPhraseDiv (phraseDiv){
    this.div = phraseDiv;
  }
  incrementMoveCount (){
    ++this.moveCount; 
  }
  setChangeHeightSize (size){
    this.changeHeightSize = size;
  }
  setMoveDistance (distance){
    this.moveDistance = distance;
  }
}

window.run = run
window.pause = pause
window.stop = stop