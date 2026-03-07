// src/api/client.js

/**
 * MPANDO API İletişim Katmanı
 * 
 * Bu modül, frontend ile backend arasındaki tüm HTTP trafiğini yönetir.
 * Özellikler:
 * - Otomatik JWT Token ekleme (LocalStorage üzerinden).
 * - Hata yakalama ve kullanıcı dostu mesajlara dönüştürme.
 * - FormData (dosya yükleme) ve JSON veri tiplerini otomatik tanıma.
 */

// =====================================
// KONFİGÜRASYON (Environment variables üzerinden)
// =====================================

let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
let TOKEN_KEY = "token";

// runtime config değiştirebilmek için
export function configureApi({ baseUrl, tokenKey } = {}) {
  if (baseUrl) API_BASE_URL = baseUrl;
  if (tokenKey) TOKEN_KEY = tokenKey;
}


// =====================================
// TOKEN MANAGEMENT
// =====================================

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}


// =====================================
// CORE REQUEST FUNCTION
// =====================================

async function request(endpoint, options = {}) {

  const token = getToken();

  const headers = {
    ...(options.headers || {})
  };

  // JSON header (FormData değilse)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Authorization header
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {

    method: options.method || "GET",

    headers,

    body:
      options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,

  });


  let data = null;

  try {

    data = await response.json();

  } catch {

    data = null;

  }


  if (!response.ok) {

    const message =
      data?.message ||
      data?.error ||
      response.statusText ||
      "API Error";

    throw new Error(message);

  }


  return data;

}



// =====================================
// HTTP METHODS
// =====================================

export const api = {

  get: (endpoint) =>
    request(endpoint, { method: "GET" }),


  post: (endpoint, body) =>
    request(endpoint, { method: "POST", body }),


  put: (endpoint, body) =>
    request(endpoint, { method: "PUT", body }),


  patch: (endpoint, body) =>
    request(endpoint, { method: "PATCH", body }),


  delete: (endpoint) =>
    request(endpoint, { method: "DELETE" }),


  upload: (endpoint, formData) =>
    request(endpoint, { method: "POST", body: formData }),

};