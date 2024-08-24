import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';

export default function TicketsScreen() {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [tickets, setTickets] = useState([]);

  const API_URL = 'http://192.168.1.173:5000/tickets';

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error("Error al obtener los tickets: ", error);
      }
    };

    fetchTickets();
  }, []);

  const handleAddTicket = async () => {
    if (productName.trim() && quantity.trim() && price.trim()) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productName,
            quantity: parseInt(quantity),
            price: parseFloat(price),
          }),
        });

        const newTicket = await response.json();

        if (newTicket && newTicket._id) {
          setTickets(prevTickets => [...prevTickets, newTicket]);
        } else {
          console.error("El ticket agregado no tiene _id");
        }

        setProductName('');
        setQuantity('');
        setPrice('');
      } catch (e) {
        console.error("Error al agregar el ticket: ", e);
      }
    } else {
      Alert.alert("Error", "Todos los campos son obligatorios");
    }
  };

  const handleDeleteTicket = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        setTickets(prevTickets => prevTickets.filter(ticket => ticket._id !== id));
        Alert.alert('Éxito', 'Ticket eliminado con éxito');
      } else {
        console.error("Error al eliminar el ticket");
      }
    } catch (e) {
      console.error("Error al eliminar el ticket: ", e);
    }
  };
  

  const renderItem = ({ item }) => {
    if (!item || !item._id) {
      console.error("Ticket inválido:", item);
      return null;
    }

    return (
      <View style={styles.ticketContainer}>
        <Text style={styles.ticketText}>Producto: {item.productName}</Text>
        <Text style={styles.ticketText}>Cantidad: {item.quantity}</Text>
        <Text style={styles.ticketText}>Precio: ${item.price.toFixed(2)}</Text>
        <TouchableOpacity onPress={() => handleDeleteTicket(item._id)} style={styles.deleteButtonContainer}>
          <Text style={styles.deleteButton}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingresar Ticket</Text>
      <TextInput
        style={styles.input}
        value={productName}
        onChangeText={setProductName}
        placeholder="Nombre del producto"
      />
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Cantidad"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Precio"
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleAddTicket}>
        <Text style={styles.buttonText}>Agregar Ticket</Text>
      </TouchableOpacity>
      <FlatList
        data={tickets}
        renderItem={renderItem}
        keyExtractor={item => item._id.toString()}
        style={styles.list}
      />
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
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
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
  list: {
    marginTop: 20,
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
    marginBottom: 5,
  },
  deleteButtonContainer: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  deleteButton: {
    color: 'red',
    fontSize: 16,
  },
});
