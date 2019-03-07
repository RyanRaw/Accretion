async function gen(parameters) {
  let hookData = {}
  // test if the similar relation exists
  // protect similar relation from bing delete if this hook function is active
  async function test ({operation, entry}) {
    let id = similarRelation.id
    if (operation) { // run this in Tag api
      if (entry.id === id && operation === '-') {
        throw Error('The syncMeta hook is active, can not delete the `similar` relation')
      } else if (entry.id === id && operation === '*' && entry.name != 'similar') {
        throw Error('The syncMeta hook is active, can not rename the `similar` relation')
      } else if (operation === '+' && entry.name === 'similar') {
        throw Error('The syncMeta hook is active, can not add another `similar` relation')
      }
    } else { // init
      let similar = await Models.Relation.find({name: 'similar'})
      if (similar.length !== 1) throw Error(`To make the syncMeta hook work, must have a single ``simular`` relation, current query result:${JSON.stringify(similar,null,2)}`)
      similar = similar[0]
      hookData.similar = similar
    }
  }
  async function syncMeta ({operation, entry, old_sub_entry, new_sub_entry}) {
    // console.log({operation, entry, old_sub_entry, new_sub_entry})
    let {uuid} = parameters
    return {
      add: {

      },
      del: {

      }
    }
  }
  syncMeta.test = ({operation, entry, old_sub_entry, new_sub_entry}) => {
    if (operation === "+") {

    } else if (operation === '*') {

    } else if (operation === '-') {

    }
  }
  return {
    relations: syncMeta
  }
}

export default {
  uid: "syncMeta",
  name: "syncMeta",
  description: "When two model have the 'similar' relation, automatically sync their metadatas, catalogue and tags",
  parameters: {},
  function: gen,
}
