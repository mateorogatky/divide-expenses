const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./userModel');

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect('mongodb+srv://mateorogatky:BFDJpVp3ENz1y2Ma@cluster0.quo76.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

// Definir el esquema de ticket
const ticketSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});
const Ticket = mongoose.model('Ticket', ticketSchema);

// Definir el esquema de asignación
const assignmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
});

const Assignment = mongoose.model('Assignment', assignmentSchema);


// Rutas para usuarios
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/users', async (req, res) => {
  try {
    const newUser = new User({ name: req.body.name });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

// Rutas para tickets
app.get('/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
});

app.post('/tickets', async (req, res) => {
  try {
    const newTicket = new Ticket(req.body);
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el ticket' });
  }
});

// Rutas para tickets
app.delete('/tickets/:id', async (req, res) => {
  try {
    const ticketId = req.params.id;

    // Eliminar las asignaciones asociadas al ticket
    await Assignment.deleteMany({ ticketId });

    // Eliminar el ticket
    const deletedTicket = await Ticket.findByIdAndDelete(ticketId);

    if (!deletedTicket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.status(200).json({ message: 'Ticket y asignaciones eliminadas con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el ticket' });
  }
});


// Rutas para asignaciones
app.get('/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find().populate('userId').populate('ticketId');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener asignaciones' });
  }
});

app.post('/assignments', async (req, res) => {
  try {
    const { ticketId, userId } = req.body;

    // Crear nueva asignación
    const newAssignment = new Assignment({ ticketId, userId });

    // Guardar en la base de datos
    await newAssignment.save();

    res.status(201).json(newAssignment);
  } catch (error) {
    console.error('Error al crear asignación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});
app.get('/assignments/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const assignments = await Assignment.find({ userId }).populate('ticketId');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener asignaciones del usuario' });
  }
});


app.listen(5000, () => {
  console.log('Servidor ejecutándose en el puerto 5000');
});
