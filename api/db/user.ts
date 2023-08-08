import { UserDocument } from "../types/User";

export function toUserObject(user: UserDocument) {
    user.id = user._id.toString();

    delete user.password;
    delete user._id;

    return user;
}
