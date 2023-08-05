import { User, UserResponse } from "@/types/User";

export const toUser = (data: UserResponse): User => {
    return {
        id: data._id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        createdAt: new Date(data.createdAt),
    };
};
