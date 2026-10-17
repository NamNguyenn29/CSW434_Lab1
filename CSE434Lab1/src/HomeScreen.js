import React from 'react';
import { useState } from 'react';
import {
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const [name, setName] = useState('');

  const navigation = useNavigation();

  const handleStartChat = () => {
    if (!name.trim()) {
      return;
    }
    navigation.navigate('Group CSW434', {
      name: name.trim(),
    });
  };

  return (
    <KeyboardAvoidingView style={style.container}>
      <View style={style.header}>
        <Text style={style.title}>Your Name</Text>
        <Text style={style.subtitle}>Please enter your name</Text>
      </View>
      <View style={style.form}>
        <Text style={style.inputLabel}>Your name</Text>
        <TextInput
          style={style.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          maxLength={50}
        />
      </View>
      <Pressable style={style.button} onPress={handleStartChat}>
        <Text style={style.buttonText}>Start Chat</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

export default HomeScreen;

const style = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  header: {
    alignItems: 'center',
    marginBottom: 58,
  },
  title: {
    fontSize: 18,
    marginBottom: 28,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 12,
    color: '#267F73',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    height: 34,
    borderBottomWidth: 1,
    borderBottomColor: '#DADADA',
    fontSize: 14,
    color: '#222222',
    paddingHorizontal: 0,
    paddingVertical: 4,
    marginBottom: 34,
  },
  button: {
    height: 48,
    backgroundColor: '#287F63',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 25,
    fontWeight: '400',
    letterSpacing: 3,
    color: '#FFFFFF',
  },
});
