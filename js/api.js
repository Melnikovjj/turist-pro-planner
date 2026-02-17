/**
 * Supabase API Client
 * Handles all database operations for multi-user support
 */

import { createClient } from '@supabase/supabase-js';

// These will be replaced with actual values from Supabase project
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

let supabase = null;
let currentUserId = null;

/**
 * Initialize Supabase client
 */
export function initSupabase() {
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        console.warn('Supabase not configured. Running in offline mode.');
        return false;
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized');
    return true;
}

/**
 * Authenticate or create user from Telegram data
 * @param {Object} telegramUser - User data from Telegram
 * @returns {Promise<Object>} User object
 */
export async function authenticateUser(telegramUser) {
    if (!supabase) {
        // Offline mode - create mock user
        return {
            id: `offline_${telegramUser.telegramId}`,
            telegram_id: telegramUser.telegramId,
            username: telegramUser.username,
            first_name: telegramUser.firstName,
            last_name: telegramUser.lastName
        };
    }

    try {
        // Check if user exists
        let { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', telegramUser.telegramId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
            throw error;
        }

        // Create new user if doesn't exist
        if (!user) {
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                    telegram_id: telegramUser.telegramId,
                    username: telegramUser.username,
                    first_name: telegramUser.firstName,
                    last_name: telegramUser.lastName
                })
                .select()
                .single();

            if (insertError) throw insertError;
            user = newUser;

            console.log('Created new user:', user);
        } else {
            // Update user info (в случае изменения имени/username в Telegram)
            const { data: updated } = await supabase
                .from('users')
                .update({
                    username: telegramUser.username,
                    first_name: telegramUser.firstName,
                    last_name: telegramUser.lastName,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)
                .select()
                .single();

            user = updated || user;
            console.log('User logged in:', user);
        }

        currentUserId = user.id;
        return user;

    } catch (error) {
        console.error('Authentication error:', error);
        throw new Error('Ошибка авторизации: ' + error.message);
    }
}

/**
 * Fetch all projects for current user
 * @returns {Promise<Array>} Array of projects
 */
export async function fetchProjects() {
    if (!supabase || !currentUserId) {
        // Return empty array in offline mode
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', currentUserId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Parse JSONB data field
        return (data || []).map(project => ({
            ...project.data,
            id: project.id,
            user_id: project.user_id
        }));

    } catch (error) {
        console.error('Fetch projects error:', error);
        throw new Error('Ошибка загрузки проектов: ' + error.message);
    }
}

/**
 * Create new project
 * @param {Object} projectData - Project data
 * @returns {Promise<Object>} Created project
 */
export async function createProject(projectData) {
    if (!supabase || !currentUserId) {
        // Generate local ID in offline mode
        projectData.id = `offline_${Date.now()}`;
        return projectData;
    }

    try {
        const { data, error } = await supabase
            .from('projects')
            .insert({
                user_id: currentUserId,
                title: projectData.title,
                start_date: projectData.startDate,
                end_date: projectData.endDate,
                type: projectData.type,
                season: projectData.season,
                body_type: projectData.bodyType,
                data: projectData
            })
            .select()
            .single();

        if (error) throw error;

        console.log('Project created:', data);
        return {
            ...projectData,
            id: data.id,
            user_id: data.user_id
        };

    } catch (error) {
        console.error('Create project error:', error);
        throw new Error('Ошибка создания проекта: ' + error.message);
    }
}

/**
 * Update existing project
 * @param {string} projectId - Project ID
 * @param {Object} updates - Updated project data
 * @returns {Promise<Object>} Updated project
 */
export async function updateProject(projectId, updates) {
    if (!supabase || !currentUserId) {
        // In offline mode, just return updates
        return { ...updates, id: projectId };
    }

    try {
        const { data, error } = await supabase
            .from('projects')
            .update({
                title: updates.title,
                start_date: updates.startDate,
                end_date: updates.endDate,
                type: updates.type,
                season: updates.season,
                body_type: updates.bodyType,
                data: updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId)
            .eq('user_id', currentUserId) // Security: ensure user owns this project
            .select()
            .single();

        if (error) throw error;

        console.log('Project updated:', data);
        return {
            ...updates,
            id: data.id,
            user_id: data.user_id
        };

    } catch (error) {
        console.error('Update project error:', error);
        throw new Error('Ошибка обновления проекта: ' + error.message);
    }
}

/**
 * Delete project
 * @param {string} projectId - Project ID
 * @returns {Promise<void>}
 */
export async function deleteProject(projectId) {
    if (!supabase || !currentUserId) {
        // In offline mode, do nothing
        return;
    }

    try {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId)
            .eq('user_id', currentUserId); // Security: ensure user owns this project

        if (error) throw error;

        console.log('Project deleted:', projectId);

    } catch (error) {
        console.error('Delete project error:', error);
        throw new Error('Ошибка удаления проекта: ' + error.message);
    }
}

/**
 * Check if running in online mode
 * @returns {boolean}
 */
export function isOnlineMode() {
    return !!supabase && !!currentUserId;
}

/**
 * Get current user ID
 * @returns {string|null}
 */
export function getCurrentUserId() {
    return currentUserId;
}
