/**
 * @generated SignedSource<<e5c501db2a5cd31acd03f3eb15c71313>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FeedbackItems$data = {
  readonly feedbacks: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"FeedbackItem">;
      } | null | undefined;
    }>;
    readonly pageInfo: {
      readonly endCursor: string | null | undefined;
      readonly hasNextPage: boolean;
    };
  } | null | undefined;
  readonly " $fragmentType": "FeedbackItems";
};
export type FeedbackItems$key = {
  readonly " $data"?: FeedbackItems$data;
  readonly " $fragmentSpreads": FragmentRefs<"FeedbackItems">;
};

import FeedbackItemsPaginationQuery_graphql from './FeedbackItemsPaginationQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "feedbacks"
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "after"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "first"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "first",
        "cursor": "after",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "first",
          "cursor": "after"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [],
      "operation": FeedbackItemsPaginationQuery_graphql
    }
  },
  "name": "FeedbackItems",
  "selections": [
    {
      "alias": "feedbacks",
      "args": [
        {
          "kind": "Literal",
          "name": "sort",
          "value": {
            "direction": "DESC",
            "field": "id"
          }
        }
      ],
      "concreteType": "FeedbackConnection",
      "kind": "LinkedField",
      "name": "__FeedbackItems_feedbacks_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "FeedbackEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Feedback",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "FeedbackItem"
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__typename",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "cursor",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "PageInfo",
          "kind": "LinkedField",
          "name": "pageInfo",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "endCursor",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "hasNextPage",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "__FeedbackItems_feedbacks_connection(sort:{\"direction\":\"DESC\",\"field\":\"id\"})"
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "c8ff5d38fa4ab327c8b5c5cbde1946cb";

export default node;
