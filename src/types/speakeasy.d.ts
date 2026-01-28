// Type declarations for speakeasy
declare module 'speakeasy' {
    interface GenerateSecretOptions {
        name?: string;
        length?: number;
        symbols?: boolean;
        otpauth_url?: boolean;
        google_auth_qr?: boolean;
        issuer?: string;
    }

    interface GeneratedSecret {
        ascii: string;
        hex: string;
        base32: string;
        otpauth_url?: string;
        google_auth_qr?: string;
    }

    interface OtpauthURLOptions {
        secret: string;
        label: string;
        issuer?: string;
        type?: 'totp' | 'hotp';
        algorithm?: string;
        digits?: number;
        period?: number;
        counter?: number;
        encoding?: 'ascii' | 'hex' | 'base32';
    }

    interface TOTPVerifyOptions {
        secret: string;
        encoding?: 'ascii' | 'hex' | 'base32';
        token: string;
        window?: number;
        time?: number;
        step?: number;
        counter?: number;
    }

    function generateSecret(options?: GenerateSecretOptions): GeneratedSecret;
    function otpauthURL(options: OtpauthURLOptions): string;

    namespace totp {
        function verify(options: TOTPVerifyOptions): boolean;
    }

    export { generateSecret, otpauthURL, totp, GenerateSecretOptions, GeneratedSecret, OtpauthURLOptions, TOTPVerifyOptions };
}
