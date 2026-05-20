import { createSlice } from '@reduxjs/toolkit';

interface ThemeState {
    darkMode: boolean;
}

const initialState: ThemeState = {
    darkMode: true, // Cinematic dark mode by default
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.darkMode = !state.darkMode;
        },
        setDarkMode: (state, action) => {
            state.darkMode = action.payload;
        },
    },
});

export const { toggleTheme, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
