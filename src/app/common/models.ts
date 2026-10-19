export interface Manager {
  id: number;
  display: string;
}

export interface Strategy {
  id: number;
  display: string;
}

// TODO: dopuniti prema Security.cs
export interface Security {
  sid: number;
}

export interface Allocation {
  allocationId: number;
  quantity: number;
  managerId: number;
  strategyId: number;
  orderId: number;
  manager: Manager;
  strategy: Strategy;
}

export interface Order {
  orderId: number;
  quantity: number;          // C# decimal
  tradeDate: string;         // C# DateTime -> ISO string, npr. "2026-10-19T00:00:00"
  managerId: number;
  strategyId: number;
  sid: number;               // C# long
  manager: Manager;
  strategy: Strategy;
  security: Security;
  allocations: Allocation[];
}

export interface CreateOrderRequest {
  quantity: number;
  tradeDate: string;         // šalje se kao "2026-10-19" ili date.toISOString()
  managerId: number;
  strategyId: number;
  sid: number;
}