import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar, Card } from '@/components/ui'
import FadeIn from '@/components/FadeIn'
import { colors } from '@/theme'
import { CHAT, MATCHES } from '@/data/mock'
import type { ChatMessage } from '@/data/mock'

export default function ChatScreen() {
  const [draft, setDraft] = useState('')
  const [sent, setSent] = useState<ChatMessage[]>([])
  const other = MATCHES[1].user

  const send = () => {
    if (!draft.trim()) return
    const now = new Date()
    const t = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
    setSent((m) => [...m, { id: Date.now(), sender: 'me', text: draft.trim(), time: t, kind: 'text' }])
    setDraft('')
  }

  const messages = [...CHAT, ...sent]

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LinearGradient colors={['#000', '#0a0a0f']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Avatar initials={other.initials} gradient={other.gradient} size={40} />
        <View style={styles.headerMid}>
          <Text style={styles.headerName}>{other.name}</Text>
          <Text style={styles.headerStatus}>● Online</Text>
        </View>
        <View style={styles.matchPill}>
          <Text style={styles.matchPillText}>96% match</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {messages.map((m, i) => {
          if (m.kind === 'reminder') {
            return (
              <FadeIn key={m.id} delay={0.03 * i} distance={10}>
                <View style={styles.reminderChip}>
                  <Text style={styles.reminderText}>⏰ {m.text}</Text>
                </View>
              </FadeIn>
            )
          }
          if (m.kind === 'file') {
            return (
              <FadeIn key={m.id} delay={0.03 * i} distance={10}>
                <View style={[styles.row, m.sender === 'me' ? styles.rowMe : styles.rowThem]}>
                  <LinearGradient colors={[colors.orange, colors.coral]} style={styles.fileBubble}>
                    <Text style={styles.fileIcon}>📄</Text>
                    <View>
                      <Text style={styles.fileName}>{m.text}</Text>
                      <Text style={styles.fileMeta}>PDF · 2.4 MB · {m.time}</Text>
                    </View>
                  </LinearGradient>
                </View>
              </FadeIn>
            )
          }
          return (
            <FadeIn key={m.id} delay={0.03 * i} distance={10}>
              <View style={[styles.row, m.sender === 'me' ? styles.rowMe : styles.rowThem]}>
                <LinearGradient
                  colors={m.sender === 'me' ? [colors.orange, colors.coral] : ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.10)']}
                  style={[styles.bubble, m.sender === 'me' ? styles.bubbleMe : styles.bubbleThem]}
                >
                  <Text style={styles.bubbleText}>{m.text}</Text>
                  <Text style={styles.bubbleTime}>{m.time}</Text>
                </LinearGradient>
              </View>
            </FadeIn>
          )
        })}
      </ScrollView>

      <View style={styles.inputBar}>
        <View style={styles.inputWrap}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={`Message ${other.name.split(' ')[0]}…`}
            placeholderTextColor={colors.white30}
            style={styles.input}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <LinearGradient colors={[colors.orange, colors.coral]} style={styles.sendBtn}>
            <Text style={styles.sendText} onPress={send}>➤</Text>
          </LinearGradient>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  headerMid: { flex: 1 },
  headerName: { color: '#fff', fontWeight: '800', fontSize: 15 },
  headerStatus: { color: colors.emerald, fontSize: 11, fontWeight: '600' },
  matchPill: { borderRadius: 999, backgroundColor: colors.orange, paddingHorizontal: 10, paddingVertical: 4 },
  matchPillText: { color: '#fff', fontWeight: '800', fontSize: 10 },
  body: { padding: 16, gap: 10, flexGrow: 1 },
  row: { flexDirection: 'row' },
  rowMe: { justifyContent: 'flex-end' },
  rowThem: { justifyContent: 'flex-start' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '78%' },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleThem: { borderBottomLeftRadius: 4 },
  bubbleText: { color: '#fff', fontSize: 14, lineHeight: 19 },
  bubbleTime: { color: 'rgba(255,255,255,0.55)', fontSize: 10, textAlign: 'right', marginTop: 3 },
  fileBubble: { borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, maxWidth: '78%' },
  fileIcon: { fontSize: 22 },
  fileName: { color: '#fff', fontWeight: '800', fontSize: 13 },
  fileMeta: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  reminderChip: { alignSelf: 'center', borderRadius: 999, backgroundColor: 'rgba(255,201,60,0.12)', borderWidth: 1, borderColor: 'rgba(255,201,60,0.4)', paddingHorizontal: 12, paddingVertical: 6 },
  reminderText: { color: colors.gold, fontSize: 11, fontWeight: '700' },
  inputBar: { padding: 14, borderTopWidth: 1, borderTopColor: colors.white10 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.white05,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  sendBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#fff', fontSize: 16, fontWeight: '900' },
})