import React from 'react'

interface ThemeMode {
    theme: "light" | "dark";
}

const ThemeContext = React.createContext<ThemeMode>({ theme: "light" });

export default ThemeContext;
export const ThemeConsumer = ThemeContext.Consumer;
export const ThemeProvider = ThemeContext.Provider;
