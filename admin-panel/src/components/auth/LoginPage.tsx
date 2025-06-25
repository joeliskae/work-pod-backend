import { GoogleLogin } from '@react-oauth/google';
// import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';
import { Card } from '../ui/Card';
import type { User } from '../../types';

// interface DecodedToken {
//   email: string;
//   name: string;
//   picture?: string;
//   sub: string;
// }

interface LoginPageProps {
  onLogin: (user: User, token: string) => void;
}

interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
  };
  token?: string; // Voidaan jättää, mutta ei käytetä
  message?: string;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse: any) => {
  if (!credentialResponse?.credential) {
    alert('Kirjautuminen epäonnistui - ei saatu tunnistetta');
    return;
  }

  setIsLoading(true);

  try {
    const googleIdToken = credentialResponse.credential;

    // 1. Saa backendin oman JWT:n
    const loginRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: googleIdToken }),
    });

    if (!loginRes.ok) {
      const err = await loginRes.json();
      alert(err?.error || 'Kirjautuminen epäonnistui');
      return;
    }

    const loginData = await loginRes.json();
    const jwt = loginData.accessToken;
    const email = loginData.userEmail;

    if (!jwt || !email) {
      alert('Virhe kirjautumisessa: puuttuu token tai sähköposti');
      return;
    }

    // 2. Tarkista oikeudet /user/verify-endpointista (tarvitsee sähköpostin)
    const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/user/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`, // <- lähetä token mukana
      },
      body: JSON.stringify({ email }),
    });

    const authResult: AuthResponse = await verifyRes.json();

    if (!verifyRes.ok || !authResult.success) {
      alert(authResult.message || 'Sinulla ei ole oikeuksia käyttää tätä järjestelmää');
      return;
    }

    if (!authResult.user) {
      alert('Palvelimen virhe - käyttäjätiedot puuttuvat');
      return;
    }

    const user: User = {
      id: authResult.user.id,
      name: authResult.user.name,
      email: authResult.user.email,
      role: authResult.user.role,
    };

    // 3. Talleta token ja vie eteenpäin
    localStorage.setItem('accessToken', jwt);
    onLogin(user, jwt);

  } catch (error) {
    console.error('Virhe kirjautumisessa:', error);
    alert('Kirjautuminen epäonnistui - palvelinvirhe tai yhteysongelma');
  } finally {
    setIsLoading(false);
  }
};


  const handleError = () => {
    alert('Google-kirjautuminen epäonnistui');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Kirjaudu sisään</h2>
          <p className="mt-2 text-gray-600">Admin-paneeliin organisaation tunnuksilla (LAB/LUT)</p>
        </div>

        <Card className="flex justify-center p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Tarkistetaan oikeuksia...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              size="large"
              width="300"
            />
          )}
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>Vain valtuutetut käyttäjät voivat kirjautua sisään</p>
        </div>
      </div>
    </div>
  );
};
