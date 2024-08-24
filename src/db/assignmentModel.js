const mongoose = require('mongoose');

const Assignment = mongoose.model('Assignment', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }
}));

module.exports = mongoose.model('Assignment', assignmentSchema);
