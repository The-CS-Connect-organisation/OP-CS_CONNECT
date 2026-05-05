import { createContext, useContext } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const theme = useTheme();
  const toast = useToast();

  return (
    <AppContext.Provider value={{ ...theme, ...toast }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);