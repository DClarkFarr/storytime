export type UserResponse = {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
};

export type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
};
