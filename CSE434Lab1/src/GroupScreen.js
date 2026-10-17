import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { socket } from './socket';

const GROUP_ID = 'CSE434';

export default function GroupScreen() {
  const route = useRoute();
  const name = route.params?.name?.trim() || 'Guest';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(socket.connected);

  const flatListRef = useRef(null);

  useEffect(() => {
    const joinGroup = () => {
      setConnected(true);

      socket.emit('join_group', {
        groupId: GROUP_ID,
        username: name,
      });
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleReceiveMessage = data => {
      const time = data.time
        ? new Date(data.time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : '';

      const message = {
        id: data.id || `${Date.now()}-${Math.random()}`,
        text: data.text,
        time,
        author: data.username || 'Guest',
        sender: data.username === name ? 'me' : 'other',
      };

      setMessages(previous => [...previous, message]);
    };

    socket.on('connect', joinGroup);
    socket.on('disconnect', handleDisconnect);
    socket.on('receive_message', handleReceiveMessage);

    if (socket.connected) {
      joinGroup();
    } else {
      socket.connect();
    }

    return () => {
      socket.off('connect', joinGroup);
      socket.off('disconnect', handleDisconnect);
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [name]);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', () => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    return () => subscription.remove();
  }, []);

  const handleSend = () => {
    const text = input.trim();

    if (!text || !socket.connected) {
      return;
    }

    socket.emit('send_message', {
      groupId: GROUP_ID,
      username: name,
      text,
    });

    setInput('');
  };

  const renderMessage = ({ item, index }) => {
    const isMe = item.sender === 'me';

    const showAuthor =
      !isMe && (index === 0 || messages[index - 1]?.author !== item.author);

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.myMessageRow : styles.otherMessageRow,
        ]}
      >
        {!isMe && (
          <View style={styles.avatarColumn}>
            {showAuthor ? (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.author.charAt(0).toUpperCase()}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        <View
          style={[
            styles.messageContent,
            isMe ? styles.myMessageContent : styles.otherMessageContent,
          ]}
        >
          {showAuthor && <Text style={styles.authorName}>{item.author}</Text>}

          <View
            style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}
          >
            <Text style={[styles.messageText, isMe && styles.myMessageText]}>
              {item.text}
            </Text>
          </View>

          <Text style={[styles.timestamp, isMe && styles.myTimestamp]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {!connected && (
          <View style={styles.connectionBanner}>
            <Text style={styles.connectionText}>
              Connecting to chat server...
            </Text>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        <View style={styles.composer}>
          <Pressable style={styles.attachButton} onPress={() => {}} hitSlop={8}>
            <Text style={styles.attachIcon}>♧</Text>
          </Pressable>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Message..."
              placeholderTextColor="#888888"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={2000}
              editable={connected}
            />

            <Pressable
              style={styles.extraButton}
              onPress={() => {}}
              hitSlop={8}
            >
              <Text style={styles.extraIcon}>▢</Text>
            </Pressable>
          </View>

          <Pressable
            style={[
              styles.sendButton,
              (!input.trim() || !connected) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!input.trim() || !connected}
            hitSlop={6}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  chatContainer: {
    flex: 1,
  },

  connectionBanner: {
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#FFF4D6',
  },

  connectionText: {
    fontSize: 12,
    color: '#805B00',
  },

  messageList: {
    flex: 1,
  },

  messageListContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 18,
  },

  myMessageRow: {
    justifyContent: 'flex-end',
  },

  otherMessageRow: {
    justifyContent: 'flex-start',
  },

  avatarColumn: {
    width: 36,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
    marginRight: 8,
  },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F7C843',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  avatarText: {
    color: '#263238',
    fontWeight: '700',
    fontSize: 13,
  },

  messageContent: {
    maxWidth: '82%',
  },

  myMessageContent: {
    alignItems: 'flex-end',
  },

  otherMessageContent: {
    alignItems: 'flex-start',
  },

  authorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 8,
  },

  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },

  myBubble: {
    backgroundColor: '#20A394',
    borderTopRightRadius: 3,
  },

  otherBubble: {
    backgroundColor: '#F0F5F8',
    borderTopLeftRadius: 3,
  },

  messageText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#263238',
  },

  myMessageText: {
    color: '#FFFFFF',
  },

  timestamp: {
    fontSize: 9,
    color: '#8C8C8C',
    marginTop: 7,
    marginHorizontal: 3,
  },

  myTimestamp: {
    textAlign: 'right',
  },

  composer: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },

  attachButton: {
    width: 32,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

  attachIcon: {
    fontSize: 24,
    color: '#697174',
  },

  inputContainer: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    backgroundColor: '#F0F5F5',
    borderRadius: 12,
  },

  textInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    fontSize: 13,
    color: '#263238',
    paddingVertical: 8,
  },

  extraButton: {
    width: 28,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  extraIcon: {
    fontSize: 22,
    color: '#8B9292',
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#20A394',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonDisabled: {
    opacity: 0.5,
  },

  sendIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    marginLeft: 3,
  },
});
