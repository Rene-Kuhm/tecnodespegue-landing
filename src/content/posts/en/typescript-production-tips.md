---
title: "TypeScript tips I learned after 3 years in production"
description: "The TypeScript patterns that actually impact day-to-day work. Beyond strict mode: utility types, discriminated unions, and fearless refactors."
date: 2025-06-10
author: "René Kuhm"
category: "Development"
tags: ["typescript", "javascript", "patterns", "best-practices", "frontend"]
readTime: 7
image: "/og-image-en.png"
locale: en
seo:
  title: "Real production TypeScript tips (not the usual ones)"
  description: "TypeScript patterns I apply in real projects. Discriminated unions, utility types, exhaustive checks, and safe refactors."
---

# TypeScript tips I learned after 3 years in production

After three years writing TypeScript in production — big refactors, 200k+ line codebases, teams of 5+ devs — I learned that the typical blog tips (strict mode, no-any, etc.) are the foundation, but the real jump comes from patterns that change **how you think** about code.

It's not about types. It's about **explicit contracts**.

## 1. Discriminated unions: the hidden superpower

Most code I see uses enums or loose strings to model state. That's an anti-pattern.

### ❌ What I always see

```typescript
type UserStatus = 'active' | 'inactive' | 'pending';

function getUserStatus(user: User) {
  if (user.status === 'active') {
    // do something
    return { canLogin: true, features: user.features };
  }
  // 'inactive' or 'pending' — what do I return here?
}
```

### ✅ What works

```typescript
type User = 
  | { status: 'active'; features: string[]; lastSeen: Date }
  | { status: 'inactive'; deactivatedAt: Date; reason: string }
  | { status: 'pending'; inviteToken: string; expiresAt: Date };

function getLoginInfo(user: User) {
  switch (user.status) {
    case 'active':
      // TypeScript knows `user.features` exists
      return { canLogin: true, features: user.features };
    case 'inactive':
      // TypeScript knows `user.reason` exists
      return { canLogin: false, reason: user.reason };
    case 'pending':
      // TypeScript knows `user.inviteToken` exists
      return { canLogin: false, token: user.inviteToken };
  }
}
```

**Why it matters:** TypeScript forces you to handle **every case explicitly**. If you add a new status and forget a case, the compiler warns you. No more bugs in production because "we forgot to validate that case."

> In production: this pattern alone saved us about 8 bugs in the last year. Worth its weight in gold.

## 2. Utility types: the toolkit you already have

TypeScript ships with utility types that solve 80% of the transformations you do by hand.

### Partial, Required, Pick, Omit

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  preferences: { theme: 'light' | 'dark' };
}

// "Partial" for updates
type UserUpdate = Partial<Pick<User, 'name' | 'email' | 'preferences'>>;

// "Pick" for response DTOs
type PublicUser = Pick<User, 'id' | 'name' | 'avatar'>;

// "Omit" for creation
type NewUser = Omit<User, 'id' | 'createdAt'>;
```

### Record, Readonly, NonNullable

```typescript
// Map roles to permissions
type Permissions = Record<'admin' | 'user' | 'guest', string[]>;

// "Readonly" for type-level immutability
type FrozenConfig = Readonly<{
  apiUrl: string;
  retries: number;
}>;

// "NonNullable" after a filter
const validUsers: NonNullable<User>[] = users.filter(Boolean) as NonNullable<User>[];
```

> Tip: before writing a new type, think if `Pick`, `Omit`, `Partial`, or `Required` already solve it.

## 3. Exhaustiveness checks with `never`

This is the pattern I use the most. It forces the compiler to verify you handled all cases.

```typescript
type Shape = 'circle' | 'square' | 'triangle';

function area(shape: Shape): number {
  switch (shape) {
    case 'circle': return Math.PI;
    case 'square': return 1;
    case 'triangle': return 0.5;
    default:
      const _exhaustive: never = shape;
      throw new Error(`Unhandled shape: ${_exhaustive}`);
  }
}
```

**If you add a new shape (`'hexagon'`) and forget a case**, TypeScript flags an error: `Type 'string' is not assignable to type 'never'`. The compiler forces you to handle it.

> In CI: this pattern caught 12+ unhandled cases in the last year, before they reached production.

## 4. Type guards: let the code flow, not fight

Type guards tell TypeScript "if this check passes, know that the type changed."

```typescript
interface ApiResponse<T> {
  data: T;
  error?: { code: number; message: string };
}

function handleResponse<T>(res: ApiResponse<T>): T {
  if (res.error) {
    // Here `res.error` exists, it's narrowed
    throw new Error(`${res.error.code}: ${res.error.message}`);
  }
  // Here TypeScript knows `res.error` is undefined
  return res.data;
}
```

### Custom type guards

```typescript
interface Dog { bark(): void; }
interface Cat { meow(): void; }

function isDog(pet: Dog | Cat): pet is Dog {
  return (pet as Dog).bark !== undefined;
}

function interact(pet: Dog | Cat) {
  if (isDog(pet)) {
    pet.bark(); // OK
  } else {
    pet.meow(); // OK
  }
}
```

## 5. Template literal types: dynamic types without losing safety

```typescript
type Event = 'click' | 'focus' | 'blur';
type Element = 'button' | 'input' | 'select';

type Handler = `on${Capitalize<Event>}`; // 'onClick' | 'onFocus' | 'onBlur'
type ElementEvent = `${Element}:${Event}`; // 'button:click' | 'input:focus' | etc.

const handler: Handler = 'onClick'; // OK
const invalid: Handler = 'onHover'; // ERROR
```

Useful for analytics events, Redux action types, query param keys, etc.

## 6. `as const` vs explicit types

```typescript
// ❌ You lose literal types
const config = {
  apiUrl: 'https://api.example.com',
  retries: 3,
};

// ✅ TypeScript infers the exact literal types
const config = {
  apiUrl: 'https://api.example.com',
  retries: 3,
} as const;

// Now `config.retries` is type `3`, not `number`
```

`as const` is especially useful for arrays:

```typescript
const ROUTES = ['/', '/blog', '/contact'] as const;
type Route = typeof ROUTES[number]; // '/' | '/blog' | '/contact'
```

## 7. The `satisfies` trick (TS 4.9+)

`as` forces a type (sometimes lying). `satisfies` verifies the value matches the type **without changing inference**.

```typescript
type Config = Record<string, string>;

const config = {
  apiUrl: 'https://api.example.com',
  retries: 3, // ⚠️ should be string
} satisfies Config;
//      ^^^^^^ Error: Type 'number' is not assignable to type 'string'
```

Better than `as Config` because it preserves the exact literal types for autocomplete.

## Bonus: the pattern I use most in APIs

```typescript
type ApiResult<T> = 
  | { ok: true; data: T }
  | { ok: false; error: { code: number; message: string } };

async function fetchUser(id: string): Promise<ApiResult<User>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) {
      return { ok: false, error: { code: res.status, message: res.statusText } };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: { code: 0, message: String(e) } };
  }
}

// And the consumer:
const result = await fetchUser('123');
if (result.ok) {
  // result.data is narrowed to User
  console.log(result.data.name);
} else {
  // result.error is narrowed
  console.error(result.error.message);
}
```

**Zero exceptions at runtime**. Every branch is type-checked.

## Closing

TypeScript isn't about adding types to JavaScript. It's about **making the compiler your first reviewer**. The more restrictive you are with types, the more bugs you catch before they reach production.

These patterns changed how I think about code. They're not theory — they're things I apply every day in real projects.

If you want me to dive deeper into any of them (discriminated unions, template literal types, type-level programming), let me know in the comments.

---

*René Kuhm · Senior Fullstack Engineer · TecnoDespegue*