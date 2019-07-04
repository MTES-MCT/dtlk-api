let mongoose = require('mongoose')
let connection = require('../connection')('hub')

let RowSchema = new mongoose.Schema({
  _id: Number
}, {
  timestamps: false,
  strict: false,
  typeKey: '$type',
  versionKey: false
})

RowSchema.statics = {
  async deleteCollection() { await this.deleteMany({}) },
  async dropCollection() { await this.collection.drop() },
  async renameCollection(name) { await this.collection.rename(name) },
  async updateRid(newRid) { await this.updateMany({}, { rid: newRid }) }
}
module.exports = (collectionName) => connection.model('Row', RowSchema, 'rows_' + collectionName)
