import { UserDocument } from "../types/User";

export function toUserObject(user: UserDocument) {
    delete user.password;

    return user;
}
