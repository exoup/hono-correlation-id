# correlationId middleware for Hono

This middleware adds a unique (and customizable) correlation id to [Hono](https://github.com/honojs/hono) requests.

## Installation
```plain
npm i hono-correlation-id
```

## Usage

Normal: 

```ts
import { Hono } from 'hono'
import { useCorrelationId } from 'hono-correlation-id'

const app = new Hono()

app.use(useCorrelationId())
app.get('/', (c) => c.json({ id: c.get('x-correlation-id') }))

export default app
```

Custom:

```ts
import { Hono } from 'hono'
import { useCorrelationId } from 'hono-correlation-id'
import { nanoid } from 'nanoid'

const app = new Hono()

app.use(useCorrelationId({
    header: 'x-nano-id',
    generator: () => nanoid(),
    validator: (c) => /[\w_-]{21}/.test(c)
}))

export default app
```

## API

#### `useCorrelationId()` MiddlewareHandler
Returns an instance of MiddlewareHandler for Hono that generates a v4 UUID correlation id and assigns it to the existing Hono Context object.

Retrievable via `c.get('correlationId')` wherever a Hono Context exists.

#### type `correlationIdOptions` Object
Options that let you configure the incoming/outgoing correlation id header, generator, and validator.

##### `header` String: x-correlation-id
Configures the name of the incoming Request header to check for a correlation id.
Configures the name of the outgoing Response header containing a correlation id.

##### `generator` Function: () => string `() => pseudo-v4uuid`
Configures the function to use for generating a correlation id.
Defaults to a v4 UUID from the crypto node package.

##### `validator` Function: (correlationId: string) => boolean `(correlationId: string) => true`
An optional function to validate the incoming correlation id `header`.  
`true` by default.  
If not successfully validated, will generate a correlation id using `generator` function.

## Extra Info

Correlation ids are passed along a typical Hono request via the Context object using the `correlationId` key.  
They can be retrieved in a Hono route via the `Context.get()` method.

This can be useful for things like tracing errors:
```ts
app.onError((err, c) => {
    const correlationId = c.get('correlationId');
    console.error({ err: err, x-correlation-id: correlationId});
	return c.json({
		details: "An internal server error occurred.",
		id: correlationId
	}, 500);
});
```

## Author

- Joseph Y - <https://github.com/exoup>