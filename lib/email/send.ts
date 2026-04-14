import { resend, FROM_EMAIL } from "./client"

// ---------------------------------------------------------------------------
// Customer: Order Confirmation
// ---------------------------------------------------------------------------

export async function sendOrderConfirmation(
  to: string,
  data: {
    orderNumber: number
    restaurantName: string
    items: Array<{ name: string; quantity: number; price: number }>
    total: number
    orderType: string
  }
) {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${item.name} x${item.quantity}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("")

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Order Confirmed #${data.orderNumber}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="background: #16a34a; padding: 32px 40px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Order Confirmed!</h1>
            <p style="color: #dcfce7; margin: 8px 0 0;">Order #${data.orderNumber}</p>
          </div>
          <div style="padding: 32px 40px;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
              Thank you for your order at <strong>${data.restaurantName}</strong>. We've received it and are getting started right away.
            </p>

            <h2 style="color: #111827; font-size: 18px; margin: 0 0 16px;">Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="text-align: left; padding: 8px 0; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Item</th>
                  <th style="text-align: right; padding: 8px 0; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding: 16px 0 0; font-weight: 700; font-size: 18px; color: #111827;">Total</td>
                  <td style="padding: 16px 0 0; font-weight: 700; font-size: 18px; color: #111827; text-align: right;">$${data.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div style="margin: 32px 0; padding: 16px; background: #f3f4f6; border-radius: 6px;">
              <p style="margin: 0; color: #374151; font-size: 14px;">
                <strong>Order Type:</strong> ${data.orderType.charAt(0).toUpperCase() + data.orderType.slice(1)}
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              We'll send you updates as your order progresses. Thank you for choosing ${data.restaurantName}!
            </p>
          </div>
          <div style="padding: 24px 40px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
              You're receiving this email because you placed an order at ${data.restaurantName}.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order Confirmed #${data.orderNumber} — ${data.restaurantName}`,
      html,
    })
    return result
  } catch (error) {
    console.error("[sendOrderConfirmation] Failed to send email:", error)
    return null
  }
}

// ---------------------------------------------------------------------------
// Customer: Order Status Update
// ---------------------------------------------------------------------------

export async function sendOrderStatusUpdate(
  to: string,
  data: {
    orderNumber: number
    restaurantName: string
    status: string
    message: string
  }
) {
  const statusLabel = data.status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Order Update #${data.orderNumber}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="background: #2563eb; padding: 32px 40px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Order Update</h1>
            <p style="color: #dbeafe; margin: 8px 0 0;">Order #${data.orderNumber}</p>
          </div>
          <div style="padding: 32px 40px;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
              Your order at <strong>${data.restaurantName}</strong> has been updated.
            </p>

            <div style="padding: 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin: 0 0 24px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">New Status</p>
              <p style="margin: 0; font-size: 22px; font-weight: 700; color: #1e40af;">${statusLabel}</p>
            </div>

            <p style="color: #374151; font-size: 16px; margin: 0 0 32px;">${data.message}</p>

            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Thank you for your patience. We appreciate your order!
            </p>
          </div>
          <div style="padding: 24px 40px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
              You're receiving this email because you placed an order at ${data.restaurantName}.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order #${data.orderNumber} is now ${statusLabel} — ${data.restaurantName}`,
      html,
    })
    return result
  } catch (error) {
    console.error("[sendOrderStatusUpdate] Failed to send email:", error)
    return null
  }
}

// ---------------------------------------------------------------------------
// Restaurant Owner: New Order Notification
// ---------------------------------------------------------------------------

export async function sendOwnerNewOrder(
  to: string,
  data: {
    orderNumber: number
    items: Array<{ name: string; quantity: number }>
    total: number
    orderType: string
    customerName: string
  }
) {
  const itemList = data.items
    .map((item) => `<li style="padding: 4px 0; color: #374151;">${item.quantity}x ${item.name}</li>`)
    .join("")

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>New Order #${data.orderNumber}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="background: #ea580c; padding: 32px 40px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Order Received!</h1>
            <p style="color: #fed7aa; margin: 8px 0 0;">Order #${data.orderNumber} — Action Required</p>
          </div>
          <div style="padding: 32px 40px;">
            <div style="display: flex; gap: 16px; margin-bottom: 24px;">
              <div style="flex: 1; padding: 16px; background: #fff7ed; border-radius: 6px; border: 1px solid #fed7aa;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #c2410c; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Customer</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">${data.customerName}</p>
              </div>
              <div style="flex: 1; padding: 16px; background: #fff7ed; border-radius: 6px; border: 1px solid #fed7aa;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #c2410c; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Order Type</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">${data.orderType.charAt(0).toUpperCase() + data.orderType.slice(1)}</p>
              </div>
              <div style="flex: 1; padding: 16px; background: #fff7ed; border-radius: 6px; border: 1px solid #fed7aa;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #c2410c; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Total</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">$${data.total.toFixed(2)}</p>
              </div>
            </div>

            <h2 style="color: #111827; font-size: 18px; margin: 0 0 12px;">Items Ordered</h2>
            <ul style="margin: 0 0 24px; padding: 0 0 0 20px;">
              ${itemList}
            </ul>

            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Log in to your admin dashboard to accept or manage this order.
            </p>
          </div>
          <div style="padding: 24px 40px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
              This notification was sent to you as a restaurant owner.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New Order #${data.orderNumber} from ${data.customerName}`,
      html,
    })
    return result
  } catch (error) {
    console.error("[sendOwnerNewOrder] Failed to send email:", error)
    return null
  }
}

// ---------------------------------------------------------------------------
// Restaurant Owner: Order Ready Notification
// ---------------------------------------------------------------------------

export async function sendOwnerNewOrderReady(
  to: string,
  data: {
    orderNumber: number
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Order #${data.orderNumber} is Ready</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="background: #16a34a; padding: 32px 40px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Order Ready for Pickup / Delivery</h1>
            <p style="color: #dcfce7; margin: 8px 0 0;">Order #${data.orderNumber}</p>
          </div>
          <div style="padding: 32px 40px;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
              Order <strong>#${data.orderNumber}</strong> has been marked as ready. Please ensure it's picked up or dispatched for delivery promptly.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Log in to your admin dashboard to view the full order details.
            </p>
          </div>
          <div style="padding: 24px 40px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
              This notification was sent to you as a restaurant owner.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order #${data.orderNumber} is Ready`,
      html,
    })
    return result
  } catch (error) {
    console.error("[sendOwnerNewOrderReady] Failed to send email:", error)
    return null
  }
}
