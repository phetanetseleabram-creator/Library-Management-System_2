const BASE = 'http://localhost:5000';

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

// ---------- BOOKS ----------
export const getBooks = () => fetch(`${BASE}/books`).then(handle);

export const addBook = (book) =>
  fetch(`${BASE}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  }).then(handle);

export const updateBook = (id, book) =>
  fetch(`${BASE}/books/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  }).then(handle);

export const deleteBook = (id) =>
  fetch(`${BASE}/books/${id}`, { method: 'DELETE' }).then(handle);

// ---------- USERS ----------
export const getUsers = () => fetch(`${BASE}/users`).then(handle);

export const addUser = (user) =>
  fetch(`${BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  }).then(handle);

export const updateUser = (id, user) =>
  fetch(`${BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  }).then(handle);

export const deleteUser = (id) =>
  fetch(`${BASE}/users/${id}`, { method: 'DELETE' }).then(handle);

export const login = (membership_id, password) =>
  fetch(`${BASE}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ membership_id, password }),
  }).then(handle);

// ---------- TRANSACTIONS ----------
export const getTransactions = () => fetch(`${BASE}/transactions`).then(handle);

export const createTransaction = (tx) =>
  fetch(`${BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx),
  }).then(handle);