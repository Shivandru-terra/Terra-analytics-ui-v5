import { threadServices } from '@/services/ThreadServices'
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'

export function useGetAllThreads(){
    return useQuery({
        queryKey: ["threads"],
        queryFn: () => threadServices.fetchAllThreads()
    })
}

export function useCreateThread(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["create-thread"],
        mutationFn: (newThreadId: string) => threadServices.createThread(newThreadId),
        onSuccess: () => queryClient.invalidateQueries({
            // queryKey: ["threads"]
        }),
    })
}

export function useDeleteThreads(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["delete-threads"],
        mutationFn: (threadId: string) => threadServices.deleteThreads(threadId),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ["threads"]
        }),
    })
}

export function useMessages(threadId: string){
    return useQuery({
        queryKey: ["messages", threadId],
        queryFn: () => threadServices.fetchMessages(threadId),
        enabled: !!threadId
    })
}