import bcrypt from "bcrypt";

const hashSalt = 10;

export const createPassword = (plainPassword: string) => {
    return bcrypt.hashSync(plainPassword, hashSalt);
};

export const checkPassword = (password: string, hash: string) => {
    return bcrypt.compareSync(password, hash);
};
