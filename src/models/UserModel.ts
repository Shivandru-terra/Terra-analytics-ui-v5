import { UserType } from "@/types/userType";

export class UserModel implements UserType {
    constructor(
        public userId: string,
        public username: string,
        public email: string
    ) {}
}