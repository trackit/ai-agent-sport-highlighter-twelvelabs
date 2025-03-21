import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Chat } from './components/Chat'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './App.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#E91E63',
    },
    background: {
      default: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FFFFFF',
          color: '#000000',
        },
      },
    },
  },
})

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <Routes>
          <Route path="/" element={<Chat />} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App
