const { Player } = TextAliveApp;

let songUrl = 'https://www.youtube.com/watch?v=a-Nf3QUFkOU';
let isAnimation = false;
let lyricDivArray = [];

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
  
      // 500ms先から始まる文字～フレーズの最後まで取得
      let current = c || player.video.firstPhrase;
      let fontSize = 50;
      while (current && current.startTime < position + 500) {
        if (c !== current) {
          const div = document.createElement("div");
          lyricDivArray.push(div);
          div.id = "lyric_" + lyricId;
          lyricId++;
          div.style.position = 'absolute';
          div.style.top = 510 + "px";
            let str = current.text;
            let charArray = str.split('');
            for(var i = 0; i < charArray.length; ++i){
              const span = document.createElement("span");
              span.style.fontSize = fontSize + "px";
              span.innerHTML = charArray[i];
              div.appendChild(span);
              fontSize -= 1;
            }
            $('#text').append(div);
          c = current;
        }
        if(!isAnimation){
          isAnimation = true;
          setAnimation();
        }
        current = current.next;
      }
    },
  
  });
}

const setAnimation = () =>{
  let delay = 1000 / 50; // 1 秒で 50 フレーム
  let timer = setInterval(function() {
  //500ms
  let move = 8;
  lyricDivArray.forEach((item, index) => {
    let currentPos = parseInt(item.style.top);
    let newPos = (currentPos - move);
    item.style.top = newPos + "px";
  });
}, delay)
};

window.run = run