export interface Submission {
    qrcode_id: string;
    submission_data: {
        name: string;
        email: string;
        phone_number?: string;
        country: string;
    };
    checked_in: boolean;
}
