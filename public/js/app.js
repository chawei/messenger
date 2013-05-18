App = Ember.Application.create({});

/*
App.ApplicationRoute = Ember.Route.extend({
  setupController: function() {
    this.controllerFor('song').set('model', App.Song.find());
  },
  
  playSong : function() {
    console.log('play');
  }
});
*/

Ember.Handlebars.registerBoundHelper('urlify', function(text) {
  if (text === undefined) return '';
  
  var urlRegex = /(https?:\/\/[^\s]+)/g;
    
  var html = text.replace(urlRegex, function(url){
    return '<a class=\"url\" target=\"_blank\" href=\"' + url + '\">' + url + '</a>';
  });
  
  return new Handlebars.SafeString(html);
});

App.MessageController = Ember.ObjectController.extend({
  playSong : function(song) {
    song.playYoutubeVideoByArtistNameAndTrackTitle();
  },
  
  sendMessageItem : function(message) {
    var messageItems = message.get('messageItems');
    var content = this.get('newMessageItem');
    if (content === undefined || !content.trim()) { return; }
    
    var messageItem  = messageItems.createRecord({
      content: content,
      sentAt: Date.now,
      user: App.User.find(100)
    });
    this.get('store').commit();
    
    this.set('newMessageItem', '');
  },
  
  toggleSongOnly : function() {
    $('.message-item').children().not('.songs').toggle();
  }
});

// Models
App.Store = DS.Store.extend({
  revision: 12,
  adapter:  'DS.FixtureAdapter'
});

App.Message = DS.Model.extend({
  messageItems: DS.hasMany('App.MessageItem'),
  playlist: DS.belongsTo('App.Playlist')
});

App.MessageItem = DS.Model.extend({
  content: DS.attr('string'),
  sentAt: DS.attr('number'),
  user: DS.belongsTo('App.User'),
  songs: DS.hasMany('App.Song'),
  
  extractYoutubeUrls: function(content) {
    var urlRegex = /(https?:\/\/www\.youtube\.com[^\s^\!]+)/g;
    var urls = content.match(urlRegex);
    
    return urls;
  },
  
  didCreate: function() {
    var youtubeUrls = this.extractYoutubeUrls(this.get('content'));
    if (youtubeUrls !== null) {
      console.log('MessageItem created');
      var songs = this.get('songs');
      youtubeUrls.forEach(function(url) {
        songs.createRecord({
          artistName: url,
          trackTitle: '',
          youtubeUrl: url
        });
      });
      
      this.get('store').commit();
    }
  }
});

App.User = DS.Model.extend({
  name: DS.attr('string')
});

App.Playlist = DS.Model.extend({
  songs: DS.hasMany('App.Song')
});

App.Song = DS.Model.extend({
  artistName: DS.attr('string'),
  trackTitle: DS.attr('string'),
  youtubeUrl: DS.attr('string'),
  
  getResultsFromYoutube: function(query, callback) {
    var queryURI = ["https://gdata.youtube.com/feeds/api/videos?q=", query, 
                    "&max-results=5&v=2&alt=json&callback=?"].join('');
    $.getJSON(queryURI, function(data) {
      var videoId       = data.feed.entry[0].media$group.yt$videoid.$t;
      var videoDuration = data.feed.entry[0].media$group.yt$duration.seconds;
      var videoTitle    = data.feed.entry[0].title.$t;
      var res = {videoId: videoId, videoDuration: videoDuration, videoTitle: videoTitle}
      callback(res);
    });
  },
  
  getTitleFromYoutube: function(query, callback) {
    this.getResultsFromYoutube(query, function(data) {
      callback(data.videoTitle);
    });
  },
  
  playYoutubeVideoByArtistNameAndTrackTitle: function() {
    var query = escape(['"', this.get('artistName'), '"', '+', 
                        '"', this.get('trackTitle'), '"', "-cover"].join(''));
    this.getResultsFromYoutube(query, function(data) {
      var videoId       = data.videoId;
      var videoDuration = data.videoDuration;
      if (videoDuration > (15 * 60)) {
        console.log("[Wrong Result] Video is too long: ");
        console.log({query: query, resultId: videoId, resultVideoDuration: videoDuration});
      } else {
        if (videoId !== undefined) {
          player.loadVideoById(videoId, 0, 'default');
        }
      }
    });
  },
  
  didCreate: function() {
    var that  = this;
    this.getTitleFromYoutube(this.get('youtubeUrl'), function(title) {
      console.log(escape(title));
      var queryURI = ["http://ws.audioscrobbler.com/2.0/?method=track.search",
                      "&track=", escape(title), "&api_key=571142411e7515c37b1cbff311ecaeb3&format=json"].join('');
      $.getJSON(queryURI, function(data) {
        that.set('artistName', title);
        if (data.error !== undefined) {
          console.log(data.message);
        } else {
          var tracks = data.results.trackmatches.track;
          if (tracks !== undefined) {
            var track = tracks;
            if (Ember.isArray(tracks)) {
              track = tracks[0];
            }

            var artistName = track.artist;
            var trackTitle = track.name;
            that.set('artistName', artistName);
            that.set('trackTitle', trackTitle);
          }
        }
        that.get('store').commit();
        console.log('Song created');
      });
    });
  }
});

App.Message.FIXTURES = [{
  id: 1,
  messageItems: [10, 20]
}, {
  id: 2,
  messageItems: []
}];

App.MessageItem.FIXTURES = [{
  id: 10,
  content: "http://www.youtube.com/watch?v=Rb8gjCg3Oac",
  sentAt: 1362695939672,
  user: 100,
  songs: [1000, 1001]
}, {
  id: 20,
  content: "cool!",
  sentAt: 1362695939700,
  user: 101
}];

App.User.FIXTURES = [{
  id: 100,
  name: 'david'
}, {
  id: 101,
  name: 'ray'
}];

App.Song.FIXTURES = [{
  id: 1000,
  artistName: '張懸',
  trackTitle: '兒歌',
  youtubeUrl: 'http://www.youtube.com/watch?v=JJhmN_c9At8'
}, {
  id: 1001,
  artistName: '張懸',
  trackTitle: 'Scream',
  youtubeUrl: 'http://www.youtube.com/watch?v=-6a8BDmdxkU'
}];