import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, FlatList, Modal, TouchableOpacity, Alert } from 'react-native';

export default function AssignScreen() {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [userAssignments, setUserAssignments] = useState({});

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
  
        const userAssignmentsMap = {};
        for (const assignment of assignmentsData) {
          if (!assignment.userId || !assignment.ticketId) {
            console.error('Asignación incompleta:', assignment);
            continue;
          }
  
          const ticket = tickets.find(t => t._id === assignment.ticketId._id);
  
          if (!ticket) {
            console.error('Ticket no encontrado para la asignación:', assignment);
            continue;
          }
  
          if (!userAssignmentsMap[assignment.userId._id]) {
            userAssignmentsMap[assignment.userId._id] = { tickets: [], total: 0 };
          }
          userAssignmentsMap[assignment.userId._id].tickets.push(ticket);
          userAssignmentsMap[assignment.userId._id].total += ticket.price || 0;
        }
        setUserAssignments(userAssignmentsMap);
      } catch (error) {
        console.error("Error al obtener datos: ", error);
      }
    };
  
    fetchData();
  }, []);
  
  const handleAssignTicket = async () => {
    if (!selectedUser || !selectedTicket) {
      Alert.alert('Error', 'Por favor, selecciona un usuario y un ticket.');
      return;
    }
  
    const ticketAlreadyAssigned = assignments.some(assignment =>
      assignment.ticketId._id === selectedTicket && assignment.userId._id === selectedUser
    );
  
    if (ticketAlreadyAssigned) {
      Alert.alert('Error', 'El ticket ya ha sido asignado a otro usuario.');
      return;
    }
  
    const newAssignment = {
      ticketId: selectedTicket,
      userId: selectedUser
    };
  
    try {
      const response = await fetch(`${API_URL}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAssignment),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('Asignación exitosa:', result);
        setAssignments([...assignments, result]);
        Alert.alert('Éxito', 'El ticket ha sido asignado al usuario.');
      } else {
        console.error('Error en la solicitud:', await response.text());
        Alert.alert('Error', 'No se pudo asignar el ticket.');
      }
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      Alert.alert('Error', 'No se pudo enviar la solicitud.');
    }
  };
  

  const totalPrice = tickets.reduce((total, ticket) => total + (ticket.price || 0), 0);

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
                  console.log('Usuario seleccionado:', user); // Log del usuario seleccionado
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
            {tickets.map(ticket => (
              <TouchableOpacity
                key={ticket._id}
                style={styles.modalButton}
                onPress={() => {
                  console.log('Ticket seleccionado:', ticket); // Log del ticket seleccionado
                  setSelectedTicket(ticket._id);
                  setShowTicketModal(false);
                }}
              >
                <Text>{ticket.productName}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowTicketModal(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Tickets Asignados</Text>

      <View style={styles.listContainer}>
        <FlatList
          data={tickets}
          renderItem={({ item }) => (
            <View style={styles.ticketContainer}>
              <Text style={styles.ticketText}>Producto: {item.productName}</Text>
              <Text style={styles.ticketText}>Cantidad: {item.quantity}</Text>
              <Text style={styles.ticketText}>Precio: ${item.price?.toFixed(2) || '0.00'}</Text>
            </View>
          )}
          keyExtractor={(item) => item._id}
        />
      </View>

      <Text style={styles.totalText}>Total: ${totalPrice.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Fondo gris claro
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
  listContainer: {
    height: 200, // Altura fija para la lista desplazable
    width: '100%',
  },
  ticketContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff', // Fondo blanco para los tickets
    borderRadius: 5,
    marginBottom: 10,
  },
  ticketText: {
    fontSize: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
