
import { FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useState, useEffect } from 'react';

const HeaderLogo = () => {
  const { settings } = useSystemSettings();
  const navigate = useNavigate();
  const [dynamicSettings, setDynamicSettings] = useState<any>(null);

  // Listen for dynamic settings changes
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      setDynamicSettings(event.detail);
    };

    window.addEventListener('systemSettingsChanged', handleSettingsChange as EventListener);
    
    return () => {
      window.removeEventListener('systemSettingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  // Use dynamic settings if available, otherwise use loaded settings
  const currentSettings = dynamicSettings || settings;
  const companyName = currentSettings?.company_name || 'FORMULA-AI';
  const logoUrl = currentSettings?.logo_url;

  return (
    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt="Logo" 
          className="w-8 h-8 rounded-lg object-contain"
        />
      ) : (
        <div className="w-8 h-8 dynamic-primary-bg rounded-lg flex items-center justify-center color-transition">
          <FlaskConical className="w-5 h-5 text-white" />
        </div>
      )}
      <div>
        <h1 className="text-xl font-bold text-white">{companyName}</h1>
        <p className="text-xs text-slate-400">Assistente Farmacêutico IA</p>
      </div>
    </div>
  );
};

export default HeaderLogo;
