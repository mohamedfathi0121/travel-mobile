import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { supabase } from "../../../lib/supabase";

dayjs.extend(relativeTime);

type Message = {
  id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
};

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatStatus, setChatStatus] = useState<"open" | "closed">("open");
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
const colorScheme = useColorScheme();
  const { user } = useAuth();
  const userId = user?.id;
  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "textPrimary");
  const buttonPrimary = useThemeColor({}, "buttonPrimary");
  const buttonHover = useThemeColor({}, "buttonPrimaryHover");
  const buttonText = useThemeColor({}, "buttonPrimaryText");

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const fetchMessages = async () => {
    if (!userId) return;
    setLoading(true);

    const { data: chat } = await supabase
      .from("support_chats")
      .select("id, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!chat) {
      setMessages([]);
      setChatStatus("open");
      setChatId(null);
      setLoading(false);
      return;
    }

    setChatStatus(chat.status);
    setChatId(chat.id);

    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_id", chat.id)
      .order("created_at", { ascending: true });

    setMessages(msgs as Message[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ✅ Real-time listener that REPLACES optimistic messages
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat_${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        payload => {
          const newMessage = payload.new as Message;

          setMessages(currentMessages => {
            // If the incoming message is from the current user, it's a confirmation.
            // We'll find the temporary message and replace it.
            if (newMessage.sender_id === userId) {
              const tempMessageIndex = currentMessages.findIndex(
                m =>
                  m.id.startsWith("temp-") &&
                  m.message_text === newMessage.message_text
              );

              if (tempMessageIndex !== -1) {
                const updatedMessages = [...currentMessages];
                updatedMessages[tempMessageIndex] = newMessage;
                return updatedMessages;
              }
            }

            // If it's a message from the admin or we couldn't find a temp message to replace,
            // just add it to the end, ensuring it's not already there.
            if (currentMessages.some(m => m.id === newMessage.id)) {
              return currentMessages;
            }
            return [...currentMessages, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, userId]);

  // Real-time listener for chat status updates
  useEffect(() => {
    if (!chatId) return;
    const statusChannel = supabase
      .channel(`status_${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_chats",
          filter: `id=eq.${chatId}`,
        },
        payload => {
          setChatStatus(payload.new.status);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(statusChannel);
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Sends message with OPTIMISTIC update for instant UI feedback
  const handleSend = async () => {
    if (!input.trim() || !userId) return;

    let currentChatId = chatId;
    if (!currentChatId) {
      const { data: newChat, error: newChatError } = await supabase
        .from("support_chats")
        .insert([{ user_id: userId, status: "open" }])
        .select()
        .single();
      if (newChatError) {
        console.error(newChatError);
        return;
      }
      currentChatId = newChat.id;
      setChatId(newChat.id);
      setChatStatus("open");
    }

    const textToSend = input.trim();
    setInput("");

    // ✅ Create a temporary message and add it to the screen immediately.
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
      sender_id: userId,
      message_text: textToSend,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    scrollToBottom();

    const { error } = await supabase.functions.invoke("send-user-message", {
      body: {
        sender_id: userId,
        sender_role: "user",
        message_text: textToSend,
      },
    });

    // ✅ If sending fails, remove the temporary message from the screen.
    if (error) {
      alert("Failed to send message");
      console.error(error);
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    }
  };

  const handleStartNewChat = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("support_chats")
      .insert([{ user_id: userId, status: "open" }])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Failed to start a new chat.");
    } else {
      setChatId(data.id);
      setChatStatus("open");
      setMessages([]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {chatStatus === "closed" && (
        <View style={styles.header}>
          <Text style={[styles.headerTitle , { color: colorScheme === "dark" ? "#9ca3af" : "#94a3b8"}]}>Closed Chat (View Only)</Text>
        </View>
      )}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.sender_id === userId
                ? [styles.userMessage, { backgroundColor: buttonPrimary }] // ✅ correct
                : [styles.adminMessage,{ backgroundColor: colorScheme === "dark" ? "#9ca3af" : "#94a3b8"}], 
            ]}
          >
            <Text
              style={[
                styles.messageText,
                { color: buttonText },
              ]}
            >
              {item.message_text}
            </Text>
            <Text style={[styles.timeText, { color: buttonText}]}>
              {dayjs(item.created_at).format("h:mm A")}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 10 }}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />
      {chatStatus === "closed" ? (
        <View style={styles.newChatContainer}>
          <TouchableOpacity
            onPress={handleStartNewChat}
            style={styles.newChatButton}
          >
            <Text style={styles.newChatText}>Start New Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Type a message..."
            placeholderTextColor={textColor} // ✅ separate prop
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim()}
            style={[
              styles.sendButton,
              { backgroundColor: buttonPrimary },
              !input.trim() && { backgroundColor: colorScheme === "dark" ? "#9ca3af" : "#94a3b8"},
            ]}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 12,
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  messageContainer: {
    padding: 10,
    margin: 6,
    borderRadius: 8,
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: "#2563eb",
    alignSelf: "flex-end",
  },
  adminMessage: {
    backgroundColor: "#f1f1f1",
    alignSelf: "flex-start",
  },
  messageText: { fontSize: 14, color: "#333" },
  timeText: {
    fontSize: 10,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  inputRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 6,
  },
  sendButtonText: { color: "#fff", fontWeight: "600" },
  newChatContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  newChatButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  newChatText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
