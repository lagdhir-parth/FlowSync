import api from "./axios";

export const loginUser = async ({ username, password }) => {
  const { data } = await api.post("/auth/login", { username, password });
  return data;
};

export const logoutUser = async () => {
  await api.post("/auth/logout");
};

export const registerUser = async ({
  name,
  username,
  email,
  password,
  gender,
  avatarUrl,
}) => {
  const payload = {
    name,
    username,
    email,
    password,
    gender,
  };
  if (avatarUrl?.trim()) payload.avatarUrl = avatarUrl.trim();
  const { data } = await api.post("/auth/register", payload);
  return data;
};
