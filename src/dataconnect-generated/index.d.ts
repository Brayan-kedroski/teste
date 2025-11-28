import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddReactionData {
  reaction_insert: Reaction_Key;
}

export interface AddReactionVariables {
  storyId: UUIDString;
  emoji: string;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface Follow_Key {
  followerId: UUIDString;
  followedId: UUIDString;
  __typename?: 'Follow_Key';
}

export interface GetStoriesByUserData {
  stories: ({
    id: UUIDString;
    caption?: string | null;
    videoUrl: string;
  } & Story_Key)[];
}

export interface GetStoriesByUserVariables {
  userId: UUIDString;
}

export interface ListAllUsersData {
  users: ({
    id: UUIDString;
    username: string;
    profilePictureUrl?: string | null;
  } & User_Key)[];
}

export interface Message_Key {
  id: UUIDString;
  __typename?: 'Message_Key';
}

export interface Reaction_Key {
  userId: UUIDString;
  storyId: UUIDString;
  __typename?: 'Reaction_Key';
}

export interface Story_Key {
  id: UUIDString;
  __typename?: 'Story_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface GetStoriesByUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStoriesByUserVariables): QueryRef<GetStoriesByUserData, GetStoriesByUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStoriesByUserVariables): QueryRef<GetStoriesByUserData, GetStoriesByUserVariables>;
  operationName: string;
}
export const getStoriesByUserRef: GetStoriesByUserRef;

export function getStoriesByUser(vars: GetStoriesByUserVariables): QueryPromise<GetStoriesByUserData, GetStoriesByUserVariables>;
export function getStoriesByUser(dc: DataConnect, vars: GetStoriesByUserVariables): QueryPromise<GetStoriesByUserData, GetStoriesByUserVariables>;

interface AddReactionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddReactionVariables): MutationRef<AddReactionData, AddReactionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddReactionVariables): MutationRef<AddReactionData, AddReactionVariables>;
  operationName: string;
}
export const addReactionRef: AddReactionRef;

export function addReaction(vars: AddReactionVariables): MutationPromise<AddReactionData, AddReactionVariables>;
export function addReaction(dc: DataConnect, vars: AddReactionVariables): MutationPromise<AddReactionData, AddReactionVariables>;

interface ListAllUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllUsersData, undefined>;
  operationName: string;
}
export const listAllUsersRef: ListAllUsersRef;

export function listAllUsers(): QueryPromise<ListAllUsersData, undefined>;
export function listAllUsers(dc: DataConnect): QueryPromise<ListAllUsersData, undefined>;

