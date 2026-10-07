export const config = {
  runtime: 'edge',
  regions: ['iad1'], // 強制美國華盛頓機房，徹底繞過香港限制
};

export default async function handler(req) {
  // 1. 處理瀏覽器 CORS 預檢請求 (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const model = url.searchParams.get('model') || 'gemini-2.0-flash-exp';
    const key = url.searchParams.get('key') || '';

    // 動態組裝 Google 官方 API 請求網址
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    let bodyData = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      bodyData = await req.arrayBuffer();
    }

    const res = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'content-type': req.headers.get('content-type') || 'application/json',
      },
      body: bodyData,
    });

    const resData = await res.arrayBuffer();
    return new Response(resData, {
      status: res.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': res.headers.get('content-type') || 'application/json',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}
