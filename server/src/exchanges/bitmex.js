const Exchange = require('../exchange');
const WebSocket = require('ws');

class Bitmex extends Exchange {

	constructor(options) {
		super(options);

		this.id = 'bitmex';

		this.mapping = {
			BTCUSD: 'XBTUSD',
			ADABTC: 'ADAM18',
			BCHBTC: 'BCHM18',
			ETHBTC: 'ETHM18',
			LTCBTC: 'LTCM18',
			XRPBTC: 'XRPM18',
		}

		this.options = Object.assign({
			url: () => {
				return 'wss://www.bitmex.com/realtime?subscribe=trade:' + this.pair
			},
		}, this.options);
	}

	connect(pair) {
    if (!super.connect(pair))  
      return;

		this.server = new WebSocket(this.getUrl());
		this.server.on('message', event => this.emitData(this.format(event)));

		this.server.on('open', this.emitOpen.bind(this));

		this.server.on('close', this.emitClose.bind(this));

		this.server.on('error', this.emitError.bind(this));
	}

	disconnect() {
    if (!super.disconnect())  
      return;

		if (this.server && this.server.readyState < 2) {
			this.server.close();
		}
	}

	format(event) {
		const json = JSON.parse(event);

		if (json && json.data && json.data.length) {
			return json.data.map(trade => {
				return [
					this.id + trade.trdMatchID,
					+new Date(trade.timestamp),
					trade.price,
					trade.size / trade.price,
					trade.side === 'Buy' ? 1 : 0,
					trade.tickDirection.indexOf('Zero') === 0 ? 1 : 0
				];
			})
		}

		return false;
	}

}

module.exports = Bitmex;