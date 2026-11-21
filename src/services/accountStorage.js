export function getCurrentAccountId() {
  try {
    const user = JSON.parse(localStorage.getItem('focusai_user') || 'null');
    return user?.id ? String(user.id) : 'guest';
  } catch {
    return 'guest';
  }
}

export function accountStorageKey(baseKey) {
  return `${baseKey}:${getCurrentAccountId()}`;
}

export function hasSignedInAccount() {
  return getCurrentAccountId() !== 'guest';
}

export function clearAccountBrowserData(accountId) {
  const suffix = `:${accountId}`;
  Object.keys(localStorage).forEach(key => {
    if (key.endsWith(suffix)) localStorage.removeItem(key);
  });
}
