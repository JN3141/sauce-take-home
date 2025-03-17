/**
 * @generated SignedSource<<ce459ef7be26a7f6eeb722ccdfe4061d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FeedbackItem$data = {
  readonly highlights: ReadonlyArray<{
    readonly id: string;
    readonly quote: string;
    readonly summary: string;
  }> | null | undefined;
  readonly id: string;
  readonly text: string;
  readonly " $fragmentType": "FeedbackItem";
};
export type FeedbackItem$key = {
  readonly " $data"?: FeedbackItem$data;
  readonly " $fragmentSpreads": FragmentRefs<"FeedbackItem">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FeedbackItem",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "text",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Highlight",
      "kind": "LinkedField",
      "name": "highlights",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "quote",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "summary",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};
})();

(node as any).hash = "60f14a9e31a0fa6299336f2e2b4ab98c";

export default node;
