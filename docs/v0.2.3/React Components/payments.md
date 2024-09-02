---
title: "Paywall"
slug: "payments"
excerpt: ""
hidden: true
createdAt: "Mon Jan 08 2024 14:44:59 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Mar 01 2024 06:42:00 GMT+0000 (Coordinated Universal Time)"
---
## Description

The Paywall Component Suite is a simple React tool for adding a Stripe paywall to your app. It restricts access for users with no credits and uses Stripe for easy credit top-ups. This makes sure users can always access premium content. The suite is user-friendly and secure, ideal for developers who want to implement a straightforward and reliable paywall using Stripe.

## Components

### 1. `Paywall.Root`

#### Description

`Paywall.Root` is the main component that sets up the paywall and tracks user access status for all its child components.

#### Props

- `children`: React nodes to be rendered within the component.
- `paymentLink`: URL string for the payment gateway.

#### Example Usage

```typescript
<Paywall.Root paymentLink="https://example.com/payment">
  {/* Child components here */}
</Paywall.Root>
```

### 2. `Paywall.Authorized`

#### Description

`Paywall.Authorized` shows content only to users who have access (not behind the paywall).

#### Props

- `children`: React nodes to be rendered if the user is authorized.

#### Example Usage

```typescript
<Paywall.Authorized>
  {/* Content for authorized users */}
</Paywall.Authorized>
```

### 3. `Paywall.NotAuthorized`

#### Description

`Paywall.NotAuthorized` displays content only to users who don't have access (behind the paywall).

#### Props

- `children`: React nodes to be rendered if the user is not authorized.

#### Example Usage

```typescript
<Paywall.NotAuthorized>
  {/* Content for unauthorized users */}
</Paywall.NotAuthorized>
```

### 4. `Paywall.Loading`

#### Description

`Paywall.Loading` shows content while the paywall status is being checked.

#### Props

- `children`: React nodes to be displayed while the paywall status is 'loading'.

#### Example Usage

```typescript
<Paywall.Loading>
  {/* Loading indicator or message */}
</Paywall.Loading>
```

### 5. `Paywall.PaymentLink`

#### Description

`Paywall.PaymentLink` makes a payment link, adding the user's ID to the base URL from `Paywall.Root`.

#### Props

- `children`: React nodes to be displayed inside the hyperlink.
- All standard HTML attributes for an `<a>` element.

#### Example Usage

```typescript
<Paywall.PaymentLink>
  {/* Link content, e.g., "Pay Now" text or an image */}
</Paywall.PaymentLink>
```

## Overall Usage

The components are designed to work together within the `Paywall.Root` component. By nesting `Paywall.Authorized`, `Paywall.NotAuthorized`, and `Paywall.Loading` inside `Paywall.Root`, you can create a dynamic and responsive paywall system in your React application. The `Paywall.PaymentLink` component can be used within any of these components to provide a direct payment option.

### Full Example Implementation

In this comprehensive example, we will demonstrate how to use each component of the Paywall Component Suite together in a React application. The example showcases a scenario where different content is rendered based on the user's paywall status: loading, authorized (no paywall), and not authorized (behind paywall).

#### Code Snippet

```typescript
const LoadingSpinner = () => <div>Loading...</div>;
const PremiumContent = () => <div>Premium Content Accessible</div>;
const AccessDeniedMessage = () => <div>Access Denied. Please subscribe to access premium content.</div>;
const SubscribeButton = () => <Paywall.PaymentLink>Subscribe Now</Paywall.PaymentLink>;

const App = () => {
  return (
    <Paywall.Root paymentLink="https://example.com/payment">
      <Paywall.Loading>
        <LoadingSpinner />
      </Paywall.Loading>
      <Paywall.Authorized>
        <PremiumContent />
      </Paywall.Authorized>
      <Paywall.NotAuthorized>
        <AccessDeniedMessage />
        <SubscribeButton />
      </Paywall.NotAuthorized>
    </Paywall.Root>
  );
};

export default App;
```
