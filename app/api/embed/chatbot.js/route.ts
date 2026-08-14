/**
 * The embeddable widget, served as one self-contained script.
 *
 * Hand-written, no framework, no external fonts, no CDN. This runs on someone
 * else's production site, so its weight is our craft on display — a studio
 * selling performance cannot ship a heavy widget.
 *
 * Rendered into a shadow root rather than an iframe. The iframe the spec
 * proposed would isolate CSS, but it would also make every message request
 * originate from our domain, which breaks the key's domain binding — see
 * app/api/embed/chatbot/message/route.ts. A shadow root isolates styles in
 * both directions and keeps the request genuinely cross-origin.
 *
 * Cached hard at the edge: this changes rarely and sits on the critical path
 * of other people's pages.
 */

const WIDGET = String.raw`
(function () {
  var script = document.currentScript;
  if (!script) return;
  var key = script.getAttribute('data-key');
  if (!key) return;

  var api = new URL(script.src).origin;
  var mounted = false;

  function el(tag, css, text) {
    var node = document.createElement(tag);
    if (css) node.setAttribute('style', css);
    if (text) node.textContent = text;
    return node;
  }

  var INK = '#183228';
  var CRIMSON = '#b91646';
  var CREAM = '#fff0d0';
  var FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  var host = el('div');
  host.setAttribute('data-epyc-chat', '');
  var root = host.attachShadow({ mode: 'open' });

  var wrap = el('div', 'position:fixed;right:20px;bottom:20px;z-index:2147483000;font-family:' + FONT + ';');

  var launcher = el('button', [
    'width:56px;height:56px;border-radius:50%;border:0;cursor:pointer',
    'background:' + CRIMSON, 'color:' + CREAM, 'font-size:22px;line-height:1',
    'box-shadow:0 6px 20px rgba(0,0,0,.22)'
  ].join(';'), '✧');
  launcher.setAttribute('aria-label', 'Open chat');

  var panel = el('div', [
    'display:none;flex-direction:column;width:360px;max-width:calc(100vw - 40px)',
    'height:520px;max-height:calc(100vh - 120px);margin-bottom:12px',
    'background:#fff;border-radius:16px;overflow:hidden',
    'box-shadow:0 12px 40px rgba(0,0,0,.24)'
  ].join(';'));

  var header = el('div', 'padding:14px 16px;background:' + INK + ';color:' + CREAM + ';font-size:14px;font-weight:600;');
  var headerText = el('span', null, 'Ask us anything');
  header.appendChild(headerText);

  var log = el('div', 'flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#faf8f3;');

  var form = el('form', 'display:flex;gap:8px;padding:12px;border-top:1px solid #e8e3d8;background:#fff;');
  var input = el('input', 'flex:1;min-width:0;padding:10px 12px;border:1px solid #ddd6c7;border-radius:10px;font:inherit;font-size:14px;outline:none;');
  input.setAttribute('placeholder', 'Type your question');
  input.setAttribute('aria-label', 'Your question');
  var send = el('button', 'padding:10px 14px;border:0;border-radius:10px;background:' + CRIMSON + ';color:' + CREAM + ';cursor:pointer;font:inherit;font-size:14px;', 'Send');
  send.type = 'submit';
  form.appendChild(input);
  form.appendChild(send);

  var footer = el('div', 'padding:8px 12px;text-align:center;font-size:11px;color:#8a8577;background:#fff;');
  var credit = el('a', 'color:#8a8577;text-decoration:none;', 'Powered by EPYC');
  credit.href = api + '/tools/ai-chatbot?utm_source=embed&utm_medium=widget';
  credit.target = '_blank';
  credit.rel = 'noopener';
  footer.appendChild(credit);

  panel.appendChild(header);
  panel.appendChild(log);
  panel.appendChild(form);
  panel.appendChild(footer);
  wrap.appendChild(panel);
  wrap.appendChild(launcher);
  root.appendChild(wrap);

  function bubble(who, text) {
    var mine = who === 'you';
    var b = el('div', [
      'max-width:82%;padding:9px 12px;border-radius:12px;font-size:14px;line-height:1.45',
      'white-space:pre-wrap;word-wrap:break-word',
      mine ? 'align-self:flex-end;background:' + INK + ';color:' + CREAM
           : 'align-self:flex-start;background:#efe9dc;color:#1c1c1c'
    ].join(';'), text);
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
    return b;
  }

  var history = [];
  var busy = false;

  function ask(text) {
    if (busy || !text) return;
    busy = true;
    input.value = '';
    bubble('you', text);
    var out = bubble('bot', '...');
    var answer = '';

    fetch(api + '/api/embed/chatbot/message', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key: key, message: text, history: history.slice(-8) })
    }).then(function (res) {
      if (!res.ok || !res.body) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          out.textContent = body.error || 'Something went wrong. Please try again.';
          busy = false;
        });
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';

      function pump() {
        return reader.read().then(function (chunk) {
          if (chunk.done) {
            history.push({ role: 'user', content: text });
            history.push({ role: 'assistant', content: answer });
            busy = false;
            return;
          }
          buffer += decoder.decode(chunk.value, { stream: true });
          var split;
          while ((split = buffer.indexOf('\n\n')) !== -1) {
            var frame = buffer.slice(0, split);
            buffer = buffer.slice(split + 2);
            var data = '';
            frame.split('\n').forEach(function (line) {
              if (line.indexOf('data:') === 0) data += line.slice(5).trim();
            });
            if (!data) continue;
            try {
              var parsed = JSON.parse(data);
              if (parsed.text) {
                answer += parsed.text;
                out.textContent = answer;
                log.scrollTop = log.scrollHeight;
              } else if (parsed.message) {
                out.textContent = answer + '\n\n' + parsed.message;
              }
            } catch (e) { /* keep-alive or partial frame */ }
          }
          return pump();
        });
      }
      return pump();
    }).catch(function () {
      out.textContent = 'I could not reach the assistant. Please try again.';
      busy = false;
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ask(input.value.trim());
  });

  launcher.addEventListener('click', function () {
    var open = panel.style.display === 'flex';
    panel.style.display = open ? 'none' : 'flex';
    launcher.textContent = open ? '✧' : '×';
    launcher.setAttribute('aria-label', open ? 'Open chat' : 'Close chat');
    if (!open) {
      input.focus();
      if (!mounted) {
        mounted = true;
        bubble('bot', 'Hi — ask me anything about this site.');
      }
    }
  });

  function mount() {
    if (document.body) document.body.appendChild(host);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
`

export async function GET() {
  return new Response(WIDGET, {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      // Long cache: this sits on the critical path of other people's pages.
      'cache-control': 'public, max-age=3600, s-maxage=86400',
      'access-control-allow-origin': '*',
    },
  })
}
