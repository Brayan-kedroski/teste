import { CreateUserData, GetStoriesByUserData, GetStoriesByUserVariables, AddReactionData, AddReactionVariables, ListAllUsersData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;

export function useGetStoriesByUser(vars: GetStoriesByUserVariables, options?: useDataConnectQueryOptions<GetStoriesByUserData>): UseDataConnectQueryResult<GetStoriesByUserData, GetStoriesByUserVariables>;
export function useGetStoriesByUser(dc: DataConnect, vars: GetStoriesByUserVariables, options?: useDataConnectQueryOptions<GetStoriesByUserData>): UseDataConnectQueryResult<GetStoriesByUserData, GetStoriesByUserVariables>;

export function useAddReaction(options?: useDataConnectMutationOptions<AddReactionData, FirebaseError, AddReactionVariables>): UseDataConnectMutationResult<AddReactionData, AddReactionVariables>;
export function useAddReaction(dc: DataConnect, options?: useDataConnectMutationOptions<AddReactionData, FirebaseError, AddReactionVariables>): UseDataConnectMutationResult<AddReactionData, AddReactionVariables>;

export function useListAllUsers(options?: useDataConnectQueryOptions<ListAllUsersData>): UseDataConnectQueryResult<ListAllUsersData, undefined>;
export function useListAllUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllUsersData>): UseDataConnectQueryResult<ListAllUsersData, undefined>;
