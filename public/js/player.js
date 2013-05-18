// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

// This is a protocol-relative URL as described here:
//     http://paulirish.com/2010/the-protocol-relative-url/
// If you're testing a local page accessed via a file:/// URL, please set tag.src to
//     "https://www.youtube.com/iframe_api" instead.
tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '195',
    width: '320',
    videoId: '',
    playerVars: {
      rel: 0
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

var currentIndex = 0;

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  var songs = App.Song.find();
  songs.objectAt(currentIndex).playYoutubeVideoByArtistNameAndTrackTitle();
  //event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  /*
  if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stopVideo, 6000);
    done = true;
  }
  */
  if (event.data === YT.PlayerState.ENDED) {
    var songs = App.Song.find();
    currentIndex = currentIndex + 1;
    if (songs.objectAt(currentIndex) === undefined) {
      currentIndex = 0;
    }
    songs.objectAt(currentIndex).playYoutubeVideoByArtistNameAndTrackTitle();
  }
}
function stopVideo() {
  player.stopVideo();
}