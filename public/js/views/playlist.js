App.PlaylistView = Ember.View.extend({
  templateName: 'playlist',
  
  didInsertElement: function() {
    this.addYoutubeIframeApiScript();
  },
  
  toggle: function() {
    console.log('toggle playlist view');
  },
  
  addYoutubeIframeApiScript: function() {
    // 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');

    // This is a protocol-relative URL as described here:
    //     http://paulirish.com/2010/the-protocol-relative-url/
    // If you're testing a local page accessed via a file:/// URL, please set tag.src to
    //     "https://www.youtube.com/iframe_api" instead.
    tag.src = "//www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
});