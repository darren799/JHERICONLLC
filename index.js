const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});
const normalize = (v, limit = 2000) => typeof v === 'string' ? v.trim().slice(0, limit) : '';
const goodEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeLine = s => normalize(s, 300).replace(/[\r\n]+/g, ' ');
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/inquiry') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({error:'Invalid content type.'},415);
    if (Number(request.headers.get('content-length') || 0) > 12000) return json({error:'Message too large.'},413);
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== url.host) return json({error:'Invalid origin.'},403);
    let p;
    try { p = await request.json(); } catch { return json({error:'Invalid request.'},400); }
    if (!p || typeof p !== 'object' || Array.isArray(p)) return json({error:'Invalid request.'},400);
    if (p.website) return json({ok:true}); // spam trap; never deliver
    const kind = p.kind === 'training' ? 'training' : p.kind === 'contact' ? 'contact' : null;
    if (!kind) return json({error:'Unknown inquiry type.'},400);
    const email = normalize(p.email,254);
    if (!goodEmail(email)) return json({error:'Enter a valid email address.'},400);
    const name = kind === 'training' ? `${safeLine(p.firstName)} ${safeLine(p.lastName)}`.trim() : safeLine(p.name);
    if (!name || name.length > 160) return json({error:'Please provide your name.'},400);
    const details = kind === 'training' ? {
      'Phone': safeLine(p.phone) || 'Not provided',
      'Learning preference': safeLine(p.delivery),
      'Area of interest': safeLine(p.program),
      'Learning goals': normalize(p.message,1000) || 'Not provided',
      'Training inquiry acknowledgement': p.consent === true ? 'Accepted' : 'Not accepted'
    } : {
      'Inquiry type': safeLine(p.type),
      'Message': normalize(p.message,2000)
    };
    if (kind === 'training' && (!details['Learning preference'] || !details['Area of interest'] || p.consent !== true)) return json({error:'Complete the required training fields.'},400);
    if (kind === 'contact' && (!details['Inquiry type'] || !details['Message'])) return json({error:'Complete all required fields.'},400);
    if (!env.RESEND_API_KEY || !env.FORM_FROM_EMAIL) return json({error:'The website inquiry service is not yet configured. Please email us directly.'},503);
    const lines = [['Inquiry category',kind],['Name',name],['Email',email],...Object.entries(details)];
    const html = '<h2>JHERICON '+(kind==='training'?'Training Interest':'Contact Inquiry')+'</h2><dl>'+lines.map(([k,v])=>'<dt><strong>'+escapeHtml(k)+'</strong></dt><dd style="white-space:pre-wrap">'+escapeHtml(v)+'</dd>').join('')+'</dl>';
    const subject = 'JHERICON '+(kind==='training'?'Training Interest':'Contact Inquiry')+' - '+name;
    let result;
    try {
      result = await fetch('https://api.resend.com/emails', {
        method:'POST',
        headers: {Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({from:env.FORM_FROM_EMAIL,to:['pjreed5@jhericon.com'],reply_to:email,subject,html})
      });
    } catch { return json({error:'Delivery service temporarily unavailable. Please try again.'},502); }
    if (!result.ok) {
      console.error('Email delivery failed, status:',result.status);
      return json({error:'Unable to deliver your inquiry right now. Please email us directly.'},502);
    }
    return json({ok:true},200);
  }
};
