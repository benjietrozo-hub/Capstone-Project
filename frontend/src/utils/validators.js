export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateTeacherId = (id) => {
  return id.length > 0;
};

export const validateUsername = (username) => {
  return username.length >= 3;
};

export const validatePhoneNumber = (phone) => {
  return phone.length >= 7;
};
