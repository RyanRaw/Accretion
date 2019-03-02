import mongoose from 'mongoose'
import mongodb from 'mongodb'
import fillDemo from './fillDemo'
import __ from './models'
const {Models, api, Withs, All, getRequire} = __
const consola = require('consola')
const User = Models.User

async function initIDs ({config}) {
  // set the init id for all models
  let names = Object.keys(Models)
  let offset = 1 // if unittest, models should have different offset
  // for 'Article'
  for (let name of names) {
    let good = await Models.IDs.findOne({name})
    if (!good) {
      await Models.IDs.insertMany([{name, count: offset}])
      let data = { id: 0 }
      let pks = getRequire(Models[name])
      if (pks.length) {
        for (let pk of pks) {
          data[pk] = `create and then delete`
        }
      }
      await Models[name].create([data])
      await Models[name].deleteOne(data)
      if (config.unittest) offset += 1000
    }
  }
  // for 'Article-tags'
  let models = Object.keys(Withs)
  for (let name of models) {
    for (let withname of Withs[name]) {
      if (['flags', 'fathers', 'children'].includes(withname)) continue
      let good = await Models.IDs.findOne({name: `${name}-${withname}`})
      if (!good) {
        await Models.IDs.insertMany([{name: `${name}-${withname}`, count: offset}])
        if (config.unittest) offset += 1000
      }
    }
  }
}

async function initTestDatabase ({config, databaseConfig}) {
  if (config.demoData || config.unittest) {
    consola.ready({
      message: `clean database`,
      badge: true
    })
    let dropResult = await mongoose.connection.db.dropDatabase()
  }
  await initIDs({config})
  // create default user
  let exist = await User.findOne({username: 'accretion'})
  if (!exist) {
    let user = new User({
      username: 'accretion',
      active: true,
    })
    await user.setPassword('cc')
    await user.save()
  }
  // init with test data
  if (config.demoData) {
    console.log('fill with demoData')
    let da = new fillDemo()
  }
}
async function initProductDatabase () {
  await initIDs()
}

async function init ({config, databaseConfig}) {
  let {bindIp: ip, port} = databaseConfig.net
  let databaseName = config.database
  try {
    await mongoose.connect(`mongodb://${ip}:${port}/accretion`, { useNewUrlParser: true })
    global.debug.conn = await mongodb.connect(`mongodb://${ip}:${port}`, { useNewUrlParser: true })
    global.debug.db = global.debug.conn.db('accretion')
    global.debug.history = global.debug.db.collection('History')
  } catch (e) {
    console.error(e)
    let msg = 'Database connetion error, do you realy start the mongodb using the configs/mongod.yml config file???'
    console.error(msg)
    consola.error(msg)
  }
  if (databaseName === "test") {
    await initTestDatabase({config, databaseConfig})
  } else {
    await initProductDatabase()
  }
}
export default init
