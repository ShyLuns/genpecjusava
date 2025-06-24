export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return token && getTokenExpiration() > Math.floor(Date.now() / 1000);
};

export const getTokenExpiration = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decodifica el payload JWT
    return payload.exp; // Retorna la fecha de expiración
  } catch (error) {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("nombre");
  window.location.href = "/";
};
