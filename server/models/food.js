const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FoodSchema = new Schema({
  name: { type: 'String', required: false },
  price: { type: 'String', required: false },
  category: { type: 'String', required: false },
  quantity: { type: 'String', required: false },
  raw_items: { type: 'String', required: false },
  pic: { type: 'String', required: false },
 
           


});

module.exports = mongoose.model('foods', FoodSchema);
