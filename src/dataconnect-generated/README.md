# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetStoriesByUser*](#getstoriesbyuser)
  - [*ListAllUsers*](#listallusers)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*AddReaction*](#addreaction)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetStoriesByUser
You can execute the `GetStoriesByUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getStoriesByUser(vars: GetStoriesByUserVariables): QueryPromise<GetStoriesByUserData, GetStoriesByUserVariables>;

interface GetStoriesByUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStoriesByUserVariables): QueryRef<GetStoriesByUserData, GetStoriesByUserVariables>;
}
export const getStoriesByUserRef: GetStoriesByUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getStoriesByUser(dc: DataConnect, vars: GetStoriesByUserVariables): QueryPromise<GetStoriesByUserData, GetStoriesByUserVariables>;

interface GetStoriesByUserRef {
  ...
  (dc: DataConnect, vars: GetStoriesByUserVariables): QueryRef<GetStoriesByUserData, GetStoriesByUserVariables>;
}
export const getStoriesByUserRef: GetStoriesByUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getStoriesByUserRef:
```typescript
const name = getStoriesByUserRef.operationName;
console.log(name);
```

### Variables
The `GetStoriesByUser` query requires an argument of type `GetStoriesByUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetStoriesByUserVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetStoriesByUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetStoriesByUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetStoriesByUserData {
  stories: ({
    id: UUIDString;
    caption?: string | null;
    videoUrl: string;
  } & Story_Key)[];
}
```
### Using `GetStoriesByUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getStoriesByUser, GetStoriesByUserVariables } from '@dataconnect/generated';

// The `GetStoriesByUser` query requires an argument of type `GetStoriesByUserVariables`:
const getStoriesByUserVars: GetStoriesByUserVariables = {
  userId: ..., 
};

// Call the `getStoriesByUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getStoriesByUser(getStoriesByUserVars);
// Variables can be defined inline as well.
const { data } = await getStoriesByUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getStoriesByUser(dataConnect, getStoriesByUserVars);

console.log(data.stories);

// Or, you can use the `Promise` API.
getStoriesByUser(getStoriesByUserVars).then((response) => {
  const data = response.data;
  console.log(data.stories);
});
```

### Using `GetStoriesByUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getStoriesByUserRef, GetStoriesByUserVariables } from '@dataconnect/generated';

// The `GetStoriesByUser` query requires an argument of type `GetStoriesByUserVariables`:
const getStoriesByUserVars: GetStoriesByUserVariables = {
  userId: ..., 
};

// Call the `getStoriesByUserRef()` function to get a reference to the query.
const ref = getStoriesByUserRef(getStoriesByUserVars);
// Variables can be defined inline as well.
const ref = getStoriesByUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getStoriesByUserRef(dataConnect, getStoriesByUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.stories);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.stories);
});
```

## ListAllUsers
You can execute the `ListAllUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllUsers(): QueryPromise<ListAllUsersData, undefined>;

interface ListAllUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllUsersData, undefined>;
}
export const listAllUsersRef: ListAllUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllUsers(dc: DataConnect): QueryPromise<ListAllUsersData, undefined>;

interface ListAllUsersRef {
  ...
  (dc: DataConnect): QueryRef<ListAllUsersData, undefined>;
}
export const listAllUsersRef: ListAllUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllUsersRef:
```typescript
const name = listAllUsersRef.operationName;
console.log(name);
```

### Variables
The `ListAllUsers` query has no variables.
### Return Type
Recall that executing the `ListAllUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllUsersData {
  users: ({
    id: UUIDString;
    username: string;
    profilePictureUrl?: string | null;
  } & User_Key)[];
}
```
### Using `ListAllUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllUsers } from '@dataconnect/generated';


// Call the `listAllUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
listAllUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListAllUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllUsersRef } from '@dataconnect/generated';


// Call the `listAllUsersRef()` function to get a reference to the query.
const ref = listAllUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation has no variables.
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser } from '@dataconnect/generated';


// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef } from '@dataconnect/generated';


// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## AddReaction
You can execute the `AddReaction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addReaction(vars: AddReactionVariables): MutationPromise<AddReactionData, AddReactionVariables>;

interface AddReactionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddReactionVariables): MutationRef<AddReactionData, AddReactionVariables>;
}
export const addReactionRef: AddReactionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addReaction(dc: DataConnect, vars: AddReactionVariables): MutationPromise<AddReactionData, AddReactionVariables>;

interface AddReactionRef {
  ...
  (dc: DataConnect, vars: AddReactionVariables): MutationRef<AddReactionData, AddReactionVariables>;
}
export const addReactionRef: AddReactionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addReactionRef:
```typescript
const name = addReactionRef.operationName;
console.log(name);
```

### Variables
The `AddReaction` mutation requires an argument of type `AddReactionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddReactionVariables {
  storyId: UUIDString;
  emoji: string;
}
```
### Return Type
Recall that executing the `AddReaction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddReactionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddReactionData {
  reaction_insert: Reaction_Key;
}
```
### Using `AddReaction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addReaction, AddReactionVariables } from '@dataconnect/generated';

// The `AddReaction` mutation requires an argument of type `AddReactionVariables`:
const addReactionVars: AddReactionVariables = {
  storyId: ..., 
  emoji: ..., 
};

// Call the `addReaction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addReaction(addReactionVars);
// Variables can be defined inline as well.
const { data } = await addReaction({ storyId: ..., emoji: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addReaction(dataConnect, addReactionVars);

console.log(data.reaction_insert);

// Or, you can use the `Promise` API.
addReaction(addReactionVars).then((response) => {
  const data = response.data;
  console.log(data.reaction_insert);
});
```

### Using `AddReaction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addReactionRef, AddReactionVariables } from '@dataconnect/generated';

// The `AddReaction` mutation requires an argument of type `AddReactionVariables`:
const addReactionVars: AddReactionVariables = {
  storyId: ..., 
  emoji: ..., 
};

// Call the `addReactionRef()` function to get a reference to the mutation.
const ref = addReactionRef(addReactionVars);
// Variables can be defined inline as well.
const ref = addReactionRef({ storyId: ..., emoji: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addReactionRef(dataConnect, addReactionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.reaction_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.reaction_insert);
});
```

