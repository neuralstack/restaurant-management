const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  min: { type: 'String', required: false },
  max: { type: 'String', required: false },
  utc : {type: 'String', required: false },
  date: { type: 'String', required: false },
  day: { type: 'String', required: false },
  month: { type: 'String', required: false },
  year: { type: 'String', required: false },
  sales: { type: Number, required: false },
  expenses: { type: Number, required: false }

});

module.exports = mongoose.model('Reports', ReportSchema);
