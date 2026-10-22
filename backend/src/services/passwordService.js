import argon2 from 'argon2';

const options = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 };

export const hashPassword = (password) => argon2.hash(password, options);

export const verifyPassword = async (hash, password) => {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
};

let dummyHash;

export const burnVerification = async (password) => {
  dummyHash ??= await hashPassword('geogym-dummy-password-for-timing');
  await verifyPassword(dummyHash, password);
  return false;
};
