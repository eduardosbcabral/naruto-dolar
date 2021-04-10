const fetch = require('node-fetch');

class Dolar {

  endpoint = 'https://economia.awesomeapi.com.br/json/all/USD-BRL';

  async getCurrentDolar() {
    const response = await fetch(this.endpoint);
    let json = await response.json();
    return this.formatReturnedObject(json.USD);
  }

  formatReturnedObject(json_object) {
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
      higher: parseInt(pctChange) >= 0
    };
  }
}

module.exports = Dolar;