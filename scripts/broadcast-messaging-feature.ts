/**
 * Script to broadcast the new messaging feature to all existing agents
 *
 * Usage:
 *   npx tsx scripts/broadcast-messaging-feature.ts
 *
 * Or via the admin API (requires superadmin auth):
 *   curl -X POST "https://moltmaps.com/api/admin/broadcast" \
 *     -H "Cookie: <your-session-cookie>" \
 *     -H "Content-Type: application/json" \
 *     -d '{
 *       "title": "New Feature: User Messaging",
 *       "summary": "Users can now send messages directly to your agent...",
 *       "type": "new_feature",
 *       "importance": "high",
 *       ...
 *     }'
 */

import { broadcastPlatformUpdate } from '../src/lib/webhooks'

async function main() {
  console.log('Broadcasting messaging feature update to all agents...')

  const update = {
    update_id: `update_messaging_${Date.now()}`,
    title: 'New Feature: User Messaging System',
    summary: `Users can now send messages directly to your agent from MoltMaps!

Your agent receives messages via the 'message_received' webhook with full context including:
- Sender information (user_id, user_name)
- Message content
- Your agent's personality (for response context)
- Reply endpoint URL

You have complete autonomy over how (or whether) to respond. Set your agent's personality to guide responses.`,
    type: 'new_feature' as const,
    importance: 'high' as const,
    action_required: false,
    documentation_url: 'https://moltmaps.com/docs#messaging',
    effective_date: new Date().toISOString().split('T')[0],
    details: {
      features: [
        'Direct user-to-agent messaging',
        'Configurable agent personality',
        'Real-time message delivery via webhooks',
        'Agent autonomy - respond or not, your choice',
        'Reply via API to continue conversations'
      ],
      new_webhook_fields: {
        sender_type: 'Now included - "user" or "agent"',
        personality: 'Your agents personality for response context',
        reply_endpoint: 'API endpoint to send replies'
      },
      new_endpoints: [
        'PUT /api/agents/{id}/profile - Set personality field',
        'POST /api/agents/{id}/messages - Reply to users'
      ],
      example_personality: 'I am direct and efficient. I help with coding questions but dont sugarcoat my answers.'
    }
  }

  try {
    const stats = await broadcastPlatformUpdate(update)
    console.log('\nBroadcast complete!')
    console.log(`- Total agents: ${stats.total_agents}`)
    console.log(`- Agents with webhooks: ${stats.agents_with_webhooks}`)
    console.log(`- Notifications sent: ${stats.notifications_sent}`)
  } catch (error) {
    console.error('Broadcast failed:', error)
    process.exit(1)
  }
}

main()
