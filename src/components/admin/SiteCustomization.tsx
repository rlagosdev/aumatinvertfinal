import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { Save, Image as ImageIcon, Palette, Upload, Eye, RotateCcw, Truck, Plus, Trash2, Clock, Calendar, Plane, Instagram, MapPin, Phone, RefreshCw, Package, Users, Building, Star, Bot, QrCode, Settings, Store, Sparkles } from 'lucide-react';
import { useOpeningHours } from '../../hooks/useOpeningHours';
import { useVacationPeriods } from '../../hooks/useVacationPeriods';
import type { ContactAddress, ContactPhone } from '../../hooks/useContactInfo';
import InstagramManager from '../InstagramManager';
import FeaturedProductsManager from './FeaturedProductsManager';
import GoogleReviewsManager from './GoogleReviewsManager';
import ImageUploadField from './ImageUploadField';
import QRCodeGenerator from './QRCodeGenerator';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
}

interface ColorSettings {
  color_primary: string;
  color_background: string;
  color_text_dark: string;
  color_text_light: string;
  color_buttons: string;
  color_company_title: string;
  color_slot_occupied: string;
  color_slot_available: string;
}

interface ImageSettings {
  carousel_image_1: string;
  carousel_image_2: string;
  carousel_image_3: string;
  carousel_image_4: string;
  logo_image: string;
  service_page_image: string;
  about_image_1: string;
  about_image_2: string;
  about_image_3: string;
  about_image_4: string;
  about_image_5: string;
}

interface DeliveryRate {
  id: number;
  min_amount: number;
  max_amount: number | null;
  rate: number;
  description: string;
}

interface TimeSlot {
  open: string;
  close: string;
}

interface DaySchedule {
  day: string;
  isOpen: boolean;
  morning?: TimeSlot;
  afternoon?: TimeSlot;
}

interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface VacationPeriod {
  id: string;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
  postVacationDelayDays?: number;
}

type SettingsSection = 'logo' | 'company' | 'contact' | 'delivery' | 'hours' | 'vacation' | 'instagram' | 'featured' | 'reviews' | 'colors' | 'chatbot' | 'qrcode' | 'features';

const SiteCustomization: React.FC = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>('logo');
  const { openingHours, setOpeningHours, saveOpeningHours } = useOpeningHours();
  const { 
    vacationPeriods, 
    saveVacationPeriods, 
    addVacationPeriod, 
    updateVacationPeriod, 
    removeVacationPeriod,
    getCurrentVacationStatus,
    formatPeriod 
  } = useVacationPeriods();
  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    color_primary: '#9333ea',        // purple-600 from current site
    color_background: '#ffffff',     // white
    color_text_dark: '#374151',      // gray-700
    color_text_light: '#ffffff',     // white
    color_buttons: '#a855f7',        // purple-500 from current site
    color_company_title: '#1f2937',  // gray-800
    color_slot_occupied: '#fca5a5',  // red-300
    color_slot_available: '#93c5fd',  // blue-300
  });
  const [imageSettings, setImageSettings] = useState<ImageSettings>({
    carousel_image_1: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    carousel_image_2: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    carousel_image_3: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    carousel_image_4: 'https://images.unsplash.com/photo-1560472355-109703aa3edc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    logo_image: 'https://images.unsplash.com/photo-1518636744428-8e98b26e57d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    service_page_image: 'https://i.imgur.com/TsrGxMr.jpeg',
    about_image_1: 'https://i.imgur.com/QZWJBoD.jpeg',
    about_image_2: 'https://i.imgur.com/QZWJBoD.jpeg',
    about_image_3: 'https://i.imgur.com/Ar8ZW58.jpeg',
    about_image_4: 'https://i.imgur.com/EWT08WI.jpeg',
    about_image_5: 'https://i.imgur.com/KCZdy2a.jpeg',
  });
  const [deliveryRates, setDeliveryRates] = useState<DeliveryRate[]>([
    { id: 1, min_amount: 0, max_amount: 49.99, rate: 7, description: 'Commande < 50€' },
    { id: 2, min_amount: 50, max_amount: 99.99, rate: 3, description: 'Commande ≥ 50€' },
    { id: 3, min_amount: 100, max_amount: null, rate: 0, description: 'Commande ≥ 100€' }
  ]);
  const [contactAddresses, setContactAddresses] = useState<ContactAddress[]>([
    { id: '1', address: '1 rue du Nil, 44800 Saint-Herblain', order: 1 }
  ]);
  const [contactPhones, setContactPhones] = useState<ContactPhone[]>([
    { id: '1', phone: '+33 6 15 32 99 72', order: 1 }
  ]);
  const [companyName, setCompanyName] = useState('Au Matin Vert');
  const [companyDescription, setCompanyDescription] = useState('Épicerie du centre commercial des Thébaudières');
  const [chatbotApiKey, setChatbotApiKey] = useState('');
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [shopEnabled, setShopEnabled] = useState(true);
  const [chatbotClientEnabled, setChatbotClientEnabled] = useState(true);
  const [chatbotAdminEnabled, setChatbotAdminEnabled] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('setting_key');

      if (error) {
        console.warn('Table site_settings not found, using local mode');
        toast.info('Mode local activé - les paramètres ne seront pas sauvegardés');
        setLoading(false);
        return;
      }

      setSettings(data || []);

      // Organiser les paramètres par type
      const colors: Partial<ColorSettings> = {};
      const images: Partial<ImageSettings> = {};
      const deliveryData: DeliveryRate[] = [];
      const addresses: ContactAddress[] = [];
      const phones: ContactPhone[] = [];
      let companyNameValue = '';
      let companyDescValue = '';
      let chatbotKey = '';
      let chatbotEnabledValue = true;
      let shopEnabledValue = true;
      let chatbotClientEnabledValue = true;
      let chatbotAdminEnabledValue = false;

      data?.forEach(setting => {
        if (setting.setting_key === 'company_name') {
          companyNameValue = setting.setting_value;
        } else if (setting.setting_key === 'company_description') {
          companyDescValue = setting.setting_value;
        } else if (setting.setting_key === 'chatbot_api_key') {
          chatbotKey = setting.setting_value;
        } else if (setting.setting_key === 'chatbot_enabled') {
          chatbotEnabledValue = setting.setting_value === 'true';
        } else if (setting.setting_key === 'shop_enabled') {
          shopEnabledValue = setting.setting_value === 'true';
        } else if (setting.setting_key === 'chatbot_client_enabled') {
          chatbotClientEnabledValue = setting.setting_value === 'true';
        } else if (setting.setting_key === 'chatbot_admin_enabled') {
          chatbotAdminEnabledValue = setting.setting_value === 'true';
        } else
        if (setting.setting_type === 'color') {
          colors[setting.setting_key as keyof ColorSettings] = setting.setting_value;
        } else if (setting.setting_type === 'image_url') {
          images[setting.setting_key as keyof ImageSettings] = setting.setting_value;
        } else if (setting.setting_key.startsWith('contact_address_')) {
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
        } else if (setting.setting_key.startsWith('delivery_rate_')) {
          // Parser les tarifs de livraison
          const match = setting.setting_key.match(/delivery_rate_(\d+)_(.+)/);
          if (match) {
            const [, id, property] = match;
            const rateId = parseInt(id);
            let existingRate = deliveryData.find(r => r.id === rateId);
            
            if (!existingRate) {
              existingRate = { id: rateId, min_amount: 0, max_amount: null, rate: 0, description: '' };
              deliveryData.push(existingRate);
            }
            
            switch (property) {
              case 'min_amount':
                existingRate.min_amount = parseFloat(setting.setting_value);
                break;
              case 'max_amount':
                existingRate.max_amount = setting.setting_value === 'null' ? null : parseFloat(setting.setting_value);
                break;
              case 'rate':
                existingRate.rate = parseFloat(setting.setting_value);
                break;
              case 'description':
                existingRate.description = setting.setting_value;
                break;
            }
          }
        }
      });

      // Appliquer tous les paramètres chargés depuis la base
      if (Object.keys(colors).length > 0) {
        setColorSettings(prev => ({ ...prev, ...colors }));
      }

      // Pour les images, toujours appliquer les valeurs depuis la base
      // Même si certaines sont manquantes, cela permet de voir ce qui est réellement en base
      if (Object.keys(images).length > 0) {
        console.log('Images chargées depuis la base:', images);
        setImageSettings(prev => ({ ...prev, ...images }));
      } else {
        console.warn('Aucune image trouvée en base de données');
      }

      if (deliveryData.length > 0) {
        setDeliveryRates(deliveryData.sort((a, b) => a.id - b.id));
      }

      if (addresses.length > 0) {
        setContactAddresses(addresses.sort((a, b) => a.order - b.order));
      }

      if (phones.length > 0) {
        setContactPhones(phones.sort((a, b) => a.order - b.order));
      }

      if (companyNameValue) {
        setCompanyName(companyNameValue);
      }

      if (companyDescValue) {
        setCompanyDescription(companyDescValue);
      }

      if (chatbotKey) {
        setChatbotApiKey(chatbotKey);
      }

      setChatbotEnabled(chatbotEnabledValue);
      setShopEnabled(shopEnabledValue);
      setChatbotClientEnabled(chatbotClientEnabledValue);
      setChatbotAdminEnabled(chatbotAdminEnabledValue);
    } catch (error) {
      console.warn('Error fetching settings, using local mode:', error);
      toast.info('Mode local activé - les paramètres ne seront pas sauvegardés');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      // Déterminer le type
      const settingType = key.startsWith('color_') ? 'color' :
                         key.includes('image') ? 'image_url' : 'text';

      // Vérifier si le paramètre existe déjà
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', key)
        .maybeSingle();

      if (existing) {
        // Mettre à jour l'entrée existante - IMPORTANT: mettre à jour AUSSI le setting_type
        const { error } = await supabase
          .from('site_settings')
          .update({
            setting_value: value,
            setting_type: settingType  // FIX: Mettre à jour le type aussi !
          })
          .eq('setting_key', key);

        if (error) throw error;
      } else {
        // Créer une nouvelle entrée
        const { error } = await supabase
          .from('site_settings')
          .insert({
            setting_key: key,
            setting_value: value,
            setting_type: settingType,
            description: `Paramètre ${key}`
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
      throw error;
    }
  };

  const handleColorChange = (key: keyof ColorSettings, value: string) => {
    setColorSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (key: keyof ImageSettings, value: string) => {
    setImageSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDeliveryRateChange = (id: number, field: keyof Omit<DeliveryRate, 'id'>, value: string | number | null) => {
    setDeliveryRates(prev => 
      prev.map(rate => 
        rate.id === id 
          ? { ...rate, [field]: value }
          : rate
      )
    );
  };

  const addDeliveryRate = () => {
    const newId = Math.max(...deliveryRates.map(r => r.id), 0) + 1;
    const newRate: DeliveryRate = {
      id: newId,
      min_amount: 0,
      max_amount: null,
      rate: 0,
      description: `Nouveau tarif ${newId}`
    };
    setDeliveryRates(prev => [...prev, newRate]);
  };

  const removeDeliveryRate = (id: number) => {
    if (deliveryRates.length <= 1) {
      toast.error('Vous devez conserver au moins un tarif de livraison');
      return;
    }
    setDeliveryRates(prev => prev.filter(rate => rate.id !== id));
  };

  const saveDeliveryRates = async () => {
    try {
      // Supprimer les anciens tarifs
      const { error: deleteError } = await supabase
        .from('site_settings')
        .delete()
        .like('setting_key', 'delivery_rate_%');

      if (deleteError) throw deleteError;

      // Insérer les nouveaux tarifs
      const insertData = deliveryRates.flatMap(rate => [
        {
          setting_key: `delivery_rate_${rate.id}_min_amount`,
          setting_value: rate.min_amount.toString(),
          setting_type: 'number',
          description: `Montant minimum pour le tarif ${rate.id}`
        },
        {
          setting_key: `delivery_rate_${rate.id}_max_amount`,
          setting_value: rate.max_amount === null ? 'null' : rate.max_amount.toString(),
          setting_type: rate.max_amount === null ? 'text' : 'number',
          description: `Montant maximum pour le tarif ${rate.id}`
        },
        {
          setting_key: `delivery_rate_${rate.id}_rate`,
          setting_value: rate.rate.toString(),
          setting_type: 'number',
          description: `Tarif de livraison pour le tarif ${rate.id}`
        },
        {
          setting_key: `delivery_rate_${rate.id}_description`,
          setting_value: rate.description,
          setting_type: 'text',
          description: `Description du tarif ${rate.id}`
        }
      ]);

      const { error: insertError } = await supabase
        .from('site_settings')
        .insert(insertData);

      if (insertError) throw insertError;

      toast.success('Tarifs de livraison sauvegardés avec succès');
    } catch (error) {
      console.error('Error saving delivery rates:', error);
      toast.error('Erreur lors de la sauvegarde des tarifs');
    }
  };

  // Fonctions de gestion des adresses
  const handleAddressChange = (id: string, value: string) => {
    setContactAddresses(prev =>
      prev.map(addr => addr.id === id ? { ...addr, address: value } : addr)
    );
  };

  const addAddress = () => {
    const newId = (Math.max(...contactAddresses.map(a => parseInt(a.id)), 0) + 1).toString();
    const newOrder = Math.max(...contactAddresses.map(a => a.order), 0) + 1;
    setContactAddresses(prev => [...prev, { id: newId, address: '', order: newOrder }]);
  };

  const removeAddress = (id: string) => {
    if (contactAddresses.length <= 1) {
      toast.error('Vous devez conserver au moins une adresse');
      return;
    }
    setContactAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  // Fonctions de gestion des téléphones
  const handlePhoneChange = (id: string, value: string) => {
    setContactPhones(prev =>
      prev.map(phone => phone.id === id ? { ...phone, phone: value } : phone)
    );
  };

  const addPhone = () => {
    const newId = (Math.max(...contactPhones.map(p => parseInt(p.id)), 0) + 1).toString();
    const newOrder = Math.max(...contactPhones.map(p => p.order), 0) + 1;
    setContactPhones(prev => [...prev, { id: newId, phone: '', order: newOrder }]);
  };

  const removePhone = (id: string) => {
    if (contactPhones.length <= 1) {
      toast.error('Vous devez conserver au moins un numéro de téléphone');
      return;
    }
    setContactPhones(prev => prev.filter(phone => phone.id !== id));
  };

  // Sauvegarder les informations de contact
  const saveContactInfo = async () => {
    try {
      // Supprimer les anciennes entrées
      const { error: deleteError } = await supabase
        .from('site_settings')
        .delete()
        .or('setting_key.like.contact_address_%,setting_key.like.contact_phone_%');

      if (deleteError) throw deleteError;

      // Insérer les nouvelles entrées
      const insertData = [
        ...contactAddresses.map(addr => ({
          setting_key: `contact_address_${addr.id}`,
          setting_value: addr.address,
          setting_type: 'text',
          description: `Adresse de contact ${addr.id}`
        })),
        ...contactPhones.map(phone => ({
          setting_key: `contact_phone_${phone.id}`,
          setting_value: phone.phone,
          setting_type: 'text',
          description: `Numéro de téléphone ${phone.id}`
        }))
      ];

      const { error: insertError } = await supabase
        .from('site_settings')
        .insert(insertData);

      if (insertError) throw insertError;

      toast.success('Informations de contact sauvegardées avec succès');
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast.error('Erreur lors de la sauvegarde des contacts');
    }
  };

  const handleOpeningHoursChange = (day: keyof OpeningHours, field: keyof DaySchedule, value: any) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleTimeSlotChange = (day: keyof OpeningHours, period: 'morning' | 'afternoon', field: 'open' | 'close', value: string) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: {
          ...prev[day][period],
          [field]: value
        }
      }
    }));
  };

  const togglePeriod = (day: keyof OpeningHours, period: 'morning' | 'afternoon') => {
    setOpeningHours(prev => {
      const currentDay = prev[day];
      const newDay = { ...currentDay };
      
      if (newDay[period]) {
        // Supprimer la période
        delete newDay[period];
      } else {
        // Ajouter la période avec des valeurs par défaut
        newDay[period] = period === 'morning' 
          ? { open: '08:00', close: '12:45' }
          : { open: '15:30', close: '19:00' };
      }
      
      return { ...prev, [day]: newDay };
    });
  };

  const handleAddVacation = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    addVacationPeriod({
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      description: 'Nouvelles vacances',
      isActive: true,
      postVacationDelayDays: 4
    });
  };

  const handleVacationChange = (id: string, field: keyof VacationPeriod, value: any) => {
    updateVacationPeriod(id, { [field]: value });
  };

  const saveAllSettings = async () => {
    setSaving(true);
    try {
      // Vérifier si la table existe en essayant de lire
      const { error: testError } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1);

      if (testError) {
        toast.warning('Base de données non configurée - les changements ne seront pas sauvegardés');
        toast.info('Exécutez le script site_settings.sql dans Supabase pour activer la sauvegarde');
        setSaving(false);
        return;
      }

      console.log('Sauvegarde des images:', imageSettings);

      const updates = [
        ...Object.entries(colorSettings).map(([key, value]) => updateSetting(key, value)),
        ...Object.entries(imageSettings).map(([key, value]) => updateSetting(key, value)),
        updateSetting('company_name', companyName),
        updateSetting('company_description', companyDescription),
        updateSetting('chatbot_api_key', chatbotApiKey),
        updateSetting('chatbot_enabled', chatbotEnabled.toString()),
        updateSetting('shop_enabled', shopEnabled.toString()),
        updateSetting('chatbot_client_enabled', chatbotClientEnabled.toString()),
        updateSetting('chatbot_admin_enabled', chatbotAdminEnabled.toString())
      ];

      await Promise.all(updates);

      console.log('Toutes les mises à jour terminées');

      // Sauvegarder les tarifs de livraison
      await saveDeliveryRates();

      // Sauvegarder les informations de contact
      await saveContactInfo();

      // Sauvegarder les horaires d'ouverture
      await saveOpeningHours(openingHours);

      // Sauvegarder les périodes de vacances
      await saveVacationPeriods(vacationPeriods);

      toast.success('Paramètres sauvegardés avec succès!');

      // Recharger les paramètres depuis la base de données
      await fetchSettings();

      // Appliquer les couleurs au document
      const root = document.documentElement;
      Object.entries(colorSettings).forEach(([key, value]) => {
        const cssVarName = key.replace('color_', '').replace(/_/g, '-');
        root.style.setProperty(`--color-${cssVarName}`, value);
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.warning('Les changements ne peuvent pas être sauvegardés - mode local actif');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setColorSettings({
      color_primary: '#9333ea',        // purple-600 from current site
      color_background: '#ffffff',     // white
      color_text_dark: '#374151',      // gray-700
      color_text_light: '#ffffff',     // white
      color_buttons: '#a855f7',        // purple-500 from current site
      color_company_title: '#1f2937',  // gray-800
      color_slot_occupied: '#fca5a5',  // red-300
      color_slot_available: '#93c5fd', // blue-300
    });
    toast.info('Couleurs réinitialisées aux valeurs du site actuel');
  };

  const previewColors = () => {
    // Appliquer temporairement les couleurs au document
    const root = document.documentElement;
    Object.entries(colorSettings).forEach(([key, value]) => {
      const cssVarName = key.replace('color_', '').replace(/_/g, '-');
      root.style.setProperty(`--color-${cssVarName}`, value);
    });
    toast.info('Aperçu appliqué temporairement');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchSettings();
      toast.success('Paramètres actualisés depuis la base de données!');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  const initializeCarouselImages = async () => {
    setRefreshing(true);
    try {
      console.log('=== INITIALISATION DES IMAGES DU CARROUSEL ===');
      console.log('Images actuelles dans le state:', imageSettings);

      // Vérifier et créer chaque image du carrousel
      const carouselKeys = ['carousel_image_1', 'carousel_image_2', 'carousel_image_3', 'carousel_image_4'];

      for (const key of carouselKeys) {
        const currentValue = imageSettings[key as keyof ImageSettings];
        console.log(`Traitement de ${key}: ${currentValue}`);

        // Vérifier si l'entrée existe
        const { data: existing, error: checkError } = await supabase
          .from('site_settings')
          .select('id')
          .eq('setting_key', key)
          .maybeSingle();

        if (checkError) {
          console.error(`Erreur lors de la vérification de ${key}:`, checkError);
          continue;
        }

        if (existing) {
          // Mettre à jour avec la valeur actuelle
          const { error: updateError } = await supabase
            .from('site_settings')
            .update({
              setting_value: currentValue,
              setting_type: 'image_url',
              description: `Image ${key.split('_')[2]} du carrousel`
            })
            .eq('setting_key', key);

          if (updateError) {
            console.error(`Erreur mise à jour de ${key}:`, updateError);
          } else {
            console.log(`✓ ${key} mis à jour avec succès`);
          }
        } else {
          // Créer l'entrée
          const { error: insertError } = await supabase
            .from('site_settings')
            .insert({
              setting_key: key,
              setting_value: currentValue,
              setting_type: 'image_url',
              description: `Image ${key.split('_')[2]} du carrousel`
            });

          if (insertError) {
            console.error(`Erreur création de ${key}:`, insertError);
          } else {
            console.log(`✓ ${key} créé avec succès`);
          }
        }
      }

      console.log('=== FIN INITIALISATION ===');
      toast.success('Images du carrousel initialisées en base de données!');

      // Recharger et afficher ce qui a été chargé
      await fetchSettings();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      toast.error('Erreur lors de l\'initialisation des images');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-zinc-600">Chargement des paramètres...</span>
      </div>
    );
  }

  const sections = [
    { id: 'logo' as SettingsSection, name: 'Logo', icon: ImageIcon, description: 'Logo de l\'entreprise' },
    { id: 'company' as SettingsSection, name: 'Entreprise', icon: ImageIcon, description: 'Nom et description' },
    { id: 'contact' as SettingsSection, name: 'Contact', icon: MapPin, description: 'Adresses et téléphones' },
    { id: 'delivery' as SettingsSection, name: 'Livraison', icon: Truck, description: 'Tarifs de livraison' },
    { id: 'hours' as SettingsSection, name: 'Horaires', icon: Clock, description: 'Heures d\'ouverture' },
    { id: 'vacation' as SettingsSection, name: 'Vacances', icon: Plane, description: 'Périodes de fermeture' },
    { id: 'instagram' as SettingsSection, name: 'Instagram Posts', icon: Instagram, description: 'Affichage sur le site' },
    { id: 'featured' as SettingsSection, name: 'Produits Phares', icon: Package, description: 'Produits mis en avant' },
    { id: 'reviews' as SettingsSection, name: 'Avis Google', icon: Star, description: 'Avis clients Google' },
    { id: 'qrcode' as SettingsSection, name: 'Code QR', icon: QrCode, description: 'Génération de QR codes' },
    { id: 'features' as SettingsSection, name: 'Fonctionnalités', icon: Settings, description: 'Activer/désactiver les fonctionnalités' },
    { id: 'chatbot' as SettingsSection, name: 'Chatbot IA', icon: Bot, description: 'Configuration du chatbot' },
    { id: 'colors' as SettingsSection, name: 'Couleurs', icon: Palette, description: 'Palette de couleurs' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-800 mb-2">Paramètres du Site</h1>
            <p className="text-zinc-600">
              Configuration technique et globale du site
            </p>
          </div>
          <div className="flex space-x-3">
            {activeSection === 'colors' && (
              <button
                onClick={previewColors}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>Aperçu</span>
              </button>
            )}
            <button
              onClick={saveAllSettings}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Selector */}
      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-zinc-800 mb-4">Sélectionnez une section à configurer</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  isActive
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                    : 'border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  </div>
                )}

                <div className="flex flex-col">
                  <div
                    className={`p-2 rounded-lg mb-2 w-fit ${
                      isActive ? 'bg-purple-100' : 'bg-zinc-100'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? 'text-purple-600' : 'text-zinc-600'
                      }`}
                    />
                  </div>

                  <h3
                    className={`font-semibold text-sm mb-1 ${
                      isActive ? 'text-purple-700' : 'text-zinc-800'
                    }`}
                  >
                    {section.name}
                  </h3>

                  <p className="text-xs text-zinc-500">
                    {section.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Logo */}
      {activeSection === 'logo' && (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <ImageIcon className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-zinc-800">Logo de l'entreprise</h2>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            ℹ️ <strong>Note :</strong> Les autres images du site sont gérées dans la section <strong>Apparence</strong> :
          </p>
          <ul className="text-sm text-blue-700 ml-4 space-y-1">
            <li>• Images du carrousel → <strong>Apparence → Accueil</strong></li>
            <li>• Images page Événements → <strong>Apparence → Événements</strong></li>
            <li>• Images page À Propos → <strong>Apparence → À Propos</strong></li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUploadField
            label="Image du logo de l'entreprise"
            value={imageSettings.logo_image}
            onChange={(url) => handleImageChange('logo_image', url)}
            placeholder="https://exemple.com/logo.png"
            showPreview={false}
          />
          {imageSettings.logo_image && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-700">Aperçu du logo</label>
              <div className="h-20 border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50 flex items-center justify-center">
                <img
                  src={imageSettings.logo_image}
                  alt="Logo"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZTJlOGYwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TG9nbyBub24gdHJvdXbDqTwvdGV4dD4KPC9zdmc+';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            💡 <strong>Le logo s'affiche :</strong>
          </p>
          <ul className="text-sm text-amber-700 mt-2 space-y-1">
            <li>• Dans le header de toutes les pages</li>
            <li>• Dans le footer du site</li>
            <li>• Dans les emails envoyés aux clients</li>
            <li>• Format recommandé : PNG avec fond transparent</li>
            <li>• Dimensions recommandées : 200x80 pixels</li>
          </ul>
        </div>
      </div>
      )}

      {/* Section Informations de l'Entreprise */}
      {activeSection === 'company' && (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <ImageIcon className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-zinc-800">Informations de l'entreprise</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Nom de l'entreprise
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: Au Matin Vert"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Description de l'entreprise
            </label>
            <input
              type="text"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Ex: Épicerie du centre commercial des Thébaudières"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Information :</strong> Ces informations seront affichées automatiquement dans le header, le footer et partout où le nom de l'entreprise apparaît sur le site.
          </p>
        </div>
      </div>
      )}

      {/* Section Informations de Contact */}
      {activeSection === 'contact' && (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MapPin className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-zinc-800">Informations de contact</h2>
        </div>

        {/* Adresses */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-zinc-800">Adresses</h3>
            <button
              onClick={addAddress}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter une adresse</span>
            </button>
          </div>

          <div className="space-y-3">
            {contactAddresses.map((addr, index) => (
              <div key={addr.id} className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                <input
                  type="text"
                  value={addr.address}
                  onChange={(e) => handleAddressChange(addr.id, e.target.value)}
                  placeholder="Ex: 1 rue du Nil, 44800 Saint-Herblain"
                  className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {contactAddresses.length > 1 && (
                  <button
                    onClick={() => removeAddress(addr.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    title="Supprimer cette adresse"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Téléphones */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-zinc-800">Numéros de téléphone</h3>
            <button
              onClick={addPhone}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter un numéro</span>
            </button>
          </div>

          <div className="space-y-3">
            {contactPhones.map((phone, index) => (
              <div key={phone.id} className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                <input
                  type="tel"
                  value={phone.phone}
                  onChange={(e) => handlePhoneChange(phone.id, e.target.value)}
                  placeholder="Ex: +33 6 15 32 99 72"
                  className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {contactPhones.length > 1 && (
                  <button
                    onClick={() => removePhone(phone.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    title="Supprimer ce numéro"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Information :</strong> Ces coordonnées seront affichées automatiquement dans le header, le footer et partout où les informations de contact apparaissent sur le site.
          </p>
        </div>
      </div>
      )}

      {/* Section Tarifs de Livraison */}
      {activeSection === 'delivery' && (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-zinc-800">Tarifs de livraison</h2>
          </div>
          <button
            onClick={addDeliveryRate}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un tarif</span>
          </button>
        </div>

        <div className="space-y-4">
          {deliveryRates.map((rate, index) => (
            <div key={rate.id} className="p-4 border border-zinc-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-zinc-800">Tarif {rate.id}</h3>
                {deliveryRates.length > 1 && (
                  <button
                    onClick={() => removeDeliveryRate(rate.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Montant minimum (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rate.min_amount}
                    onChange={(e) => handleDeliveryRateChange(rate.id, 'min_amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Montant maximum (€)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={rate.max_amount || ''}
                      onChange={(e) => handleDeliveryRateChange(rate.id, 'max_amount', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Illimité"
                      className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleDeliveryRateChange(rate.id, 'max_amount', null)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                      title="Illimité"
                    >
                      ∞
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Tarif (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rate.rate}
                    onChange={(e) => handleDeliveryRateChange(rate.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={rate.description}
                    onChange={(e) => handleDeliveryRateChange(rate.id, 'description', e.target.value)}
                    placeholder="Description du tarif"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  {rate.max_amount === null ? (
                    <>Commandes ≥ {rate.min_amount}€ : <span className="font-medium">{rate.rate === 0 ? 'Gratuit' : `${rate.rate}€`}</span></>
                  ) : (
                    <>Commandes de {rate.min_amount}€ à {rate.max_amount}€ : <span className="font-medium">{rate.rate === 0 ? 'Gratuit' : `${rate.rate}€`}</span></>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            💡 <strong>Conseils :</strong>
          </p>
          <ul className="text-sm text-amber-700 mt-2 space-y-1">
            <li>• Évitez les chevauchements entre les tranches de prix</li>
            <li>• Pour un montant maximum illimité, laissez le champ vide ou cliquez sur ∞</li>
            <li>• Les tarifs sont automatiquement triés par montant minimum croissant</li>
            <li>• Les modifications seront appliquées immédiatement sur tout le site après sauvegarde</li>
          </ul>
        </div>
      </div>
      )}

      {/* Section Horaires d'ouverture */}
      {activeSection === 'hours' && (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-zinc-800">Horaires d'ouverture</h2>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(openingHours).map(([dayKey, daySchedule]) => (
            <div key={dayKey} className="p-4 border border-zinc-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-zinc-800">{daySchedule.day}</h3>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={daySchedule.isOpen}
                    onChange={(e) => handleOpeningHoursChange(dayKey as keyof OpeningHours, 'isOpen', e.target.checked)}
                    className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-zinc-600">Ouvert</span>
                </label>
              </div>

              {daySchedule.isOpen && (
                <div className="space-y-4">
                  {/* Période du matin */}
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer min-w-[100px]">
                      <input
                        type="checkbox"
                        checked={!!daySchedule.morning}
                        onChange={() => togglePeriod(dayKey as keyof OpeningHours, 'morning')}
                        className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-zinc-700">Matin</span>
                    </label>
                    
                    {daySchedule.morning && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={daySchedule.morning.open}
                          onChange={(e) => handleTimeSlotChange(dayKey as keyof OpeningHours, 'morning', 'open', e.target.value)}
                          className="px-3 py-1 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                        <span className="text-zinc-500">à</span>
                        <input
                          type="time"
                          value={daySchedule.morning.close}
                          onChange={(e) => handleTimeSlotChange(dayKey as keyof OpeningHours, 'morning', 'close', e.target.value)}
                          className="px-3 py-1 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Période de l'après-midi */}
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer min-w-[100px]">
                      <input
                        type="checkbox"
                        checked={!!daySchedule.afternoon}
                        onChange={() => togglePeriod(dayKey as keyof OpeningHours, 'afternoon')}
                        className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-zinc-700">Après-midi</span>
                    </label>
                    
                    {daySchedule.afternoon && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={daySchedule.afternoon.open}
                          onChange={(e) => handleTimeSlotChange(dayKey as keyof OpeningHours, 'afternoon', 'open', e.target.value)}
                          className="px-3 py-1 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                        <span className="text-zinc-500">à</span>
                        <input
                          type="time"
                          value={daySchedule.afternoon.close}
                          onChange={(e) => handleTimeSlotChange(dayKey as keyof OpeningHours, 'afternoon', 'close', e.target.value)}
                          className="px-3 py-1 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Aperçu */}
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">{daySchedule.day} :</span>
                      <span className="ml-2">
                        {!daySchedule.morning && !daySchedule.afternoon 
                          ? 'Fermé' 
                          : [
                              daySchedule.morning && `${daySchedule.morning.open}-${daySchedule.morning.close}`,
                              daySchedule.afternoon && `${daySchedule.afternoon.open}-${daySchedule.afternoon.close}`
                            ].filter(Boolean).join(' / ')
                        }
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            💡 <strong>Conseils :</strong>
          </p>
          <ul className="text-sm text-amber-700 mt-2 space-y-1">
            <li>• Décochez "Ouvert" pour marquer un jour comme fermé</li>
            <li>• Activez "Matin" ou "Après-midi" selon vos créneaux d'ouverture</li>
            <li>• Un indicateur "Ouvert/Fermé" en temps réel sera affiché sur le site</li>
            <li>• Les horaires seront mis à jour automatiquement partout sur le site</li>
          </ul>
        </div>
      </div>
      )}

      {/* Section Périodes de Vacances */}
      {activeSection === 'vacation' && (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Plane className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-zinc-800">Périodes de vacances</h2>
          </div>
          <button
            onClick={handleAddVacation}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter une période</span>
          </button>
        </div>

        {(() => {
          const vacationStatus = getCurrentVacationStatus();
          return vacationStatus.isOnVacation || vacationStatus.nextVacation ? (
            <div className={`mb-6 p-4 rounded-lg border ${
              vacationStatus.isOnVacation 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center mb-2">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  vacationStatus.isOnVacation ? 'bg-orange-500' : 'bg-blue-500'
                }`}></div>
                <span className={`font-medium ${
                  vacationStatus.isOnVacation ? 'text-orange-800' : 'text-blue-800'
                }`}>
                  {vacationStatus.isOnVacation ? '🏖️ En vacances actuellement' : '📅 Prochaines vacances'}
                </span>
              </div>
              {vacationStatus.isOnVacation && vacationStatus.currentPeriod && (
                <div className="text-sm text-orange-700">
                  <p>{vacationStatus.currentPeriod.description}</p>
                  <p>{formatPeriod(vacationStatus.currentPeriod)}</p>
                  {vacationStatus.returnDate && (
                    <p className="mt-1 font-medium">
                      Commandes à nouveau disponibles à partir du {new Date(vacationStatus.returnDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              )}
              {vacationStatus.nextVacation && (
                <div className="text-sm text-blue-700">
                  <p>{vacationStatus.nextVacation.description}</p>
                  <p>{formatPeriod(vacationStatus.nextVacation)}</p>
                </div>
              )}
            </div>
          ) : null;
        })()}

        <div className="space-y-4">
          {vacationPeriods.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucune période de vacances configurée</p>
              <p className="text-sm">Les clients pourront commander normalement</p>
            </div>
          ) : (
            vacationPeriods.map((period) => (
              <div key={period.id} className="p-4 border border-zinc-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={period.isActive}
                        onChange={(e) => handleVacationChange(period.id, 'isActive', e.target.checked)}
                        className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-zinc-700">Activer cette période</span>
                    </label>
                  </div>
                  <button
                    onClick={() => removeVacationPeriod(period.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Supprimer cette période"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={period.description}
                      onChange={(e) => handleVacationChange(period.id, 'description', e.target.value)}
                      placeholder="Ex: Vacances d'été"
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={period.startDate}
                      onChange={(e) => handleVacationChange(period.id, 'startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={period.endDate}
                      onChange={(e) => handleVacationChange(period.id, 'endDate', e.target.value)}
                      min={period.startDate}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Délai après retour (jours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={period.postVacationDelayDays || 4}
                      onChange={(e) => handleVacationChange(period.id, 'postVacationDelayDays', parseInt(e.target.value) || 4)}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {period.isActive && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Période active :</span>
                      <span className="ml-2">{formatPeriod(period)}</span>
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Les commandes prises pendant cette période seront automatiquement reportées {period.postVacationDelayDays || 4} jour{(period.postVacationDelayDays || 4) > 1 ? 's' : ''} après votre retour
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            💡 <strong>Comment ça marche :</strong>
          </p>
          <ul className="text-sm text-amber-700 mt-2 space-y-1">
            <li>• Les clients peuvent toujours commander pendant vos vacances</li>
            <li>• Toutes les commandes prises en période de vacances sont automatiquement reportées</li>
            <li>• Vous définissez le nombre de jours de délai après votre retour (1 à 30 jours)</li>
            <li>• Chaque période peut avoir un délai différent selon vos besoins</li>
            <li>• Vous pouvez désactiver une période temporairement sans la supprimer</li>
            <li>• Les périodes se chevauchent automatiquement si nécessaire</li>
          </ul>
        </div>
      </div>
      )}

      {/* Section Instagram */}
      {activeSection === 'instagram' && <InstagramManager />}

      {/* Section Produits Phares */}
      {activeSection === 'featured' && <FeaturedProductsManager />}

      {/* Section Avis Google */}
      {activeSection === 'reviews' && <GoogleReviewsManager />}

      {/* Section Code QR */}
      {activeSection === 'qrcode' && <QRCodeGenerator />}

      {/* Section Fonctionnalités */}
      {activeSection === 'features' && (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-zinc-800">Fonctionnalités du site</h2>
        </div>

        <div className="space-y-4">
          {/* Boutique */}
          <div className="p-6 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">Activer la boutique</h3>
                  <p className="text-sm text-zinc-600 mt-1">
                    Permet aux clients d'accéder à la page de la boutique et de passer des commandes. Quand désactivé, la page boutique sera inaccessible côté client.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={shopEnabled}
                  onChange={(e) => setShopEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Information :</strong> Ces paramètres contrôlent les fonctionnalités principales du site. Les changements prendront effet immédiatement après sauvegarde.
          </p>
        </div>
      </div>
      )}

      {/* Section Chatbot IA */}
      {activeSection === 'chatbot' && (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Bot className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-zinc-800">Configuration du Chatbot IA</h2>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">🤖 Assistant IA contextuel</h3>
            <p className="text-sm text-purple-700">
              Le chatbot apparaît sur toutes les pages de votre site et aide vos utilisateurs avec des conseils sur l'application,
              le marketing, les réseaux sociaux et le e-commerce.
            </p>
          </div>

          {/* Assistant Client */}
          <div className="p-6 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">Assistant Client (Pour les visiteurs)</h3>
                  <p className="text-sm text-zinc-600 mt-1">
                    Active l'assistant AI pour les visiteurs du site. Il aide avec les produits, conseils et questions sur l'épicerie.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={chatbotClientEnabled}
                  onChange={(e) => setChatbotClientEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Assistant Admin */}
          <div className="p-6 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">Assistant Admin (Pour les administrateurs)</h3>
                  <p className="text-sm text-zinc-600 mt-1">
                    Active l'assistant AI pour les administrateurs uniquement. Il aide avec la gestion de l'application, le marketing et les questions business.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={chatbotAdminEnabled}
                  onChange={(e) => setChatbotAdminEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Clé API Claude (Anthropic)
            </label>
            <input
              type="password"
              value={chatbotApiKey}
              onChange={(e) => setChatbotApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Format: sk-ant-api03-XXXX...
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-purple-600 hover:text-purple-700 underline"
              >
                Obtenir une clé API
              </a>
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>ℹ️ Comment ça marche :</strong>
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Le chatbot utilise Claude 3.5 Sonnet pour générer des réponses intelligentes</li>
              <li>• Il connaît toutes les fonctionnalités de votre application</li>
              <li>• Il peut donner des conseils business, marketing et e-commerce</li>
              <li>• Le widget apparaît en bas à droite sur toutes les pages</li>
              <li>• Les conversations sont contextuelles et mémorisent l'historique</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 mb-2">
              <strong>💡 Fonctionnalités du chatbot :</strong>
            </p>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Aide sur l'utilisation de l'application</li>
              <li>• Conseils pour les réseaux sociaux (Facebook, Instagram)</li>
              <li>• Stratégies marketing et business</li>
              <li>• Génération d'idées de contenu</li>
              <li>• Support technique</li>
              <li>• Questions sur l'e-commerce et la gestion de boutique</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>✅ Exemples de questions :</strong>
            </p>
            <div className="mt-2 space-y-1 text-sm text-green-700">
              <p>• "Comment publier sur Instagram ?"</p>
              <p>• "Comment générer du contenu avec l'IA ?"</p>
              <p>• "Quelles sont les meilleures pratiques pour les réseaux sociaux ?"</p>
              <p>• "Comment gérer mes produits ?"</p>
              <p>• "Comment personnaliser les couleurs de mon site ?"</p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Section Couleurs */}
      {activeSection === 'colors' && (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-zinc-800">Paramètres de couleur</h2>
          </div>
          <button
            onClick={resetToDefaults}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Réinitialiser</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(colorSettings).map(([key, value]) => {
            const labels: Record<string, string> = {
              color_primary: 'Couleur de base',
              color_background: 'Couleur d\'arrière-plan du corps',
              color_text_dark: 'Couleur de police foncée',
              color_text_light: 'Couleur de police claire',
              color_buttons: 'Couleur des boutons',
              color_company_title: 'Couleur du titre de l\'entreprise',
              color_slot_occupied: 'Couleur créneau occupé',
              color_slot_available: 'Couleur créneau disponible',
            };

            return (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">
                  {labels[key]}
                </label>
                <div className="flex space-x-3">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof ColorSettings, e.target.value)}
                    className="w-12 h-10 border border-zinc-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof ColorSettings, e.target.value)}
                    placeholder="#000000"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
                <div 
                  className="w-full h-6 rounded border border-zinc-200"
                  style={{ backgroundColor: value }}
                ></div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Conseil :</strong> Utilisez le bouton "Aperçu" pour voir les changements avant de sauvegarder. 
              Les couleurs seront appliquées temporairement sur le site.
            </p>
          </div>
          
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              ⚠️ <strong>Mode local activé :</strong> Pour sauvegarder de façon permanente, exécutez d'abord le script 
              <code className="bg-amber-100 px-1 rounded mx-1">site_settings.sql</code> dans Supabase SQL Editor.
            </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default SiteCustomization;