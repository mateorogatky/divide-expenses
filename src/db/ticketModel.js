import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
