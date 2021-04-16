const fetch = require('node-fetch');
const fs = require('fs');

const endpoint = 'https://economia.awesomeapi.com.br/json/all/USD-BRL';

getCurrentDolar = async () => {
  const response = await fetch(endpoint);
  let json = await response.json();

  let json_formatted = formatReturnedObject(json.USD);

  let last_dolar = getSavedDolar();

  json_formatted.status = getDolarStatus(json.USD.bid, last_dolar.bid);

  json_formatted.percentual_difference = percentualDifference(json.USD.bid, last_dolar.bid);

  return json_formatted;
}

formatReturnedObject = (json_object) => {
  const { bid } = json_object;

  const toRemoveAfterDot = howManyToRemoveAfterDot(bid);

  const value_to_BRL = bid
    .substring(0, json_object.bid.length - toRemoveAfterDot)
    .replace('.', ',');

  const value_without_dot = bid
    .substring(0, bid.length - toRemoveAfterDot)
    .replace('.', '');

  return {
    value: value_to_BRL,
    value_formatted: value_without_dot,
    default_value: bid
  };
}

percentualDifference = (last, current) => {
  const biggest_value = Math.max(parseFloat(last), parseFloat(current));
  const lowest_value = Math.min(parseFloat(last), parseFloat(current));
  
  const percentual_difference = (((biggest_value - lowest_value) / lowest_value) * 100);

  return percentual_difference.toFixed(2);
}

howManyToRemoveAfterDot = value => {
  const afterDot = value.split('.')[1].length;
  return afterDot - 2;
} 

getDolarStatus = (currentDolar, lastDolar) => {

  const savedDolarBid = Math.floor(parseFloat(lastDolar) * 100) / 100;
  const currentDolarBid = Math.floor(parseFloat(currentDolar) * 100) / 100;

  if(currentDolarBid > savedDolarBid) {
    return dolar_status.higher.value;
  }

  if(currentDolarBid < savedDolarBid) {
    return dolar_status.lower.value;
  }

  if(currentDolarBid === savedDolarBid) {
    return dolar_status.same.value;
  }
}

saveCurrentDolar = (dolar) => {
  console.log('Salvando: ', dolar); 
  fs.writeFileSync(global.appRoot + "/current_dolar.json", JSON.stringify(dolar));
}

getSavedDolar = () => {
  const file = fs.readFileSync(global.appRoot + "/current_dolar.json", 'utf8');
  const json_file = JSON.parse(file);
  return json_file;
}

const dolar_status = {
  higher: { value: 0 },
  lower: { value: 1 },
  same: { value: 2 }
};

module.exports = {
  getCurrentDolar,
  dolar_status,
  saveCurrentDolar
};