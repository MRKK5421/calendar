import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from '../contexts/AuthContext';
import createEmotionCache from '../utils/createEmotionCache';
import theme from '../utils/theme';
import Navbar from '../components/Navbar';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import '../utils/firebase'; // Import Firebase configuration

// Client-side cache, shared for the whole session of the user in the browser
const clientSideEmotionCache = createEmotionCache();

export default function MyApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Component {...pageProps} />
            </Box>
          </Box>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
} 