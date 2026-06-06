---
title: "TypeScript tips que aprendí después de 3 años en producción"
description: "Los patrones de TypeScript que realmente impactan en el día a día. Más allá del strict mode: utility types, discriminated unions, y refactors sin miedo."
date: 2025-06-10
author: "René Kuhm"
category: "Desarrollo"
tags: ["typescript", "javascript", "patterns", "best-practices", "frontend"]
readTime: 7
image: "/og-image.png"
seo:
  title: "TypeScript tips reales de producción (no son los típicos)"
  description: "Patrones de TypeScript que aplico en proyectos reales. Discriminated unions, utility types, exhaustive checks y refactors seguros."
---

# TypeScript tips que aprendí después de 3 años en producción

Después de tres años escribiendo TypeScript en producción — refactors grandes, codebases de 200k+ líneas, equipos de 5+ devs — aprendí que los tips de blog típicos (strict mode, no-any, etc.) son la base, pero el salto real viene de patrones que cambian **cómo pensás** el código.

No es sobre tipos. Es sobre **contratos explícitos**.

## 1. Discriminated unions: el superpoder oculto

La mayoría del código que veo usa enums o strings sueltos para modelar estados. Eso es un anti-patrón.

### ❌ Lo que veo siempre

```typescript
type UserStatus = 'active' | 'inactive' | 'pending';

function getUserStatus(user: User) {
  if (user.status === 'active') {
    // do something
    return { canLogin: true, features: user.features };
  }
  // 'inactive' o 'pending' — qué devuelvo acá?
}
```

### ✅ Lo que funciona

```typescript
type User = 
  | { status: 'active'; features: string[]; lastSeen: Date }
  | { status: 'inactive'; deactivatedAt: Date; reason: string }
  | { status: 'pending'; inviteToken: string; expiresAt: Date };

function getLoginInfo(user: User) {
  switch (user.status) {
    case 'active':
      // TypeScript sabe que `user.features` existe
      return { canLogin: true, features: user.features };
    case 'inactive':
      // TypeScript sabe que `user.reason` existe
      return { canLogin: false, reason: user.reason };
    case 'pending':
      // TypeScript sabe que `user.inviteToken` existe
      return { canLogin: false, token: user.inviteToken };
  }
}
```

**Por qué importa:** TypeScript te obliga a manejar **cada caso explícitamente**. Si agregás un nuevo status y olvidás un caso, el compilador te avisa. No más bugs en producción porque "se nos pasó validar ese caso".

> En producción: este patrón solo nos ahorró como 8 bugs en el último año. Vale oro.

## 2. Utility types: el toolkit que ya tenés

TypeScript trae utility types que resuelven el 80% de las transformaciones que hacés a mano.

### Partial, Required, Pick, Omit

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  preferences: { theme: 'light' | 'dark' };
}

// "Partial" para updates
type UserUpdate = Partial<Pick<User, 'name' | 'email' | 'preferences'>>;

// "Pick" para DTOs de respuesta
type PublicUser = Pick<User, 'id' | 'name' | 'avatar'>;

// "Omit" para crear
type NewUser = Omit<User, 'id' | 'createdAt'>;
```

### Record, Readonly, NonNullable

```typescript
// Mapeo de roles a permisos
type Permissions = Record<'admin' | 'user' | 'guest', string[]>;

// "Readonly" para immutability a nivel tipos
type FrozenConfig = Readonly<{
  apiUrl: string;
  retries: number;
}>;

// "NonNullable" después de un filter
const validUsers: NonNullable<User>[] = users.filter(Boolean) as NonNullable<User>[];
```

> Tip: antes de escribir un nuevo type, pensá si `Pick`, `Omit`, `Partial` o `Required` ya lo resuelven.

## 3. Exhaustiveness checks con `never`

Este es el patrón que más uso. Obliga al compilador a verificar que manejaste todos los casos.

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

**Si agregás un nuevo shape (`'hexagon'`) y olvidás un case**, TypeScript marca error: `Type 'string' is not assignable to type 'never'`. El compilador te obliga a manejarlo.

> En CI: este patrón nos agarró 12+ casos no manejados en el último año, antes de que lleguen a producción.

## 4. Type guards: que el código fluya, no pelee

Type guards le dicen a TypeScript "si este check pasa, sabé que el tipo cambió".

```typescript
interface ApiResponse<T> {
  data: T;
  error?: { code: number; message: string };
}

function handleResponse<T>(res: ApiResponse<T>): T {
  if (res.error) {
    // Acá `res.error` existe, está narrowed
    throw new Error(`${res.error.code}: ${res.error.message}`);
  }
  // Acá TypeScript sabe que `res.error` es undefined
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

## 5. Template literal types: tipos dinámicos sin perder safety

```typescript
type Event = 'click' | 'focus' | 'blur';
type Element = 'button' | 'input' | 'select';

type Handler = `on${Capitalize<Event>}`; // 'onClick' | 'onFocus' | 'onBlur'
type ElementEvent = `${Element}:${Event}`; // 'button:click' | 'input:focus' | etc.

const handler: Handler = 'onClick'; // OK
const invalid: Handler = 'onHover'; // ERROR
```

Útil para analytics events, action types de Redux, keys de query params, etc.

## 6. `as const` vs tipos explícitos

```typescript
// ❌ Pierdes literal types
const config = {
  apiUrl: 'https://api.example.com',
  retries: 3,
};

// ✅ TypeScript infiere los literal types exactos
const config = {
  apiUrl: 'https://api.example.com',
  retries: 3,
} as const;

// Ahora `config.retries` es tipo `3`, no `number`
```

`as const` es especialmente útil para arrays:

```typescript
const ROUTES = ['/', '/blog', '/contact'] as const;
type Route = typeof ROUTES[number]; // '/' | '/blog' | '/contact'
```

## 7. El truco del `satisfies` (TS 4.9+)

`as` fuerza un tipo (a veces mintiendo). `satisfies` verifica que el valor matchee el tipo **sin cambiar la inferencia**.

```typescript
type Config = Record<string, string>;

const config = {
  apiUrl: 'https://api.example.com',
  retries: 3, // ⚠️ debería ser string
} satisfies Config;
//      ^^^^^^ Error: Type 'number' is not assignable to type 'string'
```

Mejor que `as Config` porque preserva los tipos literales exactos para autocomplete.

## Bonus: el patrón que más uso en APIs

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

// Y el consumer:
const result = await fetchUser('123');
if (result.ok) {
  // result.data está narrowed a User
  console.log(result.data.name);
} else {
  // result.error está narrowed
  console.error(result.error.message);
}
```

**Cero exceptions en runtime**. Cada branch está type-checked.

## Cierre

TypeScript no es sobre agregar tipos a JavaScript. Es sobre **hacer que el compilador sea tu primer reviewer**. Cuanto más restrictivo seas en los tipos, más bugs atrapás antes de que lleguen a producción.

Estos patrones me cambiaron cómo pienso el código. No son teoría — son cosas que aplico todos los días en proyectos reales.

Si querés que profundice en alguno (discriminated unions, template literal types, type-level programming), dejámelo en los comentarios.

---

*René Kuhm · Senior Fullstack Engineer · TecnoDespegue*
