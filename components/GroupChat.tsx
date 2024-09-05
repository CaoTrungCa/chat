"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  addDoc,
  collection,
  deleteDoc,
  updateDoc,
  arrayRemove,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth, db } from "@/lib/firebaseConfig";
import { formatRelative } from "date-fns";
import Image from "next/image";

export default function GroupChat({ id }: { id: any }) {
  const user = auth.currentUser;
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [group, setGroup] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      const groupRef = doc(db, "publicGroups", id);
      const unsubscribeGroup = onSnapshot(groupRef, (docSnapshot) => {
        setGroup(docSnapshot.data());
      });

      const messagesRef = collection(db, `publicGroups/${id}/messages`);
      const q = query(messagesRef, orderBy("timestamp", "asc"));
      const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);
      });

      return () => {
        unsubscribeGroup();
        unsubscribeMessages();
      };
    }
  }, [id]);

  const handleSendMessage = async () => {
    const user = auth.currentUser;
    if (user && id) {
      await addDoc(collection(db, `publicGroups/${id}/messages`), {
        content: newMessage,
        sender: {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        },
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (id) {
      const messageRef = doc(db, `publicGroups/${id}/messages`, messageId);
      await deleteDoc(messageRef);
    }
  };

  const handleFileUpload = async () => {
    if (file && id) {
      const user = auth.currentUser;
      if (user) {
        const storageRef = ref(storage, `files/${file.name}`);
        await uploadBytes(storageRef, file);
        const fileURL = await getDownloadURL(storageRef);
        console.log(file)

        await addDoc(collection(db, `publicGroups/${id}/messages`), {
          content: fileURL,
          sender: {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          },
          timestamp: serverTimestamp(),
          type: "file",
        });
        setFile(null);
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (id) {
      const user = auth.currentUser;
      if (user) {
        const groupRef = doc(db, "publicGroups", id as string);
        await updateDoc(groupRef, {
          participants: arrayRemove(user.uid),
        });
        router.push("/chat");
      }
    }
  };

  const handleReturnHome = () => {
    router.push("/chat");
  };

  const handleDeleteGroup = async () => {
    if (id) {
      await deleteDoc(doc(db, "publicGroups", id as string));
      router.push("/chat");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="fixed top-0 left-0 w-full shadow-md bg-white p-4 flex justify-between items-center z-10">
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded"
          onClick={handleReturnHome}
        >
          Home
        </button>
        <h1 className="text-2xl font-bold">{group?.groupName}</h1>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded"
            onClick={handleLeaveGroup}
          >
            Leave Group
          </button>

          {user?.uid === group?.createdUid && (
            <button
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={handleDeleteGroup}
            >
              Delete Group
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow pt-20 pb-32 overflow-y-auto">
        <ul className="flex-grow overflow-y-auto pb-16 pt-4">
          {messages.map((message) => (
            <li
              key={message.id}
              className={`${
                user?.uid === message.sender.uid
                  ? "flex flex-row-reverse mr-4"
                  : "ml-4"
              } flex gap-2 items-end`}
            >
              <div className="inline-block">
                {message.sender.photoURL ? (
                  <Image
                    src={message.sender.photoURL}
                    alt="Avatar"
                    width={35}
                    height={35}
                    className="rounded-lg mt-1 border border-blue-400"
                  />
                ) : null}
              </div>
              <div className="inline-block max-w-96 bg-blue-100 p-2 rounded-lg mt-1">
                {message.sender.displayName ? (
                  <span className="block text-gray-500 font-bold text-sm text-left">
                    {message.sender.displayName}
                  </span>
                ) : null}
                {message?.type === "file" ? (
                  <Image
                    src={message.content}
                    alt="Content"
                    width={200}
                    height={150}
                    className="rounded-lg w-60 h-auto"
                  />
                ) : (
                  <p className="w-full break-words">{message.content}</p>
                )}
                <br />
                {message.timestamp?.seconds ? (
                  <span className="block text-gray-500 text-xs text-right">
                    {formatRelative(
                      new Date(message.timestamp.seconds * 1000),
                      new Date()
                    )}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 border-t-2 bg-white z-10">
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleSendMessage}
        >
          Send
        </button>
        <input
          type="file"
          className="ml-4 mt-4"
          onChange={(e) => e.target.files && setFile(e.target.files[0])}
        />
        <button
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
          onClick={handleFileUpload}
        >
          Upload File
        </button>
      </div>
    </div>
  );
}
