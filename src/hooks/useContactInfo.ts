import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export interface ContactAddress {
  id: string;
  address: string;
  order: number;
}

export interface ContactPhone {
  id: string;
  phone: string;
  order: number;
}

export interface ContactEmail {
  id: string;
  email: string;
  order: number;
}

export interface ContactInfo {
  addresses: ContactAddress[];
  phones: ContactPhone[];
  emails: ContactEmail[];
}

export const useContactInfo = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    addresses: [{ id: '1', address: '1 rue du Nil, 44800 Saint-Herblain', order: 1 }],
    phones: [{ id: '1', phone: '+33 6 15 32 99 72', order: 1 }],
    emails: [{ id: '1', email: 'contact@aumatinvert.fr', order: 1 }]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .or('setting_key.like.contact_address_%,setting_key.like.contact_phone_%,setting_key.like.contact_email_%');

      if (error) {
        console.warn('Could not fetch contact info:', error);
        setLoading(false);
        return;
      }

      const addresses: ContactAddress[] = [];
      const phones: ContactPhone[] = [];
      const emails: ContactEmail[] = [];

      data?.forEach(setting => {
        if (setting.setting_key.startsWith('contact_address_')) {
          const match = setting.setting_key.match(/contact_address_(\d+)/);
          if (match) {
            addresses.push({
              id: match[1],
              address: setting.setting_value,
              order: parseInt(match[1])
            });
          }
        } else if (setting.setting_key.startsWith('contact_phone_')) {
          const match = setting.setting_key.match(/contact_phone_(\d+)/);
          if (match) {
            phones.push({
              id: match[1],
              phone: setting.setting_value,
              order: parseInt(match[1])
            });
          }
        } else if (setting.setting_key.startsWith('contact_email_')) {
          const match = setting.setting_key.match(/contact_email_(\d+)/);
          if (match) {
            emails.push({
              id: match[1],
              email: setting.setting_value,
              order: parseInt(match[1])
            });
          }
        }
      });

      if (addresses.length > 0 || phones.length > 0 || emails.length > 0) {
        setContactInfo({
          addresses: addresses.sort((a, b) => a.order - b.order),
          phones: phones.sort((a, b) => a.order - b.order),
          emails: emails.sort((a, b) => a.order - b.order)
        });
      }
    } catch (error) {
      console.warn('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  return { contactInfo, loading, refetch: fetchContactInfo };
};
