import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {routing} from './i18n/routing';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
 
export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  let localMessages = (await import(`../messages/${locale}.json`)).default;

  try {
    // Fetch CMS content
    const { data, error } = await supabase
      .from('marketing_contents')
      .select('page, content')
      .eq('locale', locale);

    if (data && data.length > 0) {
      const dbMessages: any = {};
      data.forEach((row) => {
        // e.g., 'home' -> 'Home'
        const key = row.page.charAt(0).toUpperCase() + row.page.slice(1);
        if (!dbMessages[key]) dbMessages[key] = {};
        Object.assign(dbMessages[key], row.content);
      });

      // Merge DB content overriding local content
      const mergedMessages = { ...localMessages };
      for (const key in dbMessages) {
        mergedMessages[key] = {
          ...(mergedMessages[key] || {}),
          ...dbMessages[key]
        };
      }
      localMessages = mergedMessages;
    }
  } catch (error) {
    console.error('Error fetching CMS translations:', error);
  }

  return {
    locale,
    messages: localMessages
  };
});
