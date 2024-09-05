"use client";
import { useEffect, useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, db, provider } from "../lib/firebaseConfig";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        router.push("/chat");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    await signInWithPopup(auth, provider);

    const u = auth.currentUser;
    if (u) {
      const userDocRef = doc(db, "accounts", u.uid);

      await setDoc(
        userDocRef,
        {
          uid: u.uid,
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
        },
        { merge: true }
      );
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl">Welcome to My Chat App</h1>
      {user ? (
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      ) : (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleLogin}
        >
          Login with Google
        </button>
      )}
    </div>
  );
}
