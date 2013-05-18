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

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('messages');
  }
});