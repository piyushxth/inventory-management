export const dynamic = 'force-dynamic';

export default function EsewaDebug() {
  // Server-side environment variables
  const serverEnv = {
    NEXT_PUBLIC_ESEWA_PAYMENT_URL: process.env.NEXT_PUBLIC_ESEWA_PAYMENT_URL,
    NEXT_PUBLIC_ESEWA_MERCHANT_ID: process.env.NEXT_PUBLIC_ESEWA_MERCHANT_ID,
    ESEWA_VERIFY_URL: process.env.ESEWA_VERIFY_URL,
    ESEWA_MERCHANT_ID: process.env.ESEWA_MERCHANT_ID,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">eSewa Environment Variables Debug</h1>
        
        <div className="mt-8 p-4 bg-gray-100 rounded-md text-left max-w-2xl mx-auto">
          <h2 className="font-bold mb-2">Server Environment Variables:</h2>
          <pre>{JSON.stringify(serverEnv, null, 2)}</pre>
        </div>
        
        <div className="mt-8">
          <h2 className="font-bold mb-2">Direct Links:</h2>
          <p><a href="https://uat.esewa.com.np/epay/main" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">eSewa UAT Payment Page</a></p>
          <p><a href="https://esewa.com.np" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">eSewa Main Site</a></p>
        </div>
      </div>
    </div>
  );
}