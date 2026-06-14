const handleResponse = async (response) => {
  const isJson = response.headers?.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = (data && data.error) || response.statusText;
    return Promise.reject(error);
  }

  return data;
};

// We don't need to pass credentials manually if we use the proxy in dev,
// but it's good practice for when the frontend is served alongside Flask.
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

export const api = {
  get: (url) => fetch(url, { method: 'GET', headers: defaultHeaders }).then(handleResponse),
  post: (url, body) => fetch(url, { method: 'POST', headers: defaultHeaders, body: JSON.stringify(body) }).then(handleResponse),
  put: (url, body) => fetch(url, { method: 'PUT', headers: defaultHeaders, body: JSON.stringify(body) }).then(handleResponse),
  delete: (url) => fetch(url, { method: 'DELETE', headers: defaultHeaders }).then(handleResponse)
};
