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