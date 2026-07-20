export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/admin')) {
      url.pathname = url.pathname.slice('/admin'.length) || '/';
    }

    const newRequest = new Request(url, request);
    return env.ASSETS.fetch(newRequest);
  },
};
// checking admin dashboard