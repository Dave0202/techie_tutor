import { CheckCheck, Loader2, MessageCircle, Send, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FeedbackState from '../components/FeedbackState';
import api from '../services/api';
import { formatDateTime } from '../utils/formatters';

export default function MessagesPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [messages, setMessages] = useState([]);
  const [flaggedMessages, setFlaggedMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [sending, setSending] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/messages/contacts')
      .then((response) => {
        if (!active) return;
        const loadedContacts = response.data || [];
        setContacts(loadedContacts);
        if (loadedContacts.length) setSelectedContactId(String(loadedContacts[0].id));
      })
      .catch(() => {
        if (active) setError('We could not load your contacts. Please try again.');
      })
      .finally(() => {
        if (active) setLoadingContacts(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedContactId) {
      setMessages([]);
      return undefined;
    }

    let active = true;
    setLoadingConversation(true);
    api.get(`/messages/${selectedContactId}`)
      .then((response) => {
        if (active) setMessages(response.data || []);
      })
      .catch(() => {
        if (active) setError('We could not load this conversation. Please try again.');
      })
      .finally(() => {
        if (active) setLoadingConversation(false);
      });
    return () => { active = false; };
  }, [selectedContactId]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return undefined;
    let active = true;
    api.get('/admin/messages/flagged')
      .then((response) => {
        if (active) setFlaggedMessages(response.data || []);
      })
      .catch(() => {
        if (active) setReviewError('We could not load flagged messages.');
      });
    return () => { active = false; };
  }, [user?.role]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!selectedContactId || !draft.trim()) return;

    setSending(true);
    setError('');
    try {
      const response = await api.post('/messages', {
        recipientId: Number(selectedContactId),
        content: draft.trim(),
      });
      setMessages((current) => [...current, response.data]);
      setDraft('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const markReviewed = async (messageId) => {
    setReviewingId(messageId);
    setReviewError('');
    try {
      await api.post(`/admin/messages/${messageId}/review`);
      setFlaggedMessages((current) => current.filter((message) => message.id !== messageId));
    } catch (requestError) {
      setReviewError(requestError.response?.data?.message || 'We could not update this review.');
    } finally {
      setReviewingId(null);
    }
  };

  const selectedContact = contacts.find((contact) => String(contact.id) === selectedContactId);

  return (
    <div className="container page-content">
      <div className="page-title-row">
        <div>
          <span className="eyebrow"><MessageCircle size={14} /> Private messages</span>
          <h1 className="page-heading">Stay connected.</h1>
          <p>Messages that match the moderation list are delivered and added to the admin review queue.</p>
        </div>
      </div>

      {user?.role === 'ADMIN' && (
        <section className="feature-card flagged-message-panel">
          <div className="dashboard-section-heading">
            <div><span className="eyebrow"><ShieldAlert size={14} /> Moderation</span><h2>Flagged messages</h2></div>
            <span className="badge badge-warning">{flaggedMessages.length} pending</span>
          </div>
          {reviewError && <div className="alert alert-error page-alert" role="alert">{reviewError}</div>}
          {flaggedMessages.length ? (
            <div className="flagged-message-list">
              {flaggedMessages.map((message) => (
                <article className="flagged-message-row" key={message.id}>
                  <div className="message-copy">
                    <strong>{message.senderName} to {message.recipientName}</strong>
                    <p>{message.content}</p>
                    <small>Matched: {message.matchedTerms} · {formatDateTime(message.createdAt)}</small>
                  </div>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => markReviewed(message.id)}
                    disabled={reviewingId === message.id}
                  >
                    {reviewingId === message.id ? <><Loader2 size={16} className="loading-dots" /> Updating...</> : <><CheckCheck size={16} /> Mark reviewed</>}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted-label">No messages are awaiting review.</p>
          )}
        </section>
      )}

      <div className="messages-layout">
        <aside className="feature-card message-contact-panel">
          <h2>People</h2>
          {loadingContacts ? (
            <FeedbackState type="loading" title="Loading contacts" description="Getting active users." />
          ) : contacts.length ? (
            <div className="message-contact-list">
              {contacts.map((contact) => (
                <button
                  type="button"
                  className={`message-contact ${selectedContactId === String(contact.id) ? 'message-contact-active' : ''}`}
                  key={contact.id}
                  onClick={() => { setSelectedContactId(String(contact.id)); setError(''); }}
                >
                  <span><strong>{contact.name}</strong><small>{contact.role}</small></span>
                </button>
              ))}
            </div>
          ) : (
            <p className="muted-label">No other active users are available yet.</p>
          )}
        </aside>

        <section className="feature-card message-thread-panel">
          <h2>{selectedContact?.name || 'Choose a person'}</h2>
          {error && <div className="alert alert-error page-alert" role="alert">{error}</div>}
          {loadingConversation ? (
            <FeedbackState type="loading" title="Loading conversation" description="Fetching recent messages." />
          ) : selectedContact ? (
            <>
              <div className="message-thread" aria-live="polite">
                {messages.length ? messages.map((message) => (
                  <article className={`message-bubble ${message.senderId === user?.id ? 'message-bubble-own' : ''}`} key={message.id}>
                    <p>{message.content}</p>
                    <small>{message.senderName} · {formatDateTime(message.createdAt)}{message.flagged ? ' · Flagged for review' : ''}</small>
                  </article>
                )) : <p className="muted-label">No messages yet. Send the first message below.</p>}
              </div>
              <form className="message-compose" onSubmit={sendMessage}>
                <label className="field-label" htmlFor="message-content">Message</label>
                <textarea
                  id="message-content"
                  className="input"
                  rows="3"
                  maxLength="4000"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message..."
                  required
                />
                <button className="btn btn-primary" type="submit" disabled={sending || !draft.trim()}>
                  {sending ? <><Loader2 size={16} className="loading-dots" /> Sending...</> : <><Send size={16} /> Send message</>}
                </button>
              </form>
            </>
          ) : (
            <p className="muted-label">Select someone from the list to start a conversation.</p>
          )}
        </section>
      </div>
    </div>
  );
}
