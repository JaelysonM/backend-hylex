const { getClientIdByName } = require('../storage/clientStorage');
const { io, models } = require('../server');

module.exports = {
  async index({ defaultBody, parameters: { clientName, schemasToRequire } }) {
    try {
      const { uuid, name } = defaultBody;

      const datas = [];

      for (x in schemasToRequire) {
        const schemaName = schemasToRequire[x];
        var data = null;
        try {
          data = await models[schemaName].findOne({ uuid });
        } catch (err) { }
        if (data == null) data = await models[schemaName].create({ uuid, name })
        datas.push({
          schemaName,
          data
        }
        );
      }
      //console.log(`\n\x1b[30m✎ \x1b[43m\x1b[30m backend - mongoose \x1b[0m ${schemasToRequire.join(', ')} Data loaded | Nickname: \x1b[1m${name}\x1b[0m UUID: \x1b[1m${uuid}\x1b[0m`);

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
      const { schemaName, data } = schemas[x];
      const body = data;
      const id = data._id;
      delete body['_id'];
      delete body['__v'];
      await models[schemaName].findByIdAndUpdate(id, body);

    }

    // console.log(`\n\x1b[30m✎ \x1b[43m\x1b[30m backend - mongoose \x1b[0m Data saved | UUID: \x1b[1m${uuid}\x1b[0m`);
  }
}