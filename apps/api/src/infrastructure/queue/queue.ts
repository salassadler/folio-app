import { Queue } from 'bullmq'
import { getRedis } from '../cache/redis.js'

// Queue names as a const enum to avoid typos across the codebase
export const QUEUES = {
  EMAIL: 'email',
  AI_ANALYSIS: 'ai-analysis',
  CRITIQUE_ROUND: 'critique-round',
} as const

type QueueName = (typeof QUEUES)[keyof typeof QUEUES]

const queues = new Map<QueueName, Queue>()

export function getQueue(name: QueueName): Queue {
  if (!queues.has(name)) {
    queues.set(name, new Queue(name, { connection: getRedis() }))
  }
  return queues.get(name)!
}
