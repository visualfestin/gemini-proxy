export const config = {
  runtime: 'edge',
  regions: ['iad1'], // 強制在美國華盛頓機房執行，徹底繞過香港限制
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  const url = new URL(req.url);
  const targetUrl = 'https://generativelanguage.googleapis.com' + url.pathname + url.search;

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      'content-type': req.headers.get('content-type') || 'application/json',
    },
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  });

  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Access-Control-Allow-Headers', '*');
  return newResponse;
}
