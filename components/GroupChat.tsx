"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
import Link from "next/link";

export default function GroupChat({ id }: { id: string }) {
  const user = auth.currentUser;
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [group, setGroup] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [])

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpenMenuId(null);
    }
  };

  const handleSendMessage = async () => {
    if (user && id && newMessage.trim()) {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await handleFileUpload(selectedFile);
    }
  };

  const handleFileUpload = async (selectedFile: File) => {
    if (selectedFile && id && user) {
      const storageRef = ref(storage, `files/${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      const fileURL = await getDownloadURL(storageRef);
      const fileType = selectedFile.type.split('/')[0];

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
        fileType: fileType,
        fileName: selectedFile.name,
      });
    }
  };

  const handleFileIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleLeaveGroup = async () => {
    if (id && user) {
      const groupRef = doc(db, "publicGroups", id);
      await updateDoc(groupRef, {
        participants: arrayRemove(user.uid),
      });
      router.push("/chat");
    }
  };

  const handleReturnHome = () => {
    router.push("/chat");
  };

  const handleDeleteGroup = async () => {
    if (id) {
      await deleteDoc(doc(db, "publicGroups", id));
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
              <div className="inline-block max-w-96 bg-blue-100 p-2 rounded-lg mt-1 relative group">
                {message.sender.displayName ? (
                  <span className="block text-gray-500 font-bold text-sm text-left">
                    {message.sender.displayName}
                  </span>
                ) : null}
                {message?.type === "file" ? (
                  message.fileType === "image" ? (
                    <Image
                      src={message.content}
                      alt="Image content"
                      width={200}
                      height={150}
                      className="rounded-lg w-60 h-auto"
                    />
                  ) : message.fileType === "video" ? (
                    <video 
                      src={message.content} 
                      controls 
                      className="rounded-lg w-60 h-auto"
                    />
                  ) : (
                    <Link 
                      href={message.content} 
                      download={message.fileName}
                      className="flex gap-2 p-2 rounded-lg bg-blue-200 items-center self-center justify-center"
                    >
                      <div className="rounded-full shadow-lg bg-white p-2">
                        <Image  src='/file_earmark_arrow_down.svg'
                          alt="File"
                          width={24}
                          height={24}
                          className="w-6 h-6"/>
                      </div>
                      <p className="line-clamp-1 text-gray-500 font-medium">{message.fileName}</p>
                    </Link>
                  )
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
                {user?.uid === message.sender.uid && (
                  <div className="absolute top-0 -left-4" ref={menuRef}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === message.id ? null : message.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Image  src='/three_dots_vertical.svg'
                        alt="Dot"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </button>
                    {openMenuId === message.id && (
                      <div className="absolute right-3 -mt-8 p-2 bg-white rounded-lg shadow-lg">
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="block w-full text-center px-2 py-1 hover:bg-red-500 hover:text-white text-red-500 border border-red-500 rounded-lg"
                        >
                          Delete
                        </button>
                        <button
                          className="block w-full text-center mt-2 px-2 py-1 hover:bg-blue-500 hover:text-white text-blue-500 border border-blue-500 rounded-lg"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 border-t-2 bg-white z-10">
        <div className="flex justify-center items-center gap-4">
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            onClick={handleFileIconClick}
          >
            <Image  src='/file_earmark_medical.svg'
              alt="File"
              width={24}
              height={24}
              className="w-6 h-6 text-gray-600"
            />
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
