import CreateOAuthClientButton from "@/components/oauth/oauth-client/CreateOAuthClientButton";


export default function OAuthClientPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">
        Gift Cart OAuth Client
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        Create the confidential OAuth client used by Gift Cart.
      </p>

      <div className="mt-8">
        <CreateOAuthClientButton />
      </div>
    </main>
  );
}