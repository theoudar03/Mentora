import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getChatList, getContacts, getConversation, sendMessage, markRead
} from '../../api/chatApi';
import { Send, Search, MessageCircle, ChevronLeft } from 'lucide-react';

// ─── Status tick component ───────────────────────────────────────────────────
const StatusTick = ({ status }) => {
  if (status === 'read')      return <span className="text-blue-400 text-xs">✓✓</span>;
  if (status === 'delivered') return <span className="text-gray-400 text-xs">✓✓</span>;
  return <span className="text-gray-400 text-xs">✓</span>;
};

// ─── Role badge ──────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    mentor:  'bg-purple-100 text-purple-700',
    welfare: 'bg-teal-100 text-teal-700',
    student: 'bg-blue-100 text-blue-700'
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${styles[role] || 'bg-gray-100 text-gray-600'}`}>
      {role}
    </span>
  );
};

// ─── Avatar initials ─────────────────────────────────────────────────────────
const Avatar = ({ name, role, size = 'md' }) => {
  const colors = {
    mentor:  'bg-purple-500',
    welfare: 'bg-teal-500',
    student: 'bg-indigo-500'
  };
  const sz = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-11 h-11 text-base';
  return (
    <div className={`${sz} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${colors[role] || 'bg-gray-400'}`}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

// ─── Main ChatPage ────────────────────────────────────────────────────────────
const ChatPage = () => {
  const { user } = useAuth();
  const [chatList, setChatList]   = useState([]);
  const [contacts, setContacts]   = useState([]);
  const [selected, setSelected]   = useState(null); // { _id, name, role, dept }
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [search, setSearch]       = useState('');
  const [showContacts, setShowContacts] = useState(false);
  const [sending, setSending]     = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  // ── Load sidebar list ──
  const loadList = useCallback(async () => {
    try {
      const r = await getChatList();
      setChatList(r.data);
    } catch (_) {}
  }, []);

  // ── Load contacts for new conversation ──
  const loadContacts = useCallback(async () => {
    try {
      const r = await getContacts();
      setContacts(r.data);
    } catch (_) {}
  }, []);

  useEffect(() => {
    loadList();
    loadContacts();
  }, [loadList, loadContacts]);

  // ── Load + poll conversation ──
  const loadConversation = useCallback(async (userId) => {
    try {
      const r = await getConversation(userId);
      setMessages(r.data);
      // Mark visible messages as read
      const myId = user?._id || user?.id;
      r.data.forEach(m => {
        if (String(m.receiver_id) === String(myId) && m.status !== 'read') {
          markRead(m._id).catch(() => {});
        }
      });
    } catch (_) {}
  }, [user]);

  useEffect(() => {
    if (!selected) return;
    loadConversation(selected._id);
    clearInterval(pollRef.current);
    // Poll every 3s for real-time feel without WebSockets
    pollRef.current = setInterval(() => loadConversation(selected._id), 3000);
    return () => clearInterval(pollRef.current);
  }, [selected, loadConversation]);

  // ── Auto-scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Open conversation ──
  const openChat = (contactUser) => {
    setSelected(contactUser);
    setMessages([]);
    setShowContacts(false);
    setMobileView('chat');
  };

  // ── Send ──
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    try {
      const r = await sendMessage({ receiver_id: selected._id, message_text: input.trim() });
      setMessages(prev => [...prev, r.data]);
      setInput('');
      loadList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const myId = user?._id || user?.id;
  const filteredList = chatList.filter(c =>
    c.user?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div className={`flex flex-col h-full border-r border-gray-100 bg-white ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0`}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-500" />
            Messages
          </h2>
          <button
            onClick={() => { setShowContacts(v => !v); setSearch(''); }}
            className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-full font-semibold transition"
          >
            {showContacts ? '← Chats' : '+ New'}
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={showContacts ? 'Search contacts...' : 'Search chats...'}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {showContacts ? (
          /* ── Contact directory ── */
          filteredContacts.length === 0
            ? <p className="text-sm text-gray-400 text-center mt-10">No contacts found</p>
            : filteredContacts.map(c => (
              <button
                key={c._id}
                onClick={() => openChat(c)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50"
              >
                <Avatar name={c.name} role={c.role} size="sm" />
                <div className="min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                  <RoleBadge role={c.role} />
                  {c.department && <span className="text-xs text-gray-400 ml-1">{c.department}</span>}
                </div>
              </button>
            ))
        ) : (
          /* ── Recent chats ── */
          filteredList.length === 0
            ? <div className="text-center mt-16 px-6">
                <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No conversations yet</p>
                <button onClick={() => setShowContacts(true)} className="mt-3 text-indigo-500 text-sm font-medium hover:underline">
                  Start a new chat →
                </button>
              </div>
            : filteredList.map(({ user: u, lastMessage: lm, unread }) => (
              <button
                key={u?._id}
                onClick={() => openChat(u)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition border-b border-gray-50 ${selected?._id === u?._id ? 'bg-indigo-50' : ''}`}
              >
                <div className="relative">
                  <Avatar name={u?.name} role={u?.role} size="sm" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 text-left flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800 truncate">{u?.name}</p>
                    <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">
                      {new Date(lm?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{lm?.message_text}</p>
                </div>
              </button>
            ))
        )}
      </div>
    </div>
  );

  // ── Chat Window ──────────────────────────────────────────────────────────────
  const ChatWindow = () => (
    <div className={`flex flex-col flex-1 h-full ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
      {!selected ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <MessageCircle className="w-10 h-10 text-indigo-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a conversation</h3>
          <p className="text-sm text-gray-400 max-w-xs">Choose from your recent chats or start a new conversation using the <strong>+ New</strong> button.</p>
        </div>
      ) : (
        <>
          {/* Top bar */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-white">
            <button className="md:hidden text-gray-500 mr-1" onClick={() => setMobileView('list')}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <Avatar name={selected.name} role={selected.role} size="sm" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">{selected.name}</p>
              <div className="flex items-center gap-1.5">
                <RoleBadge role={selected.role} />
                {selected.department && <span className="text-xs text-gray-400">{selected.department}</span>}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 bg-gray-50">
            {messages.map((m, i) => {
              const isMe = String(m.sender_id) === String(myId);
              const showDate = i === 0 || new Date(messages[i-1].created_at).toDateString() !== new Date(m.created_at).toDateString();
              return (
                <React.Fragment key={m._id || i}>
                  {showDate && (
                    <div className="text-center my-3">
                      <span className="text-[10px] bg-gray-200 text-gray-500 px-3 py-1 rounded-full">
                        {new Date(m.created_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                    }`}>
                      <p className="leading-relaxed">{m.message_text}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <StatusTick status={m.status} />}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            {messages.length === 0 && (
              <div className="text-center mt-10 text-gray-400 text-sm">
                No messages yet. Say hello! 👋
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 bg-white">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-0px)] bg-white overflow-hidden">
      <Sidebar />
      <ChatWindow />
    </div>
  );
};

export default ChatPage;
