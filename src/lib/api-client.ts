// ============================================
// src/lib/api-client.ts
/**
 * Cliente HTTP para fazer requisições às APIs
 */

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, config);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(error.error || "Erro na requisição");
  }

  return response.json();
}

// Funções específicas para cada endpoint
export const api = {
  // Depósitos
  deposits: {
    create: (data: {
      userId: string;
      sponsorId: string;
      raffleId: string;
      amount: number;
      proofImage: string;
    }) => apiRequest("/api/deposits", { method: "POST", body: data }),

    getByUser: (userId: string) => apiRequest(`/api/deposits?userId=${userId}`),

    getById: (id: string) => apiRequest(`/api/deposits/${id}`),

    approve: (id: string) =>
      apiRequest(`/api/deposits/${id}/approve`, { method: "PATCH" }),

    reject: (id: string) =>
      apiRequest(`/api/deposits/${id}/reject`, { method: "PATCH" }),
  },

  // Sorteios
  raffles: {
    getActive: () => apiRequest("/api/raffles"),

    getById: (id: string) => apiRequest(`/api/raffles/${id}`),

    getEntries: (raffleId: string, userId: string) =>
      apiRequest(`/api/raffles/${raffleId}/entries?userId=${userId}`),

    draw: (id: string) =>
      apiRequest(`/api/raffles/${id}/draw`, { method: "POST" }),

    create: (data: {
      sponsorId: string;
      title: string;
      description?: string;
      skinName: string;
      skinImage?: string;
      skinValue: number;
      startDate: Date;
      endDate: Date;
    }) => apiRequest("/api/raffles", { method: "POST", body: data }),
  },

  // Patrocinadores
  sponsors: {
    getAll: () => apiRequest("/api/sponsors"),

    getBySlug: (slug: string) => apiRequest(`/api/sponsors/${slug}`),
  },
};
