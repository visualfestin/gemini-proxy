export const config = {
  runtime: 'edge',
  regions: ['iad1'], // 強制美國華盛頓機房，徹底繞過地區限制
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
    const targetUrl = 'https://generativelanguage.googleapis.com' + url.pathname + url.search;

    // 2. 穩定讀取圖片 Base64 數據
    let bodyData = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      bodyData = await req.arrayBuffer();
    }

    // 3. 發送至 Google API
    const res = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'content-type': req.headers.get('content-type') || 'application/json',
      },
      body: bodyData,
    });

    // 4. 讀取並回傳附帶 CORS 標頭的結果
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
