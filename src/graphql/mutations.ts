/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createMyCustomType = /* GraphQL */ `mutation CreateMyCustomType($input: CreateMyCustomTypeInput!) {
  createMyCustomType(input: $input) {
    id
    title
    content
    price
    rating
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateMyCustomTypeMutationVariables,
  APITypes.CreateMyCustomTypeMutation
>;
export const updateMyCustomType = /* GraphQL */ `mutation UpdateMyCustomType($input: UpdateMyCustomTypeInput!) {
  updateMyCustomType(input: $input) {
    id
    title
    content
    price
    rating
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateMyCustomTypeMutationVariables,
  APITypes.UpdateMyCustomTypeMutation
>;
export const deleteMyCustomType = /* GraphQL */ `mutation DeleteMyCustomType($input: DeleteMyCustomTypeInput!) {
  deleteMyCustomType(input: $input) {
    id
    title
    content
    price
    rating
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteMyCustomTypeMutationVariables,
  APITypes.DeleteMyCustomTypeMutation
>;
