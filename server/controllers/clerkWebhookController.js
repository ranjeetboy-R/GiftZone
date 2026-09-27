import { verifyWebhook } from '@clerk/express/webhooks';
import User from '../models/User.js';

export async function handleClerkWebhook(req, res) {
  try {
    const event = await verifyWebhook(req);
    const { type, data } = event;

    if (type === 'user.created') {
      try {
        const primaryEmail = data.email_addresses[0]?.email_address || "";

        if (!primaryEmail) {
          return res.status(400).json({
            success: false,
            message: 'User email not found.'
          });
        }

        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            $set: {
              email: primaryEmail.toLowerCase(),
              firstName: data.first_name || '',
              lastName: data.last_name || '',
              imageUrl: data.image_url || '',
              isActive: true,
              deletedAt: null
            },
            $setOnInsert: {
              clerkId: data.id,
              role: 'customer'
            }
          },
          {
            upsert: true,
            returnDocument: 'after',
          }
        );

        return res.status(200).json({
          success: true,
          message: 'User created successfully.'
        });

      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create user.'
        });
      }
    }

    if (type === 'user.updated') {
      try {
        const primaryEmail = data.email_addresses?.find(
          email => email.id === data.primary_email_address_id
        )?.email_address;

        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            $set: {
              ...(primaryEmail && { email: primaryEmail.toLowerCase() }),
              firstName: data.first_name || '',
              lastName: data.last_name || '',
              imageUrl: data.image_url || ''
            }
          },
          { returnDocument: 'after' }
        );

        return res.status(200).json({
          success: true,
          message: 'User updated successfully.'
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update user.'
        });
      }
    }

    if (type === 'user.deleted') {
      try {
        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            $set: {
              isActive: false,
              deletedAt: new Date()
            }
          },
          { returnDocument: 'after' }
        );

        return res.status(200).json({
          success: true,
          message: 'User deactivated successfully.'
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to deactivate user.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Event ignored.'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid webhook.'
    });
  }
}