import { supabase } from './supabase';

export const db = {
    // --- SERVICES ---
    getServices: async () => {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching services:', error);
            return [];
        }
        return data;
    },

    addService: async (service) => {
        const { error } = await supabase
            .from('services')
            .insert([service]);

        if (error) console.error('Error adding service:', error);
        return !error;
    },

    updateService: async (id, updates) => {
        const { error } = await supabase
            .from('services')
            .update(updates)
            .eq('id', id);

        if (error) console.error('Error updating service status:', error);
        return !error;
    },

    // --- CUSTOMERS ---
    getCustomers: async () => {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
        // Transform data to ensure history array exists (even if empty in db for now)
        return data.map(c => ({ ...c, history: c.history || [] }));
    },

    updateCustomerDebt: async (phone, amountChange) => {
        // 1. Get current debt
        const { data: customerData, error: fetchError } = await supabase
            .from('customers')
            .select('debt')
            .eq('phone', phone)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error('Error fetching customer for debt update:', fetchError);
            return false;
        }

        const currentDebt = customerData ? customerData.debt : 0;
        const newDebt = Math.max(0, currentDebt + amountChange);

        // 2. Upsert customer with new debt
        const { error: upsertError } = await supabase
            .from('customers')
            .upsert({ phone: phone, name: 'Pelanggan (Auto)', debt: newDebt }, { onConflict: 'phone' });

        if (upsertError) {
            console.error('Error updating customer debt:', upsertError);
            return false;
        }
        return true;
    },

    // Helper
    initialize: () => {
        // No longer needed for Supabase as data lives in the cloud
        console.log('🔗 Supabase DB Interface Initialized (Ensure you have set the .env variables)');
    }
};
