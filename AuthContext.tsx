import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, User } from './firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  currentUser: null, 
  loading: true,
  loginAsDemo: () => {} 
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginAsDemo = () => {
    // Mock user for demo mode
    const demoUser = {
      uid: 'demo-user-123',
      displayName: 'Dr. Demo',
      email: 'demo@ordomaroc.ai',
      photoURL: null,
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
    } as unknown as User;
    
    setCurrentUser(demoUser);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};