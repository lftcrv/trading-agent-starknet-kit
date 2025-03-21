export const sendAccountBalanceData = async (accountBalanceDto: any): Promise<void> => {
    try {
      const backendPort = process.env.BACKEND_PORT || '8080';
      const isLocal = process.env.LOCAL_DEVELOPMENT === 'TRUE';
      const host = isLocal ? process.env.HOST : '172.17.0.1';
      const apiKey = process.env.BACKEND_API_KEY;
  
      console.log(
        'Sending trading info to:',
        `http://${host}:${backendPort}/api/kpi`
      );
  
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
  
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }
  
      const response = await fetch(
        `http://${host}:${backendPort}/api/kpi`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(accountBalanceDto),
        }
      );
  
      if (!response.ok) {
        throw new Error(
          `Failed to save trading info: ${response.status} ${response.statusText}`
        );
      }
  
      const data = await response.json();
    } catch (error) {
      console.error(
        'Error saving trading information:',
        error.response?.data || error.message
      );
    }
  }