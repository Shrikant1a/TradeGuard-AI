import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCopilotChat } from '@/hooks/useApi';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard } from '@/components/ui';
import type { CopilotMessage } from '@/types/api';
import { getErrorMessage } from '@/services/apiClient';

const QUICK_PROMPTS = [
  'What is happening in the market today?',
  'Why is AAPL a BUY?',
  'What are the biggest market risks?',
  'Explain my portfolio risk.',
  'What stocks have unusual momentum?',
  'What is the Fed doing to interest rates?',
];

export default function CopilotScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: '👋 Hello! I\'m your TradeGuardd AI Copilot. I can help you understand market conditions, analyze signals, and explain trading concepts.\n\nWhat would you like to know?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState('AAPL');
  const listRef = useRef<FlatList>(null);
  const chatMutation = useCopilotChat();

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: CopilotMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const res = await chatMutation.mutateAsync({ query: text.trim(), context });
      const assistantMsg: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.response || 'I analyzed your question. Based on current market data, here is my assessment...',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      const errMsg: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ AI Copilot is temporarily unavailable. Please try again shortly.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    }

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>AI Copilot</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>TradeGuardd AI • Online</Text>
          </View>
        </View>
      </View>

      {/* Context Symbol */}
      <View style={styles.contextRow}>
        <Text style={styles.contextLabel}>Context:</Text>
        {['AAPL', 'NVDA', 'TSLA', 'BTC-USD', 'MSFT'].map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setContext(s)}
            style={[styles.contextChip, context === s && styles.contextChipActive]}
          >
            <Text style={[styles.contextText, context === s && styles.contextTextActive]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatArea}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: msg }) => (
            <View style={[
              styles.bubble,
              msg.role === 'user' ? styles.userBubble : styles.aiBubble,
            ]}>
              {msg.role === 'assistant' && (
                <Text style={styles.aiLabel}>🤖 TradeGuardd AI</Text>
              )}
              <Text style={[
                styles.bubbleText,
                msg.role === 'user' && styles.userBubbleText,
              ]}>
                {msg.content}
              </Text>
            </View>
          )}
          ListFooterComponent={chatMutation.isPending ? (
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>AI is analyzing...</Text>
            </View>
          ) : null}
        />

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={styles.promptScroll}
            contentContainerStyle={styles.promptList}
          >
            {QUICK_PROMPTS.map((p) => (
              <TouchableOpacity key={p} onPress={() => sendMessage(p)} style={styles.promptChip}>
                <Text style={styles.promptText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input Row */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask TradeGuardd AI..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || chatMutation.isPending}
            style={[styles.sendBtn, (!input.trim() || chatMutation.isPending) && styles.sendBtnDisabled]}
          >
            <LinearGradient
              colors={['#06b6d4', '#3b82f6']}
              style={styles.sendBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          AI-generated analysis only. Not financial advice.
        </Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.sm,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textSecondary, marginTop: -4 },
  headerCenter: {},
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.buy },
  onlineText: { fontSize: 11, color: Colors.textSecondary },
  contextRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm,
  },
  contextLabel: { fontSize: 11, color: Colors.textMuted },
  contextChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  contextChipActive: { borderColor: Colors.primary, backgroundColor: '#06b6d420' },
  contextText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  contextTextActive: { color: Colors.primary },
  chatArea: { flex: 1 },
  messageList: { padding: Spacing.lg, gap: Spacing.sm, flexGrow: 1 },
  bubble: {
    maxWidth: '85%', borderRadius: 16, padding: 12, gap: 4,
  },
  userBubble: {
    alignSelf: 'flex-end', backgroundColor: '#06b6d4',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start', backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder, borderBottomLeftRadius: 4,
  },
  aiLabel: { fontSize: 9, color: Colors.primary, fontWeight: '700' },
  bubbleText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  userBubbleText: { color: '#fff' },
  typingBubble: {
    alignSelf: 'flex-start', backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: 16, borderBottomLeftRadius: 4,
    padding: 12,
  },
  typingText: { fontSize: 13, color: Colors.textSecondary },
  promptScroll: { maxHeight: 80 },
  promptList: { padding: Spacing.lg, gap: 8 },
  promptChip: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, paddingHorizontal: 12, paddingVertical: 8,
    maxWidth: 220,
  },
  promptText: { fontSize: 12, color: Colors.textSecondary },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm,
  },
  input: {
    flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: 20, paddingHorizontal: Spacing.md, paddingVertical: 12,
    color: Colors.textPrimary, fontSize: 14, maxHeight: 100,
  },
  sendBtn: { borderRadius: 22, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnGrad: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { fontSize: 20, color: '#fff', fontWeight: '700' },
  disclaimer: {
    fontSize: 10, color: Colors.textMuted, textAlign: 'center',
    paddingBottom: Spacing.sm,
  },
});
