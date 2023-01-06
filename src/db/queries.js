const historialSchema = require('./schema');

const getDbWebResult = async () => {
  const results = await historialSchema.find({});
  return results;
};

const DeleteAllWebResult = async ()=>{
  const result = await historialSchema.deleteMany({});
  return result;
}

const deleteWebResult = async (searchId) => {
  const result = await historialSchema.deleteOne({ _id: searchId });
  return result;
};


async function saveToDb(results){
  const searchResults = new historialSchema(results);
  await searchResults.save();
}

module.exports = {
  getDbWebResult,
  DeleteAllWebResult,
  deleteWebResult,
  saveToDb,
}