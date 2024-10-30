import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const basicAuth = req.headers.get('authorization');

    const USERNAME = process.env.ADMIN_USERNAME;
    const PASSWORD = process.env.ADMIN_PASSWORD;

    if (!USERNAME || !PASSWORD) {
        throw new Error('Username and password must be set as environment variables');
    }

    const validAuth = `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')}`;

    if (basicAuth === validAuth) {
        return NextResponse.next();
    }

    return new Response('Auth required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"'
        }
    });
}

export const config = {
    matcher: ['/admin/:path*']
};
