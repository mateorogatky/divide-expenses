import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';

// URL de tu API
const API_URL = 'http://192.168.1.173:5000';

export default function UsersListScreen() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTickets, setUserTickets] = useState([]);

  useEffect(() => {
    // Obtener usuarios
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/users`);
        const data = await response.json();
        console.log('Usuarios:', data);
        setUsers(data);
      } catch (error) {
        console.error("Error al obtener usuarios: ", error);
      }
    };

    fetchUsers();
  }, []);

  // Obtener tickets para el usuario seleccionado
  const fetchUserTickets = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/assignments/user/${userId}`);
      const data = await response.json();
      console.log('Tickets del usuario:', data);
      
      if (data.length === 0) {
        Alert.alert('Sin Tickets', 'Este usuario no tiene tickets asignados.');
      }
      
      setUserTickets(data.map(assignment => assignment.ticketId)); // Extraer solo los tickets
    } catch (error) {
      console.error("Error al obtener tickets del usuario: ", error);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUser(userId);
    fetchUserTickets(userId); // Obtener los tickets del usuario seleccionado
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userButton}
      onPress={() => handleSelectUser(item._id)}
    >
      <Text style={styles.userName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderTicketItem = ({ item }) => (
    <View style={styles.ticketContainer}>
      <Text style={styles.ticketText}>Producto: {item.productName}</Text>
      <Text style={styles.ticketText}>Cantidad: {item.quantity}</Text>
      <Text style={styles.ticketText}>Precio: ${item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Usuarios</Text>
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.userList}
      />
      {selectedUser && (
        <View style={styles.ticketsContainer}>
          <Text style={styles.title}>Tickets del Usuario</Text>
          <FlatList
            data={userTickets}
            renderItem={renderTicketItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.ticketList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10, // Reducir margen inferior
  },
  userButton: {
    marginBottom: 8, // Reducir margen inferior
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    color: '#fff',
  },
  ticketsContainer: {
    marginTop: 10, // Reducir espacio superior
  },
  ticketContainer: {
    marginBottom: 8, // Reducir margen inferior
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  ticketText: {
    fontSize: 16,
  },
  userList: {
    // Sin margen aquí, se ajusta con marginBottom en userButton
  },
  ticketList: {
    // Sin margen aquí, se ajusta con marginBottom en ticketContainer
  },
});
