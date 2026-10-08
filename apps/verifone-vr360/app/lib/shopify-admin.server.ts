// Small Admin GraphQL helpers used by the settings page.

type AdminGraphql = {
  graphql: (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>;
};

export interface LocationOption {
  id: string;
  name: string;
}

export async function listLocations(admin: AdminGraphql): Promise<LocationOption[]> {
  const response = await admin.graphql(
    `#graphql
      query vr360Locations {
        locations(first: 50, includeInactive: false) {
          nodes { id name }
        }
      }`,
  );
  const json = (await response.json()) as { data?: { locations?: { nodes: LocationOption[] } } };
  return json.data?.locations?.nodes ?? [];
}

/** Distinct payment gateways seen on orders from the last 90 days. */
export async function listRecentGateways(admin: AdminGraphql): Promise<string[]> {
  const since = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const response = await admin.graphql(
    `#graphql
      query vr360RecentGateways($query: String!) {
        orders(first: 100, sortKey: CREATED_AT, reverse: true, query: $query) {
          nodes { paymentGatewayNames }
        }
      }`,
    { variables: { query: `created_at:>=${since}` } },
  );
  const json = (await response.json()) as { data?: { orders?: { nodes: Array<{ paymentGatewayNames: string[] }> } } };
  const names = new Set<string>();
  for (const order of json.data?.orders?.nodes ?? []) {
    for (const name of order.paymentGatewayNames ?? []) {
      if (name) names.add(name.toLowerCase());
    }
  }
  return Array.from(names).sort();
}
