import Link from "next/link";
import { useState } from "react";
import {
  useViewerQuery,
  useUpdateNameMutation,
  ViewerDocument,
  ViewerQuery,
  ViewerQueryVariables,
} from "../lib/viewer.graphql";
import { initializeApollo } from "../lib/apollo";

const Index = () => {
  const { viewer } = useViewerQuery().data!;
  const [newName, setNewName] = useState("");
  const [updateNameMutation] = useUpdateNameMutation();

  const onChangeName = () => {
    updateNameMutation({
      variables: {
        name: newName,
      },
      //Follow apollo suggestion to update cache
      //https://www.apollographql.com/docs/angular/features/cache-updates/#update
      update: (store, { data }) => {
        // Read the data from our cache for this query.
        const queryData = store.readQuery<ViewerQuery, ViewerQueryVariables>({
          query: ViewerDocument,
        });
        if (!queryData || !data) return;
        const newViewer = { ...queryData.viewer };
        // Add our comment from the mutation to the end.
        newViewer.name = data.updateName.name;
        // Write our data back to the cache.
        store.writeQuery({
          query: ViewerDocument,
          data: { viewer: newViewer },
        });
      },
    });
  };

  return (
    <div>
      You're signed in as {viewer.name} and you're {viewer.status}. Go to the{" "}
      <Link href="/about">
        <a>about</a>
      </Link>{" "}
      page.
      <div>
        <input
          type="text"
          placeholder="your new name..."
          onChange={(e) => setNewName(e.target.value)}
        />
        <input type="button" value="change" onClick={onChangeName} />
      </div>
    </div>
  );
};

export async function getStaticProps() {
  const { schema } = await import("../lib/schema");
  const apolloClient = initializeApollo(undefined, undefined, schema);

  await apolloClient.query({
    query: ViewerDocument,
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}

export default Index;
