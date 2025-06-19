// Add these two lines for debugging
console.log("--- Checking Environment Variables ---");
console.log("MONGODB_URI found:", !!process.env.MONGODB_URI);


/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        // This is the fix for the "Module not found" errors.
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                dns: false,
                tls: false,
                net: false,
                fs: false,
                child_process: false,
                'kerberos': false,
                '@mongodb-js/zstd': false,
                '@aws-sdk/credential-providers': false,
                'snappy': false,
                'mongodb-client-encryption': false,
                'aws4': false,
            };
        }

        return config;
    },
};

export default nextConfig;