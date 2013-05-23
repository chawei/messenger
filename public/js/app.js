App = Ember.Application.create({});

App.currentUser = null;
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
  if (text === undefined || text === null) return '';
  
  var urlRegex = /(https?:\/\/[^\s]+)/g;
    
  var html = text.replace(urlRegex, function(url){
    return '<a class=\"url\" target=\"_blank\" href=\"' + url + '\">' + url + '</a>';
  });
  
  return new Handlebars.SafeString(html);
});

Ember.Handlebars.registerBoundHelper('fbImgSrc', function(facebookId) {
  if (facebookId !== null) {
    var html = '<img class="img-circle" src="http://graph.facebook.com/' + facebookId + '/picture" />';
    return new Handlebars.SafeString(html);
  }
});

App.SongsController = Ember.ArrayController.extend({
  playSong : function(song) {
    var videoId = song.getIdFromUrl();
    if ( videoId !== null) {
      Player.loadVideoById(videoId);
    } else {
      song.playYoutubeVideoByArtistNameAndTrackTitle();
    }
  },
});

App.MessageController = Ember.ObjectController.extend({
  playSong : function(song) {
    var videoId = song.getIdFromUrl();
    if ( videoId !== null) {
      Player.loadVideoById(videoId);
    } else {
      song.playYoutubeVideoByArtistNameAndTrackTitle();
    }
  },
  
  sendMessageItem : function(message) {
    var messageItems = message.get('messageItems');
    var content = this.get('newMessageItem');
    if (content === undefined || !content.trim()) { return; }
    
    var currentDate = Date.now();
    var messageItem  = messageItems.createRecord({
      content: content,
      sentAt: currentDate,
      user: App.currentUser
    });
    this.get('store').commit();
    
    this.set('newMessageItem', '');
  },
  
  toggleSongOnly : function() {
    $('.message-item').children().not('.songs').toggle();
  },
  
  togglePlaylistView: function() {
    console.log('toggle playlist');
    $('#playlist').toggle();
  },
  
  toggleMessageMenuView: function() {
    console.log('toggle message menu');
    $('#message-nav').toggle();
  }
});

App.MessageView = Ember.View.extend({
  templateName: 'message',
  
  autoScroll: function() {
    if (this.state == "inDOM") {
      // Ember.run.next waits until the DOM has been updated :)
      Ember.run.scheduleOnce('afterRender', this, function() {
        try {
          var container = this.$("#message-box").get(0);
          container.scrollTop = container.scrollHeight;
        } catch (err) {
          console.log('no box');
        }
      });
    }
  }.observes("controller.content.messageItems.length"),
  
  didInsertElement: function() {
    //Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
  },
  
  processChildElements: function() {
    var box = $("#message-box");
    //box.scrollTop(400);
    console.log('scroll : ', box.scrollTop());
    
    var objDiv = document.getElementById("message-box");
    objDiv.scrollTop = objDiv.scrollHeight;
    
    var songs = $(".song");
    console.log(songs.length);
  },
  
  MessageItemsView: Ember.CollectionView.extend({
    templateName: 'messageItem',
  
    didInsertElement: function() {
      console.log('add messageItems');
    }
  })
  
});


  

App.ApplicationView = Ember.View.extend({
  templateName: 'application',

  didInsertElement: function() {
    this.initFBLogin();
    this.renderFBLoginStatus();
  },
  
  renderFBLoginStatus: function() {
    if (App.currentUser !== null) {
      var fbLogin = document.getElementById('fb-login');
      fbLogin.innerHTML = '<i class="icon-off"></i>';
    }
  },
  
  initFBLogin: function() {
    $('#fb-login').click(function(event){
      event.preventDefault();
    
      FB.login(function(response) {
        if (response.authResponse) {
          console.log('Welcome!  Fetching your information.... ');
          FB.api('/me', function(response) {
            console.log('Good to see you, ' + response.name + '.');
            console.log(response);
          
            var facebookId = response.id;
            var user = App.User.find(facebookId);
            if (user.get('facebookId') === null) {
              App.currentUser = App.User.createRecord({id: facebookId, facebookId: facebookId, name: response.name});
              App.currentUser.get('store').commit();
            } else {
              App.currentUser = user;
            }
          });
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      }, {scope: 'email,user_status'});
    
      return false;
    });
  }
});

// Models
App.Store = DS.Store.extend({
  revision: 12,
  adapter: DS.Firebase.Adapter.create({
    dbName: "messenger"
  })
});


App.Message = DS.Firebase.LiveModel.extend({
  messageItems: DS.hasMany('App.MessageItem'),
  playlist: DS.belongsTo('App.Playlist')
});

App.MessageItem = DS.Firebase.LiveModel.extend({
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

App.User = DS.Firebase.Model.extend({
  facebookId: DS.attr('string'),
  name:       DS.attr('string'),
  
  imgSrc: function() {
    return "http://graph.facebook.com/" + this.facebookId + "/picture";
  }
});

App.Playlist = DS.Firebase.LiveModel.extend({
  songs: DS.hasMany('App.Song')
});

App.Song = DS.Firebase.LiveModel.extend({
  artistName: DS.attr('string'),
  trackTitle: DS.attr('string'),
  youtubeUrl: DS.attr('string'),
  
  getIdFromUrl: function() {
    regex = /http\:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})/;

    url = this.get('youtubeUrl');
    id = url.match(regex)[1];
    
    return id;
  },
  
  getResultsFromYoutube: function(query, callback) {
    var queryURI = ["https://gdata.youtube.com/feeds/api/videos?q=", query, 
                    "&max-results=5&v=2&alt=json&callback=?"].join('');
    $.getJSON(queryURI, function(data) {
      var res = {videoId: null, videoDuration: 0, videoTitle: null}
      try {
        var videoId       = data.feed.entry[0].media$group.yt$videoid.$t;
        var videoDuration = data.feed.entry[0].media$group.yt$duration.seconds;
        var videoTitle    = data.feed.entry[0].title.$t;
        res = {videoId: videoId, videoDuration: videoDuration, videoTitle: videoTitle}
      } catch (error) {
        console.log('no video result');
      }
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
    console.log("Query: ", query);
    this.getResultsFromYoutube(query, function(data) {
      var videoId       = data.videoId;
      var videoDuration = data.videoDuration;
      if (videoDuration > (15 * 60)) {
        console.log("[Wrong Result] Video is too long: ");
        console.log({query: query, resultId: videoId, resultVideoDuration: videoDuration});
      } else {
        if (videoId !== undefined && videoId !== null) {
          Player.loadVideoById(videoId, 0, 'default');
        }
      }
    });
  },
  
  didCreate: function() {
    var that  = this;
    this.getTitleFromYoutube(this.get('youtubeUrl'), function(title) {
      console.log("Title: ", title);
      var queryURI = ["http://ws.audioscrobbler.com/2.0/?method=track.search",
                      "&track=", title, "&api_key=571142411e7515c37b1cbff311ecaeb3&format=json"].join('');
      $.getJSON(queryURI, function(data) {
        that.set('artistName', title);
        if (data.error !== undefined) {
          console.log("Error msg: ", data.message);
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
