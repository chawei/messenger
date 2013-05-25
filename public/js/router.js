App.ApplicationRoute = Ember.Route.extend({
  setupController: function() {
    var that = this;
    if (App.currentUser !== null) {
      var playlistId = App.currentUser.id;
      App.playlist   = App.Playlist.find(playlistId);
      that.controllerFor('songs').set('model', App.playlist.get('songs'));
    }
  }
});

App.Router.map(function() {
  this.resource('messages', function(){
    this.resource('message', {path: ":message_id"});
  });
});

App.MessagesRoute = Ember.Route.extend({
  model: function() {
    return App.Message.find();
  }
});

App.MessageRoute = Ember.Route.extend({  
  model: function (params) {
    return App.Message.find(params.message_id);
  }
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('messages');
  }
});