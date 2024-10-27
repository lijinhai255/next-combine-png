/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getMyCustomType = /* GraphQL */ `query GetMyCustomType($id: ID!) {
  getMyCustomType(id: $id) {
    id
    title
    content
    price
    rating
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetMyCustomTypeQueryVariables,
  APITypes.GetMyCustomTypeQuery
>;
export const listMyCustomTypes = /* GraphQL */ `query ListMyCustomTypes(
  $filter: TableMyCustomTypeFilterInput
  $limit: Int
  $nextToken: String
) {
  listMyCustomTypes(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      content
      price
      rating
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListMyCustomTypesQueryVariables,
  APITypes.ListMyCustomTypesQuery
>;
