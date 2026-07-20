export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/business')) {
      url.pathname = url.pathname.slice('/business'.length) || '/';
    }

    const newRequest = new Request(url, request);
    return env.ASSETS.fetch(newRequest);
  },
};