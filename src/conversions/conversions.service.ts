import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ConversionsService {
    private readonly accessToken = process.env.META_CONVERSION_API_ACCESS_TOKEN;
    private readonly apiUrl = 'https://graph.facebook.com/v17.0/1102383725265418/events';

    async sendConversionEvent(eventName: string, email: string, phoneNumber: string, value: number) {
        try {
            console.log('🚀 Sending Conversion Event:', {
                url: this.apiUrl,
                accessToken: this.accessToken ? 'Access Token Present' : 'No Access Token',
                eventName,
                email,
                phoneNumber,
                value
            });

            // ✅ Directly creating the payload
            const payload = {
                data: [
                    {
                        event_name: eventName, // Standard Meta Event Name
                        event_time: Math.floor(Date.now() / 1000),
                        action_source: 'website',
                        user_data: {
                            em: [this.hashData(email)],          // Hashed Email
                            ph: phoneNumber ? [this.hashData(phoneNumber)] : null // Hashed Phone (if provided)
                        },
                        custom_data: {
                            event_source: 'PQ Platform',        // Custom Label for Your Platform
                            currency: 'PKR',
                            value: value.toFixed(2)
                        }
                    }
                ],
                access_token: this.accessToken
            };

            const response = await axios.post(this.apiUrl, payload, {
                headers: {
                    'Content-Type': 'application/json' // ✅ Explicitly setting JSON type
                },
                timeout: 5000, // 5 secs
            });

            console.log('✅ Meta Conversion API Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Meta Conversion API Error:', {
                message: error.message,
                code: error.code,
                config: error.config,
                response: error.response ? error.response.data : null,
            });
            console.error('⚠️ Meta CAPI failed:', error.code || error.message);
            return; // silently fail and continue app flow
        }
    }

    // Utility function to hash data (email or phone) using SHA-256
    private hashData(data: string) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}
