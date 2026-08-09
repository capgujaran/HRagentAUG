import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../types';
import styles from './ChatAgent.module.css';

const firstMessage = "Hi, I'm your HR assistant. Ask me about leave, payroll, or policies.";

export default function ChatAgent() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: firstMessage },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [open, messages, typing]);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const message = input.trim();
    if (!message || typing) return;

    const history = [...messages];
    setMessages((current) => [...current, { role: 'user', content: message }]);
    setInput('');
    setTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });
      if (!response.ok) throw new Error('Chat request failed');
      const data = (await response.json()) as { reply?: string };
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: data.reply || 'I could not generate a reply. Please try again.' },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: 'I’m unable to reach the HR service right now. Please try again shortly.' },
      ]);
    } finally {
      setTyping(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <>
      {open && (
        <section className={styles.window} aria-label="HR assistant chat">
          <header className={styles.header}>
            <div className={styles.agentIdentity}>
              <span className={styles.agentMark}>AI</span>
              <div>
                <strong>PeopleHub Assistant</strong>
                <span><i /> Online</span>
              </div>
            </div>
            <button className={styles.close} type="button" onClick={() => setOpen(false)} aria-label="Close HR chat">×</button>
          </header>

          <div className={styles.messages} aria-live="polite">
            <p className={styles.today}>Today</p>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`${styles.message} ${message.role === 'user' ? styles.user : styles.assistant}`}>
                {message.content}
              </div>
            ))}
            {typing && (
              <div className={`${styles.message} ${styles.assistant} ${styles.typing}`} aria-label="Assistant is typing">
                <span /><span /><span />
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form className={styles.composer} onSubmit={sendMessage}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Message HR assistant"
              placeholder="Ask an HR question…"
              autoComplete="off"
            />
            <button type="submit" disabled={!input.trim() || typing} aria-label="Send message">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 17-8-6.5 18-2.7-7.8L3 11Zm7.8 2.2L20 3" /></svg>
            </button>
          </form>
        </section>
      )}

      <button className={styles.launcher} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Ask HR">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v11H9l-4 3V5Z" /><path d="M8 9h8M8 12h5" /></svg>
        <span>Ask HR</span>
      </button>
    </>
  );
}
