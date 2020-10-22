const { Player } = TextAliveApp;

let songUrl = 'https://www.youtube.com/watch?v=a-Nf3QUFkOU';
let isAnimation = false;

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
let currentPosition = 0;

// 単語ごとに歌詞を表示
const animateWord = (now, unit) => {
  if (unit.contains(now)) {
    $('#text').html(unit.text);
  }
};

const run = () =>{
  //初期化処理
  $('#info').empty();
  $('#media').empty();

  const player = new Player({ app: true , mediaElement: document.querySelector('#media')});
  console.log('Run');

  let c;
  let lyricId = 1;
  player.addListener({
    onAppReady: (app) => {
      console.log('AppReady');
      player.createFromSongUrl(songUrl);
    },

    // 楽曲情報読み込み完了後、呼ばれる
    // この時点ではrequestPlay()等が実行不能
    onVideoReady: (v) => {
      console.log('VideoReady');
      let infoContents = '';
      /*infoContents += '<h1>楽曲情報</h1>';
      infoContents += '<h2>楽曲名：<br>' + player.data.song.name + '</h2>';
      infoContents += '<h2>アーティスト名：<br>' + player.data.song.artist.name + '</h2>';
      $('#info').html(infoContents);*/
      $('#text').html('[再生準備待機中]');
    },

    // 再生準備完了後、呼ばれる
    // これ以降、requestPlay()等が実行可能
    onTimerReady: () => {
      console.log('TimerReady');
      $('#text').html('');
      player.requestPlay();
      // 定期的に呼ばれる各単語の "animate" 関数をセットする
      /*let w = player.video.firstPhrase;
      while (w) {
        w.animate = animateWord;
        w = w.next;
      }*/
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
}

const update = () =>{
  let delay = 1000 / 50; // 1 秒で 50 フレーム
  let timer = setInterval(function() {
  setMakeWords();
  setDeletePhrase();
}, delay)
};

const setMakeWords = () => {
  let copy = wordsArray;
  copy.forEach((item, index) => {
    if(item.startTime < currentPosition + 500){
      const wordDiv = document.createElement("div");
      let word = wordsArray.shift();
      let charas = word.children;
      for(var i = 0; i < charas.length; ++i){
        const span = document.createElement("span");
        span.innerHTML = charas[i].text;
        wordDiv.appendChild(span);
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
        /*phraseDiv.animate({
          opacity: [0, 1]
        }, {
          direction: 'reverse',
          duration: 200,
          fill: 'forwards'
        })*/

        
        /*console.log(selecter);
        let l =$(selecter).height();
        console.log(l);*/
        phraseHeightDecrease[index] = currentHeight / 10;
        phraseMoveForHeight[index] = (currentHeight / 2) / 10;//cssで200ms,updateが20msに一度処理
        //console.log("array" + phraseMoveForHeight[index]);
        /*phraseDiv.animate({
          height: [currentHeight, 0],
          opacity: [0, 1]
        }, {
          duration: 200,
          fill: 'forwards',
          fill: 'forwards',
        })*/
      }

      let currentPos = parseInt(phraseDiv.style.top);
      //console.log("original" + currentPos);
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
      //console.log("minus array" + currentPos);
      let newPos = (currentPos - move);
      //console.log("newPos" + newPos);
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
        //phraseDiv.remove();
      }
    }else{
      //一つ前のが移動してたら自分も上に移動
    }
  });
};

window.run = run