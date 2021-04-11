const TwitLibrary = require('twit');
const config = require('./config');

class Twit {

  constructor() {
    this.T = new TwitLibrary(config);
  }

  async mediaUpload(base64_media) {
    return this.T.post('media/upload', { media_data: base64_media });
  }

  async createMediaMetadata(meta_params) {
    return this.T.post('media/metadata/create', meta_params);
  }

  async postTweet(message, mediaIdStr) {
    const params = { status: message, media_ids: [mediaIdStr] }

    return this.T.post('statuses/update', params);
  }
}

module.exports = Twit;