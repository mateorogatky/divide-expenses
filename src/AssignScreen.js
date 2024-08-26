import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Modal, TouchableOpacity, Alert, TextInput } from 'react-native';

export default function AssignScreen() {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [assignments, setAssignments] = useState([]);

  const API_URL = 'http://192.168.1.173:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await fetch(`${API_URL}/users`);
        const usersData = await usersResponse.json();
        setUsers(usersData);

        const ticketsResponse = await fetch(`${API_URL}/tickets`);
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData);

        const assignmentsResponse = await fetch(`${API_URL}/assignments`);
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);

      } catch (error) {
        console.error("Error al obtener datos: ", error);
      }
    };

    fetchData();
  }, []);

  const handleAssignTicket = async () => {
    if (!selectedUser || !selectedTicket || !ticketQuantity) {
      Alert.alert('Error', 'Por favor, selecciona un usuario, un ticket y una cantidad.');
      return;
    }
  
    const quantity = parseInt(ticketQuantity);
  
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Error', 'La cantidad debe ser un número positivo.');
      return;
    }
  
    const ticket = tickets.find(ticket => ticket._id === selectedTicket);
  
    if (!ticket || quantity > ticket.quantity) {
      Alert.alert('Error', 'La cantidad solicitada excede la cantidad disponible del ticket.');
      return;
    }
  
    const newAssignment = {
      ticketId: selectedTicket,
      userId: selectedUser,
      quantity: quantity
    };
  
    try {
      // Hacer la asignación del ticket al usuario
      const response = await fetch(`${API_URL}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAssignment),
      });
  
      if (response.ok) {
        // Actualizar la cantidad del ticket en la base de datos
        const updatedTicketQuantity = ticket.quantity - quantity;
  
        const updateResponse = await fetch(`${API_URL}/tickets/${selectedTicket}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: updatedTicketQuantity }),
        });
  
        if (updateResponse.ok) {
          // Actualizar la cantidad del ticket en el estado de la aplicación
          setTickets(tickets.map(ticket =>
            ticket._id === selectedTicket
              ? { ...ticket, quantity: updatedTicketQuantity }
              : ticket
          ));
  
          const result = await response.json();
          console.log('Asignación exitosa:', result);
          setAssignments([...assignments, result]);
          Alert.alert('Éxito', 'El ticket ha sido asignado al usuario y la cantidad se ha actualizado.');
          setTicketQuantity(''); // Limpiar el campo de cantidad
        } else {
          console.error('Error al actualizar la cantidad del ticket:', await updateResponse.text());
          Alert.alert('Error', 'No se pudo actualizar la cantidad del ticket.');
        }
      } else {
        console.error('Error en la solicitud:', await response.text());
        Alert.alert('Error', 'No se pudo asignar el ticket.');
      }
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      Alert.alert('Error', 'No se pudo enviar la solicitud.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Asignar Usuarios a Tickets</Text>

      <TouchableOpacity style={styles.button} onPress={() => setShowUserModal(true)}>
        <Text style={styles.buttonText}>Selecciona un Usuario</Text>
      </TouchableOpacity>
      <Text style={styles.selectionText}>Usuario Seleccionado: {users.find(user => user._id === selectedUser)?.name || 'Ninguno'}</Text>

      <TouchableOpacity style={styles.button} onPress={() => setShowTicketModal(true)}>
        <Text style={styles.buttonText}>Selecciona un Ticket</Text>
      </TouchableOpacity>
      <Text style={styles.selectionText}>Ticket Seleccionado: {tickets.find(ticket => ticket._id === selectedTicket)?.productName || 'Ninguno'}</Text>

      <TextInput
        style={styles.input}
        value={ticketQuantity}
        onChangeText={setTicketQuantity}
        placeholder="Cantidad"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleAssignTicket}>
        <Text style={styles.buttonText}>Asignar Ticket</Text>
      </TouchableOpacity>

      <Modal
        visible={showUserModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un Usuario</Text>
            {users.map(user => (
              <TouchableOpacity
                key={user._id}
                style={styles.modalButton}
                onPress={() => {
                  console.log('Usuario seleccionado:', user);
                  setSelectedUser(user._id);
                  setShowUserModal(false);
                }}
              >
                <Text>{user.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowUserModal(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTicketModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTicketModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un Ticket</Text>
            {tickets
              .filter(ticket => ticket.quantity > 0)
              .map(ticket => (
                <TouchableOpacity
                  key={ticket._id}
                  style={styles.modalButton}
                  onPress={() => {
                    console.log('Ticket seleccionado:', ticket);
                    setSelectedTicket(ticket._id);
                    setShowTicketModal(false);
                  }}
                >
                  <Text>{ticket.productName} - {ticket.quantity} disponibles</Text>
                </TouchableOpacity>
              ))}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowTicketModal(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  selectionText: {
    fontSize: 16,
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  modalButton: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
});
