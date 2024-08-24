import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.1.173:5000/users'; // Cambia esto a la IP de tu servidor

export default function UsersScreen() {
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(API_URL);
        setUsers(response.data);
      } catch (error) {
        console.error("Error al obtener los usuarios: ", error);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (userName.trim()) {
      try {
        const response = await axios.post(API_URL, { name: userName });
        setUserName('');
        const updatedUsers = [...users, response.data];
        setUsers(updatedUsers);
      } catch (e) {
        console.error("Error al agregar el usuario: ", e);
      }
    } else {
      Alert.alert("Error", "Nombre de usuario vacío o solo espacios");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      Alert.alert("Éxito", "Usuario eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar el usuario: ", error);
      Alert.alert("Error", "No se pudo eliminar el usuario");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingresar Usuario</Text>
      <TextInput
        style={styles.input}
        value={userName}
        onChangeText={setUserName}
        placeholder="Nombre del usuario"
      />
      <TouchableOpacity style={styles.button} onPress={handleAddUser}>
        <Text style={styles.buttonText}>Agregar Usuario</Text>
      </TouchableOpacity>
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <View style={styles.userContainer}>
            <Text style={styles.user}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleDeleteUser(item._id)}>
              <Text style={styles.deleteButton}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item._id}
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
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  user: {
    fontSize: 18,
  },
  deleteButton: {
    color: 'red',
    fontSize: 16,
  },
});
