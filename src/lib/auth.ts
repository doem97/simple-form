import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// A helper function to ensure environment variables are defined
function getEnv(variableName: string): string {
    const value = process.env[variableName];
    if (!value) {
        throw new Error(`${variableName} environment variable is not set`);
    }
    return value;
}

// In a real-world scenario, you'd have a database of users.
// For this simple case, we validate against a single admin password.
const adminPassword = getEnv('ADMIN_PASSWORD');

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (credentials?.password === adminPassword) {
                    // Return a static user object for the admin
                    return { id: "1", name: "Admin", email: "admin@example.com" };
                }
                // Return null if credentials are not valid
                return null;
            },
        }),
    ],
    secret: process.env.AUTH_SECRET, // AUTH_SECRET can be optional in dev, but is required for this logic to be clean
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/admin', // Redirect users to the admin page for sign-in
        error: '/admin', // Redirect users back to the sign-in page on error
    },
}; 