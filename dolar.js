const fetch = require('node-fetch');

const endpoint = 'https://economia.awesomeapi.com.br/json/all/USD-BRL';

getCurrentDolar = async () => {
  const response = await fetch(endpoint);
  let json = await response.json();
  return formatReturnedObject(json.USD);
}

formatReturnedObject = (json_object) => {
  const { bid, pctChange } = json_object;

  const value_to_BRL = bid
    .substring(0, json_object.bid.length - 2)
    .replace('.', ',');

  const value_without_dot = bid
    .substring(0, bid.length - 2)
    .replace('.', '');

  return {
    value: value_to_BRL,
    value_formatted: value_without_dot,
    status: getDolarStatus(pctChange)
  };
}

getDolarStatus = (pctChange) => {
  if(pctChange > 0) {
    return dolar_status.higher.value;
  }

  if(pctChange < 0) {
    return dolar_status.lower.value;
  }

  if(pctChange === 0) {
    return dolar_status.same.value;
  }
}

const dolar_status = {
  higher: { value: 0 },
  lower: { value: 1 },
  same: { value: 2 }
};

module.exports = {
  getCurrentDolar,
  dolar_status
};