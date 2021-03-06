const { getClientIdByName } = require('../storage/clientStorage');
const { io, models } = require('../server');

module.exports = {
  async index({ defaultBody, parameters: { clientName, schemasToRequire } }) {
    try {
      let { uuid, name } = defaultBody;

      let datas = [];

      for (x in schemasToRequire) {
        let schemaName = schemasToRequire[x];
        let data = null;
        try {
          data = await models[schemaName].findOne({ uuid });
        } catch (err) { data = await models[schemaName].create({ uuid, name }) }
        if (data == null) data = await models[schemaName].create({ uuid, name })

        datas.push({
          schemaName,
          data
        }
        );
      }
      io.to(getClientIdByName(clientName)).emit('data-callback', {
        uuid,
        schemas: datas
      });
    } catch (err) {
      console.log(`\n\x1b[31m✖ \x1b[43m\x1b[30m DataController \x1b[0m \x1b[0m An error(${err}) occurred while trying to load the account: \x1b[1m${uuid}\x1b[0m`);
    }


  },
  async update({ uuid, schemas }) {
    for (x in schemas) {
      let { schemaName, data } = schemas[x];
      let body = data;
      let id = data._id;
      delete body['_id'];
      delete body['__v'];
      await models[schemaName].findByIdAndUpdate(id, body);

    }
    // console.log(`\n\x1b[30m✎ \x1b[43m\x1b[30m backend - mongoose \x1b[0m Data saved | UUID: \x1b[1m${uuid}\x1b[0m`);
  },
  async top(broadcast, clientId) {
    let log = Date.now();
    const wins = await models['BedWarsData'].find().sort({
      "statistics.wins.global": -1
    }).limit(10);

    const kills = await models['BedWarsData'].find().sort({
      "statistics.kills.global": -1
    }).limit(10);

    const finalKills = await models['BedWarsData'].find().sort({
      "statistics.finalKills.global": -1
    }).limit(10);

    const bedsBroken = await models['BedWarsData'].find().sort({
      "statistics.bedsBroken.global": -1
    }).limit(10);

    const list = {
      winsList: wins.map(result => `${result.name} - ${result.statistics.wins.global}`),
      killsList: kills.map(result => `${result.name} - ${result.statistics.kills.global}`),
      finalkillsList: finalKills.map(result => `${result.name} - ${result.statistics.finalKills.global}`),
      bedsbrokenList: bedsBroken.map(result => `${result.name} - ${result.statistics.bedsBroken.global}`),
    };
    if (broadcast)
      io.emit('leaderboard-bedwars', list)
    else
      io.to(clientId).emit('leaderboard-bedwars', list)

  }
}