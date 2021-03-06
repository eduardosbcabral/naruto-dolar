const path = require('path');
global.appRoot = path.resolve(__dirname);
const schedule = require('node-schedule');
const { getChapterTitle, getFile } = require('./helpers');
const { getCurrentDolar, dolar_status, saveCurrentDolar } = require('./dolar');
const MyTwit = require('./twit');
const T = new MyTwit();

postTweet = async () => {

  const { value, value_formatted, status, default_value, percentual_difference } = await getCurrentDolar();

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
O dólar ${getDolarStatusMessage(status)} e está cotado a R$${value}!!! ${getDolarStatusEmoji(status)} (${getCurrentDate()})
            
Capítulo ${value_formatted}: ${getChapterTitle(value_formatted)}
  
Variação: ${getDolarPercentualMessage(status, percentual_difference)}
`;

    await T.postTweet(message, media_id_string);

    saveCurrentDolar({ bid: default_value });

    console.log('Tweet posted!');

  } catch (err) {
    console.log('An error has occured: ' + err);
  }
}

getCurrentDate = () => {
  var date = new Date();
  return `${date.getHours()}:${(date.getMinutes()<10?'0':'') + date.getMinutes()}`;
}

getDolarStatusMessage = (status) => {
  if(status === dolar_status.higher.value) {
    return 'subiu';
  }

  if(status === dolar_status.lower.value) {
    return 'caiu';
  }

  if(status === dolar_status.same.value) {
    return 'não variou';
  }
}

getDolarPercentualMessage = (status, percentual) => {
  if(status === dolar_status.higher.value) {
    return '📈 +' + percentual + '%';
  }

  if(status === dolar_status.lower.value) {
    return '📉 -' + percentual + '%';
  }

  if(status === dolar_status.same.value) {
    return '⬜ 0.00%';
  }
}

getDolarStatusEmoji = (status) => {
  if(status === dolar_status.higher.value) {
    return '😥';
  }

  if(status === dolar_status.lower.value) {
    return '🙂';
  }

  if(status === dolar_status.same.value) {
    return '😐';
  }
}

main = () => {
  console.log('Bot is running!');

  if(process.argv.find(x => x === 'default')) {
    schedule.scheduleJob('0 9-17/2 * * 1-5', async () => {
      await postTweet();
    });
  }
  
  if(process.argv.find(x => x === 'now')) {
    postTweet()
      .then(() => process.exit());
  }
}

main();