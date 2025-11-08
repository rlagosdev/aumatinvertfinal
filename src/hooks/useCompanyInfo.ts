import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export interface CompanyInfo {
  name: string;
  description: string;
}

export const useCompanyInfo = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'Au Matin Vert',
    description: 'Épicerie du centre commercial des Thébaudières'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['company_name', 'company_description']);

      if (error) {
        console.warn('Could not fetch company info:', error);
        setLoading(false);
        return;
      }

      const info: Partial<CompanyInfo> = {};

      data?.forEach(setting => {
        if (setting.setting_key === 'company_name') {
          info.name = setting.setting_value;
        } else if (setting.setting_key === 'company_description') {
          info.description = setting.setting_value;
        }
      });

      if (info.name || info.description) {
        setCompanyInfo(prev => ({ ...prev, ...info }));
      }
    } catch (error) {
      console.warn('Error fetching company info:', error);
    } finally {
      setLoading(false);
    }
  };

  return { companyInfo, loading, refetch: fetchCompanyInfo };
};
