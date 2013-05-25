// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var Player = null;

function onYouTubeIframeAPIReady() {
  console.log('API ready');
  Player = new YT.Player('player', {
    height: '300',
    width: '400',
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
  /*
  App.Song.find().then(function(songs) {
    var song = songs.objectAt(currentIndex);
    
  });
  */
  
  var song = App.playlist.get('songs').objectAt(0);
  if (song !== undefined) {
    song.playYoutubeVideoByArtistNameAndTrackTitle();
  }
  
  //event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    var songs = App.Song.find();
    currentIndex = currentIndex + 1;
    if (songs.objectAt(currentIndex) === undefined) {
      currentIndex = 0;
    }
    songs.objectAt(currentIndex).playYoutubeVideoByArtistNameAndTrackTitle();
  }
}
