import { userServices } from "@/services/UserServices";
import { useQuery } from "@tanstack/react-query";

export function useGetAllUsers(){
    return useQuery({
        queryKey: ["users"],
        queryFn: () => userServices.fetchUsers()
    })
}