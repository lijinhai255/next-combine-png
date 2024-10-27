/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateMyCustomType = /* GraphQL */ `subscription OnCreateMyCustomType(
  $id: ID
  $title: String
  $content: String
  $price: Int
  $rating: Float
) {
  onCreateMyCustomType(
    id: $id
    title: $title
    content: $content
    price: $price
    rating: $rating
  ) {
    id
    title
    content
    price
    rating
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateMyCustomTypeSubscriptionVariables,
  APITypes.OnCreateMyCustomTypeSubscription
>;
export const onUpdateMyCustomType = /* GraphQL */ `subscription OnUpdateMyCustomType(
  $id: ID
  $title: String
  $content: String
  $price: Int
  $rating: Float
) {
  onUpdateMyCustomType(
    id: $id
    title: $title
    content: $content
    price: $price
    rating: $rating
  ) {
    id
    title
    content
    price
    rating
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateMyCustomTypeSubscriptionVariables,
  APITypes.OnUpdateMyCustomTypeSubscription
>;
export const onDeleteMyCustomType = /* GraphQL */ `subscription OnDeleteMyCustomType(
  $id: ID
  $title: String
  $content: String
  $price: Int
  $rating: Float
) {
  onDeleteMyCustomType(
    id: $id
    title: $title
    content: $content
    price: $price
    rating: $rating
  ) {
    id
    title
    content
    price
    rating
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteMyCustomTypeSubscriptionVariables,
  APITypes.OnDeleteMyCustomTypeSubscription
>;
