const fs = require('fs');
const chapters_name_list = require('./naruto_mangas.json');
const schedule = require('node-schedule');

const MyTwit = require('./twit');
const Dolar = require('./dolar');

const T = new MyTwit();

postTweet = async () => {

  const { value, value_formatted, higher } = await (new Dolar()).getCurrentDolar();

  const b64_content = getFile(value_formatted);

  try {
    const { data } = await T.mediaUpload(b64_content);

    console.log('Media uploaded!');

    const altText = `Capa do capítulo ${value_formatted} de Naruto.`;

    const media_id_string = data.media_id_string;

    const meta_params = { 
      media_id: media_id_string, 
      alt_text: { text: altText } 
    };

    await T.createMediaMetadata(meta_params);

    const message = `
O dólar ${higher ? 'subiu' : 'caiu'} e está cotado a R$${value}!!! ${higher ? '😕' : '😀'}
          
Capítulo ${value_formatted}: ${getChapterTitle(value_formatted)}
`;

    await T.postTweet(message, media_id_string);

    console.log('Tweet posted!');

  } catch (err) {
    console.log('An error has occured: ' + err);
  }
}

getFile = (value_formatted) => {
  return fs.readFileSync(`./covers/${value_formatted}.${getFileExtension(value_formatted)}`, { encoding: 'base64' });
}

getChapterTitle = (chapter) => {
  return chapters_name_list.find(x => x.chapter === chapter).text;
}

getFileExtension = (entry) => {
  const files = fs.readdirSync('./covers');
  const filename = files.find((file) => {
    return file.includes(entry);
  });

  const extension = filename.split(".").pop();

  return extension;
}

if(process.argv[2] === 'h') {
  schedule.scheduleJob('0 9-17 * * 1-5', async () => {
    await postTweet();
  });
}

if(process.argv[2] === 'n') {
  (async () => {
    try {
      await postTweet();
    } catch (err) {
      console.log(err);
    }
  })();
}
