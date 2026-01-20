import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { DB } from '../db';
import { auth, db } from '../firebaseConfig';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// กำหนดอีเมลแอดมินเพียงหนึ่งเดียว (คืนค่าเดิมตามที่คุณต้องการ)
const ADMIN_EMAIL = 'Sopol.hub1@gmail.com';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ดึงข้อมูล Role จาก Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        let userData: User;

        const isCurrentAdmin = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        if (userDoc.exists()) {
          userData = userDoc.data() as User;
          
          // ตรวจสอบและอัปเดตสิทธิ์ให้เป็นไปตาม Email ปัจจุบัน
          const targetRole = isCurrentAdmin ? 'ADMIN' : 'USER';
          
          if (userData.role !== targetRole) {
            userData.role = targetRole;
            await setDoc(doc(db, 'users', firebaseUser.uid), userData, { merge: true });
          }
        } else {
          // สร้างข้อมูลผู้ใช้ใหม่
          userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: isCurrentAdmin ? 'ADMIN' : 'USER',
            uid: 'ATEE-' + firebaseUser.uid.substring(0, 5).toUpperCase()
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        }

        setUser(userData);
        localStorage.setItem('atee_user', JSON.stringify(userData));
        DB.fetchUserOrders(userData.id);
      } else {
        setUser(null);
        localStorage.removeItem('atee_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('atee_user', JSON.stringify(userData));
  };

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth is not initialized");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Login Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    localStorage.removeItem('atee_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};