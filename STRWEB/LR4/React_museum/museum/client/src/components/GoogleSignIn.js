import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';

const GoogleSignIn = () => {
  const { loginWithGoogle, addNotification } = useAuth();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      console.log('✅ Google Identity Services загружен');
      
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup'
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInBtn"),
        {
          theme: "filled_blue",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 300
        }
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      console.log('Google ID Token получен');
      const idToken = response.credential;
      
      const serverResponse = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: idToken
        })
      });

      if (!serverResponse.ok) {
        const errorData = await serverResponse.json();
        throw new Error(errorData.message || 'Ошибка сервера');
      }

      const serverData = await serverResponse.json();
      
      if (serverData.success) { 
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        
        const userData = {
          ...serverData.user,
          googleId: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          verified_email: payload.email_verified || false
        };
        
        loginWithGoogle(userData);
        addNotification(`Добро пожаловать, ${userData.name}!`, 'success');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
        
      } else {
        throw new Error(serverData.message || 'Ошибка авторизации');
      }
      
    } catch (error) {
      console.error(' Ошибка Google OAuth:', error);
      addNotification(`Ошибка входа через Google: ${error.message}`, 'error');
    }
  };

  return (
    <div className="google-signin-wrapper">
      <div id="googleSignInBtn"></div>
    </div>
  );
};

export default GoogleSignIn;