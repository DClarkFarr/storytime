import { UserDocument } from "../types/User";
import { getDb } from "./connect";

export const getUsersCollection = async () => {
    return (await getDb()).collection<UserDocument>("users");
};
