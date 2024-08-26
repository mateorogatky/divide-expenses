import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';

const API_URL = 'http://192.168.1.173:5000';

export default function UsersListScreen() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTickets, setUserTickets] = useState([]);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);

  useEffect(() => {
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

  const fetchUserTickets = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/assignments/user/${userId}`);
      const data = await response.json();
      console.log('Tickets del usuario:', data);
  
      if (data.length === 0) {
        Alert.alert('Sin Tickets', 'Este usuario no tiene tickets asignados.');
      }
  
      setUserTickets(data);
    } catch (error) {
      console.error("Error al obtener tickets del usuario: ", error);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUser(userId);
    fetchUserTickets(userId);
  };

  const handleDeleteTicket = async (assignmentId) => {
    try {
      const response = await fetch(`${API_URL}/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Ticket eliminado del usuario.');
        fetchUserTickets(selectedUser); // Refrescar la lista de tickets después de eliminar
      } else {
        Alert.alert('Error', 'No se pudo eliminar el ticket.');
      }
    } catch (error) {
      console.error('Error al eliminar el ticket:', error);
      Alert.alert('Error', 'No se pudo eliminar el ticket.');
    }
  };

  const calculateTotalWithTaxAndTip = () => {
    // Calcular el total basado en el precio por la cantidad asignada
    const total = userTickets.reduce((sum, item) => {
      const price = item.ticketId?.price || 0;
      const quantityAssigned = item.quantity || 0;
      return sum + (price * quantityAssigned);
    }, 0);

    // Calcular el monto de tax y tip
    const taxAmount = total * (taxPercentage / 100);
    const tip = tipAmount > 0 ? tipAmount : total * (tipPercentage / 100);

    // Retornar el total final con tax y tip
    return total + taxAmount + tip;
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userButton}
      onPress={() => handleSelectUser(item._id)}
    >
      <Text style={styles.userName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderTicketItem = ({ item }) => {
    const productName = item.ticketId?.productName || 'Producto no disponible';
    const quantityAssigned = item.quantity ?? 0;
    const price = item.ticketId?.price ?? 0;
  
    return (
      <View style={styles.ticketContainer}>
        <Text style={styles.ticketText}>Producto: {productName}</Text>
        <Text style={styles.ticketText}>Cantidad asignada: {quantityAssigned}</Text>
        <Text style={styles.ticketText}>Precio: ${price}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTicket(item._id)}
        >
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    );
  };
  

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
          <View style={styles.taxContainer}>
            <Text style={styles.taxLabel}>Tax:</Text>
            <TextInput
              style={styles.taxInput}
              keyboardType="numeric"
              placeholder="0"
              value={String(taxPercentage)}
              onChangeText={(value) => setTaxPercentage(parseFloat(value) || 0)}
            />
            <Text>%</Text>
          </View>
          <View style={styles.tipContainer}>
            <Text style={styles.tipLabel}>Tip (porcentaje):</Text>
            <TextInput
              style={styles.tipInput}
              keyboardType="numeric"
              placeholder="0"
              value={String(tipPercentage)}
              onChangeText={(value) => setTipPercentage(parseFloat(value) || 0)}
            />
            <Text>%</Text>
          </View>
          <View style={styles.tipContainer}>
            <Text style={styles.tipLabel}>Tip (valor):</Text>
            <TextInput
              style={styles.tipInput}
              keyboardType="numeric"
              placeholder="0"
              value={String(tipAmount)}
              onChangeText={(value) => setTipAmount(parseFloat(value) || 0)}
            />
          </View>
          <Text style={styles.totalText}>Total con Tip y Tax: ${calculateTotalWithTaxAndTip().toFixed(2)}</Text>
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
    marginBottom: 10,
  },
  userButton: {
    marginBottom: 8,
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
    marginTop: 10,
  },
  ticketContainer: {
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  ticketText: {
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  taxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  taxLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  taxInput: {
    borderBottomWidth: 1,
    padding: 5,
    fontSize: 16,
    width: 60,
    textAlign: 'center',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  tipLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  tipInput: {
    borderBottomWidth: 1,
    padding: 5,
    fontSize: 16,
    width: 60,
    textAlign: 'center',
  },
  totalText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
