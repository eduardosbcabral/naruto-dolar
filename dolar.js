const fetch = require('node-fetch');
const fs = require('fs');

const endpoint = 'https://economia.awesomeapi.com.br/json/all/USD-BRL';

getCurrentDolar = async () => {
  const response = await fetch(endpoint);
  let json = await response.json();

  let json_formatted = formatReturnedObject(json.USD);
  json_formatted.status = getDolarStatus(json.USD);
  return json_formatted;
}

formatReturnedObject = (json_object) => {
  const { bid } = json_object;

  const value_to_BRL = bid
    .substring(0, json_object.bid.length - 2)
    .replace('.', ',');

  const value_without_dot = bid
    .substring(0, bid.length - 2)
    .replace('.', '');

  return {
    value: value_to_BRL,
    value_formatted: value_without_dot,
    default_value: bid
  };
}

getDolarStatus = (currentDolar) => {
  
  let savedDolar = getSavedDolar();

  const savedDolarBid = Math.floor(parseFloat(savedDolar.bid) * 100) / 100;
  const currentDolarBid = Math.floor(parseFloat(currentDolar.bid) * 100) / 100;

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