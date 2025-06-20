
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AcceptInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      console.log('✅ Redirecionando para registro com token:', token);
      navigate(`/doctors/register?token=${token}`, { replace: true });
    } else {
      console.log('❌ Token não encontrado, redirecionando para home');
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#0f172a',
      color: 'white'
    }}>
      Redirecionando...
    </div>
  );
};

export default AcceptInvitationPage;
