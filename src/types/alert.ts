export type AlertType = 'emergency' | 'theft' | 'suspicious' | 'noise' | 'other';

export const ALERT_TYPES: Record<AlertType, { label: string; color: string; bg: string }> = {
    emergency: { label: 'Emergência', color: '#ef4444', bg: 'bg-red-500' }, // Red-500
    theft: { label: 'Roubo/Furto', color: '#f97316', bg: 'bg-orange-500' }, // Orange-500
    suspicious: { label: 'Suspeita', color: '#eab308', bg: 'bg-yellow-500' }, // Yellow-500
    noise: { label: 'Barulho', color: '#3b82f6', bg: 'bg-blue-500' }, // Blue-500
    other: { label: 'Outros', color: '#22c55e', bg: 'bg-green-500' }, // Green-500
};

export interface Comment {
    id: string;
    text: string;
    author_pseudonym: string;
    created_at: string;
}

export interface Alert {
    id: string;
    user_id?: string;
    type: AlertType;
    latitude: number;
    longitude: number;
    description: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    street?: string;
    photo_url?: string;
    created_at: string;
    author_pseudonym: string;
    confirmations: number;
    reports: number;
    police_report?: string;
    reference_point?: string;
    status: 'active' | 'resolved' | 'reported';
    comments: Comment[];
}
