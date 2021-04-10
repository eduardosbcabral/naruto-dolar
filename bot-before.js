const fetch = require('node-fetch');
const Twit = require('twit');
const config = require('./config');
const fs = require('fs');
const chapters_name_list = require('./naruto_mangas.json');
const schedule = require('node-schedule');

const T = new Twit(config);

const cover_folder = './covers';
const naruto_dolar_account_id = '1380736322051137540';
const BOT_USERNAME = '@narutodolar';



getCurrentDolar = async () => {
  const response = await fetch('https://economia.awesomeapi.com.br/json/all/USD-BRL');
  let json = await response.json();
  const json_object = json.USD;
  let formatted = json_object.bid.replace('.', '');
  return {
    value: json_object.bid.substring(0, json_object.bid.length - 2).replace('.', ','),
    value_formatted: formatted.substring(0, formatted.length - 2),
    higher: parseInt(json_object.pctChange) >= 0
  };
}



postTweet = async () => {
  const { value, value_formatted, higher } = await getCurrentDolar();

  const b64content = fs.readFileSync(`./covers/${value_formatted}.${getFileExtension(value_formatted)}`, { encoding: 'base64' })

  // first we must post the media to Twitter
  T.post('media/upload', { media_data: b64content }, async function (err, data, response) {

    console.log('Media posted!');


    const mediaIdStr = data.media_id_string
    const altText = `Capa do capítulo ${value_formatted} de Naruto.`
    const meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

    T.post('media/metadata/create', meta_params, function (err, data, response) {
      if (!err) {

        const message = `
          O dólar ${higher ? 'subiu' : 'caiu'} e está cotado a R$${value}!!! ${higher ? '😕' : '😀'}
          
Capítulo ${value_formatted}: ${getChapterTitle(value_formatted)}
        `;

        const params = { status: message, media_ids: [mediaIdStr] }

        T.post('statuses/update', params, () => {
          console.log('Tweet sent!');
        })
      }
      else {
        console.log(err);
      }
    })
  })
}

getChapterTitle = (chapter) => {
  return chapters_name_list.find(x => x.chapter === chapter).text;
}

getFileExtension = (entry) => {
  const files = fs.readdirSync(cover_folder);
  const filename = files.find((file) => {
    return file.includes(entry);
  });

  const extension = filename.split(".").pop();

  return extension;
}

(async () => {
  await postTweet();
})();

// schedule.scheduleJob('0 * * * *', async () => {
//   await postTweet();
// });