---
title: "Stripe Integration"
slug: "react-stripe-subscriptions"
excerpt: ""
hidden: false
createdAt: "Mon Sep 11 2023 09:26:19 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Wed Nov 29 2023 15:37:38 GMT+0000 (Coordinated Universal Time)"
---
# 1. Initialize the Stripe webhook

- You first need a Polyfire project. You can [create one here](https://beta.polyfire.com/project/new).
- Go to _Auth > Payments_ on your Polyfire dashboard.
- Copy the webhook URL for one of the next steps.

# 2. Configure User Rate Limits

- **Free User Rate Limit** :  
  Set a dollar threshold for free app usage under `Free User Rate Limit`.
- **Premium User Rate Limit **:  
  Assign a higher dollar limit for premium users in the `Premium User Rate Limit`.
- **Developer Rate Limit Testing**:  
  To test rate limits, toggle `Dev has rate limit?` to 'On' in development.  
  Adjust or disable this in production.  
  Now save your settings by clicking on the "Save" button.

# 2. Add the webhook on the Stripe dashboard

- Add the generated webhook [here on Stripe](https://dashboard.stripe.com/webhooks) .
- Configure the webhook to be sent on all events (You can also select manually theses events: _customer.created, customer.updated, checkout.session.completed, customer.subscription.created, customer.subscription.updated and customer.subscription.deleted_)

# 3. Create a payment link

- Create a new Stripe payment link [here](https://dashboard.stripe.com/payment-links/create) on your Stripe dashboard.
- In the product field, select Add new product, give it the name, image, description and price you want. Set the payment to Recurring and select Monthly in billing period.
- In the After payment tab, choose Don't show confirmation page and set the address of your app.  
  _NOTE: for localhost, use <http://127.0.0.1>, you will need this address instead of http\://localhost in your tests to stay connected after the payment._
- Create the link and copy it.

# 4. Add the paywall to your app

For this part, I am going to use the chat we made in this tutorial: [Making ChatGPT](doc:chatgpt-clone)

We create a component that will be displayed instead of the chat if this user didn't pay yet. Don't forget to replace `<YOUR_STRIPE_PAYMENT_LINK>` by your payment link.

Polyfire uses the userID as the identifier to know which user paid a subscription, this is why we use the client_reference_id query parameter.

```jsx
function Paywall({ userId }: { userId: string }) {
    return (
    <div className="flex flex-col justify-center items-center h-full py-2">
        <a className="cursor-pointer bg-black text-white ml-2 p-2 px-5 font-mono" href={`<YOUR_STRIPE_PAYMENT_LINK>?client_reference_id=${userId}`}>
            Access this application for only 420.69$/month
        </a>
    </div>
    );
}

```

We can then modify the App component to get the userId and add the paywall when the rate limit has been reached - which should be right away in this case since the rate limit is 0.

```jsx
function App() {
  const polyfire = usePolyfire();

  const { login, status, user } = polyfire.auth;
  const { getAuthID, usage } = user;

  const { Chat } = polyfire.utils;


  const [chat, setChat] = useState<ChatType>();
  const [paywall, setPaywall] = useState(false);
  const [userId, setUserId] = useState<string>();
  const [messages, setMessages] = useState<
    { is_user_message: boolean; content: string }[]
  >([]);

  useEffect(() => {
    if (status === "authenticated") {
      const updateUsage = async () => {
        const userId = await getAuthID();
        setUserId(userId);

        const userUsage = await usage();
        if (userUsage.rateLimit === undefined || userUsage.rateLimit === null) {
          setPaywall(false);
        } else {
          setPaywall(userUsage.rateLimit <= userUsage.usage);
        }

        setChat(new Chat());
      };

      updateUsage();
    }
  }, [status]);

  if (status === "unauthenticated") {
    return (
      <button onClick={() => login({ provider: "github" })}>
        Login with Github
      </button>
    );
  }

  if (chat && !paywall) {
    return (
      <ChatBox
        messages={messages}
        onMessage={async (message: string) => {
          await chat.sendMessage(message);
          setMessages((await chat.getMessages()).reverse());
        }}
      />
    );
  }

  if (paywall && userId && status !== "loading") {
    return <Paywall userId={userId} />;
  }

  return <div>Loading...</div>;
}
```
