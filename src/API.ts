/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateMyCustomTypeInput = {
  title: string,
  content: string,
  price?: number | null,
  rating?: number | null,
};

export type MyCustomType = {
  __typename: "MyCustomType",
  id: string,
  title: string,
  content: string,
  price?: number | null,
  rating?: number | null,
};

export type UpdateMyCustomTypeInput = {
  id: string,
  title?: string | null,
  content?: string | null,
  price?: number | null,
  rating?: number | null,
};

export type DeleteMyCustomTypeInput = {
  id: string,
};

export type TableMyCustomTypeFilterInput = {
  id?: TableIDFilterInput | null,
  title?: TableStringFilterInput | null,
  content?: TableStringFilterInput | null,
  price?: TableIntFilterInput | null,
  rating?: TableFloatFilterInput | null,
};

export type TableIDFilterInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  size?: ModelSizeInput | null,
};

export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type TableStringFilterInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  size?: ModelSizeInput | null,
};

export type TableIntFilterInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
};

export type TableFloatFilterInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
};

export type MyCustomTypeConnection = {
  __typename: "MyCustomTypeConnection",
  items?:  Array<MyCustomType | null > | null,
  nextToken?: string | null,
};

export type CreateMyCustomTypeMutationVariables = {
  input: CreateMyCustomTypeInput,
};

export type CreateMyCustomTypeMutation = {
  createMyCustomType?:  {
    __typename: "MyCustomType",
    id: string,
    title: string,
    content: string,
    price?: number | null,
    rating?: number | null,
  } | null,
};

export type UpdateMyCustomTypeMutationVariables = {
  input: UpdateMyCustomTypeInput,
};

export type UpdateMyCustomTypeMutation = {
  updateMyCustomType?:  {
    __typename: "MyCustomType",
    id: string,
    title: string,
    content: string,
    price?: number | null,
    rating?: number | null,
  } | null,
};

export type DeleteMyCustomTypeMutationVariables = {
  input: DeleteMyCustomTypeInput,
};

export type DeleteMyCustomTypeMutation = {
  deleteMyCustomType?:  {
    __typename: "MyCustomType",
    id: string,
    title: string,
    content: string,
    price?: number | null,
    rating?: number | null,
  } | null,
};

export type GetMyCustomTypeQueryVariables = {
  id: string,
};

export type GetMyCustomTypeQuery = {
  getMyCustomType?:  {
    __typename: "MyCustomType",
    id: string,
    title: string,
    content: string,
    price?: number | null,
    rating?: number | null,
  } | null,
};

export type ListMyCustomTypesQueryVariables = {
  filter?: TableMyCustomTypeFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListMyCustomTypesQuery = {
  listMyCustomTypes?:  {
    __typename: "MyCustomTypeConnection",
    items?:  Array< {
      __typename: "MyCustomType",
      id: string,
      title: string,
      content: string,
      price?: number | null,
      rating?: number | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type OnCreateMyCustomTypeSubscriptionVariables = {
  id?: string | null,
  title?: string | null,
  content?: string | null,
  price?: number | null,
  rating?: number | null,
};

export type OnCreateMyCustomTypeSubscription = {
  onCreateMyCustomType?:  {
    __typename: "MyCustomType",
    id: string,
    title: string,
    content: string,
    price?: number | null,
    rating?: number | null,
  } | null,
};

export type OnUpdateMyCustomTypeSubscriptionVariables = {
  id?: string | null,
  title?: string | null,
  content?: string | null,
  price?: number | null,
  rating?: number | null,
};

export type OnUpdateMyCustomTypeSubscription = {
  onUpdateMyCustomType?:  {
    __typename: "MyCustomType",
    id: string,
    title: string,
    content: string,
    price?: number | null,
    rating?: number | null,
  } | null,
};

export type OnDeleteMyCustomTypeSubscriptionVariables = {
  id?: string | null,
  title?: string | null,
  content?: string | null,
  price?: number | null,
  rating?: number | null,
};

export type OnDeleteMyCustomTypeSubscription = {
  onDeleteMyCustomType?:  {
    __typename: "MyCustomType",
    id: string,
    title: string,
    content: string,
    price?: number | null,
    rating?: number | null,
  } | null,
};
