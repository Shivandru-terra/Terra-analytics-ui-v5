import { generalFunctions } from "@/lib/generalFuntion";
import { UserType } from "@/types/userType";

class UserServices {
  async fetchUsers(): Promise<UserType[]> {
    try {
      const userUrl = generalFunctions.createUrl("users");
      const res = await fetch(userUrl);
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      return data;
    } catch (error) {
      throw new Error("Failed to fetch users");
    }
  }
}

export const userServices = new UserServices();
