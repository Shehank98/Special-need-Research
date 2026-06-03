import { createContext, useContext, useEffect, useState } from 'react';
import { t as translate } from '../i18n.js';
import { useAuth } from './AuthContext.jsx';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { user } = useAuth();
  const [lang, setLang] = useState(
    () => localStorage.getItem('lang') || 'en'
  );

  // Adopt the user's saved language preference on login.
  useEffect(() => {
    if (user?.language) {
      setLang(user.language);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggle = () => setLang((l) => (l === 'en' ? 'si' : 'en'));
  const t = (key) => translate(key, lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
