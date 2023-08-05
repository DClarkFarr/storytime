import bcrypt from "bcrypt";

const hashSalt = "my cool hash that is awesome";

export const createPassword = (plainPassword: string) => {
    return bcrypt.hashSync(plainPassword, hashSalt);
};

export const checkPassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
};
