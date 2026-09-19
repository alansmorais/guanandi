/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db, doc, getDoc } from "../lib/firebase";
import { safeStorage } from "../lib/storage";

export interface AdminSlotUser {
  slot: number;
  username: string;
  name: string;
  mustChangePassword: boolean;
  role?: string;
}

interface FirebaseContextType {
  user: User | null;
  adminUser: AdminSlotUser | null;
  loading: boolean;
  isAdmin: boolean;
  loginAdminSession: (admin: AdminSlotUser) => void;
  logoutAdminSession: () => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminSlotUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check local admin session
    const savedSession = safeStorage.getItem("guanandi_admin_active_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.username) {
          setAdminUser(parsed);
          setIsAdmin(true);
        }
      } catch {
        safeStorage.removeItem("guanandi_admin_active_session");
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user is admin in Firestore
        try {
          const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
          if (adminDoc.exists()) {
            setIsAdmin(true);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAdminSession = (admin: AdminSlotUser) => {
    setAdminUser(admin);
    setIsAdmin(true);
    safeStorage.setItem("guanandi_admin_active_session", JSON.stringify(admin));
  };

  const logoutAdminSession = () => {
    setAdminUser(null);
    safeStorage.removeItem("guanandi_admin_active_session");
    if (!user) {
      setIsAdmin(false);
    }
  };

  return (
    <FirebaseContext.Provider 
      value={{ 
        user, 
        adminUser, 
        loading, 
        isAdmin, 
        loginAdminSession, 
        logoutAdminSession 
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
}
