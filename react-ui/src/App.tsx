import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './theme/theme';
import HomePage from './pages/HomePage';
import Layout from './components/layout/Layout';
import GoalsPage from './pages/GoalsPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
            <Route path="/performance" element={<div>Performance Page</div>} />
            <Route path="/reports" element={<div>Reports Page</div>} />
            <Route path="/goals" element={<GoalsPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;