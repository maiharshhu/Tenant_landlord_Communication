import { useEffect, useRef, useState } from "react";
import { rtdb } from "../../firebase/config.js";
import {
  ref,
  onChildAdded,
  off,
  update,
  serverTimestamp,
  get,
  child,
} from "firebase/database";
import { useAuth } from "../../context/AuthContext.jsx";
import Card from "../Shared/Card.jsx";
import Button from "../Shared/Button.jsx";
import MessageBubble from "./MessageBubble.jsx";
import Threads from "./Threads.jsx";
import { markReadRTDB } from "../../utils/chatRTDB.js";

export default function ChatInterface() {
  const { user } = useAuth();
  const [activeThread, setActiveThread] = useState(null);
  const [otherUid, setOtherUid] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const th = params.get("thread");
    if (th) setActiveThread(th);
  }, []);

  useEffect(() => {
    if (!user || !activeThread) return setOtherUid(null);
    get(child(ref(rtdb), `userThreads/${user.uid}/${activeThread}`)).then(
      (snap) => {
        setOtherUid(snap.val()?.otherUid || null);
      }
    );
  }, [user, activeThread]);

  useEffect(() => {
    if (!activeThread) {
      setMessages([]);
      return;
    }
    const msgsRef = ref(rtdb, `messages/${activeThread}`);
    const arr = [];
    const handler = (snap) => {
      const m = { id: snap.key, ...snap.val() };
      arr.push(m);
      setMessages([...arr]);
      setTimeout(
        () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
        30
      );
      if (user && m.senderId !== user.uid) {
        markReadRTDB(rtdb, activeThread, m.id, user.uid);
      }
    };
    onChildAdded(msgsRef, handler);
    return () => off(msgsRef, "child_added", handler);
  }, [activeThread, user]);

  const send = async () => {
    if (!text.trim() || !user || !activeThread) return;
    const now = serverTimestamp();
    const newMsgRef = ref(rtdb, `messages/${activeThread}`);
    const pushApi = await import("firebase/database");
    const messageKey = pushApi.push(newMsgRef).key;

    // find other uid
    let other = otherUid;
    if (!other) {
      const mapSnap = await get(
        child(ref(rtdb), `userThreads/${user.uid}/${activeThread}`)
      );
      other = mapSnap.val()?.otherUid || null;
      setOtherUid(other);
    }

    const updates = {};
    updates[`messages/${activeThread}/${messageKey}`] = {
      text: text.trim(),
      senderId: user.uid,
      createdAt: now,
      readBy: { [user.uid]: true },
    };
    updates[`threads/${activeThread}/updatedAt`] = now;
    updates[`userThreads/${user.uid}/${activeThread}/updatedAt`] = Date.now();
    if (other)
      updates[`userThreads/${other}/${activeThread}/updatedAt`] = Date.now();

    await update(ref(rtdb), updates);
    setText("");
  };

  const statusFor = (m) => {
    const createdResolved = typeof m.createdAt === "number";
    const readers = m.readBy ? Object.keys(m.readBy) : [];
    const read = readers.length > 1; // sender + recipient
    if (read) return "read";
    if (createdResolved) return "delivered";
    return "sent";
  };

  return (
    <Card className="grid md:grid-cols-3 gap-3">
      <div className="md:col-span-1">
        <Threads onOpen={setActiveThread} />
      </div>
      <div className="md:col-span-2 flex flex-col h-[420px]">
        <div className="font-semibold mb-2">
          Chat {otherUid ? `with ${otherUid}` : ""}
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              mine={m.senderId === user?.uid}
              text={m.text}
              time={
                typeof m.createdAt === "number"
                  ? new Date(m.createdAt).toLocaleTimeString()
                  : ""
              }
              status={statusFor(m)}
            />
          ))}
          <div ref={endRef} />
        </div>
        <div className="flex gap-2 mt-2">
          <input
            className="flex-1 border rounded-xl px-3 py-2"
            placeholder={activeThread ? "Type a message" : "Select a thread"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            disabled={!activeThread}
          />
          <Button onClick={send} disabled={!activeThread || !text.trim()}>
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
}
